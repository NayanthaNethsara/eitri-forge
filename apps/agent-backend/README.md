# Agent backend

The backend contains the FastAPI health service, a LangGraph agent, and internal inventory tools. Install Python 3.12 and uv, then run `make install-python` from the repository root to sync dependencies from `uv.lock`.

```text
app/
  main.py           FastAPI app and database lifespan
  api/
    schemas.py      Chat request and response models
    routes/          Chat, health, and readiness handlers
  core/
    config.py       Validated settings loaded from the root environment
    database.py     PostgreSQL async connection pool
    logging.py      Application logger configuration and get_logger
  inventory/
    models.py       Validated parts, queries, and results
    repository.py   Shop-scoped JSON repository
    tools.py        Internal inventory tools
    data/catalog.json  Demo hardware catalog
  orchestrator/
    service.py      Agent composition for chat requests
    graph.py        LangGraph wiring
    state.py        Agent state and typed node updates
    prompts.py      Central system prompt used by the model node
    result.py       AssistantResponse, AgentResult, and validated product extraction
    cli.py          Agent CLI
    nodes/          Model, inventory execution, and final answer
    llm/            LLM adapter and Gemini implementation
```

## LangGraph agent

The graph starts at `model`, loops through `inventory` when tools are requested, and always ends through `final_answer → END`. The model receives typed tool definitions and decides whether to request inventory or answer directly. Tool results return to the model in messages with matching call IDs. Invalid tool arguments become error messages the model can correct. At most three tool rounds execute per invocation; repeated requests terminate with a clear limit message.

The final answer node constructs `AgentResult(response=AssistantResponse(reply, products), error)`. It validates a nonempty answer, gathers products from validated tool results, and omits products on terminal failures. It makes no additional model call. `run_chat` returns this result directly; the API returns its `response` on success or a 503 with `detail` on failure. The CLI prints `response.reply` and uses `error` for its exit status. The public chat payload stays `{ "reply": "...", "products": [] }`.

`create_agent(llm, tools)` receives an `LLMAdapter` and the shop's internal tools. Nodes do not select model providers, read credentials, or choose shops. To supply another model, implement `LLMAdapter.generate(messages, tools)` and return an `AIMessage` including any tool calls. Translate provider failures into `LLMError`.

The Gemini adapter uses `ChatGoogleGenerativeAI` with the Gemini Developer API by default. Set `EITRI_LLM_PROVIDER=vertex` to use Vertex AI with Application Default Credentials. The model is configured through the root environment.

From the repository root:

```sh
make install-python
make env
```

Set these values in the repository root `.env`:

| Variable | Value |
| --- | --- |
| `EITRI_LLM_PROVIDER` | `gemini` (default) or `vertex` |
| `GOOGLE_API_KEY` | Gemini Developer API key; required for `gemini` |
| `GOOGLE_CLOUD_PROJECT` | Google Cloud project; required for `vertex` |
| `GOOGLE_CLOUD_LOCATION` | Vertex AI location; defaults to `global` |
| `EITRI_LLM_MODEL` | Gemini model ID; the example uses `gemini-3.5-flash-lite` |
| `LOG_LEVEL` | `DEBUG`, `INFO`, `WARNING`, `ERROR`, or `CRITICAL`; defaults to `INFO` |

For Vertex AI, use Google Application Default Credentials with permission to invoke the model. Deployments can use workload identity or `GOOGLE_APPLICATION_CREDENTIALS` pointing to a credential file outside this repository.

```sh
apps/agent-backend/.venv/bin/eitri-agent "Find an AM5 CPU under 200 USD and check its stock."
```

The repository root `.env` is loaded automatically, even when running from the backend directory. Exported environment variables take precedence; `--env-file` can select another file. Each invocation starts a fresh conversation against the demo shop. The CLI prints the final reply and returns a nonzero exit status for terminal failures. There is no persistent conversation store yet.

For in-process use inside an async function:

```python
from langchain_core.messages import HumanMessage

from app.core.config import GeminiSettings
from app.inventory.repository import InventoryRepository
from app.inventory.tools import create_inventory_tools
from app.orchestrator.graph import create_agent
from app.orchestrator.llm.gemini import GeminiAdapter

tools = create_inventory_tools(InventoryRepository.from_bundled_catalog())
llm = GeminiAdapter(GeminiSettings())
agent = create_agent(llm, tools)
result = await agent.ainvoke({"messages": [HumanMessage(content="Find DDR5 RAM.")]})
print(result["result"].response.reply)
```

## Internal tools

`create_inventory_tools(repository)` returns three asynchronous LangChain tools. They run directly in the agent process and each receives a validated `query` object. Tool schemas and descriptions are passed to the model automatically.

Search with `query_components`:

```json
{"query": {"category": "cpu", "socket": "AM5", "memory_type": "DDR5", "max_price_minor": 19900}}
```

Categories are `cpu`, `motherboard`, `ram`, `gpu`, `psu`, `cooler`, and `case`. All supplied filters must match. Price ceilings and minimum specs are inclusive. `in_stock_only` defaults to true. Results sort by price then SKU; `total` counts matches before `limit`. Empty searches return `components=[]`. Unsupported filters, unknown fields, and coerced numeric strings are rejected.

Use an exact returned SKU with `get_component` or `check_stock`:

```json
{"query": {"sku": "CPU-AM5-6C"}}
```

Details return `component=null` for unknown SKUs. Stock returns `quantity=null` for unknown SKUs and `quantity=0` for known but unavailable parts. `checked_at` is the lookup time in UTC. Every call reaches the repository, and stock checks do not reserve inventory.

## Provider boundary and sample data

`InventoryRepository` implements asynchronous search, detail, and stock operations against the bundled JSON catalog using Pydantic queries and results. The model cannot select a tenant through tool arguments. When a live shop integration is needed, this repository can be changed to query a database, HTTP API, or local bridge without changing the tool names or graph. Tenant authentication belongs in the hosting application.

The bundled JSON has 14 fictional products with realistic specification ranges, illustrative USD prices, AM4/DDR4 and AM5/DDR5 build paths, and an unavailable GPU. It loads once per JSON repository instance. Prices are integer minor currency units; one catalog uses one currency. Models reject extra fields, negative quantities, malformed specs, and duplicate SKUs. Catalog objects are immutable.

The catalog includes sockets, DDR generations, RAM capacity and module counts, CPU TDP and maximum power, GPU power and length, PSU output, and cooler/case clearances. Cooler wattage ratings are illustrative. Matching these fields does not prove BIOS, memory QVL, connector, or complete build compatibility. Model answers are not compatibility certifications.

## Running the service

`make dev-agent` runs the FastAPI service with `/health`, `/ready`, and `/chat` endpoints on port 8000. The web app calls `/chat` through its own `/api/chat` route. Each request accepts up to 20 user and assistant messages and uses the bundled sample inventory.

## PostgreSQL and containers

Run `make db-up` at the repository root to start PostgreSQL for local development, or `make compose-up` to build and start PostgreSQL and the Python backend. The Python image installs pinned dependencies and the backend package in a build stage, then copies its virtual environment into a slim runtime running as a non-root user.

FastAPI opens its PostgreSQL pool during application lifespan and closes it on shutdown. `/health` checks the process; `/ready` runs `SELECT 1` and returns 503 if the database is unavailable. Database settings come from the root `.env`. Compose overrides the database hostname to `postgres`; local processes use `localhost`. The pool is bounded to five connections and uses connection and statement timeouts.

PostgreSQL is reserved for Eitri application data. Inventory remains behind the live provider boundary. No business tables are introduced yet. Refer to the [root setup guide](../../README.md) for environment, port, and container commands.

After changing Python dependencies in `pyproject.toml`, run `make lock-python`, then `make install-python`. Both local and container installs use `uv.lock`.

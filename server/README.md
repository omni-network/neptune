# Neptune Server

## quickstart
- **install:** `git submodule init` and `git submodule update`
 - **build:** `cargo build`
 - **run:** `./target/debug/neptune`

## routes

### GET

```
# GET list of forks

GET /forks

Reponse:

{
  forks: {
    <fork_id>: {
      id: <fork_id>,
      name: <fork_name>,
      config: {
        ...
      }
    }
  }
}
```

## POST
#### /forks
Create a new fork
Body:

{
   name: "My New Fork",
   config: {
      eth_rpc_url: "https://mainnedt.infura.io/v3/sadfsadfasdf",
   }
}


Response:
```json
{
   "fork_id": "<string>",
}
```

config (base fork):
```json
{
  "eth_rpc_url": "string?",
  "fork_block_number": number?,
  "prefund_anvil_accounts": bool
}
```

config (child fork):
```json
{
  "parent_fork_id": "string"
  "fork_block_number": number?,
  "prefund_anvil_accounts": bool
}
```


# Make an RPC request to fork with id {fork_id}
## POST /forks/{fork_id}
An eth or neptune rpc request
```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "eth_blockNumber",
  "params": []
}
```

### Response:
```json
// An eth rpc response
{
   "id": 1,
   "result": "0xasedfasdf"
}
```


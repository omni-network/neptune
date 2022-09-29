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

### POST

```

# Create a new fork

POST /fork

Body:

{
   name: "My New Fork",
   config: {
      eth_rpc_url: "https://mainnedt.infura.io/v3/sadfsadfasdf",
   }
}


Response:

{
   fork_id: <new_fork_id>,
}

```

```
# Make an RPC request to fork with id <fork_id>


POST /fork/{fork_id}`

Body:

# An eth or neptune rpc request

{
  id: 1,
  jsonrpc: "2.0",
  method: "eth_blockNumber",
  params: []
}

Responst:

# An eth rpc response

{
   id: 1,
   result: "0xasedfasdf"
}


```

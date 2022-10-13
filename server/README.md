# **_Neptune Server_**

## **Quickstart**

- **first-time setup:** `make setup`
- **build:** `make build`
- **run:** `./build/neptune-<version>-<architecture/os>`

## **Routes**

### _`/forks`_

#### **_GET_**

Get a list of all forks.

#### **Reponse**:

```jsonc
{
  "forks": {
    "<fork_id>": {
      "id": "<fork_id>",
      "name": "<fork_name>",
      "config": {
        ...
      }
    }
  }
}
```

#### **_POST_**

Create a new fork

#### **Request Body**:

```jsonc
{
  "name": "the-fork-name",
  "config": {} // see ForkConfig object
}
```

#### **Response**:

```jsonc
{
  "fork_id": "<string>"
}
```

#### **_ForkConfig_ object**

Neptune allows creating blank forks and forks of mainnet - _base forks_, and forks of forks - _child forks_. These are configured using the following variants of the **_ForkConfig_** object:

### **_BaseConfig_**:

```jsonc
{
  "eth_rpc_url": "string, optional", // optionally specify a mainnet RPC provider
  "fork_block_number": number, optional, // defaults to the current block number
  "prefund_anvil_accounts": bool // generate a list of pre-funded accounts using anvil's default seed phrase
}
```

### **_ChildConfig_**:

```jsonc
{
  "parent_fork_id": "string" // the ID of the parent fork (must be a valid uuid string)
  "fork_block_number": number?, // defaults to the current block number
  "prefund_anvil_accounts": bool // generate a list of pre-funded accounts using anvil's default seed phrase
}
```

### _`/forks/{fork_id}`_

#### **_POST_**

Send an eth or anvil rpc request

#### **Request:**

```jsonc
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "eth_blockNumber",
  "params": [...]
}
```

#### **Response:**

```jsonc
{
  "id": 1,
  "result": "0xasedfasdf"
}
```

#### **_DELETE_**

Delete a fork - fails if a fork is referenced by another fork.

#### **_GET_**

Returns a serialized version of the fork if it exists.

### _`/reset`_

#### **_DELETE_**

clears all forks from memory

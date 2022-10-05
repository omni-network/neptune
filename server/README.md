# Neptune Server

## quickstart

- **install:** `git submodule init` and `git submodule update`
- **build:** `cargo build`
- **run:** `./target/debug/neptune`

## **Routes**

### _`/forks`_

#### **_GET_**

Get a list of all forks.

#### **Reponse**:

```json
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

```json
{
   "name": "the-fork-name",
   "config": {<see ForkConfig object>}
}
```

#### **Response**:

```json
{
  "fork_id": "<string>"
}
```

## **_ForkConfig_ object**

Neptune allows creating blank forks and forks of mainnet - _base forks_, and forks of forks - _child forks_. These are configured using the following variants of the **_ForkConfig_** object:

### **_BaseConfig_**:

```json
{
  "eth_rpc_url": "string, optional", // optionally specify a mainnet RPC provider
  "fork_block_number": number, optional, // defaults to the current block number
  "prefund_anvil_accounts": bool // generate a list of pre-funded accounts using anvil's default seed phrase
}
```

### **_ChildConfig_**:

```json
{
  "parent_fork_id": "string" // the ID of the parent fork (must be a valid uuid string)
  "fork_block_number": number?, // defaults to the current block number
  "prefund_anvil_accounts": bool // generate a list of pre-funded accounts using anvil's default seed phrase
}
```


### _`/forks/{fork_id}`_


#### __*POST*__

Send an eth or neptune rpc request

#### **Request:**
```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "eth_blockNumber",
  "params": [...]
}
```

#### **Response:**

```json
{
  "id": 1,
  "result": "0xasedfasdf"
}
```
#### __*DELETE*__
Delete a fork - fails if a fork is referenced by another fork.
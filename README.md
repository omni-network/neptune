<image align="left" src="./media/neptune-logo.svg" style="width: 100px; height: 100px;" />

# ｎｅｐｔｕｎｅ

<br />
<br />

God of the sea, master of the trident (forks)

Neptune is a browser wallet for developers. It consists of a browser extension
and a local backend, with which you can manage state across multiple dev
environments, impersonate other addresses, test frontend features, and do
anything that you’d do with mainnet but in a simulated environment.

The current version is not considered stable.

## Table of Contents

- [ｎｅｐｔｕｎｅ](#ｎｅｐｔｕｎｅ)
  - [Table of Contents](#table-of-contents)
  - [Install](#install)
  - [Usage](#usage)
    - [Notes](#notes)
  - [Contributing](#contributing)
  - [License](#license)
  - [Acknowledgements](#acknowledgements)



## Install

Currently, the extension and backend must both be built from source. We’re working
to create a first stable release soon. Start by cloning this repo.

Build the extension. You can input your RPC URL as an environment variable now (`PROVIDER_RPC_URL`),
or via the browser extension later.

```
cd extension

PROVIDER_RPC_URL=<your-rpc-url> pnpm build
# or
yarn build
# or
npm run build
```

Then,

- [Install on Chrome](./extension/docs/install-on-chrome.md)
- [Install on Firefox](./extension/docs/install-on-firefox.md)

Then [run the backend](./server/README.md):
```
cd server
make setup # only for first-time setup
make build
./build/neptune-<version>-<arch/os> # name will depend on your machine
```

## Usage

Once installed, you can interact with Neptune via the browser extension.

Current features include:
- Fork directly from mainnet to gain access to a local fork for development
- Run transactions against your local forks via the Neptune browser extension
- Impersonate any other address, and run transactions on forks as these wallets
- Rewind, replay, and reset the state of your forks
- Use most dapps with Neptune to simulate actions on their frontends - without
  modifying their frontend
- Create a new fork from an already existing fork to create multiple local
  environments with different configurations
- Seamless interop with metamask - simply connect and disconnect when you want
  to use one or the other

Try out various dapps, try acting as vitalik, run multiple forks with different
configurations, run txns forward and backwards, and more! Let us know how it's
working for you, and if there are any features you'd like to see in a future
version.

### Notes

Note that the server currently runs entirely in memory - if you kill the server,
you will lose access to the states of your forks, and need to reset. We're
exploring options for persistent storage.

You can run forked environments on many dapps (try making a swap on Uniswap with
your neptune Wallet - you can run it as a simulation). But there are some dapps
where it won't work. We do our best to intercept any reads to the chain and
redirect them to a fork, but if a dapp uses data sources besides the RPC URL,
we can't intercept that (we don't have the infra to spin up a new subgraph for
every new fork, but sounds like a fun, challenging project).

## Contributing

We welcome contributions from everyone. If you have questions, feel free to head
over to the [discussions](https://github.com/recursive-research/neptune/discussions)
forum to chat or introduce ideas for features.

## License

GNU General Public License V3, see [LICENSE](./LICENSE).

## Acknowledgements

The server is based on [foundry’s anvil](https://github.com/foundry-rs/foundry),
extended with some Neptune specific functionality. The extension is based on
[ArgentX](https://github.com/argentlabs/argent-x). Huge thanks to the contributors
from both of these teams - this wouldn't have been possible without you.

# ｎｅｐｔｕｎｅ

<image src="./media/trident1.png"/>

God of the sea, master of the trident (forks)

Neptune is a browser wallet for developers. It consists of a browser extension
and a local backend, with which you can manage state across multiple dev
environments, impersonate other addresses, test frontend features, and do
anything that you’d do with mainnet but in a simulated environment. 

The current version is not considered stable.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)


Current features include:
- Fork directly from mainnet to gain access to a local fork for development
- Run transactions against your local forks via the Neptune browser extension
- Impersonate any other address, and run transactions on forks as these wallets
- Rewind, fast forward, reset the state of your forks
- Use most dapps with Neptune to simulate actions on their frontends - without
  changing anything about their frontend
- Create a new fork from a already existing fork to create multiple local
  environments with different configurations
- Seamless interop with metamask - simply connect and disconnect when you want
  to use one or the other

## Install 

Currently, the extension and backend must both be built from source. We’re working
to create a first stable release soon. Start by cloning this repo.

You can input your RPC URL as an environment variable now (`PROVIDER_RPC_URL`),
or via the browser extension later.

To build the browser extension:
```
cd extension
yarn install
yarn build
```

Then go to your browser's extension settings, turn on developer mode, and select
"Load unpacked". Find the `dist` subdirectory within neptune, and select it. Now
you should be able to see Neptune as a browser extension.

Then run the backend:
```
cd server
git submodule init
git submodule update
cargo run
```

## Usage

You should now be able to create forks and run wild. Try out various dapps, try
acting as vitalik, run multiple forks with different configurations, run txns
forward and backwards, and more! Let us know how it's working for you, and if
there are any features you'd like to see in a future version.

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

<image src="./media/trident1.png"/>

# ｎｅｐｔｕｎｅ

### God of the sea, master of the trident (forks)

Neptune is a browser wallet for developers. It consists of a browser extension
and a local backend, with which you can manage state across multiple dev
environments, impersonate other addresses, test frontend features, and do
anything that you’d do with mainnet but in a simulated environment. Current
features include:

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

### Installation 

Currently, the extension and backend must both be built locally. We’re working
to create our first stable release soon, but it’s still experimental. 

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

You should now be able to fork mainnet. You can input your mainnet RPC URL as an
environment variable, or in the browser extension directly.

### Notes

Note that the server currently runs entirely in memory - if you kill the server,
you will lose access to the states of your forks, and need to reset. We're
exploring options for persistent storage.

### Acknowledgements

The server is based on [foundry’s anvil](https://github.com/foundry-rs/foundry),
extended with some Neptune specific functionality. The extension is based on
[ArgentX](https://github.com/argentlabs/argent-x). Huge thanks to the contributors
from both of these teams - this wouldn't have been possible without you.

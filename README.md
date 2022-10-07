<image src="./media/trident1.png"/>

# ｎｅｐｔｕｎｅ

## God of the sea, master of the trident (forks)

Neptune is a browser wallet for developers. It consists of a browser extension
and a local backend, with which you can manage state across multiple dev
environments, impersonate other addresses, test frontend features, and do
anything that you’d do with mainnet but in a simulated environment. Currently,
the extension and backend must both be built locally. We’re working to create
our first stable release soon, but it’s still experimental. Current features
include:

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

Note that the server currently runs entirely in memory - if you kill the server,
you will lose access to the states of your forks, and need to reset. We're
exploring options for persistent storage.

The server is based on [foundry’s anvil](https://github.com/foundry-rs/foundry),
extended with some Neptune specific functionality. The extension is based on
[ArgentX](https://github.com/argentlabs/argent-x). Thank you to everyone who
contributed code to these projects and made this possible!

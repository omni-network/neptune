# Neptune Browser Extension

A browser extension that lets you make dApps talk to your Neptune forks, rather than some other wallet / node provider.

## Install

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

## License

GNU General Public License V3, see [LICENSE](../LICENSE).

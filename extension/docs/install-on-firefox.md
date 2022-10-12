# Install on Firfox


1. Build the extension.

  ```
  pnpm build

  # or

  yarn build

  # or

  npm run build
  ```

2. Go to `about:addons`
3. Click the settings icon next to "Manage your Extensions"
4. Click "Debug Add-on"
5. Click "Load Temporary Add-on..."
6. Select the `manifest.json` file in the build directory from the build step (`<neptune_root>/extension/dist/manifest.json`)
7. Have fun forking!

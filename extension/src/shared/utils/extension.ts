/**
 * Get extension id from browser runtime, if available.
 * Else pull from script element injected by content.ts
 */
export const getExtensionId = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const browser = require('webextension-polyfill')
    return browser.runtime.id
  } catch {
    return document
      ?.getElementById('neptune-extension')
      ?.getAttribute('data-extension-id')
  }
}

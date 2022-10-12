import { useState } from 'react'
import { FormControl, TextField, Button } from '@mui/material'
import { useProviderRpcUrl } from 'ui/queries'
import { useSetProviderRpcUrl } from 'ui/mutations'
import { ErrorMessage } from 'ui/components/messages'

const ProviderRpcUrlInput = () => {
  const { data: providerRpcUrl } = useProviderRpcUrl()
  const { mutate: setProviderRpcUrl, error } = useSetProviderRpcUrl()

  const [url, setUrl] = useState<string | null>(providerRpcUrl ?? null)

  return (
    <FormControl>
      <TextField
        label="Provider RPC URL"
        key={providerRpcUrl}
        value={url ?? providerRpcUrl}
        onChange={e => setUrl(e.target.value)}
        variant="outlined"
      />
      <Button onClick={() => url && setProviderRpcUrl(url)}>
        Set Provider RPC URL
      </Button>
      {error ? <ErrorMessage error={error} /> : null}
    </FormControl>
  )
}

export default ProviderRpcUrlInput

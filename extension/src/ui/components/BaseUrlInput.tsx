import { useState } from 'react'
import { FormControl, TextField, Button } from '@mui/material'
import { useBaseUrl } from 'ui/queries'
import { useSetBaseUrl } from 'ui/mutations'

const BaseUrlInput = () => {
  const { data: baseUrl } = useBaseUrl()
  const { mutate: setBaseUrl, error } = useSetBaseUrl()

  const [url, setUrl] = useState<string | null>(baseUrl ?? null)

  return (
    <FormControl
      sx={{ width: '100%', fontSize: '0.75em', marginBottom: '1rem' }}
    >
      <TextField
        label="Base URL"
        key={baseUrl}
        value={url ?? baseUrl}
        onChange={e => setUrl(e.target.value)}
        variant="outlined"
      />
      <Button onClick={() => url && setBaseUrl(url)}>Set Base URL</Button>
      {error ? <span style={{ color: 'red' }}>{error.toString()}</span> : null}
    </FormControl>
  )
}

export default BaseUrlInput

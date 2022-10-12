import { useState } from 'react'
import { Input, FormControl } from '@mui/material'
import { Fork } from 'shared/types'
import { LoadingButton as Button } from '@mui/lab'
import { formatLongString } from 'ui/utils/format'
import { useCreateFork } from 'ui/mutations'
import { ErrorMessage } from 'ui/components/messages'
import AvailableForksSelect from './AvailableForksSelect'

const AddFork = () => {
  const [name, setName] = useState('')
  const [from, setFrom] = useState<Fork | null>(null)
  const {
    mutate: createFork,
    isLoading,
    error,
  } = useCreateFork({
    onSuccess: () => {
      setFrom(null)
      setName('')
    },
  })

  return (
    <FormControl>
      <h3>Create Fork</h3>
      <Input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Fork Name"
        sx={{ margin: '1rem 0' }}
      />
      <AvailableForksSelect
        value={from}
        onSelect={setFrom}
        label="Fork From"
        labelId="fork-from"
        allowNone
      />
      <Button
        disabled={!name}
        loading={isLoading}
        onClick={() => createFork({ name, from })}
      >
        {from ? `Fork from ${formatLongString(from.id)}` : 'Blank Fork'}
      </Button>
      {error ? <ErrorMessage error={error} /> : null}
    </FormControl>
  )
}

export default AddFork

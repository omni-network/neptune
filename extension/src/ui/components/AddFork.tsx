import { useState } from 'react'
import { Input, Tooltip } from '@mui/material'
import { Fork } from 'shared/types'
import { MdError } from 'react-icons/md'
import { LoadingButton as Button } from '@mui/lab'
import { formatLongString } from 'ui/utils/format'
import { useCreateFork } from 'ui/mutations'
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
    <>
      <h3 style={{ marginTop: '2rem', fontStyle: 'italic' }}>Create Fork</h3>
      <Input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Fork Name"
        sx={{
          marginTop: '1rem',
          marginBottom: '1.5rem',
        }}
      />
      <AvailableForksSelect
        value={from}
        onSelect={setFrom}
        label="Fork From"
        labelId="fork-from"
      />
      <Button
        disabled={!name}
        loading={isLoading}
        onClick={() => createFork({ name, from })}
        sx={{ margin: '1rem 0' }}
      >
        {from ? `Fork from ${formatLongString(from.id)}` : 'Blank Fork'}
        {error ? (
          <Tooltip title={(error as any).message}>
            <span>
              <MdError />
            </span>
          </Tooltip>
        ) : null}
      </Button>
    </>
  )
}

export default AddFork

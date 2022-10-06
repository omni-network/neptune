import { useState } from 'react'
import { FormControl, Input, Tooltip } from '@mui/material'
import { MdError } from 'react-icons/md'
import { LoadingButton as Button } from '@mui/lab'
import { Account } from 'shared/types'
import { useAddAccount } from 'ui/mutations'

const AddAccount = () => {
  const [accountToAdd, setAccountToAdd] = useState('')
  const { mutate: addAccount, error } = useAddAccount()

  return (
    <FormControl
      sx={{
        width: '100%',
        fontSize: '0.75em',
        marginBottom: '2rem',
      }}
    >
      <Input
        value={accountToAdd}
        onChange={e => setAccountToAdd(e.target.value)}
        placeholder="New account"
        sx={{ marginBottom: '1rem' }}
        endAdornment={
          error ? (
            <Tooltip title={(error as any).message}>
              <span>
                <MdError />
              </span>
            </Tooltip>
          ) : null
        }
      />
      <Button
        disabled={!accountToAdd}
        onClick={() =>
          addAccount(accountToAdd as Account, {
            onSuccess: () => setAccountToAdd(''),
          })
        }
      >
        Add Account
      </Button>
    </FormControl>
  )
}

export default AddAccount

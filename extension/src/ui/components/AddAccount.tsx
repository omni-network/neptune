import { useState } from 'react'
import { FormControl, Input, Alert } from '@mui/material'
import { LoadingButton as Button } from '@mui/lab'
import { Account } from 'shared/types'
import { useAddAccount } from 'ui/mutations'
import { parseErrorMessage } from 'shared/utils/error'

const AddAccount = () => {
  const [accountToAdd, setAccountToAdd] = useState('')
  const { mutate: addAccount, error, isSuccess } = useAddAccount()

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
      />
      <Button
        sx={{ marginBottom: '1rem' }}
        disabled={!accountToAdd}
        onClick={() =>
          addAccount(accountToAdd as Account, {
            onSuccess: () => setAccountToAdd(''),
          })
        }
      >
        Add Account
      </Button>
      {!!error && <Alert severity="error">{parseErrorMessage(error)}</Alert>}
      {isSuccess && <Alert severity="success">Success!</Alert>}
    </FormControl>
  )
}

export default AddAccount

import { useState } from 'react'
import { FormControl, Input } from '@mui/material'
import { LoadingButton as Button } from '@mui/lab'
import { Account } from 'shared/types'
import { ErrorMessage, SuccessMessage } from 'ui/components/messages'
import { useAddAccount } from 'ui/mutations'

const AddAccount = () => {
  const [accountToAdd, setAccountToAdd] = useState('')
  const { mutate: addAccount, error, isSuccess } = useAddAccount()

  const onAdd = () =>
    addAccount(accountToAdd as Account, {
      onSuccess: () => setAccountToAdd(''),
    })

  return (
    <FormControl>
      <Input
        value={accountToAdd}
        onChange={e => setAccountToAdd(e.target.value)}
        placeholder="New account"
        sx={{ marginBottom: '1rem' }}
      />
      <Button disabled={!accountToAdd} onClick={onAdd}>
        Add Account
      </Button>
      {error ? <ErrorMessage error={error} /> : null}
      {isSuccess ? <SuccessMessage /> : null}
    </FormControl>
  )
}

export default AddAccount

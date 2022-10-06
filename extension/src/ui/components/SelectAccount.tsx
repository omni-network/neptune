import { Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import { Account } from 'shared/types'
import { useAccounts } from 'ui/queries'
import { useSelectAccount } from 'ui/mutations'
import { formatAccount } from 'ui/utils/format'

const SelectAccount = () => {
  const { data: accounts } = useAccounts()
  const { mutate: selectAccount } = useSelectAccount()

  if (accounts == null) return null

  return (
    <FormControl
      sx={{ width: '100%', fontSize: '0.75em', marginBottom: '1rem' }}
    >
      <InputLabel id="accounts-select">Account</InputLabel>
      <Select
        onChange={e => selectAccount(e.target.value as Account)}
        labelId="accounts-select"
        value={accounts[0]}
        label="Account"
      >
        {accounts.map(account => (
          <MenuItem key={account} value={account}>
            {formatAccount(account)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default SelectAccount

import { Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import { Account } from 'shared/types'
import { useAccounts } from 'ui/queries'
import { useSelectAccount } from 'ui/mutations'
import { formatAccount } from 'ui/utils/format'

const SelectAccount = () => {
  const { data: accounts } = useAccounts()
  const { mutate: selectAccount } = useSelectAccount()
  const selected = accounts && accounts[0]

  return (
    <FormControl>
      <InputLabel id="accounts-select">Account</InputLabel>
      <Select
        onChange={e => selectAccount(e.target.value as Account)}
        labelId="accounts-select"
        value={selected ?? ''}
        label="Account"
      >
        {accounts?.map(account => (
          <MenuItem key={account} value={account}>
            {formatAccount(account)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default SelectAccount

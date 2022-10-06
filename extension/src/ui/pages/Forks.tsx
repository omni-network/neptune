import { FormControl } from '@mui/material'
import SelectFork from '../components/SelectFork'
import AddFork from '../components/AddFork'
import ForkMainnet from '../components/ForkMainnet'

const Forks = () => {
  return (
    <FormControl
      sx={{ width: '100%', fontSize: '0.75em', marginBottom: '1rem' }}
    >
      <SelectFork />
      <AddFork />
      <ForkMainnet />
    </FormControl>
  )
}

export default Forks

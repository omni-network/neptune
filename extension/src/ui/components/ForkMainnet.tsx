import { LoadingButton as Button } from '@mui/lab'
import { useForkMainnetLatest } from 'ui/mutations'

const ForkMainnet = () => {
  const { isLoading, mutate: forkMainnetLatest } = useForkMainnetLatest()

  return (
    <Button
      sx={{ padding: '1rem 3rem' }}
      loading={isLoading}
      onClick={() => forkMainnetLatest()}
    >
      Fork Mainnet
    </Button>
  )
}

export default ForkMainnet

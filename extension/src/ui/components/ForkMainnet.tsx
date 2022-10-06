import { Alert } from '@mui/lab'
import { LoadingButton as Button } from '@mui/lab'
import { useForkMainnetLatest } from 'ui/mutations'
import { parseErrorMessage } from 'shared/utils/error'

const ForkMainnet = () => {
  const {
    isLoading,
    mutate: forkMainnetLatest,
    error,
    isSuccess,
  } = useForkMainnetLatest()

  return (
    <>
      <Button
        sx={{ padding: '1rem 3rem', margin: '1rem 0' }}
        loading={isLoading}
        onClick={() => forkMainnetLatest()}
      >
        Fork Mainnet
      </Button>
      {!!error && <Alert severity="error">{parseErrorMessage(error)}</Alert>}
      {isSuccess && <Alert severity="success">Success!</Alert>}
    </>
  )
}

export default ForkMainnet

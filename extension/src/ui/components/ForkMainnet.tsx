import { LoadingButton as Button } from '@mui/lab'
import { useForkMainnetLatest } from 'ui/mutations'
import { ErrorMessage, SuccessMessage } from 'ui/components/messages'

const ForkMainnet = ({ style }: { style?: React.CSSProperties }) => {
  const {
    isLoading,
    mutate: forkMainnetLatest,
    error,
    isSuccess,
  } = useForkMainnetLatest()

  return (
    <>
      <Button
        sx={{ marginBottom: '1rem', ...style }}
        loading={isLoading}
        onClick={() => forkMainnetLatest()}
      >
        Fork Mainnet
      </Button>
      {error ? <ErrorMessage error={error} /> : null}
      {isSuccess ? <SuccessMessage /> : null}
    </>
  )
}

export default ForkMainnet

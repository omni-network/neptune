import { Alert } from '@mui/lab'
import { LoadingButton as Button } from '@mui/lab'
import { useImpersonateAll } from 'ui/mutations'
import { parseErrorMessage } from 'shared/utils/error'

const ImpersonateAll = () => {
  const {
    isLoading,
    mutate: impersonateAll,
    error,
    isSuccess,
  } = useImpersonateAll()

  return (
    <>
      <Button
        sx={{ padding: '1rem 3rem', margin: '1rem 0' }}
        loading={isLoading}
        onClick={() => impersonateAll()}
      >
        Impersonate All
      </Button>
      {!!error && <Alert severity="error">{parseErrorMessage(error)}</Alert>}
      {isSuccess && <Alert severity="success">Success!</Alert>}
    </>
  )
}

export default ImpersonateAll

import { LoadingButton as Button } from '@mui/lab'
import { useImpersonateAll } from 'ui/mutations'
import { ErrorMessage, SuccessMessage } from 'ui/components/messages'

const ImpersonateAll = () => {
  const {
    isLoading,
    mutate: impersonateAll,
    error,
    isSuccess,
  } = useImpersonateAll()

  return (
    <>
      <Button loading={isLoading} onClick={() => impersonateAll()}>
        Impersonate All
      </Button>
      {error ? <ErrorMessage error={error} /> : null}
      {isSuccess ? <SuccessMessage /> : null}
    </>
  )
}

export default ImpersonateAll

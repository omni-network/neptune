import { Alert } from '@mui/material'
import { LoadingButton as Button } from '@mui/lab'
import { useDeleteActiveFork } from 'ui/mutations'
import { parseErrorMessage } from 'shared/utils/error'

const DeleteActiveFork = ({ style }: { style?: React.CSSProperties }) => {
  const {
    isLoading,
    mutate: deleteActiveFork,
    error,
    isSuccess,
  } = useDeleteActiveFork()

  return (
    <>
      <Button
        sx={{ marginBottom: '1rem', ...style }}
        loading={isLoading}
        onClick={() => deleteActiveFork()}
        color="error"
      >
        Delete Active Fork
      </Button>
      {!!error && <Alert severity="error">{parseErrorMessage(error)}</Alert>}
      {isSuccess && <Alert severity="success">Success!</Alert>}
    </>
  )
}

export default DeleteActiveFork

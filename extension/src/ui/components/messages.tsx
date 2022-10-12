import { Alert } from '@mui/material'
import { parseErrorMessage } from 'shared/utils/error'

type ErrorMessageProps = {
  error: unknown
}

export const ErrorMessage = ({ error }: ErrorMessageProps) => (
  <Alert severity="error">{parseErrorMessage(error)}</Alert>
)

type SuccessMessageProps = {
  message?: string | null
}

export const SuccessMessage = ({ message }: SuccessMessageProps) => (
  <Alert severity="success">{message ?? 'Success!'}</Alert>
)

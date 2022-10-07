import styled from 'styled-components'
import { AiFillCaretLeft, AiFillCaretRight } from 'react-icons/ai'
import { MdClear } from 'react-icons/md'
import { Alert } from '@mui/material'
import { LoadingButton as Button } from '@mui/lab'
import { useStepBack, useReset } from 'ui/mutations'
import { parseErrorMessage } from 'shared/utils/error'

const Container = styled.div`
  display: flex;
  gap: 1rem;
  flex-direction: column;
  width: 100%;
`

const Controls = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;

  button {
    padding: 0.75rem 2rem;
    flex-grow: 1;
  }
`

const ForkController = () => {
  const reset = useReset()
  const stepback = useStepBack()

  const error = reset.error ?? stepback.error
  const success = reset.isSuccess || stepback.isSuccess
  const disabled = reset.isLoading || stepback.isLoading

  return (
    <Container>
      {!!error && <Alert severity="error">{parseErrorMessage(error)}</Alert>}
      {success && <Alert severity="success">Success!</Alert>}
      <Controls>
        <Button
          onClick={() => stepback.mutate()}
          disabled={disabled}
          loading={stepback.isLoading}
        >
          <AiFillCaretLeft />
        </Button>
        <Button
          onClick={() => reset.mutate()}
          disabled={disabled}
          loading={reset.isLoading}
        >
          <MdClear />
        </Button>
        <Button
          onClick={() => {
            // todo, maybe replay transaction
          }}
          disabled
        >
          <AiFillCaretRight />
        </Button>
      </Controls>
    </Container>
  )
}

export default ForkController

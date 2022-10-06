import styled from 'styled-components'
import { AiFillCaretLeft, AiFillCaretRight } from 'react-icons/ai'
import { MdClear } from 'react-icons/md'
import { Alert } from '@mui/material'
import { LoadingButton as Button } from '@mui/lab'
import { useBacktrack } from 'ui/mutations'

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
  const { mutate: backtrack, isLoading, isSuccess, error } = useBacktrack()

  const disabled = isLoading

  return (
    <Container>
      {error ? <Alert severity="error">{(error as any).message}</Alert> : null}
      {isSuccess && <Alert severity="success">Success!</Alert>}
      {isLoading && <Alert severity="info">Loading...</Alert>}
      <Controls>
        <Button
          onClick={() => backtrack({ backOnce: true })}
          disabled={disabled}
        >
          <AiFillCaretLeft />
        </Button>
        <Button onClick={() => backtrack({ reset: true })} disabled={disabled}>
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

import styled from 'styled-components'
import SelectFork from '../components/SelectFork'
import AddFork from '../components/AddFork'
import DeleteActiveFork from 'ui/components/DeleteActiveFork'

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Forks = () => {
  return (
    <Container>
      <SelectFork />
      <AddFork />
      <DeleteActiveFork style={{ width: '100%' }} />
    </Container>
  )
}

export default Forks

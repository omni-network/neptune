import styled from 'styled-components'
import { Button } from '@mui/material'
import { useActiveTab } from 'ui/utils/tabs'
import SelectAccount from 'ui/components/SelectAccount'
import SelectFork from 'ui/components/SelectFork'
import ForkController from 'ui/components/ForkController'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
`

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Home = () => {
  const { disconnect } = useActiveTab()
  return (
    <Container>
      <div>
        <SelectAccount />
        <SelectFork />
      </div>
      <Footer>
        <ForkController />
        <Button
          sx={{ padding: '1rem 3rem', width: '100%' }}
          onClick={disconnect}
        >
          Disconnect
        </Button>
      </Footer>
    </Container>
  )
}

export default Home

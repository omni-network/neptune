import styled from 'styled-components'

const P = styled.p`
  width: 250px;
  max-width: 100%;
  padding: 1rem;
  margin: 0 auto;
`

const NotConnected = () => {
  return <P>oops, your neptune server isn't running. please restart it</P>
}

export default NotConnected

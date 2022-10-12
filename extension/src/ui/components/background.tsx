import styled from 'styled-components'
import { colors } from 'ui/theme'

export const Background = styled.div`
  height: 600px;
  width: 360px;
  min-width: 100vw;
  display: flex;
  flex-direction: column;
  border: 1px solid ${colors.green};
`

export const Centered = styled(Background)`
  justify-content: center;
  align-items: center;
  padding: 1rem;
`

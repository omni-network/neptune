import { useChainId } from 'ui/queries'
import { formatChainId } from 'ui/utils/format'

const ChainId = () => {
  const { data: chainId } = useChainId()

  if (chainId == null) return null

  return null
  // return (
  //   <h3
  //     style={{
  //       margin: '1rem 0',
  //     }}
  //   >
  //     Chain ID: {formatChainId(chainId)}
  //   </h3>
  // )
}

export default ChainId

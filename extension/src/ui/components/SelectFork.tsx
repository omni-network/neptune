import { useActiveFork } from 'ui/queries'
import { useSetActiveFork } from 'ui/mutations'
import AvailableForksSelect from './AvailableForksSelect'

const SelectFork = () => {
  const { data: activeFork } = useActiveFork()
  const { mutate: setActiveFork } = useSetActiveFork()

  return (
    <AvailableForksSelect
      value={activeFork ?? null}
      onSelect={forkId => setActiveFork(forkId)}
      label="Fork"
      labelId="active-fork"
    />
  )
}

export default SelectFork

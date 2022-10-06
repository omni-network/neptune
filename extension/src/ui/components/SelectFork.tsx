import { useAvailableForks, useActiveFork } from 'ui/queries'
import { useSetActiveFork } from 'ui/mutations'
import AvailableForksSelect from './AvailableForksSelect'

const SelectFork = () => {
  const { data: availableForks } = useAvailableForks()
  const { data: activeFork } = useActiveFork()
  const { mutate: setActiveFork } = useSetActiveFork()

  if (availableForks == null) return null

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

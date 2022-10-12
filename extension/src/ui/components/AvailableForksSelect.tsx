import { Fork } from 'shared/types'
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import { formatLongString } from 'ui/utils/format'
import { useAvailableForks } from 'ui/queries'

type AvailableForksSelectProps = {
  allowNone?: boolean
  value: Fork | null
  onSelect: (fork: Fork | null) => void
  label: string
  labelId: string
}

const AvailableForksSelect = ({
  value,
  onSelect,
  label,
  labelId,
  allowNone,
}: AvailableForksSelectProps) => {
  const { data: availableForks } = useAvailableForks()

  return (
    <FormControl
      sx={{ width: '100%', fontSize: '0.75em' }}
      disabled={availableForks?.length === 0}
    >
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        label={label}
        labelId={labelId}
        value={value ? JSON.stringify(value) : ''}
        onChange={e => {
          const fork = e.target.value ? JSON.parse(e.target.value) : null
          onSelect(fork)
        }}
        onReset={() => onSelect(null)}
      >
        {allowNone && (
          <MenuItem value="">
            <em>--</em>
          </MenuItem>
        )}
        {availableForks?.map(fork => (
          <MenuItem key={fork.id} value={JSON.stringify(fork)}>
            {fork.name
              ? `${fork.name} (${formatLongString(fork.id)})`
              : formatLongString(fork.id)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default AvailableForksSelect

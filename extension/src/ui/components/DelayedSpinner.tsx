import { useState, useEffect } from 'react'
import { CircularProgress } from '@mui/material'

type DelayedSpinnerProps = {
  delay?: number
}

const DelayedSpinner = ({ delay = 300 }: DelayedSpinnerProps) => {
  const [showSpinner, setShowSpinner] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setShowSpinner(true), delay)
    return () => clearTimeout(timeout)
  }, [delay])

  if (!showSpinner) return null
  return <CircularProgress />
}

export default DelayedSpinner

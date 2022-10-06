export const parseErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error)

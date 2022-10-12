import { createTheme } from '@mui/material/styles'
import { createGlobalStyle } from 'styled-components'
import { normalize } from 'styled-normalize'

export const colors = {
  white: '#ffffff',
  black: '#161818',
  gray: '#4E5353',
  green: '#70ffba',
  blue: '#30CCCC',
  red: '#d01919',
  yellow: '#eaae00',
} as const

export const FixedGlobalStyle = createGlobalStyle`
  ${normalize}

  html, body {
    font-family: monospace, sans-serif;
    background-color: ${colors.gray};
    color: ${colors.white};
    -webkit-font-smoothing: antialiased;
    overscroll-behavior: none;
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    margin-block: 0;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  pre code {
    font-size: 12px;
    display: block;
    background: none;
    -webkit-overflow-scrolling: touch;
    overflow-x: scroll;
    max-width: 100%;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
`

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.green,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          padding: '10px 20px',
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          width: '100%',
          fontSize: '0.75em',
          margin: '1rem 0',
        },
      },
    },
  },
  typography: {
    fontFamily: ['monospace', 'sans-serif'].join(','),
  },
})

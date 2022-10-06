import { createTheme } from '@mui/material/styles'
import { createGlobalStyle, } from 'styled-components'
import { normalize } from 'styled-normalize'

export const colors = {
  white: '#ffffff',
  black: '#161818',
  gray: '#4E5353',
  green: '#70ffba',
  blue: '#30CCCC',
  red: '#d01919',
  yellow: '#eaae00'
} as const


export const FixedGlobalStyle = createGlobalStyle`
  ${normalize}

  html {
    min-width: 360px;
    min-height: 600px;
    width: 360px;
    height: 600px;
  }

  body {
    font-family: sans-serif;
    -webkit-font-smoothing: antialiased;
    color: ${colors.white};
    background-color: ${colors.gray};

    height: 560px;
    width: 320px;

    display: flex;
    flex-direction: column;

    padding: 20px;
    margin: 20px;

    background-color: ${colors.gray};
    color: ${colors.white};
    border: 1px solid ${colors.green};

    border-radius: 10px;

    overscroll-behavior: none;
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
    &::-webkit-scrollbar { /* Chrome, Safari, Opera */
      display: none;
    }
  }

  #root {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
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

  #root {
    width: 100%;
    height: 100%;
  }
`

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.green,
    },
  },
})

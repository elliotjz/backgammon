import * as React from "react";
import * as ReactDOM from "react-dom";
import { ThemeProvider } from 'styled-components'

import { theme } from './theme'
import App from './App';

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>,
  document.getElementById("app")
);

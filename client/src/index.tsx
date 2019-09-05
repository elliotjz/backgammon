import * as React from "react";
import * as ReactDOM from "react-dom";
import { ThemeProvider } from 'styled-components'

import { theme } from './theme'
import Game from './components/Game';

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Game />
  </ThemeProvider>,
  document.getElementById("app")
);

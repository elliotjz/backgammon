import * as React from 'react';

import Game from './components/Game';
import StartScreen from './components/StartScreen';

const App = () => {
  const pathname = window.location.pathname;
  const displayGame = pathname !== '/';

  return (
    <div>
      {displayGame ? <Game /> : <StartScreen />}
    </div>
  );
};

export default App;
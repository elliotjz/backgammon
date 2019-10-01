import * as React from 'react';

import Game from './components/Game';
import StartScreen from './components/StartScreen';
import Analytics from './components/Analytics';

const App = () => {
  const pathname = window.location.pathname;

  if (pathname === '/analytics') return <Analytics />
  
  const displayGame = pathname !== '/';

  return (
    <div>
      {displayGame ? <Game /> : <StartScreen />}
    </div>
  );
};

export default App;
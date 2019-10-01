import * as React from 'react';
import styled from 'styled-components';

import Button from './Button';

const Container = styled.div`
  margin: 3em;
  text-align: center;

  .btn-container {
    display: flex;
  }
`;

class StartScreen extends React.Component {
  startGame = async () => {
    try {
      const http = window.location.host === 'localhost:3000' ? 'http' : 'https';
      const url= `${http}://${window.location.host}/api/start-game`;
      const res = await fetch(url);
      const resJson = await res.json();
      const uniqueURL = `${http}://${window.location.host}/${resJson.code}`;
      window.location.replace(uniqueURL);
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    return (
      <Container>
        <h1>Welcome to online backgammon!</h1>
        <div className='btn-container'>
          <Button handleClick={this.startGame} text="Start Game" disabled={false} />
        </div>
        <p>To join a game, ask for a url from a friend.</p> 
      </Container>
    );
  }
}

export default StartScreen;
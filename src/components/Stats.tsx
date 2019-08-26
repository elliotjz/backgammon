import * as React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1000px;
  margin: auto;
  
  h3 {
    text-align: center;
  }
  
  .inner-container {
    display: flex;
    flex-direction: row;
    border: 2px ${props => props.theme.colors.green} solid;
    border-radius: 10px;
    padding: 10px;

    .text-stats {
      min-width: 300px;
    }

    .chart-container {
      background-color: ${props => `${props.theme.colors.lightBrown}22`};
      text-align: center;
      padding-top: 50px;
      flex: 1;
    }
  }
`

const Stats = () => {
  const gamesWonYou = 3;
  const gamesWonOpponent = 1;
  const doublesRolledYou = 4;
  const doublesRolledOpponent = 5;
  const piecesCapturedYou = 8;
  const piecesCapturedOpponent = 5;

  const placesToFinishYou = 100;
  const placesToFinishOpponent = 124;

  return (
    <Container>
      <h3>Stats</h3>
      <div className="inner-container">
        <div className="text-stats">
          <h4>Games Won</h4>
          <p>You: {gamesWonYou} Opponent: {gamesWonOpponent}</p>
          <h4>Doubles Rolled</h4>
          <p>You: {doublesRolledYou} Opponent: {doublesRolledOpponent}</p>
          <h4>Pieces Captured</h4>
          <p>You: {piecesCapturedYou} Opponent: {piecesCapturedOpponent}</p>
        </div>
        <div className="chart-container">
          <p>Chart will go here</p>
        </div>
      </div>
    </Container>
  );
};

export default Stats;
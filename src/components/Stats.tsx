import * as React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  max-width: 750px;
  margin: auto;

  .text-stats {
    min-width: 300px;
  }

  .chart-container {
    background-color: #bbbbff;
    flex: 1;
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
    </Container>
  );
};

export default Stats;
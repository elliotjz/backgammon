import * as React from "react";
import styled from "styled-components";

import Board from "./Board";
import GameStatus from "./GameStatus";
import RollDiceBtn from "./RollDiceBtn";

const Container = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const getDiceNum = () => {
  return Math.ceil(Math.random() * 6);
};

class Game extends React.Component {
  state = {
    myTurn: true,
    needsToRoll: true,
    dice: [-1, -1],
    pieces: [[0, 0, 11, 11, 11, 11, 11, 16, 16, 16, 18, 18, 18, 18, 18],
              [5, 5, 5, 5, 5, 7, 7, 7, 12, 12, 12, 12, 12, 23, 23]],
    highlightedPiece: [-1, -1],
    highlightedSpikes: []
  };

  handlePieceClick = (player:number, pieceI:number) => {
    const { myTurn, needsToRoll, dice, pieces } = this.state;
    const isMyChip = player === 0;
    const spikeNumber = pieces[0][pieceI];
    if (myTurn && !needsToRoll && isMyChip) {
      this.setState({
        highlightedPiece: [0, pieceI],
        highlightedSpikes: [spikeNumber + dice[0], spikeNumber + dice[1]]
        // TODO: Deal with if the dice is a double
      });
    }
  };

  handleSpikeClick = (spikeNum: number) => {
    const { highlightedPiece } = this.state;
    this.movePiece(0, highlightedPiece[1], 2);
    // TODO: use the spikeNum instead of hard coding 2
  };

  movePiece = (player:number, i:number, steps:number) => {
    const { pieces } = this.state;
    if (player === 0) {
      pieces[player][i] += steps;
    } else if (player === 1) {
      pieces[player][i] -= steps;
    }
    this.setState({
      pieces,
      highlightedPiece: [-1, -1],
      highlightedSpikes: []
    });
  };

  rollDice = () => {
    this.setState({
      dice: [getDiceNum(), getDiceNum()],
      needsToRoll: false
    });
  };

  render() {
    const {
      pieces,
      dice,
      myTurn,
      highlightedPiece,
      highlightedSpikes,
      needsToRoll
    } = this.state;
    return (
      <Container>
        <Board
          pieces={pieces}
          handlePieceClick={this.handlePieceClick}
          handleSpikeClick={this.handleSpikeClick}
          highlightedPiece={highlightedPiece}
          highlightedSpikes={highlightedSpikes}
        />
        <RollDiceBtn rollDice={this.rollDice} disabled={!needsToRoll} />
        <GameStatus dice={dice} myTurn={myTurn} />
      </Container>
    );
  }
}

export default Game;

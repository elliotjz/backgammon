import * as React from "react";
import styled from "styled-components";

import Board from "./Board";
import GameStatus from "./GameStatus";
import RollDiceBtn from "./RollDiceBtn";
import { allPiecesAreInFinalQuad, getDiceNumbers } from '../helpers'

const Container = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
`;



interface PropsI {

}

interface StateI {
  myTurn: boolean,
  needsToRoll: boolean,
  dice: number[],
  movesLeft: number[],
  pieces: number[][],
  highlightedPiece: number[],
  highlightedSpikes: number[]
}

class Game extends React.Component<PropsI, StateI> {
  state = {
    myTurn: true,
    needsToRoll: true,
    dice: [-1, -1],
    movesLeft: [-1],
    pieces: [[0, 0, 11, 11, 11, 11, 11, 16, 16, 16, 18, 18, 18, 18, 18],
              [5, 5, 5, 5, 5, 7, 7, 7, 12, 12, 12, 12, 12, 23, 23]],
    highlightedPiece: [-1, -1],
    highlightedSpikes: []
  };

  handlePieceClick = (player:number, pieceI:number) => {
    const { myTurn, needsToRoll, movesLeft, pieces } = this.state;
    const isMyChip = player === 0;
    const spikeNumber = pieces[0][pieceI];
    if (myTurn && !needsToRoll && isMyChip) {
      const highlightedSpikes = movesLeft
        .filter((val, i, self) => self.indexOf(val) === i)
        .map(n => spikeNumber + n)
      this.setState({
        highlightedPiece: [0, pieceI],
        highlightedSpikes,
      });
    }
  };

  handleSpikeClick = (spikeNum: number) => {
    const { highlightedPiece, pieces } = this.state;
    this.movePiece(0, highlightedPiece[1], spikeNum);
  };

  movePiece = (player:number, i:number, toSpike:number) => {
    const { pieces, movesLeft, myTurn } = this.state;
    const diceNumberUsed = player === 0 ?
      toSpike - pieces[player][i] :
      pieces[player][i] - toSpike;
    const indexOfMove = movesLeft.indexOf(diceNumberUsed);

    // Move the piece
    pieces[player][i] = toSpike;

    // Update moves left
    movesLeft.splice(indexOfMove, 1);

    if (movesLeft.length > 0) {
      // Current player has moves left
      this.setState({
        pieces,
        movesLeft,
        highlightedPiece: [-1, -1],
        highlightedSpikes: []
      }, () => {
        // Computer makes another move
        if (!myTurn) this.computerMove();
      });
    } else {
      // No more moves. Change turn
      if (myTurn) {
        // It's now the computers turn
        const { dice, movesLeft } = getDiceNumbers();
        this.setState({
          myTurn: false,
          needsToRoll: false,
          pieces,
          dice,
          movesLeft,
          highlightedPiece: [-1, -1],
          highlightedSpikes: []
        }, () => {
          this.computerMove();
        })

      } else {
        // It's now my turn
        this.setState({
          myTurn: true,
          needsToRoll: true,
          dice: [-1, -1],
          pieces,
          movesLeft,
          highlightedPiece: [-1, -1],
          highlightedSpikes: []
        })
      }
    }
  };

  rollDice = () => {
    const { dice, movesLeft } = getDiceNumbers();
    this.setState({
      dice,
      movesLeft,
      needsToRoll: false
    });
  };

  computerMove = () => {
    setTimeout(() => {
      const { pieces, movesLeft } = this.state
      const lastPiecePosition = Math.max(...pieces[1])
      const indexOfLastPiece = pieces[1].indexOf(lastPiecePosition);
      this.movePiece(1, indexOfLastPiece, lastPiecePosition - movesLeft[0])
    }, 1000)
  }

  render() {
    const {
      pieces,
      dice,
      movesLeft,
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
        <GameStatus dice={dice} myTurn={myTurn} movesLeft={movesLeft} />
      </Container>
    );
  }
}

export default Game;

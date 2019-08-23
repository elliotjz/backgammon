import * as React from "react";
import styled from "styled-components";

import Board from "./Board";
import GameStatus from "./GameStatus";
import Button from "./Button";
import {
  allPiecesAreInFinalQuad,
  getDiceNumbers,
  capturesOpponent,
  spikeIsAvailable,
  playerCanMove,
  getValidMoves
} from '../helpers/functions'
import {
  startingState,
  capturedTest,
  allInEndQuad,
  almostFinished,
  almostFinished2
} from '../helpers/testPiceArrays'
import { ME_HOME, OPPONENT_HOME, ME } from '../helpers/constants'
import Chat from "./Chat";

const Container = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

interface MoveOption {
  piece: number,
  toSpike: number,
}

interface PropsI {

}

interface StateI {
  myTurn: boolean,
  needsToRoll: boolean,
  dice: number[],
  movesLeft: number[],
  pieces: number[][],
  highlightedPiece: number[],
  highlightedSpikes: number[],
  highlightedHome0: boolean,
  highlightedHome1: boolean,
  message: string,
}

class Game extends React.Component<PropsI, StateI> {
  state = {
    myTurn: true,
    needsToRoll: true,
    dice: [-1, -1],
    movesLeft: [-1],
    pieces: startingState,
    highlightedPiece: [-1, -1],
    highlightedSpikes: [],
    highlightedHome0: false,
    highlightedHome1: false,
    message: "",
  };

  handlePieceClick = (player:number, pieceI:number) => {
    const { myTurn, needsToRoll, movesLeft, pieces } = this.state;
    const isMyChip = player === ME;
    if (myTurn && !needsToRoll && isMyChip) {
      // Highlight the spikes that the player can move to
      const validMoves:MoveOption[] = getValidMoves(pieces, 0, movesLeft)
        .filter(m => m.piece === pieceI);
      const validSpikes:number[] = validMoves.map(m => m.toSpike);

      // Highlight the home if the player can move there
      let highlightedHome0;
      if (player === ME) {
        highlightedHome0 = validSpikes.filter(s => s >= ME_HOME).length > 0;
      } else {
        highlightedHome0 = validSpikes.filter(s => s <= OPPONENT_HOME).length > 0;
      }
      
      this.setState({
        highlightedPiece: [0, pieceI],
        highlightedSpikes: validSpikes,
        highlightedHome0,
      });
    }
  };

  handleSpikeClick = (spikeNum: number) => {
    const { highlightedPiece } = this.state;
    this.movePiece(0, highlightedPiece[1], spikeNum);
  };

  movePiece = (player:number, i:number, toSpike:number) => {
    const { pieces, movesLeft, myTurn } = this.state;
    const diceNumberUsed = player === ME ?
      toSpike - pieces[player][i] :
      pieces[player][i] - toSpike;
    const indexOfMove = movesLeft.indexOf(diceNumberUsed);

    // Move the piece
    let limitedToSpike = toSpike;
    if (toSpike < -1) limitedToSpike = -1;
    if (toSpike > 24) limitedToSpike = 24;
    pieces[player][i] = limitedToSpike;

    // Check if a piece has been captured
    if (capturesOpponent(pieces, player, toSpike)) {
      const indexOfPiece = pieces[1 - player].indexOf(toSpike);
      pieces[1 - player][indexOfPiece] = player === ME ? ME_HOME : OPPONENT_HOME;
    }

    // Update moves left
    movesLeft.splice(indexOfMove, 1);

    if (movesLeft.length > 0) {
      // Current player has moves left
      this.setState({
        pieces,
        movesLeft,
        highlightedPiece: [-1, -1],
        highlightedSpikes: [],
        highlightedHome0: false,
        highlightedHome1: false,
      }, () => {
        if (myTurn) {
          this.playersMove();
        } else {
          this.computerMove();
        }
      });
    } else {
      // No more moves. Change turn
      if (myTurn) {
        this.startComputersTurn(pieces);
      } else {
        this.startPlayersTurn(pieces);
      }
    }
  };

  rollDice = () => {
    const { dice, movesLeft } = getDiceNumbers();
    this.setState({
      dice,
      movesLeft,
      needsToRoll: false
    }, () => {
      const { myTurn } = this.state;
      if (myTurn) this.playersMove();
      else this.computerMove();
    });
  };

  startComputersTurn = (pieces: number[][]) => {
    this.setState({
      myTurn: false,
      needsToRoll: true,
      pieces,
      highlightedPiece: [-1, -1],
      highlightedSpikes: [],
      highlightedHome0: false,
      highlightedHome1: false,
    });
  }

  computerMove = () => {
    setTimeout(() => {
      const { pieces, movesLeft } = this.state;
      const validMoves = getValidMoves(pieces, 1, movesLeft);
      if (validMoves.length === 0) {
        this.startPlayersTurn(pieces);
      } else {
        const randomI = Math.floor(Math.random() * validMoves.length);
        const chosenMove:MoveOption = validMoves[randomI];
        this.movePiece(1, chosenMove.piece, chosenMove.toSpike);
      }
    }, 1000);
  }

  startPlayersTurn = (pieces: number[][]) => {
    this.setState({
      myTurn: true,
      needsToRoll: true,
      dice: [-1, -1],
      pieces,
      movesLeft: [-1],
      highlightedPiece: [-1, -1],
      highlightedSpikes: [],
      highlightedHome0: false,
      highlightedHome1: false,
    })
  }

  playersMove = () => {
    const { pieces, movesLeft } = this.state;
    if (!playerCanMove(pieces, 0, movesLeft)) {
      this.startComputersTurn(pieces);
    }
  }

  render() {
    const {
      pieces,
      movesLeft,
      myTurn,
      highlightedPiece,
      highlightedSpikes,
      highlightedHome0,
      highlightedHome1,
      needsToRoll
    } = this.state;
    const rollDiceBtnDisabled = !myTurn || !needsToRoll;
    const computerMoveBtnDisabled = myTurn || !needsToRoll;
    return (
      <Container>
        <Board
          pieces={pieces}
          handlePieceClick={this.handlePieceClick}
          handleSpikeClick={this.handleSpikeClick}
          highlightedPiece={highlightedPiece}
          highlightedSpikes={highlightedSpikes}
          movesLeft={movesLeft}
          highlightedHome0={highlightedHome0}
          highlightedHome1={highlightedHome1}
        />
        <GameStatus myTurn={myTurn} />
        <Button handleClick={this.rollDice} disabled={rollDiceBtnDisabled} text="Roll Dice" />
        <Button handleClick={this.rollDice} disabled={computerMoveBtnDisabled} text="Computer Move" />
        <Chat />
      </Container>
    );
  }
}

export default Game;

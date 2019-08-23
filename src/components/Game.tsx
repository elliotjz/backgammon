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
import { capturedTest, allInEndQuad } from '../helpers/testPiceArrays'
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
    pieces: allInEndQuad,
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
      let highlightedHome0 = false;
      if (allPiecesAreInFinalQuad(0, pieces[0])) {
        const home = player === ME ? ME_HOME : OPPONENT_HOME;
        highlightedHome0 = validSpikes.filter(s => s === home).length > 0;
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
    pieces[player][i] = toSpike;

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
      const { pieces, movesLeft } = this.state
      if (!playerCanMove(pieces, 1, movesLeft)) {
        this.startPlayersTurn(pieces);
      } else {
        let sortedPieces = [...pieces[1]];
        sortedPieces.sort((a, b) => b - a);
        let lastPiecePosition = sortedPieces[0];
        if (lastPiecePosition === 24) {
          // Piece is trapped. Comp can only move the trapped pieces
          if (spikeIsAvailable(pieces, 1, lastPiecePosition - movesLeft[0])) {
            const indexOfLastPiece = pieces[1].indexOf(lastPiecePosition);
            this.movePiece(1, indexOfLastPiece, lastPiecePosition - movesLeft[0]);
          } else {
            const indexOfLastPiece = pieces[1].indexOf(lastPiecePosition);
            this.movePiece(1, indexOfLastPiece, lastPiecePosition - movesLeft[1]);
          }
        } else {
          // No trapped pieces. Comp can move anything
          let i = 1;
          while (!spikeIsAvailable(pieces, 1, lastPiecePosition - movesLeft[0])
            && i < sortedPieces.length) {
            lastPiecePosition = sortedPieces[i];
            i += 1;
          }
          if (i === pieces[0].length) {
            console.log("Out of luck! No moves can be made!");
          } else {
            const indexOfLastPiece = pieces[1].indexOf(lastPiecePosition);
            this.movePiece(1, indexOfLastPiece, lastPiecePosition - movesLeft[0])
          }
        }
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

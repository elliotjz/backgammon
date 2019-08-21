import * as React from "react";
import styled from "styled-components";

import Board from "./Board";
import GameStatus from "./GameStatus";
import RollDiceBtn from "./RollDiceBtn";
import {
  allPiecesAreInFinalQuad,
  getDiceNumbers,
  capturesOpponent,
  spikeIsAvailable,
  playerCanMove
} from '../helpers/functions'
import { capturedTest, allInEndQuad } from '../helpers/testPiceArrays'
import { PLAYER0_HOME, PLAYER1_HOME } from '../helpers/constants'

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
    const isMyChip = player === 0;
    const spikeNumber = pieces[0][pieceI];
    if (myTurn && !needsToRoll && isMyChip) {
      // Highlight the spikes that the player can move to
      const spikes = movesLeft.map(n => spikeNumber + n);
      const validSpikes = spikes.filter((spikeNum, i, self) => {
        // remove duplicates
        if (self.indexOf(spikeNum) !== i) return false;
        // Remove blocked spikes
        return spikeIsAvailable(pieces, player, spikeNum);
      });

      // Highlight the home if the player can move there
      let highlightedHome0 = false;
      if (allPiecesAreInFinalQuad(0, pieces[0])) {
        highlightedHome0 = movesLeft.some(move => (
          spikeNumber + move === 24
          )
        )
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
    const diceNumberUsed = player === 0 ?
      toSpike - pieces[player][i] :
      pieces[player][i] - toSpike;
    const indexOfMove = movesLeft.indexOf(diceNumberUsed);

    // Move the piece
    pieces[player][i] = toSpike;

    // Check if a piece has been captured
    if (capturesOpponent(pieces, player, toSpike)) {
      const indexOfPiece = pieces[1 - player].indexOf(toSpike);
      pieces[1 - player][indexOfPiece] = player === 1 ? PLAYER1_HOME : PLAYER0_HOME;
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

  handleDiceClick = () => {
    const { dice, movesLeft } = getDiceNumbers();
    this.setState({
      dice,
      movesLeft,
      needsToRoll: false
    }, () => {
      this.playersMove();
    });
  };

  startComputersTurn = (pieces: number[][]) => {
    const { dice, movesLeft } = getDiceNumbers();
    this.setState({
      myTurn: false,
      needsToRoll: false,
      pieces,
      dice,
      movesLeft,
      highlightedPiece: [-1, -1],
      highlightedSpikes: [],
      highlightedHome0: false,
      highlightedHome1: false,
    }, () => {
      this.computerMove();
    })
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
    }, 10);
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
      dice,
      movesLeft,
      myTurn,
      highlightedPiece,
      highlightedSpikes,
      highlightedHome0,
      highlightedHome1,
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
          movesLeft={movesLeft}
          highlightedHome0={highlightedHome0}
          highlightedHome1={highlightedHome1}
        />
        <RollDiceBtn handleDiceClick={this.handleDiceClick} disabled={!needsToRoll} />
        <GameStatus dice={dice} myTurn={myTurn} movesLeft={movesLeft} />
      </Container>
    );
  }
}

export default Game;

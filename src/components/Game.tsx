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
import { capturedTest } from '../helpers/testPiceArrays'
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
  highlightedSpikes: number[]
}

class Game extends React.Component<PropsI, StateI> {
  state = {
    myTurn: true,
    needsToRoll: true,
    dice: [-1, -1],
    movesLeft: [-1],
    pieces: capturedTest,
    highlightedPiece: [-1, -1],
    highlightedSpikes: [],
    message: ""
  };

  handlePieceClick = (player:number, pieceI:number) => {
    const { myTurn, needsToRoll, movesLeft, pieces } = this.state;
    const isMyChip = player === 0;
    const spikeNumber = pieces[0][pieceI];
    if (myTurn && !needsToRoll && isMyChip) {
      const spikes = movesLeft.map(n => spikeNumber + n);
      const validSpikes = spikes.filter((spikeNum, i, self) => {
        // remove duplicates
        if (self.indexOf(spikeNum) !== i) return false;
        // Remove blocked spikes
        return spikeIsAvailable(pieces, player, spikeNum);
      });
      
      this.setState({
        highlightedPiece: [0, pieceI],
        highlightedSpikes: validSpikes,
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
        highlightedSpikes: []
      }, () => {
        if (myTurn) {
          this.playersMove();
        } else {
          // Computer makes another move
          this.computerMove();
        }
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

  computerMove = () => {
    setTimeout(() => {
      const { pieces, movesLeft } = this.state
      if (!playerCanMove(pieces, 1, movesLeft)) {
        console.log("Computer can't move");
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
    }, 2000);
  }

  playersMove = () => {
    const { pieces, movesLeft } = this.state;
    if (!playerCanMove(pieces, 0, movesLeft)) {
      console.log("Player Can't move.");
    }
  }

  componentDidMount() {
    const { dice, movesLeft } = getDiceNumbers();
    this.setState({
      myTurn: false,
      needsToRoll: false,
      dice,
      movesLeft,
      highlightedPiece: [-1, -1],
      highlightedSpikes: []
    }, () => {
      this.computerMove();
    })
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
          movesLeft={movesLeft}
        />
        <RollDiceBtn handleDiceClick={this.handleDiceClick} disabled={!needsToRoll} />
        <GameStatus dice={dice} myTurn={myTurn} movesLeft={movesLeft} />
      </Container>
    );
  }
}

export default Game;

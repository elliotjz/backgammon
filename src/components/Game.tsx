import * as React from "react";
import styled from "styled-components";

import Board from "./Board";
import GameStatus from "./GameStatus";
import Button from "./Button";
import {
  getDiceNumbers,
  capturesOpponent,
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

interface Move {
  piece: number,
  toSpike: number,
}

interface PropsI {}

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

  /**
   * Handles click events on the pieces. It will either ignore the click,
   * or highlight the piece and spikes where the piece can move to.
   * @param player the player who clicked on the piece
   * @param pieceI which piece the player clicked
   */
  handlePieceClick = (player:number, pieceI:number) => {
    const { myTurn, needsToRoll, movesLeft, pieces } = this.state;
    const isMyChip = player === ME;
    if (myTurn && !needsToRoll && isMyChip) {
      // Highlight the spikes that the player can move to
      const validMoves:Move[] = getValidMoves(pieces, 0, movesLeft)
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

  /**
   * Handles spike clicks. This will move the highlighted piece to the clicked spike.
   * @param spikeNum The spike for the piece to move to
   */
  handleSpikeClick = (spikeNum: number) => {
    const { highlightedPiece } = this.state;
    this.movePiece(0, highlightedPiece[1], spikeNum);
  };

  /**
   * Moves a piece on the board
   * @param player The player who is moving
   * @param piece the piece to move
   * @param soSpike the spike to move to
   */
  movePiece = (player:number, piece:number, toSpike:number) => {
    const { pieces, movesLeft, myTurn } = this.state;
    const diceNumberUsed = player === ME ?
      toSpike - pieces[player][piece] :
      pieces[player][piece] - toSpike;
    const indexOfMove = movesLeft.indexOf(diceNumberUsed);
    // TODO: Make a call to the API to move the piece
    // TODO: The API will respond with the new board state

    // Move the piece
    let limitedToSpike = toSpike;
    if (toSpike < -1) limitedToSpike = -1;
    if (toSpike > 24) limitedToSpike = 24;
    pieces[player][piece] = limitedToSpike;

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
          this.checkPlayerCanMove();
        } else {
          // TODO: Send the Move to the socket
          this.opponentsMove();
        }
      });
    } else {
      // No more moves. Change turn
      if (myTurn) {
        this.startOpponentsTurn(pieces);
      } else {
        this.startPlayersTurn(pieces);
      }
    }
  };

  /**
   * Gets random dice numbers
   */
  rollDice = () => {
    // TODO: Get the dice from the server via socket
    const { dice, movesLeft } = getDiceNumbers();
    this.setState({
      dice,
      movesLeft,
      needsToRoll: false
    }, () => {
      const { myTurn } = this.state;
      if (myTurn) this.checkPlayerCanMove();
      else this.opponentsMove();
    });
  };

  /**
   * Sets the state to start the opponent's turn
   */
  startOpponentsTurn = (pieces: number[][]) => {
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

  /**
   * Makes an automated move. It gets all available moves an selects on at random
   */
  opponentsMove = () => {
    // TODO: Wait for websocket to send a message saying that the other player has moved.
    // TODO: The server will check whether the move is valid, and will send an updated
    // TODO: board state to the client.
    // TODO: Hand control back to the player.
    setTimeout(() => {
      const { pieces, movesLeft } = this.state;
      const validMoves = getValidMoves(pieces, 1, movesLeft);
      if (validMoves.length === 0) {
        this.startPlayersTurn(pieces);
      } else {
        const randomI = Math.floor(Math.random() * validMoves.length);
        const chosenMove:Move = validMoves[randomI];
        this.movePiece(1, chosenMove.piece, chosenMove.toSpike);
      }
    }, 1000);
  }

  /**
   * Sets the state to start the player's turn
   */
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

  /**
   * Checks whether the player can move. If it can't, it gives control to the other player
   */
  checkPlayerCanMove = () => {
    const { pieces, movesLeft } = this.state;
    if (!playerCanMove(pieces, 0, movesLeft)) {
      this.startOpponentsTurn(pieces);
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

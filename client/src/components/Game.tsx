// TODO: Change @typescript dependencies to dev-dependencies

import * as React from "react";
import * as io from 'socket.io-client';
import styled from "styled-components";

import Board from "./Board";
import GameStatus from "./GameStatus";
import Button from "./Button";
import {
  getDiceNumber,
  getDiceNumbers,
  capturesOpponent,
  playerCanMove,
  getValidMoves,
  gameIsOver,
} from '../helpers/functions'
import {
  startingState,
  capturedTest,
  allInEndQuad,
  almostFinished,
  almostFinished2
} from '../helpers/testPiceArrays'
import {
  ME_HOME,
  OPPONENT_HOME,
  ME,
  NOT_STARTED,
  INITIAL_ROLLS,
  PLAY,
  FINISHED,
} from '../helpers/constants'
import Chat from "./Chat";
import Stats from "./Stats";

const Container = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 750px 1fr;

  .board-container {
    width: 750px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: auto;
  }

  .stats-container {
    grid-column: 1 / 3;
  }

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;

    .stats-container {
      grid-column: 1 / 2;
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`

interface MoveI {
  piece: number,
  toSpike: number,
}

interface GameStateMessageI {
  myTurn: boolean,
  needsToRoll: boolean,
  dice: number[],
  movesLeft: number[],
  pieces: number[][],
}

interface ChatMessageI {
  message: string,
  player: string,
  time: number,
}

interface PropsI {}

interface StateI {
  gamePhase: number,
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
  private socket: any;
  state = {
    gamePhase: NOT_STARTED,
    myTurn: true,
    needsToRoll: true,
    dice: [-1, -1],
    movesLeft: [-1, -1],
    pieces: startingState,
    highlightedPiece: [-1, -1],
    highlightedSpikes: [],
    highlightedHome0: false,
    highlightedHome1: false,
    message: "",
  };


  /**
   * Starts a new game
   */
  startInitialRollsPhase = () => {
    this.setState({
      gamePhase: INITIAL_ROLLS,
      message: "Roll the dice to see who goes first."
    })
  }

  /**
   * Rolls the player's initial dice to decide who goes first
   */
  rollInitialDice = () => {
    console.log('SOCKET emit: roll-initial-dice');
    this.socket.emit('roll-initial-dice');
  }

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
      const validMoves:MoveI[] = getValidMoves(pieces, 0, movesLeft)
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
    this.movePiece(highlightedPiece[1], spikeNum);
  };

  /**
   * Moves a piece on the board
   * @param piece the piece to move
   * @param soSpike the spike to move to
   */
  movePiece = (piece:number, toSpike:number) => {
    console.log('SOCKET emit: move-piece');
    this.socket.emit('move-piece', { piece, toSpike });
  }

  /**
   * Gets random dice numbers
   */
  rollDice = () => {
    console.log('SOCKET emit: roll-dice');
    this.socket.emit('roll-dice');
    this.setState({
      needsToRoll: false
    });
  }

  /**
   * Temporary function to roll the dice for the opponent
   */
  opponentRollDice = () => {
    // TODO: Delete this as it will be handled by the server and other client
    const { dice, movesLeft } = getDiceNumbers();
    this.setState({
      dice,
      movesLeft,
      needsToRoll: false
    });
  }

  /**
   * Sets the state to start the opponent's turn
   */
  startOpponentsTurn = () => {
    this.setState({
      myTurn: false,
      needsToRoll: true,
      highlightedPiece: [-1, -1],
      highlightedSpikes: [],
      highlightedHome0: false,
      highlightedHome1: false,
      message: "Opponent's turn",
    });
  }

  /**
   * Sets the state to start the player's turn
   */
  startPlayersTurn = () => {
    this.setState({
      myTurn: true,
      needsToRoll: true,
      dice: [-1, -1],
      movesLeft: [-1],
      highlightedPiece: [-1, -1],
      highlightedSpikes: [],
      highlightedHome0: false,
      highlightedHome1: false,
      message: "Your move",
    })
  }

  /**
   * Checks whether the player can move. If it can't, it gives control to the other player
   */
  checkPlayerCanMove = () => {
    const { pieces, movesLeft } = this.state;
    if (!playerCanMove(pieces, 0, movesLeft)) {
      this.setState({
        message: "No valid moves. Opponent's turn"
      }, () => {
        setTimeout(() => this.startOpponentsTurn(), 2000);
      });
    }
  }

  startNewGame = () => {
    console.log('SOCKET emit: play-again');
    this.socket.emit('play-again');
  }

  componentDidMount() {
    this.socket = io.connect('/');
    const pathname = window.location.pathname;
    if (pathname === '/') {
      console.log('SOCKET emit: new-game');
      this.socket.emit('new-game');
    } else {
      const code = pathname.substring(1);
      console.log('SOCKET emit: join-game');
      this.socket.emit('join-game', code);
    }

    this.socket.on('unique-code', (code: string) => {
      const message = `Your unique URL is http://localhost:3000/${code}. Send this to your friend to start the game.`;
      this.setState({ message });
    });

    this.socket.on('error-message', (error: string) => {
      console.log('error-message');
      console.log(error);
    });

    this.socket.on('chat', (messageObj: ChatMessageI) => {
      console.log(messageObj);
    });

    this.socket.on('start-game', () => {
      console.log('start-game');
      this.startInitialRollsPhase();
    });

    this.socket.on('initial-dice', (dice: number) => {
      console.log('initial-dice');
      this.setState({
        movesLeft: [dice, -1],
      });
    });

    this.socket.on('opponent-initial-dice', (dice: number) => {
      console.log('opponent-initial-dice');
      this.setState({
        movesLeft: [-1, dice],
      });
    });

    this.socket.on('game-state', (gameState: GameStateMessageI) => {
      console.log('game-state');
      console.log(gameState);
      const finished = gameIsOver(gameState.pieces);
      console.log(`finished: ${finished}`);
      this.setState({
        ...gameState,
        gamePhase: finished ? FINISHED : PLAY,
        highlightedPiece: [-1, -1],
        highlightedSpikes: [],
        highlightedHome0: false,
        highlightedHome1: false,
      })
    });

    this.socket.on('play-again', () => {
      this.setState({
        gamePhase: INITIAL_ROLLS,
        message: "Roll the dice to see who goes first.",
        pieces: startingState,
      });
    });
  }

  render() {
    const {
      gamePhase,
      pieces,
      movesLeft,
      myTurn,
      highlightedPiece,
      highlightedSpikes,
      highlightedHome0,
      highlightedHome1,
      needsToRoll,
      message,
    } = this.state;
    const rollDiceBtnDisabled = !myTurn || !needsToRoll;
    return (
      <Container>
        <div className="board-container">
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
          <GameStatus message={message} />
          <ButtonContainer>
            {gamePhase === NOT_STARTED && null}
            {gamePhase === INITIAL_ROLLS && (
              <Button handleClick={this.rollInitialDice} disabled={false} text="Roll Dice" />
            )}
            {gamePhase === PLAY && (
              <Button handleClick={this.rollDice} disabled={rollDiceBtnDisabled} text="Roll Dice" />
            )}
            {gamePhase === FINISHED && (
              <Button handleClick={this.startNewGame} disabled={false} text="Start New Game" />
            )}
          </ButtonContainer>
        </div>
        <div className="chat-container">
          <Chat />
        </div>
        <div className="stats-container">
          <Stats />
        </div>
      </Container>
    );
  }
}

export default Game;

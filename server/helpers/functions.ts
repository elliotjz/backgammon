import { PLAYER_0_HOME, PLAYER_1_HOME } from './constants'
import { MoveI, GameI, GameStateMessageI } from './interfaces';

const allPiecesAreInFinalQuad = (player: number, pieces: number[]) => {
  if (player === 0) return pieces.every(p => p > 17);
  else return pieces.every(p => p < 6);
}

/**
 * Represents a dice numbers object
 * Contains the dice rolled, and the moves that are left for the turn
 */
interface DiceNumbers {
  dice: number[],
  movesLeft: number[]
}

/**
 * Represents a move that the player could make.
 * piece is the piece that the player wants to move.
 * toSpike is the spike that the player wants to move to.
 */
interface Move {
  piece: number,
  toSpike: number,
}

/**
 * Gets a random number between 1 and 6
 * @returns A random number
 */
const getDiceNumber = () => {
  return Math.ceil(Math.random() * 6);
};

/**
 * Creates two random dice numbers.
 * @returns an object containing the dice rolled and the moves available
 */
const getDiceNumbers = ():DiceNumbers => {
  // TODO: Make a call to the API to get the dice numbers instead of calculating on the client
  const num1:number = getDiceNumber();
  const num2:number = getDiceNumber();

  let movesLeft = num1 === num2 ? [num1, num1, num1, num1] : [num1, num2]
  return {
    dice: [num1, num2],
    movesLeft
  }
}

/**
 * Determines how many opponent pieces are on a spike
 * @param pieces 2D array containing the state of the pieces
 * @param player The player who is calling the function
 * @param spikeNum The spike in question
 * @returns The number of opponents on that spike
 */
const opponentsOnSpike = (pieces:number[][], player:number, spikeNum:number):number => {
  if (spikeNum < 0 || spikeNum > 23) return 0;
  return pieces[1 - player].reduce((sum, piece) => (
    piece === spikeNum ? sum + 1 : sum
  ), 0);
}

/**
 * Determines whether moving to a given spike will capture an opponent
 * @param pieces 2D array containing the state of the pieces
 * @param player The player who is calling the function
 * @param spikeNum The spike in question
 * @returns A boolean indicating whether moving to that spike will capture an opponent
 */
const capturesOpponent = (pieces:number[][], player:number, spikeNum:number):boolean => {
  if (spikeNum < 0 || spikeNum > 23) return false;
  const opp = opponentsOnSpike(pieces, player, spikeNum);
  return opp === 1;
}

/**
 * Determines whether a player is currently captured
 * @param pieces 2D array containing the state of the pieces
 * @param player The player who is calling the function
 * @returns A boolean representing whether the player is captured
 */
const playerIsCaptured = (pieces:number[][], player: number) => {
  const capturedIndex = player === 0 ? PLAYER_1_HOME : PLAYER_0_HOME;
  return pieces[player].indexOf(capturedIndex) !== -1;
}

/**
 * Calculates whether a given move is valid
 * @param pieces 2D array containing the state of the pieces
 * @param player The player who is calling the function
 * @param move The move in question
 * @returns A boolean indicating whether the move is valid
 */
const moveIsValid = (pieces:number[][], player:number, move:Move):boolean => {
  const home = player === 0 ? PLAYER_0_HOME : PLAYER_1_HOME;
  const capturedIndex = player === 0 ? PLAYER_1_HOME : PLAYER_0_HOME;

  // Player can't move pieces from home
  if (pieces[player][move.piece] === home) return false;
  
  // If player is captured, they have to move the captured piece
  if (playerIsCaptured(pieces, player)) {
    if (pieces[player][move.piece] !== capturedIndex) return false;
  }

  // Player can't move home if pieces are outside the final quad
  const finalQuad = allPiecesAreInFinalQuad(player, pieces[player]);
  const moveGoesToHome = (player === 0 && move.toSpike >= home) ||
        (player === 1 && move.toSpike <= home); 
  if (moveGoesToHome && !finalQuad)
    return false;
  
  // Player can only move home using a number that is too large if all
  // pieces are in the final quad and the piece is the furthest away from home
  const toSpikeIsPastHome = (player === 0 && move.toSpike > PLAYER_0_HOME) ||
        (player === 1 && move.toSpike < PLAYER_1_HOME);
  if (finalQuad && toSpikeIsPastHome) {
    const pieceSpike = pieces[player][move.piece];
    let pieceIsFurthestFromHome = true;
    pieces[player].forEach((p: number) => {
      if ((player === 0 && p < pieceSpike) || (player === 1 && p > pieceSpike))
        pieceIsFurthestFromHome = false;
    });

    return pieceIsFurthestFromHome;
  }

  const res = opponentsOnSpike(pieces, player, move.toSpike) < 2;
  return res;
}

/**
 * Calculates an array of valid moves
 * @param pieces 2D array containing the state of the pieces
 * @param player The player who is calling the function
 * @param movesLeft Array of moves that the player has available
 * @returns An array of legal moves
 */
const getValidMoves = (pieces:number[][], player:number, movesLeft:number[]): Move[] => {
  const uniqueMovesLeft = movesLeft.filter((move, i, self) => self.indexOf(move) === i);
  const options:Move[] = [];
  pieces[player].forEach((pieceSpike, i) => {
    uniqueMovesLeft.forEach(move => {
      const toSpike = player === 0 ? pieceSpike + move : pieceSpike - move;
      const moveOption:Move = { piece: i, toSpike };
      if (moveIsValid(pieces, player, moveOption)) {
        options.push(moveOption);
      }
    })
  });
  return options;
}

/**
 * Calculates whether the player can move
 * @param pieces 2D array containing the state of the pieces
 * @param player The player who is calling the function
 * @param movesLeft Array of moves that the player has available
 * @returns A boolean representing whether the player can move or not
 */
const playerCanMove = (pieces:number[][], player:number, movesLeft:number[]):boolean => {
  return getValidMoves(pieces, player, movesLeft).length > 0;
}

const getUniqueCode = () => {
  let randString = '';
  const characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const len = characters.length;
  for (let i = 0; i < 10; i++) {
    randString += characters.charAt(Math.floor(Math.random() * len));
  }
  return randString;
}

const map = [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1];

const convertToPlayer1Pieces = (pieces: number[][]):number[][] => {
  const newPieces:number[][] = [[], []];
  pieces[1].forEach(spike => newPieces[0].unshift(map[spike + 1]));
  pieces[0].forEach(spike => newPieces[1].unshift(map[spike + 1]));
  return newPieces;
}

const convertToPlayer1Move = (m: MoveI):MoveI => {
  const piece = 14 - m.piece;
  const toSpike = map[m.toSpike + 1]
  return { piece, toSpike };
}

const gameIsOver = (pieces:number[][]) => {
  const piecesNotHome0 = pieces[0].filter(((p) => p !== PLAYER_0_HOME));
  const piecesNotHome1 = pieces[1].filter(((p) => p !== PLAYER_1_HOME));
  return piecesNotHome0.length === 0 || piecesNotHome1.length === 0;
}

const gameStateToMessage = (game: GameI, player: number, message:string):GameStateMessageI => {
  const { pieces } = game.gameState;
  return player === 0 ? {
    myTurn: game.gameState.player0Turn,
    needsToRoll: game.gameState.needsToRoll,
    dice: game.gameState.dice,
    movesLeft: game.gameState.movesLeft,
    pieces: pieces,
    message,
  } : {
    myTurn: !game.gameState.player0Turn,
    needsToRoll: game.gameState.needsToRoll,
    dice: game.gameState.dice,
    movesLeft: game.gameState.movesLeft,
    pieces: convertToPlayer1Pieces(game.gameState.pieces),
    message,
  }
}

export {
  getDiceNumber,
  getDiceNumbers,
  capturesOpponent,
  playerCanMove,
  getValidMoves,
  getUniqueCode,
  moveIsValid,
  convertToPlayer1Pieces,
  convertToPlayer1Move,
  gameIsOver,
  gameStateToMessage,
}

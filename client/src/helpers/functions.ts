import { ME_HOME, OPPONENT_HOME, ME, OPPONENT } from './constants'

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
  const capturedIndex = player === ME ? OPPONENT_HOME : ME_HOME;
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
  const home = player === ME ? ME_HOME : OPPONENT_HOME;
  const capturedIndex = player === ME ? OPPONENT_HOME : ME_HOME;

  // Player can't move pieces from home
  if (pieces[player][move.piece] === home) return false;
  
  // If player is captured, they have to move the captured piece
  if (playerIsCaptured(pieces, player)) {
    if (pieces[player][move.piece] !== capturedIndex) return false;
  }

  // Player can't move home if pieces are outside the final quad
  const finalQuad = allPiecesAreInFinalQuad(player, pieces[player]);
  const moveGoesToHome = (player === ME && move.toSpike >= home) ||
        (player === OPPONENT && move.toSpike <= home); 
  if (moveGoesToHome && !finalQuad)
    return false;
  
  // Player can only move home using a number that is too large if all
  // pieces are in the final quad and the piece is the furthest away from home
  const toSpikeIsPastHome = (player === ME && move.toSpike > ME_HOME) ||
        (player === OPPONENT && move.toSpike < OPPONENT_HOME);
  if (finalQuad && toSpikeIsPastHome) {
    const pieceSpike = pieces[player][move.piece];
    let pieceIsFurthestFromHome = true;
    pieces[player].forEach((p: number) => {
      if ((player === ME && p < pieceSpike) || (player === OPPONENT && p > pieceSpike))
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
      const toSpike = player === ME ? pieceSpike + move : pieceSpike - move;
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

const gameIsOver = (pieces: number[][]) => {
  const piecesNotHome0 = pieces[0].filter(((p) => p !== ME_HOME));
  const piecesNotHome1 = pieces[1].filter(((p) => p !== OPPONENT_HOME));
  return piecesNotHome0.length === 0 || piecesNotHome1.length === 0;
}

export {
  getDiceNumber,
  getDiceNumbers,
  capturesOpponent,
  playerCanMove,
  getValidMoves,
  gameIsOver,
}

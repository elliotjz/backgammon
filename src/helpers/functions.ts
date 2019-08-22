import { ME_HOME, OPPONENT_HOME, ME, OPPONENT } from './constants'

const allPiecesAreInFinalQuad = (player: number, pieces: number[]) => {
  if (player === 0) return pieces.every(p => p > 17);
  else return pieces.every(p => p < 6);
}

interface DiceNumbersI {
  dice: number[],
  movesLeft: number[]
}

interface MoveOption {
  piece: number,
  toSpike: number,
}

const getDiceNumbers = ():DiceNumbersI => {
  const getDiceNum = () => {
    return Math.ceil(Math.random() * 6);
  };
  
  const num1:number = getDiceNum();
  const num2:number = getDiceNum();

  let movesLeft = num1 === num2 ? [num1, num1, num1, num1] : [num1, num2]
  return {
    dice: [num1, num2],
    movesLeft
  }
}

/*
 * Determines how many opponent pieces are on a spike
 */
const opponentsOnSpike = (pieces:number[][], player:number, spikeNum:number):number => {
  if (spikeNum < 0 || spikeNum > 23) return 0;
  return pieces[1 - player].reduce((sum, piece) => (
    piece === spikeNum ? sum + 1 : sum
  ), 0);
}

/*
 * Determines whether moving to a given spike will capture an opponent
 */
const capturesOpponent = (pieces:number[][], player:number, spikeNum:number):boolean => {
  if (spikeNum < 0 || spikeNum > 23) return false;
  const opp = opponentsOnSpike(pieces, player, spikeNum);
  return opp === 1;
}

/*
 * Determines whether a given spike is available to move to
 */
const spikeIsAvailable = (pieces:number[][], player:number, spikeNum:number):boolean => {
  if (spikeNum < 0 || spikeNum > 23) return false;
  const opp = opponentsOnSpike(pieces, player, spikeNum);
  return opp < 2;
}

const playerIsCaptured = (pieces:number[][], player: number) => {
  const capturedIndex = player === ME ? OPPONENT_HOME : ME_HOME;
  return pieces[player].indexOf(capturedIndex) !== -1;
}

/*
 * Calculates whether a given move is valid
 */
const moveIsValid = (pieces:number[][], player:number, move:MoveOption):boolean => {
  if (move.toSpike < -1 || move.toSpike > 24) return false;
  if (playerIsCaptured(pieces, player)) {
    const capturedIndex = player === ME ? OPPONENT_HOME : ME_HOME;
    if (pieces[player][move.piece] !== capturedIndex) return false;
  }
  const res = opponentsOnSpike(pieces, player, move.toSpike) < 2;
  return res;
}

/*
 * Returns an array of valid moves.
 */
const getValidMoves = (pieces:number[][], player:number, movesLeft:number[]): MoveOption[] => {
  const uniqueMovesLeft = movesLeft.filter((move, i, self) => self.indexOf(move) === i);
  const options:MoveOption[] = [];
  pieces[player].forEach((pieceSpike, i) => {
    uniqueMovesLeft.forEach(move => {
      const toSpike = player === ME ? pieceSpike + move : pieceSpike - move;
      const moveOption:MoveOption = { piece: i, toSpike };
      if (moveIsValid(pieces, player, moveOption)) {
        options.push(moveOption);
      }
    })
  });
  return options;
}

/*
 * Calculates whether a player has valid moves
 */
const playerCanMove = (pieces:number[][], player:number, movesLeft:number[]):boolean => {
  return getValidMoves(pieces, player, movesLeft).length > 0;
}

export {
  allPiecesAreInFinalQuad,
  getDiceNumbers,
  opponentsOnSpike,
  capturesOpponent,
  spikeIsAvailable,
  getValidMoves,
  playerIsCaptured,
  playerCanMove
}

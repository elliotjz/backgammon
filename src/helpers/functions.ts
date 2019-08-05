import { PLAYER0_HOME, PLAYER1_HOME } from './constants'

const allPiecesAreInFinalQuad = (player: number, pieces: number[]) => {
  if (player === 0) return pieces.every(p => p > 17);
  else return pieces.every(p => p < 6);
}

interface DiceNumbersI {
  dice: number[],
  movesLeft: number[]
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

const playerCanMove = (pieces:number[][], player:number, movesLeft:number[]):boolean => {
  let piecesAvailableToMove:number[] = [];
  const capturedIndex = player === 1 ? PLAYER0_HOME : PLAYER1_HOME;
  if (pieces[player].indexOf(capturedIndex) === -1) {
    // Player doesn't have captured pieces
    piecesAvailableToMove = pieces[player];
  } else {
    // There is a captured piece, so the player must move it
    piecesAvailableToMove = [capturedIndex];
  }
  let canMove = false;
  piecesAvailableToMove.forEach(piece => {
    movesLeft.forEach(moveOption => {
      const targetSpike = player === 1 ? piece - moveOption : piece + moveOption;
      if (spikeIsAvailable(pieces, player, targetSpike)) {
        canMove = true;
      }
    })
  })
  console.log(canMove);
  return canMove;
}

export { allPiecesAreInFinalQuad, getDiceNumbers, opponentsOnSpike, capturesOpponent, spikeIsAvailable, playerCanMove }



const allPiecesAreInFinalQuad = (player: number, pieces: number[]) => {
  if (player === 0) return pieces.every(p => p > 17);
  else return pieces.every(p => p < 6);
}

interface DiceNumbersI {
  dice: number[],
  movesLeft: number[]
}

function getDiceNumbers():DiceNumbersI {
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

export { allPiecesAreInFinalQuad, getDiceNumbers }
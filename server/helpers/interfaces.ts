interface GameStateI {
  gamePhase: number,
  player0Turn: boolean,
  needsToRoll: boolean,
  initialDice0: number,
  initialDice1: number,
  dice: number[],
  movesLeft: number[],
  pieces: number[][],
}

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

interface GameI {
  player0Id: string,
  player1Id: string,
  uniqueCode: string,
  gameState: GameStateI,
}

export { MoveI, GameStateI, GameStateMessageI, GameI };
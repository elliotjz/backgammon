
interface StatsGameStateI {
  gamePhase: number,
  player0Turn: boolean,
  needsToRoll: boolean,
  initialDice0: number,
  initialDice1: number,
  dice: number[],
  movesLeft: number[],
  pieces: number[][],
}

interface StatsGameI {
  player0Id: string,
  player1Id: string,
  name0: string,
  name1: string,
  uniqueCode0: string,
  uniqueCode1: string,
  gameState: StatsGameStateI,
}

interface ChatMessageI {
  message: string,
  me: boolean,
  date: number,
}

export { StatsGameStateI, StatsGameI, ChatMessageI }

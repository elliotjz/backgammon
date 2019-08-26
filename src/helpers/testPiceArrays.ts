/**
 * testPieceArrays.ts
 * Contains arrays of pieces to use for testing certain conditions without
 * needing to play whole games.
 */

const startingState:number[][] = [
  [0, 0, 11, 11, 11, 11, 11, 16, 16, 16, 18, 18, 18, 18, 18],
  [5, 5, 5, 5, 5, 7, 7, 7, 12, 12, 12, 12, 12, 23, 23]
];

const capturedTest:number[][] = [
  [23, 23, 22, 22, 21, 21, 20, 20, 17, 17, 17, 17, 1, 2, 3],
  [5, 5, 5, 5, 5, 7, 7, 7, 12, 12, 12, 12, 12, 24, 24]
];

const allInEndQuad:number[][] = [
  [23, 23, 22, 22, 21, 21, 20, 20, 19, 19, 19, 19, 19, 19, 19],
  [5, 5, 5, 5, 5, 7, 7, 7, 12, 12, 12, 12, 12, 24, 24]
];

const almostFinished:number[][] = [
  [23, 23, 22, 22, 21, 21, 20, 20, 19, 19, 19, 19, 19, 19, 19],
  [5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3]
]

const almostFinished2:number[][] = [
  [23, 22, 21, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24],
  [-1, -1, -1, -1, -1, -1, -1, 0, 0, -1, -1, -1, -1, -1, -1]
]

export { startingState, capturedTest, allInEndQuad, almostFinished, almostFinished2 }

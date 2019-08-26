import * as React from "react";

import Piece from "./Piece";

const iToX = (i: number): number => {
  if (i < 6) {
    return 642 - i * 50;
  } else if (i < 12) {
    return 58 - 50 * (i - 11);
  } else if (i < 18) {
    return 58 + 50 * (i - 12);
  } else {
    return 392 + 50 * (i - 18);
  }
};

const getYs = (pieces: number[][]):number[][] => {
  // Create array of zeros
  const spikeCount: number[] = [];
  for (let i = 0; i < 26; i++) spikeCount.push(0);

  // Create array to hold Y positions
  const ys = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

  // Calculate Y position for each piece
  pieces.forEach((playerPieces, playerNum) => {
    playerPieces.forEach((spikeNum, i) => {
      const numOnSpike = spikeCount[spikeNum + 1];
      ys[playerNum][i] = spikeNum < 12 ? 50 + 30 * numOnSpike : 450 - 30 * numOnSpike;
      spikeCount[spikeNum + 1]++;
    });
  });

  // Squash pieces if necessary
  spikeCount.forEach((piecesOnSpike, i) => {
    if (piecesOnSpike > 5) {
      const targetSpikeNum = i - 1;
      const dy = 30 * 5 / piecesOnSpike;
      let count = 0;
      pieces.forEach((playerPieces, playerNum) => {
        playerPieces.forEach((spikeNum, j) => {
          if (spikeNum === targetSpikeNum) {
            ys[playerNum][j] = spikeNum < 12 ? 50 + dy * count : 450 - dy * count;
            count++;
          }
        });
      });
    }
  })

  return ys;
}

interface Props {
  pieces: number[][],
  handlePieceClick(player: number, pieceNumber: number): void,
  highlightedPiece: number[]
}

/**
 * Renders all of the pieces on the board
 */
const Pieces: React.FunctionComponent<Props> = ({
  pieces,
  handlePieceClick,
  highlightedPiece
}:Props) => {
  const pieceYPositions = getYs(pieces);
  return (
    <g>
      {pieces.map((playerPieces: number[], player: number) => {
        return (
          playerPieces.map((spikeNumber: number, i: number) => {
            const highlighted: boolean =
              highlightedPiece[0] === player &&
              highlightedPiece[1] === i;
            return (
              <Piece
                onClick={() => handlePieceClick(player, i)}
                key={i}
                player={player}
                x={iToX(spikeNumber)}
                y={pieceYPositions[player][i]}
                highlighted={highlighted}
              />
            );
          })
        )
      }
      )}
    </g>
  );
};

export default Pieces;

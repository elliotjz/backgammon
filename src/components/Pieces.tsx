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

const iToY = (spikeNumber: number, i: number): number => {
  if (spikeNumber < 12) {
    return 50 + i * 5;
  } else {
    return 450 - i * 8;
  }
};

interface Props {
  pieces: number[][],
  handlePieceClick(player: number, pieceNumber: number): void,
  highlightedPiece: number[]
}

const Pieces: React.FunctionComponent<Props> = ({
  pieces,
  handlePieceClick,
  highlightedPiece
}:Props) => {
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
                y={iToY(spikeNumber, i)}
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

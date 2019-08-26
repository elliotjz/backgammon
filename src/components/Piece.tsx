import * as React from "react";
import styled from "styled-components";

const G = styled.g`
  transition: all 0.8s ease-in-out;
  -webkit-transition: all 0.8s ease-in-out;
  -moz-transition: all 0.8s ease-in-out;
  border: black solid 3px;

  .greenInner {
    fill: ${props => props.theme.colors.greenPiece1}
  }

  .greenOuter {
    fill: ${props => props.theme.colors.greenPiece2}
  }

  .redInner {
    fill: ${props => props.theme.colors.redPiece1}
  }

  .redOuter {
    fill: ${props => props.theme.colors.redPiece2}
  }
`;

const Highlight = styled.circle`
  fill: ${props => `${props.theme.colors.highlight}88`};
`

interface Props {
  onClick(): void,
  player: number,
  x: number,
  y: number,
  highlighted: boolean
}

/**
 * Renders an SVG piece on the board
 */
const Piece: React.FunctionComponent<Props> = ({
  onClick,
  player, 
  x,
  y,
  highlighted
}: Props) => {
  const class1 = player === 1 ? "redInner" : "greenInner";
  const class2 = player === 1 ? "redOuter" : "greenOuter";
  return (
    <G transform={`translate(${x},${y})`} onClick={onClick}>
      <circle dx="0" dy="0" r="20" className={class1} />
      <circle dx="0" dy="0" r="16" className={class2} />
      {highlighted && (
        <Highlight dx="0" dy="0" r="25" />
      )}
    </G>
  );
};

export default Piece;

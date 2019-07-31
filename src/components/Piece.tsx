import * as React from "react";
import styled from "styled-components";

const G = styled.g`
  transition: all 0.8s ease-in-out;
  -webkit-transition: all 0.8s ease-in-out;
  -moz-transition: all 0.8s ease-in-out;
  border: black solid 3px;
`;

interface Props {
  onClick(): void,
  player: number,
  x: number,
  y: number,
  highlighted: boolean
}
const Piece: React.FunctionComponent<Props> = ({
  onClick,
  player, 
  x,
  y,
  highlighted
}: Props) => {
  const fill1 = player === 1 ? "#7a110a" : "#09660c";
  const fill2 = player === 1 ? "#9c170e" : "#0c8210";
  return (
    <G transform={`translate(${x},${y})`} onClick={onClick}>
      <circle dx="0" dy="0" r="20" style={{ fill: fill1 }} />
      <circle dx="0" dy="0" r="16" style={{ fill: fill2 }} />
      {highlighted && (
        <circle dx="0" dy="0" r="25" style={{ fill: "#f6ff4daa" }} />
      )}
    </G>
  );
};

export default Piece;

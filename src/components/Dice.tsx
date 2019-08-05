import * as React from 'react';
import styled from 'styled-components'

const G = styled.g`
  transform: translate(5px, 5px);
`

const Rect = styled.rect`
  height: 60px;
  width: 60px;
  rx: 10px;
  ry: 10px;
  fill: #ffffff;
  stroke-width: 5;
  stroke: rgb(0,0,0);
`

interface Props {
  number: number,
}

const Dice: React.FunctionComponent<Props>  = ({
  number
}:Props) => {
  let dotLocations: number[][] = [];
  if (number === 1) {
    dotLocations = [[30, 30]];
  } else if (number === 2) {
    dotLocations = [[20, 20], [40, 40]];
  } else if (number === 3) {
    dotLocations = [[20, 20], [30, 30], [40, 40]];
  } else if (number === 4) {
    dotLocations = [[20, 20], [20, 40], [40, 20], [40, 40]];
  } else if (number === 5) {
    dotLocations = [[20, 20], [20, 40], [40, 20], [40, 40], [30, 30]];
  } else if (number === 6) {
    dotLocations = [[20, 20], [20, 40], [40, 20], [40, 40], [20, 30], [40, 30]];
  }

  if (number <= 0) return null;

  return (
    <G>
      <Rect />
      {dotLocations.map((loc, i) => (
        <circle key={i} cx={loc[0]} cy={loc[1]} r="5" />
      ))}
    </G>
  );
};

export default Dice;
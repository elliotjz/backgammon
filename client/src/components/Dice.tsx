import * as React from 'react';
import styled from 'styled-components'

const G = styled.g`
  transform: translate(5px, 5px);

  rect {
    fill: ${props => props.theme.colors.white};
    stroke: ${props => props.theme.colors.black};
  }

  circle {
    fill: ${props => props.theme.colors.black};
    stroke: ${props => props.theme.colors.black};
  }
`

interface Props {
  number: number,
}

/**
 * Renders SVG dice to the board
 */
const Dice: React.FunctionComponent<Props>  = ({
  number
}:Props) => {
  let dotLocations: number[][] = [];
  if (number === 1) {
    dotLocations = [[25, 25]];
  } else if (number === 2) {
    dotLocations = [[13, 13], [37, 37]];
  } else if (number === 3) {
    dotLocations = [[13, 13], [25, 25], [37, 37]];
  } else if (number === 4) {
    dotLocations = [[13, 13], [13, 37], [37, 13], [37, 37]];
  } else if (number === 5) {
    dotLocations = [[13, 13], [13, 37], [37, 13], [37, 37], [25, 25]];
  } else if (number === 6) {
    dotLocations = [[13, 13], [13, 37], [37, 13], [37, 37], [13, 25], [37, 25]];
  }

  if (number <= 0) return null;

  return (
    <G>
      <rect height="50" width="50" rx="10" ry="10" strokeWidth="5" />
      {dotLocations.map((loc, i) => (
        <circle key={i} cx={loc[0]} cy={loc[1]} r="5" />
      ))}
    </G>
  );
};

export default Dice;
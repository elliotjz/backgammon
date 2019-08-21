import * as React from 'react';
import styled from 'styled-components';

interface Props {
  highlightedHome0: boolean,
  highlightedHome1: boolean,
  onClick(spikeNumber: number): void,
}

const Rect = styled.rect`
  fill: ${props => `${props.theme.colors.highlight}bb`};
  height: 150px;
  width: 20px;
`

const HighlightedHomes: React.FunctionComponent<Props> = ({
  highlightedHome0,
  highlightedHome1,
  onClick
}: Props) => {
  return (
    <g>
      {highlightedHome0 && (
        <g transform="translate(675, 320)" onClick={() => onClick(24)}>
          <Rect />
        </g>
      )}
      {highlightedHome1 && (
        <g transform="translate(675, 30)" onClick={() => onClick(0)}>
          <Rect />
        </g>
      )}
    </g>
  );
};

export default HighlightedHomes;
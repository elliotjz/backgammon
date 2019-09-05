import * as React from 'react';
import styled from 'styled-components';

interface Props {
  highlightedHome0: boolean,
  highlightedHome1: boolean,
  onClick(spikeNumber: number): void,
}

const Rect = styled.rect`
  fill: ${props => `${props.theme.colors.highlight}bb`};
`

/**
 * Renders highlights for the home zones when the player can move there
 */
const HighlightedHomes: React.FunctionComponent<Props> = ({
  highlightedHome0,
  highlightedHome1,
  onClick
}: Props) => {
  return (
    <g>
      {highlightedHome0 && (
        <g className="HOME" onClick={() => onClick(24)}>
          <Rect height="150" width="20" x="675" y="320" />
        </g>
      )}
      {highlightedHome1 && (
        <g onClick={() => onClick(0)}>
          <Rect height="150" width="20" x="675" y="30" />
        </g>
      )}
    </g>
  );
};

export default HighlightedHomes;
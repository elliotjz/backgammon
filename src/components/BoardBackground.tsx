import * as React from "react";
import styled from 'styled-components'

const GameArea = styled.g`
  fill: ${props => props.theme.colors.darkBrown};
`

const BoardSide = styled.g`
  fill: ${props => props.theme.colors.lightBrown};
`

const BlackSpike = styled.g`
  fill: ${props => props.theme.colors.black};
  stroke: ${props => props.theme.colors.black};;
`

const WhiteSpike = styled.g`
  fill: ${props => props.theme.colors.white};;
  stroke: ${props => props.theme.colors.white};;
`

/**
 * Renders the static background of the board.
 */
const BoardBackground = () => {
  return (
    <GameArea>
      <rect x="0" y="0" width="700" height="500" />
      <BoardSide transform="translate(30,30)">
        <rect x="0" y="0" width="305" height="440" />
        <g className="points" transform="translate(8,440)">
          <WhiteSpike transform="translate(0, 0)">
            <polygon points="0,0 40,0 20,-150" />
            <circle cx="20" cy="-160" r="2" />
          </WhiteSpike>
          <BlackSpike transform="translate(50, 0)">
            <polygon points="0,0 40,0 20,-150" />
            <circle cx="20" cy="-160" r="2" />
          </BlackSpike>
          <WhiteSpike transform="translate(100, 0)">
            <polygon points="0,0 40,0 20,-150" />
            <circle cx="20" cy="-160" r="2" />
          </WhiteSpike>
          <BlackSpike transform="translate(150, 0)">
            <polygon points="0,0 40,0 20,-150" />
            <circle cx="20" cy="-160" r="2" />
          </BlackSpike>
          <WhiteSpike transform="translate(200, 0)">
            <polygon points="0,0 40,0 20,-150" />
            <circle cx="20" cy="-160" r="2" />
          </WhiteSpike>
          <BlackSpike transform="translate(250, 0)">
            <polygon points="0,0 40,0 20,-150" />
            <circle cx="20" cy="-160" r="2" />
          </BlackSpike>
        </g>
        <g className="points" transform="translate(8,0)">
          <BlackSpike transform="translate(0, 0)">
            <polygon points="0,0 40,0 20,150" />
            <circle cx="20" cy="160" r="2" />
          </BlackSpike>
          <WhiteSpike transform="translate(50, 0)">
            <polygon points="0,0 40,0 20,150" />
            <circle cx="20" cy="160" r="2" />
          </WhiteSpike>
          <BlackSpike transform="translate(100, 0)">
            <polygon points="0,0 40,0 20,150" />
            <circle cx="20" cy="160" r="2" />
          </BlackSpike>
          <WhiteSpike transform="translate(150, 0)">
            <polygon points="0,0 40,0 20,150" />
            <circle cx="20" cy="160" r="2" />
          </WhiteSpike>
          <BlackSpike transform="translate(200, 0)">
            <polygon points="0,0 40,0 20,150" />
            <circle cx="20" cy="160" r="2" />
          </BlackSpike>
          <WhiteSpike transform="translate(250, 0)">
            <polygon points="0,0 40,0 20,150" />
            <circle cx="20" cy="160" r="2" />
          </WhiteSpike>
        </g>
      </BoardSide>
      <BoardSide transform="translate(365,30)">
        <rect x="0" y="0" width="305" height="440" />
        <g className="points" transform="translate(8,440)">
          <WhiteSpike transform="translate(0, 0)">
            <polygon points="0,0 40,0 20,-150" />
            <circle cx="20" cy="-160" r="2" />
          </WhiteSpike>
          <BlackSpike transform="translate(50, 0)">
            <polygon points="0,0 40,0 20,-150" />
            <circle cx="20" cy="-160" r="2" />
          </BlackSpike>
          <WhiteSpike transform="translate(100, 0)">
            <polygon points="0,0 40,0 20,-150" />
            <circle cx="20" cy="-160" r="2" />
          </WhiteSpike>
          <BlackSpike transform="translate(150, 0)">
            <polygon points="0,0 40,0 20,-150" />
            <circle cx="20" cy="-160" r="2" />
          </BlackSpike>
          <WhiteSpike transform="translate(200, 0)">
            <polygon points="0,0 40,0 20,-150" />
            <circle cx="20" cy="-160" r="2" />
          </WhiteSpike>
          <BlackSpike transform="translate(250, 0)">
            <polygon points="0,0 40,0 20,-150" />
            <circle cx="20" cy="-160" r="2" />
          </BlackSpike>
        </g>
        <g className="points" transform="translate(8,0)">
          <BlackSpike transform="translate(0, 0)">
            <polygon points="0,0 40,0 20,150" />
            <circle cx="20" cy="160" r="2" />
          </BlackSpike>
          <WhiteSpike transform="translate(50, 0)">
            <polygon points="0,0 40,0 20,150" />
            <circle cx="20" cy="160" r="2" />
          </WhiteSpike>
          <BlackSpike transform="translate(100, 0)">
            <polygon points="0,0 40,0 20,150" />
            <circle cx="20" cy="160" r="2" />
          </BlackSpike>
          <WhiteSpike transform="translate(150, 0)">
            <polygon points="0,0 40,0 20,150" />
            <circle cx="20" cy="160" r="2" />
          </WhiteSpike>
          <BlackSpike transform="translate(200, 0)">
            <polygon points="0,0 40,0 20,150" />
            <circle cx="20" cy="160" r="2" />
          </BlackSpike>
          <WhiteSpike transform="translate(250, 0)">
            <polygon points="0,0 40,0 20,150" />
            <circle cx="20" cy="160" r="2" />
          </WhiteSpike>
        </g>
      </BoardSide>
    </GameArea>
  );
};

export default BoardBackground;

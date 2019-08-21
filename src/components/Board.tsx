import * as React from "react";
import styled from 'styled-components'

const SVGBoard = styled.svg`
  display: block;
  width: 700px;
  height: 500px;
  margin: 20px auto;
`

import BoardBackground from "./BoardBackground";
import HighlightedSpikes from "./HighlightedSpikes";
import Pieces from "./Pieces";
import AllDice from "./AllDice";
import HighlightedHomes from "./HighlightedHomes";

interface Props {
  pieces: number[][],
  handlePieceClick(player:number, pieceI:number): void,
  handleSpikeClick(spikeNum: number): void,
  highlightedPiece: number[],
  highlightedSpikes: number[],
  highlightedHome0: boolean,
  highlightedHome1: boolean,
  movesLeft: number[]
}

const Board:React.FunctionComponent<Props> = ({
  pieces,
  handlePieceClick,
  handleSpikeClick,
  highlightedPiece,
  highlightedSpikes,
  highlightedHome0,
  highlightedHome1,
  movesLeft
}: Props ) => (
  <SVGBoard>
    <BoardBackground />
    <HighlightedSpikes
      highlightedSpikes={highlightedSpikes}
      onClick={handleSpikeClick}
    />
    <Pieces
      pieces={pieces}
      handlePieceClick={handlePieceClick}
      highlightedPiece={highlightedPiece}
    />
    <AllDice movesLeft={movesLeft}/>
    <HighlightedHomes
      highlightedHome0={highlightedHome0}
      highlightedHome1={highlightedHome1}
      onClick={handleSpikeClick}
    />
  </SVGBoard>
)

export default Board;

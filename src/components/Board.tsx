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

interface Props {
  pieces: number[][],
  handlePieceClick(player:number, pieceI:number): void,
  handleSpikeClick(spikeNum: number): void,
  highlightedPiece: number[],
  highlightedSpikes: number[],
  movesLeft: number[]
}

const Board:React.FunctionComponent<Props> = ({
  pieces,
  handlePieceClick,
  handleSpikeClick,
  highlightedPiece,
  highlightedSpikes,
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
  </SVGBoard>
)

export default Board;

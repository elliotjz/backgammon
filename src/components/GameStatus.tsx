import * as React from "react";
import styled from "styled-components";

const Container = styled.div`
  text-align: center;
  padding: 10px 0;
`;

interface Props {
  dice: number[],
  movesLeft: number[],
  myTurn: boolean
}

const GameStatus: React.FunctionComponent<Props> = ({
  dice,
  movesLeft,
  myTurn
}: Props) => {
  return (
    <Container>
      <p>{myTurn ? "Your Turn" : "Opponent's Turn"}</p>
      {dice[0] !== -1 && (
        <>
          <p>
            Dice: {dice[0]} & {dice[1]}
          </p>
          <p>
            Moves left: {movesLeft.map(m => `${m}, `)}
          </p>
        </>
      )}

    </Container>
  );
}

export default GameStatus;

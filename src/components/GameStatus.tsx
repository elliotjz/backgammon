import * as React from "react";
import styled from "styled-components";

const Container = styled.div`
  text-align: center;
  background: #337733;
  padding: 10px 0;
`;

interface Props {
  dice: number[],
  myTurn: boolean
}

const GameStatus: React.FunctionComponent<Props> = ({dice, myTurn}: Props) => {
  return (
    <Container>
      <p>{myTurn ? "Your Turn" : "Opponent's Turn"}</p>
      {dice && (
        <p>
          Dice: {dice[0]} & {dice[1]}
        </p>
      )}
    </Container>
  );
}

export default GameStatus;

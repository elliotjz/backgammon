import * as React from "react";
import styled from "styled-components";

const Container = styled.div`
  text-align: center;
  padding: 10px 0;
`;

interface Props {
  myTurn: boolean
}

/**
 * Renders the game status and messages to the player
 */
const GameStatus: React.FunctionComponent<Props> = ({ myTurn }: Props) => {
  return (
    <Container>
      <p>{myTurn ? "Your Turn" : "Opponent's Turn"}</p>
    </Container>
  );
}

export default GameStatus;

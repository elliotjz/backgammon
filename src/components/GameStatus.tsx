import * as React from "react";
import styled from "styled-components";

const Container = styled.div`
  text-align: center;
  padding: 10px 0;
`;

interface Props {
  message: string,
}

/**
 * Renders the game status and messages to the player
 */
const GameStatus: React.FunctionComponent<Props> = ({
  message,
}: Props) => {
  return (
    <Container>
      {message !== "" && <p>{message}</p>}
    </Container>
  );
}

export default GameStatus;

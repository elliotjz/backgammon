import * as React from 'react';
import styled from 'styled-components';

interface MessageObject {
  player: number,
  time: number,
  message: String,
}

interface Props {
  message: MessageObject,
}

const StyledP = styled.p`
  margin: 2px 0;
  display: block;
  border: none;

  span {
    border-radius: 10px;
    padding: 5px;
  }

  small {
    font-size: 12px;
    color: ${props => props.theme.colors.darkGrey};
  }

  .right {
    float: right;
    background-color: ${props => `${props.theme.colors.green}33`};
  }
  
  .left {
    float: left;
    background-color: ${props => props.theme.colors.lightGrey};
  }
`

/**
 * Displays a message inside the chat log
 */
const Message:React.FunctionComponent<Props> = ({ message }: Props ) => {
  const playerText = message.player === 0 ? "You" : "Opponent";
  const date = new Date(message.time);
  const hours = date.getHours();
  const hoursText = hours % 12 === 0 ? 12 : hours % 12;
  const minutes = date.getMinutes();
  const minutesText = minutes < 10 ? `0${minutes}` : minutes;
  const AmPm = hours > 0 && hours < 12 ? "AM" : "PM";
  const timeText = `${hoursText}:${minutesText} ${AmPm}`;
  return (
    <StyledP>
      <span className={message.player === 0 ? "right" : "left"}>
        <small>
        {playerText} {timeText}
        </small>
        <br />
        {message.message}
      </span>
    </StyledP>
  );
};

export default Message;

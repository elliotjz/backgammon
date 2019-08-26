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

const Label = styled.p`
  color: ${props => props.theme.colors.grey};
  font-size: 12px;
  margin-bottom: 0;
`

const MessageP = styled.p`
  color: ${props => props.theme.colors.white}; 
  margin-top: 2px;
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
    <>
      <Label>
        {playerText} {timeText}
      </Label>
      <MessageP>
        {message.message}
      </MessageP>
    </>
  );
};

export default Message;

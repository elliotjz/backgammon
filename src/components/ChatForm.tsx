import * as React from 'react';
import styled from 'styled-components';

interface Props {
  handleMessageSend(event: any): void,
  handleChange(event: any): void,
  text: string,
}

const Form = styled.form`
  width: 100%;
  display: flex;
  margin: 0;
  height: 34px;
  height: 30px;
  box-sizing: content-box;
  border-top: 2px ${props => props.theme.colors.green} solid;

  input {
    flex: 1;
    background-color: ${props => props.theme.colors.white};
    height: 30px;
    font-size: 14px;
    padding-left: 10px;
    border: 1px ;
  }

  button {
    width: 80px;
    height: 30px;
    background-color: ${props => props.theme.colors.green};
    color: ${props => props.theme.colors.white};
    border: 0;
    text-align: center;
    cursor: pointer;
  }
`

/**
 * Renders the form that allows a player to send a chat message
 */
const ChatForm:React.FunctionComponent<Props> = ({
  handleMessageSend,
  handleChange,
  text
}: Props) => {
  return (
    <Form onSubmit={handleMessageSend}>
      <input type="text" value={text} onChange={handleChange} placeholder="Write message" />
      <button type="submit">SEND</button>
    </Form>
  );
};

export default ChatForm;

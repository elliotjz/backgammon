import * as React from 'react';
import styled from 'styled-components'

import Message from './Message'
import ChatForm from './ChatForm'
import { ChatMessageI } from '../helpers/interfaces';

const Container = styled.div`
  height: 500px;
  margin: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  div {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: ${props => props.theme.colors.white};
    border: solid ${props => props.theme.colors.green} 2px;
    border-radius: 10px;
    overflow: hidden;

    div {
      flex: 1;
      overflow: scroll;
      padding: 10px;
      border: none;
      border-radius: 10px;
    }
  }
`

interface PropsI {
  messages: ChatMessageI[],
  addNewMessage(message: ChatMessageI): void,
  myName: string,
  opponentName: string,
}

interface StateI {
  inputText: string,
}

/**
 * Renders and controls the chat functions of the game
 */
class Chat extends React.Component<PropsI, StateI> {
  state = {
    inputText: "",
  }

  private messageContRef = React.createRef<HTMLDivElement>();

  handleChange = (event: any) => {
    this.setState({
      inputText: event.target.value
    })
  }

  handleMessageSend = (event: any) => {
    event.preventDefault();
    const { addNewMessage } = this.props;
    const { inputText } = this.state;
    if (inputText !== "") {
      addNewMessage({
        me: true,
        date: new Date().getTime(),
        message: inputText,
      });
      this.setState({ inputText: '' });
    }
  }

  componentDidUpdate() {
    const div = this.messageContRef.current;
    if (div) {
      div.scrollTop = div.scrollHeight;
    }
  }

  render() {
    const { inputText }: { inputText: string } = this.state;
    const { messages, myName, opponentName }:
      { messages: ChatMessageI[], myName: string, opponentName: string } = this.props;
    return (
      <Container>
        <h3>Chat</h3>
        <div>
          <div className="message-div" ref={this.messageContRef} >
            {messages.map(m => (
              <Message key={m.date} message={m} name={m.me ? myName : opponentName}/>
            ))}
          </div>
          <ChatForm
            handleMessageSend={this.handleMessageSend}
            text={inputText}
            handleChange={this.handleChange}
          />
        </div>
      </Container>
    );
  }
}

export default Chat;

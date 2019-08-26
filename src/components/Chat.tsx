import * as React from 'react';
import styled from 'styled-components'

import Message from './Message'
import ChatForm from './ChatForm'
import Button from './Button';

interface MessageObject {
  player: number,
  time: number,
  message: string,
}

// Messages for the computer to send
const cannedAnswers = [
  "Why did you move there?",
  "That was an awful move, you're stuffed.",
  "Play again after this?",
  "Heck!",
]

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

/**
 * Renders and controls the chat functions of the game
 */
class Chat extends React.Component {
  state = {
    messages: [],
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
    const { inputText } = this.state;
    if (inputText !== "") {
      this.addMessage({
        player: 0,
        time: new Date().getTime(),
        message: inputText
      });
    }
  }

  handleComputerMessage = () => {
    const { messages } = this.state;
    const message = cannedAnswers[Math.floor(Math.random() * cannedAnswers.length)];
    this.addMessage({
      player: 1,
      time: new Date().getTime(),
      message,
    });
    this.setState({ messages });
  }

  addMessage = (message: MessageObject) => {
    const { messages }: { messages: MessageObject[] } = this.state;
    messages.push(message);
    this.setState({
      messages,
      inputText: "",
    }, () => {
      const div = this.messageContRef.current;
      if (div) {
        div.scrollTop = div.scrollHeight;
      }
    })
  }

  render() {
    const { messages, inputText }: { messages: MessageObject[], inputText: string } = this.state;
    return (
      <Container>
        <h3>Chat</h3>
        <div>
          <div className="message-div" ref={this.messageContRef} >
            {messages.map(m => <Message key={m.time} message={m} />)}
          </div>
          <ChatForm
            handleMessageSend={this.handleMessageSend}
            text={inputText}
            handleChange={this.handleChange}
          />
        </div>
        <Button handleClick={this.handleComputerMessage} disabled={false} text="Send Opponent Message" />
      </Container>
    );
  }
}

export default Chat;

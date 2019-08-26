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
  width: 80%;
  height: 300px;
  margin: 20px auto;
  background-color: ${props => props.theme.colors.black};
  border: solid ${props => props.theme.colors.green} 1px;
  display: flex;
  flex-direction: column;

  div {
    flex: 1;
    overflow: scroll;
    padding: 10px;
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
      <div>
        <Container>
          <div className="message-div" ref={this.messageContRef} >
            {messages.map(m => <Message key={m.time} message={m} />)}
          </div>
          <ChatForm
            handleMessageSend={this.handleMessageSend}
            text={inputText}
            handleChange={this.handleChange}
          />
        </Container>
        <Button handleClick={this.handleComputerMessage} disabled={false} text="Computer message" />
      </div>
    );
  }
}

export default Chat;

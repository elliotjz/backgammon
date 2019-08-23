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

class Chat extends React.Component {
  state = {
    messages: [
      { player: 0, time: 1566448345821, message: "You're gonna loose." },
      { player: 1, time: 1566449355821, message: "Naaa." },
      { player: 0, time: 1566458365821, message: "Yeah, you're definitely going to lose, I'm just too good..." },
      { player: 0, time: 1566848375821, message: "Naaaa" }
    ],
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
    const { messages } = this.state;
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
    const { messages, inputText } = this.state;
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

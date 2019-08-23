import * as React from 'react';
import styled from 'styled-components'

import Message from './Message'
import ChatForm from './ChatForm'

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

  handleMessageSend = (event: any) => {
    event.preventDefault();
    const { inputText, messages } = this.state;
    if (inputText !== "") {
      messages.push({
        player: 0,
        time: new Date().getTime(),
        message: inputText
      })
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
  }

  handleChange = (event: any) => {
    this.setState({
      inputText: event.target.value
    })
  }

  render() {
    const { messages, inputText } = this.state;
    return (
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
    );
  }
}

export default Chat;

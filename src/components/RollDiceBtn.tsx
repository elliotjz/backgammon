import * as React from "react";
import styled from "styled-components";

const Button = styled.button`
  background-color: ${props => props.theme.colors.green};
  border: none;
  border-radius: 25px;
  padding: 15px 32px;
  color: #fff;
  text-align: center;
  font-size: 16px;
  box-shadow: 0 0 5px 5px #00000033;
  margin: 10px auto;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled,
  &[disabled] {
    background-color: #999;
    cursor: default;

    &:hover {
      transform: none;
    }
  }
`;

interface Props {
  rollDice(): void,
  disabled: boolean
}

const RollDiceBtn:React.FunctionComponent<Props> = ({
  rollDice,
  disabled
}: Props) => {
  return (
    <Button type="button" disabled={disabled} onClick={rollDice}>
      Roll Dice
    </Button>
  );
};

export default RollDiceBtn;

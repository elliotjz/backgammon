import * as express from 'express';

import { getDiceNumber, getUniqueCode } from './helpers/functions';
import { GameStateI } from './helpers/interfaces';
import { startingState, startingPieces } from './helpers/boardStates';
import { gamesBeingPlayed } from './index';

const router = express.Router();

router.get('/start-game', (req, res) => {
  const code0 = getUniqueCode();
  const code1 = getUniqueCode();

  // Initial dice rolls are pre-determined
  const initialDice0 = getDiceNumber();
  let initialDice1 = getDiceNumber();
  // Keep rolling until the two dice are different
  while(initialDice0 === initialDice1) {
    initialDice1 = getDiceNumber();
  }

  // Construct the initial game state
  const gameState: GameStateI = {
    ...startingState,
    initialDice0,
    initialDice1,
    player0Turn: initialDice0 > initialDice1,
    dice: [initialDice0, initialDice1],
    movesLeft: [initialDice0, initialDice1],
  }

  // Deep copy of the pieces array
  gameState.pieces = [Array.from(startingPieces[0]), Array.from(startingPieces[1])];

  // Add the game state to volatile storage
  gamesBeingPlayed.push({
    player0Id: '',
    player1Id: '',
    name0: '',
    name1: '',
    uniqueCode0: code0,
    uniqueCode1: code1,
    gameState,
  });

  res.status(200).json({ code: code0 });
});

router.get('/stats', (req, res) => {
  res.json(gamesBeingPlayed);
})

export default router;

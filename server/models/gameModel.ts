import * as mongoose from 'mongoose';

import { GameStateI } from '../helpers/interfaces';

export interface DatabaseGameI extends mongoose.Document {
  player0Id: string,
  player1Id: string,
  name0: string,
  name1: string,
  uniqueCode0: string,
  uniqueCode1: string,
  gameState: GameStateI,
}

const gameSchema = new mongoose.Schema({
  player0Id: String,
  player1Id: String,
  name0: String,
  name1: String,
  uniqueCode0: String,
  uniqueCode1: String,
  gameState: Object,
});

const GameModel = mongoose.model<DatabaseGameI>('Game', gameSchema);

export default GameModel;

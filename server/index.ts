import * as express from 'express';
import * as http from 'http';
import * as path from 'path';
import * as socketIo from 'socket.io';
import * as mongoose from 'mongoose';
import * as env from 'dotenv';

import {
  getDiceNumber,
  getDiceNumbers,
  capturesOpponent,
  playerCanMove,
  moveIsValid,
  convertToPlayer1Move,
  gameIsOver,
  gameStateToMessage,
} from './helpers/functions';
import { startingState, startingPieces } from './helpers/boardStates';
import { GameStateI, MoveI, GameI } from './helpers/interfaces';
import {
  PLAYER_0_HOME,
  PLAYER_1_HOME,
  WAITING_FOR_NAMES,
  INITIAL_ROLLS,
  PLAY,
} from './helpers/constants';
import apiRoutes from './apiRoutes';
import GameModel from './models/gameModel';

// Setup environment variables
env.config({ path: '.env' });

// Setup server and socket
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
console.log(`Secret: ${process.env.APP_SECRET}`);
// Setup database
const pw = process.env.DB_PW;
const user = process.env.DB_USER;
mongoose.connect(`mongodb://${user}:${pw}@ds113626.mlab.com:13626/backgammon`, () => {
  console.log('Connected to database');
});

// Fake data for analytics
const fakeData = [
  {"player0Id":"w74cQ-oLGsZ-n9vKAAAC","player1Id":"","name0":"","name1":"","uniqueCode0":"ngry8ffinr","uniqueCode1":"16zarp16fc",
    "gameState":{"gamePhase":0,"player0Turn":false,"needsToRoll":false,"initialDice0":4,"initialDice1":5,"dice":[4,5],"movesLeft":[4,5],
      "pieces":[[0,0,11,11,11,11,11,16,16,16,18,18,18,18,18],[5,5,5,5,5,7,7,7,12,12,12,12,12,23,23]]}},
  {"player0Id":"FPkAI2NOA2P2vG5mAAAD","player1Id":"KJG8Q1iDyebOKTwGAAAE","name0":"Elliot","name1":"Sam","uniqueCode0":"s0tj4l030i","uniqueCode1":"is8aq5tdif",
    "gameState":{"gamePhase":2,"player0Turn":true,"needsToRoll":true,"initialDice0":-1,"initialDice1":-1,"dice":[-1,-1],"movesLeft":[-1,-1],"pieces":
      [[0,11,11,11,15,15,14,16,16,20,22,22,19,19,20],[1,4,4,5,5,1,7,7,24,12,12,12,12,12,17]]}},
  {"player0Id":"GhI3qAIeW7rjIx3SAAAF","player1Id":"7S4qpu6ofz9N1gwdAAAG","name0":"John","name1":"setname","uniqueCode0":"jxzg8mtuea","uniqueCode1":"nzkj3mh1pc",
    "gameState":{"gamePhase":2,"player0Turn":false,"needsToRoll":true,"initialDice0":-1,"initialDice1":-1,"dice":[-1,-1],"movesLeft":[-1,-1],
      "pieces":[[0,0,11,11,11,11,17,16,16,17,18,18,18,18,18],[5,5,5,5,5,7,7,7,12,12,12,12,12,23,23]]}}
];

// Volatile storage of games
export const gamesBeingPlayed:GameI[] = fakeData;

const getGameIndex = (id: string) => (
  gamesBeingPlayed.findIndex(g => (
    g.player0Id === id || g.player1Id === id
  ))
);

const getGame = (id: string):GameI => {
  const index = getGameIndex(id);
  if (index < 0) {
    throw new Error("Game not found");
  }
  return gamesBeingPlayed[index];
}

const clientDir = process.env.NODE_ENV === 'development' ? '../client' : '../../client';

app.use(express.static(path.resolve(__dirname, clientDir)));

app.use('/api', apiRoutes);

app.get('/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, clientDir, 'index.html'));
});

// Handling for socket messages
io.on('connection', (socket) => {
  const rejoinGame = (index: number, code: string) => {
    const game = gamesBeingPlayed[index];
    if (game.uniqueCode0 === code) {
      // Player 0 has joined
      game.player0Id = socket.id;
  
      if (game.gameState.gamePhase === WAITING_FOR_NAMES) {
        // Send the other player1 code
        console.log('SOCKET emit: join-code');
        socket.emit('join-code', game.uniqueCode1);
      } else {
        // Re-join the game
        console.log('SOCKET emit: game-state');
        socket.emit('game-state', gameStateToMessage(game, 0, "You've re-joined the game"));
      }
    } else {
      // Player 1 has joined
      game.player1Id = socket.id;
  
      if (game.gameState.gamePhase !== WAITING_FOR_NAMES) {
        // Re-join the game
        console.log('SOCKET emit: game-state');
        socket.emit('game-state', gameStateToMessage(game, 1, "You've re-joined the game"));
      }
    }
  }

  socket.on('disconnect', () => {
    console.log('SOCKET: disconnect');
    // Save the game on the database so they can come back to it later
    try {
      const game = getGame(socket.id);
      GameModel.findOne({ uniqueCode0: game.uniqueCode0 }, (err, savedGame) => {
        if (err) console.log(err);
        else if (savedGame) {
          // Update the game
          GameModel.findOneAndUpdate({ uniqueCode0: game.uniqueCode0 }, game, (err2) => {
            if (err2) console.log(err2);
            else console.log('successfully updated the game');
          });
        } else {
          // Create the game
          new GameModel(game).save((err2) => {
            if (err2) console.log(err2); 
            else console.log('saved');
          });
        }
      });
    } catch (err) {
      console.log(err);
    }
  });

  socket.on('join-game', (code: string) => {
    console.log(`ID = ${socket.id}`);
    console.log('SOCKET: join-game');
    let index = gamesBeingPlayed.findIndex(g => (
      g.uniqueCode0 === code || g.uniqueCode1 === code
    ));
    if (index !== -1) {
      rejoinGame(index, code);
    } else {
      // No game found in volatile memory
      // Search for game in database
      console.log('Game not found in volatile memory');
      GameModel.findOne({
        $or: [{ uniqueCode0: code }, {uniqueCode1: code }]
      }, (err, savedGame) => {
        if (err) console.log(err);
        else if (!savedGame) {
          console.log('No Game found with this unique code');
        } else {
          // Found game in database
          console.log('Found Game in database');
          index = gamesBeingPlayed.length;
          gamesBeingPlayed.push(savedGame);
          rejoinGame(index, code);
        }
      });
    }
  });

  socket.on('set-name', (name: string) => {
    console.log('SOCKET: set-name');
    try {
      const game = getGame(socket.id);
      const player = game.player0Id === socket.id ? 0 : 1;
      let bothNamesSet: boolean;
      if (player === 0) {
        game.name0 = name;

        bothNamesSet = game.name1 !== '';
      } else {
        game.name1 = name;
        bothNamesSet = game.name0 !== '';
      }

      // Send the name to the opponent
      const opponentId = player === 0 ? game.player1Id : game.player0Id;
      io.to(opponentId).emit('opponent-name', name);

      if (bothNamesSet) {
        // Start the game
        game.gameState.gamePhase = INITIAL_ROLLS;
        console.log('SOCKET emit: start-game');
        socket.emit('start-game');
        console.log('SOCKET emit: start-game');
        io.to(opponentId).emit('start-game');
      }
    } catch (err) {
      console.log(err);
    }
  })

  socket.on('roll-initial-dice', () => {
    console.log('SOCKET: roll-initial-dice');
    try {
      const game = getGame(socket.id);
      if (game.gameState.gamePhase === INITIAL_ROLLS) {
        let initialDice: number;
        let opponentInitialDice: number;
        let opponentId: string;
        const player = game.player0Id === socket.id ? 0 : 1;
        if (player === 0) {
          initialDice = game.gameState.initialDice0;
          opponentInitialDice = game.gameState.initialDice1;
          // Reset the dice so they can't roll again
          game.gameState.initialDice0 = -1;
          opponentId = game.player1Id;
        } else {
          initialDice = game.gameState.initialDice1;
          opponentInitialDice = game.gameState.initialDice0;
          // Reset the dice so they can't roll again
          game.gameState.initialDice1 = -1;
          opponentId = game.player0Id;
        }

        if (initialDice < 0) {
          console.log('SOCKET emit: error');
          socket.emit('error', 'You have already rolled');
        } else {
          if (opponentInitialDice < 0) {
            // Both players have rolled, so start the game
            game.gameState.gamePhase = PLAY;
            const msg0 = game.gameState.player0Turn ? "Your turn" : `${game.name1}'s turn`;
            const msg1 = game.gameState.player0Turn ? `${game.name0}'s turn` : "Your turn";
            console.log('SOCKET emit: game-state');
            socket.emit('game-state', gameStateToMessage(game, player, player === 0 ? msg0 : msg1));
            const opponentId = player === 0 ? game.player1Id : game.player0Id;
            console.log('SOCKET emit: game-state (other player)');
            io.to(opponentId).emit('game-state', gameStateToMessage(game, 1 - player, player === 0 ? msg1 : msg0));
          } else {
            // Waiting for other player to roll
            console.log('SOCKET emit: initial-dice');
            socket.emit('initial-dice', initialDice);
            console.log('SOCKET emit: opponent-initial-dice');
            io.to(opponentId).emit('opponent-initial-dice', initialDice);
          }        
        }
      }
    } catch (err) {
      console.log('Error rolling initial dice');
      console.error(err);
    }
  });

  socket.on('move-piece', (m: MoveI) => {
    console.log('SOCKET: move-piece');
    try {
      const game = getGame(socket.id);
      const player = game.player0Id === socket.id ? 0 : 1;
      const turn = game.gameState.player0Turn ? 0 : 1;
      if (player !== turn) {
        // Player tried to play out of turn
        console.log('SOCKET emit: error');
        socket.emit('error', 'Not your turn');
      } else {
        const move = player === 0 ? m : convertToPlayer1Move(m);
        if (!moveIsValid(game.gameState.pieces, player, move)) {
          console.log('SOCKET emit: error');
          socket.emit('error', 'Move is not valid');
        } else {
          let diceNumberUsed: number;
          if (player === 0) {
            diceNumberUsed = move.toSpike - game.gameState.pieces[player][move.piece]
          } else {
            diceNumberUsed = game.gameState.pieces[player][move.piece] - move.toSpike;
          }
          
          let indexOfMove = game.gameState.movesLeft.indexOf(diceNumberUsed);
          // indexOfMove will be -1 if the number used is larger than the required
          // mode. This will occur when moving pieces home at the end of the game.
          let i = 1;
          while (indexOfMove === -1) {
            indexOfMove = game.gameState.movesLeft.indexOf(diceNumberUsed + i);
            i++;
          }
          // Move the piece
          let limitedToSpike = move.toSpike;
          if (move.toSpike < -1) limitedToSpike = -1;
          if (move.toSpike > 24) limitedToSpike = 24;
          if (limitedToSpike !== move.toSpike) {
            console.log("WOW! Limited toSpoke !== toSpike");
            console.log(`limitedToSpike: ${limitedToSpike}`);
            console.log(`move.toSpike: ${move.toSpike}`);
          }
          game.gameState.pieces[player][move.piece] = limitedToSpike;

          // Check if a piece has been captured
          if (capturesOpponent(game.gameState.pieces, player, move.toSpike)) {
            const indexOfPiece = game.gameState.pieces[1 - player].indexOf(move.toSpike);
            game.gameState.pieces[1 - player][indexOfPiece] = player === 0 ? PLAYER_0_HOME : PLAYER_1_HOME;
          }

          // Update moves left
          let movesLeft = game.gameState.movesLeft;
          movesLeft.splice(indexOfMove, 1);
          game.gameState.movesLeft = movesLeft;

          let playerMessage;
          let oppMessage;

          if (gameIsOver(game.gameState.pieces)) {
            console.log("GAME OVER");
            playerMessage = "😀 You Win!!! 😀";
            oppMessage = "😢 You loose 😢";
            console.log('SOCKET emit: game-state');
            socket.emit('game-state', gameStateToMessage(game, player, playerMessage));
            const opponentId = player === 0 ? game.player1Id : game.player0Id;
            console.log('SOCKET emit: game-state (other player)');
            io.to(opponentId).emit('game-state', gameStateToMessage(game, 1 - player, oppMessage));
          } else if (movesLeft.length === 0) {
            // Swap turns
            game.gameState.dice = [-1, -1];
            game.gameState.movesLeft = [-1, -1];
            game.gameState.needsToRoll = true;
            game.gameState.player0Turn = player === 0 ? false : true;

            // Send updated game to clients
            playerMessage = `${player === 0 ? game.name1 : game.name0}'s turn`;
            oppMessage = "Your turn";
            console.log('SOCKET emit: game-state');
            socket.emit('game-state', gameStateToMessage(game, player, playerMessage));
            const opponentId = player === 0 ? game.player1Id : game.player0Id;
            console.log('SOCKET emit: game-state (other player)');
            io.to(opponentId).emit('game-state', gameStateToMessage(game, 1 - player, oppMessage));

          } else if (!playerCanMove(game.gameState.pieces, player, game.gameState.movesLeft)) {
            // Send message to indicate forfeited moves
            playerMessage = "⛔ No moves can be made. Forfeit your turn. ⛔";
            oppMessage = "🎉 Opponent can't move. They forfeit their turn. 🎉";
            console.log('SOCKET emit: game-state');
            socket.emit('game-state', gameStateToMessage(game, player, playerMessage));
            const opponentId = player === 0 ? game.player1Id : game.player0Id;
            console.log('SOCKET emit: game-state (other player)');
            io.to(opponentId).emit('game-state', gameStateToMessage(game, 1 - player, oppMessage));
            
            setTimeout(() => {
              // Swap turns
              game.gameState.dice = [-1, -1];
              game.gameState.movesLeft = [-1, -1];
              game.gameState.needsToRoll = true;
              game.gameState.player0Turn = player === 0 ? false : true;

              // Send updated game to clients
              playerMessage = `${player === 0 ? game.name1 : game.name0}'s turn`;
              oppMessage = "Your turn";
              console.log('SOCKET emit: game-state');
              socket.emit('game-state', gameStateToMessage(game, player, playerMessage));
              const opponentId = player === 0 ? game.player1Id : game.player0Id;
              console.log('SOCKET emit: game-state (other player)');
              io.to(opponentId).emit('game-state', gameStateToMessage(game, 1 - player, oppMessage));
            }, 3000);

          } else {
            // It's still the player's turn. Let them move again
            // Send updated game to clients
            playerMessage = "Your turn";
            oppMessage = `${player === 0 ? game.name0 : game.name1}'s turn`;
            console.log(`SOCKET emit: game-state`);
            socket.emit('game-state', gameStateToMessage(game, player, playerMessage));
            const opponentId = player === 0 ? game.player1Id : game.player0Id;
            console.log('SOCKET emit: game-state (other player)');
            io.to(opponentId).emit('game-state', gameStateToMessage(game, 1 - player, oppMessage));
          }
        }
      }
    } catch (err) {
      console.log('Error moving piece');
      console.error(err);
    }
  });

  socket.on('roll-dice', () => {
    console.log('SOCKET: roll-dice');
    try {
      const game = getGame(socket.id);
      const player = socket.id === game.player0Id ? 0 : 1;
      const playersTurn = player === 0 ? game.gameState.player0Turn : !game.gameState.player0Turn;
      if (game.gameState.gamePhase !== PLAY || !playersTurn || !game.gameState.needsToRoll) {
        console.log('SOCKET emit: error');
        socket.emit('error', 'You can\'t roll right now');
      } else {
        const diceNumbers = getDiceNumbers();
        game.gameState.dice = diceNumbers.dice;
        game.gameState.movesLeft = diceNumbers.movesLeft;
        game.gameState.needsToRoll = false;

        let playerMessage;
        let oppMessage;

        if (!playerCanMove(game.gameState.pieces, player, game.gameState.movesLeft)) {
          playerMessage = "⛔ No moves can be made. Forfeit your turn. ⛔";
          oppMessage = "🎉 Opponent can't move. They forfeit their turn. 🎉";
          console.log('SOCKET emit: game-state');
          socket.emit('game-state', gameStateToMessage(game, player, playerMessage));
          const opponentId = player === 0 ? game.player1Id : game.player0Id;
          console.log('SOCKET emit: game-state (other player)');
          io.to(opponentId).emit('game-state', gameStateToMessage(game, 1 - player, oppMessage));
          
          setTimeout(() => {
            // Swap turns
            game.gameState.dice = [-1, -1];
            game.gameState.movesLeft = [-1, -1];
            game.gameState.needsToRoll = true;
            game.gameState.player0Turn = player === 0 ? false : true;

            // Send updated game to clients
            playerMessage = `${player === 0 ? game.name1 : game.name0}'s turn`;
            oppMessage = "Your turn";
            console.log('SOCKET emit: game-state');
            socket.emit('game-state', gameStateToMessage(game, player, playerMessage));
            const opponentId = player === 0 ? game.player1Id : game.player0Id;
            console.log('SOCKET emit: game-state (other player)');
            io.to(opponentId).emit('game-state', gameStateToMessage(game, 1 - player, oppMessage));
          }, 3000);
        } else {
          // Send dice to client
          playerMessage = "Your turn";
          oppMessage = `${player === 0 ? game.name0 : game.name1}'s turn`;
          console.log('SOCKET emit: game-state');
          socket.emit('game-state', gameStateToMessage(game, player, playerMessage));
          const opponentId = player === 0 ? game.player1Id : game.player0Id;
          console.log('SOCKET emit: game-state (other player)');
          io.to(opponentId).emit('game-state', gameStateToMessage(game, 1 - player, oppMessage));
        }
      }
    } catch (err) {
      console.log('Error rolling the dice');
      console.error(err);
    }
  });

  socket.on('play-again', () => {
    console.log('SOCKET: play-again');
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
      gamePhase: INITIAL_ROLLS,
      initialDice0,
      initialDice1,
      player0Turn: initialDice0 > initialDice1,
      dice: [initialDice0, initialDice1],
      movesLeft: [initialDice0, initialDice1],
    }

    // Deep copy of the pieces array
    gameState.pieces = [Array.from(startingPieces[0]), Array.from(startingPieces[1])];

    try {
      // Add the game state to volatile storage
      const game = getGame(socket.id);
      game.gameState = gameState;

      console.log('SOCKET emit: play-again');
      socket.emit('play-again');
      const player = game.player0Id === socket.id ? 0 : 1;
      const opponentId = player === 0 ? game.player1Id : game.player0Id;
      console.log('SOCKET emit: play-again');
      io.to(opponentId).emit('play-again');
    } catch (err) {
      console.log('Error starting new game');
      console.error(err);
    }
  });

  socket.on('chat', (message: string) => {
    try {
      console.log('SOCKET: chat');
      const game = getGame(socket.id);
      const player = game.player0Id === socket.id ? 0 : 1;
      const opponentId = player === 0 ? game.player1Id : game.player0Id;
      console.log('SOCKET emit: chat');
      io.to(opponentId).emit('chat', message);
    } catch (err) {
      console.log('Error receiving chat');
      console.error(err);
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, function(){
  console.log(`listening on port ${port}`);
});

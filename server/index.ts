import * as express from 'express';
import * as http from 'http';
import * as path from 'path';
import * as socketIo from 'socket.io';

import {
  getDiceNumber,
  getDiceNumbers,
  capturesOpponent,
  playerCanMove,
  getUniqueCode,
  moveIsValid,
  convertToPlayer1Pieces,
  convertToPlayer1Move,
  gameIsOver,
} from './helpers/functions';
import { startingState, startingPieces } from './helpers/boardStates';
import { GameStateI, MoveI, GameStateMessageI, GameI, ChatMessageI } from './helpers/interfaces';
import {
  PLAYER_0_HOME,
  PLAYER_1_HOME,
  WAITING_FOR_OPPONENT,
  INITIAL_ROLLS,
  PLAY,
} from './helpers/constants';

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const gamesBeingPlayed:GameI[] = [];

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

const updateGame = (id: string, newState: GameI) => {
  const index = getGameIndex(id);
  gamesBeingPlayed[index] = newState;
}

const gameStateToMessage = (game: GameI, player: number, message:string):GameStateMessageI => {
  const { pieces } = game.gameState;
  return player === 0 ? {
    myTurn: game.gameState.player0Turn,
    needsToRoll: game.gameState.needsToRoll,
    dice: game.gameState.dice,
    movesLeft: game.gameState.movesLeft,
    pieces: pieces,
    message,
  } : {
    myTurn: !game.gameState.player0Turn,
    needsToRoll: game.gameState.needsToRoll,
    dice: game.gameState.dice,
    movesLeft: game.gameState.movesLeft,
    pieces: convertToPlayer1Pieces(game.gameState.pieces),
    message,
  }
}

const clientDir = process.env.NODE_ENV === 'development' ? '../client' : '../../client';

app.use(express.static(path.resolve(__dirname, clientDir)));

app.get('/start-game', (req, res) => {
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
    uniqueCode0: code0,
    uniqueCode1: code1,
    gameState,
  });

  console.log(`Number of games being played = ${gamesBeingPlayed.length}`);

  res.status(200).json({ code: code0 });
});

app.get('/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, clientDir, 'index.html'));
});

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    console.log('SOCKET: disconnect');
    console.log(`Number of games being played = ${gamesBeingPlayed.length}`);
    // TODO: Delete game if the host disconnects
  });

  socket.on('join-game', (code: string) => {
    console.log(`ID = ${socket.id}`);
    console.log('SOCKET: join-game');
    const index = gamesBeingPlayed.findIndex(g => (
      g.uniqueCode0 === code || g.uniqueCode1 === code
    ));
    if (index === -1) {
      console.log(`No game found with the code ${code}`);
    } else {
      const game = gamesBeingPlayed[index];
      if (game.uniqueCode0 === code) {
        // Player 0 has joined
        game.player0Id = socket.id;

        if (game.gameState.gamePhase === WAITING_FOR_OPPONENT) {
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

        if (game.gameState.gamePhase === WAITING_FOR_OPPONENT) {
          // Start the game
          game.gameState.gamePhase = INITIAL_ROLLS;
          console.log('SOCKET emit: start-game');
          socket.emit('start-game');
          console.log('SOCKET emit: start-game');
          io.to(game.player0Id).emit('start-game');
        } else {
          // Re-join the game
          console.log('SOCKET emit: game-state');
          socket.emit('game-state', gameStateToMessage(game, 1, "You've re-joined the game"));
        }
      }
    }
  });

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
          updateGame(socket.id, game);
          if (opponentInitialDice < 0) {
            // Both players have rolled, so start the game
            game.gameState.gamePhase = PLAY;
            const msg0 = game.gameState.player0Turn ? "Your turn" : "Opponent's turn";
            const msg1 = game.gameState.player0Turn ? "Opponent's turn" : "Your turn";
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
            // Swap turns and update game
            game.gameState.dice = [-1, -1];
            game.gameState.movesLeft = [-1, -1];
            game.gameState.needsToRoll = true;
            game.gameState.player0Turn = player === 0 ? false : true;
            updateGame(socket.id, game);

            // Send updated game to clients
            playerMessage = "Opponent's turn";
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
              // Swap turns and update game
              game.gameState.dice = [-1, -1];
              game.gameState.movesLeft = [-1, -1];
              game.gameState.needsToRoll = true;
              game.gameState.player0Turn = player === 0 ? false : true;
              updateGame(socket.id, game);

              // Send updated game to clients
              playerMessage = "Opponent's turn";
              oppMessage = "Your turn";
              console.log('SOCKET emit: game-state');
              socket.emit('game-state', gameStateToMessage(game, player, playerMessage));
              const opponentId = player === 0 ? game.player1Id : game.player0Id;
              console.log('SOCKET emit: game-state (other player)');
              io.to(opponentId).emit('game-state', gameStateToMessage(game, 1 - player, oppMessage));
            }, 3000);

          } else {
            // Update game
            updateGame(socket.id, game);

            // Send updated game to clients
            playerMessage = "Your turn";
            oppMessage = "Opponent's turn";
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
        updateGame(socket.id, game);

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
            // Swap turns and update game
            game.gameState.dice = [-1, -1];
            game.gameState.movesLeft = [-1, -1];
            game.gameState.needsToRoll = true;
            game.gameState.player0Turn = player === 0 ? false : true;
            updateGame(socket.id, game);

            // Send updated game to clients
            playerMessage = "Opponent's turn";
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
          oppMessage = "Opponent's turn";
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
      updateGame(socket.id, game);
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
      const chatMessage:ChatMessageI = {
        message,
        player,
        date: new Date().getTime(),
      }
      console.log('SOCKET emit: chat');
      io.to(opponentId).emit('chat', chatMessage);
    } catch (err) {
      console.log('Error receiving chat');
      console.error(err);
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, function(){
  console.log(`listening at http://localhost:${port}`);
});

'use strict'

const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.resolve(__dirname, '../client')));

app.get('/', function(req, res){
  res.sendFile(path.resolve(__dirname, '../client', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('chat', (message) => {
    console.log(message);
  })
});

const port = process.env.PORT || 3000;
server.listen(3000, function(){
  console.log(`listening at http://localhost:${port}`);
});
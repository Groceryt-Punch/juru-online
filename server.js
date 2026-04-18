const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let players = {}; 
let turnOrder = [];
let currentTurnIndex = 0;
const emojis = ["💖", "⭐", "🐱", "🐶", "🐥", "🍀", "🦊", "🐻", "🐰", "🦁", "🐧", "🦄"];

io.on('connection', (socket) => {
    socket.on('joinGame', (data) => {
        const playerCount = Object.keys(players).length;
        
        players[socket.id] = {
            id: socket.id,
            name: data.nickname,
            pos: 0,
            // 사용자가 입력한 이미지 URL이 있으면 저장, 없으면 null
            customImg: data.imgUrl || null,
            emoji: emojis[playerCount] || emojis[emojis.length - 1],
            color: `hsl(${Math.random() * 360}, 75%, 70%)`
        };
        turnOrder.push(socket.id);
        
        io.emit('updateGameState', { 
            players, 
            currentTurn: turnOrder[currentTurnIndex] 
        });
    });

    socket.on('rollDice', () => {
        if (socket.id !== turnOrder[currentTurnIndex]) return;

        const dice = Math.floor(Math.random() * 6) + 1;
        players[socket.id].pos = (players[socket.id].pos + dice) % 24;

        io.emit('diceResult', {
            playerId: socket.id,
            dice: dice,
            newPos: players[socket.id].pos,
            playerName: players[socket.id].name
        });

        currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
        io.emit('updateGameState', { 
            players, 
            currentTurn: turnOrder[currentTurnIndex] 
        });
    });

    socket.on('disconnect', () => {
        turnOrder = turnOrder.filter(id => id !== socket.id);
        delete players[socket.id];
        if (currentTurnIndex >= turnOrder.length) currentTurnIndex = 0;
        io.emit('updateGameState', { players, currentTurn: turnOrder[currentTurnIndex] });
    });
});

server.listen(3000, '0.0.0.0', () => {
    console.log("서버 실행 중! 포트 3000을 Public으로 설정하세요.");
});

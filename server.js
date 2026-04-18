const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 'public' 폴더 내의 정적 파일(html, css, js)을 제공합니다.
app.use(express.static(path.join(__dirname, 'public')));

let players = {}; 
let turnOrder = [];
let currentTurnIndex = 0;

io.on('connection', (socket) => {
    console.log('유저 접속:', socket.id);

    // 1. 유저가 닉네임을 입력하고 게임에 입장할 때
    socket.on('joinGame', (nickname) => {
        // 최대 4명 제한
        if (Object.keys(players).length >= 4) {
            socket.emit('errorMsg', '방이 가득 찼습니다.');
            return;
        }

        // 플레이어 정보 등록
        players[socket.id] = {
            id: socket.id,
            name: nickname,
            pos: 0,
            emoji: ["💖", "⭐", "🐱", "🐶"][Object.keys(players).length]
        };
        turnOrder.push(socket.id);
        
        // 전체 유저에게 업데이트된 게임 상태 전송
        io.emit('updateGameState', { 
            players, 
            currentTurn: turnOrder[currentTurnIndex] 
        });
    });

    // 2. 주사위를 굴릴 때
    socket.on('rollDice', () => {
        // 자기 차례가 아닌 유저의 요청은 무시
        if (socket.id !== turnOrder[currentTurnIndex]) return;

        const dice = Math.floor(Math.random() * 6) + 1;
        const player = players[socket.id];
        
        // 24칸 보드 기준 이동 (0~23)
        player.pos = (player.pos + dice) % 24;

        // 주사위 결과 및 이동 정보 중계
        io.emit('diceResult', {
            playerId: socket.id,
            dice: dice,
            newPos: player.pos,
            playerName: player.name
        });

        // 다음 사람으로 턴 넘기기
        currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
        io.emit('updateGameState', { 
            players, 
            currentTurn: turnOrder[currentTurnIndex] 
        });
    });

    // 3. 유저가 접속을 끊었을 때
    socket.on('disconnect', () => {
        console.log('유저 나감:', socket.id);
        turnOrder = turnOrder.filter(id => id !== socket.id);
        delete players[socket.id];
        
        // 턴 인덱스 조정
        if (currentTurnIndex >= turnOrder.length) currentTurnIndex = 0;
        
        io.emit('updateGameState', { 
            players, 
            currentTurn: turnOrder[currentTurnIndex] 
        });
    });
});

// 포트 3000번에서 서버 실행
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`서버가 성공적으로 열렸습니다! 포트: ${PORT}`);
});

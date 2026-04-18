const boardMissions = [
    "출발", "술한잔", "노래한절", "안주한입", "주사위더블", "사랑해", "물한잔", "무인도",
    "귀요미", "애교", "얼빡샷", "세계여행",
    "적립적산", "한잔적립", "물한잔", "안주한입", "술한잔", "스쿼트", "Q&A", "적립청산",
    "매도", "메롱", "의리주", "하이볼"
];

let players = [];
let currentTurn = 0;
const emojis = ["💖", "⭐", "🐱", "🐶"];

// 플레이어 추가 (대기실 로직)
function addPlayer() {
    const input = document.getElementById('nickname-input');
    const name = input.value.trim();
    
    if (name === "") return alert("닉네임을 입력하세요!");
    if (players.length >= 4) return alert("최대 4명까지만 가능합니다!");
    
    const newPlayer = {
        id: players.length,
        name: name,
        pos: 0,
        emoji: emojis[players.length]
    };
    
    players.push(newPlayer);
    updateLobby();
    input.value = "";
}

function updateLobby() {
    const list = document.getElementById('player-list');
    list.innerHTML = players.map(p => `<li>${p.emoji} ${p.name}</li>`).join('');
    document.getElementById('player-count').innerText = players.length;
    document.getElementById('start-btn').disabled = players.length < 2; // 최소 2명
}

// 게임 시작
function startGame() {
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    document.getElementById('game-screen').style.flexDirection = 'column';
    document.getElementById('game-screen').style.alignItems = 'center';
    
    initBoard();
    players.forEach(p => {
        const piece = document.getElementById(`player-${p.id}`);
        piece.style.display = 'flex';
        piece.innerText = p.emoji;
    });
    updateTurnDisplay();
}

function initBoard() {
    const board = document.getElementById('board');
    boardMissions.forEach((mission, i) => {
        const div = document.createElement('div');
        div.className = 'cell';
        div.id = `cell-${i}`;
        div.innerText = mission;
        
        let row, col;
        if (i < 8) { row = 1; col = i + 1; }
        else if (i < 12) { row = i - 8 + 2; col = 8; }
        else if (i < 20) { row = 6; col = 8 - (i - 12); }
        else { row = 6 - (i - 20) - 1; col = 1; }
        
        div.style.gridRow = row; div.style.gridColumn = col;
        board.appendChild(div);
    });
    updatePieces();
}

function updatePieces() {
    players.forEach(p => {
        const target = document.getElementById(`cell-${p.pos}`);
        const piece = document.getElementById(`player-${p.id}`);
        
        // 4명이 겹치지 않게 배치하는 오프셋
        const offsets = [
            { x: -10, y: -10 }, { x: 10, y: -10 },
            { x: -10, y: 10 }, { x: 10, y: 10 }
        ];

        const top = target.offsetTop + (target.offsetHeight/2) - (piece.offsetHeight/2) + offsets[p.id].y;
        const left = target.offsetLeft + (target.offsetWidth/2) - (piece.offsetWidth/2) + offsets[p.id].x;
        
        piece.style.top = `${top}px`;
        piece.style.left = `${left}px`;
    });
}

function updateTurnDisplay() {
    const p = players[currentTurn];
    const display = document.getElementById('turn-display');
    display.innerText = `현재 차례: ${p.emoji} ${p.name}`;
    display.style.color = getPlayerColor(p.id);
}

function getPlayerColor(id) {
    return ["#ff4081", "#1976d2", "#7b1fa2", "#2e7d32"][id];
}

function rollDice() {
    const dice = Math.floor(Math.random() * 6) + 1;
    document.getElementById('dice-value').innerText = `🎲 ${dice}`;
    
    players[currentTurn].pos = (players[currentTurn].pos + dice) % boardMissions.length;
    updatePieces();
    
    document.getElementById('mission-text').innerText = `${players[currentTurn].name}: [${boardMissions[players[currentTurn].pos]}]`;
    
    currentTurn = (currentTurn + 1) % players.length;
    updateTurnDisplay();
}

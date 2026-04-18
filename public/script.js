const socket = io();
const missions = ["출발", "술한잔", "노래", "안주", "더블", "사랑해", "물한잔", "무인도", "귀요미", "애교", "얼빡샷", "세계여행", "적립", "한잔", "물한잔", "안주", "술한잔", "스쿼트", "Q&A", "청산", "매도", "메롱", "의리주", "하이볼"];

function join() {
    const nick = document.getElementById('nick-input').value.trim();
    const img = document.getElementById('img-input').value.trim();
    if(nick) {
        socket.emit('joinGame', { nickname: nick, imgUrl: img });
        document.getElementById('lobby').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
    } else {
        alert("닉네임을 입력하세요!");
    }
}

function roll() {
    socket.emit('rollDice');
}

socket.on('updateGameState', (data) => {
    renderBoard();
    const piecesLayer = document.getElementById('pieces-layer');
    piecesLayer.innerHTML = ''; 

    Object.values(data.players).forEach((p) => {
        const piece = document.createElement('div');
        piece.className = 'player-piece';
        if (p.customImg) {
            piece.style.backgroundImage = `url('${p.customImg}')`;
            piece.innerText = '';
        } else {
            piece.innerText = p.emoji;
            piece.style.backgroundColor = p.color;
        }
        piecesLayer.appendChild(piece);
        
        const cell = document.getElementById(`cell-${p.pos}`);
        
        // 말이 65px로 커졌으므로 120x130 칸 안에서 안전하게 분산
        // 너무 가장자리로 나가지 않게 5~50 범위로 조정
        const randomX = Math.random() * 45 + 5; 
        const randomY = Math.random() * 55 + 5; 
        
        piece.style.top = (cell.offsetTop + randomY) + "px";
        piece.style.left = (cell.offsetLeft + randomX) + "px";
    });

    const turnPlayer = data.players[data.currentTurn];
    const isMyTurn = socket.id === data.currentTurn;
    const infoDisplay = document.getElementById('turn-info');
    const rollBtn = document.getElementById('roll-btn');

    if (isMyTurn) {
        infoDisplay.innerText = `★ 내 차례! 주사위를 던지세요! ★`;
        rollBtn.disabled = false;
    } else {
        infoDisplay.innerText = `현재 차례: ${turnPlayer ? turnPlayer.name : "대기 중"}`;
        rollBtn.disabled = true;
    }
});

socket.on('diceResult', (data) => {
    document.getElementById('status-msg').innerText = `${data.playerName}: 🎲${data.dice} ➔ [${missions[data.newPos]}]`;
});

function renderBoard() {
    const board = document.getElementById('board');
    if (document.querySelector('.cell')) return;
    missions.forEach((m, i) => {
        const div = document.createElement('div');
        div.className = 'cell';
        div.id = `cell-${i}`;
        div.innerText = m;
        let r, c;
        if(i<8){r=1;c=i+1}else if(i<12){r=i-8+2;c=8}else if(i<20){r=6;c=8-(i-12)}else{r=6-(i-20)-1;c=1}
        div.style.gridRow = r; div.style.gridColumn = c;
        board.appendChild(div);
    });
}

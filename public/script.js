const socket = io(); // 서버 연결

const missions = [
    "출발", "술한잔", "노래", "안주", "더블", "사랑해", "물한잔", "무인도", 
    "귀요미", "애교", "얼빡샷", "세계여행", 
    "적립", "한잔", "물한잔", "안주", "술한잔", "스쿼트", "Q&A", "청산", 
    "매도", "메롱", "의리주", "하이볼"
];

// 게임 입장
function join() {
    const nick = document.getElementById('nick-input').value.trim();
    if(nick) {
        socket.emit('joinGame', nick);
        document.getElementById('lobby').style.display = 'none';
        document.getElementById('game-screen').style.display = 'flex';
        document.getElementById('game-screen').style.flexDirection = 'column';
        document.getElementById('game-screen').style.alignItems = 'center';
    } else {
        alert("닉네임을 입력해주세요!");
    }
}

// 주사위 굴리기 요청
function roll() {
    socket.emit('rollDice');
}

// 게임 상태 업데이트 (턴 확인 및 말 위치 갱신)
socket.on('updateGameState', (data) => {
    renderBoard(); // 보드판 그리기
    const piecesLayer = document.getElementById('pieces-layer');
    piecesLayer.innerHTML = ''; 

    const playersArray = Object.values(data.players);
    
    playersArray.forEach((p, index) => {
        const piece = document.createElement('div');
        piece.className = 'player-piece';
        piece.innerText = p.emoji;
        
        // 색상 부여 (순서대로)
        const colors = ["#ff80ab", "#82b1ff", "#b39ddb", "#a5d6a7"];
        piece.style.backgroundColor = colors[index % 4];
        
        piecesLayer.appendChild(piece);
        
        // 위치 업데이트
        const cell = document.getElementById(`cell-${p.pos}`);
        // 4명이 한 칸에 있을 때 겹치지 않게 오프셋 계산
        const offsets = [
            {x: 5, y: 5}, {x: 40, y: 5},
            {x: 5, y: 40}, {x: 40, y: 40}
        ];
        const offset = offsets[index % 4];

        piece.style.top = (cell.offsetTop + offset.y) + "px";
        piece.style.left = (cell.offsetLeft + offset.x) + "px";
    });

    // 내 차례인지 확인하여 버튼 제어
    const turnName = data.players[data.currentTurn]?.name || "기다리는 중...";
    const infoDisplay = document.getElementById('turn-info');
    const rollBtn = document.getElementById('roll-btn');

    if (socket.id === data.currentTurn) {
        infoDisplay.innerText = `★ 지금 내 차례입니다! ★`;
        infoDisplay.style.color = "#ff4081";
        rollBtn.disabled = false;
        rollBtn.innerText = "🎲 주사위 던지기";
    } else {
        infoDisplay.innerText = `현재 차례: ${turnName}`;
        infoDisplay.style.color = "#888";
        rollBtn.disabled = true;
        rollBtn.innerText = "상대방 차례 대기 중...";
    }
});

// 주사위 결과 수신
socket.on('diceResult', (data) => {
    const mission = missions[data.newPos];
    document.getElementById('status-msg').innerText = `${data.playerName}님 🎲${data.dice} ➔ [${mission}]`;
});

// 보드판 렌더링 함수
function renderBoard() {
    const board = document.getElementById('board');
    if (document.querySelector('.cell')) return; // 이미 그려졌으면 중단
    
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

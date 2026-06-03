
document.addEventListener('DOMContentLoaded', () => {
    const BOARD_SIZE = 9;
    const MINE_COUNT = 10;
    let board = [];
    let revealedCount = 0;
    let flaggedCount = 0;
    let gameOver = false;
    let timer = 0;
    let timerInterval = null;
    
    const gameBoard = document.getElementById('game-board');
    const mineCountDisplay = document.getElementById('mine-count');
    const timerDisplay = document.getElementById('timer');
    const resetBtn = document.getElementById('reset-btn');
    
    // 初始化游戏
    function initGame() {
        clearInterval(timerInterval);
        timer = 0;
        timerDisplay.textContent = timer;
        revealedCount = 0;
        flaggedCount = 0;
        gameOver = false;
        mineCountDisplay.textContent = MINE_COUNT - flaggedCount;
        
        // 创建空白棋盘
        board = Array(BOARD_SIZE).fill().map(() => 
            Array(BOARD_SIZE).fill().map(() => ({
                isMine: false,
                revealed: false,
                flagged: false,
                adjacentMines: 0
            }))
        );
        
        // 放置地雷
        placeMines();
        
        // 计算每个格子周围的地雷数
        calculateAdjacentMines();
        
        // 渲染棋盘
        renderBoard();
    }
    
    // 随机放置地雷
    function placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < MINE_COUNT) {
            const row = Math.floor(Math.random() * BOARD_SIZE);
            const col = Math.floor(Math.random() * BOARD_SIZE);
            
            if (!board[row][col].isMine) {
                board[row][col].isMine = true;
                minesPlaced++;
            }
        }
    }
    
    // 计算每个格子周围的地雷数
    function calculateAdjacentMines() {
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (board[row][col].isMine) continue;
                
                let count = 0;
                // 检查周围8个格子
                for (let r = Math.max(0, row - 1); r <= Math.min(BOARD_SIZE - 1, row + 1); r++) {
                    for (let c = Math.max(0, col - 1); c <= Math.min(BOARD_SIZE - 1, col + 1); c++) {
                        if (board[r][c].isMine) count++;
                    }
                }
                board[row][col].adjacentMines = count;
            }
        }
    }
    
    // 渲染棋盘
    function renderBoard() {
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                const cellData = board[row][col];
                
                if (cellData.revealed) {
                    cell.classList.add('revealed');
                    if (cellData.isMine) {
                        cell.classList.add('mine');
                        cell.textContent = '💣';
                    } else if (cellData.adjacentMines > 0) {
                        cell.textContent = cellData.adjacentMines;
                        cell.classList.add(`number-${cellData.adjacentMines}`);
                    }
                } else if (cellData.flagged) {
                    cell.classList.add('flagged');
                    cell.textContent = '🚩';
                }
                
                cell.addEventListener('click', () => handleCellClick(row, col));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    handleRightClick(row, col);
                });
                
                gameBoard.appendChild(cell);
            }
        }
    }
    
    // 处理格子点击
    function handleCellClick(row, col) {
        if (gameOver || board[row][col].revealed || board[row][col].flagged) return;
        
        // 开始计时
        if (revealedCount === 0 && flaggedCount === 0) {
            startTimer();
        }
        
        // 揭开格子
        revealCell(row, col);
        
        // 检查游戏状态
        checkGameStatus();
    }
    
    // 处理右键点击（标记）
    function handleRightClick(row, col) {
        if (gameOver || board[row][col].revealed) return;
        
        const cellData = board[row][col];
        cellData.flagged = !cellData.flagged;
        
        if (cellData.flagged) {
            flaggedCount++;
        } else {
            flaggedCount--;
        }
        
        mineCountDisplay.textContent = MINE_COUNT - flaggedCount;
        renderBoard();
    }
    
    // 揭开格子
    function revealCell(row, col) {
        if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE || 
            board[row][col].revealed || board[row][col].flagged) {
            return;
        }
        
        board[row][col].revealed = true;
        revealedCount++;
        
        // 如果是地雷，游戏结束
        if (board[row][col].isMine) {
            gameOver = true;
            revealAllMines();
            clearInterval(timerInterval);
            setTimeout(() => alert('游戏结束！你踩到地雷了！'), 100);
            return;
        }
        
        // 如果是空白格子，自动揭开周围的格子
        if (board[row][col].adjacentMines === 0) {
            for (let r = Math.max(0, row - 1); r <= Math.min(BOARD_SIZE - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(BOARD_SIZE - 1, col + 1); c++) {
                    if (r !== row || c !== col) {
                        revealCell(r, c);
                    }
                }
            }
        }
        
        renderBoard();
    }
    
    // 揭开所有地雷
    function revealAllMines() {
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (board[row][col].isMine) {
                    board[row][col].revealed = true;
                }
            }
        }
        renderBoard();
    }
    
    // 检查游戏状态
    function checkGameStatus() {
        // 检查是否获胜
        if (revealedCount === BOARD_SIZE * BOARD_SIZE - MINE_COUNT) {
            gameOver = true;
            clearInterval(timerInterval);
            setTimeout(() => alert(`恭喜你赢了！用时: ${timer}秒`), 100);
        }
    }
    
    // 开始计时器
    function startTimer() {
        clearInterval(timerInterval);
        timer = 0;
        timerDisplay.textContent = timer;
        timerInterval = setInterval(() => {
            timer++;
            timerDisplay.textContent = timer;
        }, 1000);
    }
    
    // 重置游戏
    resetBtn.addEventListener('click', initGame);
    
    // 初始化游戏
    initGame();
});

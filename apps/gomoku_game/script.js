// ===== 游戏常量 =====
const BOARD_SIZE = 15;
const EMPTY = 0;
const BLACK = 1; // 玩家
const WHITE = 2; // AI

// ===== 游戏状态 =====
let board = [];
let currentPlayer = BLACK;
let gameOver = false;
let moveHistory = [];
let aiDepth = 2; // 默认中等难度

// ===== Canvas 相关 =====
let canvas;
let ctx;
let cellSize;
let padding;
let boardSize;

// ===== DOM 元素 =====
const currentPlayerElement = document.getElementById('currentPlayer');
const gameStatusElement = document.getElementById('gameStatus');
const difficultySelect = document.getElementById('difficulty');
const undoBtn = document.getElementById('undoBtn');
const resetBtn = document.getElementById('resetBtn');

// ===== 初始化游戏 =====
function initGame() {
    // 初始化棋盘数组
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY));
    currentPlayer = BLACK;
    gameOver = false;
    moveHistory = [];

    // 初始化 Canvas
    canvas = document.getElementById('board');
    ctx = canvas.getContext('2d');

    // 设置 Canvas 尺寸
    const maxSize = Math.min(600, window.innerWidth * 0.9);
    boardSize = maxSize;
    padding = boardSize * 0.05;
    cellSize = (boardSize - 2 * padding) / (BOARD_SIZE - 1);

    canvas.width = boardSize;
    canvas.height = boardSize;
    canvas.style.width = boardSize + 'px';
    canvas.style.height = boardSize + 'px';

    // 绘制棋盘
    drawBoard();

    // 添加点击事件
    canvas.addEventListener('click', handleCanvasClick);

    updateStatus();
    updateButtons();
}

// ===== 绘制棋盘 =====
function drawBoard() {
    // 清空画布
    ctx.clearRect(0, 0, boardSize, boardSize);

    // 绘制背景
    ctx.fillStyle = '#deb887';
    ctx.fillRect(0, 0, boardSize, boardSize);

    // 绘制网格线
    ctx.strokeStyle = '#8b7355';
    ctx.lineWidth = 1;

    for (let i = 0; i < BOARD_SIZE; i++) {
        const pos = padding + i * cellSize;

        // 横线
        ctx.beginPath();
        ctx.moveTo(padding, pos);
        ctx.lineTo(boardSize - padding, pos);
        ctx.stroke();

        // 竖线
        ctx.beginPath();
        ctx.moveTo(pos, padding);
        ctx.lineTo(pos, boardSize - padding);
        ctx.stroke();
    }

    // 绘制星位
    const starPositions = [
        [3, 3], [3, 7], [3, 11],
        [7, 3], [7, 7], [7, 11],
        [11, 3], [11, 7], [11, 11]
    ];

    ctx.fillStyle = '#6b5745';
    starPositions.forEach(([row, col]) => {
        const x = padding + col * cellSize;
        const y = padding + row * cellSize;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // 重新绘制所有棋子
    redrawPieces();
}

// ===== 重新绘制所有棋子 =====
function redrawPieces() {
    moveHistory.forEach((move, index) => {
        const isLastMove = index === moveHistory.length - 1;
        drawPiece(move.row, move.col, move.player, isLastMove);
    });
}

// ===== 绘制棋子 =====
function drawPiece(row, col, player, isLastMove = false) {
    const x = padding + col * cellSize;
    const y = padding + row * cellSize;
    const radius = cellSize * 0.4;

    // 绘制阴影
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // 绘制棋子
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);

    if (player === BLACK) {
        // 黑色棋子渐变
        const gradient = ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, 0,
            x, y, radius
        );
        gradient.addColorStop(0, '#3a3a3a');
        gradient.addColorStop(1, '#1a1a1a');
        ctx.fillStyle = gradient;
    } else {
        // 白色棋子渐变
        const gradient = ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, 0,
            x, y, radius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, '#f5f5f5');
        ctx.fillStyle = gradient;
    }

    ctx.fill();
    ctx.restore();

    // 绘制最后一步标记
    if (isLastMove) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ===== 处理 Canvas 点击 =====
function handleCanvasClick(e) {
    if (gameOver || currentPlayer !== BLACK) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // 转换为棋盘坐标
    const col = Math.round((clickX - padding) / cellSize);
    const row = Math.round((clickY - padding) / cellSize);

    // 检查是否在棋盘范围内
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return;

    // 检查该位置是否已有棋子
    if (board[row][col] !== EMPTY) return;

    makeMove(row, col, BLACK);

    if (!gameOver) {
        // AI 回合
        currentPlayer = WHITE;
        updateStatus();
        setTimeout(() => {
            aiMove();
        }, 500);
    }
}

// ===== 执行移动 =====
function makeMove(row, col, player) {
    board[row][col] = player;
    moveHistory.push({ row, col, player });

    // 重绘棋盘
    drawBoard();

    // 检查胜利
    if (checkWin(row, col, player)) {
        gameOver = true;
        const winner = player === BLACK ? '黑方 (玩家)' : '白方 (AI)';
        gameStatusElement.textContent = `🎉 ${winner} 获胜！`;
        gameStatusElement.style.color = '#10b981';
        return;
    }

    // 检查平局
    if (isBoardFull()) {
        gameOver = true;
        gameStatusElement.textContent = '⚖️ 平局！';
        gameStatusElement.style.color = '#f59e0b';
        return;
    }

    currentPlayer = player === BLACK ? WHITE : BLACK;
    updateStatus();
    updateButtons();
}

// ===== AI 移动 =====
function aiMove() {
    if (gameOver) return;

    const move = findBestMove();
    if (move) {
        makeMove(move.row, move.col, WHITE);
    }
}

// ===== Minimax 算法寻找最佳移动 =====
function findBestMove() {
    let bestScore = -Infinity;
    let bestMove = null;
    const moves = generateMoves();

    for (const move of moves) {
        board[move.row][move.col] = WHITE;
        const score = minimax(aiDepth - 1, -Infinity, Infinity, false);
        board[move.row][move.col] = EMPTY;

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
}

// ===== Minimax 算法（带 Alpha-Beta 剪枝）=====
function minimax(depth, alpha, beta, isMaximizing) {
    // 检查终止条件
    const lastMove = moveHistory[moveHistory.length - 1];
    if (lastMove && checkWin(lastMove.row, lastMove.col, lastMove.player)) {
        return lastMove.player === WHITE ? 10000 : -10000;
    }

    if (depth === 0 || isBoardFull()) {
        return evaluateBoard();
    }

    const moves = generateMoves();

    if (isMaximizing) {
        let maxScore = -Infinity;
        for (const move of moves) {
            board[move.row][move.col] = WHITE;
            moveHistory.push({ row: move.row, col: move.col, player: WHITE });

            const score = minimax(depth - 1, alpha, beta, false);

            board[move.row][move.col] = EMPTY;
            moveHistory.pop();

            maxScore = Math.max(maxScore, score);
            alpha = Math.max(alpha, score);
            if (beta <= alpha) break;
        }
        return maxScore;
    } else {
        let minScore = Infinity;
        for (const move of moves) {
            board[move.row][move.col] = BLACK;
            moveHistory.push({ row: move.row, col: move.col, player: BLACK });

            const score = minimax(depth - 1, alpha, beta, true);

            board[move.row][move.col] = EMPTY;
            moveHistory.pop();

            minScore = Math.min(minScore, score);
            beta = Math.min(beta, score);
            if (beta <= alpha) break;
        }
        return minScore;
    }
}

// ===== 生成候选移动 =====
function generateMoves() {
    const moves = [];
    const range = 2; // 只考虑已有棋子周围的位置

    if (moveHistory.length === 0) {
        // 第一步，下在中心
        return [{ row: 7, col: 7 }];
    }

    const occupied = new Set();

    // 找出所有已有棋子周围的空位
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] !== EMPTY) continue;

            let hasNeighbor = false;
            for (let dr = -range; dr <= range; dr++) {
                for (let dc = -range; dc <= range; dc++) {
                    const nr = row + dr;
                    const nc = col + dc;
                    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                        if (board[nr][nc] !== EMPTY) {
                            hasNeighbor = true;
                            break;
                        }
                    }
                }
                if (hasNeighbor) break;
            }

            if (hasNeighbor) {
                const key = `${row},${col}`;
                if (!occupied.has(key)) {
                    moves.push({ row, col });
                    occupied.add(key);
                }
            }
        }
    }

    // 限制候选移动数量以提高性能
    if (moves.length > 20) {
        // 根据评分排序，只保留前20个
        moves.sort((a, b) => {
            const scoreA = evaluatePosition(a.row, a.col);
            const scoreB = evaluatePosition(b.row, b.col);
            return scoreB - scoreA;
        });
        return moves.slice(0, 20);
    }

    return moves;
}

// ===== 评估单个位置的价值 =====
function evaluatePosition(row, col) {
    let score = 0;

    // 临时放置棋子进行评估
    board[row][col] = WHITE;
    score += evaluatePlayerAtPosition(row, col, WHITE) * 1.1; // AI 进攻
    board[row][col] = BLACK;
    score += evaluatePlayerAtPosition(row, col, BLACK); // 防守
    board[row][col] = EMPTY;

    return score;
}

// ===== 评估整个棋盘 =====
function evaluateBoard() {
    let score = 0;

    // 评估所有位置
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === WHITE) {
                score += evaluatePlayerAtPosition(row, col, WHITE);
            } else if (board[row][col] === BLACK) {
                score -= evaluatePlayerAtPosition(row, col, BLACK);
            }
        }
    }

    return score;
}

// ===== 评估某个玩家在特定位置的得分 =====
function evaluatePlayerAtPosition(row, col, player) {
    let score = 0;
    const directions = [
        [0, 1],   // 横
        [1, 0],   // 竖
        [1, 1],   // 斜 \
        [1, -1]   // 斜 /
    ];

    for (const [dr, dc] of directions) {
        const line = getLine(row, col, dr, dc, player);
        score += evaluateLine(line);
    }

    return score;
}

// ===== 获取某个方向的连续棋子信息 =====
function getLine(row, col, dr, dc, player) {
    let count = 1; // 当前位置
    let openEnds = 0;

    // 向前检查
    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
        count++;
        r += dr;
        c += dc;
    }
    if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === EMPTY) {
        openEnds++;
    }

    // 向后检查
    r = row - dr;
    c = col - dc;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
        count++;
        r -= dr;
        c -= dc;
    }
    if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === EMPTY) {
        openEnds++;
    }

    return { count, openEnds };
}

// ===== 评估一条线的得分 =====
function evaluateLine(line) {
    const { count, openEnds } = line;

    if (count >= 5) return 100000; // 五连

    if (count === 4) {
        if (openEnds === 2) return 10000; // 活四
        if (openEnds === 1) return 1000;  // 冲四
    }

    if (count === 3) {
        if (openEnds === 2) return 1000;  // 活三
        if (openEnds === 1) return 100;   // 眠三
    }

    if (count === 2) {
        if (openEnds === 2) return 100;   // 活二
        if (openEnds === 1) return 10;    // 眠二
    }

    if (count === 1) {
        if (openEnds === 2) return 10;    // 活一
    }

    return 0;
}

// ===== 检查胜利 =====
function checkWin(row, col, player) {
    const directions = [
        [0, 1],   // 横
        [1, 0],   // 竖
        [1, 1],   // 斜 \
        [1, -1]   // 斜 /
    ];

    for (const [dr, dc] of directions) {
        let count = 1;

        // 向前检查
        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
            count++;
            r += dr;
            c += dc;
        }

        // 向后检查
        r = row - dr;
        c = col - dc;
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
            count++;
            r -= dr;
            c -= dc;
        }

        if (count >= 5) return true;
    }

    return false;
}

// ===== 检查棋盘是否已满 =====
function isBoardFull() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === EMPTY) return false;
        }
    }
    return true;
}

// ===== 悔棋 =====
function undo() {
    if (moveHistory.length < 2) return; // 至少需要两步（玩家和AI各一步）

    // 撤销 AI 的移动
    const aiMove = moveHistory.pop();
    board[aiMove.row][aiMove.col] = EMPTY;

    // 撤销玩家的移动
    const playerMove = moveHistory.pop();
    board[playerMove.row][playerMove.col] = EMPTY;

    currentPlayer = BLACK;
    gameOver = false;

    // 重绘棋盘
    drawBoard();

    updateStatus();
    updateButtons();
}

// ===== 重置游戏 =====
function reset() {
    initGame();
}

// ===== 更新状态显示 =====
function updateStatus() {
    if (!gameOver) {
        if (currentPlayer === BLACK) {
            currentPlayerElement.innerHTML = '<span class="player-indicator black">●</span> 黑方 (玩家)';
            gameStatusElement.textContent = '请落子...';
            gameStatusElement.style.color = 'var(--accent-primary)';
        } else {
            currentPlayerElement.innerHTML = '<span class="player-indicator white">●</span> 白方 (AI)';
            gameStatusElement.textContent = 'AI 思考中...';
            gameStatusElement.style.color = 'var(--accent-secondary)';
        }
    }
}

// ===== 更新按钮状态 =====
function updateButtons() {
    undoBtn.disabled = moveHistory.length < 2 || gameOver;
}

// ===== 窗口大小改变时重绘 =====
window.addEventListener('resize', () => {
    if (canvas) {
        initGame();
        // 恢复之前的游戏状态
        const tempHistory = [...moveHistory];
        const tempPlayer = currentPlayer;
        const tempGameOver = gameOver;

        board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY));
        moveHistory = [];

        tempHistory.forEach(move => {
            board[move.row][move.col] = move.player;
            moveHistory.push(move);
        });

        currentPlayer = tempPlayer;
        gameOver = tempGameOver;
        drawBoard();
    }
});

// ===== 事件监听 =====
difficultySelect.addEventListener('change', (e) => {
    aiDepth = parseInt(e.target.value);
});

undoBtn.addEventListener('click', undo);
resetBtn.addEventListener('click', reset);

// ===== 启动游戏 =====
initGame();

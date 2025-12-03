class Game2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.bestScore = this.loadBestScore();
        this.size = 4;
        this.gameOver = false;
        this.gameWon = false;

        this.gridContainer = document.getElementById('grid-container');
        this.tileContainer = document.getElementById('tile-container');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.gameMessage = document.getElementById('game-message');
        this.messageText = document.getElementById('message-text');

        this.initGrid();
        this.setupEvents();
        this.newGame();
    }

    initGrid() {
        for (let i = 0; i < this.size * this.size; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            this.gridContainer.appendChild(cell);
        }
    }

    setupEvents() {
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.newGame();
        });

        document.getElementById('retry-btn').addEventListener('click', () => {
            this.hideMessage();
            this.newGame();
        });

        // 键盘事件（用于桌面测试）
        document.addEventListener('keydown', (e) => {
            if (this.gameOver && !this.gameWon) return;

            const keyMap = {
                'ArrowUp': 'up',
                'ArrowDown': 'down',
                'ArrowLeft': 'left',
                'ArrowRight': 'right',
                'w': 'up',
                'W': 'up',
                's': 'down',
                'S': 'down',
                'a': 'left',
                'A': 'left',
                'd': 'right',
                'D': 'right'
            };

            const direction = keyMap[e.key];
            if (direction) {
                e.preventDefault();
                this.move(direction);
            }
        });

        // 优化的触摸事件处理
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        const minSwipeDistance = 30; // 最小滑动距离
        const maxSwipeTime = 500; // 最大滑动时间（毫秒）

        this.gridContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
        }, { passive: false });

        this.gridContainer.addEventListener('touchmove', (e) => {
            e.preventDefault(); // 防止页面滚动
        }, { passive: false });

        this.gridContainer.addEventListener('touchend', (e) => {
            if (!e.changedTouches.length) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndTime = Date.now();

            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            const timeDiff = touchEndTime - touchStartTime;

            // 检查是否是有效的滑动
            if (timeDiff > maxSwipeTime) return;

            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            // 确定是水平还是垂直滑动
            if (Math.max(absDx, absDy) < minSwipeDistance) return;

            if (absDx > absDy) {
                // 水平滑动
                if (dx > 0) {
                    this.move('right');
                } else {
                    this.move('left');
                }
            } else {
                // 垂直滑动
                if (dy > 0) {
                    this.move('down');
                } else {
                    this.move('up');
                }
            }
        });

        // 添加震动反馈（如果设备支持）
        this.vibrate = (pattern) => {
            if ('vibrate' in navigator) {
                navigator.vibrate(pattern);
            }
        };
    }

    newGame() {
        this.grid = [];
        this.score = 0;
        this.gameOver = false;
        this.gameWon = false;

        for (let i = 0; i < this.size; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j] = 0;
            }
        }

        this.addRandomTile();
        this.addRandomTile();

        this.updateScore();
        this.render();
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }

        if (emptyCells.length === 0) return;

        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
    }

    move(direction) {
        let moved = false;
        const oldGrid = JSON.parse(JSON.stringify(this.grid));

        if (direction === 'up') moved = this.moveUp();
        else if (direction === 'down') moved = this.moveDown();
        else if (direction === 'left') moved = this.moveLeft();
        else if (direction === 'right') moved = this.moveRight();

        if (moved) {
            this.vibrate(10); // 轻微震动反馈
            this.addRandomTile();
            this.render();

            if (!this.canMove()) {
                this.gameOver = true;
                this.vibrate([100, 50, 100]); // 游戏结束震动
                setTimeout(() => this.showMessage('游戏结束！'), 500);
            }
        }
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            const merged = [];

            for (let j = 0; j < row.length; j++) {
                if (j < row.length - 1 && row[j] === row[j + 1]) {
                    merged.push(row[j] * 2);
                    this.score += row[j] * 2;

                    if (row[j] * 2 === 2048 && !this.gameWon) {
                        this.gameWon = true;
                        this.vibrate([200, 100, 200, 100, 200]); // 胜利震动
                        setTimeout(() => this.showMessage('恭喜你赢了！'), 500);
                    }

                    j++;
                } else {
                    merged.push(row[j]);
                }
            }

            while (merged.length < this.size) {
                merged.push(0);
            }

            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== merged[j]) {
                    moved = true;
                }
                this.grid[i][j] = merged[j];
            }
        }

        if (moved) this.updateScore();
        return moved;
    }

    moveRight() {
        this.reverseGrid();
        const moved = this.moveLeft();
        this.reverseGrid();
        return moved;
    }

    moveUp() {
        this.transposeGrid();
        const moved = this.moveLeft();
        this.transposeGrid();
        return moved;
    }

    moveDown() {
        this.transposeGrid();
        this.reverseGrid();
        const moved = this.moveLeft();
        this.reverseGrid();
        this.transposeGrid();
        return moved;
    }

    transposeGrid() {
        const newGrid = [];
        for (let i = 0; i < this.size; i++) {
            newGrid[i] = [];
            for (let j = 0; j < this.size; j++) {
                newGrid[i][j] = this.grid[j][i];
            }
        }
        this.grid = newGrid;
    }

    reverseGrid() {
        for (let i = 0; i < this.size; i++) {
            this.grid[i].reverse();
        }
    }

    canMove() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) return true;
            }
        }

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                if (j < this.size - 1 && current === this.grid[i][j + 1]) return true;
                if (i < this.size - 1 && current === this.grid[i + 1][j]) return true;
            }
        }

        return false;
    }

    render() {
        this.tileContainer.innerHTML = '';

        const containerWidth = this.gridContainer.offsetWidth;
        const gap = 12;
        const tileSize = (containerWidth - gap * (this.size - 1)) / this.size;

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = this.grid[i][j];
                if (value === 0) continue;

                const tile = document.createElement('div');
                tile.className = `tile tile-${value}`;
                tile.textContent = value;

                const left = j * (tileSize + gap);
                const top = i * (tileSize + gap);

                tile.style.width = `${tileSize}px`;
                tile.style.height = `${tileSize}px`;
                tile.style.left = `${left}px`;
                tile.style.top = `${top}px`;

                this.tileContainer.appendChild(tile);
            }
        }
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.saveBestScore();
        }
        this.bestScoreElement.textContent = this.bestScore;
    }

    showMessage(message) {
        this.messageText.textContent = message;
        this.gameMessage.classList.add('show');
    }

    hideMessage() {
        this.gameMessage.classList.remove('show');
    }

    saveBestScore() {
        localStorage.setItem('2048-mobile-best-score', this.bestScore);
    }

    loadBestScore() {
        return parseInt(localStorage.getItem('2048-mobile-best-score')) || 0;
    }
}

// 初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});

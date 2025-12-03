// UNO 游戏类
class UNOGame {
    constructor() {
        this.deck = [];
        this.playerHand = [];
        this.aiHand = [];
        this.discardPile = [];
        this.currentColor = null;
        this.currentValue = null;
        this.currentPlayer = 'player'; // 'player' or 'ai'
        this.direction = 1; // 1: 顺时针, -1: 逆时针
        this.wildColorCallback = null;
        this.gameEnded = false;
        this.draggedCard = null;
        this.draggedCardIndex = null;
        this.isProcessing = false; // 防止重复操作

        this.initializeElements();
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeElements() {
        this.drawPileEl = document.getElementById('draw-pile');
        this.discardPileEl = document.getElementById('discard-pile');
        this.cardsContainerEl = document.getElementById('cards-container');
        this.aiCardsContainerEl = document.getElementById('ai-cards-container');
        this.aiCardCountEl = document.getElementById('ai-card-count');
        this.currentTurnEl = document.getElementById('current-turn');
        this.colorPickerEl = document.getElementById('color-picker');
        this.gameOverEl = document.getElementById('game-over');
        this.messageToastEl = document.getElementById('message-toast');
        this.unoButtonEl = document.getElementById('uno-button');
        this.winnerTextEl = document.getElementById('winner-text');
        this.winnerSubtitleEl = document.getElementById('winner-subtitle');
    }

    setupEventListeners() {
        // 抽牌堆点击
        this.drawPileEl.addEventListener('click', () => this.handleDrawPileClick());

        // 重新开始（游戏结束时）
        document.getElementById('btn-restart').addEventListener('click', () => {
            this.gameOverEl.classList.remove('show');
            this.initializeGame();
        });

        // 重新开始（游戏中）
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                if (confirm('确定要重新开始游戏吗？')) {
                    this.initializeGame();
                }
            });
        }

        // UNO 按钮
        this.unoButtonEl.addEventListener('click', () => {
            this.showMessage('UNO!');
            this.unoButtonEl.classList.remove('show');
        });

        // 颜色选择
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                this.colorPickerEl.classList.remove('show');
                if (this.wildColorCallback) {
                    this.wildColorCallback(color);
                    this.wildColorCallback = null;
                }
            });
        });

        // 设置弃牌堆拖放目标
        this.setupDiscardPileDragTarget();
    }

    setupDiscardPileDragTarget() {
        this.discardPileEl.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        this.discardPileEl.addEventListener('drop', (e) => {
            e.preventDefault();
        });
    }

    handleDrawPileClick() {
        if (this.currentPlayer !== 'player' || this.gameEnded || this.isProcessing) return;

        const playableCards = this.playerHand.filter(card => this.canPlayCard(card));

        if (playableCards.length > 0) {
            this.showMessage('你还有牌可以出！');
            return;
        }

        // 无牌可出，抽一张
        this.drawCardWithAnimation('player', () => {
            this.showMessage('抽了一张牌');
            setTimeout(() => {
                this.switchTurn();
            }, 500);
        });
    }

    handleCardDrag(card, cardIndex, distance, cardElement) {
        if (this.currentPlayer !== 'player' || this.gameEnded || this.isProcessing) return;

        // 只需拖动30px就触发
        if (distance > 30) {
            if (this.canPlayCard(card)) {
                this.isProcessing = true;
                this.playerHand.splice(cardIndex, 1);
                this.unoButtonEl.classList.remove('show');

                // 喊 UNO
                if (this.playerHand.length === 1) {
                    setTimeout(() => this.showMessage('记得喊 UNO!'), 300);
                    setTimeout(() => this.unoButtonEl.classList.add('show'), 500);
                }

                this.playCardWithAnimation(card, 'player', cardElement);
            } else {
                this.showMessage('不能出这张牌！');
                this.renderPlayerHand();
            }
        }

        this.draggedCard = null;
        this.draggedCardIndex = null;
    }

    initializeGame() {
        this.gameEnded = false;
        this.currentPlayer = 'player';
        this.direction = 1;
        this.isProcessing = false;
        this.createDeck();
        this.shuffleDeck();

        // 发牌
        this.playerHand = [];
        this.aiHand = [];
        for (let i = 0; i < 7; i++) {
            this.playerHand.push(this.deck.pop());
            this.aiHand.push(this.deck.pop());
        }

        // 翻开第一张牌
        let firstCard = this.deck.pop();
        // 确保第一张不是万能牌或功能牌
        while (firstCard.color === 'wild' || ['skip', 'reverse', 'draw2'].includes(firstCard.value)) {
            this.deck.unshift(firstCard);
            this.shuffleDeck();
            firstCard = this.deck.pop();
        }

        this.discardPile = [firstCard];
        this.currentColor = firstCard.color;
        this.currentValue = firstCard.value;

        this.renderGame();
        this.updateTurnDisplay();
    }

    createDeck() {
        this.deck = [];
        const colors = ['red', 'yellow', 'green', 'blue'];
        const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'];

        // 数字和功能卡（每种颜色）
        colors.forEach(color => {
            values.forEach(value => {
                this.deck.push({ color, value });
                if (value !== '0') {
                    this.deck.push({ color, value });
                }
            });
        });

        // 万能牌
        for (let i = 0; i < 4; i++) {
            this.deck.push({ color: 'wild', value: 'wild' });
            this.deck.push({ color: 'wild', value: 'draw4' });
        }
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    drawCardWithAnimation(player, callback) {
        if (this.deck.length === 0) {
            const topCard = this.discardPile.pop();
            this.deck = [...this.discardPile];
            this.discardPile = [topCard];
            this.shuffleDeck();
        }

        const card = this.deck.pop();

        // 创建飞入动画 - 使用牌背以保护隐私
        const tempCard = document.createElement('div');
        tempCard.className = 'card card-back';
        tempCard.classList.add('card-draw-animation');
        tempCard.style.width = '110px';
        tempCard.style.height = '162px';

        const drawPileRect = this.drawPileEl.getBoundingClientRect();
        tempCard.style.position = 'fixed';
        tempCard.style.left = drawPileRect.left + 'px';
        tempCard.style.top = drawPileRect.top + 'px';
        tempCard.style.zIndex = '1000';
        document.body.appendChild(tempCard);

        setTimeout(() => {
            if (player === 'player') {
                this.playerHand.push(card);
                const handRect = this.cardsContainerEl.getBoundingClientRect();
                tempCard.style.left = handRect.left + 'px';
                tempCard.style.top = handRect.top + 'px';
                tempCard.style.opacity = '0';
            } else {
                this.aiHand.push(card);
                const aiRect = this.aiCardCountEl.getBoundingClientRect();
                tempCard.style.left = aiRect.left + 'px';
                tempCard.style.top = aiRect.top + 'px';
                tempCard.style.opacity = '0';
            }

            setTimeout(() => {
                document.body.removeChild(tempCard);
                this.renderGame();
                if (callback) callback(card);
            }, 400);
        }, 50);

        return card;
    }

    playCardWithAnimation(card, playerName, cardElement = null) {
        // 创建飞出动画
        const tempCard = this.createCardElement(card, -1);
        tempCard.classList.add('card-play-animation');

        let startRect;
        if (cardElement) {
            // 使用具体卡牌元素的位置（修复点击动画起点）
            startRect = cardElement.getBoundingClientRect();
        } else if (playerName === 'player') {
            startRect = this.cardsContainerEl.getBoundingClientRect();
        } else {
            startRect = this.aiCardCountEl.getBoundingClientRect();
        }

        const discardRect = this.discardPileEl.getBoundingClientRect();

        tempCard.style.position = 'fixed';
        tempCard.style.left = startRect.left + 'px';
        tempCard.style.top = startRect.top + 'px';
        tempCard.style.zIndex = '1000';
        document.body.appendChild(tempCard);

        setTimeout(() => {
            tempCard.style.left = discardRect.left + 'px';
            tempCard.style.top = discardRect.top + 'px';
            tempCard.style.transform = 'scale(1) rotate(0deg)';

            setTimeout(() => {
                document.body.removeChild(tempCard);
                this.renderPlayerHand();
                this.playCard(card, playerName);
            }, 400);
        }, 50);
    }

    canPlayCard(card) {
        if (card.color === 'wild') return true;
        if (card.color === this.currentColor) return true;
        if (card.value === this.currentValue) return true;
        return false;
    }

    playCard(card, playerName) {
        this.discardPile.push(card);

        // 处理特殊卡牌
        if (card.color === 'wild') {
            if (playerName === 'player') {
                this.colorPickerEl.classList.add('show');
                this.wildColorCallback = (color) => {
                    this.currentColor = color;
                    this.currentValue = card.value;
                    this.renderDiscardPile();

                    if (card.value === 'draw4') {
                        this.showMessage('AI 抽4张牌！');
                        this.drawMultipleCards('ai', 4, () => {
                            this.isProcessing = false;
                            this.checkWinCondition();
                            if (!this.gameEnded) {
                                setTimeout(() => this.switchTurn(), 500);
                            }
                        });
                    } else {
                        this.isProcessing = false;
                        this.checkWinCondition();
                        if (!this.gameEnded) {
                            setTimeout(() => this.switchTurn(), 800);
                        }
                    }
                };
                return;
            } else {
                this.currentColor = this.getAIPreferredColor();
                this.currentValue = card.value;

                if (card.value === 'draw4') {
                    this.showMessage('你抽4张牌！');
                    this.drawMultipleCards('player', 4, () => {
                        this.checkWinCondition();
                        if (!this.gameEnded) {
                            setTimeout(() => this.switchTurn(), 500);
                        }
                    });
                    return;
                }
            }
        } else {
            this.currentColor = card.color;
            this.currentValue = card.value;

            if (card.value === 'skip') {
                this.showMessage(playerName === 'player' ? 'AI 跳过回合！' : '你被跳过回合！');
            } else if (card.value === 'reverse') {
                this.direction *= -1;
                this.showMessage('方向反转！');
            } else if (card.value === 'draw2') {
                const opponent = playerName === 'player' ? 'ai' : 'player';
                this.showMessage(playerName === 'player' ? 'AI 抽2张牌！' : '你抽2张牌！');
                this.drawMultipleCards(opponent, 2, () => {
                    this.isProcessing = false;
                    this.checkWinCondition();
                    if (!this.gameEnded) {
                        if (card.value === 'skip') {
                            setTimeout(() => {
                                this.switchTurn();
                                setTimeout(() => this.switchTurn(), 500);
                            }, 500);
                        } else {
                            setTimeout(() => this.switchTurn(), 500);
                        }
                    }
                });
                return;
            }
        }

        this.renderDiscardPile();
        this.isProcessing = false;
        this.checkWinCondition();

        if (!this.gameEnded) {
            if (card.value === 'skip') {
                setTimeout(() => {
                    this.switchTurn();
                    setTimeout(() => this.switchTurn(), 500);
                }, 800);
            } else {
                setTimeout(() => this.switchTurn(), 800);
            }
        }
    }

    drawMultipleCards(player, count, callback) {
        let drawn = 0;
        const drawNext = () => {
            if (drawn < count) {
                this.drawCardWithAnimation(player, () => {
                    drawn++;
                    setTimeout(drawNext, 300);
                });
            } else {
                if (callback) callback();
            }
        };
        drawNext();
    }

    switchTurn() {
        this.currentPlayer = this.currentPlayer === 'player' ? 'ai' : 'player';
        this.updateTurnDisplay();

        if (this.currentPlayer === 'ai') {
            setTimeout(() => this.aiTurn(), 1000);
        } else {
            if (this.playerHand.length === 2) {
                this.unoButtonEl.classList.add('show');
            }
            this.renderPlayerHand();

            // 检查是否有牌可出
            const playableCards = this.playerHand.filter(card => this.canPlayCard(card));
            if (playableCards.length === 0) {
                setTimeout(() => {
                    this.showMessage('没有可出的牌，点击抽牌堆抽牌');
                }, 500);
            }
        }
    }

    aiTurn() {
        if (this.gameEnded) return;

        const playableCards = this.aiHand.filter(card => this.canPlayCard(card));

        if (playableCards.length > 0) {
            this.isProcessing = true;
            let selectedCard = playableCards[0];

            const priority = { 'draw4': 5, 'draw2': 4, 'skip': 3, 'reverse': 2, 'wild': 1 };
            playableCards.forEach(card => {
                const currentPriority = priority[card.value] || 0;
                const selectedPriority = priority[selectedCard.value] || 0;
                if (currentPriority > selectedPriority) {
                    selectedCard = card;
                }
            });

            const cardIndex = this.aiHand.indexOf(selectedCard);
            this.aiHand.splice(cardIndex, 1);

            this.showMessage('AI 出了一张牌');

            if (this.aiHand.length === 1) {
                setTimeout(() => this.showMessage('AI: UNO!'), 300);
            }

            this.renderGame();
            setTimeout(() => {
                this.playCardWithAnimation(selectedCard, 'ai');
            }, 800);
        } else {
            // AI无牌可出，自动抽牌
            this.showMessage('AI 没有可出的牌，抽一张');
            this.drawCardWithAnimation('ai', (drawnCard) => {
                setTimeout(() => {
                    if (this.canPlayCard(drawnCard)) {
                        const cardIndex = this.aiHand.indexOf(drawnCard);
                        this.aiHand.splice(cardIndex, 1);
                        this.renderGame();

                        setTimeout(() => {
                            this.isProcessing = true;
                            this.showMessage('AI 出了抽到的牌');
                            this.playCardWithAnimation(drawnCard, 'ai');
                        }, 500);
                    } else {
                        this.switchTurn();
                    }
                }, 500);
            });
        }
    }

    getAIPreferredColor() {
        const colorCount = { red: 0, yellow: 0, green: 0, blue: 0 };
        this.aiHand.forEach(card => {
            if (card.color !== 'wild') {
                colorCount[card.color]++;
            }
        });

        let maxColor = 'red';
        let maxCount = 0;
        Object.keys(colorCount).forEach(color => {
            if (colorCount[color] > maxCount) {
                maxCount = colorCount[color];
                maxColor = color;
            }
        });

        return maxColor;
    }

    checkWinCondition() {
        if (this.playerHand.length === 0) {
            this.gameEnded = true;
            this.showGameOver('你赢了！', '恭喜你击败了AI对手！');
        } else if (this.aiHand.length === 0) {
            this.gameEnded = true;
            this.showGameOver('AI 赢了！', '下次再接再厉！');
        }
    }

    showGameOver(title, subtitle) {
        setTimeout(() => {
            this.winnerTextEl.textContent = title;
            this.winnerSubtitleEl.textContent = subtitle;
            this.gameOverEl.classList.add('show');
        }, 500);
    }

    updateTurnDisplay() {
        this.currentTurnEl.textContent = this.currentPlayer === 'player' ? '你的回合' : 'AI 的回合';
        this.currentTurnEl.style.background = this.currentPlayer === 'player'
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(255, 193, 7, 0.95)';
    }

    renderGame() {
        this.renderPlayerHand();
        this.renderAIHand();
        this.renderDiscardPile();
    }    renderPlayerHand() {
        this.cardsContainerEl.innerHTML = '';
        const cardCount = this.playerHand.length;

        // 计算扇形参数
        const maxAngle = Math.min(60, cardCount * 8);
        const angleStep = cardCount > 1 ? maxAngle / (cardCount - 1) : 0;
        const startAngle = -maxAngle / 2;

        this.playerHand.forEach((card, index) => {
            const cardEl = this.createCardElement(card, index);

            // 计算旋转角度
            const angle = startAngle + (angleStep * index);

            // 计算垂直偏移（弧形）
            const arcHeight = Math.abs(angle) * 0.5;

            // 应用transform（不包含水平偏移，由CSS的margin-right控制）
            const baseTransform = `translateY(${arcHeight}px) rotate(${angle}deg)`;
            cardEl.style.transform = baseTransform;
            cardEl.style.zIndex = index;

            // 保存原始transform供悬停时使用
            cardEl.dataset.baseTransform = baseTransform;

            // 添加悬停效果（在原位抬起）
            cardEl.addEventListener('mouseenter', () => {
                if (!cardEl.classList.contains('disabled')) {
                    cardEl.style.transform = `translateY(${arcHeight - 30}px) rotate(${angle}deg)`;
                }
            });

            cardEl.addEventListener('mouseleave', () => {
                if (!cardEl.classList.contains('disabled')) {
                    cardEl.style.transform = baseTransform;
                }
            });

            this.cardsContainerEl.appendChild(cardEl);
        });
    }
    createCardElement(card, index) {
        const cardEl = document.createElement('div');
        cardEl.className = `card ${card.color}`;

        const isPlayable = index >= 0 && this.currentPlayer === 'player' && this.canPlayCard(card);
        if (index >= 0 && !isPlayable) {
            cardEl.classList.add('disabled');
        }

        // 拖拽相关（只对玩家手牌有效）
        if (index >= 0 && isPlayable) {
            let startY = 0;
            let isDragging = false;

            const handleStart = (y) => {
                if (this.currentPlayer !== 'player' || this.gameEnded || this.isProcessing) return;
                startY = y;
                isDragging = true;
            };

            const handleMove = (y) => {
                if (!isDragging) return;
                const distance = startY - y;
                if (distance > 0) {
                    cardEl.style.transform = `translateY(${-Math.min(distance, 80)}px) scale(${1 + Math.min(distance / 200, 0.15)})`;
                }
            };

            const handleEnd = (y) => {
                if (!isDragging) return;
                const distance = startY - y;
                isDragging = false;
                cardEl.style.transform = '';

                if (distance > 30) {
                    this.handleCardDrag(card, index, distance, cardEl);
                }
            };

            // 鼠标事件
            cardEl.addEventListener('mousedown', (e) => handleStart(e.clientY));
            document.addEventListener('mousemove', (e) => {
                if (isDragging && e.target === cardEl) handleMove(e.clientY);
            });
            document.addEventListener('mouseup', (e) => handleEnd(e.clientY));

            // 触摸事件
            cardEl.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleStart(e.touches[0].clientY);
            });
            cardEl.addEventListener('touchmove', (e) => {
                e.preventDefault();
                handleMove(e.touches[0].clientY);
            });
            cardEl.addEventListener('touchend', (e) => {
                handleEnd(e.changedTouches[0].clientY);
            });

            // 双击出牌事件（优先级最高）
            cardEl.addEventListener('dblclick', (e) => {
                e.preventDefault(); // 阻止默认行为
                if (this.currentPlayer === 'player' && !this.isProcessing) {
                    this.isProcessing = true;
                    this.playerHand.splice(index, 1);
                    this.unoButtonEl.classList.remove('show');

                    if (this.playerHand.length === 1) {
                        setTimeout(() => this.showMessage('记得喊 UNO!'), 300);
                        setTimeout(() => this.unoButtonEl.classList.add('show'), 500);
                    }

                    // 传递cardEl作为第三个参数
                    this.playCardWithAnimation(card, 'player', cardEl);
                }
            });

            // 备用点击事件（修复：传递cardEl，避免与双击冲突）
            let clickTimer = null;
            cardEl.addEventListener('click', (e) => {
                if (e.detail === 1 && !isDragging && this.currentPlayer === 'player' && !this.isProcessing) {
                    // 延迟执行，等待可能的双击
                    clearTimeout(clickTimer);
                    clickTimer = setTimeout(() => {
                        if (!this.isProcessing) {
                            this.isProcessing = true;
                            this.playerHand.splice(index, 1);
                            this.unoButtonEl.classList.remove('show');

                            if (this.playerHand.length === 1) {
                                setTimeout(() => this.showMessage('记得喊 UNO!'), 300);
                                setTimeout(() => this.unoButtonEl.classList.add('show'), 500);
                            }

                            // 传递cardEl作为第三个参数
                            this.playCardWithAnimation(card, 'player', cardEl);
                        }
                    }, 250); // 250ms延迟，等待双击
                }
            });

            // Add hover effect for touch devices
            cardEl.addEventListener('touchstart', () => {
                if (!isDragging) cardEl.classList.add('card-hover');
            });
            cardEl.addEventListener('touchend', () => {
                setTimeout(() => cardEl.classList.remove('card-hover'), 300);
            });
        }

        // 卡牌内容
        const topCorner = document.createElement('div');
        topCorner.className = 'card-corners top';
        const bottomCorner = document.createElement('div');
        bottomCorner.className = 'card-corners bottom';

        if (card.color === 'wild') {
            const symbol = card.value === 'draw4' ? '+4' : 'W';
            cardEl.innerHTML = `<span class="card-symbol">${symbol}</span>`;
        } else if (isNaN(card.value)) {
            let symbol = '';
            if (card.value === 'skip') symbol = '⊗';
            else if (card.value === 'reverse') symbol = '↻';
            else if (card.value === 'draw2') symbol = '+2';

            topCorner.textContent = symbol;
            bottomCorner.textContent = symbol;
            cardEl.innerHTML = `<span class="card-symbol">${symbol}</span>`;
        } else {
            topCorner.textContent = card.value;
            bottomCorner.textContent = card.value;
            cardEl.innerHTML = `<span class="card-number">${card.value}</span>`;
        }

        if (card.color !== 'wild') {
            cardEl.appendChild(topCorner);
            cardEl.appendChild(bottomCorner);
        }

        return cardEl;
    }

    renderAIHand() {
        this.aiCardCountEl.textContent = `${this.aiHand.length} 张牌`;

        // Render AI cards in fan shape (showing card backs)
        this.aiCardsContainerEl.innerHTML = '';
        const cardCount = this.aiHand.length;

        // Calculate fan parameters (inverted)
        const maxAngle = Math.min(50, cardCount * 7);
        const angleStep = cardCount > 1 ? maxAngle / (cardCount - 1) : 0;
        const startAngle = -maxAngle / 2;

        // Smaller spacing for AI cards
        const spacing = Math.max(35, Math.min(60, 250 / cardCount));

        for (let i = 0; i < cardCount; i++) {
            const cardEl = document.createElement('div');
            cardEl.className = 'card card-back';
            cardEl.style.width = '90px';
            cardEl.style.height = '132px';
            cardEl.style.fontSize = '1.3rem';

            // Calculate rotation angle (inverted)
            const angle = startAngle + (angleStep * i);

            // Calculate horizontal offset
            const offsetX = (i - (cardCount - 1) / 2) * spacing;

            // Calculate vertical offset (inverted arc)
            const arcHeight = Math.abs(angle) * 0.5;

            // Apply transform (rotate inverted)
            cardEl.style.transform = `translateX(${offsetX}px) translateY(${arcHeight}px) rotate(${angle}deg)`;
            cardEl.style.zIndex = i;

            this.aiCardsContainerEl.appendChild(cardEl);
        }
    }

    renderDiscardPile() {
        const topCard = this.discardPile[this.discardPile.length - 1];
        this.discardPileEl.innerHTML = '<div class="pile-label">出牌区</div>';

        // 如果是变色牌，显示为选择的颜色
        let displayCard = topCard;
        if (topCard.color === 'wild' && this.currentColor && this.currentColor !== 'wild') {
            displayCard = { ...topCard, color: this.currentColor };
        }

        const cardEl = this.createCardElement(displayCard, -1);
        cardEl.style.pointerEvents = 'none';
        this.discardPileEl.appendChild(cardEl);

        // 如果是变色牌，添加颜色提示
        if (topCard.color === 'wild' && this.currentColor && this.currentColor !== 'wild') {
            const colorNames = {
                'red': '红色',
                'yellow': '黄色',
                'green': '绿色',
                'blue': '蓝色'
            };
            const colorText = document.createElement('div');
            colorText.className = 'wild-color-text';
            colorText.textContent = `→ ${colorNames[this.currentColor]}`;
            colorText.style.color = 'white';
            colorText.style.fontSize = '0.75rem';
            colorText.style.fontWeight = '700';
            colorText.style.marginTop = '4px';
            colorText.style.textShadow = '0 1px 3px rgba(0,0,0,0.5)';
            this.discardPileEl.appendChild(colorText);
        }
    }

    showMessage(text) {
        this.messageToastEl.textContent = text;
        this.messageToastEl.classList.add('show');

        setTimeout(() => {
            this.messageToastEl.classList.remove('show');
        }, 2000);
    }
}

// 初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new UNOGame();
});

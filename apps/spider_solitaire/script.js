class SpiderSolitaire {
    constructor() {
        this.suits = ['spades', 'hearts', 'clubs', 'diamonds'];
        this.ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.cards = [];
        this.tableau = [[], [], [], [], [], [], [], [], [], []];
        this.stock = [];
        this.foundation = [];
        this.history = [];
        this.score = 500;
        this.moves = 0;
        this.difficulty = 1; // 1, 2, or 4 suits

        this.draggedCard = null;
        this.draggedSource = null;
        this.draggedCards = [];

        this.initElements();
        this.attachEventListeners();
        this.showDifficultyModal();
    }

    initElements() {
        this.tableauEls = document.getElementById('tableau');
        this.stockEl = document.getElementById('stock');
        this.foundationEl = document.getElementById('foundation');
        this.scoreEl = document.getElementById('score');
        this.movesEl = document.getElementById('moves');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.undoBtn = document.getElementById('undoBtn');
        this.difficultyModal = document.getElementById('difficultyModal');
    }

    attachEventListeners() {
        this.newGameBtn.addEventListener('click', () => this.showDifficultyModal());
        this.undoBtn.addEventListener('click', () => this.undo());
        this.stockEl.addEventListener('click', () => this.dealFromStock());

        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.difficulty = parseInt(e.target.dataset.suits);
                this.difficultyModal.style.display = 'none';
                this.startNewGame();
            });
        });
    }

    startNewGame() {
        this.cards = this.createDeck();
        this.shuffle(this.cards);
        this.tableau = [[], [], [], [], [], [], [], [], [], []];
        this.stock = [];
        this.foundation = [];
        this.history = [];
        this.score = 500;
        this.moves = 0;
        this.updateScore();

        // Deal initial cards
        // 54 cards to tableau: 6 cards to first 4 columns, 5 cards to last 6 columns
        // Top card face up, others face down
        let cardIndex = 0;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 6; j++) {
                const card = this.cards[cardIndex++];
                card.faceUp = (j === 5);
                this.tableau[i].push(card);
            }
        }
        for (let i = 4; i < 10; i++) {
            for (let j = 0; j < 5; j++) {
                const card = this.cards[cardIndex++];
                card.faceUp = (j === 4);
                this.tableau[i].push(card);
            }
        }

        // Remaining 50 cards to stock
        while (cardIndex < this.cards.length) {
            this.stock.push(this.cards[cardIndex++]);
        }

        this.render();
    }

    createDeck() {
        let deck = [];
        // Spider Solitaire uses 2 decks (104 cards)
        // For 1 suit: 8 sets of Spades
        // For 2 suits: 4 sets of Spades, 4 sets of Hearts
        // For 4 suits: 2 sets of each suit

        let suitsToUse = [];
        if (this.difficulty === 1) {
            suitsToUse = Array(8).fill('spades');
        } else if (this.difficulty === 2) {
            suitsToUse = [...Array(4).fill('spades'), ...Array(4).fill('hearts')];
        } else {
            suitsToUse = [...Array(2).fill('spades'), ...Array(2).fill('hearts'), ...Array(2).fill('clubs'), ...Array(2).fill('diamonds')];
        }

        suitsToUse.forEach(suit => {
            this.ranks.forEach((rank, index) => {
                deck.push({
                    suit: suit,
                    rank: rank,
                    value: index + 1, // A=1, K=13
                    id: Math.random().toString(36).substr(2, 9),
                    faceUp: false
                });
            });
        });

        return deck;
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    render() {
        this.tableauEls.innerHTML = '';
        this.tableau.forEach((column, colIndex) => {
            const colEl = document.createElement('div');
            colEl.className = 'column';
            colEl.dataset.col = colIndex;

            // Allow dropping on empty columns
            colEl.addEventListener('dragover', (e) => this.handleDragOver(e));
            colEl.addEventListener('drop', (e) => this.handleDrop(e, colIndex));

            column.forEach((card, cardIndex) => {
                const cardEl = this.createCardElement(card);
                cardEl.style.top = `${cardIndex * 30}px`; // Cascade effect

                if (card.faceUp) {
                    cardEl.draggable = true;
                    cardEl.addEventListener('dragstart', (e) => this.handleDragStart(e, card, colIndex, cardIndex));
                }

                colEl.appendChild(cardEl);
            });
            this.tableauEls.appendChild(colEl);
        });

        // Render Stock
        this.stockEl.innerHTML = '';
        if (this.stock.length > 0) {
            // Visualize stock pile
            for (let i = 0; i < Math.min(5, Math.ceil(this.stock.length / 10)); i++) {
                const back = document.createElement('div');
                back.className = 'card-back';
                back.style.top = `${i * 2}px`;
                back.style.left = `${i * 2}px`;
                this.stockEl.appendChild(back);
            }
        } else {
            const empty = document.createElement('div');
            empty.className = 'card-placeholder'; // Visual indicator for empty stock
            this.stockEl.appendChild(empty);
        }

        // Render Foundation
        this.foundationEl.innerHTML = '';
        this.foundation.forEach(pile => {
            const slot = document.createElement('div');
            slot.className = 'foundation-slot';
            if (pile.length > 0) {
                const card = pile[pile.length - 1]; // Should be King
                const cardEl = this.createCardElement(card);
                cardEl.style.position = 'static';
                slot.appendChild(cardEl);
            }
            this.foundationEl.appendChild(slot);
        });

        // Ensure 8 slots
        for (let i = this.foundation.length; i < 8; i++) {
            const slot = document.createElement('div');
            slot.className = 'foundation-slot';
            this.foundationEl.appendChild(slot);
        }
    }

    createCardElement(card) {
        const el = document.createElement('div');
        el.className = `card ${card.faceUp ? '' : 'back'}`;

        if (card.faceUp) {
            const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
            el.classList.add(isRed ? 'red' : 'black');

            let suitSymbol = '';
            switch (card.suit) {
                case 'spades': suitSymbol = '♠'; break;
                case 'hearts': suitSymbol = '♥'; break;
                case 'clubs': suitSymbol = '♣'; break;
                case 'diamonds': suitSymbol = '♦'; break;
            }

            el.innerHTML = `
                <div class="card-top">
                    <span>${card.rank}</span>
                    <span>${suitSymbol}</span>
                </div>
                <div class="suit-large">${suitSymbol}</div>
                <div class="card-bottom">
                    <span>${card.rank}</span>
                    <span>${suitSymbol}</span>
                </div>
            `;
        } else {
            el.innerHTML = '<div class="card-back"></div>';
        }
        return el;
    }

    handleDragStart(e, card, colIndex, cardIndex) {
        // Check if the card and all cards below it form a valid sequence
        const column = this.tableau[colIndex];
        const cardsToDrag = [];

        for (let i = cardIndex; i < column.length; i++) {
            if (i > cardIndex) {
                const current = column[i];
                const prev = column[i - 1];
                // Must be same suit and descending rank
                if (current.suit !== prev.suit || current.value !== prev.value - 1) {
                    e.preventDefault();
                    return;
                }
            }
            cardsToDrag.push(column[i]);
        }

        this.draggedCards = cardsToDrag;
        this.draggedSource = { colIndex, cardIndex };

        // Visual feedback
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => e.target.classList.add('dragging'), 0);
    }

    handleDragOver(e) {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
    }

    handleDrop(e, targetColIndex) {
        e.preventDefault();
        const targetCol = this.tableau[targetColIndex];
        const topCard = targetCol.length > 0 ? targetCol[targetCol.length - 1] : null;
        const firstDragged = this.draggedCards[0];

        // Validate move
        let valid = false;
        if (!topCard) {
            valid = true; // Can drop on empty column
        } else {
            // Must be rank - 1 (suit doesn't matter for moving, only for dragging group)
            if (topCard.value === firstDragged.value + 1) {
                valid = true;
            }
        }

        if (valid) {
            this.executeMove(this.draggedSource.colIndex, targetColIndex, this.draggedCards.length);
        }

        this.render(); // Re-render to clear dragging styles
    }

    executeMove(fromCol, toCol, count) {
        // Save state for undo
        this.saveState();

        const movedCards = this.tableau[fromCol].splice(this.tableau[fromCol].length - count, count);
        this.tableau[toCol].push(...movedCards);

        // Flip new top card of source column if needed
        if (this.tableau[fromCol].length > 0) {
            const newTop = this.tableau[fromCol][this.tableau[fromCol].length - 1];
            if (!newTop.faceUp) {
                newTop.faceUp = true;
                this.score += 10; // Score for turning over a card? (Optional rule)
            }
        }

        this.moves++;
        this.score--; // Decrease score per move
        this.updateScore();

        this.checkCompletedRuns(toCol);
        this.render();
    }

    checkCompletedRuns(colIndex) {
        const column = this.tableau[colIndex];
        if (column.length < 13) return;

        // Check last 13 cards
        const last13 = column.slice(column.length - 13);

        // Check if they are K to A of same suit
        let isRun = true;
        if (last13[0].value !== 13) isRun = false; // Must start with K

        for (let i = 0; i < 12; i++) {
            if (last13[i].suit !== last13[i + 1].suit || last13[i].value !== last13[i + 1].value + 1) {
                isRun = false;
                break;
            }
        }

        if (isRun) {
            // Remove run and add to foundation
            const run = column.splice(column.length - 13, 13);
            this.foundation.push(run);
            this.score += 100;
            this.updateScore();

            // Flip new top card if needed
            if (column.length > 0) {
                const newTop = column[column.length - 1];
                if (!newTop.faceUp) {
                    newTop.faceUp = true;
                }
            }

            // Check win condition
            if (this.foundation.length === 8) {
                setTimeout(() => alert('Congratulations! You Won!'), 100);
            }
        }
    }

    dealFromStock() {
        if (this.stock.length === 0) return;

        // Cannot deal if any column is empty
        if (this.tableau.some(col => col.length === 0)) {
            alert('Cannot deal while there are empty columns.');
            return;
        }

        this.saveState();

        for (let i = 0; i < 10; i++) {
            if (this.stock.length > 0) {
                const card = this.stock.pop();
                card.faceUp = true;
                this.tableau[i].push(card);
                this.checkCompletedRuns(i); // Check runs after dealing
            }
        }
        this.render();
    }

    saveState() {
        // Deep copy of state
        const state = {
            tableau: JSON.parse(JSON.stringify(this.tableau)),
            stock: JSON.parse(JSON.stringify(this.stock)),
            foundation: JSON.parse(JSON.stringify(this.foundation)),
            score: this.score,
            moves: this.moves
        };
        this.history.push(state);
    }

    undo() {
        if (this.history.length === 0) return;

        const state = this.history.pop();
        this.tableau = state.tableau;
        this.stock = state.stock;
        this.foundation = state.foundation;
        this.score = state.score;
        this.moves = state.moves;

        this.updateScore();
        this.render();
    }

    updateScore() {
        this.scoreEl.textContent = this.score;
        this.movesEl.textContent = this.moves;
    }

    showDifficultyModal() {
        this.difficultyModal.style.display = 'flex';
    }
}

// Initialize game
window.addEventListener('DOMContentLoaded', () => {
    new SpiderSolitaire();
});

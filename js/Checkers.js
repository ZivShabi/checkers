class CheckersGame {
    constructor() {
        this.currentPlayer = 'W'; // השחקן הנוכחי בתחילת המשחק
        this.EMPTY_SQUARE = ' '; // תו שמייצג תא ריק בלוח
        this.initializeBoard(); // פעולת יצירת הלוח
        this.selectedSquare = null; // התא שנבחר כרגע
        this.firstClick = false; // לחיצה ראשונה
        this.secondClick = false; // לחיצה שנייה
        this.updateBoardView(); // עדכון הלוח
        this.addSquareClickListeners(); //  אירועי לחיצה לתאים בלוח
    }

    initializeBoard() {
        this.checkersBoard = [
            ['B', '.', 'B', '.', 'B', '.', 'B', '.'],
            ['.', 'B', '.', 'B', '.', 'B', '.', 'B'],
            ['B', '.', 'B', '.', 'B', '.', 'B', '.'],
            ['.', ' ', '.', ' ', '.', ' ', '.', ' '],
            [' ', '.', ' ', '.', ' ', '.', ' ', '.'],
            ['.', 'W', '.', 'W', '.', 'W', '.', 'W'],
            ['W', '.', 'W', '.', 'W', '.', 'W', '.'],
            ['.', 'W', '.', 'W', '.', 'W', '.', 'W']
        ];
    }

    resetBoard() {
        this.initializeBoard();
        this.updateBoardView();
        this.changePlayerTurn();
    }

    resetBoardAnimation() {
        this.resetBoard();
        document.querySelector(".checkers-board").classList.remove("animated");
    }

    changePlayerTurn() {
        this.currentPlayer = this.currentPlayer === 'W' ? 'B' : 'W';
        document.querySelector(".current-player").textContent = `שחקן נוכחי: ${this.currentPlayer === 'W' ? 'לבן' : 'שחור'}`;
    }

    startGame() {
        this.resetBoard();
        const startButton = document.getElementById("start-game");
        const restartButton = document.getElementById("restart-game");
        startButton.style.display = "none";
        restartButton.style.display = "inline";
    }

    isGameOver() {
        let whitePieces = 0;
        let blackPieces = 0;
        let movesAvailable = false; // הוספת פלג עבור בדיקת מהלך זמין
        let kingMovesCount = 0;

        for (let i = 0; i < this.checkersBoard.length; i++) {
            for (let j = 0; j < this.checkersBoard[i].length; j++) {
                if (this.checkersBoard[i][j] === 'W' || this.checkersBoard[i][j] === 'WK') {
                    whitePieces++;
                    if (this.highlightPossibleMovesForCurrentPlayer(i, j).length > 0) { // בדיקה אם יש לאזרח מהלך אפשרי
                        movesAvailable = true; // אם כן, מסמן שיש מהלך אפשרי
                    }
                    if (this.checkersBoard[i][j] === 'WK') {
                        kingMovesCount++;
                    }
                } else if (this.checkersBoard[i][j] === 'B' || this.checkersBoard[i][j] === 'BK') {
                    blackPieces++;
                    if (this.highlightPossibleMovesForCurrentPlayer(i, j).length > 0) { // בדיקה אם יש לאזרח מהלך אפשרי
                        movesAvailable = true; // אם כן, מסמן שיש מהלך אפשרי
                    }
                    if (this.checkersBoard[i][j] === 'BK') {
                        kingMovesCount++;
                    }
                }
            }
        }

        if (kingMovesCount >= 15) {
            this.displayEndGameMessage('Draw - 15 king moves without capture');
            return true;
        }

        if (!movesAvailable) { // אם אין מהלך אפשרי לשחקן
            if (this.currentPlayer === 'W') {
                this.displayEndGameMessage('Black wins!'); // אם השחקן הנוכחי הוא לבן, שחור מנצח
            } else {
                this.displayEndGameMessage('White wins!'); // אחרת, לבן מנצח
            }
            return true; // המשחק נגמר
        }

        if (whitePieces === 0) {
            this.displayEndGameMessage('Black wins!');
            return true;
        } else if (blackPieces === 0) {
            this.displayEndGameMessage('White wins!');
            return true;
        }

        return false;
    }

    isValidMove(row, col, targetRow, targetCol) {
        const piece = this.checkersBoard[row][col];
        const opponentColor = this.currentPlayer === 'W' ? 'B' : 'W';
        const opponentKing = this.currentPlayer === 'W' ? 'BK' : 'WK'; // מתייחס גם למלכים של היריב
        const rowDiff = Math.abs(targetRow - row);
        const colDiff = Math.abs(targetCol - col);

        // בדיקה שהמהלך הוא אלכסוני
        if (rowDiff !== colDiff) return false;

        // בדיקת גבולות הלוח
        if (targetRow < 0 || targetRow >= this.checkersBoard.length ||
            targetCol < 0 || targetCol >= this.checkersBoard[0].length) {
            return false;
        }

        if (piece === 'WK' || piece === 'BK') {
            // תנועה עבור מלך
            if (this.checkersBoard[targetRow][targetCol] === this.EMPTY_SQUARE) {
                // בדיקה שאין אבנים בדרך אם לא מדובר בדילוג
                for (let i = 1; i < rowDiff; i++) {
                    const intermediateRow = row + i * Math.sign(targetRow - row);
                    const intermediateCol = col + i * Math.sign(targetCol - col);
                    if (this.checkersBoard[intermediateRow][intermediateCol] !== this.EMPTY_SQUARE) {
                        return false;
                    }
                }
                return true;
            } else if (this.checkersBoard[targetRow][targetCol] === opponentColor || this.checkersBoard[targetRow][targetCol] === opponentKing) {
                // דילוג עבור מלך
                const jumpRow = targetRow + Math.sign(targetRow - row);
                const jumpCol = targetCol + Math.sign(targetCol - col);
                if (jumpRow >= 0 && jumpRow < this.checkersBoard.length &&
                    jumpCol >= 0 && jumpCol < this.checkersBoard[0].length &&
                    this.checkersBoard[jumpRow][jumpCol] === this.EMPTY_SQUARE) {
                    return true;
                }
            }
        } else {
            // תנועה עבור אבן רגילה
            const rowDirection = this.currentPlayer === 'W' ? -1 : 1;
            if (rowDiff === 1 && colDiff === 1 && targetRow === row + rowDirection) {
                if (this.checkersBoard[targetRow][targetCol] === this.EMPTY_SQUARE) {
                    return true;
                }
            } else if (rowDiff === 2 && colDiff === 2 && targetRow === row + 2 * rowDirection) {
                const middleRow = (row + targetRow) / 2;
                const middleCol = (col + targetCol) / 2;
                if ((this.checkersBoard[middleRow][middleCol] === opponentColor || this.checkersBoard[middleRow][middleCol] === opponentKing) &&
                    this.checkersBoard[targetRow][targetCol] === this.EMPTY_SQUARE) {
                    return true;
                }
            }
        }

        return false;
    }

    highlightPossibleMovesForCurrentPlayer(row, col) {
        let possibleMoves = [];
        const piece = this.checkersBoard[row][col];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

        if (piece === 'WK' || piece === 'BK') {
            // עבור מלך, לבדוק כל הכיוונים וללא הגבלת מרחק
            for (const [rowDir, colDir] of directions) {
                let i = 1;
                while (true) {
                    const targetRow = row + i * rowDir;
                    const targetCol = col + i * colDir;
                    // בדיקת גבולות הלוח
                    if (targetRow < 0 || targetRow >= this.checkersBoard.length ||
                        targetCol < 0 || targetCol >= this.checkersBoard[0].length) {
                        break;
                    }
                    if (this.isValidMove(row, col, targetRow, targetCol)) {
                        possibleMoves.push({ row: targetRow, col: targetCol });
                    } else {
                        break;
                    }
                    i++;
                }
            }
        } else {
            // עבור אבן רגילה, לבדוק מהלכים רגילים ודילוגים
            const rowDirection = this.currentPlayer === 'W' ? -1 : 1;
            const possibleColMoves = [col - 1, col + 1, col - 2, col + 2];
            for (let i = 0; i < possibleColMoves.length; i++) {
                const targetCol = possibleColMoves[i];
                const targetRow = row + (Math.abs(targetCol - col) === 1 ? rowDirection : 2 * rowDirection);
                // בדיקת גבולות הלוח
                if (targetRow >= 0 && targetRow < this.checkersBoard.length &&
                    targetCol >= 0 && targetCol < this.checkersBoard[0].length) {
                    if (this.isValidMove(row, col, targetRow, targetCol)) {
                        possibleMoves.push({ row: targetRow, col: targetCol });
                    }
                }
            }
        }

        possibleMoves.forEach(move => {
            const square = document.querySelector(`.square[data-row="${move.row}"][data-col="${move.col}"]`);
            if (square) {
                square.classList.add("possible-move", "highlighted");
            }
        });

        return possibleMoves;
    }

    hasMoreJumps(row, col) {
        const piece = this.checkersBoard[row][col];
        const opponentColor = this.currentPlayer === 'W' ? 'B' : 'W';
        const opponentKing = this.currentPlayer === 'W' ? 'BK' : 'WK'; // מתייחס גם למלכים של היריב
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

        for (const [rowDir, colDir] of directions) {
            const targetRow = row + 2 * rowDir;
            const targetCol = col + 2 * colDir;
            const middleRow = row + rowDir;
            const middleCol = col + colDir;
            if (targetRow >= 0 && targetRow < this.checkersBoard.length &&
                targetCol >= 0 && targetCol < this.checkersBoard[0].length &&
                (this.checkersBoard[middleRow][middleCol] === opponentColor || this.checkersBoard[middleRow][middleCol] === opponentKing) &&
                this.checkersBoard[targetRow][targetCol] === this.EMPTY_SQUARE) {
                return true;
            }
        }

        return false;
    }

    selectSquare(row, col) {
        if (document.querySelector(".end-game-message").style.display === "block") {
            return;
        }

        if (!this.firstClick) {
            const playerPiece = this.checkersBoard[row][col];
            if (playerPiece === this.currentPlayer || playerPiece === (this.currentPlayer === 'W' ? 'WK' : 'BK')) {
                const selectedSquareElement = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
                if (selectedSquareElement) {
                    selectedSquareElement.classList.add("selected");
                    this.firstClick = true;
                    this.selectedSquare = { row: row, col: col };
                    this.highlightPossibleMovesForCurrentPlayer(row, col);
                }
            }
        } else {
            const possibleMoves = document.querySelectorAll(".possible-move");
            possibleMoves.forEach(move => {
                if (move.dataset.row == row && move.dataset.col == col) {
                    this.movePiece(this.selectedSquare.row, this.selectedSquare.col, row, col);
                }
            });
            this.removePreviousSelectionHighlight();
            this.firstClick = false;
            this.selectedSquare = null;
        }
    }

    removePreviousSelectionHighlight() {
        document.querySelectorAll(".selected").forEach(square => {
            square.classList.remove("selected");
        });
        document.querySelectorAll(".possible-move").forEach(square => {
            square.classList.remove("possible-move", "highlighted");
        });
    }
    movePiece(startRow, startCol, endRow, endCol) {
        this.checkersBoard[endRow][endCol] = this.checkersBoard[startRow][startCol];
        this.checkersBoard[startRow][startCol] = this.EMPTY_SQUARE;

        let isJump = false;
        if (Math.abs(endRow - startRow) === 2) {
            const middleRow = (startRow + endRow) / 2;
            const middleCol = (startCol + endCol) / 2;
            this.checkersBoard[middleRow][middleCol] = this.EMPTY_SQUARE;
            isJump = true;
        }

        this.updateBoardView(endRow, endCol);

        if (isJump && this.hasMoreJumps(endRow, endCol)) {
            this.selectedSquare = { row: endRow, col: endCol };
            this.highlightPossibleMovesForCurrentPlayer(endRow, endCol);
        } else {
            if (!this.isGameOver()) {
                this.changePlayerTurn();
            }
        }
    }

    updateBoardViewWithAnimation(startRow, startCol, endRow, endCol) {
        const startSquare = document.querySelector(`.square[data-row="${startRow}"][data-col="${startCol}"]`);
        const endSquare = document.querySelector(`.square[data-row="${endRow}"][data-col="${endCol}"]`);

        const piece = startSquare.querySelector('.piece');
        const pieceClone = piece.cloneNode(true);
        startSquare.appendChild(pieceClone);
        setTimeout(() => {
            endSquare.appendChild(pieceClone);
            piece.style.display = 'none';
            setTimeout(() => {
                pieceClone.remove();
                piece.style.display = 'block';
            }, 200);
        }, 200);
    }
    updateBoardView(endRow, endCol) {
        const boardElement = document.querySelector(".checkers-board");
        if (!boardElement) {
            this.displayErrorMessage("שגיאה: רכיב לוח לא נמצא.");
            return;
        }

        // בדיקה והמרת השחקן למלך אם התנאים מתקיימים
        if (this.currentPlayer === 'W' && endRow === 0) {
            this.checkersBoard[endRow][endCol] = 'WK'; // מלך לבן
        } else if (this.currentPlayer === 'B' && endRow === this.checkersBoard.length - 1) {
            this.checkersBoard[endRow][endCol] = 'BK'; // מלך שחור
        }

        boardElement.innerHTML = '';
        for (let i = 0; i < this.checkersBoard.length; i++) {
            for (let j = 0; j < this.checkersBoard[i].length; j++) {
                const square = this.createSquare(i, j, this.checkersBoard[i][j]);
                boardElement.appendChild(square);
            }
        }
        this.addSquareClickListeners(); // Update to add listeners after rebuilding the board
    }

    createSquare(row, col, pieceValue) {
        const square = document.createElement("div");
        square.classList.add("square");
        square.dataset.row = row;
        square.dataset.col = col;
        square.classList.add((row + col) % 2 === 0 ? "light" : "dark");

        if (pieceValue === 'B') {
            this.createPiece(square, "black-piece", row, col);
        } else if (pieceValue === 'W') {
            this.createPiece(square, "white-piece", row, col);
        } else if (pieceValue === 'BK') {
            this.createKingPiece(square, "black-king-piece", row, col);
        } else if (pieceValue === 'WK') {
            this.createKingPiece(square, "white-king-piece", row, col);
        }

        return square;
    }

    createKingPiece(square, pieceClass, row, col) {
        const piece = document.createElement("div");
        piece.classList.add(pieceClass);
        piece.textContent = pieceClass.includes("white") ? "KW" : "KB"; // הגדרת הכתובת בהתאם לצבע השחקן
        square.appendChild(piece);
        piece.classList.add(pieceClass.includes("white") ? "white-text" : "black-text");
        piece.addEventListener("mouseenter", () => {
            square.classList.add("hover");
        });
        piece.addEventListener("mouseleave", () => {
            square.classList.remove("hover");
        });
    }

    createPiece(square, pieceClass, row, col) {
        const piece = document.createElement("div");
        piece.classList.add(pieceClass);
        piece.textContent = pieceClass.includes("white") ? "W" : "B"; // הגדרת הכתובת בהתאם לצבע השחקן
        square.appendChild(piece);
        piece.classList.add(pieceClass.includes("white") ? "white-text" : "black-text");
        piece.addEventListener("mouseenter", () => {
            square.classList.add("hover");
        });
        piece.addEventListener("mouseleave", () => {
            square.classList.remove("hover");
        });
    }

    addSquareClickListeners() {
        document.querySelectorAll(".checkers-board .square").forEach(square => {
            square.addEventListener("click", () => {
                this.selectSquare(parseInt(square.dataset.row), parseInt(square.dataset.col));
            });
        });
    }

    displayEndGameMessage(message, row, col) {
        let endGameMessageElement = document.querySelector(".end-game-message");
        let positionMessage = row !== undefined && col !== undefined ? `Row: ${row}, Col: ${col}` : '';
        if (endGameMessageElement) {
            endGameMessageElement.innerHTML = `
    <div class="victory-message">
        <p>${message}</p>
        <p>${positionMessage}</p>
        <button id="dismissMessageBtn">סגור</button>
    </div>`;
            endGameMessageElement.style.display = "block";
            document.getElementById("dismissMessageBtn").addEventListener("click", () => {
                this.resetBoard();
                // הוספת קלאס לביצוע אנימציה
                document.querySelector(".checkers-board").classList.add("animated");
                setTimeout(() => {
                    // הפעלת פונקציה לאיפוס האנימציה והלוח
                    this.resetBoardAnimation();
                    let elements = Array.from(document.querySelectorAll(".square"));
                    endGameMessageElement.style.display = "none";
                }, 500); // זמן המתנה לסיום האנימציה
            });
        } else {
            console.error(`${message} ${positionMessage}`);
        }
    }
}

const game = new CheckersGame();

document.getElementById("start-game").addEventListener("click", function () {
    game.startGame();
});

document.getElementById("restart-game").addEventListener("click", function () {
    game.startGame();
});
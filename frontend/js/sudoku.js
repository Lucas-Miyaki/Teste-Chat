let originalPuzzle = [];
let selectedCell = null;
let solutionBoard = [];
let chances = 3;

function updateChancesDisplay() {
    document.getElementById('chances').textContent = `Chances restantes: ${chances}`;
}

function createGrid() {
    const container = document.getElementById('sudoku-grid');
    container.innerHTML = '';
    for (let i = 0; i < 81; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.readOnly = true;
    input.className = 'cell';

    const row = Math.floor(i / 9);
    const col = i % 9;

    if (row % 3 === 0) input.classList.add('thick-top');
    if (col % 3 === 0) input.classList.add('thick-left');
    if (row === 8) input.classList.add('thick-bottom');
    if (col === 8) input.classList.add('thick-right');


    input.addEventListener('click', () => {
        if (!input.disabled) {
        if (selectedCell) selectedCell.classList.remove('selected');
        selectedCell = input;
        selectedCell.classList.add('selected');
        }
    });

    container.appendChild(input);
    }
}

function createNumberButtons() {
    const container = document.getElementById('number-buttons');
    container.innerHTML = '';
    for (let i = 1; i <= 9; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.addEventListener('click', () => {
        if (selectedCell) {
        selectedCell.value = i;
        checkMove(i);
        }
    });
    container.appendChild(btn);
    }
}

function resetGrid() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, idx) => {
    if (originalPuzzle[idx] === 0) {
        cell.value = '';
        cell.disabled = false;
    }
    });
    chances = 3;
    updateChancesDisplay();
}

function checkMove(value) {
    const cells = Array.from(document.querySelectorAll('.cell'));
    const idx = cells.indexOf(selectedCell);
    const row = Math.floor(idx / 9);
    const col = idx % 9;

    if (parseInt(value) !== solutionBoard[row][col]) {
    chances--;
    updateChancesDisplay();
    if (chances <= 0) {
        alert("Você perdeu! Tente novamente.");
        generatePuzzle();
    } else {
        alert("Número incorreto!");
        selectedCell.value = '';
    }
    }
}

function checkSolution() {
    const cells = document.querySelectorAll('.cell');
    let isCorrect = true;
    for (let i = 0; i < 81; i++) {
    const val = parseInt(cells[i].value);
    const row = Math.floor(i / 9);
    const col = i % 9;
    if (val !== solutionBoard[row][col]) {
        isCorrect = false;
        break;
    }
    }
    alert(isCorrect ? "Sudoku resolvido corretamente!" : "Existem erros na sua solução.");
}

function generatePuzzle() {
    const difficulty = document.getElementById('difficulty').value;
    const filled = {
    easy: 40,
    medium: 30,
    hard: 20
    }[difficulty];

    const board = Array(9).fill(0).map(() => Array(9).fill(0));
    solveSudoku(board);

    solutionBoard = JSON.parse(JSON.stringify(board));

    const puzzle = JSON.parse(JSON.stringify(board));
    let attempts = 81 - filled;
    while (attempts > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0;
        attempts--;
    }
    }

    originalPuzzle = puzzle.flat();
    const cells = document.querySelectorAll('.cell');
    for (let i = 0; i < 81; i++) {
    const val = originalPuzzle[i];
    cells[i].value = val === 0 ? '' : val;
    cells[i].disabled = val !== 0;
    }
    chances = 3;
    updateChancesDisplay();
}

function solveSudoku(board) {
    const findEmpty = () => {
    for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++)
        if (board[r][c] === 0) return [r, c];
    return null;
    };

    const isValid = (num, row, col) => {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num)
        return false;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
        if (board[boxRow + i][boxCol + j] === num)
            return false;
    return true;
    };

    const solve = () => {
    const found = findEmpty();
    if (!found) return true;
    const [r, c] = found;
    for (let num = 1; num <= 9; num++) {
        if (isValid(num, r, c)) {
        board[r][c] = num;
        if (solve()) return true;
        board[r][c] = 0;
        }
    }
    return false;
    };

    solve();
}

createGrid();
createNumberButtons();
generatePuzzle();
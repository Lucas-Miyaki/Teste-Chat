const temas = {
    tecnologia: {
    easy: ["HTML", "CSS", "WEB"],
    medium: ["HTML", "CSS", "JAVASCRIPT", "SITE"],
    hard: ["HTML", "CSS", "JAVASCRIPT", "DESENVOLVIMENTO", "FRONTEND", "BACKEND"]
    },
    transporte: {
    easy: ["CARRO", "MOTO"],
    medium: ["CARRO", "MOTO", "GASOLINA"],
    hard: ["CARRO", "MOTO", "GASOLINA", "CAMINHAO", "ONIBUS"]
    },
    comidas: {
    easy: ["PIZZA", "BOLO"],
    medium: ["LASANHA", "ARROZ", "FEIJAO"],
    hard: ["MACARRONADA", "STROGONOFF", "HAMBURGUER"]
    },
    paises: {
    easy: ["BRASIL", "CHILE"],
    medium: ["ARGENTINA", "MEXICO", "PORTUGAL"],
    hard: ["AFEGANISTAO", "CINGAPURA", "GUATEMALA"]
    },
    jogos: {
    easy: ["DAMA", "XADREZ"],
    medium: ["POKER", "FUTEBOL", "FORCA"],
    hard: ["ESCONDEESCONDE", "BATALHANAVAL", "MONOPOLY"]
    },
    esportes: {
    easy: ["FUTEBOL", "BASQUETE"],
    medium: ["HANDEBOL", "VOLEI", "NATACAO"],
    hard: ["LEVANTAMENTO", "TRIATLO", "GINASTICA"]
    },
    instrumentos: {
    easy: ["VIOLAO", "PIANO"],
    medium: ["GUITARRA", "BATERIA", "FLAUTA"],
    hard: ["SAXOFONE", "VIOLONCELO", "ACORDEAO"]
    },
    feriados: {
    easy: ["NATAL", "PASCOA"],
    medium: ["CARNAVAL", "REVEILLON", "TIRADENTES"],
    hard: ["INDEPENDENCIA", "CONSCIENCIA", "FINADOS"]
    },
    dancas: {
    easy: ["SAMBA", "FORRO"],
    medium: ["BALLET", "SERTANEJO", "AXE"],
    hard: ["FLAMENCO", "SAPATEADO", "CARIMBO"]
    },
    natureza: {
    easy: ["RIO", "SOL"],
    medium: ["FLORESTA", "MONTANHA", "LAGO"],
    hard: ["CACHOEIRA", "VULCAO", "PANTANAL"]
    },
    mangas: {
    easy: ["NARUTO", "BLEACH"],
    medium: ["ONEPIECE", "HUNTER", "SAILOR"],
    hard: ["ATTACK", "TOKYOGHOUL", "BERSERK"]
    },
    herois: {
    easy: ["BATMAN", "FLASH"],
    medium: ["SUPERMAN", "HULK", "THOR"],
    hard: ["WOLVERINE", "AQUAMAN", "CICLOPE"]
    },
    quadrinhos: {
    easy: ["TURMA", "MICKEY"],
    medium: ["GARFIELD", "ZEBRINHA", "CHARLIE"],
    hard: ["QUADRINHOS", "AVENTURAS", "HISTORIAS"]
    },
    livros: {
    easy: ["HARRY", "POOH"],
    medium: ["PERCY", "SENHOR", "ALICE"],
    hard: ["HOBBIT", "CREPUSCULO", "DRACULA"]
    },
    animais: {
    easy: ["GATO", "CACHORRO"],
    medium: ["ELEFANTE", "GIRAFA", "PAPAGAIO"],
    hard: ["ORNITORRINCO", "TAMANDUA", "PREGUIÇA"]
    },
    emocoes: {
    easy: ["RAIVA", "AMOR"],
    medium: ["MEDO", "TRISTE", "ALEGRIA"],
    hard: ["SATISFACAO", "NOSTALGIA", "ANSIEDADE"]
    },
    sobremesas: {
    easy: ["PUDIM", "SORVETE"],
    medium: ["TORTA", "BRIGADEIRO", "BOLO"],
    hard: ["MOUSSE", "PAVE", "CANJICA"]
    }
};

let gridSize;
let grid = [];
let palavras = [];
let palavrasNormais = [];
const selectedCells = [];

function comecarJogo() {
    const difficulty = document.getElementById("difficulty").value;
    const theme = document.getElementById("theme").value;
    palavrasNormais = temas[theme][difficulty];
    palavras = palavrasNormais;
    gridSize = difficulty === "easy" ? 10 : difficulty === "medium" ? 12 : 15;
    grid = [];
    selectedCells.length = 0;
    createGrid();
    placeWords();
    fillGrid();
    renderGrid();
    renderWordList();
}

function createGrid() {
    for (let i = 0; i < gridSize; i++) {
    grid[i] = [];
    for (let j = 0; j < gridSize; j++) {
        grid[i][j] = "";
    }
    }
}

function placeWords() {
    palavras.forEach(word => {
    let placed = false;
    while (!placed) {
        const directions = ["H", "V", "D"];
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);

        if (dir === "H" && col + word.length <= gridSize) {
        if (grid[row].slice(col, col + word.length).every(c => c === "" || c === word[grid[row].indexOf(c)])) {
            for (let i = 0; i < word.length; i++) {
            grid[row][col + i] = word[i];
            }
            placed = true;
        }
        } else if (dir === "V" && row + word.length <= gridSize) {
        if (grid.slice(row, row + word.length).every((r, i) => r[col] === "" || r[col] === word[i])) {
            for (let i = 0; i < word.length; i++) {
            grid[row + i][col] = word[i];
            }
            placed = true;
        }
        } else if (dir === "D" && row + word.length <= gridSize && col + word.length <= gridSize) {
        let canPlace = true;
        for (let i = 0; i < word.length; i++) {
            if (grid[row + i][col + i] !== "" && grid[row + i][col + i] !== word[i]) {
            canPlace = false;
            break;
            }
        }
        if (canPlace) {
            for (let i = 0; i < word.length; i++) {
            grid[row + i][col + i] = word[i];
            }
            placed = true;
        }
        }
    }
    });
}

function fillGrid() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
        if (!grid[i][j]) {
        grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
        }
    }
    }
}

function renderGrid() {
    const gridElement = document.getElementById("grid");
    gridElement.style.gridTemplateColumns = `repeat(${gridSize}, 40px)`;
    gridElement.style.gridTemplateRows = `repeat(${gridSize}, 40px)`;
    gridElement.innerHTML = "";
    for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.textContent = grid[i][j];
        cell.dataset.row = i;
        cell.dataset.col = j;
        cell.addEventListener("click", handleCellClick);
        gridElement.appendChild(cell);
    }
    }
}

function renderWordList() {
    const list = document.getElementById("wordList");
    list.innerHTML = "<strong>Palavras:</strong> " + palavras.map(w => `<span id="word-${w}">${w}</span>`).join(", ");
}

function handleCellClick(e) {
    const cell = e.target;
    cell.classList.toggle("selected");
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const index = selectedCells.findIndex(c => c.row === row && c.col === col);
    if (index > -1) {
    selectedCells.splice(index, 1);
    } else {
    selectedCells.push({ row, col, letter: grid[row][col] });
    }

    checkWord();
}

function checkWord() {
    const selectedWord = selectedCells.map(c => c.letter).join("");
    if (palavras.includes(selectedWord)) {
    document.getElementById(`word-${selectedWord}`).classList.add("found");
    selectedCells.forEach(({ row, col }) => {
        const cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
        cell.classList.add("found");
    });
    selectedCells.length = 0;
    document.querySelectorAll(".selected").forEach(cell => cell.classList.remove("selected"));
    }
}

// Iniciar com nível fácil por padrão
comecarJogo();
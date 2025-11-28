// Получаем элементы DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const controlsToggle = document.getElementById('controlsToggle');
const controlsPanel = document.getElementById('controlsPanel');
const stats = document.getElementById('stats');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stepBtn = document.getElementById('stepBtn');
const clearBtn = document.getElementById('clearBtn');
const randomBtn = document.getElementById('randomBtn');
const removeRandomBtn = document.getElementById('removeRandomBtn');
const brushSize = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const generationSpan = document.getElementById('generation');
const liveCellsSpan = document.getElementById('liveCells');

// Переменная для переключения статистики
let showStatsOnNextClick = false;

// Настройки игры
const cellSize = 6;
let cols, rows;

// Состояние игры
let grid, nextGrid;
let isRunning = false;
let generation = 0;
let animationId = null;
let updateInterval = 210 - parseInt(speedSlider.value);
let lastUpdateTime = 0;

// Для анимации переходов
let animationStates, animationDirections;

// Инициализация размеров canvas
function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / cellSize);
    rows = Math.floor(canvas.height / cellSize);
    
    // Применяем пиксельную отрисовку
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    
    initGame();
}

// Создание пустой сетки
function createEmptyGrid() {
    return Array(cols).fill().map(() => Array(rows).fill(0));
}

// Инициализация игры
function initGame() {
    grid = createEmptyGrid();
    nextGrid = createEmptyGrid();
    animationStates = createEmptyGrid();
    animationDirections = createEmptyGrid();
    resetAnimations();
    randomizeGrid();
}

// Сброс состояний анимации
function resetAnimations() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            animationStates[i][j] = grid[i][j];
            animationDirections[i][j] = 0;
        }
    }
}

// Инициализация сетки случайными значениями
function randomizeGrid() {
    grid = Array(cols).fill().map(() => 
        Array(rows).fill().map(() => Math.random() > 0.85 ? 1 : 0)
    );
    resetAnimations();
    generation = 0;
    updateStats();
    drawGrid();
}

// Убрать случайные клетки
function removeRandomCells() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (grid[i][j] === 1 && Math.random() > 0.5) {
                grid[i][j] = 0;
                animationStates[i][j] = 1;
                animationDirections[i][j] = -1;
            }
        }
    }
    updateStats();
}

// Очистка сетки
function clearGrid() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (grid[i][j] === 1) {
                animationDirections[i][j] = -1;
            }
        }
    }
    
    setTimeout(() => {
        grid = createEmptyGrid();
        resetAnimations();
        generation = 0;
        updateStats();
    }, 500);
}

// Обновление статистики
function updateStats() {
    generationSpan.textContent = generation;
    
    let liveCount = 0;
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            liveCount += grid[i][j];
        }
    }
    liveCellsSpan.textContent = liveCount;
}

// Отрисовка сетки с анимациями
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const animationSpeed = 0.08;
    
    // Обновляем анимации и рисуем клетки
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const targetState = grid[i][j];
            const currentAnimState = animationStates[i][j];
            const animDirection = animationDirections[i][j];
            
            // Обновляем анимацию
            if (animDirection !== 0) {
                animationStates[i][j] += animDirection * animationSpeed;
                
                if (animDirection === 1 && animationStates[i][j] >= 1) {
                    animationStates[i][j] = 1;
                    animationDirections[i][j] = 0;
                }
                else if (animDirection === -1 && animationStates[i][j] <= 0) {
                    animationStates[i][j] = 0;
                    animationDirections[i][j] = 0;
                }
            }
            else if (currentAnimState !== targetState) {
                if (targetState === 1) {
                    animationStates[i][j] = 0;
                    animationDirections[i][j] = 1;
                } else {
                    animationStates[i][j] = 1;
                    animationDirections[i][j] = -1;
                }
            }
            
            // Рисуем клетку с учетом анимации
            const alpha = animationStates[i][j];
            if (alpha > 0) {
                const brightness = 150 + 55 * alpha;
                ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
                ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }
}

// Подсчет количества живых соседей
function countNeighbors(x, y) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            
            const col = (x + i + cols) % cols;
            const row = (y + j + rows) % rows;
            
            count += grid[col][row];
        }
    }
    return count;
}

// Вычисление следующего поколения
function computeNextGeneration() {
    const changes = [];
    
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const neighbors = countNeighbors(i, j);
            const currentState = grid[i][j];
            let nextState = currentState;
            
            if (currentState === 1 && (neighbors < 2 || neighbors > 3)) {
                nextState = 0;
            } else if (currentState === 0 && neighbors === 3) {
                nextState = 1;
            }
            
            if (currentState !== nextState) {
                changes.push({x: i, y: j, newState: nextState});
            }
        }
    }
    
    changes.forEach(change => {
        grid[change.x][change.y] = change.newState;
        
        if (change.newState === 1) {
            animationStates[change.x][change.y] = 0;
            animationDirections[change.x][change.y] = 1;
        } else {
            animationStates[change.x][change.y] = 1;
            animationDirections[change.x][change.y] = -1;
        }
    });
    
    generation++;
    updateStats();
}

// Основной игровой цикл
function gameLoop(timestamp) {
    if (timestamp - lastUpdateTime > updateInterval) {
        computeNextGeneration();
        lastUpdateTime = timestamp;
    }
    
    drawGrid();
    
    if (isRunning) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Обработка рисования на canvas
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', stopDrawing);

let isDrawing = false;

function startDrawing(e) {
    isDrawing = true;
    draw(e);
    e.preventDefault();
}

function handleTouchStart(e) {
    isDrawing = true;
    handleTouchMove(e);
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!isDrawing) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((touch.clientX - rect.left) / cellSize);
    const y = Math.floor((touch.clientY - rect.top) / cellSize);
    
    drawAtPosition(x, y);
    e.preventDefault();
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    
    drawAtPosition(x, y);
    e.preventDefault();
}

function drawAtPosition(x, y) {
    const size = parseInt(brushSize.value);
    
    for (let i = -size; i <= size; i++) {
        for (let j = -size; j <= size; j++) {
            if (Math.sqrt(i*i + j*j) <= size) {
                const col = (x + i + cols) % cols;
                const row = (y + j + rows) % rows;
                
                if (col >= 0 && col < cols && row >= 0 && row < rows && grid[col][row] === 0) {
                    grid[col][row] = 1;
                    animationStates[col][row] = 0;
                    animationDirections[col][row] = 1;
                }
            }
        }
    }
    
    updateStats();
}

function stopDrawing() {
    isDrawing = false;
}

// Обновление интерфейса
function updateSpeed() {
    updateInterval = 210 - parseInt(speedSlider.value);
    speedValue.textContent = speedSlider.value;
}

function updateBrushSize() {
    brushSizeValue.textContent = brushSize.value;
}

// Обработчики кнопок
controlsToggle.addEventListener('click', () => {
    const isPanelActive = controlsPanel.classList.toggle('active');
    
    // Переключаем статистику через раз
    if (showStatsOnNextClick) {
        stats.classList.toggle('visible');
    }
    showStatsOnNextClick = !showStatsOnNextClick;
    
    // Если панель закрывается, сбрасываем флаг
    if (!isPanelActive) {
        showStatsOnNextClick = false;
    }
});

// Закрытие панели при клике вне ее
document.addEventListener('click', (e) => {
    if (!controlsPanel.contains(e.target) && !controlsToggle.contains(e.target)) {
        controlsPanel.classList.remove('active');
        showStatsOnNextClick = false;
    }
});

// Автоматический старт игры при загрузке
function autoStartGame() {
    if (!isRunning) {
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        stepBtn.disabled = true;
        lastUpdateTime = performance.now();
        gameLoop();
    }
}

startBtn.addEventListener('click', autoStartGame);

pauseBtn.addEventListener('click', () => {
    if (isRunning) {
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        stepBtn.disabled = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }
});

clearBtn.addEventListener('click', clearGrid);
randomBtn.addEventListener('click', randomizeGrid);
removeRandomBtn.addEventListener('click', removeRandomCells);

stepBtn.addEventListener('click', () => {
    if (!isRunning) {
        computeNextGeneration();
    }
});

brushSize.addEventListener('input', updateBrushSize);
speedSlider.addEventListener('input', updateSpeed);

// Обработка изменения размера окна
window.addEventListener('resize', initCanvas);

// Инициализация
initCanvas();
updateBrushSize();
updateSpeed();
autoStartGame();

// Периодически добавляем случайные клетки, если поле почти пустое
setInterval(() => {
    if (isRunning) {
        let liveCount = 0;
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                liveCount += grid[i][j];
            }
        }
        
        if (liveCount < 5 && Math.random() > 0.8) {
            // Добавляем несколько случайных клеток
            for (let i = 0; i < 10; i++) {
                const x = Math.floor(Math.random() * cols);
                const y = Math.floor(Math.random() * rows);
                if (grid[x][y] === 0) {
                    grid[x][y] = 1;
                    animationStates[x][y] = 0;
                    animationDirections[x][y] = 1;
                }
            }
            updateStats();
        }
    }
}, 3000);
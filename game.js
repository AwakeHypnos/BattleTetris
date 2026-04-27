

// ============================================
// 主游戏类
// ============================================
class BattleTetrisGame {
    constructor() {
        this.tetrisCanvas = document.getElementById('gameCanvas');
        this.tetrisCtx = this.tetrisCanvas.getContext('2d');
        this.defenseCanvas = document.getElementById('defenseCanvas');
        
        this.initCanvases();
        this.initGameState();
        this.initUIElements();
        this.initEventListeners();
        
        this.animationId = null;
        this.lastFrameTime = 0;
        
        this.render();
    }
    
    initCanvases() {
        this.tetrisCanvas.width = CONSTANTS.GRID_WIDTH * CONSTANTS.CELL_SIZE;
        this.tetrisCanvas.height = CONSTANTS.GRID_HEIGHT * CONSTANTS.CELL_SIZE;
    }
    
    initGameState() {
        this.grid = this.createEmptyGrid();
        this.tetrisScore = 0;
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.gameOver = false;
        this.isPaused = false;
        this.isStarted = false;
        this.dropTimer = null;
        this.currentPiece = null;
        this.nextPiece = null;
        this.dropSpeed = CONSTANTS.INITIAL_SPEED;
        this.isFastDrop = false;
        
        this.tetrisEnded = false;
        
        this.totalScore = 0;
        this.survivalTime = 0;
        this.gameStartTime = 0;
        
        this.defenseSystem = new DefenseSystem(this.defenseCanvas);
        
        this.isInMainMenu = true;
        this.isInUpgradeMenu = false;
        this.isInGameOverMenu = false;
    }
    
    createEmptyGrid() {
        const grid = [];
        for (let y = 0; y < CONSTANTS.GRID_HEIGHT; y++) {
            const row = [];
            for (let x = 0; x < CONSTANTS.GRID_WIDTH; x++) {
                row.push(null);
            }
            grid.push(row);
        }
        return grid;
    }
    
    initUIElements() {
        this.ui = {
            mainMenu: document.getElementById('mainMenuOverlay'),
            pauseMenu: document.getElementById('pauseOverlay'),
            upgradeMenu: document.getElementById('weaponUpgradeOverlay'),
            buffUpgradeMenu: document.getElementById('buffUpgradeOverlay'),
            gameOverMenu: document.getElementById('gameOverOverlay'),
            howToPlayMenu: document.getElementById('howToPlayOverlay'),
            speedBoostMenu: document.getElementById('speedBoostOverlay'),
            
            tetrisScore: document.getElementById('tetrisScore'),
            defenseScore: document.getElementById('defenseScore'),
            totalScore: document.getElementById('totalScore'),
            level: document.getElementById('level'),
            combo: document.getElementById('combo'),
            
            wallHpFill: document.getElementById('wallHpFill'),
            wallHpText: document.getElementById('wallHpText'),
            killCount: document.getElementById('killCount'),
            survivalTime: document.getElementById('survivalTime'),
            damageBonus: document.getElementById('damageBonus'),
            
            weaponProgress: {
                FIRE: document.getElementById('fireProgress'),
                PIERCE: document.getElementById('orangeProgress'),
                ICE: document.getElementById('blueProgress'),
                POISON: document.getElementById('greenProgress'),
                SPACE: document.getElementById('purpleProgress'),
                SHOTGUN: document.getElementById('yellowProgress')
            },
            weaponPoints: {
                FIRE: document.getElementById('firePoints'),
                PIERCE: document.getElementById('orangePoints'),
                ICE: document.getElementById('bluePoints'),
                POISON: document.getElementById('greenPoints'),
                SPACE: document.getElementById('purplePoints'),
                SHOTGUN: document.getElementById('yellowPoints')
            }
        };
    }
    
    initEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveGame());
        document.getElementById('loadBtn').addEventListener('click', () => this.loadGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        
        document.getElementById('newGameBtn').addEventListener('click', () => this.startNewGame());
        document.getElementById('loadGameBtn').addEventListener('click', () => this.loadGameFromMenu());
        document.getElementById('howToPlayBtn').addEventListener('click', () => this.showHowToPlay());
        
        document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
        document.getElementById('loadMenuBtn').addEventListener('click', () => this.loadGame());
        document.getElementById('saveMenuBtn').addEventListener('click', () => this.saveGame());
        document.getElementById('mainMenuBtn').addEventListener('click', () => this.returnToMainMenu());
        document.getElementById('exitBtn').addEventListener('click', () => this.exitGame());
        
        document.getElementById('confirmUpgrade').addEventListener('click', () => this.confirmWeaponUpgrade());
        document.getElementById('deferUpgrade').addEventListener('click', () => this.deferWeaponUpgrade());
        
        document.getElementById('playAgainBtn').addEventListener('click', () => this.startNewGame());
        document.getElementById('returnToMenuBtn').addEventListener('click', () => this.returnToMainMenu());
        
        document.getElementById('closeHowToPlay').addEventListener('click', () => this.hideHowToPlay());
        
        document.getElementById('speed1_5x').addEventListener('click', () => this.setSpeedBoost(1.5));
        document.getElementById('speed2x').addEventListener('click', () => this.setSpeedBoost(2.0));
        document.getElementById('speedNoBoost').addEventListener('click', () => this.setSpeedBoost(1.0));
        
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    handleKeyDown(e) {
        if (this.isInMainMenu || this.isInGameOverMenu) return;
        
        if (e.key === 'Escape') {
            if (this.isInUpgradeMenu) return;
            this.togglePause();
            return;
        }
        
        if (this.gameOver || this.isPaused || !this.isStarted) return;
        
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.movePiece(1, 0);
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.rotatePiece();
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.movePiece(0, 1);
                break;
            case ' ':
                e.preventDefault();
                this.hardDrop();
                break;
        }
    }
    
    generatePiece() {
        const size = Utils.randomInt(CONSTANTS.MIN_BLOCK_SIZE, CONSTANTS.MAX_BLOCK_SIZE);
        const color = Utils.randomChoice(CONSTANTS.BLOCK_COLORS);
        const shape = Utils.generateBlockShape(size);
        
        let minX = Infinity, maxX = -Infinity;
        shape.forEach(([x, y]) => {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
        });
        
        const centerX = Math.floor((CONSTANTS.GRID_WIDTH - (maxX - minX + 1)) / 2) - minX;
        
        return {
            shape,
            color,
            x: centerX,
            y: 0
        };
    }
    
    canMove(piece, offsetX = 0, offsetY = 0) {
        if (!piece) return false;
        
        const newX = piece.x + offsetX;
        const newY = piece.y + offsetY;
        
        return piece.shape.every(([x, y]) => {
            const gridX = newX + x;
            const gridY = newY + y;
            
            if (gridX < 0 || gridX >= CONSTANTS.GRID_WIDTH) return false;
            if (gridY >= CONSTANTS.GRID_HEIGHT) return false;
            if (gridY < 0) return true;
            
            return this.grid[gridY][gridX] === null;
        });
    }
    
    movePiece(offsetX, offsetY) {
        if (this.gameOver || this.isPaused || !this.currentPiece) return false;
        
        if (this.canMove(this.currentPiece, offsetX, offsetY)) {
            this.currentPiece.x += offsetX;
            this.currentPiece.y += offsetY;
            return true;
        }
        
        if (offsetY > 0) {
            this.lockPiece();
        }
        
        return false;
    }
    
    rotatePiece() {
        if (this.gameOver || this.isPaused || !this.currentPiece) return;
        
        const rotatedShape = Utils.rotateShape(this.currentPiece.shape);
        const originalShape = this.currentPiece.shape;
        
        this.currentPiece.shape = rotatedShape;
        
        if (!this.canMove(this.currentPiece)) {
            const kicks = [-1, 1, -2, 2];
            let kicked = false;
            
            for (const kick of kicks) {
                if (this.canMove(this.currentPiece, kick, 0)) {
                    this.currentPiece.x += kick;
                    kicked = true;
                    break;
                }
            }
            
            if (!kicked) {
                this.currentPiece.shape = originalShape;
            }
        }
    }
    
    lockPiece() {
        if (!this.currentPiece) return;
        
        if (this.currentPiece.y <= 0) {
            this.endTetrisGame();
            return;
        }
        
        this.currentPiece.shape.forEach(([x, y]) => {
            const gridX = this.currentPiece.x + x;
            const gridY = this.currentPiece.y + y;
            
            if (gridY >= 0 && gridY < CONSTANTS.GRID_HEIGHT) {
                this.grid[gridY][gridX] = this.currentPiece.color;
            }
        });
        
        this.currentPiece = null;
        
        this.applyGravity();
        
        const hasCleared = this.checkAndClear();
        
        if (hasCleared) {
            this.combo++;
            if (this.combo > this.maxCombo) {
                this.maxCombo = this.combo;
            }
            this.stopDropTimer();
        } else {
            this.combo = 0;
            this.spawnNewPiece();
        }
        
        this.updateUI();
    }
    
    endTetrisGame() {
        if (this.tetrisEnded) return;
        
        this.tetrisEnded = true;
        this.currentPiece = null;
        this.stopDropTimer();
        
        this.showSpeedBoostMenu();
    }
    
    showSpeedBoostMenu() {
        this.isPaused = true;
        this.ui.speedBoostMenu.classList.remove('hidden');
    }
    
    hideSpeedBoostMenu() {
        this.ui.speedBoostMenu.classList.add('hidden');
    }
    
    setSpeedBoost(multiplier) {
        this.defenseSystem.speedMultiplier = multiplier;
        this.hideSpeedBoostMenu();
        this.isPaused = false;
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    spawnNewPiece() {
        this.currentPiece = this.nextPiece || this.generatePiece();
        this.nextPiece = this.generatePiece();
        
        if (!this.canMove(this.currentPiece)) {
            this.endTetrisGame();
        }
    }
    
    checkAndClear() {
        const toClear = new Set();
        const clearedColors = new Map();
        
        for (let y = 0; y < CONSTANTS.GRID_HEIGHT; y++) {
            for (let x = 0; x < CONSTANTS.GRID_WIDTH; x++) {
                const color = this.grid[y][x];
                if (color && !toClear.has(`${x},${y}`)) {
                    const connected = this.findConnected(x, y, color);
                    if (connected.length >= CONSTANTS.CLEAR_THRESHOLD) {
                        connected.forEach(pos => {
                            toClear.add(`${pos.x},${pos.y}`);
                            clearedColors.set(color, (clearedColors.get(color) || 0) + 1);
                        });
                    }
                }
            }
        }
        
        if (toClear.size > 0) {
            this.clearBlocks(toClear, clearedColors);
            return true;
        }
        
        return false;
    }
    
    findConnected(startX, startY, color) {
        const horizontal = this.findHorizontalLine(startX, startY, color);
        const vertical = this.findVerticalLine(startX, startY, color);
        
        const allConnected = new Set();
        
        if (horizontal.length >= CONSTANTS.CLEAR_THRESHOLD) {
            horizontal.forEach(pos => allConnected.add(`${pos.x},${pos.y}`));
        }
        
        if (vertical.length >= CONSTANTS.CLEAR_THRESHOLD) {
            vertical.forEach(pos => allConnected.add(`${pos.x},${pos.y}`));
        }
        
        const result = [];
        allConnected.forEach(key => {
            const [x, y] = key.split(',').map(Number);
            result.push({x, y});
        });
        
        return result;
    }
    
    findHorizontalLine(startX, startY, color) {
        const line = [];
        
        let x = startX;
        while (x >= 0 && this.grid[startY][x] === color) {
            line.push({x, y: startY});
            x--;
        }
        
        x = startX + 1;
        while (x < CONSTANTS.GRID_WIDTH && this.grid[startY][x] === color) {
            line.push({x, y: startY});
            x++;
        }
        
        return line;
    }
    
    findVerticalLine(startX, startY, color) {
        const line = [];
        
        let y = startY;
        while (y >= 0 && this.grid[y][startX] === color) {
            line.push({x: startX, y});
            y--;
        }
        
        y = startY + 1;
        while (y < CONSTANTS.GRID_HEIGHT && this.grid[y][startX] === color) {
            line.push({x: startX, y});
            y++;
        }
        
        return line;
    }
    
    clearBlocks(toClear, clearedColors) {
        this.updateTetrisScore(toClear.size);
        
        const scoreMultiplier = this.defenseSystem.upgradeSystem.getScoreMultiplier();
        
        clearedColors.forEach((count, color) => {
            const basePoints = count * (5 + this.combo * 2);
            const adjustedPoints = Math.floor(basePoints * scoreMultiplier);
            
            const weaponUnlock = this.defenseSystem.addWeaponPoints(color, basePoints);
            
            if (weaponUnlock && !this.isInUpgradeMenu) {
                this.showUpgradeMenu(weaponUnlock);
            }
            
            const buffUpgrade = this.defenseSystem.addScoreForUpgrade(basePoints);
            if (buffUpgrade && !this.isInUpgradeMenu && !this.defenseSystem.isWeaponUnlockPending) {
                this.showBuffUpgradeMenu(buffUpgrade);
            }
        });
        
        toClear.forEach(key => {
            const [x, y] = key.split(',').map(Number);
            this.grid[y][x] = null;
        });
        
        this.applyGravity();
        
        setTimeout(() => {
            const hasMoreClears = this.checkAndClear();
            
            if (!hasMoreClears) {
                this.spawnNewPiece();
                this.startDropTimer();
            }
        }, 100);
    }
    
    applyGravity() {
        for (let x = 0; x < CONSTANTS.GRID_WIDTH; x++) {
            let writePos = CONSTANTS.GRID_HEIGHT - 1;
            
            for (let y = CONSTANTS.GRID_HEIGHT - 1; y >= 0; y--) {
                if (this.grid[y][x] !== null) {
                    if (y !== writePos) {
                        this.grid[writePos][x] = this.grid[y][x];
                        this.grid[y][x] = null;
                    }
                    writePos--;
                }
            }
        }
    }
    
    updateTetrisScore(blocksCleared) {
        let points = CONSTANTS.SCORE.BASE;
        
        const extraBlocks = Math.max(0, blocksCleared - 1);
        points += extraBlocks * CONSTANTS.SCORE.PER_BLOCK;
        
        let multiplier = 1.0;
        
        const comboLayers = Math.min(this.combo, CONSTANTS.SCORE.MAX_COMBO_BUFF);
        multiplier += comboLayers * CONSTANTS.SCORE.COMBO_BUFF;
        
        multiplier += (this.level - 1) * CONSTANTS.SCORE.LEVEL_BUFF;
        
        multiplier = Math.min(multiplier, CONSTANTS.SCORE.MAX_MULTIPLIER);
        
        points *= multiplier;
        
        points += this.maxCombo * CONSTANTS.SCORE.COMBO_BONUS_PER;
        
        points = Math.floor(points);
        
        this.tetrisScore += points;
        
        this.checkLevelUp();
        
        this.updateDamageBonus();
    }
    
    updateDamageBonus() {
        const damageBonus = 1 + Math.min(
            this.tetrisScore * CONSTANTS.BONUS_SYSTEM.DAMAGE_BONUS_PER_TETRIS_SCORE,
            CONSTANTS.BONUS_SYSTEM.MAX_DAMAGE_BONUS - 1
        );
        
        this.defenseSystem.setBonuses({ damageBonus });
    }
    
    checkLevelUp() {
        const newLevel = Math.floor(this.tetrisScore / CONSTANTS.LEVEL.SCORE_PER_LEVEL) + 1;
        
        if (newLevel > this.level) {
            this.level = newLevel;
            
            this.dropSpeed = Math.max(100, CONSTANTS.INITIAL_SPEED * Math.pow(CONSTANTS.LEVEL.SPEED_INCREASE, this.level - 1));
            
            this.resetDropTimer();
        }
    }
    
    calculateTotalScore() {
        const gameMinutes = Math.max(1, Math.floor(this.survivalTime / 60));
        const wallHPBonus = Math.max(0, this.defenseSystem.wallHP) * CONSTANTS.SCORING.WALL_HP_BONUS;
        
        this.totalScore = Math.floor(
            this.defenseSystem.defenseScore +
            this.tetrisScore * gameMinutes +
            wallHPBonus
        );
        
        return this.totalScore;
    }
    
    getRating() {
        const score = this.calculateTotalScore();
        
        if (score >= CONSTANTS.RATINGS.S.minScore) return CONSTANTS.RATINGS.S;
        if (score >= CONSTANTS.RATINGS.A.minScore) return CONSTANTS.RATINGS.A;
        if (score >= CONSTANTS.RATINGS.B.minScore) return CONSTANTS.RATINGS.B;
        if (score >= CONSTANTS.RATINGS.C.minScore) return CONSTANTS.RATINGS.C;
        return CONSTANTS.RATINGS.D;
    }
    
    updateUI() {
        if (this.ui.tetrisScore) this.ui.tetrisScore.textContent = Utils.formatScore(this.tetrisScore);
        if (this.ui.defenseScore) this.ui.defenseScore.textContent = Utils.formatScore(this.defenseSystem.defenseScore);
        if (this.ui.totalScore) this.ui.totalScore.textContent = Utils.formatScore(this.calculateTotalScore());
        if (this.ui.level) this.ui.level.textContent = this.level;
        if (this.ui.combo) this.ui.combo.textContent = this.combo;
        
        const wallHPPercent = Math.max(0, this.defenseSystem.wallHP / this.defenseSystem.maxWallHP * 100);
        if (this.ui.wallHpFill) {
            this.ui.wallHpFill.style.width = `${wallHPPercent}%`;
            
            if (wallHPPercent > 60) {
                this.ui.wallHpFill.style.background = 'linear-gradient(90deg, #4ecca3, #7ee8c7)';
            } else if (wallHPPercent > 30) {
                this.ui.wallHpFill.style.background = 'linear-gradient(90deg, #ff8c00, #ffaa4d)';
            } else {
                this.ui.wallHpFill.style.background = 'linear-gradient(90deg, #e94560, #ff6b7a)';
            }
        }
        
        if (this.ui.wallHpText) {
            this.ui.wallHpText.textContent = `${Math.max(0, this.defenseSystem.wallHP)}/${this.defenseSystem.maxWallHP}`;
        }
        
        if (this.ui.killCount) this.ui.killCount.textContent = this.defenseSystem.killCount;
        
        const minutes = Math.floor(this.survivalTime / 60);
        const seconds = Math.floor(this.survivalTime % 60);
        if (this.ui.survivalTime) {
            this.ui.survivalTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        const damageBonusPercent = Math.floor((this.defenseSystem.bonuses.damageBonus - 1) * 100);
        if (this.ui.damageBonus) {
            this.ui.damageBonus.textContent = `+${damageBonusPercent}%`;
        }
        
        this.updateWeaponProgressUI();
    }
    
    updateWeaponProgressUI() {
        const weaponTypes = ['FIRE', 'PIERCE', 'ICE', 'POISON', 'SPACE', 'SHOTGUN'];
        
        weaponTypes.forEach(type => {
            const currentLevel = this.defenseSystem.weaponLevels[type];
            const nextLevel = currentLevel + 1;
            const nextThreshold = CONSTANTS.WEAPON_LEVEL_THRESHOLDS[nextLevel];
            const points = this.defenseSystem.weaponPoints[type];
            
            let progress = 0;
            let displayText = '';
            
            if (currentLevel >= 5) {
                progress = 100;
                displayText = 'MAX';
            } else if (nextThreshold) {
                progress = Math.min(100, (points / nextThreshold) * 100);
                displayText = `${Math.floor(points)}/${nextThreshold}`;
            }
            
            if (this.ui.weaponProgress[type]) {
                this.ui.weaponProgress[type].style.width = `${progress}%`;
            }
            if (this.ui.weaponPoints[type]) {
                this.ui.weaponPoints[type].textContent = displayText;
            }
        });
    }
    
    render() {
        this.renderTetris();
        this.defenseSystem.draw();
    }
    
    renderTetris() {
        this.tetrisCtx.fillStyle = CONSTANTS.COLORS.EMPTY;
        this.tetrisCtx.fillRect(0, 0, this.tetrisCanvas.width, this.tetrisCanvas.height);
        
        this.tetrisCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.tetrisCtx.lineWidth = 1;
        
        for (let x = 0; x <= CONSTANTS.GRID_WIDTH; x++) {
            this.tetrisCtx.beginPath();
            this.tetrisCtx.moveTo(x * CONSTANTS.CELL_SIZE, 0);
            this.tetrisCtx.lineTo(x * CONSTANTS.CELL_SIZE, this.tetrisCanvas.height);
            this.tetrisCtx.stroke();
        }
        
        for (let y = 0; y <= CONSTANTS.GRID_HEIGHT; y++) {
            this.tetrisCtx.beginPath();
            this.tetrisCtx.moveTo(0, y * CONSTANTS.CELL_SIZE);
            this.tetrisCtx.lineTo(this.tetrisCanvas.width, y * CONSTANTS.CELL_SIZE);
            this.tetrisCtx.stroke();
        }
        
        for (let y = 0; y < CONSTANTS.GRID_HEIGHT; y++) {
            for (let x = 0; x < CONSTANTS.GRID_WIDTH; x++) {
                const color = this.grid[y][x];
                if (color) {
                    this.drawCell(x, y, CONSTANTS.COLORS[color]);
                }
            }
        }
        
        if (this.currentPiece) {
            this.currentPiece.shape.forEach(([x, y]) => {
                const gridX = this.currentPiece.x + x;
                const gridY = this.currentPiece.y + y;
                if (gridY >= 0) {
                    this.drawCell(gridX, gridY, CONSTANTS.COLORS[this.currentPiece.color]);
                }
            });
            
            this.drawGhost();
        }
        
        if (this.gameOver) {
            this.tetrisCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.tetrisCtx.fillRect(0, 0, this.tetrisCanvas.width, this.tetrisCanvas.height);
            
            this.tetrisCtx.fillStyle = '#fff';
            this.tetrisCtx.font = 'bold 30px Arial';
            this.tetrisCtx.textAlign = 'center';
            this.tetrisCtx.fillText('游戏结束', this.tetrisCanvas.width / 2, this.tetrisCanvas.height / 2 - 30);
            
            this.tetrisCtx.font = '20px Arial';
            this.tetrisCtx.fillText(`最终分数: ${Utils.formatScore(this.totalScore)}`, this.tetrisCanvas.width / 2, this.tetrisCanvas.height / 2 + 10);
            this.tetrisCtx.fillText(`等级: ${this.level}`, this.tetrisCanvas.width / 2, this.tetrisCanvas.height / 2 + 40);
        }
        
        if (this.isPaused && !this.gameOver) {
            this.tetrisCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.tetrisCtx.fillRect(0, 0, this.tetrisCanvas.width, this.tetrisCanvas.height);
            
            this.tetrisCtx.fillStyle = '#fff';
            this.tetrisCtx.font = 'bold 30px Arial';
            this.tetrisCtx.textAlign = 'center';
            this.tetrisCtx.fillText('暂停中', this.tetrisCanvas.width / 2, this.tetrisCanvas.height / 2);
        }
    }
    
    drawCell(x, y, color) {
        const padding = 2;
        const size = CONSTANTS.CELL_SIZE - padding * 2;
        
        this.tetrisCtx.fillStyle = color;
        this.tetrisCtx.fillRect(
            x * CONSTANTS.CELL_SIZE + padding,
            y * CONSTANTS.CELL_SIZE + padding,
            size,
            size
        );
        
        this.tetrisCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.tetrisCtx.fillRect(
            x * CONSTANTS.CELL_SIZE + padding,
            y * CONSTANTS.CELL_SIZE + padding,
            size,
            size / 3
        );
        
        this.tetrisCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.tetrisCtx.fillRect(
            x * CONSTANTS.CELL_SIZE + padding,
            y * CONSTANTS.CELL_SIZE + padding + size * 2/3,
            size,
            size / 3
        );
    }
    
    getGhostY() {
        if (!this.currentPiece) return 0;
        
        let dropY = this.currentPiece.y;
        while (this.canMove(this.currentPiece, 0, dropY - this.currentPiece.y + 1)) {
            dropY++;
        }
        
        return dropY;
    }
    
    drawGhost() {
        if (!this.currentPiece) return;
        
        const dropY = this.getGhostY();
        
        this.tetrisCtx.globalAlpha = 0.3;
        this.currentPiece.shape.forEach(([x, y]) => {
            const gridX = this.currentPiece.x + x;
            const gridY = dropY + y;
            if (gridY >= 0) {
                this.drawCell(gridX, gridY, CONSTANTS.COLORS[this.currentPiece.color]);
            }
        });
        this.tetrisCtx.globalAlpha = 1;
    }
    
    hardDrop() {
        if (this.gameOver || this.isPaused || !this.currentPiece || !this.isStarted) return;
        
        const dropY = this.getGhostY();
        this.currentPiece.y = dropY;
        this.lockPiece();
    }
    
    gameLoop(timestamp) {
        if (!this.isStarted || this.gameOver || this.isPaused) return;
        
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        this.survivalTime += deltaTime / 1000;
        
        this.defenseSystem.update(timestamp);
        
        if (this.defenseSystem.isGameOver()) {
            this.endGame();
            return;
        }
        
        this.updateUI();
        this.render();
        
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    startNewGame() {
        this.ui.mainMenu.classList.add('hidden');
        this.ui.gameOverMenu.classList.add('hidden');
        this.isInMainMenu = false;
        this.isInGameOverMenu = false;
        
        this.startGame();
    }
    
    startGame() {
        this.initGameState();
        this.isInMainMenu = false;
        this.isStarted = true;
        this.gameStartTime = Date.now();
        this.survivalTime = 0;
        this.lastFrameTime = performance.now();
        
        this.defenseSystem.reset();
        this.defenseSystem.start();
        
        this.spawnNewPiece();
        this.startDropTimer();
        this.updateUI();
        
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('saveBtn').disabled = false;
    }
    
    togglePause() {
        if (this.gameOver || !this.isStarted) return;
        
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = this.isPaused ? '继续' : '暂停';
        
        if (this.isPaused) {
            this.stopDropTimer();
            this.showPauseMenu();
        } else {
            this.hidePauseMenu();
            this.startDropTimer();
            this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
        }
        
        this.render();
    }
    
    resumeGame() {
        this.hidePauseMenu();
        this.isPaused = false;
        document.getElementById('pauseBtn').textContent = '暂停';
        this.startDropTimer();
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    showPauseMenu() {
        this.ui.pauseMenu.classList.remove('hidden');
    }
    
    hidePauseMenu() {
        this.ui.pauseMenu.classList.add('hidden');
    }
    
    showUpgradeMenu(upgrade) {
        this.isInUpgradeMenu = true;
        this.isPaused = true;
        this.stopDropTimer();
        
        const weaponType = upgrade.weaponType;
        const weaponName = CONSTANTS.WEAPON_NAMES[weaponType];
        const weaponConfig = CONSTANTS.WEAPONS[weaponType];
        
        const preview = document.getElementById('upgradeWeaponPreview');
        const details = document.getElementById('upgradeWeaponDetails');
        
        preview.style.backgroundColor = weaponConfig.color;
        preview.style.borderColor = weaponConfig.color;
        preview.style.boxShadow = `0 0 30px ${weaponConfig.color}`;
        
        const currentLevel = this.defenseSystem.weaponLevels[weaponType];
        const newLevel = currentLevel + 1;
        
        details.innerHTML = `
            <div style="font-size: 20px; font-weight: bold; color: ${weaponConfig.color}; margin-bottom: 10px;">${weaponName}</div>
            <div style="color: #aaa; margin-bottom: 5px;">等级: ${currentLevel} → ${newLevel}</div>
            <div style="color: #4ecca3; margin-bottom: 5px;">伤害: +15%</div>
            <div style="color: #4ecca3; margin-bottom: 5px;">攻速: +10%</div>
            <div style="color: #4ecca3;">范围: +10%</div>
        `;
        
        this.ui.upgradeMenu.classList.remove('hidden');
    }
    
    confirmWeaponUpgrade() {
        this.defenseSystem.confirmUpgrade();
        this.ui.upgradeMenu.classList.add('hidden');
        this.isInUpgradeMenu = false;
        this.isPaused = false;
        this.startDropTimer();
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
        this.updateWeaponProgressUI();
    }
    
    deferWeaponUpgrade() {
        this.defenseSystem.deferUpgrade();
        this.defenseSystem.deferWeaponUnlock();
        this.ui.upgradeMenu.classList.add('hidden');
        this.isInUpgradeMenu = false;
        this.isPaused = false;
        this.startDropTimer();
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    showBuffUpgradeMenu(upgrade) {
        this.isInUpgradeMenu = true;
        this.isPaused = true;
        this.stopDropTimer();
        
        const container = document.getElementById('buffOptionsContainer');
        container.innerHTML = '';
        
        const options = upgrade.options;
        
        options.forEach((option, index) => {
            const card = document.createElement('div');
            card.className = 'buff-option-card';
            card.style.borderColor = option.color;
            card.style.boxShadow = `0 0 20px ${option.color}40`;
            
            const categoryLabel = option.category === 'general' ? '通用' : 
                (option.weaponType ? CONSTANTS.WEAPON_NAMES[option.weaponType] || '专属' : '专属');
            const categoryColor = option.category === 'general' ? '#aaa' : option.color;
            
            card.innerHTML = `
                <div class="buff-category" style="color: ${categoryColor}">${categoryLabel}</div>
                <div class="buff-name" style="color: ${option.color}">${option.name}</div>
                <div class="buff-description">${option.description}</div>
            `;
            
            card.addEventListener('click', () => this.selectBuffUpgrade(index));
            
            container.appendChild(card);
        });
        
        this.ui.buffUpgradeMenu.classList.remove('hidden');
    }
    
    selectBuffUpgrade(optionIndex) {
        this.defenseSystem.selectUpgrade(optionIndex);
        
        this.ui.buffUpgradeMenu.classList.add('hidden');
        this.isInUpgradeMenu = false;
        this.isPaused = false;
        
        if (!this.tetrisEnded) {
            this.startDropTimer();
        }
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    endGame() {
        this.gameOver = true;
        this.stopDropTimer();
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.saveGameAuto();
        
        this.showGameOverMenu();
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('saveBtn').disabled = true;
    }
    
    showGameOverMenu() {
        this.isInGameOverMenu = true;
        
        const rating = this.getRating();
        const totalScore = this.calculateTotalScore();
        
        document.getElementById('ratingDisplay').textContent = rating.name;
        document.getElementById('ratingDisplay').style.color = rating.color;
        
        document.getElementById('finalTetrisScore').textContent = Utils.formatScore(this.tetrisScore);
        document.getElementById('finalDefenseScore').textContent = Utils.formatScore(this.defenseSystem.defenseScore);
        document.getElementById('finalTotalScore').textContent = Utils.formatScore(totalScore);
        
        document.getElementById('finalKills').textContent = this.defenseSystem.killCount;
        document.getElementById('finalCombo').textContent = this.maxCombo;
        
        const minutes = Math.floor(this.survivalTime / 60);
        const seconds = Math.floor(this.survivalTime % 60);
        document.getElementById('finalSurvival').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('finalLevel').textContent = this.level;
        
        this.ui.gameOverMenu.classList.remove('hidden');
    }
    
    returnToMainMenu() {
        this.stopDropTimer();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.hidePauseMenu();
        this.ui.gameOverMenu.classList.add('hidden');
        this.ui.mainMenu.classList.remove('hidden');
        
        this.initGameState();
        this.updateUI();
        this.render();
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('saveBtn').disabled = true;
        document.getElementById('pauseBtn').textContent = '暂停';
    }
    
    exitGame() {
        if (confirm('确定要退出游戏吗？')) {
            this.returnToMainMenu();
        }
    }
    
    showHowToPlay() {
        this.ui.howToPlayMenu.classList.remove('hidden');
    }
    
    hideHowToPlay() {
        this.ui.howToPlayMenu.classList.add('hidden');
    }
    
    restartGame() {
        this.stopDropTimer();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.initGameState();
        this.startGame();
    }
    
    startDropTimer() {
        this.stopDropTimer();
        const speed = this.isFastDrop ? CONSTANTS.FAST_SPEED : this.dropSpeed;
        this.dropTimer = setInterval(() => {
            this.movePiece(0, 1);
        }, speed);
    }
    
    stopDropTimer() {
        if (this.dropTimer) {
            clearInterval(this.dropTimer);
            this.dropTimer = null;
        }
    }
    
    resetDropTimer() {
        if (this.dropTimer) {
            this.startDropTimer();
        }
    }
    
    startFastDrop() {
        if (this.gameOver || this.isPaused || !this.isStarted) return;
        this.isFastDrop = true;
        this.startDropTimer();
    }
    
    stopFastDrop() {
        if (this.gameOver || this.isPaused || !this.isStarted) return;
        this.isFastDrop = false;
        this.startDropTimer();
    }
    
    hasSaveData() {
        try {
            return localStorage.getItem(CONSTANTS.SAVE_KEY) !== null;
        } catch (e) {
            console.error('检查存档失败:', e);
            return false;
        }
    }
    
    getSaveInfo() {
        try {
            const saveData = localStorage.getItem(CONSTANTS.SAVE_KEY);
            if (!saveData) return null;
            
            const data = JSON.parse(saveData);
            const savedDate = new Date(data.savedAt);
            
            return {
                tetrisScore: data.tetrisScore,
                defenseScore: data.defenseScore,
                totalScore: data.totalScore,
                level: data.level,
                savedAt: savedDate.toLocaleString(),
                isGameOver: data.gameOver,
                isPaused: data.isPaused
            };
        } catch (e) {
            console.error('获取存档信息失败:', e);
            return null;
        }
    }
    
    formatSaveInfo(saveInfo) {
        if (!saveInfo) {
            return '【存档栏位 1】\n状态：空\n路径：localStorage.' + CONSTANTS.SAVE_KEY;
        }
        
        let status = '进行中';
        if (saveInfo.isGameOver) {
            status = '已结束';
        } else if (saveInfo.isPaused) {
            status = '已暂停';
        }
        
        return `【存档栏位 1】
状态：${status}
方块分数：${saveInfo.tetrisScore}
塔防分数：${saveInfo.defenseScore}
总分：${saveInfo.totalScore}
等级：${saveInfo.level}
存档时间：${saveInfo.savedAt}
路径：localStorage.${CONSTANTS.SAVE_KEY}`;
    }
    
    saveGame() {
        if (!this.isStarted) {
            alert('请先开始游戏！');
            return;
        }
        
        const saveData = {
            grid: this.grid,
            tetrisScore: this.tetrisScore,
            level: this.level,
            combo: this.combo,
            maxCombo: this.maxCombo,
            dropSpeed: this.dropSpeed,
            currentPiece: this.currentPiece,
            nextPiece: this.nextPiece,
            gameOver: this.gameOver,
            isPaused: this.isPaused,
            isStarted: this.isStarted,
            survivalTime: this.survivalTime,
            totalScore: this.totalScore,
            
            defenseState: this.defenseSystem.getState(),
            
            savedAt: Date.now()
        };
        
        try {
            localStorage.setItem(CONSTANTS.SAVE_KEY, JSON.stringify(saveData));
            
            const saveInfo = this.getSaveInfo();
            const formattedInfo = this.formatSaveInfo(saveInfo);
            alert(`存档成功！\n\n${formattedInfo}`);
        } catch (e) {
            console.error('存档失败:', e);
            alert('存档失败，请检查浏览器存储权限。');
        }
    }
    
    saveGameAuto() {
        try {
            const saveData = {
                grid: this.grid,
                tetrisScore: this.tetrisScore,
                level: this.level,
                combo: this.combo,
                maxCombo: this.maxCombo,
                dropSpeed: this.dropSpeed,
                currentPiece: this.currentPiece,
                nextPiece: this.nextPiece,
                gameOver: this.gameOver,
                isPaused: this.isPaused,
                isStarted: this.isStarted,
                survivalTime: this.survivalTime,
                totalScore: this.totalScore,
                
                defenseState: this.defenseSystem.getState(),
                
                savedAt: Date.now(),
                isAutoSave: true
            };
            
            localStorage.setItem(CONSTANTS.SAVE_KEY, JSON.stringify(saveData));
        } catch (e) {
            console.error('自动存档失败:', e);
        }
    }
    
    loadGame() {
        try {
            const saveInfo = this.getSaveInfo();
            
            if (!saveInfo) {
                alert('没有找到存档！\n\n' + this.formatSaveInfo(null));
                return;
            }
            
            const formattedInfo = this.formatSaveInfo(saveInfo);
            const userConfirmed = confirm(`是否读取以下存档？\n\n${formattedInfo}`);
            
            if (!userConfirmed) {
                return;
            }
            
            const saveData = localStorage.getItem(CONSTANTS.SAVE_KEY);
            const data = JSON.parse(saveData);
            
            this.stopDropTimer();
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
            
            this.grid = data.grid || this.createEmptyGrid();
            this.tetrisScore = data.tetrisScore || 0;
            this.level = data.level || 1;
            this.combo = data.combo || 0;
            this.maxCombo = data.maxCombo || 0;
            this.dropSpeed = data.dropSpeed || CONSTANTS.INITIAL_SPEED;
            this.currentPiece = data.currentPiece || null;
            this.nextPiece = data.nextPiece || null;
            this.gameOver = data.gameOver || false;
            this.isPaused = data.isPaused || false;
            this.isStarted = data.isStarted || false;
            this.survivalTime = data.survivalTime || 0;
            this.totalScore = data.totalScore || 0;
            
            this.defenseSystem.loadState(data.defenseState);
            
            this.hidePauseMenu();
            this.ui.gameOverMenu.classList.add('hidden');
            this.ui.mainMenu.classList.add('hidden');
            this.isInMainMenu = false;
            this.isInGameOverMenu = false;
            
            this.updateUI();
            
            if (this.isStarted && !this.gameOver && !this.isPaused) {
                this.lastFrameTime = performance.now();
                this.startDropTimer();
                this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
            }
            
            document.getElementById('startBtn').disabled = this.isStarted && !this.gameOver;
            document.getElementById('pauseBtn').disabled = !this.isStarted || this.gameOver;
            document.getElementById('saveBtn').disabled = !this.isStarted;
            
            if (this.isPaused) {
                document.getElementById('pauseBtn').textContent = '继续';
            } else {
                document.getElementById('pauseBtn').textContent = '暂停';
            }
            
            this.render();
            alert('读档成功！');
            
        } catch (e) {
            console.error('读档失败:', e);
            alert('读档失败！错误信息：' + e.message);
        }
    }
    
    loadGameFromMenu() {
        if (!this.hasSaveData()) {
            alert('没有找到存档！');
            return;
        }
        this.loadGame();
    }
}

window.addEventListener('load', () => {
    const game = new BattleTetrisGame();
});
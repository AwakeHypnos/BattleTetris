

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
        this.isInLevelSelectMenu = false;
        
        this.turretOverloadActive = false;
        this.turretOverloadEndTime = 0;
        
        this.nextEffectDouble = false;
        
        this.sacrificeMode = false;
        this.sacrificeFromPause = false;
        
        this.isLevelMode = false;
        this.currentLevelNumber = 0;
        this.levelComplete = false;
        this.levelFailed = false;
        
        this.loadUnlockedLevels();
    }
    
    loadUnlockedLevels() {
        try {
            const saved = localStorage.getItem('battle_tetris_unlocked_levels');
            if (saved) {
                this.unlockedLevels = JSON.parse(saved);
            } else {
                this.unlockedLevels = [1];
            }
        } catch (e) {
            this.unlockedLevels = [1];
        }
    }
    
    saveUnlockedLevels() {
        try {
            localStorage.setItem('battle_tetris_unlocked_levels', JSON.stringify(this.unlockedLevels));
        } catch (e) {
            console.error('保存关卡解锁状态失败:', e);
        }
    }
    
    unlockNextLevel(currentLevel) {
        const nextLevel = currentLevel + 1;
        if (nextLevel <= 10 && !this.unlockedLevels.includes(nextLevel)) {
            this.unlockedLevels.push(nextLevel);
            this.unlockedLevels.sort((a, b) => a - b);
            this.saveUnlockedLevels();
        }
    }
    
    isLevelUnlocked(levelNumber) {
        return this.unlockedLevels.includes(levelNumber);
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
            unlockedUpgradesMenu: document.getElementById('unlockedUpgradesOverlay'),
            sacrificeMenu: document.getElementById('sacrificeOverlay'),
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
            
            shieldIndicator: document.getElementById('shieldIndicator'),
            shieldValue: document.getElementById('shieldValue'),
            doubleEffectIndicator: document.getElementById('doubleEffectIndicator'),
            turretOverloadIndicator: document.getElementById('turretOverloadIndicator'),
            overloadText: document.getElementById('overloadText'),
            
            waveNumber: document.getElementById('waveNumber'),
            waveState: document.getElementById('waveState'),
            
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
        document.getElementById('sacrificeBtn').addEventListener('click', () => this.showSacrificeMenu());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveGame());
        document.getElementById('loadBtn').addEventListener('click', () => this.loadGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        
        document.getElementById('newGameBtn').addEventListener('click', () => this.startNewGame());
        document.getElementById('levelModeBtn').addEventListener('click', () => this.showLevelSelectMenu());
        document.getElementById('loadGameBtn').addEventListener('click', () => this.loadGameFromMenu());
        document.getElementById('howToPlayBtn').addEventListener('click', () => this.showHowToPlay());
        
        document.getElementById('backToMainFromLevelBtn').addEventListener('click', () => {
            this.hideLevelSelectMenu();
            this.returnToMainMenu();
        });
        
        document.getElementById('retryLevelBtn').addEventListener('click', () => this.retryLevel());
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.goToNextLevel());
        document.getElementById('levelSelectBtn').addEventListener('click', () => this.returnToLevelSelect());
        
        document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
        document.getElementById('showUpgradesBtn').addEventListener('click', () => this.showUnlockedUpgrades());
        document.getElementById('closeUpgradesBtn').addEventListener('click', () => this.hideUnlockedUpgrades());
        document.getElementById('sacrificeFromPauseBtn').addEventListener('click', () => this.showSacrificeMenuFromPause());
        document.getElementById('cancelSacrifice').addEventListener('click', () => this.hideSacrificeMenu());
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
        
        document.getElementById('speedToggleBtn').addEventListener('click', () => this.toggleSpeedBoost());
        
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    handleKeyDown(e) {
        if (this.isInMainMenu || this.isInGameOverMenu) return;
        
        if (e.key === 'Escape') {
            if (this.isInUpgradeMenu) return;
            if (this.sacrificeMode) {
                this.hideSacrificeMenu();
                return;
            }
            this.togglePause();
            return;
        }
        
        if (e.key === 'q' || e.key === 'Q') {
            if (!this.gameOver && this.isStarted && !this.isPaused) {
                this.showSacrificeMenu();
            }
            return;
        }
        
        if (this.gameOver || this.isPaused || !this.isStarted || this.sacrificeMode) return;
        
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
        const availableColors = this.getAvailableColors();
        const color = Utils.randomChoice(availableColors);
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
    
    getAvailableColors() {
        if (this.defenseSystem && this.defenseSystem.isLevelMode && this.defenseSystem.availableColors) {
            return this.defenseSystem.availableColors;
        }
        return CONSTANTS.BLOCK_COLORS;
    }
    
    isSacrificeEnabled() {
        if (this.defenseSystem && this.defenseSystem.isLevelMode) {
            return this.defenseSystem.sacrificeEnabled;
        }
        return true;
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
        
        this.showSpeedControl();
    }
    
    showSpeedControl() {
        const speedControl = document.getElementById('speedControl');
        if (speedControl) {
            speedControl.classList.remove('hidden');
        }
    }
    
    hideSpeedControl() {
        const speedControl = document.getElementById('speedControl');
        if (speedControl) {
            speedControl.classList.add('hidden');
        }
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
        this.updateSpeedButtonDisplay(multiplier);
        this.hideSpeedBoostMenu();
        this.isPaused = false;
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    toggleSpeedBoost() {
        const currentSpeed = this.defenseSystem.speedMultiplier || 1.0;
        let newSpeed;
        
        if (currentSpeed === 1.0) {
            newSpeed = 1.5;
        } else if (currentSpeed === 1.5) {
            newSpeed = 2.0;
        } else {
            newSpeed = 1.0;
        }
        
        this.defenseSystem.speedMultiplier = newSpeed;
        this.updateSpeedButtonDisplay(newSpeed);
    }
    
    updateSpeedButtonDisplay(multiplier) {
        const btn = document.getElementById('speedToggleBtn');
        if (btn) {
            if (multiplier === 1.0) {
                btn.textContent = '1x';
            } else if (multiplier === 1.5) {
                btn.textContent = '1.5x';
            } else if (multiplier === 2.0) {
                btn.textContent = '2x';
            } else {
                btn.textContent = `${multiplier}x`;
            }
        }
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
        let effectMultiplier = 1;
        if (this.nextEffectDouble) {
            effectMultiplier = 2;
            this.nextEffectDouble = false;
        }
        
        const totalBlocksCleared = toClear.size * effectMultiplier;
        this.updateTetrisScore(totalBlocksCleared);
        
        this.checkSkillTriggers(clearedColors, effectMultiplier);
        
        clearedColors.forEach((count, color) => {
            const adjustedCount = count * effectMultiplier;
            const basePoints = adjustedCount * (5 + this.combo * 2);
            
            const upgrade = this.defenseSystem.addWeaponPoints(color, basePoints);
            
            if (upgrade && !this.isInUpgradeMenu) {
                this.showBuffUpgradeMenu(upgrade);
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
    
    checkSkillTriggers(clearedColors, effectMultiplier) {
        if (this.combo >= CONSTANTS.SKILLS.FULL_SCREEN_BOMB.comboRequirement) {
            this.triggerFullScreenBomb(effectMultiplier);
        }
        
        let maxSameColorCount = 0;
        clearedColors.forEach((count, color) => {
            if (count > maxSameColorCount) {
                maxSameColorCount = count;
            }
        });
        
        if (maxSameColorCount >= CONSTANTS.SKILLS.TURRET_OVERLOAD.sameColorRequirement) {
            this.triggerTurretOverload();
        }
        
        const greenCount = clearedColors.get('GREEN') || 0;
        if (greenCount >= CONSTANTS.SKILLS.EMERGENCY_REPAIR.greenRequirement) {
            this.triggerEmergencyRepair();
        }
        
        this.checkFactionClearEffects(clearedColors, effectMultiplier);
    }
    
    triggerFullScreenBomb(effectMultiplier) {
        const baseDamage = CONSTANTS.SKILLS.FULL_SCREEN_BOMB.baseDamage * effectMultiplier;
        
        this.defenseSystem.enemies.forEach(enemy => {
            enemy.takeDamage(baseDamage);
        });
        
        this.showSkillNotification('全屏轰炸！', CONSTANTS.SKILLS.FULL_SCREEN_BOMB.color);
    }
    
    triggerTurretOverload() {
        this.turretOverloadActive = true;
        this.turretOverloadEndTime = performance.now() + CONSTANTS.SKILLS.TURRET_OVERLOAD.duration;
        
        this.defenseSystem.turrets.forEach(turret => {
            if (!turret.originalAttackSpeed) {
                turret.originalAttackSpeed = turret.attackSpeed;
            }
            turret.attackSpeed = turret.originalAttackSpeed / CONSTANTS.SKILLS.TURRET_OVERLOAD.attackSpeedMultiplier;
        });
        
        this.showSkillNotification('炮塔超载！', CONSTANTS.SKILLS.TURRET_OVERLOAD.color);
    }
    
    triggerEmergencyRepair() {
        this.defenseSystem.wallHP = this.defenseSystem.maxWallHP;
        
        this.showSkillNotification('紧急修复！', CONSTANTS.SKILLS.EMERGENCY_REPAIR.color);
    }
    
    checkFactionClearEffects(clearedColors, effectMultiplier) {
        const upgradeSystem = this.defenseSystem.upgradeSystem;
        if (!upgradeSystem) return;
        
        clearedColors.forEach((count, color) => {
            const clearBonus = upgradeSystem.getColorClearBonus(color);
            if (!clearBonus || !clearBonus.enabled) return;
            
            switch (color) {
                case 'RED':
                    this.triggerRedClearEffect(clearBonus, count, effectMultiplier);
                    break;
                case 'YELLOW':
                    this.triggerYellowClearEffect(clearBonus, count, effectMultiplier);
                    break;
                case 'BLUE':
                    this.triggerBlueClearEffect(clearBonus, count, effectMultiplier);
                    break;
                case 'ORANGE':
                    this.triggerOrangeClearEffect(clearBonus, count, effectMultiplier);
                    break;
                case 'PURPLE':
                    this.triggerPurpleClearEffect(clearBonus, count, effectMultiplier);
                    break;
                case 'GREEN':
                    this.triggerGreenClearEffect(clearBonus, count, effectMultiplier);
                    break;
            }
        });
    }
    
    triggerRedClearEffect(clearBonus, count, effectMultiplier) {
        if (!clearBonus.extraDamage || clearBonus.extraDamage <= 0) return;
        
        const baseTurretDamage = 10;
        const extraDamage = baseTurretDamage * clearBonus.extraDamage * count * effectMultiplier;
        
        this.defenseSystem.enemies.forEach(enemy => {
            enemy.takeDamage(extraDamage);
        });
        
        if (this.defenseSystem.enemies.length > 0) {
            this.showSkillNotification('火焰爆发！', '#e94560');
        }
    }
    
    triggerYellowClearEffect(clearBonus, count, effectMultiplier) {
        if (!clearBonus.rangeBoost || clearBonus.rangeBoost <= 0) return;
        
        this.temporaryRangeBoost = clearBonus.rangeBoost * effectMultiplier;
        this.temporaryRangeBoostEndTime = performance.now() + 5000;
        
        this.defenseSystem.turrets.forEach(turret => {
            if (!turret.originalRange) {
                turret.originalRange = turret.range || turret.config.range;
            }
            turret.range = turret.originalRange * (1 + this.temporaryRangeBoost);
        });
        
        this.showSkillNotification('范围扩展！', '#f9ed69');
    }
    
    triggerBlueClearEffect(clearBonus, count, effectMultiplier) {
        if (!clearBonus.freezeOnClear) return;
        
        const freezeCount = Math.min(2 + Math.floor(count / 4), this.defenseSystem.enemies.length);
        if (freezeCount <= 0) return;
        
        const sortedEnemies = [...this.defenseSystem.enemies]
            .sort((a, b) => b.y - a.y);
        
        const frozenEnemies = sortedEnemies.slice(0, freezeCount);
        
        frozenEnemies.forEach(enemy => {
            const freezeDuration = 2000 * effectMultiplier;
            const slowPercent = 0.7;
            enemy.applyFreeze(freezeDuration, slowPercent);
        });
        
        this.showSkillNotification('冰冻冲击！', '#00d9ff');
    }
    
    triggerOrangeClearEffect(clearBonus, count, effectMultiplier) {
        if (!clearBonus.ignoreArmor) return;
        
        this.ignoreArmorAttacksRemaining = 3;
        
        this.defenseSystem.turrets.forEach(turret => {
            turret.ignoreArmorNextAttacks = 3;
        });
        
        this.showSkillNotification('穿甲准备！', '#ff8c00');
    }
    
    triggerPurpleClearEffect(clearBonus, count, effectMultiplier) {
        if (!clearBonus.blockOnClear) return;
        
        const averageEnemyY = this.defenseSystem.enemies.length > 0 
            ? this.defenseSystem.enemies.reduce((sum, e) => sum + e.y, 0) / this.defenseSystem.enemies.length
            : 300;
        
        const blockY = Math.max(100, Math.min(averageEnemyY + 50, 500));
        const lineWidth = this.defenseSystem.canvas.width;
        const lineDuration = 3000 * effectMultiplier;
        const lineDamage = 5;
        const blockCount = 3 + Math.floor(count / 4);
        
        const SpaceLineClass = typeof SpaceLine !== 'undefined' ? SpaceLine : null;
        if (SpaceLineClass && this.defenseSystem.spaceLines) {
            const spaceLine = new SpaceLineClass(
                blockY,
                lineWidth,
                lineDuration,
                lineDamage,
                0,
                blockCount
            );
            this.defenseSystem.spaceLines.push(spaceLine);
            this.showSkillNotification('空间阻拦！', '#a66cff');
        }
    }
    
    triggerGreenClearEffect(clearBonus, count, effectMultiplier) {
        if (!clearBonus.aoeDebuffOnClear) return;
        
        const centerX = this.defenseSystem.canvas.width / 2;
        const centerY = 300;
        const aoeRadius = 200;
        
        this.defenseSystem.enemies.forEach(enemy => {
            const dx = enemy.x - centerX;
            const dy = enemy.y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist <= aoeRadius) {
                const poisonDamage = 3 * effectMultiplier;
                const poisonDuration = 5000 * effectMultiplier;
                enemy.applyPoison(poisonDamage, poisonDuration);
                
                const slowDuration = 3000 * effectMultiplier;
                const slowPercent = 0.4;
                enemy.applyFreeze(slowDuration, slowPercent);
            }
        });
        
        if (this.defenseSystem.enemies.length > 0) {
            this.showSkillNotification('毒液扩散！', '#4ecca3');
        }
    }
    
    showSkillNotification(message, color) {
        const notification = document.createElement('div');
        notification.className = 'skill-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${color};
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 24px;
            font-weight: bold;
            z-index: 2000;
            box-shadow: 0 0 30px ${color};
            animation: skillPulse 1s ease-in-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 1500);
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
    
    getCurrentScore() {
        return this.defenseSystem.defenseScore + this.tetrisScore;
    }
    
    calculateFinalScore() {
        if (this.survivalTime < 1) {
            return 0;
        }
        
        const gameMinutes = Math.max(1, Math.floor(this.survivalTime / 60));
        const wallHPBonus = Math.max(0, this.defenseSystem.wallHP) * CONSTANTS.SCORING.WALL_HP_BONUS;
        const comboBonus = this.maxCombo * CONSTANTS.SCORING.COMBO_BONUS;
        const killBonus = this.defenseSystem.killCount * CONSTANTS.SCORING.KILL_BONUS;
        const levelBonus = this.level * CONSTANTS.SCORING.LEVEL_BONUS;
        
        this.totalScore = Math.floor(
            this.defenseSystem.defenseScore +
            this.tetrisScore * gameMinutes +
            wallHPBonus +
            comboBonus +
            killBonus +
            levelBonus
        );
        
        return this.totalScore;
    }
    
    getRating() {
        const score = this.calculateFinalScore();
        
        if (score >= CONSTANTS.RATINGS.S.minScore) return CONSTANTS.RATINGS.S;
        if (score >= CONSTANTS.RATINGS.A.minScore) return CONSTANTS.RATINGS.A;
        if (score >= CONSTANTS.RATINGS.B.minScore) return CONSTANTS.RATINGS.B;
        if (score >= CONSTANTS.RATINGS.C.minScore) return CONSTANTS.RATINGS.C;
        return CONSTANTS.RATINGS.D;
    }
    
    updateUI() {
        if (this.ui.tetrisScore) this.ui.tetrisScore.textContent = Utils.formatScore(this.tetrisScore);
        if (this.ui.defenseScore) this.ui.defenseScore.textContent = Utils.formatScore(this.defenseSystem.defenseScore);
        if (this.ui.totalScore) this.ui.totalScore.textContent = Utils.formatScore(this.getCurrentScore());
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
        
        this.updateStatusIndicators();
        
        this.updateWeaponProgressUI();
    }
    
    updateStatusIndicators() {
        if (this.ui.shieldIndicator) {
            if (this.defenseSystem.tempShield > 0) {
                this.ui.shieldIndicator.classList.remove('hidden');
                if (this.ui.shieldValue) {
                    this.ui.shieldValue.textContent = this.defenseSystem.tempShield;
                }
            } else {
                this.ui.shieldIndicator.classList.add('hidden');
            }
        }
        
        if (this.ui.doubleEffectIndicator) {
            if (this.nextEffectDouble) {
                this.ui.doubleEffectIndicator.classList.remove('hidden');
            } else {
                this.ui.doubleEffectIndicator.classList.add('hidden');
            }
        }
        
        if (this.ui.turretOverloadIndicator) {
            if (this.turretOverloadActive) {
                this.ui.turretOverloadIndicator.classList.remove('hidden');
                const remaining = Math.max(0, (this.turretOverloadEndTime - Date.now()) / 1000).toFixed(1);
                if (this.ui.overloadText) {
                    this.ui.overloadText.textContent = `炮塔超载 ${remaining}s`;
                }
            } else {
                this.ui.turretOverloadIndicator.classList.add('hidden');
            }
        }
        
        this.updateWaveDisplay();
    }
    
    updateWaveDisplay() {
        if (!this.ui.waveNumber || !this.ui.waveState) return;
        
        const wave = this.defenseSystem.currentWave || 1;
        const state = this.defenseSystem.waveState || 'inactive';
        
        this.ui.waveNumber.textContent = wave;
        
        let stateText = '准备中';
        let stateClass = '';
        
        if (state === 'starting' || state === 'active') {
            stateText = '进行中';
        } else if (state === 'gap') {
            stateText = '波次间隙';
            stateClass = 'gap';
        } else if (state === 'paused') {
            stateText = '暂停中';
            stateClass = 'paused';
        } else if (state === 'inactive') {
            stateText = '准备中';
        }
        
        this.ui.waveState.textContent = stateText;
        this.ui.waveState.className = `wave-state ${stateClass}`;
    }
    
    updateWeaponProgressUI() {
        const weaponTypes = ['FIRE', 'PIERCE', 'ICE', 'POISON', 'SPACE', 'SHOTGUN'];
        const threshold = this.defenseSystem.getCurrentUpgradeThreshold 
            ? this.defenseSystem.getCurrentUpgradeThreshold() 
            : CONSTANTS.UPGRADE_SYSTEM.SCORE_THRESHOLD;
        
        weaponTypes.forEach(type => {
            const isUnlocked = this.defenseSystem.weaponUnlockStates[type];
            const points = this.defenseSystem.weaponPoints[type];
            
            let progress = 0;
            let displayText = '';
            
            if (isUnlocked) {
                progress = 100;
                displayText = '已解锁';
            } else {
                progress = Math.min(100, (points / threshold) * 100);
                displayText = `${Math.floor(points)}/${threshold}`;
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
        
        this.checkTurretOverloadExpiry(timestamp);
        
        this.defenseSystem.update(timestamp);
        
        if (this.defenseSystem.isGameOver()) {
            if (this.isLevelMode) {
                this.levelFailed = true;
                this.endLevel(false);
            } else {
                this.endGame();
            }
            return;
        }
        
        if (this.isLevelMode && this.defenseSystem.isLevelComplete()) {
            this.levelComplete = true;
            this.endLevel(true);
            return;
        }
        
        this.updateUI();
        this.render();
        
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    endLevel(isVictory) {
        this.gameOver = true;
        this.stopDropTimer();
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (isVictory) {
            this.unlockNextLevel(this.currentLevelNumber);
            this.showLevelCompleteMenu();
        } else {
            this.showLevelFailedMenu();
        }
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('saveBtn').disabled = true;
    }
    
    calculateLevelScore() {
        const gameMinutes = Math.max(1, Math.floor(this.survivalTime / 60));
        const wallHPBonus = Math.max(0, this.defenseSystem.wallHP) * CONSTANTS.SCORING.WALL_HP_BONUS;
        const comboBonus = this.maxCombo * CONSTANTS.SCORING.COMBO_BONUS;
        const killBonus = this.defenseSystem.killCount * CONSTANTS.SCORING.KILL_BONUS;
        const levelBonus = this.level * CONSTANTS.SCORING.LEVEL_BONUS;
        
        const totalScore = Math.floor(
            this.defenseSystem.defenseScore +
            this.tetrisScore * gameMinutes +
            wallHPBonus +
            comboBonus +
            killBonus +
            levelBonus
        );
        
        return {
            tetrisScore: this.tetrisScore,
            defenseScore: this.defenseSystem.defenseScore,
            wallHPBonus: wallHPBonus,
            comboBonus: comboBonus,
            killBonus: killBonus,
            levelBonus: levelBonus,
            totalScore: totalScore,
            killCount: this.defenseSystem.killCount,
            maxCombo: this.maxCombo,
            survivalTime: this.survivalTime,
            level: this.level,
            currentLevel: this.currentLevelNumber
        };
    }
    
    showLevelCompleteMenu() {
        this.isInGameOverMenu = true;
        
        const scoreData = this.calculateLevelScore();
        const levelConfig = CONSTANTS.LEVELS[this.currentLevelNumber];
        
        document.getElementById('levelCompleteOverlay').classList.remove('hidden');
        
        document.getElementById('levelCompleteTitle').textContent = '关卡完成！';
        document.getElementById('levelCompleteName').textContent = levelConfig.name;
        
        document.getElementById('levelScoreTetris').textContent = Utils.formatScore(scoreData.tetrisScore);
        document.getElementById('levelScoreDefense').textContent = Utils.formatScore(scoreData.defenseScore);
        document.getElementById('levelScoreWallHP').textContent = `+${scoreData.wallHPBonus}`;
        document.getElementById('levelScoreCombo').textContent = `+${scoreData.comboBonus}`;
        document.getElementById('levelScoreKill').textContent = `+${scoreData.killBonus}`;
        document.getElementById('levelScoreLevel').textContent = `+${scoreData.levelBonus}`;
        document.getElementById('levelScoreTotal').textContent = Utils.formatScore(scoreData.totalScore);
        
        document.getElementById('levelStatsKills').textContent = scoreData.killCount;
        document.getElementById('levelStatsCombo').textContent = scoreData.maxCombo;
        const minutes = Math.floor(scoreData.survivalTime / 60);
        const seconds = Math.floor(scoreData.survivalTime % 60);
        document.getElementById('levelStatsTime').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (this.currentLevelNumber < 10) {
            document.getElementById('nextLevelBtn').classList.remove('hidden');
        } else {
            document.getElementById('nextLevelBtn').classList.add('hidden');
        }
    }
    
    showLevelFailedMenu() {
        this.isInGameOverMenu = true;
        
        const scoreData = this.calculateLevelScore();
        const levelConfig = CONSTANTS.LEVELS[this.currentLevelNumber];
        
        document.getElementById('levelCompleteOverlay').classList.remove('hidden');
        
        document.getElementById('levelCompleteTitle').textContent = '关卡失败';
        document.getElementById('levelCompleteName').textContent = levelConfig.name;
        
        document.getElementById('levelScoreTetris').textContent = Utils.formatScore(scoreData.tetrisScore);
        document.getElementById('levelScoreDefense').textContent = Utils.formatScore(scoreData.defenseScore);
        document.getElementById('levelScoreWallHP').textContent = `+${scoreData.wallHPBonus}`;
        document.getElementById('levelScoreCombo').textContent = `+${scoreData.comboBonus}`;
        document.getElementById('levelScoreKill').textContent = `+${scoreData.killBonus}`;
        document.getElementById('levelScoreLevel').textContent = `+${scoreData.levelBonus}`;
        document.getElementById('levelScoreTotal').textContent = Utils.formatScore(scoreData.totalScore);
        
        document.getElementById('levelStatsKills').textContent = scoreData.killCount;
        document.getElementById('levelStatsCombo').textContent = scoreData.maxCombo;
        const minutes = Math.floor(scoreData.survivalTime / 60);
        const seconds = Math.floor(scoreData.survivalTime % 60);
        document.getElementById('levelStatsTime').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('nextLevelBtn').classList.add('hidden');
    }
    
    hideLevelCompleteMenu() {
        document.getElementById('levelCompleteOverlay').classList.add('hidden');
    }
    
    retryLevel() {
        this.hideLevelCompleteMenu();
        this.startLevel(this.currentLevelNumber);
    }
    
    goToNextLevel() {
        this.hideLevelCompleteMenu();
        const nextLevel = this.currentLevelNumber + 1;
        if (nextLevel <= 10 && this.isLevelUnlocked(nextLevel)) {
            this.startLevel(nextLevel);
        } else {
            this.returnToLevelSelect();
        }
    }
    
    returnToLevelSelect() {
        this.hideLevelCompleteMenu();
        this.returnToMainMenu();
        setTimeout(() => {
            this.showLevelSelectMenu();
        }, 100);
    }
    
    checkTurretOverloadExpiry(currentTime) {
        if (this.turretOverloadActive && currentTime >= this.turretOverloadEndTime) {
            this.turretOverloadActive = false;
            
            this.defenseSystem.turrets.forEach(turret => {
                if (turret.originalAttackSpeed) {
                    turret.attackSpeed = turret.originalAttackSpeed;
                }
            });
        }
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
        this.isLevelMode = false;
        this.gameStartTime = Date.now();
        this.survivalTime = 0;
        this.lastFrameTime = performance.now();
        
        this.defenseSystem.reset();
        this.defenseSystem.start();
        
        this.hideSpeedControl();
        
        this.spawnNewPiece();
        this.startDropTimer();
        this.updateUI();
        
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('saveBtn').disabled = false;
    }
    
    startLevel(levelNumber) {
        if (!this.isLevelUnlocked(levelNumber)) {
            this.showSkillNotification('该关卡尚未解锁！', '#e94560');
            return;
        }
        
        this.initGameState();
        
        this.currentLevelNumber = levelNumber;
        this.levelComplete = false;
        this.levelFailed = false;
        
        this.isInMainMenu = false;
        this.isInLevelSelectMenu = false;
        this.isStarted = true;
        this.isLevelMode = true;
        this.gameStartTime = Date.now();
        this.survivalTime = 0;
        this.lastFrameTime = performance.now();
        
        this.defenseSystem.setLevel(levelNumber);
        this.defenseSystem.reset();
        this.defenseSystem.start();
        
        this.hideSpeedControl();
        
        this.spawnNewPiece();
        this.startDropTimer();
        this.updateUI();
        
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('saveBtn').disabled = false;
        
        this.showSkillNotification(CONSTANTS.LEVELS[levelNumber].name, '#4ecca3');
    }
    
    showLevelSelectMenu() {
        this.isInLevelSelectMenu = true;
        this.ui.mainMenu.classList.add('hidden');
        
        const levelSelectOverlay = document.getElementById('levelSelectOverlay');
        if (levelSelectOverlay) {
            levelSelectOverlay.classList.remove('hidden');
            this.renderLevelSelectMenu();
        }
    }
    
    hideLevelSelectMenu() {
        this.isInLevelSelectMenu = false;
        const levelSelectOverlay = document.getElementById('levelSelectOverlay');
        if (levelSelectOverlay) {
            levelSelectOverlay.classList.add('hidden');
        }
    }
    
    renderLevelSelectMenu() {
        const container = document.getElementById('levelSelectContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let level = 1; level <= 10; level++) {
            const levelConfig = CONSTANTS.LEVELS[level];
            const isUnlocked = this.isLevelUnlocked(level);
            
            const levelCard = document.createElement('div');
            levelCard.className = `level-card ${isUnlocked ? '' : 'locked'}`;
            levelCard.dataset.level = level;
            
            if (isUnlocked) {
                levelCard.addEventListener('click', () => {
                    this.hideLevelSelectMenu();
                    this.startLevel(level);
                });
            }
            
            const levelNum = document.createElement('div');
            levelNum.className = 'level-number';
            levelNum.textContent = level;
            
            const levelName = document.createElement('div');
            levelName.className = 'level-name';
            levelName.textContent = isUnlocked ? levelConfig.name : '???';
            
            const levelDesc = document.createElement('div');
            levelDesc.className = 'level-description';
            levelDesc.textContent = isUnlocked ? levelConfig.description : '完成前一关卡解锁';
            
            const levelInfo = document.createElement('div');
            levelInfo.className = 'level-info';
            
            if (isUnlocked) {
                const waveCount = document.createElement('span');
                waveCount.textContent = `波次: ${levelConfig.waves.length}`;
                levelInfo.appendChild(waveCount);
                
                const difficulty = document.createElement('span');
                difficulty.textContent = `难度: ${levelConfig.difficultyMultiplier}x`;
                levelInfo.appendChild(difficulty);
                
                if (levelConfig.sacrificeEnabled) {
                    const sacrifice = document.createElement('span');
                    sacrifice.className = 'sacrifice-enabled';
                    sacrifice.textContent = '献祭: 开启';
                    levelInfo.appendChild(sacrifice);
                }
            } else {
                const lockText = document.createElement('span');
                lockText.className = 'locked-text';
                lockText.textContent = '🔒 未解锁';
                levelInfo.appendChild(lockText);
            }
            
            levelCard.appendChild(levelNum);
            levelCard.appendChild(levelName);
            levelCard.appendChild(levelDesc);
            levelCard.appendChild(levelInfo);
            
            container.appendChild(levelCard);
        }
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
            this.lastFrameTime = performance.now();
            this.startDropTimer();
            this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
        }
        
        this.render();
    }
    
    resumeGame() {
        this.hidePauseMenu();
        this.isPaused = false;
        document.getElementById('pauseBtn').textContent = '暂停';
        this.lastFrameTime = performance.now();
        this.startDropTimer();
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    showPauseMenu() {
        this.ui.pauseMenu.classList.remove('hidden');
    }
    
    hidePauseMenu() {
        this.ui.pauseMenu.classList.add('hidden');
    }
    
    showUnlockedUpgrades() {
        this.ui.pauseMenu.classList.add('hidden');
        
        const turretsList = document.getElementById('unlockedTurretsList');
        const effectsList = document.getElementById('unlockedEffectsList');
        
        turretsList.innerHTML = '';
        effectsList.innerHTML = '';
        
        const weaponTypes = ['FIRE', 'PIERCE', 'ICE', 'POISON', 'SPACE', 'SHOTGUN'];
        let hasUnlockedTurrets = false;
        
        weaponTypes.forEach(type => {
            if (this.defenseSystem.weaponUnlockStates[type]) {
                hasUnlockedTurrets = true;
                const weaponName = CONSTANTS.WEAPON_NAMES[type];
                const weaponConfig = CONSTANTS.WEAPONS[type];
                const level = this.defenseSystem.weaponLevels[type];
                
                const turretItem = document.createElement('div');
                turretItem.className = 'unlocked-item turret-item';
                turretItem.innerHTML = `
                    <div class="item-icon" style="background: ${weaponConfig.color}; box-shadow: 0 0 10px ${weaponConfig.color}"></div>
                    <div class="item-info">
                        <div class="item-name">${weaponName}</div>
                        <div class="item-level">等级: ${level}</div>
                    </div>
                `;
                turretsList.appendChild(turretItem);
            }
        });
        
        if (!hasUnlockedTurrets) {
            turretsList.innerHTML = '<p class="no-upgrades">暂无已解锁炮塔</p>';
        }
        
        const selectedUpgrades = this.defenseSystem.getSelectedUpgrades();
        if (selectedUpgrades && selectedUpgrades.length > 0) {
            selectedUpgrades.forEach(upgrade => {
                const effectItem = document.createElement('div');
                effectItem.className = 'unlocked-item effect-item';
                effectItem.innerHTML = `
                    <div class="item-icon" style="background: ${upgrade.color}; box-shadow: 0 0 10px ${upgrade.color}"></div>
                    <div class="item-info">
                        <div class="item-name">${upgrade.name}</div>
                        <div class="item-desc">${upgrade.description}</div>
                    </div>
                `;
                effectsList.appendChild(effectItem);
            });
        } else {
            effectsList.innerHTML = '<p class="no-upgrades">暂无已解锁效果</p>';
        }
        
        this.ui.unlockedUpgradesMenu.classList.remove('hidden');
    }
    
    hideUnlockedUpgrades() {
        this.ui.unlockedUpgradesMenu.classList.add('hidden');
        this.ui.pauseMenu.classList.remove('hidden');
    }
    
    showSacrificeMenu() {
        if (!this.isSacrificeEnabled()) {
            this.showSkillNotification('方块献祭功能在第7关才开放！', '#e94560');
            return;
        }
        
        this.sacrificeMode = true;
        this.sacrificeFromPause = false;
        this.isPaused = true;
        this.stopDropTimer();
        
        this.showSacrificeMenuUI();
    }
    
    showSacrificeMenuFromPause() {
        if (!this.isSacrificeEnabled()) {
            this.showSkillNotification('方块献祭功能在第7关才开放！', '#e94560');
            return;
        }
        
        this.sacrificeMode = true;
        this.sacrificeFromPause = true;
        
        this.ui.pauseMenu.classList.add('hidden');
        
        this.showSacrificeMenuUI();
    }
    
    showSacrificeMenuUI() {
        const blockCount = this.countBlocksOnGrid();
        
        const countElement = document.getElementById('sacrificeBlockCount');
        if (countElement) {
            countElement.textContent = `当前场上方块数：${blockCount}`;
        }
        
        const container = document.getElementById('sacrificeOptionsContainer');
        if (container) {
            container.innerHTML = '';
            
            const sacrificeTypes = [
                {
                    key: 'REFRESH_BOARD',
                    config: CONSTANTS.SACRIFICE.REFRESH_BOARD,
                    canAfford: blockCount >= CONSTANTS.SACRIFICE.REFRESH_BOARD.blockCount
                },
                {
                    key: 'TEMP_SHIELD',
                    config: CONSTANTS.SACRIFICE.TEMP_SHIELD,
                    canAfford: blockCount >= CONSTANTS.SACRIFICE.TEMP_SHIELD.blockCount
                },
                {
                    key: 'DOUBLE_EFFECT',
                    config: CONSTANTS.SACRIFICE.DOUBLE_EFFECT,
                    canAfford: blockCount >= CONSTANTS.SACRIFICE.DOUBLE_EFFECT.blockCount
                }
            ];
            
            sacrificeTypes.forEach(type => {
                const card = document.createElement('div');
                card.className = `sacrifice-option-card ${type.canAfford ? '' : 'disabled'}`;
                card.style.borderColor = type.config.color;
                card.style.boxShadow = type.canAfford ? `0 0 20px ${type.config.color}40` : 'none';
                
                card.innerHTML = `
                    <div class="sacrifice-cost" style="color: ${type.config.color}">${type.config.blockCount} 方块</div>
                    <div class="sacrifice-name" style="color: ${type.config.color}">${type.config.name}</div>
                    <div class="sacrifice-description">${type.config.description}</div>
                `;
                
                if (type.canAfford) {
                    card.addEventListener('click', () => this.executeSacrifice(type.key, type.config.blockCount));
                }
                
                container.appendChild(card);
            });
        }
        
        this.ui.sacrificeMenu.classList.remove('hidden');
    }
    
    hideSacrificeMenu() {
        this.sacrificeMode = false;
        this.ui.sacrificeMenu.classList.add('hidden');
        
        if (this.sacrificeFromPause) {
            this.sacrificeFromPause = false;
            this.ui.pauseMenu.classList.remove('hidden');
        } else {
            if (this.isStarted && !this.gameOver && !this.tetrisEnded) {
                this.isPaused = false;
                document.getElementById('pauseBtn').textContent = '暂停';
                this.lastFrameTime = performance.now();
                this.startDropTimer();
                this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
            }
        }
    }
    
    countBlocksOnGrid() {
        let count = 0;
        for (let y = 0; y < CONSTANTS.GRID_HEIGHT; y++) {
            for (let x = 0; x < CONSTANTS.GRID_WIDTH; x++) {
                if (this.grid[y][x] !== null) {
                    count++;
                }
            }
        }
        return count;
    }
    
    executeSacrifice(sacrificeType, blockCount) {
        const blocksRemoved = this.removeRandomBlocks(blockCount);
        
        if (blocksRemoved < blockCount) {
            this.showSkillNotification('方块数量不足！', '#e94560');
            return;
        }
        
        switch (sacrificeType) {
            case 'REFRESH_BOARD':
                this.sacrificeRefreshBoard();
                break;
            case 'TEMP_SHIELD':
                this.sacrificeTempShield();
                break;
            case 'DOUBLE_EFFECT':
                this.sacrificeDoubleEffect();
                break;
        }
        
        this.hideSacrificeMenu();
        this.applyGravity();
        this.render();
    }
    
    removeRandomBlocks(count) {
        const blocks = [];
        
        for (let y = 0; y < CONSTANTS.GRID_HEIGHT; y++) {
            for (let x = 0; x < CONSTANTS.GRID_WIDTH; x++) {
                if (this.grid[y][x] !== null) {
                    blocks.push({x, y});
                }
            }
        }
        
        Utils.shuffleArray(blocks);
        
        const toRemove = blocks.slice(0, count);
        
        toRemove.forEach(pos => {
            this.grid[pos.y][pos.x] = null;
        });
        
        return toRemove.length;
    }
    
    sacrificeRefreshBoard() {
        const remainingBlocks = [];
        
        for (let y = 0; y < CONSTANTS.GRID_HEIGHT; y++) {
            for (let x = 0; x < CONSTANTS.GRID_WIDTH; x++) {
                if (this.grid[y][x] !== null) {
                    remainingBlocks.push({x, y, color: this.grid[y][x]});
                    this.grid[y][x] = null;
                }
            }
        }
        
        const colors = CONSTANTS.BLOCK_COLORS;
        
        for (let y = 0; y < CONSTANTS.GRID_HEIGHT; y++) {
            for (let x = 0; x < CONSTANTS.GRID_WIDTH; x++) {
                if (Math.random() < 0.3) {
                    this.grid[y][x] = Utils.randomChoice(colors);
                }
            }
        }
        
        this.applyGravity();
        
        this.showSkillNotification('布局已刷新！', CONSTANTS.SACRIFICE.REFRESH_BOARD.color);
    }
    
    sacrificeTempShield() {
        this.defenseSystem.tempShield += CONSTANTS.SACRIFICE.TEMP_SHIELD.shieldAmount;
        
        this.showSkillNotification(`获得 ${CONSTANTS.SACRIFICE.TEMP_SHIELD.shieldAmount} 点临时护盾！`, CONSTANTS.SACRIFICE.TEMP_SHIELD.color);
    }
    
    sacrificeDoubleEffect() {
        this.nextEffectDouble = true;
        
        this.showSkillNotification('下一次消除效果翻倍！', CONSTANTS.SACRIFICE.DOUBLE_EFFECT.color);
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
    
    getFactionClassFromId(factionId) {
        const factionMap = {
            'FIRE': 'faction-fire',
            'SHOTGUN': 'faction-lightning',
            'ICE': 'faction-ice',
            'PIERCE': 'faction-pierce',
            'SPACE': 'faction-space',
            'POISON': 'faction-poison',
            'GENERAL': 'faction-general'
        };
        return factionMap[factionId] || 'faction-general';
    }
    
    getFactionIconFromId(factionId) {
        const iconMap = {
            'FIRE': '🔥',
            'SHOTGUN': '⚡',
            'ICE': '❄️',
            'PIERCE': '🎯',
            'SPACE': '🌀',
            'POISON': '☠️',
            'GENERAL': '⭐'
        };
        return iconMap[factionId] || '⭐';
    }
    
    getFactionIconClassFromId(factionId) {
        const classMap = {
            'FIRE': 'fire',
            'SHOTGUN': 'lightning',
            'ICE': 'ice',
            'PIERCE': 'pierce',
            'SPACE': 'space',
            'POISON': 'poison',
            'GENERAL': 'general'
        };
        return classMap[factionId] || 'general';
    }
    
    showBuffUpgradeMenu(upgrade) {
        this.isInUpgradeMenu = true;
        this.isPaused = true;
        this.stopDropTimer();
        
        const container = document.getElementById('buffOptionsContainer');
        container.innerHTML = '';
        
        const subtitle = document.querySelector('#buffUpgradeOverlay .upgrade-subtitle');
        if (subtitle && upgrade.needsUnlock && upgrade.triggerWeaponType) {
            const weaponName = CONSTANTS.WEAPON_NAMES[upgrade.triggerWeaponType];
            subtitle.innerHTML = `选择升级效果，并获得新炮塔：<span style="color: ${CONSTANTS.WEAPONS[upgrade.triggerWeaponType].color}">${weaponName}</span>`;
        } else if (subtitle) {
            subtitle.innerHTML = '选择一项流派升级，强化你的战斗风格';
        }
        
        const options = upgrade.options;
        
        options.forEach((option, index) => {
            const card = document.createElement('div');
            
            const factionId = option.factionId || 'GENERAL';
            const factionClass = this.getFactionClassFromId(factionId);
            const factionIcon = this.getFactionIconFromId(factionId);
            const factionIconClass = this.getFactionIconClassFromId(factionId);
            
            card.className = `buff-option-card ${factionClass}`;
            
            const categoryLabel = option.factionName || 
                (option.category === 'general' ? '通用' : 
                (option.weaponType ? CONSTANTS.WEAPON_NAMES[option.weaponType] || '专属' : '专属'));
            
            const displayColor = option.color || '#4ecca3';
            
            card.innerHTML = `
                <div class="faction-icon ${factionIconClass}">${factionIcon}</div>
                <div class="buff-category">${categoryLabel}</div>
                <div class="buff-name">${option.name}</div>
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
        
        this.lastFrameTime = performance.now();
        
        this.updateWeaponProgressUI();
        
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
        const totalScore = this.calculateFinalScore();
        
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
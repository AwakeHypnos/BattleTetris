// ============================================
// 塔防系统 - 主模块
// ============================================

class DefenseSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.initCanvas();
        
        this.enemies = [];
        this.bullets = [];
        this.turrets = [];
        this.spaceLines = [];
        
        this.wallHP = CONSTANTS.WALL.maxHP;
        this.maxWallHP = CONSTANTS.WALL.maxHP;
        this.tempShield = 0;
        
        this.killCount = 0;
        this.defenseScore = 0;
        
        this.lastSpawnTime = 0;
        this.spawnInterval = CONSTANTS.ENEMY.baseSpawnInterval;
        
        this.difficultyMultiplier = 1;
        this.speedMultiplier = 1.0;
        this.gameStartTime = 0;
        
        this.bonuses = {
            damageBonus: 1,
            attackSpeedBonus: 1,
            rangeBonus: 1,
            bulletCountBonus: 1
        };
        
        this.weaponPoints = {
            FIRE: 0,
            PIERCE: 0,
            ICE: 0,
            POISON: 0,
            SPACE: 0,
            SHOTGUN: 0
        };
        
        this.weaponUnlockStates = {
            FIRE: true,
            PIERCE: false,
            ICE: false,
            POISON: false,
            SPACE: false,
            SHOTGUN: false
        };
        
        this.weaponLevels = {
            FIRE: 1,
            PIERCE: 0,
            ICE: 0,
            POISON: 0,
            SPACE: 0,
            SHOTGUN: 0
        };
        
        this.totalUpgradePoints = 0;
        
        this.upgradeSystem = new UpgradeSystem();
        
        this.pendingUpgrade = null;
        this.isUpgradePending = false;
        
        this.pendingUpgradeWeaponType = null;
        
        this.currentWave = 0;
        this.waveState = 'inactive';
        this.waveStartTime = 0;
        this.waveEnemyCount = 0;
        this.waveKilledCount = 0;
        
        this.isLevelMode = false;
        this.currentLevel = 1;
        this.levelConfig = null;
        this.levelComplete = false;
        this.levelFailed = false;
        
        this.levelWavesCompleted = 0;
        this.levelTotalWaves = 0;
        this.levelWaveSpawnCount = 0;
        this.levelWaveKilledCount = 0;
        
        this.availableColors = [...CONSTANTS.BLOCK_COLORS];
        this.availableWeapons = ['FIRE', 'PIERCE', 'ICE', 'POISON', 'SPACE', 'SHOTGUN'];
        this.availableEnemies = ['NORMAL', 'FAST', 'TANK', 'ELITE'];
        this.sacrificeEnabled = true;
        
        this.initialWeapon = 'FIRE';
        
        this.initTurrets();
    }
    
    initCanvas() {
        this.canvas.width = CONSTANTS.DEFENSE.CANVAS_WIDTH;
        this.canvas.height = CONSTANTS.DEFENSE.CANVAS_HEIGHT;
    }
    
    initTurrets() {
        this.turrets = [];
        
        const wallY = this.canvas.height - CONSTANTS.DEFENSE.WALL_HEIGHT / 2;
        const slotCount = CONSTANTS.DEFENSE.TURRET_SLOTS;
        const slotWidth = this.canvas.width / (slotCount + 1);
        
        const centerX = slotWidth * Math.floor(slotCount / 2 + 1);
        const initialWeapon = this.initialWeapon || 'FIRE';
        const turret = new Turret(centerX, wallY - 20, initialWeapon, 0);
        this.turrets.push(turret);
        
        this.availableSlots = [];
        for (let i = 0; i < slotCount; i++) {
            const x = slotWidth * (i + 1);
            if (Math.abs(x - centerX) > 10) {
                this.availableSlots.push({ x, index: this.availableSlots.length + 1 });
            }
        }
        this.availableSlots.sort((a, b) => Math.abs(a.x - centerX) - Math.abs(b.x - centerX));
        this.slotIndex = 0;
    }
    
    setLevel(levelNumber) {
        this.isLevelMode = true;
        this.currentLevel = levelNumber;
        this.levelConfig = CONSTANTS.LEVELS[levelNumber];
        
        if (!this.levelConfig) {
            this.isLevelMode = false;
            return;
        }
        
        this.availableColors = [...this.levelConfig.availableColors];
        this.availableWeapons = [...this.levelConfig.availableWeapons];
        this.availableEnemies = [...this.levelConfig.availableEnemies];
        this.sacrificeEnabled = this.levelConfig.sacrificeEnabled;
        this.difficultyMultiplier = this.levelConfig.difficultyMultiplier;
        this.initialWeapon = this.levelConfig.initialWeapon;
        
        this.levelTotalWaves = this.levelConfig.waves.length;
        this.levelWavesCompleted = 0;
        this.levelWaveSpawnCount = 0;
        this.levelWaveKilledCount = 0;
        this.levelComplete = false;
        this.levelFailed = false;
        
        this.currentWave = 0;
        this.waveState = 'inactive';
    }
    
    getLevelConfig() {
        return this.levelConfig;
    }
    
    isLevelComplete() {
        return this.levelComplete;
    }
    
    isLevelFailed() {
        return this.levelFailed;
    }
    
    getLevelProgress() {
        return {
            currentLevel: this.currentLevel,
            wavesCompleted: this.levelWavesCompleted,
            totalWaves: this.levelTotalWaves,
            currentWave: this.currentWave,
            waveState: this.waveState
        };
    }
    
    addTurretForWeapon(weaponType) {
        if (this.availableSlots.length === 0) return null;
        
        const wallY = this.canvas.height - CONSTANTS.DEFENSE.WALL_HEIGHT / 2;
        const slot = this.availableSlots.shift();
        
        const turret = new Turret(slot.x, wallY - 20, weaponType, slot.index);
        turret.level = 1;
        this.turrets.push(turret);
        
        return turret;
    }
    
    start() {
        this.gameStartTime = performance.now();
        this.lastSpawnTime = performance.now();
    }
    
    reset() {
        this.enemies = [];
        this.bullets = [];
        this.spaceLines = [];
        this.wallHP = CONSTANTS.WALL.maxHP;
        this.killCount = 0;
        this.defenseScore = 0;
        this.difficultyMultiplier = this.isLevelMode ? this.levelConfig.difficultyMultiplier : 1;
        this.speedMultiplier = 1.0;
        this.spawnInterval = CONSTANTS.ENEMY.baseSpawnInterval;
        this.lastSpawnTime = performance.now();
        this.gameStartTime = performance.now();
        
        this.weaponPoints = {
            FIRE: 0,
            PIERCE: 0,
            ICE: 0,
            POISON: 0,
            SPACE: 0,
            SHOTGUN: 0
        };
        
        this.weaponUnlockStates = this.initWeaponUnlockStates();
        
        this.weaponLevels = this.initWeaponLevels();
        
        this.totalUpgradePoints = 0;
        
        this.currentWave = 0;
        this.waveState = 'inactive';
        this.waveStartTime = 0;
        this.waveEnemyCount = 0;
        this.waveKilledCount = 0;
        
        this.levelWavesCompleted = 0;
        this.levelWaveSpawnCount = 0;
        this.levelWaveKilledCount = 0;
        this.levelComplete = false;
        this.levelFailed = false;
        
        this.upgradeSystem.reset();
        
        this.pendingUpgrade = null;
        this.isUpgradePending = false;
        this.pendingUpgradeWeaponType = null;
        
        this.initTurrets();
    }
    
    initWeaponUnlockStates() {
        const states = {
            FIRE: false,
            PIERCE: false,
            ICE: false,
            POISON: false,
            SPACE: false,
            SHOTGUN: false
        };
        
        if (this.isLevelMode && this.levelConfig) {
            const initialWeapon = this.levelConfig.initialWeapon || 'FIRE';
            states[initialWeapon] = true;
        } else {
            states.FIRE = true;
        }
        
        return states;
    }
    
    initWeaponLevels() {
        const levels = {
            FIRE: 0,
            PIERCE: 0,
            ICE: 0,
            POISON: 0,
            SPACE: 0,
            SHOTGUN: 0
        };
        
        if (this.isLevelMode && this.levelConfig) {
            const initialWeapon = this.levelConfig.initialWeapon || 'FIRE';
            levels[initialWeapon] = 1;
        } else {
            levels.FIRE = 1;
        }
        
        return levels;
    }
    
    setBonuses(bonuses) {
        this.bonuses = { ...this.bonuses, ...bonuses };
        this.turrets.forEach(turret => turret.setBonuses(this.bonuses));
    }
    
    getActiveWeaponTypes() {
        const types = new Set();
        this.turrets.forEach(turret => types.add(turret.weaponType));
        return Array.from(types);
    }
    
    addWeaponPoints(color, points) {
        const weaponType = CONSTANTS.WEAPON_COLOR_MAP[color];
        if (!weaponType) return null;
        
        const scoreMultiplier = this.upgradeSystem.getScoreMultiplier();
        const adjustedPoints = Math.floor(points * scoreMultiplier);
        
        this.weaponPoints[weaponType] += adjustedPoints;
        this.totalUpgradePoints += adjustedPoints;
        
        this.checkWeaponUnlock(weaponType);
        
        const elapsedMinutes = (performance.now() - this.gameStartTime) / 60000;
        const threshold = this.calculateUpgradeThreshold(Math.max(0, elapsedMinutes));
        
        if (this.totalUpgradePoints >= threshold && !this.isUpgradePending) {
            this.totalUpgradePoints -= threshold;
            
            const activeWeaponTypes = this.getActiveWeaponTypes();
            const upgradeOptions = this.upgradeSystem.generateUpgradeOptions(activeWeaponTypes);
            
            if (upgradeOptions.length > 0) {
                this.pendingUpgrade = {
                    options: upgradeOptions,
                    triggerWeaponType: weaponType,
                    needsUnlock: false
                };
                this.pendingUpgradeWeaponType = weaponType;
                this.isUpgradePending = true;
                return this.pendingUpgrade;
            }
        }
        
        return null;
    }
    
    checkWeaponUnlock(weaponType) {
        if (this.weaponUnlockStates[weaponType]) return;
        
        if (this.isLevelMode && this.levelConfig) {
            if (!this.levelConfig.availableWeapons.includes(weaponType)) {
                return;
            }
        }
        
        const elapsedMinutes = (performance.now() - this.gameStartTime) / 60000;
        const threshold = this.calculateUpgradeThreshold(Math.max(0, elapsedMinutes));
        
        if (this.weaponPoints[weaponType] >= threshold) {
            this.weaponPoints[weaponType] -= threshold;
            
            const existingTurret = this.turrets.find(t => t.weaponType === weaponType);
            if (!existingTurret) {
                this.addTurretForWeapon(weaponType);
                this.weaponUnlockStates[weaponType] = true;
                this.weaponLevels[weaponType] = 1;
            }
        }
    }
    
    getCurrentUpgradeThreshold() {
        const elapsedMinutes = (performance.now() - this.gameStartTime) / 60000;
        return this.calculateUpgradeThreshold(Math.max(0, elapsedMinutes));
    }
    
    getSelectedUpgrades() {
        return this.upgradeSystem ? this.upgradeSystem.getSelectedUpgrades() : [];
    }
    
    selectUpgrade(optionIndex) {
        if (!this.pendingUpgrade || !this.pendingUpgrade.options) return false;
        
        const selectedOption = this.pendingUpgrade.options[optionIndex];
        if (!selectedOption) return false;
        
        const triggerWeaponType = this.pendingUpgrade.triggerWeaponType;
        const needsUnlock = this.pendingUpgrade.needsUnlock;
        
        if (needsUnlock && triggerWeaponType && triggerWeaponType !== 'FIRE') {
            const existingTurret = this.turrets.find(t => t.weaponType === triggerWeaponType);
            if (!existingTurret) {
                this.addTurretForWeapon(triggerWeaponType);
                this.weaponUnlockStates[triggerWeaponType] = true;
                this.weaponLevels[triggerWeaponType] = 1;
            }
        }
        
        this.upgradeSystem.selectUpgrade(selectedOption, this.turrets);
        
        this.pendingUpgrade = null;
        this.pendingUpgradeWeaponType = null;
        this.isUpgradePending = false;
        
        return true;
    }
    
    confirmWeaponUnlock() {
        return false;
    }
    
    confirmUpgrade() {
        return false;
    }
    
    deferUpgrade() {
        this.isUpgradePending = false;
        this.pendingUpgrade = null;
        this.pendingUpgradeWeaponType = null;
    }
    
    deferWeaponUnlock() {
        this.isUpgradePending = false;
        this.pendingUpgrade = null;
        this.pendingUpgradeWeaponType = null;
    }
    
    calculateDifficulty(elapsedSeconds) {
        const config = CONSTANTS.ENEMY_DIFFICULTY;
        const accelerationTime = config.accelerationStartTime;
        
        let hpMultiplier = 1;
        let speedMultiplier = 1;
        
        if (elapsedSeconds <= accelerationTime) {
            const periods = Math.floor(elapsedSeconds / 30);
            hpMultiplier = 1 + periods * (config.baseHpIncreasePer30Seconds / 100);
            
            const minutes = elapsedSeconds / 60;
            speedMultiplier = 1 + minutes * config.baseSpeedIncreasePerMinute;
        } else {
            const basePeriods = Math.floor(accelerationTime / 30);
            const acceleratedSeconds = elapsedSeconds - accelerationTime;
            const acceleratedPeriods = Math.floor(acceleratedSeconds / 30);
            
            const baseHp = basePeriods * (config.baseHpIncreasePer30Seconds / 100);
            const acceleratedHp = acceleratedPeriods * (config.acceleratedHpIncreasePer30Seconds / 100);
            hpMultiplier = 1 + baseHp + acceleratedHp;
            
            hpMultiplier = 1 + (hpMultiplier - 1) * (config.acceleratedHpMultiplierAfter60Seconds || 2.5);
            
            const baseMinutes = accelerationTime / 60;
            const acceleratedMinutes = acceleratedSeconds / 60;
            const baseSpeed = baseMinutes * config.baseSpeedIncreasePerMinute;
            const acceleratedSpeed = acceleratedMinutes * config.acceleratedSpeedIncreasePerMinute;
            speedMultiplier = 1 + baseSpeed + acceleratedSpeed;
        }
        
        return {
            hpMultiplier: hpMultiplier,
            speedMultiplier: speedMultiplier
        };
    }
    
    calculateEnemyDefense(elapsedMinutes) {
        const defense = Math.exp(elapsedMinutes) - 1;
        return Math.min(defense, 90);
    }
    
    calculateUpgradeThreshold(elapsedMinutes) {
        const baseThreshold = CONSTANTS.UPGRADE_SYSTEM.SCORE_THRESHOLD;
        const timeMultiplier = Math.pow(1.5, elapsedMinutes);
        return Math.floor(baseThreshold * Math.min(timeMultiplier, 10));
    }
    
    spawnEnemy(count = 1, difficultyMultiplier = 1) {
        const maxSpawnPerBatch = CONSTANTS.ENEMY_SPAWN.maxSpawnPerBatch || 20;
        const maxEnemiesOnScreen = CONSTANTS.ENEMY_SPAWN.maxEnemiesOnScreen || 200;
        
        const currentEnemyCount = this.enemies.length;
        const availableSlots = maxEnemiesOnScreen - currentEnemyCount;
        
        if (availableSlots <= 0) return;
        
        const actualCount = Math.min(count, maxSpawnPerBatch, availableSlots);
        
        const types = this.getEnemyTypesForCurrentTime();
        
        const elapsedMinutes = (performance.now() - this.gameStartTime) / 60000;
        let baseDefense = this.calculateEnemyDefense(elapsedMinutes);
        let baseDifficulty = difficultyMultiplier;
        
        const criticalCount = CONSTANTS.ENEMY_SPAWN.criticalEnemyCount || 100;
        if (currentEnemyCount >= criticalCount) {
            const excessCount = currentEnemyCount - criticalCount;
            const hpMultiplier = Math.pow(
                CONSTANTS.ENEMY_SPAWN.criticalHpMultiplier || 1.5,
                Math.floor(excessCount / 10) + 1
            );
            const defenseMultiplier = Math.pow(
                CONSTANTS.ENEMY_SPAWN.criticalDefenseMultiplier || 2.0,
                Math.floor(excessCount / 10) + 1
            );
            
            baseDifficulty *= hpMultiplier;
            baseDefense = Math.min(90, baseDefense * defenseMultiplier);
        }
        
        for (let i = 0; i < actualCount; i++) {
            const type = Utils.randomChoice(types);
            const x = Utils.randomInt(30, this.canvas.width - 30);
            const y = -40 - Math.random() * 60;
            
            const enemy = new Enemy(x, y, type, baseDifficulty, baseDefense);
            this.enemies.push(enemy);
        }
    }
    
    getEnemyTypesForCurrentTime() {
        const elapsedSeconds = (performance.now() - this.gameStartTime) / 1000;
        
        if (elapsedSeconds <= 30) {
            return ['NORMAL'];
        } else if (elapsedSeconds <= 45) {
            return ['FAST'];
        } else if (elapsedSeconds <= 60) {
            return ['TANK'];
        } else if (elapsedSeconds <= 75) {
            return ['ELITE'];
        } else if (elapsedSeconds <= 80) {
            return [];
        } else {
            return ['NORMAL', 'NORMAL', 'NORMAL', 'FAST', 'TANK', 'ELITE'];
        }
    }
    
    shouldSpawnEnemies() {
        const elapsedSeconds = (performance.now() - this.gameStartTime) / 1000;
        return elapsedSeconds > 80 || elapsedSeconds <= 75;
    }
    
    isEnemyGrowthEnabled() {
        const elapsedSeconds = (performance.now() - this.gameStartTime) / 1000;
        return elapsedSeconds > 80;
    }
    
    spawnWave(waveNumber, difficultyMultiplier) {
        if (!this.shouldSpawnEnemies()) return;
        
        const baseCount = CONSTANTS.ENEMY_SPAWN.waveBaseCount;
        const increment = CONSTANTS.ENEMY_SPAWN.waveIncrementCount;
        const count = baseCount + (waveNumber - 1) * increment;
        
        this.spawnEnemy(count, difficultyMultiplier);
    }
    
    getWaveConfig(waveNumber, elapsedSeconds) {
        if (waveNumber === 1) {
            return {
                type: 'NORMAL',
                count: CONSTANTS.ENEMY_SPAWN.wave1Count,
                duration: 30,
                startSecond: 0
            };
        } else if (waveNumber === 2) {
            return {
                type: 'FAST',
                count: CONSTANTS.ENEMY_SPAWN.wave2Count,
                duration: 15,
                startSecond: 30
            };
        } else if (waveNumber === 3) {
            return {
                type: 'TANK',
                count: CONSTANTS.ENEMY_SPAWN.wave3Count,
                duration: 15,
                startSecond: 45
            };
        } else if (waveNumber === 4) {
            return {
                type: 'ELITE',
                count: CONSTANTS.ENEMY_SPAWN.wave4Count,
                duration: 15,
                startSecond: 60
            };
        } else if (waveNumber >= 5) {
            const wave5Offset = waveNumber - 5;
            return {
                type: 'MIXED',
                count: CONSTANTS.ENEMY_SPAWN.wave5BaseCount + wave5Offset * CONSTANTS.ENEMY_SPAWN.wave5IncrementPerWave,
                duration: null,
                startSecond: 80 + wave5Offset * 30,
                gapSeconds: CONSTANTS.ENEMY_SPAWN.waveGapSeconds
            };
        }
        return null;
    }
    
    getWaveTypes(waveNumber) {
        if (waveNumber === 1) return ['NORMAL'];
        if (waveNumber === 2) return ['FAST'];
        if (waveNumber === 3) return ['TANK'];
        if (waveNumber === 4) return ['ELITE'];
        if (waveNumber >= 5) return ['NORMAL', 'NORMAL', 'FAST', 'TANK', 'ELITE'];
        return ['NORMAL'];
    }
    
    spawnWaveEnemies(waveNumber, count, difficultyMultiplier) {
        const maxSpawnPerBatch = CONSTANTS.ENEMY_SPAWN.maxSpawnPerBatch || 20;
        const maxEnemiesOnScreen = CONSTANTS.ENEMY_SPAWN.maxEnemiesOnScreen || 200;
        
        const currentEnemyCount = this.enemies.length;
        const availableSlots = maxEnemiesOnScreen - currentEnemyCount;
        
        if (availableSlots <= 0) return 0;
        
        const actualCount = Math.min(count, maxSpawnPerBatch, availableSlots);
        const types = this.getWaveTypes(waveNumber);
        
        const elapsedMinutes = (performance.now() - this.gameStartTime) / 60000;
        let baseDefense = this.calculateEnemyDefense(elapsedMinutes);
        let baseDifficulty = difficultyMultiplier;
        
        const criticalCount = CONSTANTS.ENEMY_SPAWN.criticalEnemyCount || 100;
        if (currentEnemyCount >= criticalCount) {
            const excessCount = currentEnemyCount - criticalCount;
            const hpMultiplier = Math.pow(
                CONSTANTS.ENEMY_SPAWN.criticalHpMultiplier || 1.5,
                Math.floor(excessCount / 10) + 1
            );
            const defenseMultiplier = Math.pow(
                CONSTANTS.ENEMY_SPAWN.criticalDefenseMultiplier || 2.0,
                Math.floor(excessCount / 10) + 1
            );
            
            baseDifficulty *= hpMultiplier;
            baseDefense = Math.min(90, baseDefense * defenseMultiplier);
        }
        
        for (let i = 0; i < actualCount; i++) {
            const type = Utils.randomChoice(types);
            const x = Utils.randomInt(30, this.canvas.width - 30);
            const y = -40 - Math.random() * 60 - i * 20;
            
            const enemy = new Enemy(x, y, type, baseDifficulty, baseDefense);
            this.enemies.push(enemy);
        }
        
        return actualCount;
    }
    
    updateWaveSystem(elapsedSeconds, currentTime, difficulty) {
        if (elapsedSeconds < 0) return;
        
        if (this.isLevelMode && this.levelConfig) {
            this.updateLevelWaveSystem(elapsedSeconds, currentTime, difficulty);
        } else {
            this.updateEndlessWaveSystem(elapsedSeconds, currentTime, difficulty);
        }
    }
    
    updateEndlessWaveSystem(elapsedSeconds, currentTime, difficulty) {
        if (this.currentWave === 0 && this.waveState === 'inactive') {
            this.currentWave = 1;
            this.waveState = 'starting';
            this.waveStartTime = elapsedSeconds;
            this.waveKilledCount = 0;
            this.waveEnemyCount = 0;
        }
        
        if (elapsedSeconds >= 75 && elapsedSeconds < 80) {
            if (this.currentWave >= 5 && this.waveState === 'inactive') {
                this.waveState = 'paused';
                return;
            }
        }
        
        const config = this.getWaveConfig(this.currentWave, elapsedSeconds);
        if (!config) return;
        
        if (this.currentWave <= 4) {
            if (elapsedSeconds >= config.startSecond && this.waveState === 'inactive') {
                this.currentWave = this.currentWave <= 4 ? this.currentWave : 1;
                this.waveState = 'starting';
                this.waveStartTime = elapsedSeconds;
                this.waveKilledCount = 0;
                this.waveEnemyCount = 0;
            }
            
            if (this.waveState === 'starting') {
                const spawned = this.spawnWaveEnemies(this.currentWave, config.count, difficulty.hpMultiplier);
                this.waveEnemyCount += spawned;
                this.waveState = 'active';
            }
            
            if (this.waveState === 'active') {
                const waveElapsed = elapsedSeconds - this.waveStartTime;
                if (waveElapsed >= config.duration || (this.enemies.length === 0 && waveElapsed >= 5)) {
                    this.waveState = 'inactive';
                    if (this.currentWave <= 4) {
                        this.currentWave++;
                    }
                }
            }
        } else {
            if (this.waveState === 'inactive' || this.waveState === 'paused') {
                this.waveState = 'starting';
                this.waveStartTime = elapsedSeconds;
                this.waveKilledCount = 0;
                this.waveEnemyCount = 0;
            }
            
            if (this.waveState === 'starting') {
                const spawned = this.spawnWaveEnemies(this.currentWave, config.count, difficulty.hpMultiplier);
                this.waveEnemyCount += spawned;
                this.waveState = 'active';
            }
            
            if (this.waveState === 'active') {
                if (this.enemies.length === 0 && this.waveEnemyCount > 0) {
                    this.waveState = 'gap';
                    this.waveStartTime = elapsedSeconds;
                }
            }
            
            if (this.waveState === 'gap') {
                const gapElapsed = elapsedSeconds - this.waveStartTime;
                if (gapElapsed >= config.gapSeconds) {
                    this.currentWave++;
                    this.waveState = 'starting';
                    this.waveStartTime = elapsedSeconds;
                    this.waveKilledCount = 0;
                    this.waveEnemyCount = 0;
                }
            }
        }
    }
    
    updateLevelWaveSystem(elapsedSeconds, currentTime, difficulty) {
        if (this.levelComplete || this.levelFailed) return;
        
        const waves = this.levelConfig.waves;
        const totalWaves = waves.length;
        
        if (this.levelWavesCompleted >= totalWaves) {
            if (this.enemies.length === 0) {
                this.levelComplete = true;
            }
            return;
        }
        
        if (this.currentWave === 0 && this.waveState === 'inactive') {
            this.currentWave = 1;
            this.waveState = 'starting';
            this.waveStartTime = elapsedSeconds;
            this.waveKilledCount = 0;
            this.waveEnemyCount = 0;
        }
        
        const waveIndex = this.currentWave - 1;
        const waveConfig = waves[waveIndex];
        
        if (!waveConfig) return;
        
        if (this.waveState === 'inactive' && this.levelWavesCompleted < totalWaves) {
            this.waveState = 'starting';
            this.waveStartTime = elapsedSeconds;
            this.waveKilledCount = 0;
            this.waveEnemyCount = 0;
        }
        
        if (this.waveState === 'starting') {
            const spawned = this.spawnLevelWaveEnemies(waveConfig, difficulty.hpMultiplier);
            this.levelWaveSpawnCount += spawned;
            this.waveEnemyCount += spawned;
            this.waveState = 'active';
        }
        
        if (this.waveState === 'active') {
            const waveElapsed = elapsedSeconds - this.waveStartTime;
            
            if (waveElapsed >= waveConfig.duration) {
                this.waveState = 'gap';
                this.waveStartTime = elapsedSeconds;
                this.levelWavesCompleted++;
            } else if (this.enemies.length === 0 && this.waveEnemyCount > 0 && waveElapsed >= 5) {
                this.waveState = 'gap';
                this.waveStartTime = elapsedSeconds;
                this.levelWavesCompleted++;
            }
        }
        
        if (this.waveState === 'gap') {
            const gapElapsed = elapsedSeconds - this.waveStartTime;
            const gapSeconds = 5;
            
            if (gapElapsed >= gapSeconds) {
                if (this.levelWavesCompleted >= totalWaves) {
                    this.waveState = 'inactive';
                } else {
                    this.currentWave++;
                    this.waveState = 'starting';
                    this.waveStartTime = elapsedSeconds;
                    this.waveKilledCount = 0;
                    this.waveEnemyCount = 0;
                }
            }
        }
    }
    
    spawnLevelWaveEnemies(waveConfig, baseDifficulty) {
        const maxSpawnPerBatch = CONSTANTS.ENEMY_SPAWN.maxSpawnPerBatch || 20;
        const maxEnemiesOnScreen = CONSTANTS.ENEMY_SPAWN.maxEnemiesOnScreen || 200;
        
        const currentEnemyCount = this.enemies.length;
        const availableSlots = maxEnemiesOnScreen - currentEnemyCount;
        
        if (availableSlots <= 0) return 0;
        
        const actualCount = Math.min(waveConfig.count, maxSpawnPerBatch, availableSlots);
        const types = waveConfig.types;
        
        const elapsedMinutes = (performance.now() - this.gameStartTime) / 60000;
        let baseDefense = this.calculateEnemyDefense(elapsedMinutes);
        let difficulty = baseDifficulty;
        
        const criticalCount = CONSTANTS.ENEMY_SPAWN.criticalEnemyCount || 100;
        if (currentEnemyCount >= criticalCount) {
            const excessCount = currentEnemyCount - criticalCount;
            const hpMultiplier = Math.pow(
                CONSTANTS.ENEMY_SPAWN.criticalHpMultiplier || 1.5,
                Math.floor(excessCount / 10) + 1
            );
            const defenseMultiplier = Math.pow(
                CONSTANTS.ENEMY_SPAWN.criticalDefenseMultiplier || 2.0,
                Math.floor(excessCount / 10) + 1
            );
            
            difficulty *= hpMultiplier;
            baseDefense = Math.min(90, baseDefense * defenseMultiplier);
        }
        
        for (let i = 0; i < actualCount; i++) {
            const type = Utils.randomChoice(types);
            const x = Utils.randomInt(30, this.canvas.width - 30);
            const y = -40 - Math.random() * 60 - i * 20;
            
            const enemy = new Enemy(x, y, type, difficulty, baseDefense);
            this.enemies.push(enemy);
        }
        
        return actualCount;
    }
    
    getLevelWaveInfo() {
        if (!this.isLevelMode || !this.levelConfig) {
            return null;
        }
        
        return {
            level: this.currentLevel,
            levelName: this.levelConfig.name,
            currentWave: this.currentWave,
            totalWaves: this.levelConfig.waves.length,
            wavesCompleted: this.levelWavesCompleted,
            waveState: this.waveState,
            isComplete: this.levelComplete,
            isFailed: this.levelFailed
        };
    }
    
    update(currentTime) {
        const elapsedSeconds = (currentTime - this.gameStartTime) / 1000;
        const elapsedMinutes = elapsedSeconds / 60;
        
        let difficulty;
        if (this.isEnemyGrowthEnabled()) {
            difficulty = this.calculateDifficulty(elapsedSeconds);
        } else {
            difficulty = { hpMultiplier: 1, speedMultiplier: 1 };
        }
        this.difficultyMultiplier = difficulty.hpMultiplier;
        
        this.updateWaveSystem(elapsedSeconds, currentTime, difficulty);
        
        this.enemies.forEach(enemy => {
            let speedMod = difficulty.speedMultiplier;
            enemy.update(currentTime, this.speedMultiplier * speedMod);
        });
        
        const wallY = this.canvas.height - CONSTANTS.DEFENSE.WALL_HEIGHT;
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.y >= wallY) {
                const damage = enemy.damageToWall;
                if (this.tempShield > 0) {
                    const shieldDamage = Math.min(this.tempShield, damage);
                    this.tempShield -= shieldDamage;
                    if (damage > shieldDamage) {
                        this.wallHP -= (damage - shieldDamage);
                    }
                } else {
                    this.wallHP -= damage;
                }
                return false;
            }
            if (enemy.currentHP <= 0) {
                if (enemy.isPoisoned && enemy.poisonSpreadEnabled) {
                    this.spreadPoisonOnDeath(enemy);
                }
                
                this.killCount++;
                this.waveKilledCount++;
                
                const baseKillScore = CONSTANTS.ENEMY.scorePerKill + 
                    Math.floor(enemy.maxHP * CONSTANTS.ENEMY.scorePerHP);
                const scoreMultiplier = this.upgradeSystem.getScoreMultiplier();
                this.defenseScore += Math.floor(baseKillScore * scoreMultiplier);
                
                return false;
            }
            return true;
        });
        
        this.turrets.forEach(turret => {
            let effectiveAttackSpeed = turret.getEffectiveAttackSpeed();
            effectiveAttackSpeed = this.upgradeSystem.getEffectiveAttackSpeed(effectiveAttackSpeed);
            effectiveAttackSpeed = effectiveAttackSpeed / this.speedMultiplier;
            
            if (currentTime - turret.lastAttackTime >= effectiveAttackSpeed) {
                const target = turret.findTarget(this.enemies);
                if (target) {
                    turret.lastAttackTime = currentTime;
                    turret.target = target;
                    const targetAngle = Math.atan2(target.y - turret.y, target.x - turret.x);
                    turret.angle = targetAngle;
                    
                    const distanceToTarget = Math.sqrt(
                        Math.pow(target.x - turret.x, 2) + 
                        Math.pow(target.y - turret.y, 2)
                    );
                    
                    let isOvercharge = false;
                    if (this.upgradeSystem.shouldApplyOvercharge()) {
                        isOvercharge = true;
                        this.upgradeSystem.resetOvercharge();
                    }
                    this.upgradeSystem.incrementAttackCount();
                    
                    let newBullets = [];
                    
                    if (turret.weaponType === 'SHOTGUN') {
                        let bulletCount = turret.config.bulletCount;
                        let spreadAngle = turret.config.spreadAngle;
                        
                        if (turret.specialBonuses) {
                            bulletCount += turret.specialBonuses.extraBulletCount || 0;
                            spreadAngle += turret.specialBonuses.extraSpreadAngle || 0;
                        }
                        
                        bulletCount = Math.floor(bulletCount * turret.bonuses.bulletCountBonus);
                        const spreadRad = (spreadAngle * Math.PI) / 180;
                        
                        for (let i = 0; i < bulletCount; i++) {
                            const offset = (i - (bulletCount - 1) / 2);
                            const bulletAngle = targetAngle + offset * (spreadRad / (bulletCount - 1));
                            
                            const bulletTargetX = turret.x + Math.cos(bulletAngle) * 500;
                            const bulletTargetY = turret.y + Math.sin(bulletAngle) * 500;
                            
                            let baseDamage = turret.getEffectiveDamage();
                            baseDamage = this.upgradeSystem.getEffectiveDamage(
                                baseDamage, target, distanceToTarget, turret
                            );
                            if (isOvercharge) baseDamage *= 2;
                            
                            const bullet = new Bullet(
                                turret.x, turret.y,
                                bulletTargetX, bulletTargetY,
                                turret.weaponType,
                                baseDamage,
                                turret.bonuses
                            );
                            
                            if (turret.specialBonuses) {
                                bullet.specialBonuses = { ...turret.specialBonuses };
                            }
                            bullet.isOvercharge = isOvercharge;
                            bullet.sourceTurret = turret;
                            
                            newBullets.push(bullet);
                        }
                    } else {
                        let baseDamage = turret.getEffectiveDamage();
                        baseDamage = this.upgradeSystem.getEffectiveDamage(
                            baseDamage, target, distanceToTarget, turret
                        );
                        if (isOvercharge) baseDamage *= 2;
                        
                        const bullet = new Bullet(
                            turret.x, turret.y,
                            target.x, target.y,
                            turret.weaponType,
                            baseDamage,
                            turret.bonuses
                        );
                        
                        if (turret.specialBonuses) {
                            bullet.specialBonuses = { ...turret.specialBonuses };
                        }
                        bullet.isOvercharge = isOvercharge;
                        bullet.sourceTurret = turret;
                        
                        newBullets.push(bullet);
                    }
                    
                    this.bullets.push(...newBullets);
                }
            }
        });
        
        this.bullets.forEach(bullet => bullet.update(this.speedMultiplier));
        
        this.bullets.forEach(bullet => {
            if (!bullet.isActive) return;
            
            this.enemies.forEach(enemy => {
                if (bullet.canHit(enemy)) {
                    let finalDamage = bullet.damage;
                    
                    const armorReduction = this.upgradeSystem.applyArmorReduction(enemy);
                    finalDamage += armorReduction;
                    
                    let killed = enemy.takeDamage(finalDamage);
                    
                    this.upgradeSystem.applyKnockback(enemy);
                    
                    if (bullet.hasFreezeEffect) {
                        let freezeDuration = bullet.freezeDuration;
                        let slowPercent = bullet.slowPercent;
                        
                        if (bullet.specialBonuses) {
                            if (bullet.specialBonuses.freezeDurationMultiplier) {
                                freezeDuration *= bullet.specialBonuses.freezeDurationMultiplier;
                            }
                            if (bullet.specialBonuses.slowPercentBonus) {
                                slowPercent = Math.min(0.95, slowPercent + bullet.specialBonuses.slowPercentBonus);
                            }
                        }
                        
                        freezeDuration = this.upgradeSystem.getEffectiveDuration(freezeDuration);
                        enemy.applyFreeze(freezeDuration, slowPercent);
                        
                        if (bullet.specialBonuses && bullet.specialBonuses.freezeChainEnabled) {
                            this.chainFreezeEffect(enemy, freezeDuration, slowPercent, bullet.specialBonuses.freezeChainRange);
                        }
                    }
                    
                    if (bullet.hasPoisonEffect) {
                        let poisonDamage = bullet.poisonDamage;
                        let poisonDuration = bullet.poisonDuration;
                        
                        if (bullet.specialBonuses) {
                            if (bullet.specialBonuses.poisonDamageMultiplier) {
                                poisonDamage *= bullet.specialBonuses.poisonDamageMultiplier;
                            }
                            if (bullet.specialBonuses.poisonDurationMultiplier) {
                                poisonDuration *= bullet.specialBonuses.poisonDurationMultiplier;
                            }
                            if (bullet.specialBonuses.poisonSpreadEnabled) {
                                enemy.poisonSpreadEnabled = true;
                            }
                        }
                        
                        poisonDuration = this.upgradeSystem.getEffectiveDuration(poisonDuration);
                        enemy.applyPoison(poisonDamage, poisonDuration);
                    }
                    
                    if (bullet.sourceTurret && bullet.sourceTurret.weaponType === 'FIRE') {
                        if (bullet.specialBonuses && bullet.specialBonuses.burnEnabled) {
                            if (!enemy.isBurning) {
                                enemy.isBurning = true;
                                enemy.burnDamage = 0;
                                enemy.burnUntil = 0;
                                enemy.lastBurnTick = 0;
                            }
                            const burnDamagePerTick = Math.floor(bullet.damage * bullet.specialBonuses.burnDamagePercent);
                            enemy.burnDamage = Math.max(enemy.burnDamage || 0, burnDamagePerTick);
                            enemy.burnUntil = Math.max(enemy.burnUntil || 0, performance.now() + 3000);
                        }
                    }
                    
                    if (bullet.isAOE) {
                        let aoeRadius = bullet.aoeRadius;
                        let aoeDamageMultiplier = 0.5;
                        
                        if (bullet.specialBonuses) {
                            if (bullet.specialBonuses.aoeRadiusMultiplier) {
                                aoeRadius *= bullet.specialBonuses.aoeRadiusMultiplier;
                            }
                            if (bullet.specialBonuses.aoeDamageReduction !== undefined) {
                                aoeDamageMultiplier = 1 - bullet.specialBonuses.aoeDamageReduction;
                            }
                        }
                        
                        this.enemies.forEach(otherEnemy => {
                            if (otherEnemy !== enemy) {
                                const dx = otherEnemy.x - enemy.x;
                                const dy = otherEnemy.y - enemy.y;
                                const dist = Math.sqrt(dx * dx + dy * dy);
                                if (dist <= aoeRadius) {
                                    otherEnemy.takeDamage(bullet.damage * aoeDamageMultiplier);
                                    if (bullet.hasPoisonEffect) {
                                        let poisonDamage = bullet.poisonDamage;
                                        let poisonDuration = bullet.poisonDuration;
                                        if (bullet.specialBonuses) {
                                            if (bullet.specialBonuses.poisonDamageMultiplier) {
                                                poisonDamage *= bullet.specialBonuses.poisonDamageMultiplier;
                                            }
                                            if (bullet.specialBonuses.poisonDurationMultiplier) {
                                                poisonDuration *= bullet.specialBonuses.poisonDurationMultiplier;
                                            }
                                        }
                                        poisonDuration = this.upgradeSystem.getEffectiveDuration(poisonDuration);
                                        otherEnemy.applyPoison(poisonDamage, poisonDuration);
                                    }
                                }
                            }
                        });
                    }
                    
                    if (bullet.createsSpaceLine) {
                        let lineWidth = this.canvas.width * (CONSTANTS.WEAPONS.SPACE.lineWidthMultiplier || 0.25);
                        let lineDuration = bullet.lineDuration;
                        let lineDamage = bullet.damage * 0.3;
                        let blockCount = bullet.blockCount;
                        
                        if (bullet.specialBonuses) {
                            if (bullet.specialBonuses.lineWidthMultiplier) {
                                lineWidth *= bullet.specialBonuses.lineWidthMultiplier;
                            }
                            if (bullet.specialBonuses.extraBlockCount) {
                                blockCount += bullet.specialBonuses.extraBlockCount;
                            }
                            if (bullet.specialBonuses.spaceDamageMultiplier) {
                                lineDamage *= bullet.specialBonuses.spaceDamageMultiplier;
                            }
                        }
                        
                        lineDuration = this.upgradeSystem.getEffectiveDuration(lineDuration);
                        
                        const lineStartX = Math.max(0, Math.min(enemy.x - lineWidth / 2, this.canvas.width - lineWidth));
                        
                        const spaceLine = new SpaceLine(
                            enemy.y,
                            lineWidth,
                            lineDuration,
                            lineDamage,
                            lineStartX,
                            blockCount
                        );
                        
                        if (bullet.specialBonuses && bullet.specialBonuses.spacePassThroughDamage) {
                            spaceLine.passThroughDamage = lineDamage;
                        }
                        
                        this.spaceLines.push(spaceLine);
                    }
                    
                    bullet.onHit(enemy);
                }
            });
        });
        
        this.bullets = this.bullets.filter(bullet => bullet.isActive);
        
        this.spaceLines.forEach(line => {
            line.update(currentTime, this.enemies);
            
            if (line.passThroughDamage) {
                this.enemies.forEach(enemy => {
                    if (Math.abs(enemy.y - line.y) < 15 && 
                        enemy.x >= line.startX && enemy.x <= line.startX + line.width) {
                        if (!line.passThroughVictims) line.passThroughVictims = new Set();
                        if (!line.passThroughVictims.has(enemy)) {
                            enemy.takeDamage(line.passThroughDamage);
                            line.passThroughVictims.add(enemy);
                        }
                    }
                });
            }
        });
        this.spaceLines = this.spaceLines.filter(line => line.isActive);
        
        this.enemies.forEach(enemy => {
            if (enemy.isBurning && enemy.burnUntil) {
                const now = performance.now();
                if (now >= enemy.burnUntil) {
                    enemy.isBurning = false;
                } else if (now - (enemy.lastBurnTick || 0) >= 1000) {
                    enemy.takeDamage(enemy.burnDamage || 0);
                    enemy.lastBurnTick = now;
                }
            }
        });
    }
    
    chainFreezeEffect(sourceEnemy, freezeDuration, slowPercent, range) {
        this.enemies.forEach(enemy => {
            if (enemy !== sourceEnemy && !enemy.isFrozen) {
                const dx = enemy.x - sourceEnemy.x;
                const dy = enemy.y - sourceEnemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= range) {
                    enemy.applyFreeze(freezeDuration * 0.7, slowPercent * 0.7);
                }
            }
        });
    }
    
    spreadPoisonOnDeath(deadEnemy) {
        this.enemies.forEach(enemy => {
            if (enemy !== deadEnemy && !enemy.isPoisoned) {
                const dx = enemy.x - deadEnemy.x;
                const dy = enemy.y - deadEnemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= 100) {
                    enemy.applyPoison(
                        deadEnemy.poisonDamage * 0.5, 
                        deadEnemy.poisonUntil - performance.now()
                    );
                    enemy.poisonSpreadEnabled = true;
                }
            }
        });
    }
    
    draw() {
        this.ctx.fillStyle = '#0a0a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
        this.drawWall();
        this.drawTurretsRange();
        
        this.spaceLines.forEach(line => line.draw(this.ctx));
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        this.turrets.forEach(turret => turret.draw(this.ctx));
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 30;
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawWall() {
        const wallY = this.canvas.height - CONSTANTS.DEFENSE.WALL_HEIGHT;
        const wallHeight = CONSTANTS.DEFENSE.WALL_HEIGHT;
        
        const gradient = this.ctx.createLinearGradient(0, wallY, 0, this.canvas.height);
        gradient.addColorStop(0, '#4a4a6a');
        gradient.addColorStop(1, '#2a2a4a');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, wallY, this.canvas.width, wallHeight);
        
        this.ctx.strokeStyle = '#6a6a8a';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, wallY);
        this.ctx.lineTo(this.canvas.width, wallY);
        this.ctx.stroke();
        
        this.ctx.strokeStyle = '#3a3a5a';
        this.ctx.lineWidth = 1;
        const brickWidth = 50;
        const brickHeight = 25;
        
        for (let row = 0; row < wallHeight / brickHeight; row++) {
            const offset = row % 2 === 0 ? 0 : brickWidth / 2;
            for (let col = -1; col < this.canvas.width / brickWidth + 1; col++) {
                const x = col * brickWidth + offset;
                const y = wallY + row * brickHeight;
                
                this.ctx.strokeRect(x, y, brickWidth, brickHeight);
            }
        }
    }
    
    drawTurretsRange() {
        this.turrets.forEach(turret => {
            this.ctx.beginPath();
            this.ctx.arc(turret.x, turret.y, turret.getEffectiveRange(), 0, Math.PI * 2);
            this.ctx.strokeStyle = turret.config.color;
            this.ctx.globalAlpha = 0.1;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        });
    }
    
    isGameOver() {
        return this.wallHP <= 0;
    }
    
    getState() {
        return {
            enemies: this.enemies.map(e => ({
                x: e.x, y: e.y, type: e.type,
                maxHP: e.maxHP, currentHP: e.currentHP
            })),
            turrets: this.turrets.map(t => ({
                x: t.x, y: t.y, weaponType: t.weaponType,
                slotIndex: t.slotIndex, level: t.level,
                specialBonuses: t.specialBonuses
            })),
            weaponPoints: { ...this.weaponPoints },
            weaponUnlockStates: { ...this.weaponUnlockStates },
            wallHP: this.wallHP,
            killCount: this.killCount,
            defenseScore: this.defenseScore,
            difficultyMultiplier: this.difficultyMultiplier,
            upgradeSystemState: this.upgradeSystem.getState()
        };
    }
    
    loadState(state) {
        if (!state) return;
        
        this.wallHP = state.wallHP || CONSTANTS.WALL.maxHP;
        this.killCount = state.killCount || 0;
        this.defenseScore = state.defenseScore || 0;
        this.difficultyMultiplier = state.difficultyMultiplier || 1;
        this.weaponPoints = { ...(state.weaponPoints || this.weaponPoints) };
        
        if (state.weaponUnlockStates) {
            this.weaponUnlockStates = { ...state.weaponUnlockStates };
        } else if (state.weaponLevels) {
            Object.keys(state.weaponLevels).forEach(type => {
                if (state.weaponLevels[type] >= 1) {
                    this.weaponUnlockStates[type] = true;
                }
            });
        }
        
        this.upgradeSystem.loadState(state.upgradeSystemState);
        
        if (state.turrets) {
            this.turrets = state.turrets.map(t => {
                const turret = new Turret(t.x, t.y, t.weaponType, t.slotIndex);
                for (let i = 1; i < t.level; i++) {
                    turret.upgrade();
                }
                if (t.specialBonuses) {
                    turret.specialBonuses = { ...t.specialBonuses };
                }
                return turret;
            });
        }
        
        this.enemies = [];
        this.bullets = [];
        this.spaceLines = [];
    }
}

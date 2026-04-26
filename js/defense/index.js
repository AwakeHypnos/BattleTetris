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
        
        this.killCount = 0;
        this.defenseScore = 0;
        
        this.lastSpawnTime = 0;
        this.spawnInterval = CONSTANTS.ENEMY.baseSpawnInterval;
        
        this.difficultyMultiplier = 1;
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
        
        this.weaponLevels = {
            FIRE: 0,
            PIERCE: 0,
            ICE: 0,
            POISON: 0,
            SPACE: 0,
            SHOTGUN: 0
        };
        
        this.pendingUpgrade = null;
        this.isUpgradePending = false;
        
        this.speedMultiplier = 1.0;
        
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
        const turret = new Turret(centerX, wallY - 20, 'FIRE', 0);
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
        this.difficultyMultiplier = 1;
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
        
        this.weaponLevels = {
            FIRE: 0,
            PIERCE: 0,
            ICE: 0,
            POISON: 0,
            SPACE: 0,
            SHOTGUN: 0
        };
        
        this.pendingUpgrade = null;
        this.isUpgradePending = false;
        
        this.speedMultiplier = 1.0;
        
        this.initTurrets();
    }
    
    setBonuses(bonuses) {
        this.bonuses = { ...this.bonuses, ...bonuses };
        this.turrets.forEach(turret => turret.setBonuses(this.bonuses));
    }
    
    addWeaponPoints(color, points) {
        const weaponType = CONSTANTS.WEAPON_COLOR_MAP[color];
        if (!weaponType) return null;
        
        this.weaponPoints[weaponType] += points;
        
        const currentLevel = this.weaponLevels[weaponType];
        const nextLevel = currentLevel + 1;
        const threshold = CONSTANTS.WEAPON_LEVEL_THRESHOLDS[nextLevel];
        
        if (threshold && this.weaponPoints[weaponType] >= threshold && !this.isUpgradePending) {
            this.pendingUpgrade = {
                weaponType: weaponType,
                newLevel: nextLevel,
                points: this.weaponPoints[weaponType]
            };
            this.isUpgradePending = true;
            return this.pendingUpgrade;
        }
        
        return null;
    }
    
    confirmUpgrade() {
        if (!this.pendingUpgrade) return false;
        
        const { weaponType, newLevel } = this.pendingUpgrade;
        
        if (newLevel === 1 && weaponType !== 'FIRE') {
            const existingTurret = this.turrets.find(t => t.weaponType === weaponType);
            if (!existingTurret) {
                this.addTurretForWeapon(weaponType);
            }
        }
        
        this.weaponLevels[weaponType] = newLevel;
        
        const turret = this.turrets.find(t => t.weaponType === weaponType);
        if (turret) {
            turret.upgrade();
        }
        
        this.weaponPoints[weaponType] = 0;
        this.pendingUpgrade = null;
        this.isUpgradePending = false;
        
        return true;
    }
    
    deferUpgrade() {
        this.isUpgradePending = false;
    }
    
    spawnEnemy(count = 1) {
        const types = ['NORMAL', 'NORMAL', 'NORMAL', 'FAST', 'TANK'];
        
        const elapsedMinutes = (performance.now() - this.gameStartTime) / 60000;
        if (elapsedMinutes > 2) {
            types.push('ELITE');
        }
        
        for (let i = 0; i < count; i++) {
            const type = Utils.randomChoice(types);
            const x = Utils.randomInt(30, this.canvas.width - 30);
            const y = -40 - Math.random() * 60;
            
            const enemy = new Enemy(x, y, type, this.difficultyMultiplier);
            this.enemies.push(enemy);
        }
    }
    
    spawnWave(waveNumber) {
        const baseCount = CONSTANTS.ENEMY_SPAWN.waveBaseCount;
        const increment = CONSTANTS.ENEMY_SPAWN.waveIncrementCount;
        const count = baseCount + (waveNumber - 1) * increment;
        
        this.spawnEnemy(count);
    }
    
    update(currentTime) {
        const elapsedSeconds = (currentTime - this.gameStartTime) / 1000;
        const elapsedMinutes = elapsedSeconds / 60;
        
        const periodsOf30Seconds = Math.floor(elapsedSeconds / 30);
        this.difficultyMultiplier = 1 + periodsOf30Seconds * (CONSTANTS.ENEMY_DIFFICULTY.hpIncreasePer30Seconds / 100);
        
        const effectiveSpawnInterval = CONSTANTS.ENEMY.baseSpawnInterval / this.speedMultiplier;
        
        if (this.lastWaveTime === undefined) {
            this.lastWaveTime = 0;
        }
        
        const waveIntervalMinutes = CONSTANTS.ENEMY_SPAWN.waveIntervalMinutes;
        const currentWaveNumber = Math.floor(elapsedMinutes / waveIntervalMinutes);
        const lastWaveNumber = Math.floor(this.lastWaveTime / waveIntervalMinutes);
        
        if (currentWaveNumber > lastWaveNumber && currentWaveNumber >= 1) {
            this.spawnWave(currentWaveNumber);
            this.lastWaveTime = elapsedMinutes;
        }
        
        if (currentTime - this.lastSpawnTime >= effectiveSpawnInterval) {
            const extraCount = Math.floor(elapsedSeconds / 30) * CONSTANTS.ENEMY_SPAWN.extraCountPer30Seconds;
            const baseCount = CONSTANTS.ENEMY_SPAWN.baseCount + extraCount;
            const totalCount = Math.ceil(baseCount * this.speedMultiplier);
            
            this.spawnEnemy(totalCount);
            this.lastSpawnTime = currentTime;
        }
        
        this.enemies.forEach(enemy => enemy.update(currentTime, this.speedMultiplier));
        
        const wallY = this.canvas.height - CONSTANTS.DEFENSE.WALL_HEIGHT;
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.y >= wallY) {
                this.wallHP -= enemy.damageToWall;
                return false;
            }
            if (enemy.currentHP <= 0) {
                this.killCount++;
                this.defenseScore += CONSTANTS.ENEMY.scorePerKill +
                    Math.floor(enemy.maxHP * CONSTANTS.ENEMY.scorePerHP);
                return false;
            }
            return true;
        });
        
        this.turrets.forEach(turret => {
            const effectiveAttackSpeed = turret.getEffectiveAttackSpeed() / this.speedMultiplier;
            if (currentTime - turret.lastAttackTime >= effectiveAttackSpeed) {
                const target = turret.findTarget(this.enemies);
                if (target) {
                    turret.lastAttackTime = currentTime;
                    turret.target = target;
                    const targetAngle = Math.atan2(target.y - turret.y, target.x - turret.x);
                    turret.angle = targetAngle;
                    
                    let newBullets = [];
                    
                    if (turret.weaponType === 'SHOTGUN') {
                        const bulletCount = Math.floor(turret.config.bulletCount * turret.bonuses.bulletCountBonus);
                        const spreadRad = (turret.config.spreadAngle * Math.PI) / 180;
                        
                        for (let i = 0; i < bulletCount; i++) {
                            const offset = (i - (bulletCount - 1) / 2);
                            const bulletAngle = targetAngle + offset * (spreadRad / (bulletCount - 1));
                            
                            const bulletTargetX = turret.x + Math.cos(bulletAngle) * 500;
                            const bulletTargetY = turret.y + Math.sin(bulletAngle) * 500;
                            
                            const bullet = new Bullet(
                                turret.x, turret.y,
                                bulletTargetX, bulletTargetY,
                                turret.weaponType,
                                turret.getEffectiveDamage(),
                                turret.bonuses
                            );
                            newBullets.push(bullet);
                        }
                    } else {
                        const bullet = new Bullet(
                            turret.x, turret.y,
                            target.x, target.y,
                            turret.weaponType,
                            turret.getEffectiveDamage(),
                            turret.bonuses
                        );
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
                    let killed = enemy.takeDamage(bullet.damage);
                    
                    if (bullet.hasFreezeEffect) {
                        enemy.applyFreeze(bullet.freezeDuration, bullet.slowPercent);
                    }
                    if (bullet.hasPoisonEffect) {
                        enemy.applyPoison(bullet.poisonDamage, bullet.poisonDuration);
                    }
                    
                    if (bullet.isAOE) {
                        this.enemies.forEach(otherEnemy => {
                            if (otherEnemy !== enemy) {
                                const dx = otherEnemy.x - enemy.x;
                                const dy = otherEnemy.y - enemy.y;
                                const dist = Math.sqrt(dx * dx + dy * dy);
                                if (dist <= bullet.aoeRadius) {
                                    otherEnemy.takeDamage(bullet.damage * 0.5);
                                    if (bullet.hasPoisonEffect) {
                                        otherEnemy.applyPoison(bullet.poisonDamage, bullet.poisonDuration);
                                    }
                                }
                            }
                        });
                    }
                    
                    if (bullet.createsSpaceLine) {
                        const lineWidth = this.canvas.width * (CONSTANTS.WEAPONS.SPACE.lineWidthMultiplier || 0.25);
                        const lineStartX = Math.max(0, Math.min(enemy.x - lineWidth / 2, this.canvas.width - lineWidth));
                        
                        const spaceLine = new SpaceLine(
                            enemy.y,
                            lineWidth,
                            bullet.lineDuration,
                            bullet.damage * 0.3,
                            lineStartX,
                            bullet.blockCount
                        );
                        this.spaceLines.push(spaceLine);
                    }
                    
                    bullet.onHit(enemy);
                }
            });
        });
        
        this.bullets = this.bullets.filter(bullet => bullet.isActive);
        
        this.spaceLines.forEach(line => line.update(currentTime, this.enemies));
        this.spaceLines = this.spaceLines.filter(line => line.isActive);
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
                slotIndex: t.slotIndex, level: t.level
            })),
            weaponPoints: { ...this.weaponPoints },
            weaponLevels: { ...this.weaponLevels },
            wallHP: this.wallHP,
            killCount: this.killCount,
            defenseScore: this.defenseScore,
            difficultyMultiplier: this.difficultyMultiplier
        };
    }
    
    loadState(state) {
        if (!state) return;
        
        this.wallHP = state.wallHP || CONSTANTS.WALL.maxHP;
        this.killCount = state.killCount || 0;
        this.defenseScore = state.defenseScore || 0;
        this.difficultyMultiplier = state.difficultyMultiplier || 1;
        this.weaponPoints = { ...(state.weaponPoints || this.weaponPoints) };
        this.weaponLevels = { ...(state.weaponLevels || this.weaponLevels) };
        
        if (state.turrets) {
            this.turrets = state.turrets.map(t => {
                const turret = new Turret(t.x, t.y, t.weaponType, t.slotIndex);
                for (let i = 1; i < t.level; i++) {
                    turret.upgrade();
                }
                return turret;
            });
        }
        
        this.enemies = [];
        this.bullets = [];
        this.spaceLines = [];
    }
}

// ============================================
// 敌人实体类
// ============================================
class Enemy {
    constructor(x, y, type = 'NORMAL', difficultyMultiplier = 1) {
        this.x = x;
        this.y = y;
        this.type = type;
        
        const typeConfig = CONSTANTS.ENEMY_TYPES[type] || CONSTANTS.ENEMY_TYPES.NORMAL;
        
        this.maxHP = Math.floor(CONSTANTS.ENEMY.baseHP * typeConfig.hpMultiplier * difficultyMultiplier);
        this.currentHP = this.maxHP;
        this.baseSpeed = CONSTANTS.ENEMY.baseSpeed * typeConfig.speedMultiplier;
        this.speed = this.baseSpeed;
        this.color = typeConfig.color;
        this.size = CONSTANTS.ENEMY.size;
        
        this.isFrozen = false;
        this.frozenUntil = 0;
        this.isSlowed = false;
        this.slowUntil = 0;
        this.slowPercent = 0;
        
        this.isPoisoned = false;
        this.poisonDamage = 0;
        this.poisonUntil = 0;
        this.lastPoisonTick = 0;
        
        this.isElite = type === 'ELITE';
        this.isTank = type === 'TANK';
    }
    
    update(currentTime) {
        if (this.isFrozen && currentTime >= this.frozenUntil) {
            this.isFrozen = false;
        }
        
        if (this.isSlowed && currentTime >= this.slowUntil) {
            this.isSlowed = false;
            this.speed = this.baseSpeed;
        }
        
        if (this.isPoisoned) {
            if (currentTime >= this.poisonUntil) {
                this.isPoisoned = false;
            } else if (currentTime - this.lastPoisonTick >= CONSTANTS.WEAPONS.POISON.poisonTickRate) {
                this.currentHP -= this.poisonDamage;
                this.lastPoisonTick = currentTime;
            }
        }
        
        if (!this.isFrozen) {
            this.y += this.speed;
        }
    }
    
    applyFreeze(duration, slowPercent) {
        this.isFrozen = true;
        this.frozenUntil = performance.now() + duration;
        this.isSlowed = true;
        this.slowUntil = performance.now() + duration;
        this.slowPercent = slowPercent;
        this.speed = this.baseSpeed * (1 - slowPercent);
    }
    
    applyPoison(damage, duration) {
        this.isPoisoned = true;
        this.poisonDamage = damage;
        this.poisonUntil = performance.now() + duration;
        this.lastPoisonTick = performance.now();
    }
    
    takeDamage(damage) {
        this.currentHP -= damage;
        return this.currentHP <= 0;
    }
    
    draw(ctx) {
        ctx.save();
        
        const x = this.x;
        const y = this.y;
        const size = this.size;
        
        const stickHeadRadius = size * 0.3;
        const stickBodyLength = size * 0.5;
        const stickArmLength = size * 0.35;
        const stickLegLength = size * 0.4;
        
        let bodyColor = this.color;
        if (this.isFrozen) {
            bodyColor = '#87CEEB';
            ctx.shadowColor = '#00FFFF';
            ctx.shadowBlur = 15;
        } else if (this.isPoisoned) {
            bodyColor = '#90EE90';
            ctx.shadowColor = '#00FF00';
            ctx.shadowBlur = 10;
        } else if (this.isElite) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15;
        }
        
        ctx.strokeStyle = bodyColor;
        ctx.fillStyle = bodyColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.arc(x, y - stickBodyLength - stickHeadRadius, stickHeadRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x, y - stickBodyLength);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x, y - stickBodyLength * 0.6);
        ctx.lineTo(x - stickArmLength, y - stickBodyLength * 0.3);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x, y - stickBodyLength * 0.6);
        ctx.lineTo(x + stickArmLength, y - stickBodyLength * 0.3);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - stickLegLength, y + stickLegLength);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + stickLegLength, y + stickLegLength);
        ctx.stroke();
        
        if (this.isTank) {
            ctx.beginPath();
            ctx.arc(x, y - stickBodyLength - stickHeadRadius, stickHeadRadius * 1.3, 0, Math.PI * 2);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        ctx.shadowBlur = 0;
        
        const barWidth = size * 1.5;
        const barHeight = 4;
        const barX = x - barWidth / 2;
        const barY = y - stickBodyLength - stickHeadRadius * 2 - 12;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const hpPercent = this.currentHP / this.maxHP;
        let hpColor = '#4ecca3';
        if (hpPercent < 0.3) hpColor = '#e94560';
        else if (hpPercent < 0.6) hpColor = '#ff8c00';
        
        ctx.fillStyle = hpColor;
        ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
        
        ctx.restore();
    }
}

// ============================================
// 子弹实体类
// ============================================
class Bullet {
    constructor(x, y, targetX, targetY, weaponType, damage, bonuses = {}) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.weaponType = weaponType;
        this.baseDamage = damage;
        this.damage = damage * (bonuses.damageBonus || 1);
        this.bonuses = bonuses;
        
        const weaponConfig = CONSTANTS.WEAPONS[weaponType];
        this.speed = weaponConfig.bulletSpeed;
        this.color = weaponConfig.color;
        this.size = 6;
        
        const angle = Math.atan2(targetY - y, targetX - x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.angle = angle;
        
        this.isActive = true;
        this.pierceCount = weaponConfig.pierceCount || 1;
        this.hitEnemies = new Set();
        
        this.isAOE = weaponType === 'FIRE';
        this.aoeRadius = weaponConfig.aoeRadius || 0;
        
        this.hasFreezeEffect = weaponType === 'ICE';
        this.freezeDuration = weaponConfig.freezeDuration;
        this.slowPercent = weaponConfig.slowPercent;
        
        this.hasPoisonEffect = weaponType === 'POISON';
        this.poisonDamage = weaponConfig.poisonDamage;
        this.poisonDuration = weaponConfig.poisonDuration;
        
        this.createsSpaceLine = weaponType === 'SPACE';
        this.lineWidth = weaponConfig.lineWidth;
        this.lineDuration = weaponConfig.lineDuration;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < -50 || this.x > CONSTANTS.DEFENSE.CANVAS_WIDTH + 50 ||
            this.y < -50 || this.y > CONSTANTS.DEFENSE.CANVAS_HEIGHT + 50) {
            this.isActive = false;
        }
    }
    
    canHit(enemy) {
        if (this.hitEnemies.has(enemy)) return false;
        
        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < (enemy.size / 2 + this.size);
    }
    
    onHit(enemy) {
        this.hitEnemies.add(enemy);
        this.pierceCount--;
        
        if (this.pierceCount <= 0) {
            this.isActive = false;
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(-this.size - 5, 0);
        ctx.lineTo(-this.size * 3, 0);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        
        ctx.restore();
    }
}

// ============================================
// 空间线类（紫色武器效果）
// ============================================
class SpaceLine {
    constructor(y, width, duration, damage) {
        this.y = y;
        this.width = width;
        this.duration = duration;
        this.damage = damage;
        this.createdAt = performance.now();
        this.isActive = true;
        this.lastDamageTick = performance.now();
        this.damageTickRate = 500;
    }
    
    update(currentTime, enemies) {
        if (currentTime - this.createdAt >= this.duration) {
            this.isActive = false;
            return;
        }
        
        if (currentTime - this.lastDamageTick >= this.damageTickRate) {
            enemies.forEach(enemy => {
                if (Math.abs(enemy.y - this.y) < 20) {
                    enemy.takeDamage(this.damage);
                }
            });
            this.lastDamageTick = currentTime;
        }
    }
    
    draw(ctx) {
        const progress = 1 - (performance.now() - this.createdAt) / this.duration;
        
        ctx.save();
        ctx.globalAlpha = progress * 0.7;
        
        ctx.beginPath();
        ctx.moveTo(0, this.y);
        ctx.lineTo(this.width, this.y);
        ctx.strokeStyle = CONSTANTS.WEAPONS.SPACE.color;
        ctx.lineWidth = CONSTANTS.WEAPONS.SPACE.lineWidth;
        ctx.shadowColor = CONSTANTS.WEAPONS.SPACE.color;
        ctx.shadowBlur = 20;
        ctx.stroke();
        
        ctx.restore();
    }
}

// ============================================
// 炮塔基类
// ============================================
class Turret {
    constructor(x, y, weaponType, slotIndex) {
        this.x = x;
        this.y = y;
        this.weaponType = weaponType;
        this.slotIndex = slotIndex;
        
        this.level = 1;
        this.config = CONSTANTS.WEAPONS[weaponType];
        
        this.baseDamage = this.config.damage;
        this.baseAttackSpeed = this.config.attackSpeed;
        this.baseRange = this.config.range;
        
        this.damage = this.baseDamage;
        this.attackSpeed = this.baseAttackSpeed;
        this.range = this.baseRange;
        
        this.lastAttackTime = 0;
        this.target = null;
        this.angle = -Math.PI / 2;
        this.size = 35;
        
        this.bonuses = {
            damageBonus: 1,
            attackSpeedBonus: 1,
            rangeBonus: 1,
            bulletCountBonus: 1
        };
    }
    
    upgrade() {
        this.level++;
        const upgradeBonus = CONSTANTS.WEAPON_UPGRADE_BONUS;
        
        this.damage = this.baseDamage * (1 + upgradeBonus.damage * (this.level - 1));
        this.attackSpeed = this.baseAttackSpeed * (1 - upgradeBonus.attackSpeed * (this.level - 1));
        this.range = this.baseRange * (1 + upgradeBonus.range * (this.level - 1));
    }
    
    setBonuses(bonuses) {
        this.bonuses = { ...this.bonuses, ...bonuses };
    }
    
    getEffectiveDamage() {
        return this.damage * this.bonuses.damageBonus;
    }
    
    getEffectiveAttackSpeed() {
        return Math.max(200, this.attackSpeed / this.bonuses.attackSpeedBonus);
    }
    
    getEffectiveRange() {
        return this.range * this.bonuses.rangeBonus;
    }
    
    findTarget(enemies) {
        if (!enemies || enemies.length === 0) return null;
        
        const range = this.getEffectiveRange();
        let closestEnemy = null;
        let lowestY = -Infinity;
        
        enemies.forEach(enemy => {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= range && enemy.y > lowestY) {
                closestEnemy = enemy;
                lowestY = enemy.y;
            }
        });
        
        return closestEnemy;
    }
    
    canAttack(currentTime) {
        const effectiveSpeed = this.getEffectiveAttackSpeed();
        return currentTime - this.lastAttackTime >= effectiveSpeed;
    }
    
    attack(currentTime, enemies, bullets, spaceLines) {
        if (!this.canAttack(currentTime)) return [];
        
        const target = this.findTarget(enemies);
        if (!target) return [];
        
        this.lastAttackTime = currentTime;
        this.target = target;
        
        const targetAngle = Math.atan2(target.y - this.y, target.x - this.x);
        this.angle = targetAngle;
        
        const newBullets = [];
        
        if (this.weaponType === 'SHOTGUN') {
            const bulletCount = Math.floor(this.config.bulletCount * this.bonuses.bulletCountBonus);
            const spreadRad = (this.config.spreadAngle * Math.PI) / 180;
            
            for (let i = 0; i < bulletCount; i++) {
                const offset = (i - (bulletCount - 1) / 2);
                const bulletAngle = targetAngle + offset * (spreadRad / (bulletCount - 1));
                
                const bulletTargetX = this.x + Math.cos(bulletAngle) * 500;
                const bulletTargetY = this.y + Math.sin(bulletAngle) * 500;
                
                const bullet = new Bullet(
                    this.x, this.y,
                    bulletTargetX, bulletTargetY,
                    this.weaponType,
                    this.getEffectiveDamage(),
                    this.bonuses
                );
                newBullets.push(bullet);
            }
        } else {
            const bullet = new Bullet(
                this.x, this.y,
                target.x, target.y,
                this.weaponType,
                this.getEffectiveDamage(),
                this.bonuses
            );
            newBullets.push(bullet);
        }
        
        return newBullets;
    }
    
    draw(ctx) {
        ctx.save();
        
        ctx.translate(this.x, this.y);
        
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#2a2a4a';
        ctx.strokeStyle = this.config.color;
        ctx.lineWidth = 3;
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = this.config.color;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Lv${this.level}`, 0, 0);
        
        ctx.rotate(this.angle);
        
        ctx.fillStyle = this.config.color;
        ctx.shadowColor = this.config.color;
        ctx.shadowBlur = 5;
        ctx.fillRect(0, -4, this.size * 0.6, 8);
        
        ctx.restore();
    }
}

// ============================================
// 防御系统类
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
        
        for (let i = 0; i < slotCount; i++) {
            const x = slotWidth * (i + 1);
            const weaponTypes = ['FIRE', 'PIERCE', 'ICE', 'POISON', 'SPACE', 'SHOTGUN'];
            const weaponType = weaponTypes[i % weaponTypes.length];
            
            const turret = new Turret(x, wallY - 20, weaponType, i);
            this.turrets.push(turret);
        }
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
    
    spawnEnemy() {
        const types = ['NORMAL', 'NORMAL', 'NORMAL', 'FAST', 'TANK'];
        
        const elapsedMinutes = (performance.now() - this.gameStartTime) / 60000;
        if (elapsedMinutes > 2) {
            types.push('ELITE');
        }
        
        const type = Utils.randomChoice(types);
        const x = Utils.randomInt(30, this.canvas.width - 30);
        const y = -40;
        
        const enemy = new Enemy(x, y, type, this.difficultyMultiplier);
        this.enemies.push(enemy);
    }
    
    update(currentTime) {
        const elapsedMinutes = (currentTime - this.gameStartTime) / 60000;
        
        this.difficultyMultiplier = Math.min(
            CONSTANTS.ENEMY_DIFFICULTY.maxHpMultiplier,
            1 + elapsedMinutes * (CONSTANTS.ENEMY_DIFFICULTY.hpIncreasePerMinute / 100)
        );
        
        this.spawnInterval = Math.max(
            CONSTANTS.ENEMY.minSpawnInterval,
            CONSTANTS.ENEMY.baseSpawnInterval - elapsedMinutes * CONSTANTS.ENEMY_DIFFICULTY.spawnRateIncreasePerMinute
        );
        
        if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
            this.spawnEnemy();
            this.lastSpawnTime = currentTime;
        }
        
        this.enemies.forEach(enemy => enemy.update(currentTime));
        
        const wallY = this.canvas.height - CONSTANTS.DEFENSE.WALL_HEIGHT;
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.y >= wallY) {
                this.wallHP -= CONSTANTS.WALL.damagePerEnemy;
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
            const newBullets = turret.attack(currentTime, this.enemies, this.bullets, this.spaceLines);
            this.bullets.push(...newBullets);
        });
        
        this.bullets.forEach(bullet => bullet.update());
        
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
                                }
                            }
                        });
                    }
                    
                    if (bullet.createsSpaceLine) {
                        const spaceLine = new SpaceLine(
                            enemy.y,
                            this.canvas.width,
                            bullet.lineDuration,
                            bullet.damage * 0.3
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
            gameOverMenu: document.getElementById('gameOverOverlay'),
            howToPlayMenu: document.getElementById('howToPlayOverlay'),
            
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
            this.endGame();
            return;
        }
        
        this.currentPiece.shape.forEach(([x, y]) => {
            const gridX = this.currentPiece.x + x;
            const gridY = this.currentPiece.y + y;
            
            if (gridY >= 0 && gridY < CONSTANTS.GRID_HEIGHT) {
                this.grid[gridY][gridX] = this.currentPiece.color;
            }
        });
        
        this.applyGravity();
        
        const hasCleared = this.checkAndClear();
        
        if (hasCleared) {
            this.combo++;
            if (this.combo > this.maxCombo) {
                this.maxCombo = this.combo;
            }
        } else {
            this.combo = 0;
            this.spawnNewPiece();
        }
        
        this.updateUI();
    }
    
    spawnNewPiece() {
        this.currentPiece = this.nextPiece || this.generatePiece();
        this.nextPiece = this.generatePiece();
        
        if (!this.canMove(this.currentPiece)) {
            this.endGame();
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
        
        clearedColors.forEach((count, color) => {
            const points = count * (5 + this.combo * 2);
            const upgrade = this.defenseSystem.addWeaponPoints(color, points);
            
            if (upgrade && !this.isInUpgradeMenu) {
                this.showUpgradeMenu(upgrade);
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
        const newLevel = Math.floor(this.tetrisScore / (CONSTANTS.LEVEL.BASE_LINES_PER_LEVEL * CONSTANTS.SCORE.BASE)) + 1;
        
        if (newLevel > this.level) {
            this.level = newLevel;
            
            this.dropSpeed = Math.max(100, CONSTANTS.INITIAL_SPEED * Math.pow(CONSTANTS.LEVEL.SPEED_INCREASE, this.level - 1));
            
            this.resetDropTimer();
        }
    }
    
    calculateTotalScore() {
        const tetrisWeight = CONSTANTS.SCORING.TETRIS_WEIGHT;
        const defenseWeight = CONSTANTS.SCORING.DEFENSE_WEIGHT;
        
        const wallHPBonus = Math.floor(
            Math.max(0, this.defenseSystem.wallHP) * CONSTANTS.SCORING.WALL_HP_BONUS / CONSTANTS.WALL.maxHP
        );
        
        const survivalBonus = Math.floor(this.survivalTime * CONSTANTS.SCORING.SURVIVAL_TIME_BONUS);
        
        const killBonus = this.defenseSystem.killCount * CONSTANTS.SCORING.KILL_BONUS;
        
        const comboBonus = this.maxCombo * CONSTANTS.SCORING.COMBO_BONUS;
        
        const levelBonus = this.level * CONSTANTS.SCORING.LEVEL_BONUS;
        
        const adjustedDefenseScore = this.defenseSystem.defenseScore + wallHPBonus + survivalBonus + killBonus + comboBonus + levelBonus;
        
        this.totalScore = Math.floor(
            this.tetrisScore * tetrisWeight + adjustedDefenseScore * defenseWeight
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
        this.ui.upgradeMenu.classList.add('hidden');
        this.isInUpgradeMenu = false;
        this.isPaused = false;
        this.startDropTimer();
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
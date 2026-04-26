// ============================================
// 塔防系统 - 敌人模块
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
        this.damageToWall = typeConfig.damageToWall || CONSTANTS.WALL.damagePerEnemy;
        
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
    
    update(currentTime, speedMultiplier = 1.0) {
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
            this.y += this.speed * speedMultiplier;
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

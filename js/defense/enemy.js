// ============================================
// 塔防系统 - 敌人模块
// ============================================

class Enemy {
    constructor(x, y, type = 'NORMAL', difficultyMultiplier = 1, defense = 0) {
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
        
        this.defense = Math.min(defense, 90);
        
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
        
        this.knockbackPaused = false;
        this.knockbackResumeTime = 0;
    }
    
    update(currentTime, speedMultiplier = 1.0) {
        if (this.knockbackPaused && currentTime >= this.knockbackResumeTime) {
            this.knockbackPaused = false;
        }
        
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
        
        if (!this.isFrozen && !this.knockbackPaused) {
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
        const actualDamage = Math.max(1, damage * (1 - this.defense / 100));
        this.currentHP -= actualDamage;
        return this.currentHP <= 0;
    }
    
    applyKnockback(distance = 10, pauseDuration = 200) {
        if (this.isTank) return false;
        
        this.y = Math.max(-50, this.y - distance);
        this.knockbackPaused = true;
        this.knockbackResumeTime = performance.now() + pauseDuration;
        
        return true;
    }
    
    draw(ctx) {
        ctx.save();
        
        const x = this.x;
        const y = this.y;
        const size = this.size;
        
        let bodyColor = this.color;
        if (this.isFrozen) {
            bodyColor = '#87CEEB';
            ctx.shadowColor = '#00FFFF';
            ctx.shadowBlur = 15;
        } else if (this.isPoisoned) {
            bodyColor = '#90EE90';
            ctx.shadowColor = '#00FF00';
            ctx.shadowBlur = 10;
        }
        
        ctx.strokeStyle = bodyColor;
        ctx.fillStyle = bodyColor;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (this.type === 'NORMAL') {
            this.drawNormalEnemy(ctx, x, y, size);
        } else if (this.type === 'FAST') {
            this.drawFastEnemy(ctx, x, y, size);
        } else if (this.type === 'TANK') {
            this.drawTankEnemy(ctx, x, y, size);
        } else if (this.type === 'ELITE') {
            this.drawEliteEnemy(ctx, x, y, size);
        }
        
        ctx.shadowBlur = 0;
        
        const barWidth = size * 1.5;
        const barHeight = 4;
        const barX = x - barWidth / 2;
        const barY = y - size - 12;
        
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
    
    drawNormalEnemy(ctx, x, y, size) {
        const stickHeadRadius = size * 0.25;
        const stickBodyLength = size * 0.45;
        const stickArmLength = size * 0.3;
        const stickLegLength = size * 0.35;
        
        ctx.lineWidth = 2.5;
        
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
    }
    
    drawFastEnemy(ctx, x, y, size) {
        const radius = size * 0.35;
        
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x - radius, y);
        ctx.lineTo(x - radius - size * 0.3, y - size * 0.15);
        ctx.lineTo(x - radius - size * 0.3, y + size * 0.15);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + radius + size * 0.3, y - size * 0.15);
        ctx.lineTo(x + radius + size * 0.3, y + size * 0.15);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x - radius * 0.4, y - radius * 0.2, radius * 0.2, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.4, y - radius * 0.2, radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x - radius * 0.35, y - radius * 0.2, radius * 0.1, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.45, y - radius * 0.2, radius * 0.1, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawTankEnemy(ctx, x, y, size) {
        const width = size * 1.2;
        const height = size * 0.8;
        const radius = size * 0.25;
        
        ctx.lineWidth = 3;
        
        ctx.fillRect(x - width / 2, y - height / 2, width, height);
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - width / 2, y - height / 2, width, height);
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.2, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x - radius * 0.4, y - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.4, y - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(x - radius * 0.4, y - radius * 0.3, radius * 0.12, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.4, y - radius * 0.3, radius * 0.12, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawEliteEnemy(ctx, x, y, size) {
        const radius = size * 0.4;
        
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x - radius * 0.2, y - radius * 0.1, radius * 0.15, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.2, y - radius * 0.1, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.arc(x - radius * 0.2, y - radius * 0.1, radius * 0.08, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.2, y - radius * 0.1, radius * 0.08, 0, Math.PI * 2);
        ctx.fill();
    }
}

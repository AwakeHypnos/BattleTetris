// ============================================
// 塔防系统 - 子弹模块
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

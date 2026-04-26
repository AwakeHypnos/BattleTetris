// ============================================
// 塔防系统 - 效果模块
// ============================================

// ============================================
// 空间线类（紫色武器效果）
// ============================================
class SpaceLine {
    constructor(y, width, duration, damage, startX = 0, blockCount = 3) {
        this.y = y;
        this.width = width;
        this.duration = duration;
        this.damage = damage;
        this.startX = startX;
        this.blockCount = blockCount;
        this.maxBlockCount = blockCount;
        this.createdAt = performance.now();
        this.isActive = true;
        this.lastDamageTick = performance.now();
        this.damageTickRate = 500;
        this.blockedEnemies = new Set();
    }
    
    update(currentTime, enemies) {
        if (currentTime - this.createdAt >= this.duration) {
            this.isActive = false;
            return;
        }
        
        if (this.blockCount <= 0) {
            this.isActive = false;
            return;
        }
        
        const lineStartX = this.startX;
        const lineEndX = this.startX + this.width;
        
        enemies.forEach(enemy => {
            if (Math.abs(enemy.y - this.y) < 20 && 
                enemy.x >= lineStartX && enemy.x <= lineEndX) {
                if (!this.blockedEnemies.has(enemy)) {
                    this.blockedEnemies.add(enemy);
                    this.blockCount--;
                }
                
                if (!enemy.isFrozen) {
                    enemy.applyFreeze(this.damageTickRate * 2, 0.9);
                }
            }
        });
        
        if (currentTime - this.lastDamageTick >= this.damageTickRate) {
            enemies.forEach(enemy => {
                if (Math.abs(enemy.y - this.y) < 20 && 
                    enemy.x >= lineStartX && enemy.x <= lineEndX) {
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
        ctx.moveTo(this.startX, this.y);
        ctx.lineTo(this.startX + this.width, this.y);
        ctx.strokeStyle = CONSTANTS.WEAPONS.SPACE.color;
        ctx.lineWidth = CONSTANTS.WEAPONS.SPACE.lineWidth;
        ctx.shadowColor = CONSTANTS.WEAPONS.SPACE.color;
        ctx.shadowBlur = 20;
        ctx.stroke();
        
        ctx.restore();
    }
}

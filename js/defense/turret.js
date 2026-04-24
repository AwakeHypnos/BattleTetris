// ============================================
// 塔防系统 - 炮台模块
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

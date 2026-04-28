// ============================================
// 塔防系统 - 升级系统模块
// ============================================

class UpgradeSystem {
    constructor() {
        this.selectedUpgrades = [];
        this.upgradeCounter = 0;
        
        this.globalBonuses = {
            damageBonus: 1,
            attackSpeedBonus: 1,
            eliteTankDamageBonus: 1,
            scoreBonus: 1,
            durationBonus: 1,
            armorReduction: 0
        };
        
        this.knockbackEnabled = false;
        this.comboStacking = { enabled: false, stacks: 0, lastHitTime: 0 };
        this.overcharge = { enabled: false, attackCount: 0 };
        
        this.turretBonuses = {};
        
        this.initUpgradePools();
    }
    
    initUpgradePools() {
        this.generalUpgrades = [
            {
                id: 'damage_boost',
                name: '铁血强化',
                description: '全局基础伤害 +15%',
                color: '#e94560',
                type: 'damage',
                value: 0.15,
                maxValue: 0.80,
                apply: (bonuses, value) => {
                    const newBonus = bonuses.damageBonus + value;
                    return { ...bonuses, damageBonus: Math.min(newBonus, 1 + 0.80) };
                },
                getCurrentBonus: (bonuses) => bonuses.damageBonus - 1
            },
            {
                id: 'attack_speed',
                name: '高速装填',
                description: '攻击间隔 -12%（攻速提升）',
                color: '#ff8c00',
                type: 'attackSpeed',
                value: 0.12,
                maxValue: 0.80,
                apply: (bonuses, value) => {
                    const newBonus = bonuses.attackSpeedBonus * (1 + value / (1 - value));
                    return { ...bonuses, attackSpeedBonus: Math.min(newBonus, 1 + 0.80) };
                },
                getCurrentBonus: (bonuses) => (bonuses.attackSpeedBonus - 1)
            },
            {
                id: 'weakpoint_strike',
                name: '弱点打击',
                description: '对精英/重甲敌人增伤 12%',
                color: '#a66cff',
                type: 'eliteTank',
                value: 0.12,
                maxValue: 1.0,
                apply: (bonuses, value) => {
                    return { ...bonuses, eliteTankDamageBonus: bonuses.eliteTankDamageBonus + value };
                },
                getCurrentBonus: (bonuses) => bonuses.eliteTankDamageBonus - 1
            },
            {
                id: 'score_boost',
                name: '高效回收',
                description: '方块消除额外获得5%得分，击杀敌人额外获得 10% 得分',
                color: '#4ecca3',
                type: 'score',
                value: 0.10,
                maxValue: 1.0,
                apply: (bonuses, value) => {
                    return { ...bonuses, scoreBonus: bonuses.scoreBonus + value };
                },
                getCurrentBonus: (bonuses) => bonuses.scoreBonus - 1
            },
            {
                id: 'knockback',
                name: '震荡冲击',
                description: '每次攻击小幅击退小型敌人',
                color: '#0f3460',
                type: 'knockback',
                value: 1,
                maxValue: 1,
                apply: (bonuses, value) => {
                    this.knockbackEnabled = true;
                    return bonuses;
                },
                getCurrentBonus: () => this.knockbackEnabled ? 1 : 0
            },
            {
                id: 'armor_reduction',
                name: '破甲腐蚀',
                description: '降低目标 5 点防御力，持续 3 秒',
                color: '#2f3542',
                type: 'armorReduction',
                value: 5,
                maxValue: 20,
                apply: (bonuses, value) => {
                    return { ...bonuses, armorReduction: bonuses.armorReduction + value };
                },
                getCurrentBonus: (bonuses) => bonuses.armorReduction
            },
            {
                id: 'combo_stacking',
                name: '连击增幅',
                description: '短时间连续命中，伤害逐层小幅叠加',
                color: '#f9ed69',
                type: 'combo',
                value: 1,
                maxValue: 1,
                apply: (bonuses, value) => {
                    this.comboStacking.enabled = true;
                    return bonuses;
                },
                getCurrentBonus: () => this.comboStacking.enabled ? 1 : 0
            },
            {
                id: 'duration_extend',
                name: '时序压缩',
                description: '所有持续类效果（毒/冰冻/标线）时长 +10%',
                color: '#00d9ff',
                type: 'duration',
                value: 0.10,
                maxValue: 1.0,
                apply: (bonuses, value) => {
                    return { ...bonuses, durationBonus: bonuses.durationBonus + value };
                },
                getCurrentBonus: (bonuses) => bonuses.durationBonus - 1
            },
            {
                id: 'overcharge',
                name: '超载充能',
                description: '每 10 次攻击，下一次攻击伤害翻倍',
                color: '#ffa502',
                type: 'overcharge',
                value: 1,
                maxValue: 1,
                apply: (bonuses, value) => {
                    this.overcharge.enabled = true;
                    return bonuses;
                },
                getCurrentBonus: () => this.overcharge.enabled ? 1 : 0
            }
        ];
        
        this.weaponSpecificUpgrades = {
            FIRE: [
                {
                    id: 'fire_aoe_boost',
                    name: '烈焰扩散',
                    description: 'AOE范围 +20%，AOE伤害衰减减少',
                    color: '#e94560',
                    weaponType: 'FIRE',
                    apply: (turret) => {
                        if (!turret.specialBonuses) turret.specialBonuses = {};
                        turret.specialBonuses.aoeRadiusMultiplier = (turret.specialBonuses.aoeRadiusMultiplier || 1) + 0.20;
                        turret.specialBonuses.aoeDamageReduction = Math.max(0.3, (turret.specialBonuses.aoeDamageReduction || 0.5) - 0.1);
                    }
                },
                {
                    id: 'fire_burn',
                    name: '灼烧效果',
                    description: '攻击附加持续灼烧伤害，每秒造成基础伤害的30%',
                    color: '#ff6b6b',
                    weaponType: 'FIRE',
                    apply: (turret) => {
                        if (!turret.specialBonuses) turret.specialBonuses = {};
                        turret.specialBonuses.burnEnabled = true;
                        turret.specialBonuses.burnDamagePercent = (turret.specialBonuses.burnDamagePercent || 0) + 0.30;
                    }
                }
            ],
            PIERCE: [
                {
                    id: 'pierce_count',
                    name: '穿透强化',
                    description: '穿透数量 +1，穿透伤害衰减减少15%',
                    color: '#ff8c00',
                    weaponType: 'PIERCE',
                    apply: (turret) => {
                        if (!turret.specialBonuses) turret.specialBonuses = {};
                        turret.specialBonuses.extraPierce = (turret.specialBonuses.extraPierce || 0) + 1;
                        turret.specialBonuses.pierceDamageRetention = Math.min(1, (turret.specialBonuses.pierceDamageRetention || 0.7) + 0.15);
                    }
                },
                {
                    id: 'pierce_crit',
                    name: '精准狙击',
                    description: '远距离攻击伤害 +25%，超过200距离触发',
                    color: '#ffaa4d',
                    weaponType: 'PIERCE',
                    apply: (turret) => {
                        if (!turret.specialBonuses) turret.specialBonuses = {};
                        turret.specialBonuses.longRangeBonus = true;
                        turret.specialBonuses.longRangeDamageBonus = (turret.specialBonuses.longRangeDamageBonus || 0) + 0.25;
                    }
                }
            ],
            ICE: [
                {
                    id: 'ice_freeze_extend',
                    name: '极寒领域',
                    description: '冰冻时长 +50%，减速效果 +20%',
                    color: '#0f3460',
                    weaponType: 'ICE',
                    apply: (turret) => {
                        if (!turret.specialBonuses) turret.specialBonuses = {};
                        turret.specialBonuses.freezeDurationMultiplier = (turret.specialBonuses.freezeDurationMultiplier || 1) + 0.50;
                        turret.specialBonuses.slowPercentBonus = (turret.specialBonuses.slowPercentBonus || 0) + 0.20;
                    }
                },
                {
                    id: 'ice_chain',
                    name: '冰霜连锁',
                    description: '冰冻效果会传染给周围敌人（范围80）',
                    color: '#87CEEB',
                    weaponType: 'ICE',
                    apply: (turret) => {
                        if (!turret.specialBonuses) turret.specialBonuses = {};
                        turret.specialBonuses.freezeChainEnabled = true;
                        turret.specialBonuses.freezeChainRange = 80;
                    }
                }
            ],
            POISON: [
                {
                    id: 'poison_damage',
                    name: '剧毒强化',
                    description: '中毒伤害 +40%，中毒时长 +30%',
                    color: '#4ecca3',
                    weaponType: 'POISON',
                    apply: (turret) => {
                        if (!turret.specialBonuses) turret.specialBonuses = {};
                        turret.specialBonuses.poisonDamageMultiplier = (turret.specialBonuses.poisonDamageMultiplier || 1) + 0.40;
                        turret.specialBonuses.poisonDurationMultiplier = (turret.specialBonuses.poisonDurationMultiplier || 1) + 0.30;
                    }
                },
                {
                    id: 'poison_spread',
                    name: '瘟疫传播',
                    description: '中毒敌人死亡时，将毒素传播给周围敌人',
                    color: '#90EE90',
                    weaponType: 'POISON',
                    apply: (turret) => {
                        if (!turret.specialBonuses) turret.specialBonuses = {};
                        turret.specialBonuses.poisonSpreadEnabled = true;
                        turret.specialBonuses.poisonSpreadRange = 100;
                    }
                }
            ],
            SPACE: [
                {
                    id: 'space_line_width',
                    name: '空间扩展',
                    description: '空间标线宽度 +30%，阻拦数量 +2',
                    color: '#a66cff',
                    weaponType: 'SPACE',
                    apply: (turret) => {
                        if (!turret.specialBonuses) turret.specialBonuses = {};
                        turret.specialBonuses.lineWidthMultiplier = (turret.specialBonuses.lineWidthMultiplier || 1) + 0.30;
                        turret.specialBonuses.extraBlockCount = (turret.specialBonuses.extraBlockCount || 0) + 2;
                    }
                },
                {
                    id: 'space_damage',
                    name: '空间切割',
                    description: '标线持续伤害 +50%，穿过标线的敌人额外受到伤害',
                    color: '#c77dff',
                    weaponType: 'SPACE',
                    apply: (turret) => {
                        if (!turret.specialBonuses) turret.specialBonuses = {};
                        turret.specialBonuses.spaceDamageMultiplier = (turret.specialBonuses.spaceDamageMultiplier || 1) + 0.50;
                        turret.specialBonuses.spacePassThroughDamage = true;
                    }
                }
            ],
            SHOTGUN: [
                {
                    id: 'shotgun_count',
                    name: '弹幕扩散',
                    description: '子弹数量 +3，散射角度 +20度',
                    color: '#f9ed69',
                    weaponType: 'SHOTGUN',
                    apply: (turret) => {
                        if (!turret.specialBonuses) turret.specialBonuses = {};
                        turret.specialBonuses.extraBulletCount = (turret.specialBonuses.extraBulletCount || 0) + 3;
                        turret.specialBonuses.extraSpreadAngle = (turret.specialBonuses.extraSpreadAngle || 0) + 20;
                    }
                },
                {
                    id: 'shotgun_close_range',
                    name: '近距离爆发',
                    description: '近距离（150以内）伤害 +60%，距离越近伤害越高',
                    color: '#fff3b0',
                    weaponType: 'SHOTGUN',
                    apply: (turret) => {
                        if (!turret.specialBonuses) turret.specialBonuses = {};
                        turret.specialBonuses.closeRangeBonus = true;
                        turret.specialBonuses.closeRangeDamageBonus = (turret.specialBonuses.closeRangeDamageBonus || 0) + 0.60;
                    }
                }
            ]
        };
    }
    
    reset() {
        this.selectedUpgrades = [];
        this.upgradeCounter = 0;
        
        this.globalBonuses = {
            damageBonus: 1,
            attackSpeedBonus: 1,
            eliteTankDamageBonus: 1,
            scoreBonus: 1,
            durationBonus: 1,
            armorReduction: 0
        };
        
        this.knockbackEnabled = false;
        this.comboStacking = { enabled: false, stacks: 0, lastHitTime: 0 };
        this.overcharge = { enabled: false, attackCount: 0 };
        
        this.turretBonuses = {};
    }
    
    generateUpgradeOptions(activeWeaponTypes) {
        const options = [];
        
        const generalOption = this.getRandomGeneralUpgrade();
        if (generalOption) {
            options.push({ ...generalOption, category: 'general' });
        }
        
        const specificOptions = this.getRandomSpecificUpgrades(activeWeaponTypes, 2);
        specificOptions.forEach(opt => {
            options.push({ ...opt, category: 'specific' });
        });
        
        return options.sort(() => Math.random() - 0.5);
    }
    
    getRandomGeneralUpgrade() {
        const available = this.generalUpgrades.filter(upgrade => {
            const currentBonus = upgrade.getCurrentBonus(this.globalBonuses);
            return currentBonus < upgrade.maxValue;
        });
        
        if (available.length === 0) return null;
        
        return available[Math.floor(Math.random() * available.length)];
    }
    
    getRandomSpecificUpgrades(activeWeaponTypes, count) {
        const result = [];
        const availableWeapons = activeWeaponTypes.length > 0 ? activeWeaponTypes : ['FIRE'];
        
        for (let i = 0; i < count; i++) {
            const weaponType = availableWeapons[Math.floor(Math.random() * availableWeapons.length)];
            const upgrades = this.weaponSpecificUpgrades[weaponType] || [];
            
            if (upgrades.length > 0) {
                const upgrade = upgrades[Math.floor(Math.random() * upgrades.length)];
                result.push({ ...upgrade, weaponType });
            }
        }
        
        return result;
    }
    
    selectUpgrade(upgrade, activeTurrets) {
        this.selectedUpgrades.push({
            ...upgrade,
            selectedAt: this.upgradeCounter
        });
        this.upgradeCounter++;
        
        if (upgrade.category === 'general' || upgrade.type) {
            const generalUpgrade = this.generalUpgrades.find(u => u.id === upgrade.id);
            if (generalUpgrade) {
                this.globalBonuses = generalUpgrade.apply(this.globalBonuses, generalUpgrade.value);
            }
        }
        
        if (upgrade.weaponType && activeTurrets) {
            activeTurrets.forEach(turret => {
                if (turret.weaponType === upgrade.weaponType && upgrade.apply) {
                    upgrade.apply(turret);
                }
            });
        }
        
        return true;
    }
    
    getEffectiveDamage(baseDamage, targetEnemy = null, distance = 0, turret = null) {
        let damage = baseDamage * this.globalBonuses.damageBonus;
        
        if (this.globalBonuses.eliteTankDamageBonus > 1 && targetEnemy) {
            if (targetEnemy.isElite || targetEnemy.isTank) {
                damage *= this.globalBonuses.eliteTankDamageBonus;
            }
        }
        
        if (this.comboStacking.enabled) {
            const now = performance.now();
            if (now - this.comboStacking.lastHitTime < 2000) {
                this.comboStacking.stacks = Math.min(10, this.comboStacking.stacks + 1);
            } else {
                this.comboStacking.stacks = 1;
            }
            this.comboStacking.lastHitTime = now;
            damage *= (1 + this.comboStacking.stacks * 0.03);
        }
        
        if (turret && turret.specialBonuses) {
            if (turret.weaponType === 'PIERCE' && turret.specialBonuses.longRangeBonus && distance > 200) {
                damage *= (1 + turret.specialBonuses.longRangeDamageBonus);
            }
            
            if (turret.weaponType === 'SHOTGUN' && turret.specialBonuses.closeRangeBonus && distance < 150) {
                const closeBonus = 1 + turret.specialBonuses.closeRangeDamageBonus * (1 - distance / 150);
                damage *= closeBonus;
            }
        }
        
        return damage;
    }
    
    getEffectiveAttackSpeed(baseAttackSpeed) {
        return baseAttackSpeed / this.globalBonuses.attackSpeedBonus;
    }
    
    getEffectiveDuration(baseDuration) {
        return baseDuration * this.globalBonuses.durationBonus;
    }
    
    getScoreMultiplier() {
        return this.globalBonuses.scoreBonus;
    }
    
    shouldApplyOvercharge() {
        if (!this.overcharge.enabled) return false;
        return this.overcharge.attackCount >= 10;
    }
    
    incrementAttackCount() {
        if (this.overcharge.enabled) {
            this.overcharge.attackCount++;
            if (this.overcharge.attackCount > 10) {
                this.overcharge.attackCount = 1;
            }
        }
    }
    
    resetOvercharge() {
        this.overcharge.attackCount = 0;
    }
    
    applyKnockback(enemy, distance = 10, pauseDuration = 200) {
        if (!this.knockbackEnabled) return false;
        if (enemy.isElite || enemy.isTank) return false;
        
        if (enemy.applyKnockback) {
            return enemy.applyKnockback(distance, pauseDuration);
        }
        
        enemy.y = Math.max(-50, enemy.y - distance);
        return true;
    }
    
    applyArmorReduction(enemy) {
        if (this.globalBonuses.armorReduction <= 0) return 0;
        
        if (!enemy.armorReduction) {
            enemy.armorReduction = 0;
            enemy.armorReductionUntil = 0;
        }
        
        const now = performance.now();
        if (now > enemy.armorReductionUntil) {
            enemy.armorReduction = 0;
        }
        
        enemy.armorReduction = Math.min(this.globalBonuses.armorReduction, enemy.armorReduction + 5);
        enemy.armorReductionUntil = now + 3000;
        
        return enemy.armorReduction;
    }
    
    getState() {
        return {
            selectedUpgrades: [...this.selectedUpgrades],
            upgradeCounter: this.upgradeCounter,
            globalBonuses: { ...this.globalBonuses },
            knockbackEnabled: this.knockbackEnabled,
            comboStacking: { ...this.comboStacking },
            overcharge: { ...this.overcharge }
        };
    }
    
    loadState(state) {
        if (!state) return;
        
        this.selectedUpgrades = state.selectedUpgrades || [];
        this.upgradeCounter = state.upgradeCounter || 0;
        this.globalBonuses = { ...(state.globalBonuses || this.globalBonuses) };
        this.knockbackEnabled = state.knockbackEnabled || false;
        this.comboStacking = { ...(state.comboStacking || this.comboStacking) };
        this.overcharge = { ...(state.overcharge || this.overcharge) };
    }
}

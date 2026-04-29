// ============================================
// 塔防系统 - 升级系统模块
// ============================================
// 颜色流派式升级系统
// 六个流派：火焰爆发流、雷电AOE流、冰霜控制流、穿甲秒杀流、空间切割流、绿色毒液流
// ============================================

const COLOR_FACTIONS = {
    FIRE: {
        id: 'FIRE',
        name: '火焰爆发流',
        color: '#e94560',
        borderColor: '#ff6b7a',
        glowColor: 'rgba(233, 69, 96, 0.5)',
        description: '主打红色方块消除，靠持续灼烧磨死敌人，适合稳扎稳打',
        blockColor: 'RED',
        weaponType: 'FIRE'
    },
    SHOTGUN: {
        id: 'SHOTGUN',
        name: '雷电AOE流',
        color: '#f9ed69',
        borderColor: '#fff5a5',
        glowColor: 'rgba(249, 237, 105, 0.5)',
        description: '主打黄色方块消除，靠大范围闪电清场，适合应对群怪波次',
        blockColor: 'YELLOW',
        weaponType: 'SHOTGUN'
    },
    ICE: {
        id: 'ICE',
        name: '冰霜控制流',
        color: '#0f3460',
        borderColor: '#00d9ff',
        glowColor: 'rgba(0, 217, 255, 0.5)',
        description: '主打蓝色方块消除，靠控制拖慢敌人，给炮塔更多输出时间',
        blockColor: 'BLUE',
        weaponType: 'ICE'
    },
    PIERCE: {
        id: 'PIERCE',
        name: '穿甲秒杀流',
        color: '#ff8c00',
        borderColor: '#ffaa4d',
        glowColor: 'rgba(255, 140, 0, 0.5)',
        description: '主打橙色方块消除，专门克制高护甲/高血量精英怪/重装怪和BOSS',
        blockColor: 'ORANGE',
        weaponType: 'PIERCE'
    },
    SPACE: {
        id: 'SPACE',
        name: '空间切割流',
        color: '#a66cff',
        borderColor: '#c9a6ff',
        glowColor: 'rgba(166, 108, 255, 0.5)',
        description: '主打紫色方块消除，应对大量敌人组成的怪潮',
        blockColor: 'PURPLE',
        weaponType: 'SPACE'
    },
    POISON: {
        id: 'POISON',
        name: '绿色毒液流',
        color: '#4ecca3',
        borderColor: '#7ee8c7',
        glowColor: 'rgba(78, 204, 163, 0.5)',
        description: '主打绿色方块消除，给大范围内的敌人上debuff，高难度必备',
        blockColor: 'GREEN',
        weaponType: 'POISON'
    }
};

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
        
        this.factionBonuses = {
            FIRE: { burnDamageMultiplier: 1, redClearExtraDamage: 0, dotStackingEnabled: false },
            SHOTGUN: { chainLightningEnabled: false, yellowClearRangeBoost: 0, aoeNoReduction: false },
            ICE: { slowPercentBonus: 0, blueClearFreezeEnabled: false, freezeDurationMultiplier: 1 },
            PIERCE: { armorPierceBonus: 0, orangeClearIgnoreArmor: false, bossDamageMultiplier: 1 },
            SPACE: { blockCountBonus: 0, purpleClearBlockEnabled: false, blockDamageMultiplier: 1 },
            POISON: { armorReductionPerTick: 0, greenClearAoeDebuff: false, poisonDamageMultiplier: 1 }
        };
        
        this.colorClearBonuses = {
            RED: { extraDamage: 0, enabled: false },
            YELLOW: { rangeBoost: 0, enabled: false },
            BLUE: { freezeOnClear: false, enabled: false },
            ORANGE: { ignoreArmor: false, enabled: false },
            PURPLE: { blockOnClear: false, enabled: false },
            GREEN: { aoeDebuffOnClear: false, enabled: false }
        };
        
        this.initFactionUpgradePools();
    }
    
    initFactionUpgradePools() {
        this.factionUpgrades = {
            FIRE: [
                {
                    id: 'fire_burn_boost',
                    faction: 'FIRE',
                    tier: 1,
                    name: '灼烧效果强化',
                    description: '灼烧伤害 +40%，灼烧时间延长 1.5 秒',
                    color: COLOR_FACTIONS.FIRE.color,
                    borderColor: COLOR_FACTIONS.FIRE.borderColor,
                    factionName: COLOR_FACTIONS.FIRE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.FIRE.burnDamageMultiplier += 0.40;
                    }
                },
                {
                    id: 'fire_red_clear_damage',
                    faction: 'FIRE',
                    tier: 2,
                    name: '红色消除-造成额外伤害',
                    description: '每次消除红色方块时，对敌人造成额外基础伤害的 30%',
                    color: COLOR_FACTIONS.FIRE.color,
                    borderColor: COLOR_FACTIONS.FIRE.borderColor,
                    factionName: COLOR_FACTIONS.FIRE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.FIRE.redClearExtraDamage += 0.30;
                        bonuses.colorClearBonuses.RED.enabled = true;
                        bonuses.colorClearBonuses.RED.extraDamage += 0.30;
                    }
                },
                {
                    id: 'fire_dot_stacking',
                    faction: 'FIRE',
                    tier: 3,
                    name: 'DOT 伤害叠加',
                    description: '多次攻击同一目标时，灼烧伤害可叠加，每层 +20% 伤害，最多叠加 5 层',
                    color: COLOR_FACTIONS.FIRE.color,
                    borderColor: COLOR_FACTIONS.FIRE.borderColor,
                    factionName: COLOR_FACTIONS.FIRE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.FIRE.dotStackingEnabled = true;
                    }
                }
            ],
            
            SHOTGUN: [
                {
                    id: 'lightning_chain',
                    faction: 'SHOTGUN',
                    tier: 1,
                    name: '电流扩散',
                    description: '攻击有 30% 几率触发连锁闪电，跳跃攻击周围 2 个敌人',
                    color: COLOR_FACTIONS.SHOTGUN.color,
                    borderColor: COLOR_FACTIONS.SHOTGUN.borderColor,
                    factionName: COLOR_FACTIONS.SHOTGUN.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SHOTGUN.chainLightningEnabled = true;
                    }
                },
                {
                    id: 'yellow_clear_range',
                    faction: 'SHOTGUN',
                    tier: 2,
                    name: '黄色消除-攻击范围扩大',
                    description: '每次消除黄色方块时，所有炮塔攻击范围临时 +25%，持续 5 秒',
                    color: COLOR_FACTIONS.SHOTGUN.color,
                    borderColor: COLOR_FACTIONS.SHOTGUN.borderColor,
                    factionName: COLOR_FACTIONS.SHOTGUN.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SHOTGUN.yellowClearRangeBoost += 0.25;
                        bonuses.colorClearBonuses.YELLOW.enabled = true;
                        bonuses.colorClearBonuses.YELLOW.rangeBoost += 0.25;
                    }
                },
                {
                    id: 'aoe_no_reduction',
                    faction: 'SHOTGUN',
                    tier: 3,
                    name: 'AOE 伤害无衰减',
                    description: 'AOE 伤害不再随距离衰减，所有范围内敌人受到完整伤害',
                    color: COLOR_FACTIONS.SHOTGUN.color,
                    borderColor: COLOR_FACTIONS.SHOTGUN.borderColor,
                    factionName: COLOR_FACTIONS.SHOTGUN.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SHOTGUN.aoeNoReduction = true;
                    }
                }
            ],
            
            ICE: [
                {
                    id: 'ice_slow_boost',
                    faction: 'ICE',
                    tier: 1,
                    name: '减速效果强化',
                    description: '减速效果 +30%，敌人移动速度额外降低',
                    color: COLOR_FACTIONS.ICE.color,
                    borderColor: COLOR_FACTIONS.ICE.borderColor,
                    factionName: COLOR_FACTIONS.ICE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.ICE.slowPercentBonus += 0.30;
                    }
                },
                {
                    id: 'blue_clear_freeze',
                    faction: 'ICE',
                    tier: 2,
                    name: '蓝色消除-冰冻敌人',
                    description: '每次消除蓝色方块时，随机冰冻屏幕上 2 个敌人，持续 2 秒',
                    color: COLOR_FACTIONS.ICE.color,
                    borderColor: COLOR_FACTIONS.ICE.borderColor,
                    factionName: COLOR_FACTIONS.ICE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.ICE.blueClearFreezeEnabled = true;
                        bonuses.colorClearBonuses.BLUE.enabled = true;
                        bonuses.colorClearBonuses.BLUE.freezeOnClear = true;
                    }
                },
                {
                    id: 'control_duration_extend',
                    faction: 'ICE',
                    tier: 3,
                    name: '控制持续时间延长',
                    description: '所有冰冻、减速效果持续时间 +50%',
                    color: COLOR_FACTIONS.ICE.color,
                    borderColor: COLOR_FACTIONS.ICE.borderColor,
                    factionName: COLOR_FACTIONS.ICE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.ICE.freezeDurationMultiplier += 0.50;
                        bonuses.globalBonuses.durationBonus += 0.50;
                    }
                }
            ],
            
            PIERCE: [
                {
                    id: 'pierce_armor_boost',
                    faction: 'PIERCE',
                    tier: 1,
                    name: '穿甲强化',
                    description: '无视敌人 20% 的护甲值，对高护甲敌人更有效',
                    color: COLOR_FACTIONS.PIERCE.color,
                    borderColor: COLOR_FACTIONS.PIERCE.borderColor,
                    factionName: COLOR_FACTIONS.PIERCE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.PIERCE.armorPierceBonus += 0.20;
                    }
                },
                {
                    id: 'orange_clear_ignore_armor',
                    faction: 'PIERCE',
                    tier: 2,
                    name: '橙色消除-无视护甲防御',
                    description: '每次消除橙色方块时，接下来的 3 次攻击完全无视敌人护甲',
                    color: COLOR_FACTIONS.PIERCE.color,
                    borderColor: COLOR_FACTIONS.PIERCE.borderColor,
                    factionName: COLOR_FACTIONS.PIERCE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.PIERCE.orangeClearIgnoreArmor = true;
                        bonuses.colorClearBonuses.ORANGE.enabled = true;
                        bonuses.colorClearBonuses.ORANGE.ignoreArmor = true;
                    }
                },
                {
                    id: 'boss_damage_double',
                    faction: 'PIERCE',
                    tier: 3,
                    name: '对 BOSS 伤害翻倍',
                    description: '对精英敌人和重装敌人造成的伤害 +100%',
                    color: COLOR_FACTIONS.PIERCE.color,
                    borderColor: COLOR_FACTIONS.PIERCE.borderColor,
                    factionName: COLOR_FACTIONS.PIERCE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.PIERCE.bossDamageMultiplier += 1.0;
                        bonuses.globalBonuses.eliteTankDamageBonus += 1.0;
                    }
                }
            ],
            
            SPACE: [
                {
                    id: 'space_block_boost',
                    faction: 'SPACE',
                    tier: 1,
                    name: '阻拦强化',
                    description: '空间标线可阻拦的敌人数量 +2，阻拦持续时间 +1 秒',
                    color: COLOR_FACTIONS.SPACE.color,
                    borderColor: COLOR_FACTIONS.SPACE.borderColor,
                    factionName: COLOR_FACTIONS.SPACE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SPACE.blockCountBonus += 2;
                        bonuses.globalBonuses.durationBonus += 0.30;
                    }
                },
                {
                    id: 'purple_clear_block',
                    faction: 'SPACE',
                    tier: 2,
                    name: '紫色消除-阻拦前进',
                    description: '每次消除紫色方块时，在敌人前进路径上生成一道临时阻拦线',
                    color: COLOR_FACTIONS.SPACE.color,
                    borderColor: COLOR_FACTIONS.SPACE.borderColor,
                    factionName: COLOR_FACTIONS.SPACE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SPACE.purpleClearBlockEnabled = true;
                        bonuses.colorClearBonuses.PURPLE.enabled = true;
                        bonuses.colorClearBonuses.PURPLE.blockOnClear = true;
                    }
                },
                {
                    id: 'space_block_damage',
                    faction: 'SPACE',
                    tier: 3,
                    name: '阻拦敌人前进同时造成中等伤害',
                    description: '被空间标线阻拦的敌人每秒受到基础伤害的 60%',
                    color: COLOR_FACTIONS.SPACE.color,
                    borderColor: COLOR_FACTIONS.SPACE.borderColor,
                    factionName: COLOR_FACTIONS.SPACE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SPACE.blockDamageMultiplier += 0.60;
                    }
                }
            ],
            
            POISON: [
                {
                    id: 'poison_armor_reduction',
                    faction: 'POISON',
                    tier: 1,
                    name: '护甲削减',
                    description: '中毒敌人每秒额外降低 3 点护甲，最多降低 15 点',
                    color: COLOR_FACTIONS.POISON.color,
                    borderColor: COLOR_FACTIONS.POISON.borderColor,
                    factionName: COLOR_FACTIONS.POISON.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.POISON.armorReductionPerTick += 3;
                        bonuses.globalBonuses.armorReduction += 3;
                    }
                },
                {
                    id: 'green_clear_aoe_debuff',
                    faction: 'POISON',
                    tier: 2,
                    name: '绿色消除-大面积debuff',
                    description: '每次消除绿色方块时，给大范围内敌人施加中毒和减速效果',
                    color: COLOR_FACTIONS.POISON.color,
                    borderColor: COLOR_FACTIONS.POISON.borderColor,
                    factionName: COLOR_FACTIONS.POISON.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.POISON.greenClearAoeDebuff = true;
                        bonuses.colorClearBonuses.GREEN.enabled = true;
                        bonuses.colorClearBonuses.GREEN.aoeDebuffOnClear = true;
                    }
                },
                {
                    id: 'poison_damage_boost',
                    faction: 'POISON',
                    tier: 3,
                    name: '大面积缓慢掉血并削弱防御力',
                    description: '中毒伤害 +50%，中毒范围 +30%，护甲削弱效果翻倍',
                    color: COLOR_FACTIONS.POISON.color,
                    borderColor: COLOR_FACTIONS.POISON.borderColor,
                    factionName: COLOR_FACTIONS.POISON.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.POISON.poisonDamageMultiplier += 0.50;
                    }
                }
            ]
        };
        
        this.generalUpgrades = [
            {
                id: 'damage_boost',
                faction: 'GENERAL',
                name: '铁血强化',
                description: '全局基础伤害 +15%',
                color: '#e94560',
                borderColor: '#ff6b7a',
                factionName: '通用',
                type: 'damage',
                value: 0.15,
                maxValue: 0.80,
                apply: (bonuses, value) => {
                    const newBonus = bonuses.globalBonuses.damageBonus + value;
                    bonuses.globalBonuses.damageBonus = Math.min(newBonus, 1 + 0.80);
                },
                getCurrentBonus: (bonuses) => bonuses.globalBonuses.damageBonus - 1
            },
            {
                id: 'attack_speed',
                faction: 'GENERAL',
                name: '高速装填',
                description: '攻击间隔 -12%（攻速提升）',
                color: '#ff8c00',
                borderColor: '#ffaa4d',
                factionName: '通用',
                type: 'attackSpeed',
                value: 0.12,
                maxValue: 0.80,
                apply: (bonuses, value) => {
                    const newBonus = bonuses.globalBonuses.attackSpeedBonus * (1 + value / (1 - value));
                    bonuses.globalBonuses.attackSpeedBonus = Math.min(newBonus, 1 + 0.80);
                },
                getCurrentBonus: (bonuses) => (bonuses.globalBonuses.attackSpeedBonus - 1)
            },
            {
                id: 'score_boost',
                faction: 'GENERAL',
                name: '高效回收',
                description: '方块消除额外获得5%得分，击杀敌人额外获得 10% 得分',
                color: '#4ecca3',
                borderColor: '#7ee8c7',
                factionName: '通用',
                type: 'score',
                value: 0.10,
                maxValue: 1.0,
                apply: (bonuses, value) => {
                    bonuses.globalBonuses.scoreBonus += value;
                },
                getCurrentBonus: (bonuses) => bonuses.globalBonuses.scoreBonus - 1
            }
        ];
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
        
        this.factionBonuses = {
            FIRE: { burnDamageMultiplier: 1, redClearExtraDamage: 0, dotStackingEnabled: false },
            SHOTGUN: { chainLightningEnabled: false, yellowClearRangeBoost: 0, aoeNoReduction: false },
            ICE: { slowPercentBonus: 0, blueClearFreezeEnabled: false, freezeDurationMultiplier: 1 },
            PIERCE: { armorPierceBonus: 0, orangeClearIgnoreArmor: false, bossDamageMultiplier: 1 },
            SPACE: { blockCountBonus: 0, purpleClearBlockEnabled: false, blockDamageMultiplier: 1 },
            POISON: { armorReductionPerTick: 0, greenClearAoeDebuff: false, poisonDamageMultiplier: 1 }
        };
        
        this.colorClearBonuses = {
            RED: { extraDamage: 0, enabled: false },
            YELLOW: { rangeBoost: 0, enabled: false },
            BLUE: { freezeOnClear: false, enabled: false },
            ORANGE: { ignoreArmor: false, enabled: false },
            PURPLE: { blockOnClear: false, enabled: false },
            GREEN: { aoeDebuffOnClear: false, enabled: false }
        };
    }
    
    getAvailableFactions(activeWeaponTypes) {
        const availableFactions = [];
        const factions = Object.keys(COLOR_FACTIONS);
        
        factions.forEach(factionId => {
            const faction = COLOR_FACTIONS[factionId];
            if (activeWeaponTypes.includes(faction.weaponType)) {
                availableFactions.push(factionId);
            }
        });
        
        return availableFactions;
    }
    
    generateUpgradeOptions(activeWeaponTypes) {
        const options = [];
        const availableFactions = this.getAvailableFactions(activeWeaponTypes);
        
        const shuffledFactions = [...availableFactions].sort(() => Math.random() - 0.5);
        
        let optionsSelected = 0;
        const maxOptions = 3;
        
        for (const factionId of shuffledFactions) {
            if (optionsSelected >= maxOptions) break;
            
            const availableUpgrades = this.getAvailableFactionUpgrades(factionId);
            if (availableUpgrades.length > 0) {
                const upgrade = availableUpgrades[Math.floor(Math.random() * availableUpgrades.length)];
                options.push({ ...upgrade, category: 'faction', factionId });
                optionsSelected++;
            }
        }
        
        if (options.length < maxOptions) {
            const generalOption = this.getRandomGeneralUpgrade();
            if (generalOption && options.length < maxOptions) {
                options.push({ ...generalOption, category: 'general', factionId: 'GENERAL' });
            }
        }
        
        if (options.length < maxOptions && availableFactions.length > 0) {
            for (const factionId of shuffledFactions) {
                if (options.length >= maxOptions) break;
                
                const upgrades = this.factionUpgrades[factionId] || [];
                const unselectedUpgrades = upgrades.filter(u => 
                    !this.selectedUpgrades.some(s => s.id === u.id)
                );
                
                if (unselectedUpgrades.length > 0) {
                    const upgrade = unselectedUpgrades[Math.floor(Math.random() * unselectedUpgrades.length)];
                    options.push({ ...upgrade, category: 'faction', factionId });
                }
            }
        }
        
        return options.sort(() => Math.random() - 0.5);
    }
    
    getAvailableFactionUpgrades(factionId) {
        const upgrades = this.factionUpgrades[factionId] || [];
        const selectedIds = this.selectedUpgrades.map(u => u.id);
        
        return upgrades.filter(upgrade => !selectedIds.includes(upgrade.id));
    }
    
    getRandomGeneralUpgrade() {
        const available = this.generalUpgrades.filter(upgrade => {
            if (upgrade.getCurrentBonus) {
                const currentBonus = upgrade.getCurrentBonus(this);
                return currentBonus < upgrade.maxValue;
            }
            return true;
        });
        
        if (available.length === 0) return null;
        
        return available[Math.floor(Math.random() * available.length)];
    }
    
    selectUpgrade(upgrade, activeTurrets) {
        this.selectedUpgrades.push({
            ...upgrade,
            selectedAt: this.upgradeCounter
        });
        this.upgradeCounter++;
        
        if (upgrade.apply) {
            if (upgrade.category === 'faction' && upgrade.factionId && upgrade.factionId !== 'GENERAL') {
                upgrade.apply(this);
            } else if (upgrade.category === 'general') {
                if (upgrade.apply) {
                    upgrade.apply(this, upgrade.value);
                }
            }
        }
        
        if (activeTurrets && upgrade.factionId && upgrade.factionId !== 'GENERAL') {
            const faction = COLOR_FACTIONS[upgrade.factionId];
            if (faction) {
                activeTurrets.forEach(turret => {
                    if (turret.weaponType === faction.weaponType) {
                        this.applyFactionUpgradeToTurret(turret, upgrade);
                    }
                });
            }
        }
        
        return true;
    }
    
    applyFactionUpgradeToTurret(turret, upgrade) {
        if (!turret.specialBonuses) {
            turret.specialBonuses = {};
        }
        
        const factionId = upgrade.factionId;
        
        switch (factionId) {
            case 'FIRE':
                if (upgrade.id === 'fire_burn_boost') {
                    turret.specialBonuses.burnEnabled = true;
                    turret.specialBonuses.burnDamagePercent = (turret.specialBonuses.burnDamagePercent || 0.30) + 0.40;
                }
                break;
                
            case 'SHOTGUN':
                if (upgrade.id === 'lightning_chain') {
                    turret.specialBonuses.chainLightningEnabled = true;
                }
                if (upgrade.id === 'aoe_no_reduction') {
                    turret.specialBonuses.aoeDamageReduction = 0;
                }
                break;
                
            case 'ICE':
                if (upgrade.id === 'ice_slow_boost') {
                    turret.specialBonuses.slowPercentBonus = (turret.specialBonuses.slowPercentBonus || 0) + 0.30;
                }
                if (upgrade.id === 'control_duration_extend') {
                    turret.specialBonuses.freezeDurationMultiplier = (turret.specialBonuses.freezeDurationMultiplier || 1) + 0.50;
                }
                break;
                
            case 'PIERCE':
                if (upgrade.id === 'pierce_armor_boost') {
                    turret.specialBonuses.armorPierceBonus = (turret.specialBonuses.armorPierceBonus || 0) + 0.20;
                }
                if (upgrade.id === 'boss_damage_double') {
                    turret.specialBonuses.eliteDamageMultiplier = (turret.specialBonuses.eliteDamageMultiplier || 1) + 1.0;
                }
                break;
                
            case 'SPACE':
                if (upgrade.id === 'space_block_boost') {
                    turret.specialBonuses.extraBlockCount = (turret.specialBonuses.extraBlockCount || 0) + 2;
                }
                if (upgrade.id === 'space_block_damage') {
                    turret.specialBonuses.spaceDamageMultiplier = (turret.specialBonuses.spaceDamageMultiplier || 1) + 0.60;
                }
                break;
                
            case 'POISON':
                if (upgrade.id === 'poison_armor_reduction') {
                    turret.specialBonuses.armorReductionPerTick = (turret.specialBonuses.armorReductionPerTick || 0) + 3;
                }
                if (upgrade.id === 'poison_damage_boost') {
                    turret.specialBonuses.poisonDamageMultiplier = (turret.specialBonuses.poisonDamageMultiplier || 1) + 0.50;
                }
                break;
        }
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
                damage *= (1 + (turret.specialBonuses.longRangeDamageBonus || 0));
            }
            
            if (turret.weaponType === 'SHOTGUN' && turret.specialBonuses.closeRangeBonus && distance < 150) {
                const closeBonus = 1 + (turret.specialBonuses.closeRangeDamageBonus || 0) * (1 - distance / 150);
                damage *= closeBonus;
            }
            
            if (turret.specialBonuses.eliteDamageMultiplier && targetEnemy) {
                if (targetEnemy.isElite || targetEnemy.isTank) {
                    damage *= turret.specialBonuses.eliteDamageMultiplier;
                }
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
    
    getFactionBonus(factionId) {
        return this.factionBonuses[factionId] || {};
    }
    
    getColorClearBonus(color) {
        return this.colorClearBonuses[color] || {};
    }
    
    getState() {
        return {
            selectedUpgrades: [...this.selectedUpgrades],
            upgradeCounter: this.upgradeCounter,
            globalBonuses: { ...this.globalBonuses },
            factionBonuses: JSON.parse(JSON.stringify(this.factionBonuses)),
            colorClearBonuses: JSON.parse(JSON.stringify(this.colorClearBonuses)),
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
        this.factionBonuses = state.factionBonuses ? JSON.parse(JSON.stringify(state.factionBonuses)) : this.factionBonuses;
        this.colorClearBonuses = state.colorClearBonuses ? JSON.parse(JSON.stringify(state.colorClearBonuses)) : this.colorClearBonuses;
        this.knockbackEnabled = state.knockbackEnabled || false;
        this.comboStacking = { ...(state.comboStacking || this.comboStacking) };
        this.overcharge = { ...(state.overcharge || this.overcharge) };
    }
}

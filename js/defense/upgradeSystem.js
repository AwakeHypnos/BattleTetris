// ============================================
// 塔防系统 - 升级系统模块
// ============================================
// 颜色流派式升级系统
// 六个流派：火焰爆发流、闪电炮台流、冰霜控制流、穿甲秒杀流、空间切割流、绿色毒液流
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
        name: '闪电炮台流',
        color: '#f9ed69',
        borderColor: '#fff5a5',
        glowColor: 'rgba(249, 237, 105, 0.5)',
        description: '主打黄色方块消除，中近距离爆发、散射链接、贴脸压制',
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
            FIRE: {
                burnDamageMultiplier: 1,
                redClearExtraDamage: 0,
                dotStackingEnabled: false,
                explosionRadiusBonus: 0,
                groundBurnEnabled: false,
                killExplosionEnabled: false,
                aoeCenterBonus: 0,
                aoeEdgeReduction: 0,
                spreadFireEnabled: false,
                burnArmorReduction: 0,
                instantExplosionEnabled: false,
                igniteChanceBonus: 0,
                burnDurationBonus: 0,
                chainExplosionEnabled: false,
                chainExplosionCount: 0,
                aoeBurnEnabled: false
            },
            SHOTGUN: {
                chainLightningEnabled: false,
                yellowClearRangeBoost: 0,
                aoeNoReduction: false,
                bulletCountBonus: 0,
                spreadAngleReduction: 0,
                splitLightningEnabled: false,
                closeRangeBonus: 0,
                centerDamageBonus: 0,
                edgeDamageReduction: 0,
                attackSpeedBonus: 0,
                pierceEnabled: false,
                pierceDamagePercent: 0,
                knockbackEnabled: false
            },
            ICE: {
                slowPercentBonus: 0,
                blueClearFreezeEnabled: false,
                freezeDurationMultiplier: 1,
                freezeDurationBonus: 0,
                frostFieldEnabled: false,
                shatterDamageEnabled: false,
                slowIncreaseEnabled: false,
                freezeSpreadEnabled: false,
                frozenArmorBonus: 0,
                fastFreezeEnabled: false,
                frozenDamageTakenBonus: 0,
                frostAuraEnabled: false
            },
            PIERCE: {
                armorPierceBonus: 0,
                orangeClearIgnoreArmor: false,
                bossDamageMultiplier: 1,
                pierceCountBonus: 0,
                pierceDamageIncrease: 0,
                pierceIgnoreBlock: false,
                bleedEnabled: false,
                longRangeBonus: 0,
                splitOnLastPierce: false,
                weakPointCritEnabled: false,
                damageNoDecay: false,
                pierceSlowEnabled: false
            },
            SPACE: {
                blockCountBonus: 0,
                purpleClearBlockEnabled: false,
                blockDamageMultiplier: 1,
                lineWidthBonus: 0,
                durationBonus: 0,
                lineBleedEnabled: false,
                phaseLockEnabled: false,
                extraLineEnabled: false,
                lineSlowEnabled: false,
                collapseDamageEnabled: false,
                blockProjectiles: false,
                cooldownSlowEnabled: false
            },
            POISON: {
                armorReductionPerTick: 0,
                greenClearAoeDebuff: false,
                poisonDamageMultiplier: 1,
                poisonTickDamageBonus: 0,
                deathPuddleEnabled: false,
                poisonDoubleSlow: false,
                multiPoisonStack: false,
                ignoreHeal: false,
                longRangePoisonBonus: 0,
                lowHPDoubleDamage: false,
                poisonAuraEnabled: false,
                poisonDurationMultiplier: 1
            }
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
                    tier: 1,
                    name: '红色消除-造成额外伤害',
                    description: '每次消除红色方块时，对随机两个敌人造成基础攻击力 20% 的一次性伤害',
                    color: COLOR_FACTIONS.FIRE.color,
                    borderColor: COLOR_FACTIONS.FIRE.borderColor,
                    factionName: COLOR_FACTIONS.FIRE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.FIRE.redClearExtraDamage += 0.20;
                        bonuses.colorClearBonuses.RED.enabled = true;
                        bonuses.colorClearBonuses.RED.extraDamage += 0.20;
                    }
                },
                {
                    id: 'fire_dot_stacking',
                    faction: 'FIRE',
                    tier: 1,
                    name: 'DOT 伤害叠加',
                    description: '多次攻击同一目标时，灼烧伤害可叠加，每层 +20% 伤害，最多叠加 5 层',
                    color: COLOR_FACTIONS.FIRE.color,
                    borderColor: COLOR_FACTIONS.FIRE.borderColor,
                    factionName: COLOR_FACTIONS.FIRE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.FIRE.dotStackingEnabled = true;
                    }
                },
                {
                    id: 'fire_ground_burn',
                    faction: 'FIRE',
                    tier: 2,
                    name: '炽热烈焰',
                    description: '爆炸范围额外扩大 +20%，残留地面灼烧区域持续 3 秒',
                    color: COLOR_FACTIONS.FIRE.color,
                    borderColor: COLOR_FACTIONS.FIRE.borderColor,
                    factionName: COLOR_FACTIONS.FIRE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.FIRE.explosionRadiusBonus += 0.20;
                        bonuses.factionBonuses.FIRE.groundBurnEnabled = true;
                    }
                },
                {
                    id: 'fire_kill_explosion',
                    faction: 'FIRE',
                    tier: 2,
                    name: '燃烬引爆',
                    description: '灼烧状态敌人被击杀时触发二次小型爆炸，造成基础伤害 50% 的范围伤害',
                    color: COLOR_FACTIONS.FIRE.color,
                    borderColor: COLOR_FACTIONS.FIRE.borderColor,
                    factionName: COLOR_FACTIONS.FIRE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.FIRE.killExplosionEnabled = true;
                    }
                },
                {
                    id: 'fire_aoe_center_boost',
                    faction: 'FIRE',
                    tier: 2,
                    name: '过载爆燃',
                    description: 'AOE 中心伤害提升 30%，边缘伤害小幅降低 10%',
                    color: COLOR_FACTIONS.FIRE.color,
                    borderColor: COLOR_FACTIONS.FIRE.borderColor,
                    factionName: COLOR_FACTIONS.FIRE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.FIRE.aoeCenterBonus += 0.30;
                        bonuses.factionBonuses.FIRE.aoeEdgeReduction += 0.10;
                    }
                },
                {
                    id: 'fire_spread_fire',
                    faction: 'FIRE',
                    tier: 3,
                    name: '余火蔓延',
                    description: '爆炸命中敌人后，向周围扩散小型燃烧，每个被爆炸命中的敌人有 30% 几率点燃周围敌人',
                    color: COLOR_FACTIONS.FIRE.color,
                    borderColor: COLOR_FACTIONS.FIRE.borderColor,
                    factionName: COLOR_FACTIONS.FIRE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.FIRE.spreadFireEnabled = true;
                    }
                },
                {
                    id: 'fire_armor_reduction',
                    faction: 'FIRE',
                    tier: 3,
                    name: '熔甲爆破',
                    description: '燃烧期间敌人护甲大幅降低 -15%',
                    color: COLOR_FACTIONS.FIRE.color,
                    borderColor: COLOR_FACTIONS.FIRE.borderColor,
                    factionName: COLOR_FACTIONS.FIRE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.FIRE.burnArmorReduction += 0.15;
                    }
                },
                {
                    id: 'fire_instant_explosion',
                    faction: 'FIRE',
                    tier: 3,
                    name: '极速爆弹',
                    description: '弹道爆炸落地延迟降低 50%，几乎瞬间引爆',
                    color: COLOR_FACTIONS.FIRE.color,
                    borderColor: COLOR_FACTIONS.FIRE.borderColor,
                    factionName: COLOR_FACTIONS.FIRE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.FIRE.instantExplosionEnabled = true;
                    }
                },
                {
                    id: 'fire_ignite_chance',
                    faction: 'FIRE',
                    tier: 3,
                    name: '炼狱火种',
                    description: '点燃几率大幅提升 +40%，燃烧持续时间延长 2 秒',
                    color: COLOR_FACTIONS.FIRE.color,
                    borderColor: COLOR_FACTIONS.FIRE.borderColor,
                    factionName: COLOR_FACTIONS.FIRE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.FIRE.igniteChanceBonus += 0.40;
                        bonuses.factionBonuses.FIRE.burnDurationBonus += 2000;
                    }
                },
                {
                    id: 'fire_chain_explosion',
                    faction: 'FIRE',
                    tier: 3,
                    name: '连锁爆鸣',
                    description: '连续两次爆炸后，下一次 AOE 范围翻倍',
                    color: COLOR_FACTIONS.FIRE.color,
                    borderColor: COLOR_FACTIONS.FIRE.borderColor,
                    factionName: COLOR_FACTIONS.FIRE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.FIRE.chainExplosionEnabled = true;
                    }
                },
                {
                    id: 'fire_aoe_burn',
                    faction: 'FIRE',
                    tier: 3,
                    name: '焦土领域',
                    description: '炮台周围持续造成微量灼烧伤害（每秒 2 点）',
                    color: COLOR_FACTIONS.FIRE.color,
                    borderColor: COLOR_FACTIONS.FIRE.borderColor,
                    factionName: COLOR_FACTIONS.FIRE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.FIRE.aoeBurnEnabled = true;
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
                    tier: 1,
                    name: '黄色消除-攻击范围扩大',
                    description: '每次消除黄色方块时，所有炮塔攻击范围临时 +20%，持续 5 秒',
                    color: COLOR_FACTIONS.SHOTGUN.color,
                    borderColor: COLOR_FACTIONS.SHOTGUN.borderColor,
                    factionName: COLOR_FACTIONS.SHOTGUN.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SHOTGUN.yellowClearRangeBoost += 0.20;
                        bonuses.colorClearBonuses.YELLOW.enabled = true;
                        bonuses.colorClearBonuses.YELLOW.rangeBoost += 0.20;
                    }
                },
                {
                    id: 'aoe_no_reduction',
                    faction: 'SHOTGUN',
                    tier: 1,
                    name: 'AOE 伤害无衰减',
                    description: 'AOE 伤害不再随距离衰减，所有范围内敌人受到完整伤害',
                    color: COLOR_FACTIONS.SHOTGUN.color,
                    borderColor: COLOR_FACTIONS.SHOTGUN.borderColor,
                    factionName: COLOR_FACTIONS.SHOTGUN.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SHOTGUN.aoeNoReduction = true;
                    }
                },
                {
                    id: 'lightning_bullet_count',
                    faction: 'SHOTGUN',
                    tier: 2,
                    name: '扩充电容',
                    description: '闪电散射数量 +2，覆盖更广角度',
                    color: COLOR_FACTIONS.SHOTGUN.color,
                    borderColor: COLOR_FACTIONS.SHOTGUN.borderColor,
                    factionName: COLOR_FACTIONS.SHOTGUN.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SHOTGUN.bulletCountBonus += 2;
                    }
                },
                {
                    id: 'lightning_spread_reduce',
                    faction: 'SHOTGUN',
                    tier: 2,
                    name: '聚拢散射',
                    description: '闪电角度收缩 -30%，近距离单点爆发极强',
                    color: COLOR_FACTIONS.SHOTGUN.color,
                    borderColor: COLOR_FACTIONS.SHOTGUN.borderColor,
                    factionName: COLOR_FACTIONS.SHOTGUN.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SHOTGUN.spreadAngleReduction += 0.30;
                    }
                },
                {
                    id: 'lightning_split',
                    faction: 'SHOTGUN',
                    tier: 2,
                    name: '爆裂闪电',
                    description: '闪电命中后分裂三道小型电弧，击中周围敌人造成 30% 的基础伤害',
                    color: COLOR_FACTIONS.SHOTGUN.color,
                    borderColor: COLOR_FACTIONS.SHOTGUN.borderColor,
                    factionName: COLOR_FACTIONS.SHOTGUN.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SHOTGUN.splitLightningEnabled = true;
                    }
                },
                {
                    id: 'lightning_close_range',
                    faction: 'SHOTGUN',
                    tier: 3,
                    name: '近距离绝杀',
                    description: '范围内敌人越靠近，伤害加成越高（最高 +50%）',
                    color: COLOR_FACTIONS.SHOTGUN.color,
                    borderColor: COLOR_FACTIONS.SHOTGUN.borderColor,
                    factionName: COLOR_FACTIONS.SHOTGUN.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SHOTGUN.closeRangeBonus += 0.50;
                    }
                },
                {
                    id: 'lightning_focus',
                    faction: 'SHOTGUN',
                    tier: 3,
                    name: '精准电击',
                    description: '提升中心闪电伤害 +40%，弱化边缘分裂伤害 -20%',
                    color: COLOR_FACTIONS.SHOTGUN.color,
                    borderColor: COLOR_FACTIONS.SHOTGUN.borderColor,
                    factionName: COLOR_FACTIONS.SHOTGUN.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SHOTGUN.centerDamageBonus += 0.40;
                        bonuses.factionBonuses.SHOTGUN.edgeDamageReduction += 0.20;
                    }
                },
                {
                    id: 'lightning_attack_speed',
                    faction: 'SHOTGUN',
                    tier: 3,
                    name: '快速充电',
                    description: '攻速大幅强化 +25%',
                    color: COLOR_FACTIONS.SHOTGUN.color,
                    borderColor: COLOR_FACTIONS.SHOTGUN.borderColor,
                    factionName: COLOR_FACTIONS.SHOTGUN.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SHOTGUN.attackSpeedBonus += 0.25;
                    }
                },
                {
                    id: 'lightning_pierce',
                    faction: 'SHOTGUN',
                    tier: 3,
                    name: '击穿电压',
                    description: '部分电流获得小型穿透效果，造成 50% 的穿透伤害',
                    color: COLOR_FACTIONS.SHOTGUN.color,
                    borderColor: COLOR_FACTIONS.SHOTGUN.borderColor,
                    factionName: COLOR_FACTIONS.SHOTGUN.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SHOTGUN.pierceEnabled = true;
                        bonuses.factionBonuses.SHOTGUN.pierceDamagePercent += 0.50;
                    }
                },
                {
                    id: 'lightning_knockback',
                    faction: 'SHOTGUN',
                    tier: 3,
                    name: '震荡电击',
                    description: '每发闪电都附带小额击退效果（距离 10 像素）',
                    color: COLOR_FACTIONS.SHOTGUN.color,
                    borderColor: COLOR_FACTIONS.SHOTGUN.borderColor,
                    factionName: COLOR_FACTIONS.SHOTGUN.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SHOTGUN.knockbackEnabled = true;
                    }
                }
            ],
            
            ICE: [
                {
                    id: 'ice_slow_boost',
                    faction: 'ICE',
                    tier: 1,
                    name: '减速效果强化',
                    description: '减速效果 +25%，敌人移动速度额外降低',
                    color: COLOR_FACTIONS.ICE.color,
                    borderColor: COLOR_FACTIONS.ICE.borderColor,
                    factionName: COLOR_FACTIONS.ICE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.ICE.slowPercentBonus += 0.25;
                    }
                },
                {
                    id: 'blue_clear_freeze',
                    faction: 'ICE',
                    tier: 1,
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
                    tier: 1,
                    name: '控制持续时间延长',
                    description: '所有冰冻、减速效果持续时间 +40%',
                    color: COLOR_FACTIONS.ICE.color,
                    borderColor: COLOR_FACTIONS.ICE.borderColor,
                    factionName: COLOR_FACTIONS.ICE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.ICE.freezeDurationMultiplier += 0.40;
                        bonuses.globalBonuses.durationBonus += 0.40;
                    }
                },
                {
                    id: 'ice_freeze_duration',
                    faction: 'ICE',
                    tier: 2,
                    name: '极寒禁锢',
                    description: '冰冻时长大幅增加 +1.5 秒，强控单体',
                    color: COLOR_FACTIONS.ICE.color,
                    borderColor: COLOR_FACTIONS.ICE.borderColor,
                    factionName: COLOR_FACTIONS.ICE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.ICE.freezeDurationBonus += 1500;
                    }
                },
                {
                    id: 'ice_frost_field',
                    faction: 'ICE',
                    tier: 2,
                    name: '寒霜领域',
                    description: '攻击命中后，生成小型冰霜减速区域（半径 40 像素，持续 3 秒）',
                    color: COLOR_FACTIONS.ICE.color,
                    borderColor: COLOR_FACTIONS.ICE.borderColor,
                    factionName: COLOR_FACTIONS.ICE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.ICE.frostFieldEnabled = true;
                    }
                },
                {
                    id: 'ice_shatter_damage',
                    faction: 'ICE',
                    tier: 2,
                    name: '碎冰增幅',
                    description: '冰冻解除时，目标受到一次爆发碎冰伤害（基础伤害的 40%）',
                    color: COLOR_FACTIONS.ICE.color,
                    borderColor: COLOR_FACTIONS.ICE.borderColor,
                    factionName: COLOR_FACTIONS.ICE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.ICE.shatterDamageEnabled = true;
                    }
                },
                {
                    id: 'ice_deep_freeze',
                    faction: 'ICE',
                    tier: 3,
                    name: '深度冻结',
                    description: '减速百分比大幅提升 +20%，克制高速小怪',
                    color: COLOR_FACTIONS.ICE.color,
                    borderColor: COLOR_FACTIONS.ICE.borderColor,
                    factionName: COLOR_FACTIONS.ICE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.ICE.slowIncreaseEnabled = true;
                    }
                },
                {
                    id: 'ice_freeze_spread',
                    faction: 'ICE',
                    tier: 3,
                    name: '寒气蔓延',
                    description: '冰冻效果可小幅传染给周边敌人（20% 几率，1 个目标）',
                    color: COLOR_FACTIONS.ICE.color,
                    borderColor: COLOR_FACTIONS.ICE.borderColor,
                    factionName: COLOR_FACTIONS.ICE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.ICE.freezeSpreadEnabled = true;
                    }
                },
                {
                    id: 'ice_frozen_armor',
                    faction: 'ICE',
                    tier: 3,
                    name: '凝甲固化',
                    description: '被冰冻敌人防御小幅提升 +20%，但完全无法移动',
                    color: COLOR_FACTIONS.ICE.color,
                    borderColor: COLOR_FACTIONS.ICE.borderColor,
                    factionName: COLOR_FACTIONS.ICE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.ICE.frozenArmorBonus += 0.20;
                    }
                },
                {
                    id: 'ice_fast_freeze',
                    faction: 'ICE',
                    tier: 3,
                    name: '速冻瞬发',
                    description: '减少冰冻触发前摇 -50%，快速冻结目标',
                    color: COLOR_FACTIONS.ICE.color,
                    borderColor: COLOR_FACTIONS.ICE.borderColor,
                    factionName: COLOR_FACTIONS.ICE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.ICE.fastFreezeEnabled = true;
                    }
                },
                {
                    id: 'ice_fragile',
                    faction: 'ICE',
                    tier: 3,
                    name: '冰川脆弱',
                    description: '被冰冻单位受到所有炮台伤害增加 20%',
                    color: COLOR_FACTIONS.ICE.color,
                    borderColor: COLOR_FACTIONS.ICE.borderColor,
                    factionName: COLOR_FACTIONS.ICE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.ICE.frozenDamageTakenBonus += 0.20;
                    }
                },
                {
                    id: 'ice_frost_aura',
                    faction: 'ICE',
                    tier: 3,
                    name: '寒霜壁垒',
                    description: '自身周围低温区域，靠近敌人自动减速（范围 80 像素，减速 30%）',
                    color: COLOR_FACTIONS.ICE.color,
                    borderColor: COLOR_FACTIONS.ICE.borderColor,
                    factionName: COLOR_FACTIONS.ICE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.ICE.frostAuraEnabled = true;
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
                    tier: 1,
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
                    tier: 1,
                    name: '对 BOSS 伤害翻倍',
                    description: '对精英敌人和重装敌人造成的伤害 +80%',
                    color: COLOR_FACTIONS.PIERCE.color,
                    borderColor: COLOR_FACTIONS.PIERCE.borderColor,
                    factionName: COLOR_FACTIONS.PIERCE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.PIERCE.bossDamageMultiplier += 0.80;
                        bonuses.globalBonuses.eliteTankDamageBonus += 0.80;
                    }
                },
                {
                    id: 'pierce_count_boost',
                    faction: 'PIERCE',
                    tier: 2,
                    name: '超远贯穿',
                    description: '穿透敌人数量上限 +3，子弹不会轻易消失',
                    color: COLOR_FACTIONS.PIERCE.color,
                    borderColor: COLOR_FACTIONS.PIERCE.borderColor,
                    factionName: COLOR_FACTIONS.PIERCE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.PIERCE.pierceCountBonus += 3;
                    }
                },
                {
                    id: 'pierce_damage_increase',
                    faction: 'PIERCE',
                    tier: 2,
                    name: '破甲斩击',
                    description: '每穿透 1 名敌人，下一段伤害小幅提升 +15%',
                    color: COLOR_FACTIONS.PIERCE.color,
                    borderColor: COLOR_FACTIONS.PIERCE.borderColor,
                    factionName: COLOR_FACTIONS.PIERCE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.PIERCE.pierceDamageIncrease += 0.15;
                    }
                },
                {
                    id: 'pierce_ignore_block',
                    faction: 'PIERCE',
                    tier: 2,
                    name: '硬质弹头',
                    description: '穿透时无视小型敌人格挡与减伤',
                    color: COLOR_FACTIONS.PIERCE.color,
                    borderColor: COLOR_FACTIONS.PIERCE.borderColor,
                    factionName: COLOR_FACTIONS.PIERCE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.PIERCE.pierceIgnoreBlock = true;
                    }
                },
                {
                    id: 'pierce_bleed',
                    faction: 'PIERCE',
                    tier: 3,
                    name: '撕裂伤口',
                    description: '被穿透的敌人受到流血持续伤害（每秒 3 点，持续 4 秒）',
                    color: COLOR_FACTIONS.PIERCE.color,
                    borderColor: COLOR_FACTIONS.PIERCE.borderColor,
                    factionName: COLOR_FACTIONS.PIERCE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.PIERCE.bleedEnabled = true;
                    }
                },
                {
                    id: 'pierce_long_range',
                    faction: 'PIERCE',
                    tier: 3,
                    name: '定向狙击',
                    description: '射程最大化提升 +50%，远距离伤害加成 +25%',
                    color: COLOR_FACTIONS.PIERCE.color,
                    borderColor: COLOR_FACTIONS.PIERCE.borderColor,
                    factionName: COLOR_FACTIONS.PIERCE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.PIERCE.longRangeBonus += 0.25;
                    }
                },
                {
                    id: 'pierce_split',
                    faction: 'PIERCE',
                    tier: 3,
                    name: '分裂弹体',
                    description: '穿透最后一名敌人后，分裂 2 发小型子弹',
                    color: COLOR_FACTIONS.PIERCE.color,
                    borderColor: COLOR_FACTIONS.PIERCE.borderColor,
                    factionName: COLOR_FACTIONS.PIERCE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.PIERCE.splitOnLastPierce = true;
                    }
                },
                {
                    id: 'pierce_crit',
                    faction: 'PIERCE',
                    tier: 3,
                    name: '弱点锁定',
                    description: '穿透攻击必定暴击被标记弱点单位（暴击伤害 +50%）',
                    color: COLOR_FACTIONS.PIERCE.color,
                    borderColor: COLOR_FACTIONS.PIERCE.borderColor,
                    factionName: COLOR_FACTIONS.PIERCE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.PIERCE.weakPointCritEnabled = true;
                    }
                },
                {
                    id: 'pierce_no_decay',
                    faction: 'PIERCE',
                    tier: 3,
                    name: '高速弹道',
                    description: '子弹无衰减，飞行全程伤害稳定',
                    color: COLOR_FACTIONS.PIERCE.color,
                    borderColor: COLOR_FACTIONS.PIERCE.borderColor,
                    factionName: COLOR_FACTIONS.PIERCE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.PIERCE.damageNoDecay = true;
                    }
                },
                {
                    id: 'pierce_slow',
                    faction: 'PIERCE',
                    tier: 3,
                    name: '穿刺共振',
                    description: '直线路径产生震荡，减速沿线所有敌人（减速 25%，持续 2 秒）',
                    color: COLOR_FACTIONS.PIERCE.color,
                    borderColor: COLOR_FACTIONS.PIERCE.borderColor,
                    factionName: COLOR_FACTIONS.PIERCE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.PIERCE.pierceSlowEnabled = true;
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
                        bonuses.globalBonuses.durationBonus += 0.25;
                    }
                },
                {
                    id: 'purple_clear_block',
                    faction: 'SPACE',
                    tier: 1,
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
                    tier: 1,
                    name: '阻拦敌人前进同时造成中等伤害',
                    description: '被空间标线阻拦的敌人每秒受到基础伤害的 50%',
                    color: COLOR_FACTIONS.SPACE.color,
                    borderColor: COLOR_FACTIONS.SPACE.borderColor,
                    factionName: COLOR_FACTIONS.SPACE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SPACE.blockDamageMultiplier += 0.50;
                    }
                },
                {
                    id: 'space_line_width',
                    faction: 'SPACE',
                    tier: 2,
                    name: '裂隙扩张',
                    description: '空间阻拦线宽度大幅增加 +40%，阻挡面积变大',
                    color: COLOR_FACTIONS.SPACE.color,
                    borderColor: COLOR_FACTIONS.SPACE.borderColor,
                    factionName: COLOR_FACTIONS.SPACE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SPACE.lineWidthBonus += 0.40;
                    }
                },
                {
                    id: 'space_duration',
                    faction: 'SPACE',
                    tier: 2,
                    name: '时空滞留',
                    description: '空间标线持续时间延长 +2 秒，长时间封锁路线',
                    color: COLOR_FACTIONS.SPACE.color,
                    borderColor: COLOR_FACTIONS.SPACE.borderColor,
                    factionName: COLOR_FACTIONS.SPACE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SPACE.durationBonus += 2000;
                    }
                },
                {
                    id: 'space_line_bleed',
                    faction: 'SPACE',
                    tier: 2,
                    name: '切割领域',
                    description: '空间线触碰敌人会附带撕裂持续伤害（每秒 4 点，持续 3 秒）',
                    color: COLOR_FACTIONS.SPACE.color,
                    borderColor: COLOR_FACTIONS.SPACE.borderColor,
                    factionName: COLOR_FACTIONS.SPACE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SPACE.lineBleedEnabled = true;
                    }
                },
                {
                    id: 'space_phase_lock',
                    faction: 'SPACE',
                    tier: 3,
                    name: '相位封锁',
                    description: '被空间线命中敌人短时间无法位移冲刺（持续 1.5 秒）',
                    color: COLOR_FACTIONS.SPACE.color,
                    borderColor: COLOR_FACTIONS.SPACE.borderColor,
                    factionName: COLOR_FACTIONS.SPACE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SPACE.phaseLockEnabled = true;
                    }
                },
                {
                    id: 'space_extra_line',
                    faction: 'SPACE',
                    tier: 3,
                    name: '多重裂隙',
                    description: '单次攻击额外生成一条小型分割标线',
                    color: COLOR_FACTIONS.SPACE.color,
                    borderColor: COLOR_FACTIONS.SPACE.borderColor,
                    factionName: COLOR_FACTIONS.SPACE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SPACE.extraLineEnabled = true;
                    }
                },
                {
                    id: 'space_line_slow',
                    faction: 'SPACE',
                    tier: 3,
                    name: '扭曲力场',
                    description: '空间线周围敌人移动速度被拉扯减速（范围 50 像素，减速 30%）',
                    color: COLOR_FACTIONS.SPACE.color,
                    borderColor: COLOR_FACTIONS.SPACE.borderColor,
                    factionName: COLOR_FACTIONS.SPACE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SPACE.lineSlowEnabled = true;
                    }
                },
                {
                    id: 'space_collapse',
                    faction: 'SPACE',
                    tier: 3,
                    name: '坍缩打击',
                    description: '空间线消失时触发一次范围坍缩伤害（基础伤害的 60%，半径 60 像素）',
                    color: COLOR_FACTIONS.SPACE.color,
                    borderColor: COLOR_FACTIONS.SPACE.borderColor,
                    factionName: COLOR_FACTIONS.SPACE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SPACE.collapseDamageEnabled = true;
                    }
                },
                {
                    id: 'space_block_projectiles',
                    faction: 'SPACE',
                    tier: 3,
                    name: '稳定屏障',
                    description: '空间线可阻挡敌方弹幕 / 飞行物',
                    color: COLOR_FACTIONS.SPACE.color,
                    borderColor: COLOR_FACTIONS.SPACE.borderColor,
                    factionName: COLOR_FACTIONS.SPACE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SPACE.blockProjectiles = true;
                    }
                },
                {
                    id: 'space_cooldown_slow',
                    faction: 'SPACE',
                    tier: 3,
                    name: '时序割裂',
                    description: '被标线命中敌人技能 / 行动冷却变慢 -30%',
                    color: COLOR_FACTIONS.SPACE.color,
                    borderColor: COLOR_FACTIONS.SPACE.borderColor,
                    factionName: COLOR_FACTIONS.SPACE.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.SPACE.cooldownSlowEnabled = true;
                    }
                }
            ],
            
            POISON: [
                {
                    id: 'poison_armor_reduction',
                    faction: 'POISON',
                    tier: 1,
                    name: '护甲削减',
                    description: '中毒敌人每秒额外降低 2 点护甲，最多降低 10 点',
                    color: COLOR_FACTIONS.POISON.color,
                    borderColor: COLOR_FACTIONS.POISON.borderColor,
                    factionName: COLOR_FACTIONS.POISON.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.POISON.armorReductionPerTick += 2;
                        bonuses.globalBonuses.armorReduction += 2;
                    }
                },
                {
                    id: 'green_clear_aoe_debuff',
                    faction: 'POISON',
                    tier: 1,
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
                    tier: 1,
                    name: '中毒伤害强化',
                    description: '中毒伤害 +40%，持续压制血线',
                    color: COLOR_FACTIONS.POISON.color,
                    borderColor: COLOR_FACTIONS.POISON.borderColor,
                    factionName: COLOR_FACTIONS.POISON.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.POISON.poisonDamageMultiplier += 0.40;
                    }
                },
                {
                    id: 'poison_tick_boost',
                    faction: 'POISON',
                    tier: 2,
                    name: '剧毒侵蚀',
                    description: '毒素每秒伤害大幅提升 +30%，高阶持续掉血',
                    color: COLOR_FACTIONS.POISON.color,
                    borderColor: COLOR_FACTIONS.POISON.borderColor,
                    factionName: COLOR_FACTIONS.POISON.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.POISON.poisonTickDamageBonus += 0.30;
                    }
                },
                {
                    id: 'poison_death_puddle',
                    faction: 'POISON',
                    tier: 2,
                    name: '腐化蔓延',
                    description: '中毒目标死亡后，残留毒雾持续感染新敌人（持续 4 秒，半径 50 像素）',
                    color: COLOR_FACTIONS.POISON.color,
                    borderColor: COLOR_FACTIONS.POISON.borderColor,
                    factionName: COLOR_FACTIONS.POISON.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.POISON.deathPuddleEnabled = true;
                    }
                },
                {
                    id: 'poison_double_slow',
                    faction: 'POISON',
                    tier: 2,
                    name: '剧毒迟缓',
                    description: '中毒附带移速、攻速双重衰减（移速 -20%，攻速 -15%）',
                    color: COLOR_FACTIONS.POISON.color,
                    borderColor: COLOR_FACTIONS.POISON.borderColor,
                    factionName: COLOR_FACTIONS.POISON.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.POISON.poisonDoubleSlow = true;
                    }
                },
                {
                    id: 'poison_multi_stack',
                    faction: 'POISON',
                    tier: 3,
                    name: '多层毒素',
                    description: '可叠加多层毒伤，每层独立结算（最多 3 层）',
                    color: COLOR_FACTIONS.POISON.color,
                    borderColor: COLOR_FACTIONS.POISON.borderColor,
                    factionName: COLOR_FACTIONS.POISON.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.POISON.multiPoisonStack = true;
                    }
                },
                {
                    id: 'poison_ignore_heal',
                    faction: 'POISON',
                    tier: 3,
                    name: '腐蚀体液',
                    description: '毒素可无视部分怪物自愈回复效果（降低 50% 回复效率）',
                    color: COLOR_FACTIONS.POISON.color,
                    borderColor: COLOR_FACTIONS.POISON.borderColor,
                    factionName: COLOR_FACTIONS.POISON.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.POISON.ignoreHeal = true;
                    }
                },
                {
                    id: 'poison_long_range',
                    faction: 'POISON',
                    tier: 3,
                    name: '远距离毒袭',
                    description: '射程大幅提升 +40%，安全后排消耗',
                    color: COLOR_FACTIONS.POISON.color,
                    borderColor: COLOR_FACTIONS.POISON.borderColor,
                    factionName: COLOR_FACTIONS.POISON.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.POISON.longRangePoisonBonus += 0.40;
                    }
                },
                {
                    id: 'poison_low_hp_double',
                    faction: 'POISON',
                    tier: 3,
                    name: '毒爆溃烂',
                    description: '中毒目标血量低于 20% 时持续掉血翻倍',
                    color: COLOR_FACTIONS.POISON.color,
                    borderColor: COLOR_FACTIONS.POISON.borderColor,
                    factionName: COLOR_FACTIONS.POISON.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.POISON.lowHPDoubleDamage = true;
                    }
                },
                {
                    id: 'poison_aura',
                    faction: 'POISON',
                    tier: 3,
                    name: '瘴气环绕',
                    description: '炮台定期释放环形毒雾（每 8 秒一次，半径 100 像素）',
                    color: COLOR_FACTIONS.POISON.color,
                    borderColor: COLOR_FACTIONS.POISON.borderColor,
                    factionName: COLOR_FACTIONS.POISON.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.POISON.poisonAuraEnabled = true;
                    }
                },
                {
                    id: 'poison_duration',
                    faction: 'POISON',
                    tier: 3,
                    name: '持久腐化',
                    description: '毒素持续时间翻倍，持续压制血线',
                    color: COLOR_FACTIONS.POISON.color,
                    borderColor: COLOR_FACTIONS.POISON.borderColor,
                    factionName: COLOR_FACTIONS.POISON.name,
                    apply: (bonuses) => {
                        bonuses.factionBonuses.POISON.poisonDurationMultiplier += 1.0;
                    }
                }
            ]
        };
        
        this.generalUpgrades = [
            {
                id: 'damage_boost',
                faction: 'GENERAL',
                name: '铁血强化',
                description: '全局基础伤害 +12%',
                color: '#e94560',
                borderColor: '#ff6b7a',
                factionName: '通用',
                type: 'damage',
                value: 0.12,
                maxValue: 0.60,
                apply: (bonuses, value) => {
                    const newBonus = bonuses.globalBonuses.damageBonus + value;
                    bonuses.globalBonuses.damageBonus = Math.min(newBonus, 1 + 0.60);
                },
                getCurrentBonus: (bonuses) => bonuses.globalBonuses.damageBonus - 1
            },
            {
                id: 'attack_speed',
                faction: 'GENERAL',
                name: '高速装填',
                description: '攻击间隔 -10%（攻速提升）',
                color: '#ff8c00',
                borderColor: '#ffaa4d',
                factionName: '通用',
                type: 'attackSpeed',
                value: 0.10,
                maxValue: 0.60,
                apply: (bonuses, value) => {
                    const newBonus = bonuses.globalBonuses.attackSpeedBonus * (1 + value / (1 - value));
                    bonuses.globalBonuses.attackSpeedBonus = Math.min(newBonus, 1 + 0.60);
                },
                getCurrentBonus: (bonuses) => (bonuses.globalBonuses.attackSpeedBonus - 1)
            },
            {
                id: 'score_boost',
                faction: 'GENERAL',
                name: '高效回收',
                description: '方块消除额外获得 5% 得分，击杀敌人额外获得 8% 得分',
                color: '#4ecca3',
                borderColor: '#7ee8c7',
                factionName: '通用',
                type: 'score',
                value: 0.08,
                maxValue: 0.80,
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
            FIRE: {
                burnDamageMultiplier: 1,
                redClearExtraDamage: 0,
                dotStackingEnabled: false,
                explosionRadiusBonus: 0,
                groundBurnEnabled: false,
                killExplosionEnabled: false,
                aoeCenterBonus: 0,
                aoeEdgeReduction: 0,
                spreadFireEnabled: false,
                burnArmorReduction: 0,
                instantExplosionEnabled: false,
                igniteChanceBonus: 0,
                burnDurationBonus: 0,
                chainExplosionEnabled: false,
                chainExplosionCount: 0,
                aoeBurnEnabled: false
            },
            SHOTGUN: {
                chainLightningEnabled: false,
                yellowClearRangeBoost: 0,
                aoeNoReduction: false,
                bulletCountBonus: 0,
                spreadAngleReduction: 0,
                splitLightningEnabled: false,
                closeRangeBonus: 0,
                centerDamageBonus: 0,
                edgeDamageReduction: 0,
                attackSpeedBonus: 0,
                pierceEnabled: false,
                pierceDamagePercent: 0,
                knockbackEnabled: false
            },
            ICE: {
                slowPercentBonus: 0,
                blueClearFreezeEnabled: false,
                freezeDurationMultiplier: 1,
                freezeDurationBonus: 0,
                frostFieldEnabled: false,
                shatterDamageEnabled: false,
                slowIncreaseEnabled: false,
                freezeSpreadEnabled: false,
                frozenArmorBonus: 0,
                fastFreezeEnabled: false,
                frozenDamageTakenBonus: 0,
                frostAuraEnabled: false
            },
            PIERCE: {
                armorPierceBonus: 0,
                orangeClearIgnoreArmor: false,
                bossDamageMultiplier: 1,
                pierceCountBonus: 0,
                pierceDamageIncrease: 0,
                pierceIgnoreBlock: false,
                bleedEnabled: false,
                longRangeBonus: 0,
                splitOnLastPierce: false,
                weakPointCritEnabled: false,
                damageNoDecay: false,
                pierceSlowEnabled: false
            },
            SPACE: {
                blockCountBonus: 0,
                purpleClearBlockEnabled: false,
                blockDamageMultiplier: 1,
                lineWidthBonus: 0,
                durationBonus: 0,
                lineBleedEnabled: false,
                phaseLockEnabled: false,
                extraLineEnabled: false,
                lineSlowEnabled: false,
                collapseDamageEnabled: false,
                blockProjectiles: false,
                cooldownSlowEnabled: false
            },
            POISON: {
                armorReductionPerTick: 0,
                greenClearAoeDebuff: false,
                poisonDamageMultiplier: 1,
                poisonTickDamageBonus: 0,
                deathPuddleEnabled: false,
                poisonDoubleSlow: false,
                multiPoisonStack: false,
                ignoreHeal: false,
                longRangePoisonBonus: 0,
                lowHPDoubleDamage: false,
                poisonAuraEnabled: false,
                poisonDurationMultiplier: 1
            }
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
                if (upgrade.id === 'fire_ground_burn') {
                    turret.specialBonuses.explosionRadiusBonus = (turret.specialBonuses.explosionRadiusBonus || 0) + 0.20;
                    turret.specialBonuses.groundBurnEnabled = true;
                }
                if (upgrade.id === 'fire_kill_explosion') {
                    turret.specialBonuses.killExplosionEnabled = true;
                }
                if (upgrade.id === 'fire_aoe_center_boost') {
                    turret.specialBonuses.aoeCenterBonus = (turret.specialBonuses.aoeCenterBonus || 0) + 0.30;
                    turret.specialBonuses.aoeEdgeReduction = (turret.specialBonuses.aoeEdgeReduction || 0) + 0.10;
                }
                if (upgrade.id === 'fire_spread_fire') {
                    turret.specialBonuses.spreadFireEnabled = true;
                }
                if (upgrade.id === 'fire_armor_reduction') {
                    turret.specialBonuses.burnArmorReduction = (turret.specialBonuses.burnArmorReduction || 0) + 0.15;
                }
                if (upgrade.id === 'fire_instant_explosion') {
                    turret.specialBonuses.instantExplosionEnabled = true;
                }
                if (upgrade.id === 'fire_ignite_chance') {
                    turret.specialBonuses.igniteChanceBonus = (turret.specialBonuses.igniteChanceBonus || 0) + 0.40;
                    turret.specialBonuses.burnDurationBonus = (turret.specialBonuses.burnDurationBonus || 0) + 2000;
                }
                if (upgrade.id === 'fire_chain_explosion') {
                    turret.specialBonuses.chainExplosionEnabled = true;
                }
                if (upgrade.id === 'fire_aoe_burn') {
                    turret.specialBonuses.aoeBurnEnabled = true;
                }
                break;
                
            case 'SHOTGUN':
                if (upgrade.id === 'lightning_chain') {
                    turret.specialBonuses.chainLightningEnabled = true;
                }
                if (upgrade.id === 'aoe_no_reduction') {
                    turret.specialBonuses.aoeDamageReduction = 0;
                }
                if (upgrade.id === 'lightning_bullet_count') {
                    turret.specialBonuses.bulletCountBonus = (turret.specialBonuses.bulletCountBonus || 0) + 2;
                }
                if (upgrade.id === 'lightning_spread_reduce') {
                    turret.specialBonuses.spreadAngleReduction = (turret.specialBonuses.spreadAngleReduction || 0) + 0.30;
                }
                if (upgrade.id === 'lightning_split') {
                    turret.specialBonuses.splitLightningEnabled = true;
                }
                if (upgrade.id === 'lightning_close_range') {
                    turret.specialBonuses.closeRangeBonus = (turret.specialBonuses.closeRangeBonus || 0) + 0.50;
                }
                if (upgrade.id === 'lightning_focus') {
                    turret.specialBonuses.centerDamageBonus = (turret.specialBonuses.centerDamageBonus || 0) + 0.40;
                    turret.specialBonuses.edgeDamageReduction = (turret.specialBonuses.edgeDamageReduction || 0) + 0.20;
                }
                if (upgrade.id === 'lightning_attack_speed') {
                    turret.specialBonuses.attackSpeedBonus = (turret.specialBonuses.attackSpeedBonus || 1) * 1.25;
                }
                if (upgrade.id === 'lightning_pierce') {
                    turret.specialBonuses.pierceEnabled = true;
                    turret.specialBonuses.pierceDamagePercent = (turret.specialBonuses.pierceDamagePercent || 0) + 0.50;
                }
                if (upgrade.id === 'lightning_knockback') {
                    turret.specialBonuses.knockbackEnabled = true;
                }
                break;
                
            case 'ICE':
                if (upgrade.id === 'ice_slow_boost') {
                    turret.specialBonuses.slowPercentBonus = (turret.specialBonuses.slowPercentBonus || 0) + 0.25;
                }
                if (upgrade.id === 'control_duration_extend') {
                    turret.specialBonuses.freezeDurationMultiplier = (turret.specialBonuses.freezeDurationMultiplier || 1) + 0.40;
                }
                if (upgrade.id === 'ice_freeze_duration') {
                    turret.specialBonuses.freezeDurationBonus = (turret.specialBonuses.freezeDurationBonus || 0) + 1500;
                }
                if (upgrade.id === 'ice_frost_field') {
                    turret.specialBonuses.frostFieldEnabled = true;
                }
                if (upgrade.id === 'ice_shatter_damage') {
                    turret.specialBonuses.shatterDamageEnabled = true;
                }
                if (upgrade.id === 'ice_deep_freeze') {
                    turret.specialBonuses.slowIncreaseEnabled = true;
                }
                if (upgrade.id === 'ice_freeze_spread') {
                    turret.specialBonuses.freezeSpreadEnabled = true;
                }
                if (upgrade.id === 'ice_frozen_armor') {
                    turret.specialBonuses.frozenArmorBonus = (turret.specialBonuses.frozenArmorBonus || 0) + 0.20;
                }
                if (upgrade.id === 'ice_fast_freeze') {
                    turret.specialBonuses.fastFreezeEnabled = true;
                }
                if (upgrade.id === 'ice_fragile') {
                    turret.specialBonuses.frozenDamageTakenBonus = (turret.specialBonuses.frozenDamageTakenBonus || 0) + 0.20;
                }
                if (upgrade.id === 'ice_frost_aura') {
                    turret.specialBonuses.frostAuraEnabled = true;
                }
                break;
                
            case 'PIERCE':
                if (upgrade.id === 'pierce_armor_boost') {
                    turret.specialBonuses.armorPierceBonus = (turret.specialBonuses.armorPierceBonus || 0) + 0.20;
                }
                if (upgrade.id === 'boss_damage_double') {
                    turret.specialBonuses.eliteDamageMultiplier = (turret.specialBonuses.eliteDamageMultiplier || 1) + 0.80;
                }
                if (upgrade.id === 'pierce_count_boost') {
                    turret.specialBonuses.pierceCountBonus = (turret.specialBonuses.pierceCountBonus || 0) + 3;
                }
                if (upgrade.id === 'pierce_damage_increase') {
                    turret.specialBonuses.pierceDamageIncrease = (turret.specialBonuses.pierceDamageIncrease || 0) + 0.15;
                }
                if (upgrade.id === 'pierce_ignore_block') {
                    turret.specialBonuses.pierceIgnoreBlock = true;
                }
                if (upgrade.id === 'pierce_bleed') {
                    turret.specialBonuses.bleedEnabled = true;
                }
                if (upgrade.id === 'pierce_long_range') {
                    turret.specialBonuses.longRangeBonus = (turret.specialBonuses.longRangeBonus || 0) + 0.25;
                }
                if (upgrade.id === 'pierce_split') {
                    turret.specialBonuses.splitOnLastPierce = true;
                }
                if (upgrade.id === 'pierce_crit') {
                    turret.specialBonuses.weakPointCritEnabled = true;
                }
                if (upgrade.id === 'pierce_no_decay') {
                    turret.specialBonuses.damageNoDecay = true;
                }
                if (upgrade.id === 'pierce_slow') {
                    turret.specialBonuses.pierceSlowEnabled = true;
                }
                break;
                
            case 'SPACE':
                if (upgrade.id === 'space_block_boost') {
                    turret.specialBonuses.extraBlockCount = (turret.specialBonuses.extraBlockCount || 0) + 2;
                }
                if (upgrade.id === 'space_block_damage') {
                    turret.specialBonuses.spaceDamageMultiplier = (turret.specialBonuses.spaceDamageMultiplier || 1) + 0.50;
                }
                if (upgrade.id === 'space_line_width') {
                    turret.specialBonuses.lineWidthBonus = (turret.specialBonuses.lineWidthBonus || 0) + 0.40;
                }
                if (upgrade.id === 'space_duration') {
                    turret.specialBonuses.spaceDurationBonus = (turret.specialBonuses.spaceDurationBonus || 0) + 2000;
                }
                if (upgrade.id === 'space_line_bleed') {
                    turret.specialBonuses.lineBleedEnabled = true;
                }
                if (upgrade.id === 'space_phase_lock') {
                    turret.specialBonuses.phaseLockEnabled = true;
                }
                if (upgrade.id === 'space_extra_line') {
                    turret.specialBonuses.extraLineEnabled = true;
                }
                if (upgrade.id === 'space_line_slow') {
                    turret.specialBonuses.lineSlowEnabled = true;
                }
                if (upgrade.id === 'space_collapse') {
                    turret.specialBonuses.collapseDamageEnabled = true;
                }
                if (upgrade.id === 'space_block_projectiles') {
                    turret.specialBonuses.blockProjectiles = true;
                }
                if (upgrade.id === 'space_cooldown_slow') {
                    turret.specialBonuses.cooldownSlowEnabled = true;
                }
                break;
                
            case 'POISON':
                if (upgrade.id === 'poison_armor_reduction') {
                    turret.specialBonuses.armorReductionPerTick = (turret.specialBonuses.armorReductionPerTick || 0) + 2;
                }
                if (upgrade.id === 'poison_damage_boost') {
                    turret.specialBonuses.poisonDamageMultiplier = (turret.specialBonuses.poisonDamageMultiplier || 1) + 0.40;
                }
                if (upgrade.id === 'poison_tick_boost') {
                    turret.specialBonuses.poisonTickDamageBonus = (turret.specialBonuses.poisonTickDamageBonus || 0) + 0.30;
                }
                if (upgrade.id === 'poison_death_puddle') {
                    turret.specialBonuses.deathPuddleEnabled = true;
                }
                if (upgrade.id === 'poison_double_slow') {
                    turret.specialBonuses.poisonDoubleSlow = true;
                }
                if (upgrade.id === 'poison_multi_stack') {
                    turret.specialBonuses.multiPoisonStack = true;
                }
                if (upgrade.id === 'poison_ignore_heal') {
                    turret.specialBonuses.ignoreHeal = true;
                }
                if (upgrade.id === 'poison_long_range') {
                    turret.specialBonuses.longRangePoisonBonus = (turret.specialBonuses.longRangePoisonBonus || 0) + 0.40;
                }
                if (upgrade.id === 'poison_low_hp_double') {
                    turret.specialBonuses.lowHPDoubleDamage = true;
                }
                if (upgrade.id === 'poison_aura') {
                    turret.specialBonuses.poisonAuraEnabled = true;
                }
                if (upgrade.id === 'poison_duration') {
                    turret.specialBonuses.poisonDurationMultiplier = (turret.specialBonuses.poisonDurationMultiplier || 1) + 1.0;
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
                damage *= (1 + turret.specialBonuses.longRangeBonus);
            }
            
            if (turret.weaponType === 'POISON' && turret.specialBonuses.longRangePoisonBonus && distance > 300) {
                damage *= (1 + turret.specialBonuses.longRangePoisonBonus);
            }
            
            if (turret.weaponType === 'SHOTGUN' && turret.specialBonuses.closeRangeBonus && distance < 150) {
                const closeBonus = 1 + turret.specialBonuses.closeRangeBonus * (1 - distance / 150);
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
    
    getEffectiveAttackSpeed(baseAttackSpeed, turret = null) {
        let speed = baseAttackSpeed / this.globalBonuses.attackSpeedBonus;
        
        if (turret && turret.specialBonuses && turret.specialBonuses.attackSpeedBonus) {
            speed = speed / turret.specialBonuses.attackSpeedBonus;
        }
        
        return speed;
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
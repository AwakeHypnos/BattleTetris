// 游戏常量定义
const CONSTANTS = {
    // 游戏区域尺寸
    GRID_WIDTH: 16,
    GRID_HEIGHT: 20,
    CELL_SIZE: 30,
    
    // 方块大小范围
    MIN_BLOCK_SIZE: 1,
    MAX_BLOCK_SIZE: 4,
    
    // 颜色定义
    COLORS: {
        EMPTY: '#16213e',
        RED: '#e94560',
        BLUE: '#0f3460',
        GREEN: '#4ecca3',
        YELLOW: '#f9ed69',
        PURPLE: '#a66cff',
        ORANGE: '#ff8c00',
        CYAN: '#00d9ff'
    },
    
    // 方块颜色列表
    BLOCK_COLORS: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE'],
    
    // 消除条件
    CLEAR_THRESHOLD: 4,
    
    // 分数系统
    SCORE: {
        BASE: 0,
        PER_BLOCK: 5,
        COMBO_BUFF: 0.05,
        MAX_COMBO_BUFF: 10,
        COMBO_BONUS_PER: 2,
        LEVEL_BUFF: 0.10,
        MAX_MULTIPLIER: 2.0
    },
    
    // 等级系统
    LEVEL: {
        SCORE_PER_LEVEL: 100,
        BASE_LINES_PER_LEVEL: 10,
        SPEED_INCREASE: 0.95
    },
    
    // 初始下落速度（毫秒）
    INITIAL_SPEED: 1000,
    
    // 加速下落速度
    FAST_SPEED: 100,
    
    // 存档键名
    SAVE_KEY: 'battle_tetris_save',
    
    // ============================================
    // 塔防系统常量
    // ============================================
    
    // 塔防区域尺寸
    DEFENSE: {
        CANVAS_WIDTH: 480,
        CANVAS_HEIGHT: 750,
        WALL_HEIGHT: 60,
        TURRET_SLOTS: 7,
        TURRET_SLOT_WIDTH: 50
    },
    
    // 颜色与武器对应关系
    WEAPON_COLOR_MAP: {
        RED: 'FIRE',
        ORANGE: 'PIERCE',
        BLUE: 'ICE',
        GREEN: 'POISON',
        PURPLE: 'SPACE',
        YELLOW: 'SHOTGUN'
    },
    
    // 武器类型名称
    WEAPON_NAMES: {
        FIRE: '焰爆弹炮台',
        PIERCE: '穿甲弹炮台',
        ICE: '冰结弹炮台',
        POISON: '毒液弹炮台',
        SPACE: '空间弹炮台',
        SHOTGUN: '散弹炮台'
    },
    
    // 武器基础属性（数值平衡）
    WEAPONS: {
        FIRE: {
            damage: 6,
            attackSpeed: 1000,
            range: 250,
            aoeRadius: 60,
            bulletSpeed: 8,
            color: '#e94560',
            description: '小范围AOE伤害'
        },
        PIERCE: {
            damage: 5,
            attackSpeed: 1200,
            range: 500,
            pierceCount: 2,
            bulletSpeed: 12,
            color: '#ff8c00',
            description: '穿透多个敌人的直线伤害'
        },
        ICE: {
            damage: 7,
            attackSpeed: 900,
            range: 250,
            freezeDuration: 2500,
            slowPercent: 0.6,
            bulletSpeed: 7,
            color: '#0f3460',
            description: '伤害输出+短暂冰冻减速'
        },
        POISON: {
            damage: 2,
            attackSpeed: 1500,
            range: 600,
            aoeRadius: 50,
            poisonDamage: 2,
            poisonDuration: 6000,
            poisonTickRate: 1000,
            bulletSpeed: 6,
            color: '#4ecca3',
            description: '范围伤害+持续中毒伤害'
        },
        SPACE: {
            damage: 7,
            attackSpeed: 1500,
            range: 350,
            lineWidth: 8,
            lineDuration: 2000,
            lineWidthMultiplier: 0.25,
            blockCount: 3,
            bulletSpeed: 10,
            color: '#a66cff',
            description: '生成阻拦横线+持续伤害'
        },
        SHOTGUN: {
            damage: 6,
            attackSpeed: 800,
            range: 220,
            bulletCount: 6,
            spreadAngle: 50,
            bulletSpeed: 9,
            color: '#f9ed69',
            description: '多方向散射攻击效果'
        }
    },
    
    // 新升级系统 - 每50分触发一次升级选择
    UPGRADE_SYSTEM: {
        SCORE_THRESHOLD: 50,
        MAX_GENERAL_DAMAGE_BONUS: 0.80,
        MAX_GENERAL_ATTACK_SPEED_BONUS: 0.80,
        MAX_SCORE_BONUS: 1.0,
        MAX_DURATION_BONUS: 1.0,
        MAX_ARMOR_REDUCTION: 20
    },
    
    // 武器升级积分阈值（保留旧系统用于解锁新武器）
    WEAPON_LEVEL_THRESHOLDS: {
        1: 100,
        2: 200,
        3: 300,
        4: 400,
        5: 500
    },
    
    // 武器升级加成比例
    WEAPON_UPGRADE_BONUS: {
        damage: 0.25,
        attackSpeed: 0.15,
        range: 0.12
    },
    
    // 敌人属性（数值平衡）
    ENEMY: {
        baseHP: 25,
        baseSpeed: 0.2,
        baseSpawnInterval: 3000,
        minSpawnInterval: 1000,
        size: 28,
        scorePerKill: 10,
        scorePerHP: 0.5
    },
    
    // 敌人生成配置
    ENEMY_SPAWN: {
        baseCount: 1,
        extraCountPer30Seconds: 2,
        waveIntervalMinutes: 3,
        waveBaseCount: 15,
        waveIncrementCount: 8,
        maxSpawnPerBatch: 20,
        maxEnemiesOnScreen: 200,
        criticalEnemyCount: 100,
        criticalHpMultiplier: 1.5,
        criticalDefenseMultiplier: 2.0,
        waveGapSeconds: 8,
        wave1Count: 15,
        wave2Count: 18,
        wave3Count: 15,
        wave4Count: 12,
        wave5BaseCount: 20,
        wave5IncrementPerWave: 10
    },
    
    // 敌人难度曲线 - 1分钟后加快增长，无上限
    ENEMY_DIFFICULTY: {
        baseHpIncreasePer30Seconds: 6,
        acceleratedHpIncreasePer30Seconds: 15,
        baseSpeedIncreasePerMinute: 0.015,
        acceleratedSpeedIncreasePerMinute: 0.04,
        accelerationStartTime: 60,
        maxSpeedMultiplier: null,
        acceleratedHpMultiplierAfter60Seconds: 2.5
    },
    
    // 敌人类型
    ENEMY_TYPES: {
        NORMAL: { hpMultiplier: 1.0, speedMultiplier: 1.0, damageToWall: 10, color: '#ff4757', name: '普通敌人' },
        FAST: { hpMultiplier: 0.6, speedMultiplier: 1.8, damageToWall: 5, color: '#ffa502', name: '快速敌人' },
        TANK: { hpMultiplier: 2.5, speedMultiplier: 0.6, damageToWall: 25, color: '#2f3542', name: '重装敌人' },
        ELITE: { hpMultiplier: 3.0, speedMultiplier: 0.8, damageToWall: 20, color: '#8b00ff', name: '精英敌人' }
    },
    
    // 城墙属性
    WALL: {
        maxHP: 100,
        damagePerEnemy: 10,
        scorePenaltyPerDamage: 5
    },
    
    // 战斗加成系统
    BONUS_SYSTEM: {
        DAMAGE_BONUS_PER_TETRIS_SCORE: 0.001,
        MAX_DAMAGE_BONUS: 2.0,
        TYPES: {
            DAMAGE: { name: '伤害加成', key: 'damageBonus', maxValue: 2.0 },
            ATTACK_SPEED: { name: '攻速加成', key: 'attackSpeedBonus', maxValue: 1.5 },
            RANGE: { name: '范围加成', key: 'rangeBonus', maxValue: 1.5 },
            BULLET_COUNT: { name: '子弹数目加成', key: 'bulletCountBonus', maxValue: 1.5 }
        }
    },
    
    // 综合评分系统
    SCORING: {
        TETRIS_WEIGHT: 0.4,
        DEFENSE_WEIGHT: 0.6,
        KILL_BONUS: 15,
        COMBO_BONUS: 5,
        WALL_HP_BONUS: 100,
        SURVIVAL_TIME_BONUS: 0.5,
        LEVEL_BONUS: 50
    },
    
    // 游戏评价等级
    RATINGS: {
        S: { minScore: 5000, name: 'S级 - 传奇战士', color: '#ffd700' },
        A: { minScore: 3000, name: 'A级 - 精英战士', color: '#ff4757' },
        B: { minScore: 1500, name: 'B级 - 熟练战士', color: '#ffa502' },
        C: { minScore: 500, name: 'C级 - 新手战士', color: '#2ed573' },
        D: { minScore: 0, name: 'D级 - 新兵', color: '#57606f' }
    },
    
    // 暂停菜单
    PAUSE_MENU: {
        OPTIONS: ['继续游戏', '读取存档', '保存存档', '返回主菜单', '退出游戏']
    },
    
    // 技能系统常量
    SKILLS: {
        FULL_SCREEN_BOMB: {
            name: '全屏轰炸',
            description: '连击数达到5及以上，对所有敌人造成高额AOE伤害',
            comboRequirement: 5,
            baseDamage: 100,
            color: '#e94560'
        },
        TURRET_OVERLOAD: {
            name: '炮塔超载',
            description: '消耗8个及以上的同色消除，所有炮塔攻速变为1.5倍，持续3秒',
            sameColorRequirement: 8,
            attackSpeedMultiplier: 1.5,
            duration: 3000,
            color: '#ff8c00'
        },
        EMERGENCY_REPAIR: {
            name: '紧急修复',
            description: '消耗5个及以上绿色消除，城堡血量回满',
            greenRequirement: 5,
            color: '#4ecca3'
        }
    },
    
    // 方块献祭系统常量
    SACRIFICE: {
        REFRESH_BOARD: {
            name: '刷新布局',
            description: '随机刷新场上方块布局',
            blockCount: 5,
            color: '#00d9ff'
        },
        TEMP_SHIELD: {
            name: '临时护盾',
            description: '给城堡加一层临时护盾',
            blockCount: 10,
            shieldAmount: 50,
            color: '#a66cff'
        },
        DOUBLE_EFFECT: {
            name: '效果翻倍',
            description: '下一次消除效果翻倍',
            blockCount: 15,
            color: '#f9ed69'
        }
    },

    // ============================================
    // 关卡系统常量
    // ============================================
    LEVELS: {
        1: {
            name: '第一关 - 新手入门',
            description: '熟悉基本操作，只有普通敌人',
            waves: [
                { types: ['NORMAL'], count: 8, duration: 20 },
                { types: ['NORMAL'], count: 10, duration: 20 },
                { types: ['NORMAL'], count: 12, duration: 20 }
            ],
            availableColors: ['RED', 'ORANGE'],
            availableWeapons: ['FIRE', 'PIERCE'],
            availableEnemies: ['NORMAL'],
            difficultyMultiplier: 1.0,
            sacrificeEnabled: false,
            initialWeapon: 'FIRE'
        },
        2: {
            name: '第二关 - 速度挑战',
            description: '快速敌人登场，需要冰冻减速',
            waves: [
                { types: ['NORMAL'], count: 10, duration: 18 },
                { types: ['NORMAL'], count: 12, duration: 18 },
                { types: ['NORMAL'], count: 12, duration: 18 },
                { types: ['FAST'], count: 15, duration: 15 }
            ],
            availableColors: ['RED', 'ORANGE', 'BLUE'],
            availableWeapons: ['FIRE', 'PIERCE', 'ICE'],
            availableEnemies: ['NORMAL', 'FAST'],
            difficultyMultiplier: 1.1,
            sacrificeEnabled: false,
            initialWeapon: 'FIRE'
        },
        3: {
            name: '第三关 - 重装来袭',
            description: '重装敌人血量高，需要持续伤害',
            waves: [
                { types: ['NORMAL'], count: 12, duration: 16 },
                { types: ['NORMAL'], count: 14, duration: 16 },
                { types: ['FAST'], count: 16, duration: 14 },
                { types: ['NORMAL', 'FAST'], count: 18, duration: 18 },
                { types: ['TANK'], count: 8, duration: 25 }
            ],
            availableColors: ['RED', 'ORANGE', 'BLUE', 'GREEN'],
            availableWeapons: ['FIRE', 'PIERCE', 'ICE', 'POISON'],
            availableEnemies: ['NORMAL', 'FAST', 'TANK'],
            difficultyMultiplier: 1.2,
            sacrificeEnabled: false,
            initialWeapon: 'FIRE'
        },
        4: {
            name: '第四关 - 精英降临',
            description: '精英敌人出现，需要全面防御',
            waves: [
                { types: ['NORMAL'], count: 14, duration: 15 },
                { types: ['FAST'], count: 18, duration: 12 },
                { types: ['NORMAL', 'FAST'], count: 20, duration: 16 },
                { types: ['TANK'], count: 10, duration: 22 },
                { types: ['NORMAL', 'TANK'], count: 18, duration: 20 },
                { types: ['ELITE'], count: 6, duration: 30 }
            ],
            availableColors: ['RED', 'ORANGE', 'BLUE', 'GREEN', 'PURPLE'],
            availableWeapons: ['FIRE', 'PIERCE', 'ICE', 'POISON', 'SPACE'],
            availableEnemies: ['NORMAL', 'FAST', 'TANK', 'ELITE'],
            difficultyMultiplier: 1.35,
            sacrificeEnabled: false,
            initialWeapon: 'FIRE'
        },
        5: {
            name: '第五关 - 全面战争',
            description: '所有武器和敌人全部开放',
            waves: [
                { types: ['NORMAL'], count: 16, duration: 14 },
                { types: ['FAST'], count: 20, duration: 11 },
                { types: ['NORMAL', 'FAST'], count: 22, duration: 15 },
                { types: ['TANK'], count: 12, duration: 20 },
                { types: ['NORMAL', 'TANK'], count: 20, duration: 18 },
                { types: ['ELITE'], count: 8, duration: 28 },
                { types: ['NORMAL', 'FAST', 'TANK', 'ELITE'], count: 25, duration: 25 }
            ],
            availableColors: ['RED', 'ORANGE', 'BLUE', 'GREEN', 'PURPLE', 'YELLOW'],
            availableWeapons: ['FIRE', 'PIERCE', 'ICE', 'POISON', 'SPACE', 'SHOTGUN'],
            availableEnemies: ['NORMAL', 'FAST', 'TANK', 'ELITE'],
            difficultyMultiplier: 1.5,
            sacrificeEnabled: false,
            initialWeapon: 'FIRE'
        },
        6: {
            name: '第六关 - 难度攀升',
            description: '敌人强度和数量大幅提升',
            waves: [
                { types: ['NORMAL'], count: 18, duration: 13 },
                { types: ['FAST'], count: 22, duration: 10 },
                { types: ['TANK'], count: 14, duration: 18 },
                { types: ['NORMAL', 'FAST'], count: 25, duration: 14 },
                { types: ['ELITE'], count: 10, duration: 26 },
                { types: ['TANK', 'ELITE'], count: 15, duration: 28 },
                { types: ['NORMAL', 'FAST', 'TANK'], count: 28, duration: 20 },
                { types: ['NORMAL', 'FAST', 'TANK', 'ELITE'], count: 30, duration: 22 }
            ],
            availableColors: ['RED', 'ORANGE', 'BLUE', 'GREEN', 'PURPLE', 'YELLOW'],
            availableWeapons: ['FIRE', 'PIERCE', 'ICE', 'POISON', 'SPACE', 'SHOTGUN'],
            availableEnemies: ['NORMAL', 'FAST', 'TANK', 'ELITE'],
            difficultyMultiplier: 1.7,
            sacrificeEnabled: false,
            initialWeapon: 'FIRE'
        },
        7: {
            name: '第七关 - 献祭之力',
            description: '方块献祭功能开放，可消耗方块换取增益',
            waves: [
                { types: ['NORMAL'], count: 20, duration: 12 },
                { types: ['FAST'], count: 25, duration: 9 },
                { types: ['TANK'], count: 16, duration: 17 },
                { types: ['ELITE'], count: 12, duration: 24 },
                { types: ['NORMAL', 'FAST'], count: 28, duration: 13 },
                { types: ['TANK', 'ELITE'], count: 18, duration: 26 },
                { types: ['NORMAL', 'FAST', 'TANK'], count: 32, duration: 18 },
                { types: ['NORMAL', 'FAST', 'TANK', 'ELITE'], count: 35, duration: 20 },
                { types: ['TANK', 'ELITE'], count: 20, duration: 28 }
            ],
            availableColors: ['RED', 'ORANGE', 'BLUE', 'GREEN', 'PURPLE', 'YELLOW'],
            availableWeapons: ['FIRE', 'PIERCE', 'ICE', 'POISON', 'SPACE', 'SHOTGUN'],
            availableEnemies: ['NORMAL', 'FAST', 'TANK', 'ELITE'],
            difficultyMultiplier: 1.9,
            sacrificeEnabled: true,
            initialWeapon: 'FIRE'
        },
        8: {
            name: '第八关 - 极限挑战',
            description: '敌人强度达到新高度',
            waves: [
                { types: ['FAST'], count: 28, duration: 8 },
                { types: ['TANK'], count: 18, duration: 16 },
                { types: ['ELITE'], count: 14, duration: 22 },
                { types: ['NORMAL', 'FAST'], count: 32, duration: 12 },
                { types: ['TANK', 'ELITE'], count: 20, duration: 24 },
                { types: ['NORMAL', 'FAST', 'TANK'], count: 36, duration: 16 },
                { types: ['FAST', 'ELITE'], count: 25, duration: 18 },
                { types: ['NORMAL', 'FAST', 'TANK', 'ELITE'], count: 40, duration: 18 },
                { types: ['TANK', 'ELITE'], count: 22, duration: 26 },
                { types: ['NORMAL', 'FAST', 'TANK', 'ELITE'], count: 45, duration: 20 }
            ],
            availableColors: ['RED', 'ORANGE', 'BLUE', 'GREEN', 'PURPLE', 'YELLOW'],
            availableWeapons: ['FIRE', 'PIERCE', 'ICE', 'POISON', 'SPACE', 'SHOTGUN'],
            availableEnemies: ['NORMAL', 'FAST', 'TANK', 'ELITE'],
            difficultyMultiplier: 2.15,
            sacrificeEnabled: true,
            initialWeapon: 'FIRE'
        },
        9: {
            name: '第九关 - 地狱模式',
            description: '精英敌人大量出现',
            waves: [
                { types: ['FAST'], count: 32, duration: 7 },
                { types: ['TANK'], count: 20, duration: 15 },
                { types: ['ELITE'], count: 16, duration: 20 },
                { types: ['FAST', 'ELITE'], count: 28, duration: 15 },
                { types: ['TANK', 'ELITE'], count: 22, duration: 22 },
                { types: ['NORMAL', 'FAST', 'TANK'], count: 40, duration: 14 },
                { types: ['ELITE'], count: 20, duration: 20 },
                { types: ['NORMAL', 'FAST', 'TANK', 'ELITE'], count: 45, duration: 16 },
                { types: ['FAST', 'TANK', 'ELITE'], count: 35, duration: 18 },
                { types: ['TANK', 'ELITE'], count: 25, duration: 24 },
                { types: ['NORMAL', 'FAST', 'TANK', 'ELITE'], count: 50, duration: 18 }
            ],
            availableColors: ['RED', 'ORANGE', 'BLUE', 'GREEN', 'PURPLE', 'YELLOW'],
            availableWeapons: ['FIRE', 'PIERCE', 'ICE', 'POISON', 'SPACE', 'SHOTGUN'],
            availableEnemies: ['NORMAL', 'FAST', 'TANK', 'ELITE'],
            difficultyMultiplier: 2.4,
            sacrificeEnabled: true,
            initialWeapon: 'FIRE'
        },
        10: {
            name: '第十关 - 最终决战',
            description: '终极挑战，考验你的全部实力',
            waves: [
                { types: ['FAST'], count: 35, duration: 6 },
                { types: ['TANK'], count: 22, duration: 14 },
                { types: ['ELITE'], count: 18, duration: 18 },
                { types: ['FAST', 'ELITE'], count: 32, duration: 14 },
                { types: ['TANK', 'ELITE'], count: 25, duration: 20 },
                { types: ['NORMAL', 'FAST', 'TANK'], count: 45, duration: 13 },
                { types: ['ELITE'], count: 22, duration: 18 },
                { types: ['FAST', 'TANK', 'ELITE'], count: 40, duration: 16 },
                { types: ['NORMAL', 'FAST', 'TANK', 'ELITE'], count: 50, duration: 15 },
                { types: ['TANK', 'ELITE'], count: 28, duration: 22 },
                { types: ['FAST', 'ELITE'], count: 35, duration: 14 },
                { types: ['NORMAL', 'FAST', 'TANK', 'ELITE'], count: 55, duration: 16 },
                { types: ['ELITE', 'TANK'], count: 35, duration: 25 },
                { types: ['NORMAL', 'FAST', 'TANK', 'ELITE'], count: 60, duration: 18 }
            ],
            availableColors: ['RED', 'ORANGE', 'BLUE', 'GREEN', 'PURPLE', 'YELLOW'],
            availableWeapons: ['FIRE', 'PIERCE', 'ICE', 'POISON', 'SPACE', 'SHOTGUN'],
            availableEnemies: ['NORMAL', 'FAST', 'TANK', 'ELITE'],
            difficultyMultiplier: 2.7,
            sacrificeEnabled: true,
            initialWeapon: 'FIRE'
        }
    },

    // 关卡解锁配置
    LEVEL_UNLOCK: {
        maxUnlockedLevel: 1,
        unlockedLevels: [1]
    }
};
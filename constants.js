// 游戏常量定义
const CONSTANTS = {
    // 游戏区域尺寸
    GRID_WIDTH: 10,
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
        maxEnemiesOnScreen: 50
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
    }
};
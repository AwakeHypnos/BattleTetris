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
        BASE: 20,
        PER_BLOCK: 5,
        COMBO_BUFF: 0.05,
        MAX_COMBO_BUFF: 10,
        COMBO_BONUS_PER: 2,
        LEVEL_BUFF: 0.10,
        MAX_MULTIPLIER: 2.0
    },
    
    // 等级系统
    LEVEL: {
        BASE_LINES_PER_LEVEL: 10,
        SPEED_INCREASE: 0.85
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
            damage: 25,
            attackSpeed: 1200,
            range: 200,
            aoeRadius: 60,
            bulletSpeed: 8,
            color: '#e94560',
            description: '小范围AOE伤害'
        },
        PIERCE: {
            damage: 35,
            attackSpeed: 1500,
            range: 500,
            pierceCount: 5,
            bulletSpeed: 12,
            color: '#ff8c00',
            description: '穿透多个敌人的直线伤害'
        },
        ICE: {
            damage: 20,
            attackSpeed: 1000,
            range: 250,
            freezeDuration: 2000,
            slowPercent: 0.5,
            bulletSpeed: 7,
            color: '#0f3460',
            description: '伤害输出+短暂冰冻减速'
        },
        POISON: {
            damage: 15,
            attackSpeed: 1100,
            range: 280,
            poisonDamage: 8,
            poisonDuration: 5000,
            poisonTickRate: 500,
            bulletSpeed: 6,
            color: '#4ecca3',
            description: '伤害输出+持续中毒伤害'
        },
        SPACE: {
            damage: 18,
            attackSpeed: 1800,
            range: 350,
            lineWidth: 8,
            lineDuration: 3000,
            bulletSpeed: 10,
            color: '#a66cff',
            description: '生成阻拦横线+持续伤害'
        },
        SHOTGUN: {
            damage: 12,
            attackSpeed: 900,
            range: 220,
            bulletCount: 5,
            spreadAngle: 45,
            bulletSpeed: 9,
            color: '#f9ed69',
            description: '多方向散射攻击效果'
        }
    },
    
    // 武器升级积分阈值（数值平衡）
    WEAPON_LEVEL_THRESHOLDS: {
        1: 50,
        2: 150,
        3: 300,
        4: 500,
        5: 800
    },
    
    // 武器升级加成比例
    WEAPON_UPGRADE_BONUS: {
        damage: 0.15,
        attackSpeed: 0.10,
        range: 0.10
    },
    
    // 敌人属性（数值平衡）
    ENEMY: {
        baseHP: 80,
        baseSpeed: 2.5,
        baseSpawnInterval: 1500,
        minSpawnInterval: 500,
        size: 28,
        scorePerKill: 10,
        scorePerHP: 0.5
    },
    
    // 敌人难度曲线
    ENEMY_DIFFICULTY: {
        hpIncreasePerMinute: 15,
        speedIncreasePerMinute: 0.05,
        spawnRateIncreasePerMinute: 200,
        maxHpMultiplier: 8,
        maxSpeedMultiplier: 2.5
    },
    
    // 敌人类型
    ENEMY_TYPES: {
        NORMAL: { hpMultiplier: 1.0, speedMultiplier: 1.0, color: '#ff4757', name: '普通敌人' },
        FAST: { hpMultiplier: 0.6, speedMultiplier: 1.8, color: '#ffa502', name: '快速敌人' },
        TANK: { hpMultiplier: 2.5, speedMultiplier: 0.6, color: '#2f3542', name: '重装敌人' },
        ELITE: { hpMultiplier: 3.0, speedMultiplier: 0.8, color: '#8b00ff', name: '精英敌人' }
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
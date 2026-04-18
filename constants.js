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
    BLOCK_COLORS: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE', 'CYAN'],
    
    // 消除条件
    CLEAR_THRESHOLD: 4,
    
    // 分数系统
    SCORE: {
        BASE: 100,
        PER_BLOCK: 25,
        COMBO_MULTIPLIER: 1.5,
        LEVEL_MULTIPLIER: 1.2
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
    SAVE_KEY: 'battle_tetris_save'
};
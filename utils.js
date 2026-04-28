// 工具函数
const Utils = {
    /**
     * 生成指定范围内的随机整数
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 随机整数
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * 从数组中随机选择一个元素
     * @param {Array} arr - 输入数组
     * @returns {*} 随机选择的元素
     */
    randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },
    
    /**
     * 深拷贝对象
     * @param {*} obj - 要拷贝的对象
     * @returns {*} 拷贝后的对象
     */
    deepCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    /**
     * 计算两个方块位置是否相邻
     * @param {Object} pos1 - 第一个位置 {x, y}
     * @param {Object} pos2 - 第二个位置 {x, y}
     * @returns {boolean} 是否相邻
     */
    isAdjacent(pos1, pos2) {
        const dx = Math.abs(pos1.x - pos2.x);
        const dy = Math.abs(pos1.y - pos2.y);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    },
    
    /**
     * 格式化分数显示
     * @param {number} score - 分数
     * @returns {string} 格式化后的分数字符串
     */
    formatScore(score) {
        return score.toLocaleString();
    },
    
    /**
     * 生成随机方块形状
     * @param {number} size - 方块大小（1-4）
     * @returns {Array} 方块形状数组
     */
    generateBlockShape(size) {
        const shapes = {
            1: [
                [[0, 0]]
            ],
            2: [
                [[0, 0], [1, 0]],
                [[0, 0], [0, 1]]
            ],
            3: [
                [[0, 0], [1, 0], [2, 0]],
                [[0, 0], [0, 1], [0, 2]],
                [[0, 0], [1, 0], [0, 1]],
                [[0, 0], [1, 0], [1, 1]],
                [[0, 0], [0, 1], [1, 1]],
                [[0, 0], [1, 0], [0, -1]]
            ],
            4: [
                [[0, 0], [1, 0], [2, 0], [3, 0]],
                [[0, 0], [0, 1], [0, 2], [0, 3]],
                [[0, 0], [1, 0], [2, 0], [2, 1]],
                [[0, 0], [0, 1], [1, 1], [2, 1]],
                [[0, 0], [1, 0], [0, 1], [0, 2]],
                [[0, 0], [1, 0], [2, 0], [1, 1]],
                [[0, 0], [1, 0], [1, 1], [2, 1]],
                [[0, 0], [0, 1], [1, 0], [1, 1]]
            ]
        };
        
        return this.randomChoice(shapes[size]);
    },
    
    /**
     * 旋转方块形状
     * @param {Array} shape - 方块形状数组
     * @returns {Array} 旋转后的形状
     */
    rotateShape(shape) {
        return shape.map(([x, y]) => [y, -x]);
    },
    
    /**
     * 检查游戏状态
     * @param {Object} gameState - 游戏状态
     * @returns {boolean} 是否有效
     */
    validateGameState(gameState) {
        if (!gameState || typeof gameState !== 'object') return false;
        
        const requiredFields = ['grid', 'score', 'level', 'combo', 'gameOver'];
        return requiredFields.every(field => gameState.hasOwnProperty(field));
    },
    
    /**
     * Fisher-Yates 洗牌算法，随机打乱数组
     * @param {Array} arr - 要打乱的数组
     * @returns {Array} 打乱后的数组（修改原数组）
     */
    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
};
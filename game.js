// 游戏核心逻辑
class BattleTetris {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.initCanvas();
        this.initGameState();
        this.initEventListeners();
        this.render();
    }
    
    /**
     * 初始化画布
     */
    initCanvas() {
        this.canvas.width = CONSTANTS.GRID_WIDTH * CONSTANTS.CELL_SIZE;
        this.canvas.height = CONSTANTS.GRID_HEIGHT * CONSTANTS.CELL_SIZE;
    }
    
    /**
     * 初始化游戏状态
     */
    initGameState() {
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.level = 1;
        this.combo = 0;
        this.gameOver = false;
        this.isPaused = false;
        this.isStarted = false;
        this.dropTimer = null;
        this.currentPiece = null;
        this.nextPiece = null;
        this.dropSpeed = CONSTANTS.INITIAL_SPEED;
        this.isFastDrop = false;
    }
    
    /**
     * 创建空游戏网格
     * @returns {Array} 空网格
     */
    createEmptyGrid() {
        const grid = [];
        for (let y = 0; y < CONSTANTS.GRID_HEIGHT; y++) {
            const row = [];
            for (let x = 0; x < CONSTANTS.GRID_WIDTH; x++) {
                row.push(null);
            }
            grid.push(row);
        }
        return grid;
    }
    
    /**
     * 生成新方块
     * @returns {Object} 方块对象
     */
    generatePiece() {
        const size = Utils.randomInt(CONSTANTS.MIN_BLOCK_SIZE, CONSTANTS.MAX_BLOCK_SIZE);
        const color = Utils.randomChoice(CONSTANTS.BLOCK_COLORS);
        const shape = Utils.generateBlockShape(size);
        
        // 计算初始位置（居中）
        let minX = Infinity, maxX = -Infinity;
        shape.forEach(([x, y]) => {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
        });
        
        const centerX = Math.floor((CONSTANTS.GRID_WIDTH - (maxX - minX + 1)) / 2) - minX;
        
        return {
            shape,
            color,
            x: centerX,
            y: 0
        };
    }
    
    /**
     * 检查方块是否可以移动到指定位置
     * @param {Object} piece - 方块对象
     * @param {number} offsetX - X偏移
     * @param {number} offsetY - Y偏移
     * @returns {boolean} 是否可以移动
     */
    canMove(piece, offsetX = 0, offsetY = 0) {
        if (!piece) return false;
        
        const newX = piece.x + offsetX;
        const newY = piece.y + offsetY;
        
        return piece.shape.every(([x, y]) => {
            const gridX = newX + x;
            const gridY = newY + y;
            
            // 检查边界
            if (gridX < 0 || gridX >= CONSTANTS.GRID_WIDTH) return false;
            if (gridY >= CONSTANTS.GRID_HEIGHT) return false;
            if (gridY < 0) return true; // 允许在顶部外
            
            // 检查是否与已有方块重叠
            return this.grid[gridY][gridX] === null;
        });
    }
    
    /**
     * 移动方块
     * @param {number} offsetX - X偏移
     * @param {number} offsetY - Y偏移
     * @returns {boolean} 是否移动成功
     */
    movePiece(offsetX, offsetY) {
        if (this.gameOver || this.isPaused || !this.currentPiece) return false;
        
        if (this.canMove(this.currentPiece, offsetX, offsetY)) {
            this.currentPiece.x += offsetX;
            this.currentPiece.y += offsetY;
            this.render();
            return true;
        }
        
        // 如果不能向下移动，固定方块
        if (offsetY > 0) {
            this.lockPiece();
        }
        
        return false;
    }
    
    /**
     * 旋转方块
     */
    rotatePiece() {
        if (this.gameOver || this.isPaused || !this.currentPiece) return;
        
        const rotatedShape = Utils.rotateShape(this.currentPiece.shape);
        const originalShape = this.currentPiece.shape;
        
        this.currentPiece.shape = rotatedShape;
        
        // 检查是否可以旋转，如果不行，尝试墙踢
        if (!this.canMove(this.currentPiece)) {
            // 尝试左右移动
            const kicks = [-1, 1, -2, 2];
            let kicked = false;
            
            for (const kick of kicks) {
                if (this.canMove(this.currentPiece, kick, 0)) {
                    this.currentPiece.x += kick;
                    kicked = true;
                    break;
                }
            }
            
            if (!kicked) {
                this.currentPiece.shape = originalShape;
            }
        }
        
        this.render();
    }
    
    /**
     * 固定方块到网格
     */
    lockPiece() {
        if (!this.currentPiece) return;
        
        // 检查游戏结束
        if (this.currentPiece.y <= 0) {
            this.endGame();
            return;
        }
        
        // 将方块添加到网格
        this.currentPiece.shape.forEach(([x, y]) => {
            const gridX = this.currentPiece.x + x;
            const gridY = this.currentPiece.y + y;
            
            if (gridY >= 0 && gridY < CONSTANTS.GRID_HEIGHT) {
                this.grid[gridY][gridX] = this.currentPiece.color;
            }
        });
        
        // 检查并消除连接的同色方块
        this.checkAndClear();
        
        // 生成新方块
        this.spawnNewPiece();
    }
    
    /**
     * 生成新方块
     */
    spawnNewPiece() {
        this.currentPiece = this.nextPiece || this.generatePiece();
        this.nextPiece = this.generatePiece();
        
        // 检查是否可以生成新方块，如果不行，游戏结束
        if (!this.canMove(this.currentPiece)) {
            this.endGame();
        }
        
        this.render();
    }
    
    /**
     * 检查并消除连接的同色方块
     */
    checkAndClear() {
        const toClear = new Set();
        
        // 使用BFS查找所有连接的同色方块
        for (let y = 0; y < CONSTANTS.GRID_HEIGHT; y++) {
            for (let x = 0; x < CONSTANTS.GRID_WIDTH; x++) {
                const color = this.grid[y][x];
                if (color && !toClear.has(`${x},${y}`)) {
                    const connected = this.findConnected(x, y, color);
                    if (connected.length >= CONSTANTS.CLEAR_THRESHOLD) {
                        connected.forEach(pos => toClear.add(`${pos.x},${pos.y}`));
                    }
                }
            }
        }
        
        if (toClear.size > 0) {
            this.clearBlocks(toClear);
        }
    }
    
    /**
     * 使用BFS查找连接的同色方块
     * @param {number} startX - 起始X坐标
     * @param {number} startY - 起始Y坐标
     * @param {string} color - 颜色
     * @returns {Array} 连接的方块位置数组
     */
    findConnected(startX, startY, color) {
        const connected = [];
        const visited = new Set();
        const queue = [{x: startX, y: startY}];
        
        while (queue.length > 0) {
            const {x, y} = queue.shift();
            const key = `${x},${y}`;
            
            if (visited.has(key)) continue;
            if (x < 0 || x >= CONSTANTS.GRID_WIDTH) continue;
            if (y < 0 || y >= CONSTANTS.GRID_HEIGHT) continue;
            if (this.grid[y][x] !== color) continue;
            
            visited.add(key);
            connected.push({x, y});
            
            // 检查上下左右
            queue.push({x: x + 1, y});
            queue.push({x: x - 1, y});
            queue.push({x, y: y + 1});
            queue.push({x, y: y - 1});
        }
        
        return connected;
    }
    
    /**
     * 消除指定方块
     * @param {Set} toClear - 要消除的方块位置集合
     */
    clearBlocks(toClear) {
        // 更新分数
        this.updateScore(toClear.size);
        
        // 消除方块
        toClear.forEach(key => {
            const [x, y] = key.split(',').map(Number);
            this.grid[y][x] = null;
        });
        
        // 让上方方块下落
        this.applyGravity();
        
        // 增加连击
        this.combo++;
        
        // 检查是否有新的连接可以消除（连锁反应）
        setTimeout(() => {
            this.checkAndClear();
        }, 100);
    }
    
    /**
     * 应用重力，让空位置上方的方块下落
     */
    applyGravity() {
        for (let x = 0; x < CONSTANTS.GRID_WIDTH; x++) {
            let writePos = CONSTANTS.GRID_HEIGHT - 1;
            
            // 从下往上找非空方块
            for (let y = CONSTANTS.GRID_HEIGHT - 1; y >= 0; y--) {
                if (this.grid[y][x] !== null) {
                    if (y !== writePos) {
                        this.grid[writePos][x] = this.grid[y][x];
                        this.grid[y][x] = null;
                    }
                    writePos--;
                }
            }
        }
    }
    
    /**
     * 更新分数
     * @param {number} blocksCleared - 消除的方块数量
     */
    updateScore(blocksCleared) {
        // 基础分数
        let points = CONSTANTS.SCORE.BASE;
        
        // 每个方块的额外分数
        points += blocksCleared * CONSTANTS.SCORE.PER_BLOCK;
        
        // 连击加成
        if (this.combo > 0) {
            points *= Math.pow(CONSTANTS.SCORE.COMBO_MULTIPLIER, this.combo);
        }
        
        // 等级加成
        points *= Math.pow(CONSTANTS.SCORE.LEVEL_MULTIPLIER, this.level - 1);
        
        // 取整
        points = Math.floor(points);
        
        // 更新分数
        this.score += points;
        
        // 检查是否升级
        this.checkLevelUp();
        
        // 更新UI
        this.updateUI();
    }
    
    /**
     * 检查是否升级
     */
    checkLevelUp() {
        const newLevel = Math.floor(this.score / (CONSTANTS.LEVEL.BASE_LINES_PER_LEVEL * CONSTANTS.SCORE.BASE)) + 1;
        
        if (newLevel > this.level) {
            this.level = newLevel;
            
            // 提高下落速度
            this.dropSpeed = Math.max(100, CONSTANTS.INITIAL_SPEED * Math.pow(CONSTANTS.LEVEL.SPEED_INCREASE, this.level - 1));
            
            // 重置下落定时器
            this.resetDropTimer();
        }
    }
    
    /**
     * 更新UI
     */
    updateUI() {
        document.getElementById('score').textContent = Utils.formatScore(this.score);
        document.getElementById('level').textContent = this.level;
        document.getElementById('combo').textContent = this.combo;
    }
    
    /**
     * 渲染游戏
     */
    render() {
        // 清空画布
        this.ctx.fillStyle = CONSTANTS.COLORS.EMPTY;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格线
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= CONSTANTS.GRID_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * CONSTANTS.CELL_SIZE, 0);
            this.ctx.lineTo(x * CONSTANTS.CELL_SIZE, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= CONSTANTS.GRID_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * CONSTANTS.CELL_SIZE);
            this.ctx.lineTo(this.canvas.width, y * CONSTANTS.CELL_SIZE);
            this.ctx.stroke();
        }
        
        // 绘制已固定的方块
        for (let y = 0; y < CONSTANTS.GRID_HEIGHT; y++) {
            for (let x = 0; x < CONSTANTS.GRID_WIDTH; x++) {
                const color = this.grid[y][x];
                if (color) {
                    this.drawCell(x, y, CONSTANTS.COLORS[color]);
                }
            }
        }
        
        // 绘制当前方块
        if (this.currentPiece) {
            this.currentPiece.shape.forEach(([x, y]) => {
                const gridX = this.currentPiece.x + x;
                const gridY = this.currentPiece.y + y;
                if (gridY >= 0) {
                    this.drawCell(gridX, gridY, CONSTANTS.COLORS[this.currentPiece.color]);
                }
            });
            
            // 绘制下落预览
            this.drawGhost();
        }
        
        // 绘制游戏结束提示
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('游戏结束', this.canvas.width / 2, this.canvas.height / 2 - 30);
            
            this.ctx.font = '20px Arial';
            this.ctx.fillText(`最终分数: ${Utils.formatScore(this.score)}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
            this.ctx.fillText(`等级: ${this.level}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
        
        // 绘制暂停提示
        if (this.isPaused && !this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('暂停中', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    /**
     * 绘制单个方块
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} color - 颜色
     */
    drawCell(x, y, color) {
        const padding = 2;
        const size = CONSTANTS.CELL_SIZE - padding * 2;
        
        // 绘制方块主体
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            x * CONSTANTS.CELL_SIZE + padding,
            y * CONSTANTS.CELL_SIZE + padding,
            size,
            size
        );
        
        // 绘制高光效果
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(
            x * CONSTANTS.CELL_SIZE + padding,
            y * CONSTANTS.CELL_SIZE + padding,
            size,
            size / 3
        );
        
        // 绘制阴影效果
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(
            x * CONSTANTS.CELL_SIZE + padding,
            y * CONSTANTS.CELL_SIZE + padding + size * 2/3,
            size,
            size / 3
        );
    }
    
    /**
     * 绘制下落预览（幽灵方块）
     */
    drawGhost() {
        if (!this.currentPiece) return;
        
        // 计算最低可以下落到的位置
        let dropY = this.currentPiece.y;
        while (this.canMove(this.currentPiece, 0, dropY - this.currentPiece.y + 1)) {
            dropY++;
        }
        
        // 绘制幽灵方块
        this.ctx.globalAlpha = 0.3;
        this.currentPiece.shape.forEach(([x, y]) => {
            const gridX = this.currentPiece.x + x;
            const gridY = dropY + y;
            if (gridY >= 0) {
                this.drawCell(gridX, gridY, CONSTANTS.COLORS[this.currentPiece.color]);
            }
        });
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * 开始游戏
     */
    startGame() {
        this.initGameState();
        this.isStarted = true;
        this.spawnNewPiece();
        this.startDropTimer();
        this.updateUI();
        
        // 更新按钮状态
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('saveBtn').disabled = false;
    }
    
    /**
     * 暂停/继续游戏
     */
    togglePause() {
        if (this.gameOver || !this.isStarted) return;
        
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = this.isPaused ? '继续' : '暂停';
        
        if (this.isPaused) {
            this.stopDropTimer();
        } else {
            this.startDropTimer();
        }
        
        this.render();
    }
    
    /**
     * 游戏结束
     */
    endGame() {
        this.gameOver = true;
        this.stopDropTimer();
        this.render();
        
        // 更新按钮状态
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('saveBtn').disabled = true;
    }
    
    /**
     * 重新开始游戏
     */
    restartGame() {
        this.stopDropTimer();
        this.initGameState();
        this.startGame();
    }
    
    /**
     * 开始下落定时器
     */
    startDropTimer() {
        this.stopDropTimer();
        const speed = this.isFastDrop ? CONSTANTS.FAST_SPEED : this.dropSpeed;
        this.dropTimer = setInterval(() => {
            this.movePiece(0, 1);
        }, speed);
    }
    
    /**
     * 停止下落定时器
     */
    stopDropTimer() {
        if (this.dropTimer) {
            clearInterval(this.dropTimer);
            this.dropTimer = null;
        }
    }
    
    /**
     * 重置下落定时器
     */
    resetDropTimer() {
        if (this.dropTimer) {
            this.startDropTimer();
        }
    }
    
    /**
     * 开始加速下落
     */
    startFastDrop() {
        if (this.gameOver || this.isPaused || !this.isStarted) return;
        this.isFastDrop = true;
        this.startDropTimer();
    }
    
    /**
     * 停止加速下落
     */
    stopFastDrop() {
        if (this.gameOver || this.isPaused || !this.isStarted) return;
        this.isFastDrop = false;
        this.startDropTimer();
    }
    
    /**
     * 存档
     */
    saveGame() {
        if (!this.isStarted) return;
        
        const saveData = {
            grid: this.grid,
            score: this.score,
            level: this.level,
            combo: this.combo,
            dropSpeed: this.dropSpeed,
            currentPiece: this.currentPiece,
            nextPiece: this.nextPiece,
            gameOver: this.gameOver,
            isPaused: this.isPaused,
            savedAt: Date.now()
        };
        
        try {
            localStorage.setItem(CONSTANTS.SAVE_KEY, JSON.stringify(saveData));
            alert('存档成功！');
        } catch (e) {
            console.error('存档失败:', e);
            alert('存档失败，请检查浏览器存储权限。');
        }
    }
    
    /**
     * 读档
     */
    loadGame() {
        try {
            const saveData = localStorage.getItem(CONSTANTS.SAVE_KEY);
            
            if (!saveData) {
                alert('没有找到存档！');
                return;
            }
            
            const data = JSON.parse(saveData);
            
            if (!Utils.validateGameState(data)) {
                alert('存档数据损坏！');
                return;
            }
            
            // 恢复游戏状态
            this.grid = data.grid;
            this.score = data.score;
            this.level = data.level;
            this.combo = data.combo;
            this.dropSpeed = data.dropSpeed || CONSTANTS.INITIAL_SPEED;
            this.currentPiece = data.currentPiece;
            this.nextPiece = data.nextPiece;
            this.gameOver = data.gameOver;
            this.isPaused = data.isPaused;
            this.isStarted = true;
            
            // 更新UI
            this.updateUI();
            
            // 恢复游戏
            if (!this.gameOver && !this.isPaused) {
                this.startDropTimer();
            }
            
            // 更新按钮状态
            document.getElementById('startBtn').disabled = true;
            document.getElementById('pauseBtn').disabled = false;
            document.getElementById('saveBtn').disabled = false;
            
            if (this.isPaused) {
                document.getElementById('pauseBtn').textContent = '继续';
            } else {
                document.getElementById('pauseBtn').textContent = '暂停';
            }
            
            this.render();
            alert('读档成功！');
            
        } catch (e) {
            console.error('读档失败:', e);
            alert('读档失败！');
        }
    }
    
    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        // 按钮事件
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveGame());
        document.getElementById('loadBtn').addEventListener('click', () => this.loadGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (this.gameOver || this.isPaused || !this.isStarted) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.movePiece(1, 0);
                    break;
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.rotatePiece();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.movePiece(0, 1);
                    break;
                case ' ':
                    e.preventDefault();
                    this.startFastDrop();
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === ' ') {
                this.stopFastDrop();
            }
        });
    }
}

// 游戏初始化
window.addEventListener('load', () => {
    const game = new BattleTetris();
});
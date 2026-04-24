// ============================================
// 俄罗斯方块系统 - 主模块
// ============================================

class TetrisSystem {
    constructor() {
        this.grid = this.createEmptyGrid();
        this.currentPiece = null;
        this.nextPiece = null;
        this.tetrisScore = 0;
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.dropSpeed = CONSTANTS.INITIAL_SPEED;
        this.isFastDrop = false;
        
        this.tetrisEnded = false;
    }
    
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
    
    generatePiece() {
        const size = Utils.randomInt(CONSTANTS.MIN_BLOCK_SIZE, CONSTANTS.MAX_BLOCK_SIZE);
        const color = Utils.randomChoice(CONSTANTS.BLOCK_COLORS);
        const shape = Utils.generateBlockShape(size);
        
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
    
    canMove(piece, offsetX = 0, offsetY = 0) {
        if (!piece) return false;
        
        const newX = piece.x + offsetX;
        const newY = piece.y + offsetY;
        
        return piece.shape.every(([x, y]) => {
            const gridX = newX + x;
            const gridY = newY + y;
            
            if (gridX < 0 || gridX >= CONSTANTS.GRID_WIDTH) return false;
            if (gridY >= CONSTANTS.GRID_HEIGHT) return false;
            if (gridY < 0) return true;
            
            return this.grid[gridY][gridX] === null;
        });
    }
    
    movePiece(offsetX, offsetY) {
        if (this.tetrisEnded || !this.currentPiece) return false;
        
        if (this.canMove(this.currentPiece, offsetX, offsetY)) {
            this.currentPiece.x += offsetX;
            this.currentPiece.y += offsetY;
            return true;
        }
        
        if (offsetY > 0) {
            this.lockPiece();
        }
        
        return false;
    }
    
    rotatePiece() {
        if (this.tetrisEnded || !this.currentPiece) return;
        
        const rotatedShape = Utils.rotateShape(this.currentPiece.shape);
        const originalShape = this.currentPiece.shape;
        
        this.currentPiece.shape = rotatedShape;
        
        if (!this.canMove(this.currentPiece)) {
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
    }
    
    lockPiece() {
        if (!this.currentPiece) return;
        
        if (this.currentPiece.y <= 0) {
            this.endTetrisGame();
            return false;
        }
        
        this.currentPiece.shape.forEach(([x, y]) => {
            const gridX = this.currentPiece.x + x;
            const gridY = this.currentPiece.y + y;
            
            if (gridY >= 0 && gridY < CONSTANTS.GRID_HEIGHT) {
                this.grid[gridY][gridX] = this.currentPiece.color;
            }
        });
        
        this.applyGravity();
        
        return true;
    }
    
    endTetrisGame() {
        if (this.tetrisEnded) return;
        
        this.tetrisEnded = true;
        this.currentPiece = null;
    }
    
    spawnNewPiece() {
        if (this.tetrisEnded) return false;
        
        this.currentPiece = this.nextPiece || this.generatePiece();
        this.nextPiece = this.generatePiece();
        
        if (!this.canMove(this.currentPiece)) {
            this.endTetrisGame();
            return false;
        }
        
        return true;
    }
    
    applyGravity() {
        for (let x = 0; x < CONSTANTS.GRID_WIDTH; x++) {
            let writePos = CONSTANTS.GRID_HEIGHT - 1;
            
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
    
    checkAndClear() {
        const toClear = new Set();
        const clearedColors = new Map();
        
        for (let y = 0; y < CONSTANTS.GRID_HEIGHT; y++) {
            for (let x = 0; x < CONSTANTS.GRID_WIDTH; x++) {
                const color = this.grid[y][x];
                if (color && !toClear.has(`${x},${y}`)) {
                    const connected = this.findConnected(x, y, color);
                    if (connected.length >= CONSTANTS.CLEAR_THRESHOLD) {
                        connected.forEach(pos => {
                            toClear.add(`${pos.x},${pos.y}`);
                            clearedColors.set(color, (clearedColors.get(color) || 0) + 1);
                        });
                    }
                }
            }
        }
        
        return { toClear, clearedColors };
    }
    
    findConnected(startX, startY, color) {
        const horizontal = this.findHorizontalLine(startX, startY, color);
        const vertical = this.findVerticalLine(startX, startY, color);
        
        const allConnected = new Set();
        
        if (horizontal.length >= CONSTANTS.CLEAR_THRESHOLD) {
            horizontal.forEach(pos => allConnected.add(`${pos.x},${pos.y}`));
        }
        
        if (vertical.length >= CONSTANTS.CLEAR_THRESHOLD) {
            vertical.forEach(pos => allConnected.add(`${pos.x},${pos.y}`));
        }
        
        const result = [];
        allConnected.forEach(key => {
            const [x, y] = key.split(',').map(Number);
            result.push({x, y});
        });
        
        return result;
    }
    
    findHorizontalLine(startX, startY, color) {
        const line = [];
        
        let x = startX;
        while (x >= 0 && this.grid[startY][x] === color) {
            line.push({x, y: startY});
            x--;
        }
        
        x = startX + 1;
        while (x < CONSTANTS.GRID_WIDTH && this.grid[startY][x] === color) {
            line.push({x, y: startY});
            x++;
        }
        
        return line;
    }
    
    findVerticalLine(startX, startY, color) {
        const line = [];
        
        let y = startY;
        while (y >= 0 && this.grid[y][startX] === color) {
            line.push({x: startX, y});
            y--;
        }
        
        y = startY + 1;
        while (y < CONSTANTS.GRID_HEIGHT && this.grid[y][startX] === color) {
            line.push({x: startX, y});
            y++;
        }
        
        return line;
    }
    
    clearBlocks(toClear, clearedColors) {
        const result = {
            totalCleared: toClear.size,
            clearedColors: clearedColors
        };
        
        toClear.forEach(key => {
            const [x, y] = key.split(',').map(Number);
            this.grid[y][x] = null;
        });
        
        this.applyGravity();
        
        return result;
    }
    
    updateTetrisScore(blocksCleared) {
        let points = CONSTANTS.SCORE.BASE;
        
        const extraBlocks = Math.max(0, blocksCleared - 1);
        points += extraBlocks * CONSTANTS.SCORE.PER_BLOCK;
        
        let multiplier = 1.0;
        
        const comboLayers = Math.min(this.combo, CONSTANTS.SCORE.MAX_COMBO_BUFF);
        multiplier += comboLayers * CONSTANTS.SCORE.COMBO_BUFF;
        
        multiplier += (this.level - 1) * CONSTANTS.SCORE.LEVEL_BUFF;
        
        multiplier = Math.min(multiplier, CONSTANTS.SCORE.MAX_MULTIPLIER);
        
        points *= multiplier;
        
        points += this.maxCombo * CONSTANTS.SCORE.COMBO_BONUS_PER;
        
        points = Math.floor(points);
        
        this.tetrisScore += points;
        
        return points;
    }
    
    checkLevelUp() {
        const newLevel = Math.floor(this.tetrisScore / (CONSTANTS.LEVEL.BASE_LINES_PER_LEVEL * CONSTANTS.SCORE.BASE)) + 1;
        
        if (newLevel > this.level) {
            this.level = newLevel;
            
            this.dropSpeed = Math.max(100, CONSTANTS.INITIAL_SPEED * Math.pow(CONSTANTS.LEVEL.SPEED_INCREASE, this.level - 1));
            
            return true;
        }
        
        return false;
    }
    
    reset() {
        this.grid = this.createEmptyGrid();
        this.tetrisScore = 0;
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.dropSpeed = CONSTANTS.INITIAL_SPEED;
        this.isFastDrop = false;
        this.currentPiece = null;
        this.nextPiece = null;
        this.tetrisEnded = false;
    }
    
    getGhostY() {
        if (!this.currentPiece) return 0;
        
        let ghostY = this.currentPiece.y;
        while (this.canMove(this.currentPiece, 0, ghostY - this.currentPiece.y + 1)) {
            ghostY++;
        }
        return ghostY;
    }
    
    hardDrop() {
        if (!this.currentPiece) return false;
        
        const dropY = this.getGhostY();
        this.currentPiece.y = dropY;
        return this.lockPiece();
    }
}

// ============================================
// 环境系统 - 主模块
// 包含：存档系统、评分系统、难度管理
// ============================================

class EnvironmentSystem {
    constructor() {
        this.saveKey = CONSTANTS.SAVE_KEY;
    }
    
    calculateTotalScore(tetrisScore, defenseSystem, survivalTime, level, maxCombo) {
        const tetrisWeight = CONSTANTS.SCORING.TETRIS_WEIGHT;
        const defenseWeight = CONSTANTS.SCORING.DEFENSE_WEIGHT;
        
        const wallHPBonus = Math.floor(
            Math.max(0, defenseSystem.wallHP) * CONSTANTS.SCORING.WALL_HP_BONUS / CONSTANTS.WALL.maxHP
        );
        
        const survivalBonus = Math.floor(survivalTime * CONSTANTS.SCORING.SURVIVAL_TIME_BONUS);
        
        const killBonus = defenseSystem.killCount * CONSTANTS.SCORING.KILL_BONUS;
        
        const comboBonus = maxCombo * CONSTANTS.SCORING.COMBO_BONUS;
        
        const levelBonus = level * CONSTANTS.SCORING.LEVEL_BONUS;
        
        const adjustedDefenseScore = defenseSystem.defenseScore + wallHPBonus + survivalBonus + killBonus + comboBonus + levelBonus;
        
        const totalScore = Math.floor(
            tetrisScore * tetrisWeight + adjustedDefenseScore * defenseWeight
        );
        
        return totalScore;
    }
    
    getRating(totalScore) {
        if (totalScore >= CONSTANTS.RATINGS.S.minScore) return CONSTANTS.RATINGS.S;
        if (totalScore >= CONSTANTS.RATINGS.A.minScore) return CONSTANTS.RATINGS.A;
        if (totalScore >= CONSTANTS.RATINGS.B.minScore) return CONSTANTS.RATINGS.B;
        if (totalScore >= CONSTANTS.RATINGS.C.minScore) return CONSTANTS.RATINGS.C;
        return CONSTANTS.RATINGS.D;
    }
    
    saveGame(gameState) {
        try {
            const saveData = {
                savedAt: Date.now(),
                ...gameState
            };
            
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.error('存档失败:', e);
            return false;
        }
    }
    
    loadGame() {
        try {
            const saveData = localStorage.getItem(this.saveKey);
            if (!saveData) return null;
            
            return JSON.parse(saveData);
        } catch (e) {
            console.error('读档失败:', e);
            return null;
        }
    }
    
    hasSaveData() {
        return localStorage.getItem(this.saveKey) !== null;
    }
    
    deleteSave() {
        localStorage.removeItem(this.saveKey);
    }
    
    formatScore(score) {
        return Utils.formatScore(score);
    }
}

const Environment = new EnvironmentSystem();

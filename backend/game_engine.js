class GameEngine {
    static generate(level, last) {
        // ایجاد شاخه‌ها به صورت تصادفی
        const branches = ['left', 'right', 'none'];
        let side = 'none';
        

        side = Math.random() > 0.5 ? 'left' : 'right';
        if (last !== 'none' && last !== side)
            side = 'none';
        
        return {
            side: side,
            level: level
        };
    }
}

module.exports = GameEngine;
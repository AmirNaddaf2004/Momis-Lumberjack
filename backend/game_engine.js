class GameEngine {
    static generate(level, last, lastSide='none') {
        if (last === 'none'){
            let side = lastSide === 'right' ? 'right' : 'left';
            return {
                side: side,
                level: level
            };
        }
        // ایجاد شاخه‌ها به صورت تصادفی
        const branches = ['left', 'right', 'none'];
        let side = 'none';
        console.log("last is: " + last);

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
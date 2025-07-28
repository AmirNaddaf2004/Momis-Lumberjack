class GameEngine {
    static generate(level) {
        // افزایش سختی بازی با افزایش سطح
        const branchProbability = Math.min(0.7, 0.3 + (level * 0.05));
        
        // ایجاد شاخه‌ها به صورت تصادفی
        const branches = ['left', 'right', 'none'];
        let side = 'none';
        
        // شانس ایجاد شاخه بر اساس سطح
        if (Math.random() < branchProbability) {
            // انتخاب تصادفی چپ یا راست (به جز 'none')
            side = Math.random() > 0.5 ? 'left' : 'right';
        }
        
        return {
            side: side,
            level: level
        };
    }
}

module.exports = GameEngine;
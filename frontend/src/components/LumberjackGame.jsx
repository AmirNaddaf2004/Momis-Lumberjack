import React, { useEffect, useState } from 'react';

const LumberjackGame = ({ branches, lumberjackPos, loading, gameActive }) => {
  const [shakeBranch, setShakeBranch] = useState(null);
  
  // تابع برای شبیه‌سازی لرزش شاخه‌ها هنگام حرکت
  useEffect(() => {
    if (gameActive && !loading) {
      const interval = setInterval(() => {
        const randomBranch = Math.floor(Math.random() * 5);
        setShakeBranch(randomBranch);
        
        setTimeout(() => setShakeBranch(null), 300);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [gameActive, loading]);

  // رندر شاخه‌ها
  const renderBranches = () => {
    return branches.map((direction, index) => (
      <div 
        key={index} 
        className={`relative w-full h-20 flex items-center justify-center ${
          shakeBranch === index ? 'animate-shake' : ''
        }`}
      >
        {/* خط تنه درخت */}
        <div className="absolute w-2 h-full bg-brown-800"></div>
        
        {/* شاخه‌ها */}
        {direction === 'left' && (
          <div className="absolute left-0 h-2 w-1/2 bg-brown-700 rounded-l-full"></div>
        )}
        
        {direction === 'right' && (
          <div className="absolute right-0 h-2 w-1/2 bg-brown-700 rounded-r-full"></div>
        )}
      </div>
    ));
  };

  // رندر آدمک چوب‌بر
  const renderLumberjack = () => (
    <div className="relative w-full h-24 flex items-center justify-center">
      <div className="absolute w-2 h-full bg-brown-800"></div>
      
      <div 
        className={`absolute transition-all duration-300 ${
          lumberjackPos === 'left' ? 'left-1/4' : 'right-1/4'
        }`}
      >
        <div className="relative">
          {/* بدن */}
          <div className="w-8 h-16 bg-red-600 rounded-t-lg"></div>
          
          {/* سر */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-yellow-200 rounded-full"></div>
          
          {/* تبر */}
          <div className={`absolute top-4 ${
            lumberjackPos === 'left' ? '-right-6 rotate-0' : '-left-6 rotate-180'
          } w-12 h-4 bg-gray-400`}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full max-w-md h-full flex flex-col items-center justify-center">
      {/* صفحه لودینگ */}
      {loading && (
        <div className="absolute inset-0 bg-green-900 bg-opacity-80 flex items-center justify-center z-20">
          <div className="text-white text-xl">Loading...</div>
        </div>
      )}
      
      {/* محتوای بازی */}
      <div className="w-full h-4/5 flex flex-col-reverse bg-green-700 border-4 border-green-900 rounded-lg overflow-hidden">
        {/* زمین */}
        <div className="h-16 bg-green-900"></div>
        
        {/* آدمک چوب‌بر */}
        {renderLumberjack()}
        
        {/* شاخه‌ها */}
        {renderBranches()}
        
        {/* آسمان */}
        <div className="flex-1 bg-gradient-to-b from-blue-400 to-blue-600"></div>
      </div>
      
      {/* صفحه پایان بازی */}
      {!gameActive && !loading && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-10">
          <h2 className="text-white text-2xl font-bold mb-4">Game Over!</h2>
          <button 
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            onClick={() => window.location.reload()}
          >
            Play Again
          </button>
        </div>
      )}
      
      {/* استایل انیمیشن لرزش */}
      <style jsx>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LumberjackGame;
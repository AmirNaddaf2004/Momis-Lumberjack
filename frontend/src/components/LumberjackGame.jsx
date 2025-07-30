import React, { useEffect, useState } from 'react';

const LumberjackGame = ({ branches, lumberjackPos, loading, gameActive }) => {
  const [shakeBranch, setShakeBranch] = useState(null);
  
  // تابع برای شبیه‌سازی لرزش شاخه‌ها
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

  // رندر شاخه‌ها با موقعیت‌های دقیق
  const renderBranches = () => {
    return branches.map((direction, index) => (
      <div 
        key={index} 
        className={`relative w-full h-1/5 flex items-center justify-center ${
          shakeBranch === index ? 'animate-shake' : ''
        }`}
        style={{ zIndex: 5 - index }} // شاخه‌های پایین‌تر روی شاخه‌های بالاتر نمایش داده می‌شوند
      >
        {/* خط تنه درخت */}
        <div className="absolute w-3 h-full bg-yellow-900 z-10"></div>
        
        {/* شاخه‌ها */}
        {direction === 'left' && (
          <div className="absolute left-0 h-4 w-1/2 bg-green-800 rounded-l-full z-20"></div>
        )}
        
        {direction === 'right' && (
          <div className="absolute right-0 h-4 w-1/2 bg-green-800 rounded-r-full z-20"></div>
        )}
      </div>
    ));
  };

  // رندر آدمک چوب‌بر با موقعیت دقیق
  const renderLumberjack = () => (
    <div className="relative w-full h-1/5 flex items-center justify-center">
      {/* خط تنه درخت */}
      <div className="absolute w-3 h-full bg-yellow-900 z-10"></div>
      
      {/* آدمک چوب‌بر */}
      <div 
        className={`absolute transition-all duration-300 z-30 ${
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
    <div className="relative w-full max-w-md h-full flex flex-col">
      
      {/* صفحه لودینگ */}
      {loading && (
        <div className="absolute inset-0 bg-green-900 bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-white text-xl">Loading...</div>
        </div>
      )}
      
      {/* محتوای اصلی بازی */}
      <div className="relative w-full flex-1 bg-gradient-to-b from-blue-400 to-green-700 overflow-hidden">
        {/* شاخه‌ها و آدمک */}
        <div className="absolute inset-0 flex flex-col-reverse h-full">
          {/* آدمک چوب‌بر (پایین‌ترین سطح) */}
          {renderLumberjack()}
          
          {/* شاخه‌ها (از پایین به بالا) */}
          {renderBranches()}
        </div>
        
        {/* زمین */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-green-900 z-40"></div>
        
        {/* برگ‌های درخت */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-green-500 rounded-full z-0 opacity-60"></div>
        <div className="absolute top-10 left-1/3 w-32 h-32 bg-green-600 rounded-full z-0 opacity-70"></div>
        <div className="absolute top-20 right-1/3 w-36 h-36 bg-green-600 rounded-full z-0 opacity-80"></div>
        
      </div>
      
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
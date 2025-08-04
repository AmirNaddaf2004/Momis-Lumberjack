import React, { useEffect, useState } from 'react';

const LumberjackGame = ({ branches, lumberjackPos, loading, gameActive }) => {
  const [shakeBranch, setShakeBranch] = useState(null);

  // منطق لرزش شاخه‌ها
  useEffect(() => {
    if (!gameActive || loading) {
      setShakeBranch(null);
      return;
    }

    const interval = setInterval(() => {
      const randomBranch = Math.floor(Math.random() * 5);
      setShakeBranch(randomBranch);
      setTimeout(() => setShakeBranch(null), 300);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameActive, loading]);

  // رندر شاخه‌ها با جزئیات جدید
  const renderBranches = () => {
    return branches.map((direction, index) => (
      <div
        key={index}
        className={`relative flex-1 flex items-center justify-center ${
          shakeBranch === index ? 'animate-shake' : ''
        }`}
      >
        {direction === 'left' && (
          <div className="absolute left-1/2 -ml-28 w-40 h-20">
            {/* شاخه اصلی */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-full h-8 bg-amber-800 rounded-r-full shadow-lg"></div>
            {/* برگ‌ها */}
            <div className="absolute right-0 -top-4 w-24 h-12 bg-lime-600 rounded-full shadow-lg"></div>
            <div className="absolute right-12 -top-6 w-16 h-8 bg-lime-500 rounded-full shadow-md"></div>
          </div>
        )}

        {direction === 'right' && (
          <div className="absolute right-1/2 -mr-28 w-40 h-20">
            {/* شاخه اصلی */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-8 bg-amber-800 rounded-l-full shadow-lg"></div>
            {/* برگ‌ها */}
            <div className="absolute left-0 -top-4 w-24 h-12 bg-lime-600 rounded-full shadow-lg"></div>
            <div className="absolute left-12 -top-6 w-16 h-8 bg-lime-500 rounded-full shadow-md"></div>
          </div>
        )}
      </div>
    ));
  };

  // رندر کاراکتر چوب‌بر
  const renderLumberjack = () => (
    <div
      className={`absolute bottom-32 transition-all duration-300 ease-in-out ${
        lumberjackPos === 'left' ? 'left-1/2 transform -translate-x-full' : 'right-1/2 transform translate-x-full'
      }`}
    >
      {/*... بقیه کد کاراکتر چوب‌بر از کد قبلی ...*/}
      {/* این بخش را می‌توانید از کد قبلی کپی کنید */}
    </div>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden bg-sky-300 font-sans">
      {/* پس‌زمینه ابر */}
      <div className="absolute top-1/4 left-1/4 w-32 h-16 bg-white rounded-full shadow-md animate-cloud-move-1"></div>
      <div className="absolute top-1/2 left-3/4 w-40 h-20 bg-white rounded-full shadow-md animate-cloud-move-2"></div>
      <div className="absolute top-1/3 left-1/2 w-24 h-12 bg-white rounded-full shadow-md animate-cloud-move-3"></div>

      {/* نمایش صفحه لودینگ */}
      {loading && (
        <div className="absolute inset-0 bg-sky-800 bg-opacity-80 flex items-center justify-center z-20">
          <div className="text-white text-3xl font-bold animate-pulse">Loading...</div>
        </div>
      )}

      {/* محتوای بازی */}
      <div className="relative w-full h-full flex flex-col items-center justify-end">
        {/* زمین */}
        <div className="relative w-full h-32 bg-green-500 rounded-t-full flex items-start justify-center">
          <div className="w-11/12 h-16 bg-green-700 rounded-t-full transform translate-y-8"></div>
          <div className="absolute left-1/4 top-1/2 w-8 h-4 bg-gray-500 rounded-full"></div>
          <div className="absolute right-1/4 top-1/2 w-6 h-3 bg-gray-500 rounded-full"></div>
          <div className="absolute left-1/3 bottom-1/4 w-5 h-2 bg-gray-400 rounded-full"></div>
        </div>

        {/* تنه درخت */}
        <div className="absolute bottom-32 w-28 h-[70%] bg-amber-800 rounded-t-full shadow-lg flex flex-col-reverse">
          <div className="absolute inset-0 bg-texture opacity-20 rounded-t-full"></div>
          <div className="flex-1 flex flex-col-reverse justify-end">
            {renderBranches()}
          </div>
        </div>

        {/* کاراکتر چوب‌بر */}
        {renderLumberjack()}
      </div>

      <style jsx>{`
        @keyframes cloud-move {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-cloud-move-1 {
          animation: cloud-move 30s linear infinite;
        }
        .animate-cloud-move-2 {
          animation: cloud-move 40s linear infinite;
        }
        .animate-cloud-move-3 {
          animation: cloud-move 35s linear infinite;
        }
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
        .bg-texture {
          background-image: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.1) 0%,
            transparent 10%,
            rgba(0, 0, 0, 0.1) 20%,
            transparent 30%,
            rgba(0, 0, 0, 0.1) 40%,
            transparent 50%,
            rgba(0, 0, 0, 0.1) 60%,
            transparent 70%,
            rgba(0, 0, 0, 0.1) 80%,
            transparent 90%,
            rgba(0, 0, 0, 0.1) 100%
          );
          background-size: 100% 20px;
        }
      `}</style>
    </div>
  );
};

export default LumberjackGame;
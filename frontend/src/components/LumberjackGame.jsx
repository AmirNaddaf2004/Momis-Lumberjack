import React, { useEffect, useState } from 'react';

const LumberjackGameUI = ({ branches, lumberjackPos, loading, gameActive, score, userData }) => {
  const [shakeBranch, setShakeBranch] = useState(null);

  // Logic for shaking branches
  useEffect(() => {
    if (!gameActive || loading) {
      setShakeBranch(null);
      return;
    }

    const interval = setInterval(() => {
      const randomBranch = Math.floor(Math.random() * branches.length);
      setShakeBranch(randomBranch);
      setTimeout(() => setShakeBranch(null), 300);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameActive, loading, branches.length]);

  // Render branches with new UI
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
            {/* شاخه */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-full h-8 bg-amber-800 rounded-r-full shadow-lg"></div>
            {/* برگ‌ها */}
            <div className="absolute right-0 -top-4 w-24 h-12 bg-lime-600 rounded-full shadow-lg"></div>
            <div className="absolute right-12 -top-6 w-16 h-8 bg-lime-500 rounded-full shadow-md"></div>
          </div>
        )}

        {direction === 'right' && (
          <div className="absolute right-1/2 -mr-28 w-40 h-20">
            {/* شاخه */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-8 bg-amber-800 rounded-l-full shadow-lg"></div>
            {/* برگ‌ها */}
            <div className="absolute left-0 -top-4 w-24 h-12 bg-lime-600 rounded-full shadow-lg"></div>
            <div className="absolute left-12 -top-6 w-16 h-8 bg-lime-500 rounded-full shadow-md"></div>
          </div>
        )}
      </div>
    ));
  };

  // Render the lumberjack character
  const renderLumberjack = () => (
    <div
      className={`absolute bottom-28 z-10 transition-all duration-300 ease-in-out ${
        lumberjackPos === 'left' ? 'left-1/2 transform -translate-x-[200%]' : 'right-1/2 transform translate-x-[200%]'
      }`}
    >
      <div className="relative w-12 h-20"> {/* Half the original size (w-12, h-20) */}
        {/* Plaid shirt */}
        <div className="absolute top-0 left-0 w-full h-full bg-red-600 rounded-lg">
          <div className="absolute inset-0 bg-red-800 opacity-30"></div>
          <div className="absolute inset-0 flex">
            <div className="w-1/4 h-full bg-red-800 opacity-20"></div>
            <div className="w-1/4 h-full"></div>
            <div className="w-1/4 h-full bg-red-800 opacity-20"></div>
            <div className="w-1/4 h-full"></div>
          </div>
          <div className="absolute inset-0 flex flex-col">
            <div className="h-1/4 w-full bg-red-800 opacity-20"></div>
            <div className="h-1/4 w-full"></div>
            <div className="h-1/4 w-full bg-red-800 opacity-20"></div>
            <div className="h-1/4 w-full"></div>
          </div>
        </div>
        {/* Belt */}
        <div className="absolute bottom-8 w-full h-2 bg-gray-900"></div>
        {/* Legs */}
        <div className="absolute bottom-0 w-full h-8 flex justify-center">
          <div className="w-1/2 h-full bg-blue-700 rounded-b-lg"></div>
          <div className="w-1/2 h-full bg-blue-700 rounded-b-lg"></div>
        </div>
        {/* Arms */}
        {/* دست چپ */}
        <div className="absolute top-4 left-full transform -translate-x-1/2 w-8 h-3 bg-red-600 rounded-full -rotate-12"></div>
        {/* دست راست */}
        <div className="absolute top-4 right-full transform translate-x-1/2 w-8 h-3 bg-red-600 rounded-full rotate-12"></div>
        {/* Head */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-yellow-200 rounded-full">
          {/* Beard */}
          <div className="absolute bottom-0 w-full h-1/2 bg-black rounded-b-full"></div>
          {/* Hat */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-blue-800 rounded-t-full">
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-blue-900 rounded-t-full"></div>
          </div>
        </div>
        {/* Axe position adjusted */}
        <div className={`absolute top-1/4 ${lumberjackPos === 'left' ? 'right-full translate-x-1/2 -rotate-45' : 'left-full -translate-x-1/2 rotate-45'} w-12 h-6`}>
            {/* Axe handle */}
            <div className="absolute top-1/2 left-0 w-full h-2 bg-stone-800 rounded-full"></div>
            {/* Axe blade */}
            <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gray-400 rounded-full rotate-45"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden bg-sky-300 font-sans">
      {/* Background clouds */}
      <div className="absolute top-1/4 left-1/4 w-32 h-16 bg-white rounded-full shadow-md animate-cloud-move-1"></div>
      <div className="absolute top-1/2 left-3/4 w-40 h-20 bg-white rounded-full shadow-md animate-cloud-move-2"></div>
      <div className="absolute top-1/3 left-1/2 w-24 h-12 bg-white rounded-full shadow-md animate-cloud-move-3"></div>

      {/* نمایش امتیاز و اطلاعات بازیکن در بالای صفحه بازی */}
      <div className="absolute top-4 left-0 w-full flex justify-between items-center px-4 z-30">
        <p className="text-2xl font-bold text-gray-800">Score: {score}</p>
        {userData && (
          <div className="flex items-center gap-2">
            <img
              src={userData.photo_url || '/path/to/default-avatar.png'} // مسیر عکس پیش‌فرض را به درستی تنظیم کنید
              alt="Profile"
              className="w-12 h-12 rounded-full border-2 border-white shadow-md"
            />
            <span className="text-gray-800 font-bold">{userData.first_name}</span>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 bg-sky-800 bg-opacity-80 flex items-center justify-center z-20">
          <div className="text-white text-3xl font-bold animate-pulse">Loading...</div>
        </div>
      )}

      <div className="relative w-full h-full flex flex-col items-center justify-end">
        {/* Ground */}
        <div className="relative w-full h-32 bg-green-500 rounded-t-full flex items-start justify-center">
          <div className="w-11/12 h-16 bg-green-700 rounded-t-full transform translate-y-8"></div>
          <div className="absolute left-1/4 top-1/2 w-8 h-4 bg-gray-500 rounded-full"></div>
          <div className="absolute right-1/4 top-1/2 w-6 h-3 bg-gray-500 rounded-full"></div>
          <div className="absolute left-1/3 bottom-1/4 w-5 h-2 bg-gray-400 rounded-full"></div>
        </div>

        {/* Tree Trunk */}
        <div className="absolute bottom-32 w-28 h-[85%] bg-amber-800 rounded-t-full shadow-lg flex flex-col-reverse justify-end">
          <div className="absolute inset-0 bg-texture opacity-20 rounded-t-full"></div>
          <div className="flex-1 flex flex-col-reverse justify-end">
            {renderBranches()}
          </div>
        </div>

        {/* Lumberjack character is now rendered with smaller size and correct position */}
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

export default LumberjackGameUI;
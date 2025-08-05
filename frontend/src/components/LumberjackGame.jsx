import React, { useEffect, useState } from 'react';
import characterImage from './../assets/character.png'; 
const imageSrc = characterImage;

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
          {/* Main branch */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-full h-6 bg-amber-800 rounded-full shadow-lg"></div>
          {/* Leaves */}
          <div className="absolute right-24 -top-2 w-20 h-10 bg-lime-600 rounded-full shadow-lg"></div>
          <div className="absolute right-36 -top-4 w-12 h-6 bg-lime-500 rounded-full shadow-md"></div>
        </div>
      )}
      {direction === 'right' && (
        <div className="absolute right-1/2 -mr-28 w-40 h-20">
          {/* Main branch */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-6 bg-amber-800 rounded-full shadow-lg"></div>
          {/* Leaves */}
          <div className="absolute left-24 -top-2 w-20 h-10 bg-lime-600 rounded-full shadow-lg"></div>
          <div className="absolute left-36 -top-4 w-12 h-6 bg-lime-500 rounded-full shadow-md"></div>
        </div>
      )}
    </div>
  ));
};

  const renderLumberjack = () => {
    return (
      <div
        className={`absolute bottom-28 z-10 transition-all duration-300 ease-in-out ${
          lumberjackPos === 'left' ? 'left-1/2 transform -translate-x-[200%]' : 'right-1/2 transform translate-x-[200%]'
        }`}
      >
        <img
          src={imageSrc}
          alt="Lumberjack Character"
          loading="eager" // اینجا اضافه شد
          className={`w-12 h-20 transition-transform duration-300 ${
            lumberjackPos === 'right' ? 'transform scale-x-[-1]' : ''
          }`}
        />
      </div>
    );
  };

  return (
    <div className="relative w-full h-[66.6667vh] overflow-hidden bg-sky-300 font-sans">
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
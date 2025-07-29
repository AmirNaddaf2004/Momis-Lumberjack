import React, { useState, useEffect, useRef } from 'react';

const LumberjackGame = () => {
  // Game state
  const [playerPosition, setPlayerPosition] = useState(50);
  const [trees, setTrees] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isChopping, setIsChopping] = useState(false);
  const [gameActive, setGameActive] = useState(true);
  
  const gameAreaRef = useRef(null);
  const chopSoundRef = useRef(null);
  const gameLoopRef = useRef(null);
  
  // Initialize game
  useEffect(() => {
    if (!gameActive) return;
    
    // Game loop
    gameLoopRef.current = setInterval(() => {
      // Generate new trees randomly
      if (Math.random() > 0.97) {
        const newTree = {
          id: Date.now(),
          position: Math.floor(Math.random() * 80) + 10,
          hasLog: true
        };
        setTrees(prev => [...prev, newTree].slice(-5));
      }
      
      // Move logs downward
      setLogs(prev => 
        prev.map(log => ({
          ...log,
          top: log.top + 3
        })).filter(log => log.top < 100)
      );
      
      // Check collisions
      logs.forEach(log => {
        if (log.top > 85 && Math.abs(log.position - playerPosition) < 10) {
          setGameActive(false);
        }
      });
    }, 200);
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [logs, playerPosition, gameActive]);
  
  
  const movePlayer = (direction) => {
    setPlayerPosition(prev => Math.max(5, Math.min(95, prev + direction)));
  };
  
  const chopTree = () => {
    if (isChopping) return;
    
    setIsChopping(true);
    
    // Find nearest tree with log
    const nearestTree = trees.find(tree => 
      Math.abs(tree.position - playerPosition) < 10 && tree.hasLog
    );
    
    if (nearestTree) {
      // Play sound effect
      if (chopSoundRef.current) {
        chopSoundRef.current.currentTime = 0;
        chopSoundRef.current.play();
      }
      
      // Remove log from tree
      setTrees(prev => 
        prev.map(tree => 
          tree.id === nearestTree.id ? {...tree, hasLog: false} : tree
        )
      );
      
      // Create falling log
      setLogs(prev => [
        ...prev,
        {
          id: Date.now(),
          position: nearestTree.position,
          top: 20
        }
      ]);
    }
    
    // Reset chopping animation
    setTimeout(() => setIsChopping(false), 300);
  };


  return (
    <div className="lumberjack-game"
    //   style={{
    //   backgroundImage: './../assets/GameWallpaper.jpg)',
    //   backgroundSize: 'cover',
    //   backgroundPosition: 'center',
    //   padding: '20px',
    //   borderRadius: '10px',
    //   boxShadow: '0 0 20px rgba(0,0,0,0.5)'
    // }}
    > 
      <div 
        ref={gameAreaRef} 
        className="game-area"
        style={{ position: 'relative', height: '400px', border: '2px solid #4CAF50' , 
              backgroundColor: '#4CAF50'
        }}
      >
        {/* Player */}
        <div 
          className={`player ${isChopping ? 'chopping' : ''}`}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: `${playerPosition}%`,
            transform: 'translateX(-50%)',
            width: '40px',
            height: '60px',
            background: '#795548',
            transition: 'left 0.1s'
          }}
        >
          {/* Axe */}
          <div style={{
            position: 'absolute',
            right: '-15px',
            top: '10px',
            width: '30px',
            height: '8px',
            background: '#607D8B',
            transform: isChopping ? 'rotate(-45deg)' : 'rotate(0deg)',
            transformOrigin: 'left center',
            transition: 'transform 0.2s'
          }} />
        </div>
        
        {/* Trees */}
        {trees.map(tree => (
          <div 
            key={tree.id}
            className="tree"
            style={{
              position: 'absolute',
              top: '20px',
              left: `${tree.position}%`,
              width: '10px',
              height: '80px',
              background: '#8D6E63'
            }}
          >
            {/* Log */}
            {tree.hasLog && (
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '-15px',
                width: '40px',
                height: '15px',
                background: '#5D4037',
                borderRadius: '3px'
              }} />
            )}
          </div>
        ))}
        
        {/* Falling Logs */}
        {logs.map(log => (
          <div
            key={log.id}
            className="log"
            style={{
              position: 'absolute',
              top: `${log.top}%`,
              left: `${log.position}%`,
              width: '40px',
              height: '15px',
              background: '#5D4037',
              borderRadius: '3px',
              transition: 'top 0.1s linear'
            }}
          />
        ))}
        
      </div>
      
      {/* Hidden audio for chop sound */}
      <audio ref={chopSoundRef}>
        <source src="https://assets.mixkit.co/sfx/preview/mixkit-wood-hard-hit-1182.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
};

export default LumberjackGame;
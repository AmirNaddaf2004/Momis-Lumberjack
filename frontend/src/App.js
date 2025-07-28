import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
} from "react";
import TimerCircle from "./components/TimerCircle";
import Leaderboard from "./components/Leaderboard";
import DefaultAvatar from "./assets/default-avatar.png";
import GameLobby from "./components/GameLobby";

const ROUND_TIME = 15;
const API_BASE = "/api";

// کامپوننت جدید برای بازی Lumberjack
const LumberjackGame = ({ 
  lumberjackPosition, 
  nextBranch, 
  onMove, 
  disabled 
}) => {
  return (
    <div className="relative w-full max-w-md h-[70vh] flex flex-col items-center">
      {/* نمایش درخت */}
      <div className="relative w-16 h-full bg-amber-900">
        {/* تنه درخت */}
        <div className="absolute inset-0 bg-amber-800 w-full"></div>
        
        {/* شاخه‌ها */}
        {nextBranch.side !== 'none' && (
          <div 
            className={`absolute w-32 h-4 bg-green-800 rounded-lg ${
              nextBranch.side === 'left' 
                ? 'left-[-120px] rotate-[-30deg]' 
                : 'right-[-120px] rotate-[30deg]'
            }`}
            style={{ top: '30%' }}
          ></div>
        )}
      </div>
      
      {/* چوب‌بر */}
      <div 
        className={`absolute bottom-10 transition-all duration-200 ${
          lumberjackPosition === 'left' ? 'left-1/4' : 'right-1/4'
        }`}
      >
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">🪓</span>
        </div>
      </div>
      
      {/* دکمه‌های کنترل */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between p-4">
        <button
          onClick={() => onMove('left')}
          disabled={disabled}
          className="px-8 py-4 bg-red-500 text-white rounded-lg text-xl font-bold disabled:opacity-50"
        >
          ◀ چپ
        </button>
        <button
          onClick={() => onMove('right')}
          disabled={disabled}
          className="px-8 py-4 bg-green-500 text-white rounded-lg text-xl font-bold disabled:opacity-50"
        >
          راست ▶
        </button>
      </div>
      
      {/* نمایش سطح فعلی */}
      <div className="absolute top-4 left-4 bg-amber-700 px-3 py-1 rounded-lg">
        <span className="text-white font-bold">سطح: {nextBranch.level}</span>
      </div>
    </div>
  );
};

function App() {
    const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState("auth");
    const [finalScore, setFinalScore] = useState(null);
    const [score, setScore] = useState(0);
    const [error, setError] = useState(null);
    const [leaderboardKey, setLeaderboardKey] = useState(Date.now());
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [token, setToken] = useState(
        () => localStorage.getItem("jwtToken") || null
    );
    const [userData, setUserData] = useState(() => {
        const saved = localStorage.getItem("userData");
        return saved ? JSON.parse(saved) : null;
    });
    const [gameActive, setGameActive] = useState(false);
    const [currentGameEventId, setCurrentGameEventId] = useState(null);
    
    // حالت‌های جدید برای بازی Lumberjack
    const [lumberjackPosition, setLumberjackPosition] = useState('left');
    const [nextBranch, setNextBranch] = useState({ 
      side: 'none', 
      level: 1 
    });

    const timerId = useRef(null);
    const abortControllerRef = useRef(null);

    const clearResources = useCallback(() => {
        if (timerId.current) clearInterval(timerId.current);
        if (abortControllerRef.current) abortControllerRef.current.abort();

        timerId.current = null;
        abortControllerRef.current = null;
    }, []);

    const handleGameOver = useCallback(
        (finalScore) => {
            clearResources();
            setFinalScore(finalScore);
            setView("board");
            setLeaderboardKey(Date.now());
            setGameActive(false);
        },
        [clearResources]
    );

    const handleTimeout = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/timeOut`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error("Timeout API call failed");
                handleGameOver(score);
                return;
            }

            const data = await response.json();
            handleGameOver(data.final_score);
        } catch (error) {
            console.error("Error during timeout handling:", error);
            handleGameOver(score);
        }
    }, [token, score, handleGameOver]);

    const startLocalTimer = useCallback(
        (initialTime) => {
            clearResources();
            setTimeLeft(initialTime);

            timerId.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleTimeout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        },
        [clearResources, handleTimeout]
    );

    // تابع جدید برای حرکت چوب‌بر
    const moveLumberjack = useCallback(
        async (direction) => {
            if (loading || !token || !gameActive) return;

            try {
                setLoading(true);
                setError(null);
                abortControllerRef.current = new AbortController();

                const response = await fetch(`${API_BASE}/move`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ direction }),
                    signal: abortControllerRef.current.signal,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.message || "Failed to move lumberjack"
                    );
                }

                const data = await response.json();

                if (data.status === "continue") {
                    // به‌روزرسانی وضعیت بازی
                    setLumberjackPosition(data.lumberjackPosition);
                    setNextBranch(data.nextBranch);
                    setScore(data.score);
                    startLocalTimer(data.time_left);
                } else if (data.status === "game_over") {
                    handleGameOver(data.final_score);
                }
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Move error:", err);
                    setError(err.message || "Failed to move");

                    if (
                        err.message.includes("token") ||
                        err.message.includes("Unauthorized")
                    ) {
                        setIsAuthenticated(false);
                        setView("auth");
                    }
                }
            } finally {
                if (!abortControllerRef.current?.signal.aborted) {
                    setLoading(false);
                }
            }
        },
        [loading, handleGameOver, token, startLocalTimer, gameActive]
    );

    const startGame = useCallback(
        async (eventId) => {
            setCurrentGameEventId(eventId);

            if (!isAuthenticated || !token) {
                setError("Please authenticate first");
                setView("auth");
                return;
            }

            try {
                setLoading(true);
                setError(null);
                setGameActive(true);

                const abortController = new AbortController();
                abortControllerRef.current = abortController;

                const response = await fetch(`${API_BASE}/start`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ eventId }),
                    signal: abortController.signal,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                        errorData.message ||
                            `Request failed with status ${response.status}`
                    );
                }

                const data = await response.json();

                if (!data || data.status !== "success") {
                    throw new Error(data?.message || "Invalid server response");
                }

                // تنظیم وضعیت اولیه بازی Lumberjack
                setLumberjackPosition(data.lumberjackPosition);
                setNextBranch(data.nextBranch);
                startLocalTimer(data.time_left ?? ROUND_TIME);
                setScore(data.score ?? 0);
                setView("game");
            } catch (err) {
                if (err.name === "AbortError") {
                    console.log("Request was aborted");
                    return;
                }

                console.error("Game start error:", err);
                setError(
                    err.message.includes("Failed to fetch")
                        ? "Could not connect to server. Please check your connection."
                        : err.message
                );
                setGameActive(false);
                setView("lobby");
            } finally {
                if (!abortControllerRef.current?.signal.aborted) {
                    setLoading(false);
                }
            }
        },
        [startLocalTimer, isAuthenticated, token]
    );

    const handleImageError = useCallback((e) => {
        if (e.target.src !== DefaultAvatar) {
            e.target.src = DefaultAvatar;
        }
        e.target.onerror = null;
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            if (token && userData) {
                setIsAuthenticated(true);
                setView("lobby");
                setAuthLoading(false);
            } else {
                await authenticateUser();
            }
        };

        initAuth();
        return () => clearResources();
    }, [authenticateUser, clearResources, token, userData]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("userData");
        setToken(null);
        setUserData(null);
        setIsAuthenticated(false);
        setView("auth");
    }, []);

    const authenticateUser = useCallback(async () => {
        try {
            setAuthLoading(true);
            setError(null);

            if (!window.Telegram?.WebApp) {
                console.log(
                    "Running in non-Telegram environment, skipping authentication"
                );
                setIsAuthenticated(true);
                setView("home");
                return;
            }

            const initData = window.Telegram.WebApp.initData || "";
            if (!initData) {
                throw new Error("Telegram authentication data not found");
            }

            const response = await fetch(`${API_BASE}/telegram-auth`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ initData }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || "Authentication failed");
            }

            const data = await response.json();

            if (!data?.valid) {
                throw new Error(data?.message || "Invalid Telegram user");
            }

            setToken(data.token);
            setUserData(data.user);
            localStorage.setItem("jwtToken", data.token);
            localStorage.setItem("userData", JSON.stringify(data.user));
            setIsAuthenticated(true);
            setView("lobby");
        } catch (error) {
            console.error("Authentication error:", error);
            setError(error.message);
            setIsAuthenticated(false);
            setView("auth");
        } finally {
            setAuthLoading(false);
        }
    }, []);

    const authContent = useMemo(() => {
        if (view !== "auth") return null;

        return (
            <div className="flex flex-col items-center gap-6 w-full max-w-md">
                <h2 className="text-2xl font-bold">به بازی چوب‌بر خوش آمدید</h2>
                <p className="text-center">
                    {window.Telegram?.WebApp
                        ? "لطفاً برای بازی، احراز هویت تلگرام را انجام دهید"
                        : "این بازی در محیط تلگرام طراحی شده است. لطفاً از طریق تلگرام بازی کنید."}
                </p>
                {error && <p className="text-red-300">{error}</p>}
                {window.Telegram?.WebApp && (
                    <button
                        onClick={authenticateUser}
                        disabled={authLoading}
                        className={`px-6 py-3 bg-white text-indigo-600 rounded-xl text-xl font-bold ${
                            authLoading ? "opacity-50" : "hover:bg-gray-100"
                        }`}
                    >
                        {authLoading
                            ? "در حال احراز هویت..."
                            : "احراز هویت با تلگرام"}
                    </button>
                )}
            </div>
        );
    }, [view, authLoading, error, authenticateUser]);

    const lobbyContent = useMemo(() => {
        if (view !== "lobby") return null;

        return (
            <GameLobby
                onGameStart={startGame}
                userData={userData}
                onLogout={handleLogout}
                onImageError={handleImageError}
            />
        );
    }, [view, startGame, userData, handleLogout, handleImageError]);

    // محتوای بازی Lumberjack
    const gameContent = useMemo(() => {
        if (view !== "game") return null;

        return (
            <div className="flex flex-col items-center gap-6 w-full max-w-md">
                <div className="flex justify-between w-full">
                    <p className="text-2xl font-bold">امتیاز: {score}</p>
                    {userData && (
                        <div className="flex items-center gap-2">
                            <img
                                src={
                                    userData.photo_url
                                        ? `/api/avatar?url=${encodeURIComponent(
                                              userData.photo_url
                                          )}`
                                        : DefaultAvatar
                                }
                                alt="Profile"
                                className="w-12 h-12 rounded-full"
                                onError={handleImageError}
                            />
                            <span>{userData.first_name}</span>
                        </div>
                    )}
                </div>

                {/* کامپوننت بازی Lumberjack */}
                <LumberjackGame 
                    lumberjackPosition={lumberjackPosition}
                    nextBranch={nextBranch}
                    onMove={moveLumberjack}
                    disabled={loading || !gameActive}
                />
                
                <TimerCircle total={ROUND_TIME} left={timeLeft} />
            </div>
        );
    }, [
        view,
        score,
        timeLeft,
        loading,
        handleImageError,
        userData,
        gameActive,
        lumberjackPosition,
        nextBranch,
        moveLumberjack
    ]);

    const leaderboardContent = useMemo(
        () =>
            view === "board" && (
                <Leaderboard
                    key={leaderboardKey}
                    API_BASE={API_BASE}
                    finalScore={finalScore}
                    onReplay={() => startGame(currentGameEventId)}
                    onHome={() => setView("lobby")}
                    userData={userData}
                    eventId={currentGameEventId}
                />
            ),
        [
            view,
            startGame,
            leaderboardKey,
            finalScore,
            userData,
            currentGameEventId,
        ]
    );

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-4">
            {error && (
                <div
                    className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-md shadow-lg z-50 max-w-md text-center animate-fade-in"
                    role="alert"
                >
                    {error}
                    <button
                        onClick={() => setError(null)}
                        className="ml-2 text-white hover:text-gray-200"
                        aria-label="Close error message"
                    >
                        &times;
                    </button>
                </div>
            )}

            {authContent}
            {lobbyContent}
            {gameContent}
            {leaderboardContent}

            {view === "game" && (
                <img
                    src={`${process.env.PUBLIC_URL}/teamlogo.png?v=2`}
                    alt="Team Logo"
                    className="absolute bottom-4 right-4 w-20 h-20 object-contain opacity-40 pointer-events-none z-0"
                    loading="lazy"
                />
            )}
        </div>
    );
}

export default React.memo(App);
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const { rewardUser } = require("./ontonApi");
const logger = require("./logger");

const path = require("path");
const GameEngine = require("./game_engine.js");
const validateTelegramData = require("./telegramAuth").default;
const jwt = require("jsonwebtoken");

const { User, Score, Reward, sequelize } = require("./DataBase/models");
const MaxTime = 15;
const rewardTime = 2;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const allowedOrigins = [
    "https://momis.studio",
    "https://www.momis.studio",
    "https://web.telegram.org",
    "https://lumberjack.momis.studio/",
];

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", allowedOrigins);
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

const corsOptions = {
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
    credentials: true,
    optionsSuccessStatus: 200,
};

app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

class Player {
    constructor(playerId, jwtPayload) {
        this.id = playerId;
        this.jwtPayload = jwtPayload;
        this.score = 0;
        this.top_score = 0;
        this.time_left = MaxTime / 2;
        this.game_active = false;
        this.timer = null;
        this.should_stop = false;
        this.last_activity = new Date();
        this.currentEventId = null;
        
        // حالت‌های جدید برای بازی LumberJack
        this.lumberjackPosition = 'left'; // موقعیت شروع چوب‌بر
        var firstBranch = GameEngine.generate(1, 'none').side;
        var secondBranch = GameEngine.generate(1, firstBranch).side;
        this.branches = ['none', 'none', firstBranch, secondBranch, GameEngine.generate(secondBranch),];
        this.level = 1; // سطح فعلی بازی

        logger.info(`New player created: ${jwtPayload?.userId}`);
    }
}

class LumberjackGame {
    constructor() {
        this.players = {};
        this.userToPlayerMap = {};
        this.total_time = MaxTime;
        this.cleanup_interval = 600000;
        this.startCleanup();
        logger.info("LumberjackGame initialized");
    }

    startCleanup() {
        setInterval(() => {
            try {
                this.cleanupInactivePlayers();
            } catch (e) {
                logger.error(`Cleanup error: ${e.message}`);
            }
        }, this.cleanup_interval);
    }

    cleanupInactivePlayers() {
        const now = new Date();
        Object.keys(this.players).forEach((pid) => {
            try {
                if (
                    now - this.players[pid].last_activity >
                    this.cleanup_interval
                ) {
                    const player = this.players[pid];

                    if (player.jwtPayload?.userId) {
                        delete this.userToPlayerMap[player.jwtPayload.userId];
                    }

                    if (player.timer) {
                        player.should_stop = true;
                        clearTimeout(player.timer);
                    }
                    delete this.players[pid];
                    logger.info(`Cleaned up inactive player: ${pid}`);
                }
            } catch (e) {
                logger.error(`Error cleaning player ${pid}: ${e.message}`);
            }
        });
    }

    runTimer(playerId) {
        const player = this.players[playerId];
        if (!player) return;

        player.should_stop = false;

        const tick = () => {
            if (!player || player.should_stop || !player.game_active) {
                return;
            }

            player.time_left -= 1;
            player.last_activity = new Date();

            if (player.time_left < 0) {
                logger.info(
                    `Player ${playerId} server-side timer expired. Triggering final save...`
                );
                this.timeHandler(player.jwtPayload.userId);
                return;
            }

            player.timer = setTimeout(tick, 1000);
        };

        player.timer = setTimeout(tick, 1000);
    }

    async startGame(jwtPayload, eventId) {
        try {
            const userId = jwtPayload?.userId;
            if (!userId) {
                throw new Error("User ID is missing in JWT payload");
            }

            const [user] = await User.findOrCreate({
                where: { telegramId: userId },
                defaults: {
                    firstName: jwtPayload.firstName,
                    lastName: jwtPayload.lastName,
                    username: jwtPayload.username,
                    photo_url: jwtPayload.photo_url,
                },
            });

            const topScoreResult = await Score.findOne({
                where: { userTelegramId: userId },
                attributes: [
                    [sequelize.fn("max", sequelize.col("score")), "top_score"],
                ],
                raw: true,
            });
            const top_score = topScoreResult?.top_score || 0;

            const playerId = userId;
            this.players[playerId] = new Player(playerId, jwtPayload);
            this.userToPlayerMap[userId] = playerId;

            const player = this.players[playerId];
            player.game_active = true;
            player.time_left = this.total_time;
            player.score = 0;
            player.top_score = top_score;
            player.last_activity = new Date();
            player.currentEventId = eventId;
            player.level = 1;
            
            // حالت‌های جدید برای بازی LumberJack
            player.lumberjackPosition = 'left';
            this.runTimer(playerId);

            logger.info(
                `Game started for user ${userId}. Event ID: ${
                    player.currentEventId || "Free Play"
                }`
            );

            return {
                status: "success",
                player_id: playerId,
                time_left: player.time_left,
                score: player.score,
                top_score: player.top_score,
                game_active: true,
                user: user.toJSON(),
                // داده‌های جدید برای بازی
                lumberjackPosition: player.lumberjackPosition,
                branches: player.branches
            };
        } catch (e) {
            logger.error(`Start game error: ${e.message}`, { stack: e.stack });
            return {
                status: "error",
                message: "Failed to start game",
            };
        }
    }

    async timeHandler(userId) {
        try {
            const playerId = this.userToPlayerMap[userId];
            if (
                !playerId ||
                !this.players[playerId] ||
                !this.players[playerId].game_active
            ) {
                const player = this.players[playerId];
                return {
                    status: "game_over",
                    final_score: player ? player.score : 0,
                };
            }

            const player = this.players[playerId];
            player.game_active = false;

            if (player.score > 0) {
                await Score.create({
                    score: player.score,
                    userTelegramId: userId,
                    eventId: player.currentEventId,
                });
                logger.info(
                    `Saved final score ${
                        player.score
                    } for user ${userId} via TIMEOUT in event ${
                        player.currentEventId || "Free Play"
                    }`
                );
            }

            player.top_score = Math.max(player.top_score, player.score);

            return {
                status: "game_over",
                final_score: player.score,
                top_score: player.top_score,
                eventId: player.currentEventId,
            };
        } catch (e) {
            logger.error(`TimeHandle error: ${e.message}`);
            return { status: "error", message: e.message };
        }
    }

    async moveLumberjack(userId, direction) {
        try {
            const playerId = this.userToPlayerMap[userId];
            if (!playerId || !this.players[playerId]) {
                return {
                    status: "error",
                    message: "Player not found. Start a new game.",
                };
            }

            const player = this.players[playerId];
            player.last_activity = new Date();

            if (!player.game_active) {
                return {
                    status: "game_over",
                    final_score: player.score,
                    top_score: player.top_score,
                    eventId: player.currentEventId,
                };
            }

            // تغییر موقعیت چوب‌بر
            player.lumberjackPosition = direction;

            // بررسی برخورد با شاخه
            if (player.branches[1] === direction && player.branches[1] !== 'none') {
                // برخورد با شاخه - پایان بازی
                player.game_active = false;

                if (player.score > 0) {
                    await Score.create({
                        score: player.score,
                        userTelegramId: userId,
                        eventId: player.currentEventId,
                    });
                    logger.info(
                        `Saved final score ${
                            player.score
                        } for user ${userId} due to collision in event ${
                            player.currentEventId || "Free Play"
                        }`
                    );
                }

                player.top_score = Math.max(player.top_score, player.score);

                return {
                    status: "game_over",
                    final_score: player.score,
                    top_score: player.top_score,
                    reason: "hit_branch"
                };
            }

            // افزایش امتیاز و تولید شاخه جدید
            player.score += 1;
            player.level += 1;
            player.time_left += rewardTime;
            player.time_left = Math.min(MaxTime, player.time_left);
            var nextBranch = GameEngine.generate(player.level, player.branches[-1]);
            for (var i = 1; i < 5; i++){
                if (i != 4)
                    player.branches[i] = player.branches[i+1];
                else
                    player.branches[i] = nextBranch;
            }
            console.log(player.level + "        " + player.branches);

            return {
                status: "continue",
                time_left: player.time_left,
                score: player.score,
                game_active: true,
                // داده‌های جدید برای بازی
                lumberjackPosition: player.lumberjackPosition,
                branches: player.branches
            };
        } catch (e) {
            logger.error(`Move lumberjack error: ${e.message}`);
            return { status: "error", message: e.message };
        }
    }
}

const gameInstance = new LumberjackGame();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Authentication token required" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            logger.error(`JWT verification failed: ${err.message}`);
            return res.status(403).json({ error: "Invalid or expired token" });
        }

        req.user = decoded;
        next();
    });
};

app.use(express.static(path.join(__dirname, "../frontend/build")));

// API Routes
app.post("/api/telegram-auth", (req, res) => {
    try {
        const { initData } = req.body;
        if (!initData) {
            logger.error("[Telegram Auth] No initData provided");
            return res.status(400).json({
                valid: false,
                message: "initData is required",
            });
        }

        const userData = validateTelegramData(initData, process.env.BOT_TOKEN);

        const token = jwt.sign(
            {
                userId: userData.id,
                firstName: userData.first_name,
                lastName: userData.last_name,
                username: userData.username,
                photo_url: userData.photo_url,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        logger.info(
            `Telegram authentication successful for user: ${userData.id}`
        );

        return res.json({
            valid: true,
            user: {
                id: userData.id,
                first_name: userData.first_name,
                last_name: userData.last_name,
                username: userData.username,
                language_code: userData.language_code,
                allows_write_to_pm: userData.allows_write_to_pm,
                photo_url: userData.photo_url,
            },
            token: token,
        });
    } catch (error) {
        logger.error("Telegram auth error:", {
            error: error.message,
            stack: error.stack,
        });

        return res.status(401).json({
            valid: false,
            message: "Authentication failed",
        });
    }
});

app.post("/api/start", authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { eventId } = req.body;

        logger.info(`Start game request for user: ${user.userId}`, { eventId });

        const result = await gameInstance.startGame(user, eventId);
        res.json(result);
    } catch (e) {
        logger.error(`API start error: ${e.message}`, {
            stack: e.stack,
        });
        res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
});

app.post("/api/move", authenticateToken, async (req, res) => {
    try {
        console.log(req.body);
        const direction = req.body.answer ? 'left' : 'right';
        const user = req.user;

        if (!direction || !['left', 'right'].includes(direction)) {
            return res.status(400).json({
                status: "error",
                message: "Valid direction (left/right) is required got " + direction,
            });
        }

        const result = await gameInstance.moveLumberjack(user.userId, direction);
        res.json(result);
    } catch (e) {
        logger.error(`API move error: ${e.message}`, {
            stack: e.stack,
        });

        res.status(500).json({
            status: "error",
            message: "Internal server error",
            ...(process.env.NODE_ENV === "development" && {
                details: e.message,
            }),
        });
    }
});

app.post("/api/timeOut", authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const result = await gameInstance.timeHandler(user.userId);
        res.json(result);
    } catch (e) {
        logger.error(`API timeOut error: ${e.message}`, {
            stack: e.stack,
        });

        res.status(500).json({
            status: "error",
            message: "Internal server error",
            ...(process.env.NODE_ENV === "development" && {
                details: e.message,
            }),
        });
    }
});

app.get("/api/leaderboard", authenticateToken, async (req, res) => {
    try {
        const currentUserTelegramId = req.user.userId;
        const { eventId } = req.query;

        const whereCondition = {};
        if (eventId && eventId !== "null" && eventId !== "undefined") {
            whereCondition.eventId = eventId;
        } else {
            whereCondition.eventId = null;
        }
        logger.info(`Fetching leaderboard for user ${currentUserTelegramId} with condition:`, whereCondition);

        const allScores = await Score.findAll({
            where: whereCondition,
            attributes: [
                "userTelegramId",
                [sequelize.fn("MAX", sequelize.col("score")), "max_score"],
            ],
            group: ["userTelegramId"],
            order: [[sequelize.col("max_score"), "DESC"]],
            raw: true,
        });

        let rank = 0;
        let lastScore = Infinity;
        const allRanks = allScores.map((entry, index) => {
            if (entry.max_score < lastScore) {
                rank = index + 1;
                lastScore = entry.max_score;
            }
            return {
                userTelegramId: entry.userTelegramId,
                score: entry.max_score,
                rank: rank,
            };
        });

        const top5Players = allRanks.slice(0, 5);
        const currentUserData = allRanks.find(
            (p) => p.userTelegramId == currentUserTelegramId
        );

        const userIdsToFetch = [
            ...new Set([
                ...top5Players.map((p) => p.userTelegramId),
                ...(currentUserData ? [currentUserData.userTelegramId] : []),
            ]),
        ];
        
        const users = await User.findAll({
            where: { telegramId: userIdsToFetch },
            raw: true,
        });

        const userMap = users.reduce((map, user) => {
            map[user.telegramId] = user;
            return map;
        }, {});

        const formatPlayer = (playerData) => {
            if (!playerData) return null;
            const userProfile = userMap[playerData.userTelegramId];
            return {
                telegramId: userProfile?.telegramId,
                username: userProfile?.username,
                firstName: userProfile?.firstName,
                photo_url: userProfile?.photo_url,
                score: playerData.score,
                rank: playerData.rank,
            };
        };
        
        res.json({
            status: "success",
            leaderboard: {
                top: top5Players.map(formatPlayer),
                currentUser: formatPlayer(currentUserData),
            },
        });

    } catch (e) {
        logger.error(`Leaderboard error: ${e.message}`, { stack: e.stack });
        res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
});

app.get("/api/events", (req, res) => {
    const activeEvents = [];

    if (process.env.ONTON_EVENT_UUID) {
        activeEvents.push({
            id: process.env.ONTON_EVENT_UUID,
            name: "Main Tournament",
            description: "Compete for the grand prize in the main event!",
        });
    }

    res.json({
        status: "success",
        events: activeEvents,
    });
});

app.get("/api/avatar", async (req, res) => {
    try {
        const externalUrl = req.query.url;

        if (!externalUrl || !externalUrl.startsWith("https://t.me/")) {
            return res.status(400).send("Invalid URL");
        }

        const response = await fetch(externalUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=86400");
        response.body.pipe(res);
    } catch (error) {
        logger.error(`Avatar proxy error: ${error.message}`);
        res.status(404).sendFile(
            path.join(__dirname, "../frontend/build", "default-avatar.png")
        );
    }
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

const PORT = process.env.PORT || 10101;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);
});
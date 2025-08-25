'use strict';
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const logger = require('./logger');

const token = process.env.BOT_TOKEN;
if (!token) {
    throw new Error('Telegram BOT_TOKEN is not configured in .env file.');
}
const { User, Score, Reward, sequelize } = require("./DataBase/models");

const REQUIRED_CHANNEL_ID = process.env.REQUIRED_CHANNEL_ID;
const REQUIRED_GROUP_ID = process.env.REQUIRED_GROUP_ID;
const GROUP_INVITE_LINK = process.env.GROUP_INVITE_LINK;
const WEB_APP_URL = 'https://lumberjack.momis.studio';
const BOT_USERNAME = process.env.BOT_USERNAME;

const bot = new TelegramBot(token, { polling: true });

async function isUserMember(userId) {
    const CHANNEL_ID = REQUIRED_CHANNEL_ID || '@MOMIS_studio';
    const GROUP_ID = REQUIRED_GROUP_ID || '@MOMIS_community';
    
    try {
        const validStatuses = ['member', 'administrator', 'creator'];
        const [channelMember, groupMember] = await Promise.all([
            bot.getChatMember(CHANNEL_ID, userId),
            bot.getChatMember(GROUP_ID, userId)
        ]);

        logger.info(`Membership check for user ${userId}: Channel status='${channelMember.status}', Group status='${groupMember.status}'`);
        const inChannel = validStatuses.includes(channelMember.status);
        const inGroup = validStatuses.includes(groupMember.status);

        return inChannel && inGroup;
    } catch (error) {
        if (error.response?.body?.description.includes('user not found')) {
            logger.warn(`User ${userId} not found in channel/group, considered as not a member.`);
            return false;
        }
        logger.error(`Failed to check channel membership for ${userId}: ${error.message}`);
        return false;
    }
}

// Handler for '/start <payload>'
bot.onText(/\/start (.+)/, async (msg, match) => {
    const userId = msg.from.id;
    const firstName = msg.from.first_name;
    const username = msg.from.username;
    const lastName = msg.from.last_name;
    const payload = match[1];

    let referrerTelegramId = null;
    if (payload.startsWith('invite_')) {
        referrerTelegramId = parseInt(payload.substring(7), 10);
        if (isNaN(referrerTelegramId) || referrerTelegramId === userId) {
            referrerTelegramId = null; 
        }
    }

    try {
        let user = await User.findByPk(userId);

        if (!user) {
            user = await User.create({
                telegramId: userId,
                username: username,
                firstName: firstName,
                lastName: lastName,
                referrerTelegramId: referrerTelegramId,
            });
            logger.info(`New user registered: ${userId}. Referrer: ${referrerTelegramId || 'None'}`);

            if (referrerTelegramId) {
                const referrer = await User.findByPk(referrerTelegramId);
                const referrerName = referrer ? (referrer.firstName || referrer.username) : 'a friend';
                await bot.sendMessage(userId, 
                    `👋 Welcome, *${firstName}*! You were invited by *${referrerName}* to join the game.`, 
                    { parse_mode: "Markdown" }
                );
            } else {
                await bot.sendMessage(userId, 
                    `🎉 Welcome, *${firstName}*!`, 
                    { parse_mode: "Markdown" }
                );
            }
        } else {
            logger.info(`Existing user ${userId} started bot.`);
        }
    
        const isMember = await isUserMember(userId);
        if (!isMember) {
            const channelLink = `https://t.me/${(REQUIRED_CHANNEL_ID || '@MOMIS_studio').replace('@', '')}`;
            const groupLink = GROUP_INVITE_LINK || 'https://t.me/MOMIS_community';
            const message = `👋 Hello, *${firstName}*!\n\nTo play the game, please join our community channels first, then click the button below.`;
            const options = {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '📢 Join Channel', url: channelLink }],
                        [{ text: '💬 Join Community Group', url: groupLink }],
                        [{ text: '✅ I\'ve Joined!', callback_data: 'check_membership' }]
                    ]
                }
            };
            await bot.sendMessage(userId, message, options);
        } else {
            const welcomeText = `🎉 Welcome, *${firstName}*!\n\n Click the button below to play **LumberJack**!`;
            const options = {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [[{ text: "🚀 Play Game!", web_app: { url: WEB_APP_URL } }]]
                }
            };
            await bot.sendMessage(userId, welcomeText, options);
        }
    } catch (error) {
        logger.error(`Error in /start handler for user ${userId}: ${error.message}`);
        await bot.sendMessage(userId, '❌ An error occurred. Please try again later.');
    }
});

// Handler for '/start' without payload
bot.onText(/^\/start$/, async (msg) => {
    const userId = msg.from.id;
    const firstName = msg.from.first_name;
    const username = msg.from.username;
    const lastName = msg.from.last_name;

    try {
        let user = await User.findByPk(userId);

        if (!user) {
            user = await User.create({
                telegramId: userId,
                username: username,
                firstName: firstName,
                lastName: lastName,
                hasTriggeredReferralReward: false,
            });
            await Score.create({ userTelegramId: userId, value: 0 });
            logger.info(`New user registered without referrer: ${userId}`);
        }
        
        const isMember = await isUserMember(userId);
        if (!isMember) {
            const channelLink = `https://t.me/${(REQUIRED_CHANNEL_ID || '@MOMIS_studio').replace('@', '')}`;
            const groupLink = GROUP_INVITE_LINK || 'https://t.me/MOMIS_community';
            const message = `👋 Hello, *${firstName}*!\n\nTo play the game, please join our community channels first, then click the button below.`;
            const options = {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '📢 Join Channel', url: channelLink }],
                        [{ text: '💬 Join Community Group', url: groupLink }],
                        [{ text: '✅ I\'ve Joined!', callback_data: 'check_membership' }]
                    ]
                }
            };
            await bot.sendMessage(userId, message, options);
        } else {
            const welcomeText = `🎉 Welcome, *${firstName}*!\n\n Click the button below to play **LumberJack**!`;
            const options = {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [[{ text: "🚀 Play Game!", web_app: { url: WEB_APP_URL } }]]
                }
            };
            await bot.sendMessage(userId, welcomeText, options);
        }
    } catch (error) {
        logger.error(`Error in simple /start handler for user ${userId}: ${error.message}`);
        await bot.sendMessage(userId, '❌ An error occurred. Please try again later.');
    }
});

// Handler for 'I've Joined!' button
bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    const userId = callbackQuery.from.id;
    const firstName = callbackQuery.from.first_name;

    if (callbackQuery.data === 'check_membership') {
        const isMember = await isUserMember(userId);
        if (isMember) {
            const successText = `✅ **Thank you, ${firstName}!**\n\nYou're all set. Click the button below to start playing!`;
            const playOptions = {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '🚀 Play Game!', web_app: { url: WEB_APP_URL } }]]
                }
            };
            await bot.editMessageText(successText, {
                chat_id: msg.chat.id,
                message_id: msg.message_id,
                ...playOptions
            });
        } else {
            await bot.answerCallbackQuery(callbackQuery.id, {
                text: "You haven't joined our channel and group yet. Please join both first.",
                show_alert: true
            });
        }
    }
});

// Handler for '/invite' command
bot.onText(/\/invite/, async (msg) => {
    const userId = msg.from.id;
    const firstName = msg.from.first_name;

    try {
        const referralLink = `https://t.me/${BOT_USERNAME}?start=invite_${userId}`;
        const message = `👋 Hi, *${firstName}*!\n\nThis is your personal invite link. Share it with your friends to earn points! 👇\n\n\`${referralLink}\``;
        const options = {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔗 My Invite Link', url: referralLink }],
                    [{ text: '🚀 Play Game!', web_app: { url: WEB_APP_URL } }]
                ]
            }
        };
        await bot.sendMessage(userId, message, options);
        logger.info(`Referral link sent to user ${userId}`);
    } catch (error) {
        logger.error(`Error sending referral link to ${userId}: ${error.message}`);
        await bot.sendMessage(userId, '❌ Sorry, I cannot create your invite link right now. Please try again later.');
    }
});

// Additional handlers (you can add more as needed)
// ...

bot.on("polling_error", (error) => logger.error(`Telegram Polling Error: ${error.message}`));
logger.info("Telegram Bot initialized and is now listening for commands...");

module.exports = {
    bot,
    isUserMember
};
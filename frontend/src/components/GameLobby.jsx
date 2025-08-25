// frontend/src/components/GameLobby.jsx

import React, { useState, useEffect } from "react";
import DefaultAvatar from "../assets/default-avatar.png"; // Add this line
import { ClipboardCopyIcon, ShareIcon } from "@heroicons/react/outline"; // Import icons

// Assuming you have a central api service to handle authenticated requests
// If not, you can use axios or fetch directly.
const api = {
  get: (url) =>
    fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => res.json()),
};

const GameLobby = ({ onGameStart, userData, onLogout, onImageError }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/api/events");
        if (response.status === "success") {
          setEvents(response.events);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleStartGame = (eventId) => {
    onGameStart(eventId);
  };

  const handleCopyLink = async () => {
    const inviteLink = `https://t.me/${userData.bot_username}?start=invite_${userData.telegramId}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShareLink = async () => {
    const inviteLink = `https://t.me/${userData.bot_username}?start=invite_${userData.telegramId}`;
    const shareText = `Hey! Join me and play this awesome game on Telegram and earn rewards. Use my personal link: ${inviteLink}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Invite a Friend',
          text: shareText,
          url: inviteLink,
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      alert('Web Share API is not supported in your browser. You can copy the link instead.');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto text-center p-6">
        <p className="text-white text-lg">Loading Events...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-gray-800 bg-opacity-70 rounded-xl shadow-lg p-6 text-white animate-fade-in">
      {userData && (
        <div className="flex items-center gap-3 bg-white/10 p-2 rounded-lg mb-6">
          <img
            src={userData.photo_url ? `/api/avatar?url=${encodeURIComponent(userData.photo_url)}` : DefaultAvatar}
            alt="Profile"
            className="w-12 h-12 rounded-full border-2 border-gray-500"
            onError={onImageError}
          />
          <div className="flex-grow">
            <h2 className="font-bold text-lg leading-tight">
              {userData.first_name} {userData.last_name}
            </h2>
            <p className="text-sm opacity-80">
              @{userData.username}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="ml-auto text-xs bg-red-500/50 px-3 py-1.5 rounded-md hover:bg-red-500/80 transition-colors"
            title="Logout"
          >
            Logout
          </button>
        </div>
      )}

      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors mb-6 flex items-center justify-center space-x-2"
      >
        <span>Invite Friends</span>
        <ShareIcon className="h-5 w-5" />
      </button>

      <h1 className="text-3xl font-bold mb-6 text-center text-yellow-400">
        Game Mode
      </h1>

      <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4 my-3 transition-transform transform hover:scale-105">
        <h2 className="text-xl font-bold text-white">Free Play</h2>
        <p className="text-sm text-gray-300 mt-1 mb-3">
          Practice and play just for fun.
        </p>
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          onClick={() => handleStartGame(null)}
        >
          Start
        </button>
      </div>

      {events.length > 0 && (
        <div className="relative flex py-3 items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-400">
            Events
          </span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>
      )}

      {events.map((event) => (
        <div
          key={event.id}
          className="bg-gray-700 bg-opacity-50 rounded-lg p-4 my-3 transition-transform transform hover:scale-105"
        >
          <h2 className="text-xl font-bold text-yellow-400">
            {event.name}
          </h2>
          <p className="text-sm text-gray-300 mt-1 mb-3">
            {event.description}
          </p>
          <button
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            onClick={() => handleStartGame(event.id)}
          >
            Join Event
          </button>
        </div>
      ))}

      {/* Referral Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-gray-800 bg-opacity-90 rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Invite a Friend
            </h2>
            <p className="text-gray-300 text-center mb-4">
              Share your personal invite link to earn rewards when a friend joins!
            </p>
            <div className="bg-gray-700 rounded-lg p-3 break-all mb-4 text-sm text-gray-300">
              {`https://t.me/${userData.bot_username}?start=invite_${userData.telegramId}`}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleCopyLink}
                className={`flex-grow flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-bold transition-colors ${
                  copied
                    ? "bg-green-500 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <ClipboardCopyIcon className="h-5 w-5" />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <button
                onClick={handleShareLink}
                className="flex-grow flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold transition-colors"
              >
                <ShareIcon className="h-5 w-5" />
                <span>Share</span>
              </button>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 w-full text-center text-gray-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLobby;
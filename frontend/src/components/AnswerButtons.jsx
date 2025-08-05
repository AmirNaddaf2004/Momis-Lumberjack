/**
 * دو دکمهٔ «درست / نادرست»
 * @param {{ onAnswer: (answer: boolean)=>void, disabled: boolean }} props
 */
export default function AnswerButtons({ onAnswer, disabled }) {
  const base =
    "flex items-center justify-center w-14 h-14 rounded-full text-2xl font-semibold transition-transform active:scale-95";

  // استایل‌های درون‌خطی برای پس‌زمینه و سایه
  const woodenStyle = {
    background:
      "radial-gradient(circle, #ffe0b2 0%, #ffcc80 20%, #ffb74d 40%, #ffa726 60%, #ff9800 80%, #fb8c00 100%)",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
  };

  return (
    <div className="flex gap-8 mt-8 justify-center">
      <button
        className={`${base} text-black`}
        style={woodenStyle}
        onClick={() => onAnswer(true)}
        disabled={disabled}
        aria-label="False"
      >
        ←
      </button>

      <button
        className={`${base} text-black`}
        style={woodenStyle}
        onClick={() => onAnswer(false)}
        disabled={disabled}
        aria-label="True"
      >
        →
      </button>
    </div>
  );
}
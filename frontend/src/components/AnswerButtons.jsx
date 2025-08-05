/**
 * دو دکمهٔ «درست / نادرست»
 * @param {{ onAnswer: (answer: boolean)=>void, disabled: boolean }} props
 */
export default function AnswerButtons({ onAnswer, disabled }) {
  const base =
    "flex items-center justify-center w-14 h-14 rounded-full text-2xl font-semibold shadow-lg transition-transform active:scale-95";

  // استایل های جدید برای دکمه های چوبی
  const woodenButton = "wooden-button text-brown-800"; 

  return (
    <div className="flex gap-8 mt-8 justify-center">
      <button
        className={`${base} ${woodenButton}`}
        onClick={() => onAnswer(true)}
        disabled={disabled}
        aria-label="False"
      >
        ←
      </button>

      <button
        className={`${base} ${woodenButton}`}
        onClick={() => onAnswer(false)}
        disabled={disabled}
        aria-label="True"
      >
        →
      </button>
    </div>
  );
}
import { motion } from "framer-motion";

// This component displays the animated horizontal timer bar
export default function TimerCircle({ total, left }) {
    // Calculate the width percentage based on time left
    const widthPercentage = (left / total) * 100;
    
    // Define the color stops for the gradient transition
    const colors = {
        green: "#10b981", // Green for high time
        yellow: "#f59e0b", // Yellow for medium time
        red: "#ef4444"      // Red for low time
    };

    // Determine the current color based on the time remaining
    const barColor = left > 5 ? colors.green : left > 3 ? colors.yellow : colors.red;

    return (
        <div className="w-full absolute top-0 left-0 z-10">
            <motion.div
                className="h-4 relative overflow-hidden"
                initial={{ width: "100%" }}
                animate={{ 
                    width: `${widthPercentage}%`,
                    backgroundColor: barColor
                }}
                transition={{ 
                    width: { duration: 0.5, ease: "linear" },
                    backgroundColor: { duration: 0.5, ease: "easeInOut" }
                }}
            >
                {/* Optional: Add a subtle shine effect */}
                <motion.div 
                    className="absolute top-0 left-0 w-full h-1 bg-white opacity-30"
                    animate={{ 
                        x: ["-100%", "100%"],
                    }}
                    transition={{ 
                        x: { 
                            repeat: Infinity, 
                            duration: 2,
                            ease: "easeInOut"
                        }
                    }}
                />
            </motion.div>
        </div>
    );
}
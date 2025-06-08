import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingProps {
  variant?: "spinner" | "dots" | "pulse" | "glitch" | "matrix";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({
  variant = "spinner",
  size = "md",
  className,
  text = "Loading..."
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg", 
    xl: "text-xl"
  };

  if (variant === "spinner") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <motion.div
          className={cn(
            "border-2 border-accent/30 border-t-accent rounded-full",
            sizeClasses[size]
          )}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        {text && (
          <motion.p 
            className={cn("text-accent font-['Orbitron']", textSizeClasses[size])}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={cn("bg-accent rounded-full", {
                "w-2 h-2": size === "sm",
                "w-3 h-3": size === "md",
                "w-4 h-4": size === "lg",
                "w-5 h-5": size === "xl"
              })}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
        {text && (
          <p className={cn("text-accent font-['Orbitron']", textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <motion.div
          className={cn(
            "bg-accent rounded-full shadow-[0_0_20px_rgba(0,255,255,0.5)]",
            sizeClasses[size]
          )}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {text && (
          <p className={cn("text-accent font-['Orbitron']", textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === "glitch") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <motion.div
          className={cn(
            "bg-accent relative overflow-hidden",
            sizeClasses[size]
          )}
          animate={{
            skewX: [0, 2, -2, 0],
            x: [0, 2, -2, 0]
          }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <motion.div
            className="absolute inset-0 bg-red-500"
            animate={{
              x: [0, 4, -4, 0],
              opacity: [0, 0.3, 0]
            }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.1 }}
          />
          <motion.div
            className="absolute inset-0 bg-blue-500"
            animate={{
              x: [0, -4, 4, 0],
              opacity: [0, 0.3, 0]
            }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
          />
        </motion.div>
        {text && (
          <motion.p 
            className={cn("text-accent font-['Orbitron'] font-bold", textSizeClasses[size])}
            animate={{
              textShadow: [
                "0 0 0px rgba(0,255,255,0)",
                "2px 0 0px rgba(255,0,0,0.5), -2px 0 0px rgba(0,255,255,0.5)",
                "0 0 0px rgba(0,255,255,0)"
              ]
            }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === "matrix") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div className={cn("grid grid-cols-3 gap-1", {
          "gap-0.5": size === "sm",
          "gap-1": size === "md" || size === "lg",
          "gap-2": size === "xl"
        })}>
          {Array.from({ length: 9 }, (_, i) => (
            <motion.div
              key={i}
              className={cn("bg-accent", {
                "w-1 h-1": size === "sm",
                "w-1.5 h-1.5": size === "md",
                "w-2 h-2": size === "lg",
                "w-3 h-3": size === "xl"
              })}
              animate={{ 
                opacity: [0, 1, 0],
                backgroundColor: ["#00ffff", "#ff0080", "#00ffff"]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1
              }}
            />
          ))}
        </div>
        {text && (
          <motion.p 
            className={cn("text-accent font-['Orbitron'] font-mono", textSizeClasses[size])}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  return null;
};

export default Loading;
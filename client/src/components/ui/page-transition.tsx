import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import Loading from "./loading";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  variant?: "slide" | "fade" | "glitch" | "matrix" | "cyber";
}

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = "",
  variant = "cyber"
}) => {
  
  const getTransitionVariants = () => {
    switch (variant) {
      case "slide":
        return {
          initial: { x: 100, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: -100, opacity: 0 },
          transition: { duration: 0.5, ease: "easeInOut" }
        };
      
      case "fade":
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.3 }
        };
      
      case "glitch":
        return {
          initial: { 
            opacity: 0,
            scale: 0.95,
            skewX: 5,
            filter: "hue-rotate(90deg)"
          },
          animate: { 
            opacity: 1,
            scale: 1,
            skewX: 0,
            filter: "hue-rotate(0deg)"
          },
          exit: { 
            opacity: 0,
            scale: 1.05,
            skewX: -5,
            filter: "hue-rotate(-90deg)"
          },
          transition: { duration: 0.4, ease: "easeOut" }
        };
      
      case "matrix":
        return {
          initial: { 
            opacity: 0,
            y: 20,
            filter: "brightness(0.5) contrast(2)"
          },
          animate: { 
            opacity: 1,
            y: 0,
            filter: "brightness(1) contrast(1)"
          },
          exit: { 
            opacity: 0,
            y: -20,
            filter: "brightness(0.5) contrast(2)"
          },
          transition: { duration: 0.6, ease: "easeInOut" }
        };
      
      case "cyber":
      default:
        return {
          initial: { 
            opacity: 0,
            scale: 0.98,
            y: 10,
            filter: "blur(2px)"
          },
          animate: { 
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)"
          },
          exit: { 
            opacity: 0,
            scale: 1.02,
            y: -10,
            filter: "blur(2px)"
          },
          transition: { duration: 0.5, ease: "easeOut" }
        };
    }
  };

  const variants = getTransitionVariants();

  return (
    <motion.div
      className={`min-h-screen ${className}`}
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={variants.transition}
    >
      {children}
    </motion.div>
  );
};

// Loading Screen Component for initial app load
export const CyberpunkLoadingScreen: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 bg-[#0F0F1A] flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
          </div>
          
          {/* Animated corner borders */}
          <div className="absolute top-10 left-10 w-20 h-20">
            <motion.div
              className="absolute top-0 left-0 w-full h-0.5 bg-accent"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.2, duration: 0.8 }}
            />
            <motion.div
              className="absolute top-0 left-0 w-0.5 h-full bg-accent"
              initial={{ height: 0 }}
              animate={{ height: "100%" }}
              transition={{ delay: 0.4, duration: 0.8 }}
            />
          </div>
          
          <div className="absolute top-10 right-10 w-20 h-20">
            <motion.div
              className="absolute top-0 right-0 w-full h-0.5 bg-accent"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
            <motion.div
              className="absolute top-0 right-0 w-0.5 h-full bg-accent"
              initial={{ height: 0 }}
              animate={{ height: "100%" }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </div>
          
          <div className="absolute bottom-10 left-10 w-20 h-20">
            <motion.div
              className="absolute bottom-0 left-0 w-full h-0.5 bg-accent"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.4, duration: 0.8 }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-0.5 h-full bg-accent"
              initial={{ height: 0 }}
              animate={{ height: "100%" }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
          </div>
          
          <div className="absolute bottom-10 right-10 w-20 h-20">
            <motion.div
              className="absolute bottom-0 right-0 w-full h-0.5 bg-accent"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
            <motion.div
              className="absolute bottom-0 right-0 w-0.5 h-full bg-accent"
              initial={{ height: 0 }}
              animate={{ height: "100%" }}
              transition={{ delay: 0.7, duration: 0.8 }}
            />
          </div>
          
          {/* Center loading content */}
          <div className="relative z-10 text-center">
            <motion.div
              className="mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full mx-auto flex items-center justify-center mb-6">
                <span className="font-['Orbitron'] font-bold text-white text-2xl">HF</span>
              </div>
            </motion.div>
            
            <Loading variant="matrix" size="lg" text="" />
            
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <h1 className="font-['Orbitron'] text-3xl font-bold text-white mb-2">
                HYBRID FUNDING
              </h1>
              <p className="text-accent text-lg">Initializing Trading Platform...</p>
            </motion.div>
          </div>
          
          {/* Scanning line effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/20 to-transparent h-2"
            animate={{ y: [0, window.innerHeight, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageTransition;
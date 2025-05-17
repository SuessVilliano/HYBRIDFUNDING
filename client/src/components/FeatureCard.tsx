import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  delay = 0,
}) => {
  return (
    <motion.div
      className="glassmorphism rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_8px_rgba(0,255,255,0.3)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
    >
      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-accent" />
      </div>
      <h3 className="font-['Orbitron'] text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-[#B8B8D0]">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;

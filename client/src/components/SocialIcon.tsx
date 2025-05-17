import { FaTwitter, FaDiscord, FaTelegram, FaYoutube, FaInstagram, FaLinkedin } from "react-icons/fa";

type SocialType = "twitter" | "discord" | "telegram" | "youtube" | "instagram" | "linkedin";

interface SocialIconProps {
  type: SocialType;
  size?: number;
}

const SocialIcon: React.FC<SocialIconProps> = ({ type, size = 24 }) => {
  const getIcon = () => {
    switch (type) {
      case "twitter":
        return <FaTwitter size={size} />;
      case "discord":
        return <FaDiscord size={size} />;
      case "telegram":
        return <FaTelegram size={size} />;
      case "youtube":
        return <FaYoutube size={size} />;
      case "instagram":
        return <FaInstagram size={size} />;
      case "linkedin":
        return <FaLinkedin size={size} />;
      default:
        return null;
    }
  };

  const getLink = () => {
    switch (type) {
      case "twitter":
        return "https://twitter.com/HybridFunding";
      case "discord":
        return "https://discord.gg/hybridfunding";
      case "telegram":
        return "https://t.me/HybridFunding";
      case "youtube":
        return "https://youtube.com/HybridFunding";
      case "instagram":
        return "https://instagram.com/HybridFunding";
      case "linkedin":
        return "https://linkedin.com/company/HybridFunding";
      default:
        return "#";
    }
  };

  return (
    <a
      href={getLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent hover:text-primary transition duration-200"
      aria-label={`Follow us on ${type}`}
    >
      {getIcon()}
    </a>
  );
};

export default SocialIcon;

import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import EarlyAccessPopup from "./EarlyAccessPopup";
import FeatureUpdateBanner from "./FeatureUpdateBanner";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar key="main-navbar" />
      <FeatureUpdateBanner compact />
      <main className="flex-grow">{children}</main>
      <Footer />
      <EarlyAccessPopup delayInSeconds={5} />
    </div>
  );
};

export default Layout;

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, ExternalLink, ShieldCheck } from "lucide-react";
import { getSupportEmail } from "@/lib/utils";
import Loading from "@/components/ui/loading";
import { useState } from "react";
import SEO from "@/components/SEO";
import { breadcrumbSchema } from "@/lib/jsonLd";

const TraderPortal = () => {
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  const handleDashboardAccess = async () => {
    setIsLoadingDashboard(true);
    await new Promise(resolve => setTimeout(resolve, 450));
    window.open("https://hybridfundingdashboard.propaccount.com/", "_blank", "noopener,noreferrer");
    setIsLoadingDashboard(false);
  };

  return (
    <section className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#061019] page-transition flex items-center py-12 md:py-16">
      <SEO title="Trader Portal — Hybrid Funding Funded Account Access" description="Access your Hybrid Funding funded account dashboard and trading workspace." path="/trader-portal" jsonLd={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Trader Portal", path: "/trader-portal" }])} />

      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(0,216,239,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(0,216,239,.08) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />
      <div className="absolute left-1/2 top-[-18%] h-[650px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[130px]" />
      <div className="absolute left-[10%] top-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent" />
      <motion.div className="absolute left-[10%] top-0 h-28 w-px bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,.9)]" animate={{ y: [0, 720, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="mx-auto max-w-5xl" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>
          <div className="mb-7 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-[11px] font-semibold tracking-[.18em] text-cyan-300 font-['Orbitron']"><ShieldCheck className="h-3.5 w-3.5" /> SECURE TRADER ACCESS</div>
            <h1 className="font-['Orbitron'] text-3xl font-bold text-white md:text-5xl">Your funded workspace.<br/><span className="text-cyan-300">One click away.</span></h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-400 md:text-base">Open the Hybrid Funding backoffice to manage your accounts, performance, challenges, payouts and trader resources.</p>
          </div>

          <div className="relative overflow-hidden border border-cyan-400/25 bg-[#091722]/95 shadow-[0_25px_90px_rgba(0,0,0,.45),0_0_55px_rgba(6,182,212,.08)]">
            <div className="absolute left-0 top-0 h-3 w-3 border-l border-t border-cyan-300"/><div className="absolute right-0 top-0 h-3 w-3 border-r border-t border-cyan-300"/><div className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-cyan-300"/><div className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-cyan-300"/>
            <div className="grid md:grid-cols-[1.05fr_.95fr]">
              <div className="p-7 md:p-10 lg:p-12">
                <p className="mb-2 font-['Orbitron'] text-[11px] font-semibold tracking-[.18em] text-cyan-300">TRADER PORTAL</p>
                <h2 className="mb-3 text-2xl font-semibold text-white md:text-3xl">Access your account dashboard</h2>
                <p className="mb-7 max-w-lg text-sm leading-6 text-slate-400">Already funded or currently in an evaluation? Continue directly to your secure backoffice.</p>
                <Button variant="neon-filled" size="xl" rounded="default" onClick={handleDashboardAccess} disabled={isLoadingDashboard} className="w-full max-w-sm font-['Orbitron'] font-semibold shadow-[0_0_26px_rgba(6,182,212,.25)]">
                  {isLoadingDashboard ? <div className="flex items-center gap-3"><Loading variant="matrix" size="sm" text=""/><span>CONNECTING...</span></div> : <span className="flex items-center gap-2">OPEN TRADER DASHBOARD <ArrowRight className="h-4 w-4"/></span>}
                </Button>
                <div className="mt-7 space-y-3 border-t border-white/10 pt-6">
                  {["Login credentials are delivered after purchase.", `Need help? ${getSupportEmail()}`].map((text) => <div key={text} className="flex items-start gap-3 text-sm text-slate-400"><Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300"/><span>{text}</span></div>)}
                </div>
              </div>

              <div className="relative min-h-[310px] border-t border-cyan-400/15 bg-[#07131d] p-7 md:min-h-full md:border-l md:border-t-0 md:p-10">
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(0,216,239,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,216,239,.07) 1px,transparent 1px)", backgroundSize: "42px 42px" }}/>
                <div className="relative flex h-full flex-col justify-between">
                  <div>
                    <div className="mb-7 flex items-center justify-between"><span className="font-['Orbitron'] text-[10px] tracking-[.18em] text-slate-500">WORKSPACE ACCESS</span><span className="flex items-center gap-2 text-xs text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.8)]"/> ONLINE</span></div>
                    <div className="space-y-3">
                      {["ACCOUNT OVERVIEW","CHALLENGES & ACCOUNTS","PERFORMANCE ANALYTICS","WITHDRAWALS & BILLING"].map((label, i) => <div key={label} className="flex items-center justify-between border border-white/10 bg-white/[.025] px-4 py-3"><span className="font-['Orbitron'] text-xs tracking-wide text-slate-300">{label}</span><span className="font-mono text-xs text-cyan-300">0{i+1}</span></div>)}
                    </div>
                  </div>
                  <div className="mt-8 flex items-center gap-2 text-xs text-slate-500"><ExternalLink className="h-3.5 w-3.5"/> Secure dashboard opens in a new tab</div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-5 text-center text-xs text-slate-600">Hybrid Funding • Funded trader infrastructure</p>
        </motion.div>
      </div>
    </section>
  );
};

export default TraderPortal;

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";

type ProofItem = {
  name: string;
  date: string;
  type: "pass" | "withdrawal";
  amount?: string;
};

const proofItems: ProofItem[] = [
  { name: "Jamaur Johnson", date: "January 2, 2026", type: "pass" },
  { name: "Joseph Kinslow", date: "January 16, 2026", type: "pass" },
  { name: "Jena H.", date: "January 16, 2026", type: "pass" },
  { name: "Marissa M.", date: "February 6, 2026", type: "pass" },
  { name: "Adam B.", date: "February 20, 2026", type: "pass" },
  { name: "Andre W.", date: "March 6, 2026", type: "pass" },
  { name: "Marty B.", date: "March 20, 2026", type: "pass" },
  { name: "Louis G.", date: "April 3, 2026", type: "pass" },
  { name: "Kaira P.", date: "April 17, 2026", type: "pass" },
  { name: "Janine H.", date: "May 1, 2026", type: "pass" },
  { name: "Douglas F.", date: "May 15, 2026", type: "pass" },
  { name: "Terréa B.", date: "June 5, 2026", type: "pass" },
  { name: "Jordan S.", date: "June 19, 2026", type: "pass" },
  { name: "Luis G.", date: "July 3, 2026", type: "pass" },
  { name: "Tiana R.", date: "July 17, 2026", type: "pass" },
  { name: "Donnell S.", date: "August 7, 2026", type: "pass" },
  { name: "Tiana L.", date: "August 21, 2026", type: "pass" },
  { name: "Rashon W.", date: "September 4, 2026", type: "pass" },
  { name: "Nasir K.", date: "September 18, 2026", type: "pass" },
  { name: "Todd D.", date: "September 18, 2026", type: "pass" },
  { name: "Jamaur Johnson", date: "January 16, 2026", type: "withdrawal", amount: "$750.00" },
  { name: "Jamaur Johnson", date: "February 6, 2026", type: "withdrawal", amount: "$750.00" },
  { name: "Jena H.", date: "February 20, 2026", type: "withdrawal", amount: "$750.00" },
];

function CertificateCard({ item, compact = false }: { item: ProofItem; compact?: boolean }) {
  const withdrawal = item.type === "withdrawal";
  return (
    <div
      className={
        "relative aspect-[1.48/1] overflow-hidden rounded-xl border bg-[#0B3A56] shadow-2xl " +
        (compact ? "border-white/10 opacity-45" : "border-accent/35 shadow-accent/10")
      }
    >
      <div className="absolute inset-x-0 top-0 h-[41%] bg-[#0B3A56]" />
      <div className="absolute inset-x-0 top-[41%] h-[42%] bg-gradient-to-r from-[#1a9c8c] via-[#14b8a6] to-[#1a9c8c]" />
      <div className="absolute inset-x-0 bottom-0 h-[17%] bg-[#0B3A56]" />
      <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(90deg,transparent_48%,rgba(255,255,255,.5)_49%,transparent_50%)] [background-size:42px_100%]" />

      <div className="absolute left-1/2 top-[7%] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent font-['Orbitron'] text-[9px] font-bold text-white">
          HF
        </span>
        <span className="font-['Orbitron'] text-[10px] font-bold text-white sm:text-xs">
          HYBRID<span className="text-accent">FUNDING</span>
        </span>
      </div>

      <div className="absolute inset-x-4 top-[18%] text-center">
        {withdrawal ? (
          <>
            <div className="font-['Orbitron'] text-sm tracking-wide text-white sm:text-xl">CERTIFICATE OF</div>
            <div className="font-['Orbitron'] text-xl font-black tracking-wide text-[#16b8ab] sm:text-3xl">WITHDRAWAL</div>
          </>
        ) : (
          <>
            <div className="font-['Orbitron'] text-xl font-black tracking-wide text-white sm:text-3xl">CONGRATULATIONS!</div>
            <div className="font-['Orbitron'] text-xs tracking-wide text-[#13c6ba] sm:text-base">YOU PASSED THE ASSESSMENT</div>
          </>
        )}
      </div>

      <div className="absolute inset-x-[12%] top-[49%] text-center">
        {withdrawal && <div className="mb-2 text-[10px] uppercase tracking-[.14em] text-white/90 sm:text-sm">Presented to:</div>}
        <div className="border-b border-white/70 pb-2 font-['Orbitron'] text-base font-bold text-white sm:text-2xl">
          {item.name}
        </div>
        {withdrawal && item.amount && (
          <div className="mx-auto mt-4 w-1/2 border-b border-white/80 pb-1 font-['Orbitron'] text-sm font-bold text-white sm:text-lg">
            {item.amount}
            <div className="mt-0.5 text-[8px] font-normal text-white/80 sm:text-[10px]">Payout</div>
          </div>
        )}
      </div>

      <div className="absolute bottom-[5%] left-[13%] text-center">
        <div className="border-b border-white/70 px-2 pb-0.5 text-[8px] font-bold text-white sm:text-xs">{item.date}</div>
        <div className="text-[7px] text-white/70 sm:text-[9px]">Date</div>
      </div>

      <div className="absolute bottom-[4.5%] right-[11%] text-right">
        <div className="font-['Orbitron'] text-sm italic text-white sm:text-xl">J. Johnson</div>
        <div className="border-t border-white/70 pt-0.5 text-[7px] text-white/80 sm:text-[9px]">Hybrid Funding CEO</div>
      </div>
    </div>
  );
}

export default function TraderProofCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % proofItems.length), 3600);
    return () => window.clearInterval(id);
  }, [paused]);

  const previous = useMemo(
    () => proofItems[(index - 1 + proofItems.length) % proofItems.length],
    [index],
  );
  const current = proofItems[index];
  const next = useMemo(() => proofItems[(index + 1) % proofItems.length], [index]);

  return (
    <section id="trader-proof" className="border-y border-white/5 bg-[#0B1426] py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <span className="mb-3 inline-flex items-center gap-2 font-['Orbitron'] text-xs uppercase tracking-widest text-accent">
            <ShieldCheck className="h-4 w-4" /> Trader Milestones
          </span>
          <h2 className="font-['Orbitron'] text-3xl font-bold text-white sm:text-4xl">
            Passes & <span className="text-accent neon-text-accent">Payout History</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#B8B8D0] sm:text-base">
            Historical replacement certificates recreated from legacy pass-order records after our platform migration.
            Names reflect real trader records; reconstructed dates follow the preserved sequence where the original timestamp was unavailable.
          </p>
        </div>

        <div
          className="relative mx-auto max-w-5xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          <div className="hidden items-center gap-4 md:grid md:grid-cols-[0.72fr_1.25fr_0.72fr]">
            <motion.div key={"prev-" + index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="scale-90">
              <CertificateCard item={previous} compact />
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.96 }}
                transition={{ duration: 0.35 }}
              >
                <CertificateCard item={current} />
              </motion.div>
            </AnimatePresence>

            <motion.div key={"next-" + index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="scale-90">
              <CertificateCard item={next} compact />
            </motion.div>
          </div>

          <div className="md:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CertificateCard item={current} />
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            type="button"
            aria-label="Previous certificate"
            onClick={() => setIndex((i) => (i - 1 + proofItems.length) % proofItems.length)}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-[#0F0F1A]/85 p-2 text-white shadow-lg backdrop-blur hover:border-accent hover:text-accent md:left-[24%]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next certificate"
            onClick={() => setIndex((i) => (i + 1) % proofItems.length)}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-[#0F0F1A]/85 p-2 text-white shadow-lg backdrop-blur hover:border-accent hover:text-accent md:right-[24%]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="mt-6 flex items-center justify-center gap-3 text-xs text-[#8888A8]">
            <span className="font-['Orbitron'] text-accent">{index + 1} / {proofItems.length}</span>
            <span>•</span>
            <span>{paused ? "Paused" : "Auto-advancing"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

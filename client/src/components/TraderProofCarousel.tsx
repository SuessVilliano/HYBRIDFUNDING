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
        "relative aspect-[4/3] overflow-hidden rounded-xl border bg-[#083a56] shadow-2xl " +
        (compact ? "border-white/10 opacity-45" : "border-accent/35 shadow-accent/10")
      }
    >
      {/* Background bands */}
      <div className="absolute inset-x-0 top-0 h-[37%] bg-gradient-to-b from-[#06354f] to-[#083e5d]" />
      <div className="absolute inset-x-0 top-[37%] h-[35%] bg-gradient-to-r from-[#13a693] via-[#12baa7] to-[#149d8e]" />
      <div className="absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-b from-[#083a56] to-[#06334d]" />

      {/* Subtle trading-chart texture */}
      <div className="absolute inset-x-0 top-[37%] h-[35%] opacity-20">
        <div className="absolute left-[7%] top-[55%] h-[25%] w-[2%] bg-white/35" />
        <div className="absolute left-[14%] top-[40%] h-[38%] w-[2%] bg-white/35" />
        <div className="absolute left-[21%] top-[26%] h-[48%] w-[2%] bg-white/35" />
        <div className="absolute left-[30%] top-[14%] h-[52%] w-[2%] bg-white/35" />
        <div className="absolute left-[39%] top-[31%] h-[39%] w-[2%] bg-white/35" />
        <div className="absolute left-[48%] top-[18%] h-[48%] w-[2%] bg-white/35" />
        <div className="absolute left-[58%] top-[35%] h-[35%] w-[2%] bg-white/35" />
        <div className="absolute left-[68%] top-[10%] h-[52%] w-[2%] bg-white/35" />
        <div className="absolute left-[78%] top-[24%] h-[42%] w-[2%] bg-white/35" />
        <div className="absolute left-[88%] top-[14%] h-[48%] w-[2%] bg-white/35" />
      </div>

      {/* Border */}
      <div className="absolute inset-[1.5%] rounded-sm border border-white/55" />

      {/* Brand */}
      <div className="absolute left-1/2 top-[5.5%] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap sm:gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary via-blue-500 to-accent font-['Orbitron'] text-[9px] font-bold text-white sm:h-9 sm:w-9 sm:text-xs">
          HF
        </span>
        <span className="font-['Orbitron'] text-[10px] font-bold tracking-wide text-white sm:text-base">
          HYBRID<span className="text-accent">FUNDING</span>
        </span>
      </div>

      {/* Title */}
      <div className="absolute inset-x-[5%] top-[14%] text-center">
        {withdrawal ? (
          <>
            <div className="font-['Orbitron'] text-base font-medium tracking-wide text-white sm:text-2xl">
              CERTIFICATE OF
            </div>
            <div className="font-['Orbitron'] text-2xl font-black tracking-wide text-[#16b8ab] sm:text-4xl">
              WITHDRAWAL
            </div>
          </>
        ) : (
          <>
            <div className="font-['Orbitron'] text-2xl font-black tracking-wide text-white sm:text-5xl">
              CONGRATULATIONS!
            </div>
            <div className="mt-1 font-['Orbitron'] text-xs tracking-wide text-[#13c6ba] sm:text-xl">
              YOU PASSED THE ASSESSMENT
            </div>
          </>
        )}
      </div>

      {/* Seal */}
      {!withdrawal && (
        <div className="absolute left-1/2 top-[31%] z-10 -translate-x-1/2">
          <div className="relative h-12 w-12 rounded-full border-[5px] border-[#d9d9d9] bg-gradient-to-br from-white via-[#bfc3c7] to-[#8e9398] shadow-lg sm:h-20 sm:w-20 sm:border-[8px]">
            <div className="absolute -bottom-[18%] left-1/2 h-[24%] w-[90%] -translate-x-1/2 bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700" />
          </div>
        </div>
      )}

      {/* Name / payout area */}
      <div className={`absolute inset-x-[12%] text-center ${withdrawal ? "top-[40%]" : "top-[49%]"}`}>
        {withdrawal && (
          <div className="mb-2 text-[9px] uppercase tracking-[.12em] text-white/95 sm:text-base">
            Presented to:
          </div>
        )}

        <div className="font-['Orbitron'] text-xl font-bold text-white sm:text-4xl">
          {item.name}
        </div>
        <div className="mx-auto mt-2 h-px w-[88%] bg-white/80" />

        {withdrawal && item.amount && (
          <div className="mx-auto mt-4 w-[46%] sm:mt-5">
            <div className="font-['Orbitron'] text-base font-bold text-white sm:text-2xl">
              {item.amount}
            </div>
            <div className="mt-1 h-px w-full bg-white/85" />
            <div className="mt-1 text-[8px] text-white/80 sm:text-xs">Payout</div>
          </div>
        )}

        {!withdrawal && (
          <p className="mx-auto mt-2 max-w-[92%] text-[6px] leading-[1.25] text-white/95 sm:mt-3 sm:text-[11px] sm:leading-[1.3]">
            You have successfully passed the Hybrid Funding Assessment. During these assessment periods the trader has
            demonstrated the necessary skills to comply with the rules and objectives of the assessment. Their good risk
            management and knowledge have allowed them to take this very important step that brings the trader ever closer
            to achieving their financial goals.
          </p>
        )}
      </div>

      {/* Bottom date: text always ABOVE the line */}
      <div className="absolute bottom-[8.5%] left-[12%] w-[34%] text-center">
        <div className="font-['Orbitron'] text-[8px] font-bold text-white sm:text-base">
          {item.date}
        </div>
        <div className="mt-1.5 h-px w-full bg-white/80" />
        <div className="mt-1 text-[7px] text-white/75 sm:text-xs">Date</div>
      </div>

      {/* CEO signature */}
      <div className="absolute bottom-[8.5%] right-[11%] w-[35%] text-center">
        <div className="font-['Orbitron'] text-base italic leading-none text-black sm:text-3xl">J. Johnson</div>
        <div className="mt-1.5 h-px w-full bg-white/80" />
        <div className="mt-1 text-[7px] text-white/80 sm:text-xs">Hybrid Funding CEO</div>
      </div>

      {/* Disclosure */}
      <div className="absolute inset-x-[8%] bottom-[1.8%] text-center text-[4.5px] text-white/55 sm:text-[8px]">
        Historical replacement certificate — date reconstructed from legacy pass-order records.
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

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
        <svg
          viewBox="20 8 145 84"
          aria-label="Jamaur Johnson signature"
          className="mx-auto h-8 w-auto overflow-visible sm:h-14"
          role="img"
        >
          <path d="M 72 51 L 72 54 L 74 54 L 74 51 Z M 48 16 L 47 17 L 47 23 L 46 24 L 46 27 L 45 28 L 45 30 L 44 31 L 44 32 L 43 33 L 43 35 L 42 36 L 42 37 L 40 39 L 40 40 L 39 41 L 39 42 L 37 44 L 37 45 L 35 47 L 35 48 L 30 53 L 29 53 L 28 54 L 26 54 L 26 55 L 25 56 L 29 56 L 30 55 L 32 55 L 36 51 L 36 50 L 37 49 L 37 48 L 40 45 L 40 44 L 41 43 L 41 42 L 42 41 L 42 40 L 44 38 L 44 36 L 45 35 L 45 34 L 46 33 L 47 34 L 47 35 L 48 36 L 47 37 L 48 38 L 48 43 L 49 44 L 49 53 L 50 54 L 50 55 L 49 56 L 48 56 L 47 57 L 46 57 L 45 58 L 44 58 L 43 59 L 42 59 L 41 60 L 40 60 L 39 61 L 38 61 L 36 63 L 35 63 L 33 65 L 33 66 L 31 68 L 31 69 L 30 70 L 30 71 L 29 72 L 29 78 L 30 79 L 30 81 L 33 84 L 34 84 L 35 85 L 37 85 L 38 86 L 45 86 L 46 85 L 47 85 L 48 84 L 49 84 L 53 80 L 53 66 L 52 65 L 52 58 L 54 56 L 55 56 L 56 55 L 55 54 L 54 54 L 53 55 L 52 55 L 51 54 L 51 46 L 50 45 L 50 37 L 49 36 L 49 17 Z M 133 13 L 130 16 L 130 17 L 128 19 L 128 20 L 127 21 L 127 22 L 121 28 L 121 29 L 114 36 L 114 37 L 111 40 L 110 40 L 109 41 L 107 41 L 106 42 L 104 42 L 103 43 L 102 43 L 101 44 L 100 43 L 100 37 L 99 36 L 99 31 L 98 30 L 98 26 L 97 25 L 97 21 L 96 20 L 96 18 L 95 17 L 95 16 L 92 16 L 92 20 L 91 21 L 91 27 L 90 28 L 90 31 L 89 32 L 89 35 L 88 36 L 88 38 L 87 39 L 87 41 L 86 42 L 86 44 L 85 45 L 85 46 L 84 47 L 84 49 L 83 50 L 83 52 L 80 55 L 80 56 L 82 56 L 85 53 L 85 52 L 86 51 L 86 49 L 87 48 L 87 45 L 88 44 L 88 43 L 89 42 L 89 40 L 90 39 L 90 36 L 91 35 L 91 32 L 92 31 L 92 28 L 93 27 L 93 24 L 94 23 L 95 24 L 95 26 L 96 27 L 96 31 L 97 32 L 97 36 L 98 37 L 98 46 L 90 54 L 90 55 L 88 57 L 88 58 L 87 59 L 87 60 L 86 61 L 86 62 L 85 63 L 85 64 L 84 65 L 84 82 L 85 83 L 85 87 L 86 88 L 86 89 L 89 89 L 88 88 L 88 86 L 87 85 L 87 81 L 86 80 L 86 66 L 87 65 L 87 64 L 88 63 L 88 62 L 89 61 L 89 60 L 91 58 L 91 57 L 93 55 L 93 54 L 98 49 L 99 50 L 99 54 L 96 57 L 96 58 L 95 59 L 95 60 L 94 61 L 94 67 L 96 69 L 97 69 L 99 71 L 99 87 L 97 89 L 100 89 L 101 88 L 101 87 L 102 86 L 102 71 L 104 69 L 106 69" fill="#000000" />
        </svg>
        <div className="mt-1.5 h-px w-full bg-white/80" />
        <div className="mt-1 text-[7px] text-white/80 sm:text-xs">Hybrid Funding CEO</div>
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

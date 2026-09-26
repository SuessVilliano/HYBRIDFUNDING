import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Crown, Gauge, Medal, Swords, Trophy, Users, Zap } from "lucide-react";
import SEO from "@/components/SEO";
import { breadcrumbSchema } from "@/lib/jsonLd";

const Battles: React.FC = () => {
  return (
    <div className="page-transition bg-[#0B1426]">
      <SEO
        title="TradeHouse Battles — Competitive Trading Arena"
        description="Trade head-to-head, climb live leaderboards, and compete for TradeHouse Battles rewards and funded-account prizes."
        path="/battles"
        jsonLd={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "TradeHouse Battles", path: "/battles" },
        ])}
      />

      <section id="battles-top" className="scroll-mt-28 relative overflow-hidden border-b border-white/5">
        <div className="relative min-h-[68vh] lg:min-h-[78vh]">
          <img
            src="/assets/tradehouse-battles-arena.webp"
            alt="TradeHouse Battles head-to-head trader competition arena"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050814]/10 via-[#050814]/15 to-[#050814]/95" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050814]/20 via-transparent to-[#050814]/20" />

          <div className="container relative z-10 mx-auto flex min-h-[68vh] items-end px-4 pb-10 pt-24 sm:px-6 lg:min-h-[78vh] lg:px-8 lg:pb-14">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-4xl text-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/35 bg-[#07101f]/80 px-3 py-1 font-['Orbitron'] text-[10px] font-bold uppercase tracking-[0.2em] text-accent backdrop-blur-md">
                <Swords className="h-3.5 w-3.5" />
                Trader vs Trader · Live Leaderboard
              </span>
              <h1 className="mt-4 font-['Orbitron'] text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                TradeHouse <span className="text-primary neon-text-primary">Battles</span>
              </h1>
              <p className="mx-auto mt-3 max-w-3xl text-base leading-relaxed text-white/80 sm:text-lg">
                Two traders. One board. Every decision moves the matchup. Compete, climb the leaderboard, and turn performance into prizes and funded-account opportunities.
              </p>

              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/battles/lobby">
                  <Button variant="neon-filled" size="xl" rounded="full" className="font-['Orbitron'] shadow-glow-primary">
                    <Trophy className="mr-2 h-5 w-5" />
                    ENTER THE ARENA
                  </Button>
                </Link>
                <a href="#how-battles-work">
                  <Button variant="neon" size="xl" rounded="full" className="w-full font-['Orbitron'] sm:w-auto">
                    HOW BATTLES WORK
                  </Button>
                </a>
                <Link href="/challenges">
                  <Button variant="ghost" size="xl" rounded="full" className="font-['Orbitron'] text-accent hover:text-white">
                    GET FUNDED FIRST
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="how-battles-work" className="scroll-mt-28 border-b border-white/5 py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <span className="font-['Orbitron'] text-xs uppercase tracking-[0.22em] text-accent">The Match Format</span>
              <h2 className="mt-3 font-['Orbitron'] text-3xl font-bold text-white sm:text-4xl">
                This Should Feel Like a <span className="text-accent neon-text-accent">Competition.</span>
              </h2>
              <p className="mt-4 text-[#B8B8D0]">
                Battles put trader performance side by side so the leaderboard tells the story in real time.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  icon: Swords,
                  number: "01",
                  title: "Enter a Match",
                  description: "Choose the available battle format and enter the arena with the same starting conditions as your opponent.",
                },
                {
                  icon: Gauge,
                  number: "02",
                  title: "Move the Board",
                  description: "Performance, discipline, and risk management shape the matchup as the leaderboard updates.",
                },
                {
                  icon: Medal,
                  number: "03",
                  title: "Finish on Top",
                  description: "Climb the board and compete for the prizes and funded-account rewards attached to that battle.",
                },
              ].map(({ icon: Icon, number, title, description }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="rounded-2xl border border-white/10 bg-[#121a2d] p-6"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-accent/20">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <span className="font-['Orbitron'] text-sm text-primary">{number}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#B8B8D0]">{description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="battle-rewards" className="scroll-mt-28 bg-gradient-to-br from-[#121629] to-[#0B1426] py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <span className="font-['Orbitron'] text-xs uppercase tracking-[0.22em] text-primary">What You Are Playing For</span>
                <h2 className="mt-3 font-['Orbitron'] text-3xl font-bold text-white sm:text-4xl">
                  Leaderboards Need <span className="text-primary neon-text-primary">Stakes.</span>
                </h2>
                <p className="mt-4 text-[#B8B8D0]">
                  TradeHouse Battles is built around visible competition: rankings, matchup pressure, and rewards that give traders a reason to come back for the next event.
                </p>

                <div className="mt-7 space-y-4">
                  {[
                    ["Funded-account prizes", "Top-performing battles can award funded-account opportunities."],
                    ["Live leaderboard status", "See who is ahead and how the matchup changes as traders perform."],
                    ["Community spotlight", "Strong performances can become part of the TradeHouse story and competitive record."],
                  ].map(([title, description]) => (
                    <div key={title} className="flex gap-3 rounded-xl border border-white/10 bg-black/15 p-4">
                      <Crown className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                      <div>
                        <div className="font-semibold text-white">{title}</div>
                        <div className="mt-1 text-sm text-[#B8B8D0]">{description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-accent/25 bg-[#0B1426] shadow-2xl">
                <img
                  src="/assets/tradehouse-battles-arena.webp"
                  alt="TradeHouse Battles arena preview with two competing traders and live performance boards"
                  className="aspect-video w-full object-cover"
                />
                <div className="grid grid-cols-3 border-t border-white/10">
                  <div className="p-4 text-center">
                    <Users className="mx-auto h-5 w-5 text-accent" />
                    <div className="mt-2 font-['Orbitron'] text-xs text-white">HEAD-TO-HEAD</div>
                  </div>
                  <div className="border-x border-white/10 p-4 text-center">
                    <Zap className="mx-auto h-5 w-5 text-primary" />
                    <div className="mt-2 font-['Orbitron'] text-xs text-white">LIVE BOARD</div>
                  </div>
                  <div className="p-4 text-center">
                    <Trophy className="mx-auto h-5 w-5 text-accent" />
                    <div className="mt-2 font-['Orbitron'] text-xs text-white">PRIZES</div>
                  </div>
                </div>
              </div>
            </div>

            <div id="battles-arena" className="scroll-mt-28 mt-12 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-[#171728] to-accent/10 p-7 text-center sm:p-10">
              <Trophy className="mx-auto h-9 w-9 text-accent" />
              <h2 className="mt-4 font-['Orbitron'] text-2xl font-bold text-white sm:text-3xl">Ready for the Next Match?</h2>
              <p className="mx-auto mt-3 max-w-2xl text-[#B8B8D0]">
                Launch the dedicated TradeHouse arena and enter the competitive experience.
              </p>
              <Link href="/battles/lobby">
                <Button variant="neon-filled" size="xl" rounded="full" className="mt-6 font-['Orbitron'] shadow-glow-primary">
                  <Swords className="mr-2 h-5 w-5" />
                  LAUNCH BATTLES ARENA
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Battles;

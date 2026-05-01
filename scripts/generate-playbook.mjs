// Generates the Hybrid Funding Trader Playbook PDF.
// Run: node scripts/generate-playbook.mjs
// Output: client/public/trader-playbook.pdf
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const OUT = path.resolve("client/public/trader-playbook.pdf");

const doc = new PDFDocument({
  size: "LETTER",
  margins: { top: 64, bottom: 64, left: 64, right: 64 },
  info: {
    Title: "Hybrid Funding Trader Playbook",
    Author: "Hybrid Funding",
    Subject: "Prop trading strategy, rules, and position sizing",
    Keywords: "prop firm, forex, crypto, futures, equities, hybrid funding",
  },
});

doc.pipe(fs.createWriteStream(OUT));

const ACCENT = "#00FFFF";
const PRIMARY = "#A855F7";
const TEXT = "#1A1A2E";
const SUBTLE = "#4A4A6A";

function h1(t) {
  doc.moveDown(0.5).fillColor(TEXT).font("Helvetica-Bold").fontSize(26).text(t).moveDown(0.3);
  const x = doc.x, y = doc.y;
  doc.rect(x, y, 60, 4).fill(ACCENT);
  doc.fillColor(TEXT).moveDown(1);
}
function h2(t) {
  doc.moveDown(0.7).fillColor(TEXT).font("Helvetica-Bold").fontSize(18).text(t).moveDown(0.3);
}
function h3(t) {
  doc.moveDown(0.5).fillColor(TEXT).font("Helvetica-Bold").fontSize(13).text(t).moveDown(0.2);
}
function p(t) {
  doc.fillColor(TEXT).font("Helvetica").fontSize(11).text(t, { align: "left", lineGap: 3 }).moveDown(0.3);
}
function bullet(t) {
  doc.fillColor(TEXT).font("Helvetica").fontSize(11).text(`•  ${t}`, { indent: 12, lineGap: 3 }).moveDown(0.15);
}
function callout(t) {
  doc.moveDown(0.3);
  const startY = doc.y;
  doc.rect(64, startY, 484, 0.5).fill(ACCENT);
  doc.moveDown(0.2);
  doc.fillColor(SUBTLE).font("Helvetica-Oblique").fontSize(10).text(t, { lineGap: 2 }).moveDown(0.3);
  doc.fillColor(TEXT);
}
function pageBreak() { doc.addPage(); }

// ============== COVER ==============
doc.rect(0, 0, doc.page.width, doc.page.height).fill("#0F0F1A");
doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(12).text("HYBRID FUNDING", 64, 96, { characterSpacing: 4 });
doc.moveDown(0.3);
doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(48).text("The Trader", 64, 160);
doc.fillColor(ACCENT).text("Playbook", 64);
doc.fillColor("#B8B8D0").font("Helvetica").fontSize(14).text(
  "A rule-by-rule guide to passing Hybrid Funding evaluations across\nForex, Crypto, Futures, and Single Session Equities.",
  64, 320, { lineGap: 4 }
);
doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(11).text("HYBRIDFUNDING.CO", 64, 700, { characterSpacing: 3 });
doc.fillColor("#6F6F8A").font("Helvetica").fontSize(9).text("Empowering Traders. Funding Potential.", 64, 716);
pageBreak();

// ============== INTRO ==============
h1("Welcome");
p("This playbook is the field manual we wish every trader had before they paid their first evaluation fee. It is not a sales document. It is a practical, rule-by-rule guide to passing Hybrid Funding challenges across all four asset classes — Forex, Crypto, Futures, and Single Session Equities.");
p("The traders who consistently pass our evaluations don't have secret indicators. They understand the geometry of the rules — especially the trailing max drawdown — and they size positions like adults. That's the whole game.");
callout("Use this as a reference. Skip to the asset class you trade. Come back for the position-sizing math when your account size changes.");

h2("Table of contents");
bullet("1. The five rules every trader should memorize");
bullet("2. Position sizing — the math that decides everything");
bullet("3. Trailing max drawdown — where most traders blow up");
bullet("4. Forex playbook (1-Step, 2-Step, 3-Step, Instant, Lite)");
bullet("5. Crypto playbook");
bullet("6. Futures 4-Phase playbook");
bullet("7. Single Session Equities playbook");
bullet("8. Add-on decision tree");
bullet("9. Payouts, KYC, and the path from Funded to Live");
bullet("10. Common breach scenarios and how to avoid them");
pageBreak();

// ============== 1. RULES ==============
h1("1. The five rules");
p("Memorize these before you trade a single tick. Every other rule is a variation of one of these five.");
h3("Rule 1 — Profit target");
p("The percentage gain you need to clear the phase. 10% on Forex 1-Step. 6% Phase 1, 4.5% Phase 2 on Forex 2-Step. 9% per phase on Futures 4-Phase. 10% on Single Session Equities.");
h3("Rule 2 — Maximum drawdown");
p("The single most important rule. Either trailing (moves up with closed balance) or static (fixed). Once trailing, it locks at your starting balance after you reach the threshold. Hard breach = account terminated.");
h3("Rule 3 — Daily loss limit");
p("On programs that have it (2-Step, Instant Funding), the daily loss limit resets at 5pm EST. Calculated on prior day's end-of-day balance.");
h3("Rule 4 — Trading window");
p("Most asset classes have specific windows. Forex closes Friday 3:45pm EST. Single Session Equities is 9:30–15:55 ET only. Futures closes 15:10 CST weekdays. Crypto trades 24/7.");
h3("Rule 5 — Consistency");
p("Funded Futures: best day cannot exceed 25% of total profit. Single Session Equities: 25% consistency on Funded phase only. Designed to filter out lucky entries.");
pageBreak();

// ============== 2. POSITION SIZING ==============
h1("2. Position sizing");
p("Most failed evaluations aren't from bad trades. They're from oversized positions. Position sizing is the only knob that keeps a string of losses from becoming a hard breach.");

h2("The 0.25–0.5% rule");
p("Risk 0.25% to 0.5% of starting balance per trade. On a $25,000 account, that's $62.50 to $125 of risk per trade. With a 30-pip stop on a major Forex pair (where 1 pip on a standard lot ≈ $10), 0.5% risk = $125 / $10 / 30 = 0.42 lots.");

h2("Why this is slow");
p("If you risk 0.5% per trade with a 1.5R win rate of 50%, you make 0.25% per trade on average. To hit a 10% target you need ~40 trades. If you trade 4 setups per day, that's two trading weeks. That's the right speed.");

h2("The math at every account size");
const sizingTable = [
  ["Starting balance", "0.25% risk ($)", "0.5% risk ($)", "10% target ($)"],
  ["$5,000",  "$12.50",  "$25",    "$500"],
  ["$10,000", "$25",     "$50",    "$1,000"],
  ["$25,000", "$62.50",  "$125",   "$2,500"],
  ["$50,000", "$125",    "$250",   "$5,000"],
  ["$100,000","$250",    "$500",   "$10,000"],
  ["$200,000","$500",    "$1,000", "$20,000"],
];
const colW = [120, 110, 110, 110];
const startX = 64;
let rowY = doc.y + 6;
sizingTable.forEach((row, ri) => {
  let x = startX;
  row.forEach((cell, ci) => {
    doc.fillColor(ri === 0 ? ACCENT : TEXT)
      .font(ri === 0 ? "Helvetica-Bold" : "Helvetica")
      .fontSize(10)
      .text(cell, x + 4, rowY + 4, { width: colW[ci], align: "left" });
    x += colW[ci];
  });
  if (ri === 0) {
    doc.rect(startX, rowY + 18, colW.reduce((a, b) => a + b, 0), 0.5).fill(SUBTLE);
  }
  rowY += 22;
});
doc.y = rowY + 6;
doc.fillColor(TEXT);
pageBreak();

// ============== 3. TRAILING DRAWDOWN ==============
h1("3. Trailing max drawdown");
p("The trailing max drawdown is calculated on closed balance, not equity. Two consequences most traders miss:");
bullet("Open floating profit doesn't trail the DD up. Only when you close the trade does the high-water mark move.");
bullet("Once your closed balance reaches the lock threshold (e.g. +6% on Forex 1-Step), the trailing locks at your starting balance forever. From there, you have a hard floor.");

h2("Worked example: $100,000 Forex 1-Step (6% trailing)");
p("Starting balance $100,000. Initial DD floor $94,000.");
bullet("Day 1: close $2,000 winner. Closed balance $102,000. New high. DD floor moves to $96,000.");
bullet("Day 2: close $1,500 loser. Closed balance $100,500. DD floor stays at $96,000 (trailing only goes up).");
bullet("Day 3: close $5,500 winner. Closed balance $106,000 (+6%). DD floor LOCKS at $100,000 permanently.");
bullet("From here on, you can drawdown to $100,000 and keep trading. Anything below = hard breach.");

callout("The play: get to your lock threshold as fast as your size allows, then ladder up to the profit target with a hard floor protecting you.");
pageBreak();

// ============== 4. FOREX ==============
h1("4. Forex playbook");
h2("1-Step (Forex)");
bullet("Profit target: 10%");
bullet("Max drawdown: 6% trailing on closed balance");
bullet("Daily loss limit: none");
bullet("Leverage: 1:20");
bullet("Weekend hold: not allowed unless add-on purchased");

h2("2-Step (Forex)");
bullet("Phase 1 target: 10%, Phase 2 target: 5%");
bullet("Max drawdown: 8% static");
bullet("Daily loss limit: 4%");
bullet("Leverage: 1:30");

h2("3-Step (Forex)");
bullet("5% per phase across three phases");
bullet("Max drawdown: 5% trailing");
bullet("Lowest target per phase, slowest path to funded");

h2("Instant Funding (Forex)");
bullet("No target — start trading firm capital immediately");
bullet("Max drawdown: 8% trailing, 5% daily");
bullet("Profit split: 80% (90% with add-on)");
bullet("KYC required before withdrawal");

h2("Instant Funding Lite (Forex)");
bullet("Daily DD: 3%, Max trailing DD: 5%");
bullet("25% consistency requirement");
bullet("80% split (90% add-on available)");
bullet("3% non-withdrawable profit buffer; first payout on demand, 14-day subsequent");
bullet("Up to 50:1 leverage");
pageBreak();

// ============== 5. CRYPTO ==============
h1("5. Crypto playbook");
h2("1-Step");
bullet("Profit target: 9%");
bullet("Max drawdown: 6%");
bullet("Daily cap limit: 3% (both directions)");
h2("2-Step");
bullet("Phase 1: 6%, Phase 2: 9%");
bullet("Max drawdown: 9% static both phases");
bullet("Daily cap limit: 3%");
h2("Leverage and rules");
bullet("BTC and ETH: 5:1");
bullet("All other cryptocurrencies: 2:1");
bullet("Weekend trading allowed (24/7 markets)");
bullet("Profit split: 90% on Crypto programs");

callout("Daily cap is bidirectional. If you make 3% in a day, your account locks until next session. This caps your upside on a single day — plan accordingly.");
pageBreak();

// ============== 6. FUTURES ==============
h1("6. Futures 4-Phase playbook");
p("Funded Futures runs on Rithmic Pro today. Tradovate platform integration is coming soon — same rules, additional platform option.");
h2("Phase rules");
bullet("4 phases. Each phase: 9% profit target, 5% max trailing loss.");
bullet("25% consistency: best day cannot exceed 25% of total profit. Need 4+ trading days per phase.");
bullet("Trailing loss uses End of Day balance. EOD = 1600 CST.");
bullet("All positions closed and orders cancelled at 1510 CST. No overnight or weekend holds.");

h2("Contract limits");
bullet("$25K — 1 standard / 15 micro");
bullet("$50K — 3 standard / 30 micro");
bullet("$100K — 6 standard / 60 micro");
bullet("$150K — 9 standard / 90 micro");

h2("Phase payouts (scale with account size)");
bullet("Phase 1: $500 (on $25K)");
bullet("Phase 2: $750");
bullet("Phase 3: $750");
bullet("Phase 4: $1,500");
bullet("Then transition to Live Funded with 90% split");

h2("Don't forget");
bullet("CME market data attestation must be done in R | Trader Pro desktop. Mobile/web won't work for this step.");
bullet("Attest as a non-professional user.");
pageBreak();

// ============== 7. EQUITIES ==============
h1("7. Single Session Equities");
p("Day-trade S&P 100 equity products on GooeyPro. All positions open and close within the same trading session — flat by 15:55 ET, every day.");
h2("Rules");
bullet("Profit target: 10% (Evaluation only)");
bullet("Max drawdown: 3% trailing on closed balance, locks at starting balance after +3%");
bullet("Daily drawdown: 2.5% trailing intraday");
bullet("Daily profit cap: 2.5% (Evaluation only — soft breach)");
bullet("Min profitable trading days: 3 days at 0.50%, both Eval and Funded");
bullet("Profit split: 80%/20%");
bullet("Payout cadence: 14 days initial, 14 days subsequent");
bullet("Min withdrawal: $100");
bullet("Consistency Score: 25% (Funded phase only)");
bullet("Lock upon payout: yes (waiver available as 25% add-on)");
bullet("Payout on breach: no (available as 25% add-on)");
h2("Trading window");
bullet("09:30 ET to 15:55 ET — only window allowed");
bullet("Pre-market and extended hours: not allowed");
bullet("Position open past 15:55 ET = Prohibited Practices violation = hard breach");
bullet("Commissions: $0.02/share/side, min $0.50 per transaction");
bullet("Liquidity sourced directly from Nasdaq");
pageBreak();

// ============== 8. ADD-ONS ==============
h1("8. Add-on decision tree");
p("Five add-ons priced as a percentage of plan price. Pick based on your style, not because you're hedging your own discipline.");
h2("90% Profit Share Upgrade — 15%");
p("Worth it if you intend to scale account size. Each $1,000 of monthly profit on a $100K account is +$100 in your pocket vs the 80% baseline. Pays back inside the first month for serious traders.");
h2("Weekend Hold (Forex only) — 10%");
p("Worth it for swing traders who carry positions Sunday→Friday. Skip if you scalp and close out daily.");
h2("Payout-on-Breach — 25%");
p("On the rules-tight programs (Single Session Equities, Instant Funding), this is a real safety net. Pays your accrued profit even if you breach.");
h2("Lock-Upon-Payout Waiver — 25%");
p("Default behavior locks your account after a payout. Waiver lets you keep trading. Worth it if you take small frequent payouts; skip if you batch.");
h2("Consistency Threshold (33% / 50%)");
p("33% loosens the consistency requirement (cheaper to clear). 50% tightens it (harder, but proves discipline if you want to flex). Most traders skip both.");
pageBreak();

// ============== 9. PAYOUTS / KYC ==============
h1("9. Payouts, KYC, and the path from Funded to Live");
p("Standard cadence: first payout on demand, then every 14–30 days depending on program. Min withdrawal: greater of $100 or 1% of starting balance.");
h2("KYC");
bullet("Evaluation programs: KYC required before receiving the funded account.");
bullet("Instant Funding: KYC required before any withdrawal.");
bullet("Single Session Equities: standard KYC.");
h2("Payout mechanics");
bullet("First withdrawal request can be any time after funding.");
bullet("Default lock-on-payout means your account is paused at withdrawal until next cycle (waiver available).");
bullet("Max drawdown floor LOCKS at your starting balance after each payout — your floor never goes below your starting balance after this point.");
pageBreak();

// ============== 10. BREACH SCENARIOS ==============
h1("10. How traders breach (and how not to)");
h2("The Friday close trap (Forex)");
p("All Forex positions auto-close at 3:45pm EST Friday unless you have the Weekend Hold add-on. Many traders are mid-swing and the auto-close locks them in unfavorably. Either close before 3:30 or buy the add-on if you swing.");
h2("The 'I'll just hold it longer' trap");
p("Trailing DD moves with closed balance. Holding a winner doesn't trail the DD up. The opposite of what most traders intuit. Close winners to lock in trailing protection.");
h2("The consistency breach (Futures, Funded Equities)");
p("You hit your profit target but your best day was 30% of total profit (above the 25% threshold). You don't fail — but you can't pass the phase. Solution: spread profits across more days, not bigger days.");
h2("The intraday equity breach (Single Session Equities)");
p("Daily Drawdown is 2.5% intraday TRAILING. If you make $500 then give $700 back from peak equity that day, you breach — even if your closed balance is up. Trade smaller and use real stops.");
h2("The inactivity breach");
p("Most programs require at least one trade every 30 days. Vacations and breaks have killed funded accounts. Set a calendar reminder.");
pageBreak();

// ============== CLOSING ==============
h1("Final word");
p("Hybrid Funding is built for traders who want multiple asset classes, modern platforms, and transparent rules. We publish full FAQ pages with worked drawdown examples on hybridfunding.co/faq because we want you to pass — repeat traders are how we grow.");
p("If this playbook saves you one breach, it paid for itself ten times over. Treat the trailing DD like an opponent. Size like an adult. Get to your lock threshold first, then ladder up to the target.");
callout("Use code from your welcome SMS for 20% off your first challenge. Pick your tier at hybridfunding.co/challenges.");
doc.moveDown(2);
doc.fillColor(SUBTLE).font("Helvetica-Oblique").fontSize(9).text(
  "© Hybrid Funding LLC. This playbook is for educational purposes only and does not constitute investment advice. Trading involves risk of loss.",
  { align: "center" }
);

doc.end();
console.log("Wrote", OUT);

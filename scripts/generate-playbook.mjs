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

// ============== THEME ==============
const BG_DARK = "#0F0F1A";
const ACCENT = "#00FFFF";
const PRIMARY = "#A855F7";
const TEXT = "#1A1A2E";
const TEXT_SOFT = "#3A3A55";
const SUBTLE = "#6F6F8A";
const ROW_ALT = "#F4F4FA";
const ROW_HEAD = "#0F0F1A";
const PAGE_W = doc.page.width;
const PAGE_H = doc.page.height;
const M_LEFT = 64;
const M_RIGHT = 64;
const CONTENT_W = PAGE_W - M_LEFT - M_RIGHT;

// ============== HELPERS ==============
function h1(t) {
  doc.moveDown(0.4).fillColor(TEXT).font("Helvetica-Bold").fontSize(28).text(t).moveDown(0.2);
  const startY = doc.y;
  doc.rect(M_LEFT, startY, 70, 4).fill(ACCENT);
  doc.fillColor(TEXT).moveDown(1.1);
}
function h2(t) {
  doc.moveDown(0.6).fillColor(TEXT).font("Helvetica-Bold").fontSize(17).text(t).moveDown(0.25);
}
function h3(t) {
  doc.moveDown(0.4).fillColor(TEXT).font("Helvetica-Bold").fontSize(13).text(t).moveDown(0.15);
}
function eyebrow(t) {
  doc.moveDown(0.2).fillColor(ACCENT).font("Helvetica-Bold").fontSize(9).text(t.toUpperCase(), { characterSpacing: 3 }).moveDown(0.15);
  doc.fillColor(TEXT);
}
function p(t) {
  doc.fillColor(TEXT).font("Helvetica").fontSize(11).text(t, { align: "left", lineGap: 3 }).moveDown(0.3);
}
function pSoft(t) {
  doc.fillColor(TEXT_SOFT).font("Helvetica").fontSize(10.5).text(t, { align: "left", lineGap: 3 }).moveDown(0.3);
  doc.fillColor(TEXT);
}
function bullet(t) {
  doc.fillColor(TEXT).font("Helvetica").fontSize(11).text(`•  ${t}`, { indent: 12, lineGap: 3 }).moveDown(0.12);
}
function divider() {
  doc.moveDown(0.5);
  const y = doc.y;
  doc.rect(M_LEFT, y, CONTENT_W, 0.7).fill("#D8D8E5");
  doc.fillColor(TEXT).moveDown(0.5);
}
function callout(label, text) {
  doc.moveDown(0.4);
  const startY = doc.y;
  // left accent stripe
  const stripeH = 60;
  doc.rect(M_LEFT, startY, 4, stripeH).fill(ACCENT);
  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(9).text(label.toUpperCase(), M_LEFT + 16, startY + 2, { characterSpacing: 2, width: CONTENT_W - 16 });
  doc.fillColor(TEXT_SOFT).font("Helvetica-Oblique").fontSize(10.5).text(text, M_LEFT + 16, doc.y + 2, { lineGap: 3, width: CONTENT_W - 16 });
  doc.fillColor(TEXT).moveDown(0.4);
}
function pageBreak() { doc.addPage(); }
function pageNumberFooter(currentPage, totalPages) {
  doc.fillColor(SUBTLE).font("Helvetica").fontSize(8.5)
    .text(`Hybrid Funding · Trader Playbook`, M_LEFT, PAGE_H - 40, { width: CONTENT_W / 2, align: "left" });
  doc.fillColor(SUBTLE).font("Helvetica").fontSize(8.5)
    .text(`${currentPage} / ${totalPages}`, PAGE_W - M_RIGHT - 60, PAGE_H - 40, { width: 60, align: "right" });
  doc.fillColor(TEXT);
}

/**
 * Render a table with header + rows.
 * cols: [{ key, label, width, align }]
 * rows: [{ key: value, ... }]
 */
function table(cols, rows, opts = {}) {
  const headH = 26;
  const rowH = opts.rowH || 22;
  const totalW = cols.reduce((a, c) => a + c.width, 0);
  let x = M_LEFT;
  let y = doc.y;

  // ensure we have space; otherwise page break
  const needed = headH + rowH * rows.length + 14;
  if (y + needed > PAGE_H - 96) {
    pageBreak();
    y = doc.y;
  }

  // header
  doc.rect(M_LEFT, y, totalW, headH).fill(ROW_HEAD);
  cols.forEach((c) => {
    doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(10).text(
      c.label,
      x + 8,
      y + 8,
      { width: c.width - 16, align: c.align || "left" }
    );
    x += c.width;
  });
  y += headH;

  // rows
  rows.forEach((row, i) => {
    if (i % 2 === 1) {
      doc.rect(M_LEFT, y, totalW, rowH).fill(ROW_ALT);
    }
    let cx = M_LEFT;
    cols.forEach((c) => {
      const val = row[c.key];
      const isHighlight = row._highlight && c.key === cols[0].key;
      doc.fillColor(isHighlight ? PRIMARY : TEXT)
        .font(isHighlight ? "Helvetica-Bold" : "Helvetica")
        .fontSize(10)
        .text(String(val ?? ""), cx + 8, y + 6, { width: c.width - 16, align: c.align || "left", lineGap: 2 });
      cx += c.width;
    });
    // bottom border
    doc.rect(M_LEFT, y + rowH - 0.5, totalW, 0.4).fill("#E8E8F0");
    y += rowH;
  });

  doc.y = y + 6;
  doc.fillColor(TEXT);
}

function statPanel(items) {
  // items: [{label, value}]
  const gap = 12;
  const w = (CONTENT_W - gap * (items.length - 1)) / items.length;
  const h = 70;
  const startY = doc.y;
  let x = M_LEFT;
  items.forEach((it) => {
    doc.rect(x, startY, w, h).fill("#F4F4FA");
    doc.rect(x, startY, 4, h).fill(ACCENT);
    doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(20).text(it.value, x + 14, startY + 14, { width: w - 22 });
    doc.fillColor(SUBTLE).font("Helvetica").fontSize(9).text(it.label.toUpperCase(), x + 14, startY + 42, { width: w - 22, characterSpacing: 1.5 });
    x += w + gap;
  });
  doc.y = startY + h + 10;
  doc.fillColor(TEXT);
}

function bigCTA(headline, subline, url) {
  doc.moveDown(0.5);
  const y = doc.y;
  const h = 70;
  doc.rect(M_LEFT, y, CONTENT_W, h).fill(BG_DARK);
  doc.rect(M_LEFT, y, 6, h).fill(ACCENT);
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(15).text(headline, M_LEFT + 18, y + 13, { width: CONTENT_W - 28 });
  doc.fillColor("#B8B8D0").font("Helvetica").fontSize(10).text(subline, M_LEFT + 18, y + 35, { width: CONTENT_W - 28 });
  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(10).text(url, M_LEFT + 18, y + 52, { width: CONTENT_W - 28 });
  doc.y = y + h + 10;
  doc.fillColor(TEXT);
}

// ============== COVER ==============
doc.rect(0, 0, PAGE_W, PAGE_H).fill(BG_DARK);
// subtle grid pattern
for (let gx = 0; gx < PAGE_W; gx += 32) doc.rect(gx, 0, 0.4, PAGE_H).fill("rgba(0,255,255,0.04)");
for (let gy = 0; gy < PAGE_H; gy += 32) doc.rect(0, gy, PAGE_W, 0.4).fill("rgba(0,255,255,0.04)");

// faux nebula glows
doc.circle(120, 140, 80).fill("#1A1A2E");
doc.circle(PAGE_W - 100, PAGE_H - 200, 140).fill("#1A1A2E");

doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(11).text("HYBRID FUNDING", 64, 100, { characterSpacing: 4 });
doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(54).text("The Trader", 64, 170);
doc.fillColor(ACCENT).text("Playbook.", 64);
doc.fillColor("#B8B8D0").font("Helvetica").fontSize(14).text(
  "The unfair advantage we hand every trader who joins Hybrid Funding.\nRule-by-rule guides, position-sizing math, and the playbooks that pass evaluations.",
  64, 360, { lineGap: 5, width: 480 }
);

// trust strip
doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(9).text("INSIDE THIS PLAYBOOK", 64, 510, { characterSpacing: 2.5 });
const insideItems = [
  ["The 5 rules every funded trader memorizes", "Position sizing math from $5K to $200K"],
  ["Trailing drawdown geometry (worked examples)", "Asset-class playbooks: FX, Crypto, Futures, Equities"],
  ["The 30-day path to your first payout", "How to earn $100K+ referring traders"],
];
let insideY = 532;
insideItems.forEach(([a, b]) => {
  doc.fillColor("#FFFFFF").font("Helvetica").fontSize(11).text(`• ${a}`, 64, insideY, { width: 230 });
  doc.fillColor("#FFFFFF").font("Helvetica").fontSize(11).text(`• ${b}`, 310, insideY, { width: 240 });
  insideY += 22;
});

doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(11).text("HYBRIDFUNDING.CO", 64, 720, { characterSpacing: 3 });
doc.fillColor("#6F6F8A").font("Helvetica").fontSize(9).text("Empowering Traders. Funding Potential.", 64, 736);
pageBreak();

// ============== TOC ==============
h1("Table of contents");
const tocRows = [
  ["01", "The Quick Reference Card", "What every section looks like in one screenshot.", "3"],
  ["02", "The 5 rules every trader memorizes", "Profit Target, Drawdown, Daily Limit, Window, Consistency.", "4"],
  ["03", "Position sizing — the math that decides everything", "0.25–0.5% rule + sizing tables for every account size.", "6"],
  ["04", "Trailing max drawdown — geometry of the rule that breaks traders", "Worked example, day-by-day on a $100K account.", "7"],
  ["05", "Forex playbook", "1-Step, 2-Step, 3-Step, Instant Funding, Lite.", "8"],
  ["06", "Crypto playbook", "Programs, leverage, daily cap, weekend rules.", "9"],
  ["07", "Futures 4-Phase playbook", "Phase rules, contract limits, payouts, Tradovate.", "10"],
  ["08", "Single Session Equities playbook", "GooeyPro, S&P 100, 09:30–15:55 ET.", "11"],
  ["09", "Add-on decision tree", "Which 5 add-ons earn back their price.", "12"],
  ["10", "How traders breach (and how not to)", "5 most common breach scenarios with fixes.", "13"],
  ["11", "Why traders pick Hybrid Funding", "Six unfair advantages of trading with us.", "14"],
  ["12", "The first 30 days roadmap", "Week-by-week from sign-up to first payout.", "15"],
  ["13", "The compounding math of payouts", "How one funded account becomes five.", "16"],
  ["14", "Get paid to refer traders", "Affiliate tiers + how to earn $5K/month from a single post.", "17"],
  ["15", "Join the TradeHouse Battles arena", "Trader tournaments worth funded accounts.", "18"],
  ["16", "Your next move", "Resources and links to take action right now.", "19"],
];
table(
  [
    { key: "no", label: "#", width: 36, align: "left" },
    { key: "title", label: "SECTION", width: 220, align: "left" },
    { key: "sub", label: "WHAT'S IN IT", width: 196, align: "left" },
    { key: "page", label: "PG", width: 32, align: "right" },
  ],
  tocRows.map(([no, title, sub, page]) => ({ no, title, sub, page })),
  { rowH: 24 }
);
doc.moveDown(0.5);
callout("Read time", "About 22 minutes cover-to-cover. 6 minutes if you only read the Quick Reference Card and your asset class playbook.");
pageBreak();

// ============== QUICK REFERENCE CARD ==============
h1("01  ·  The Quick Reference Card");
eyebrow("Screenshot this page");
p("Every important Hybrid Funding number, in one place. The whole game on a single screen.");

statPanel([
  { value: "10%", label: "Forex 1-Step Target" },
  { value: "6%", label: "Forex 1-Step Trailing DD" },
  { value: "1:50", label: "Max Forex Leverage" },
  { value: "90%", label: "Profit Split (with Add-on)" },
]);

statPanel([
  { value: "9%", label: "Futures Target / Phase" },
  { value: "5%", label: "Futures Trailing Loss" },
  { value: "25%", label: "Futures Consistency" },
  { value: "$1.5K", label: "Phase 4 Payout ($25K acct)" },
]);

statPanel([
  { value: "3%", label: "Equities Trailing DD" },
  { value: "2:1", label: "Equities Leverage" },
  { value: "15:55 ET", label: "Equities Hard Close" },
  { value: "$0.02", label: "Equities Per-Share Comm." },
]);

h2("Asset class lineup at a glance");
table(
  [
    { key: "asset", label: "ASSET CLASS", width: 110, align: "left" },
    { key: "platform", label: "PLATFORM(S)", width: 130, align: "left" },
    { key: "leverage", label: "MAX LEVERAGE", width: 100, align: "left" },
    { key: "window", label: "TRADING WINDOW", width: 144, align: "left" },
  ],
  [
    { asset: "Forex", platform: "cTrader · DXTrade · MatchTrader", leverage: "1:50", window: "24/5 (close 3:45pm Fri ET)" },
    { asset: "Crypto", platform: "cTrader · DXTrade · MatchTrader", leverage: "5:1 BTC/ETH · 2:1 alts", window: "24/7" },
    { asset: "Futures", platform: "Rithmic Pro · Tradovate (soon)", leverage: "Per instrument", window: "Close by 15:10 CST" },
    { asset: "SS Equities", platform: "GooeyPro", leverage: "2:1", window: "09:30 – 15:55 ET only" },
  ],
);

callout("Pin this", "If you remember nothing else: don't oversize, get to your trailing-DD lock threshold first, then ladder up to the profit target. That's how the playbook ends well.");
pageBreak();

// ============== RULE 1-5 (RESTRUCTURED) ==============
h1("02  ·  The 5 rules every trader memorizes");
p("Memorize these before you trade a single tick. Every other rule on every program is a variation of one of these five.");

h2("Rule 1 — Profit target");
p("The percentage gain you need to clear each phase. By program:");
table(
  [
    { key: "program", label: "PROGRAM", width: 220, align: "left" },
    { key: "target", label: "PROFIT TARGET", width: 130, align: "left" },
    { key: "phases", label: "PHASES", width: 90, align: "center" },
    { key: "split", label: "SPLIT", width: 44, align: "center" },
  ],
  [
    { program: "Forex 1-Step", target: "10%", phases: "1", split: "80%" },
    { program: "Forex 2-Step", target: "10% → 5%", phases: "2", split: "80%" },
    { program: "Forex 3-Step", target: "5% per phase", phases: "3", split: "80%" },
    { program: "Forex Instant Funding", target: "No target — trade firm capital", phases: "0", split: "80%" },
    { program: "Forex Instant Funding Lite", target: "No target", phases: "0", split: "80%" },
    { program: "Crypto 1-Step", target: "9%", phases: "1", split: "90%" },
    { program: "Crypto 2-Step", target: "6% → 9%", phases: "2", split: "90%" },
    { program: "Futures Funded (4-Phase)", target: "9% per phase", phases: "4", split: "90%" },
    { program: "Single Session Equities", target: "10% (Eval only)", phases: "1", split: "80%" },
  ],
  { rowH: 22 }
);
pSoft("Profit splits shown are baseline. Add the 90% Profit Share Upgrade (15% of plan price) to lift any program to 90%.");

h2("Rule 2 — Maximum drawdown");
p("The single most important rule. Either trailing (moves up with closed balance, then locks at starting balance) or static (fixed). A breach below max drawdown = hard breach = account terminated.");
table(
  [
    { key: "program", label: "PROGRAM", width: 220, align: "left" },
    { key: "type", label: "TYPE", width: 110, align: "left" },
    { key: "amt", label: "MAX DRAWDOWN", width: 154, align: "left" },
  ],
  [
    { program: "Forex 1-Step", type: "Trailing", amt: "6% on closed balance" },
    { program: "Forex 2-Step", type: "Static", amt: "8%" },
    { program: "Forex 3-Step", type: "Trailing", amt: "5%" },
    { program: "Forex Instant Funding", type: "Trailing", amt: "8%" },
    { program: "Forex Instant Funding Lite", type: "Trailing", amt: "5%" },
    { program: "Crypto 1-Step / 2-Step", type: "Static", amt: "6% / 9%" },
    { program: "Futures Funded (4-Phase)", type: "Trailing", amt: "5% on EOD balance" },
    { program: "Single Session Equities", type: "Trailing", amt: "3% on closed balance" },
  ],
);

h2("Rule 3 — Daily loss limit");
p("Caps how much you can lose in a single trading day. Calculated on previous day's end-of-day balance; resets at 5pm EST.");
table(
  [
    { key: "program", label: "PROGRAM", width: 240, align: "left" },
    { key: "limit", label: "DAILY LOSS LIMIT", width: 244, align: "left" },
  ],
  [
    { program: "Forex 1-Step / 3-Step", limit: "None" },
    { program: "Forex 2-Step", limit: "4%" },
    { program: "Forex Instant Funding", limit: "5%" },
    { program: "Forex Instant Funding Lite", limit: "3%" },
    { program: "Crypto 1-Step / 2-Step", limit: "3% (bidirectional Daily Cap)" },
    { program: "Futures (per phase)", limit: "Effectively the trailing loss" },
    { program: "Single Session Equities", limit: "2.5% intraday trailing" },
  ],
);

h2("Rule 4 — Trading window");
p("When you can have positions open. Violating the window = soft breach (auto-close) at best, hard breach at worst.");
bullet("Forex: 24/5. All positions auto-close 3:45pm EST Friday unless Weekend Hold add-on purchased.");
bullet("Crypto: 24/7. Weekend holds allowed.");
bullet("Futures: All positions and orders cancelled by 15:10 CST. No overnight or weekend holds.");
bullet("Single Session Equities: 09:30 – 15:55 ET only. Open past 15:55 = hard breach (Prohibited Practices).");

h2("Rule 5 — Consistency");
p("Designed to filter out lucky entries. Limits how concentrated your profit can be on a single day.");
bullet("Futures Funded: best day cannot exceed 25% of total profit (need 4+ trading days minimum to clear a phase).");
bullet("Single Session Equities Funded phase: 25% Consistency Score.");
bullet("Equities also requires a minimum of 3 profitable trading days at 0.50% — both Eval and Funded.");
pageBreak();

// ============== POSITION SIZING ==============
h1("03  ·  Position sizing");
p("Most failed evaluations aren't from bad trades. They're from oversized positions. Position sizing is the only knob that keeps a string of losses from becoming a hard breach.");

h2("The 0.25 – 0.5% rule");
p("Risk 0.25% to 0.5% of starting balance per trade. With a 30-pip stop on a major Forex pair (where 1 pip on a standard lot ≈ $10), 0.5% risk on $25K = $125 risk = 0.42 lots.");

h2("Why this is slow (the math)");
p("If you risk 0.5% per trade with a 1.5R win rate of 50%, you make 0.25% per trade on average. To hit a 10% target you need ~40 trades. If you trade 4 setups per day, that's two trading weeks. That's the right speed.");

h2("Risk budgets at every account size");
table(
  [
    { key: "size", label: "ACCOUNT SIZE", width: 130, align: "left" },
    { key: "r25", label: "0.25% RISK", width: 100, align: "right" },
    { key: "r50", label: "0.5% RISK", width: 100, align: "right" },
    { key: "tgt", label: "10% TARGET", width: 154, align: "right" },
  ],
  [
    { size: "$5,000",   r25: "$12.50",  r50: "$25",    tgt: "$500" },
    { size: "$10,000",  r25: "$25",     r50: "$50",    tgt: "$1,000" },
    { size: "$25,000",  r25: "$62.50",  r50: "$125",   tgt: "$2,500" },
    { size: "$50,000",  r25: "$125",    r50: "$250",   tgt: "$5,000" },
    { size: "$100,000", r25: "$250",    r50: "$500",   tgt: "$10,000" },
    { size: "$200,000", r25: "$500",    r50: "$1,000", tgt: "$20,000" },
  ],
);
callout("The discipline trade-off", "Risking 1% per trade halves your trade count to target — but doubles your blow-up odds. Pros risk smaller, trade longer, and finish.");
pageBreak();

// ============== TRAILING DRAWDOWN ==============
h1("04  ·  Trailing max drawdown");
p("The trailing max drawdown is calculated on closed balance, not equity. Two consequences most traders miss:");
bullet("Open floating profit doesn't trail the DD up. Only when you close the trade does the high-water mark move.");
bullet("Once your closed balance reaches the lock threshold (e.g. +6% on Forex 1-Step), the trailing locks at your starting balance permanently. From there, you have a hard floor.");

h2("Worked example: $100,000 Forex 1-Step (6% trailing)");
table(
  [
    { key: "day", label: "DAY", width: 56, align: "left" },
    { key: "trade", label: "TRADE", width: 156, align: "left" },
    { key: "balance", label: "CLOSED BALANCE", width: 130, align: "right" },
    { key: "floor", label: "DD FLOOR", width: 142, align: "right" },
  ],
  [
    { day: "Start", trade: "—", balance: "$100,000", floor: "$94,000" },
    { day: "Day 1", trade: "Closed +$2,000 winner", balance: "$102,000", floor: "$96,000 (trailed up)" },
    { day: "Day 2", trade: "Closed -$1,500 loser", balance: "$100,500", floor: "$96,000 (no change)" },
    { day: "Day 3", trade: "Closed +$5,500 winner", balance: "$106,000 (+6%)", floor: "$100,000 (LOCKED)", _highlight: true },
    { day: "Day 4+", trade: "Continue trading", balance: "Whatever", floor: "$100,000 forever" },
  ],
  { rowH: 22 }
);
callout("The play", "Ladder to your lock threshold first with conservative size. Then ladder up to the profit target with the floor permanently protecting you. Most blow-ups happen between Day 1 and the lock.");
pageBreak();

// ============== FOREX ==============
h1("05  ·  Forex playbook");
p("Five Forex programs. Pick by your style and your honest pass rate, not by the entry fee.");
table(
  [
    { key: "prog", label: "PROGRAM", width: 130, align: "left" },
    { key: "tgt", label: "TARGET", width: 90, align: "left" },
    { key: "dd", label: "MAX DD", width: 100, align: "left" },
    { key: "lev", label: "LEVERAGE", width: 75, align: "left" },
    { key: "best", label: "BEST FOR", width: 89, align: "left" },
  ],
  [
    { prog: "1-Step", tgt: "10%", dd: "6% trailing", lev: "1:20", best: "Newer pros" },
    { prog: "2-Step", tgt: "10% → 5%", dd: "8% static", lev: "1:30", best: "Methodical" },
    { prog: "3-Step", tgt: "5% × 3", dd: "5% trailing", lev: "1:20", best: "Slow, sure" },
    { prog: "Instant Funding", tgt: "None", dd: "8% trailing", lev: "1:50", best: "Track record" },
    { prog: "IF Lite", tgt: "None", dd: "5% trailing", lev: "Up to 50:1", best: "Cost-conscious" },
  ],
  { rowH: 22 }
);

h2("1-Step (most-picked)");
bullet("10% target, 6% trailing DD, 1:20 leverage, no daily loss limit.");
bullet("Weekend hold: not allowed unless Weekend Hold add-on purchased.");

h2("Instant Funding Lite (the smart shortcut)");
bullet("Daily DD: 3%, max trailing DD: 5%, 25% consistency, 80% split (90% available add-on).");
bullet("3% non-withdrawable profit buffer; first payout on demand, 14-day subsequent.");
bullet("Up to 50:1 leverage. Cheaper than full Instant Funding, payout-on-breach available.");
pageBreak();

// ============== CRYPTO ==============
h1("06  ·  Crypto playbook");
p("Crypto programs are tighter on daily moves but pay a higher baseline split (90%).");
table(
  [
    { key: "prog", label: "PROGRAM", width: 130, align: "left" },
    { key: "tgt", label: "TARGET", width: 130, align: "left" },
    { key: "dd", label: "MAX DD", width: 130, align: "left" },
    { key: "cap", label: "DAILY CAP", width: 94, align: "left" },
  ],
  [
    { prog: "1-Step", tgt: "9%", dd: "6% static", cap: "3%" },
    { prog: "2-Step", tgt: "6% → 9%", dd: "9% static both", cap: "3%" },
  ],
);

h2("Leverage");
bullet("BTC and ETH: 5:1");
bullet("All other cryptocurrencies: 2:1");

h2("The Daily Cap (the rule that surprises new traders)");
p("3% daily cap is bidirectional. If you make 3% in one day, your account locks until next session at 5pm EST. This caps single-day upside — plan for multiple smaller days, not one big day.");

h2("Other rules");
bullet("Weekend trading allowed (24/7 markets). Hold positions through Sunday without an add-on.");
bullet("Profit split: 90% on Crypto programs, baseline.");
pageBreak();

// ============== FUTURES ==============
h1("07  ·  Futures 4-Phase playbook");
p("Funded Futures runs on Rithmic Pro today. Tradovate platform integration is coming soon — same rules, additional platform option.");

h2("Phase rules (each phase is identical)");
bullet("Profit target: 9%");
bullet("Maximum trailing loss: 5%, trails on End of Day balance, locks at starting balance after +5%");
bullet("Consistency: best day cannot exceed 25% of total profit (4+ trading days minimum)");
bullet("EOD = 1600 CST. All positions and orders closed at 1510 CST. No overnight or weekend holds.");

h2("Contract limits");
table(
  [
    { key: "size", label: "ACCOUNT SIZE", width: 162, align: "left" },
    { key: "std", label: "STANDARD CONTRACTS", width: 162, align: "left" },
    { key: "mic", label: "MICRO CONTRACTS", width: 160, align: "left" },
  ],
  [
    { size: "$25K",  std: "1",  mic: "15" },
    { size: "$50K",  std: "3",  mic: "30" },
    { size: "$100K", std: "6",  mic: "60" },
    { size: "$150K", std: "9",  mic: "90" },
  ],
);

h2("Phase payouts (scale with account size — example on $25K)");
table(
  [
    { key: "phase", label: "PHASE", width: 110, align: "left" },
    { key: "tgt", label: "TARGET", width: 110, align: "left" },
    { key: "dd", label: "TRAILING DD", width: 110, align: "left" },
    { key: "payout", label: "PAYOUT ($25K)", width: 154, align: "right" },
  ],
  [
    { phase: "Phase 1", tgt: "9%", dd: "5%", payout: "$500" },
    { phase: "Phase 2", tgt: "9%", dd: "5%", payout: "$750" },
    { phase: "Phase 3", tgt: "9%", dd: "5%", payout: "$750" },
    { phase: "Phase 4", tgt: "9%", dd: "5%", payout: "$1,500" },
    { phase: "Live Funded", tgt: "—", dd: "—", payout: "90% split, no cap" },
  ],
);

callout("Don't forget", "CME market data attestation must be done in R | Trader Pro desktop. Mobile/web won't work for this step. Attest as a non-professional user.");
pageBreak();

// ============== EQUITIES ==============
h1("08  ·  Single Session Equities");
p("Day-trade S&P 100 equity products on GooeyPro. All positions open and close within the same trading session — flat by 15:55 ET, every day. The ONLY equities prop product on the market with this structure.");

h2("Rules at a glance");
table(
  [
    { key: "rule", label: "RULE", width: 250, align: "left" },
    { key: "value", label: "VALUE", width: 234, align: "left" },
  ],
  [
    { rule: "Profit target (Eval only)", value: "10%" },
    { rule: "Max drawdown (trailing on closed balance)", value: "3.0%" },
    { rule: "Daily drawdown (trailing intraday)", value: "2.5%" },
    { rule: "Daily profit cap (Eval only — soft breach)", value: "2.5%" },
    { rule: "Min profitable trading days (Eval & Funded)", value: "3 days at 0.50%" },
    { rule: "Profit split", value: "80% / 20%" },
    { rule: "Payout cadence", value: "14 days initial · 14 days subsequent" },
    { rule: "Min withdrawal", value: "$100" },
    { rule: "Consistency Score (Funded only)", value: "25%" },
    { rule: "Lock upon payout", value: "Yes (waiver: 25% add-on)" },
    { rule: "Payout on breach", value: "No (available: 25% add-on)" },
    { rule: "Leverage", value: "Up to 2:1" },
    { rule: "Commissions", value: "$0.02/share/side · $0.50 min/transaction" },
    { rule: "Liquidity", value: "Sourced directly from Nasdaq" },
  ],
);

callout("Trading window", "09:30 – 15:55 ET only. Pre-market / extended hours not allowed. Position open past 15:55 ET = Prohibited Practices violation = hard breach.");
pageBreak();

// ============== ADD-ONS ==============
h1("09  ·  Add-on decision tree");
p("Five add-ons priced as a percentage of plan price. Pick based on your style — not because you're hedging your own discipline.");
table(
  [
    { key: "addon", label: "ADD-ON", width: 200, align: "left" },
    { key: "cost", label: "COST", width: 80, align: "center" },
    { key: "useif", label: "USE IT IF…", width: 204, align: "left" },
  ],
  [
    { addon: "90% Profit Share Upgrade", cost: "15%", useif: "You intend to scale and take payouts. Pays back inside the first month for serious traders." },
    { addon: "Weekend Hold (Forex only)", cost: "10%", useif: "You swing trade Sunday → Friday. Skip if you scalp." },
    { addon: "Payout-on-Breach", cost: "25%", useif: "You're on a tight-rules program (SS Equities, Instant Funding). Real safety net." },
    { addon: "Lock-Upon-Payout Waiver", cost: "25%", useif: "You take small frequent payouts. Skip if you batch payouts." },
    { addon: "33% Consistency Threshold", cost: "20%", useif: "You want a looser consistency rule (cheaper to clear)." },
    { addon: "50% Consistency Threshold", cost: "35%", useif: "You want to flex — tighter rule. Most traders skip both." },
  ],
  { rowH: 28 }
);
pageBreak();

// ============== BREACH SCENARIOS ==============
h1("10  ·  How traders breach (and how not to)");
p("The five most common breach patterns we see — and exactly how to avoid each one.");

h3("1. The Friday close trap (Forex)");
p("All Forex positions auto-close at 3:45pm EST Friday unless you have the Weekend Hold add-on. Many traders are mid-swing and the auto-close locks them in unfavorably. Either close before 3:30 or buy the add-on if you swing.");

h3("2. The 'I'll just hold it longer' trap");
p("Trailing DD moves with closed balance. Holding a winner doesn't trail the DD up. The opposite of what most traders intuit. Close winners to lock in trailing protection.");

h3("3. The consistency breach (Futures, Funded Equities)");
p("You hit your profit target but your best day was 30% of total profit (above the 25% threshold). You don't fail — but you can't pass the phase. Solution: spread profits across more days, not bigger days.");

h3("4. The intraday equity breach (Single Session Equities)");
p("Daily Drawdown is 2.5% intraday TRAILING. If you make $500 then give $700 back from peak equity that day, you breach — even if your closed balance is up. Trade smaller and use real stops.");

h3("5. The inactivity breach");
p("Most programs require at least one trade every 30 days. Vacations and breaks have killed funded accounts. Set a calendar reminder.");

callout("If you remember nothing else", "Three rules: small size, lock the trailing floor before laddering up, close winners. That's how traders pass.");
pageBreak();

// ============== WHY HYBRID FUNDING ==============
h1("11  ·  Why traders pick Hybrid Funding");
eyebrow("Six unfair advantages");
p("We're not the only prop firm. We are the prop firm built for traders who want optionality, modern platforms, and rules that make sense.");

table(
  [
    { key: "what", label: "ADVANTAGE", width: 170, align: "left" },
    { key: "why", label: "WHAT IT MEANS FOR YOU", width: 314, align: "left" },
  ],
  [
    { what: "4 asset classes, 1 firm", why: "Trade Forex, Crypto, Futures, and Single Session Equities under one account ecosystem. No juggling logins across firms." },
    { what: "Single Session Equities", why: "The only prop firm with day-traded S&P 100 equities on GooeyPro. Direct Nasdaq liquidity, $0.02/share. Built for stock day-traders." },
    { what: "Modern platform stack", why: "cTrader, DXTrade, MatchTrader, Rithmic Pro, GooeyPro — and Tradovate is coming. We integrate fast and pick platforms traders actually like." },
    { what: "Up to 90% profit splits", why: "Industry-leading. The 90% upgrade pays for itself in your first 30 days of consistent trading." },
    { what: "Transparent rules", why: "Full FAQ pages with worked drawdown examples on hybridfunding.co/faq. No 30-page hidden PDFs. We want you to pass." },
    { what: "Real community", why: "TradeHouse Battles tournaments, real prizes including funded accounts. Trade your reps, win real capital." },
  ],
  { rowH: 36 }
);
pageBreak();

// ============== 30-DAY ROADMAP ==============
h1("12  ·  The first 30 days roadmap");
p("From sign-up to your first payout. The exact path most successful traders follow.");

h3("Week 1 — Setup & calibration");
bullet("Pick your asset class and program (use the Add-on Decision Tree page).");
bullet("Pay the entry, complete KYC if Eval (mandatory before Funded).");
bullet("Install your platform. Run a single 0.25% risk test trade — confirm size math is right BEFORE you take a real position.");

h3("Week 2 — Lock the trailing floor");
bullet("Risk 0.25–0.5% per trade. Stack 1.5R+ wins.");
bullet("Goal: get to your DD lock threshold (+6% on 1-Step, +5% on 3-Step, +3% on Equities). Don't push for the target yet.");
bullet("Once locked, you have a permanent floor. The hard part is over.");

h3("Week 3 — Ladder to target");
bullet("Now ladder up to the profit target with the floor protecting you.");
bullet("Maintain consistency: spread profit across days. Best day cap matters.");
bullet("Document every trade. Most blow-ups happen here from impatience.");

h3("Week 4 — Pass + first payout");
bullet("Hit target → automatic phase pass (or transition to Funded for single-step programs).");
bullet("Funded: request first payout on demand. Min withdrawal $100.");
bullet("Subsequent payouts: 14–30 days depending on program.");

callout("Realistic timeline", "1-Step Forex with disciplined sizing typically clears in 2–4 weeks. Single Session Equities clears in 3–5 weeks (more session days needed for consistency).");
pageBreak();

// ============== COMPOUNDING MATH ==============
h1("13  ·  The compounding math of payouts");
p("One funded account is fine. The math gets interesting when you understand how funded accounts compound on themselves.");

h2("Worked example — the scaling ladder");
p("Trader Sarah passes a $25K Forex 1-Step in week 3. She holds the funded account. Here's what year one looks like:");
table(
  [
    { key: "month", label: "MONTH", width: 70, align: "left" },
    { key: "events", label: "WHAT HAPPENED", width: 254, align: "left" },
    { key: "earned", label: "PAYOUT", width: 80, align: "right" },
    { key: "total", label: "TOTAL", width: 80, align: "right" },
  ],
  [
    { month: "M1", events: "Passed $25K. Paid 80% on +6% over month: $1,200.", earned: "$1,200", total: "$1,200" },
    { month: "M2", events: "Passed $50K (re-invested some). +5% on each, two payouts.", earned: "$3,000", total: "$4,200" },
    { month: "M3", events: "Added $100K Single Session Equities. +4% all accounts.", earned: "$5,200", total: "$9,400" },
    { month: "M6", events: "Three funded accounts: $25K + $100K Forex + $100K Equities. Steady.", earned: "$5,800", total: "$28,000" },
    { month: "M12", events: "Stable across three asset classes. Year one cash from prop firm trading:", earned: "—", total: "$72,000+" },
  ],
  { rowH: 26 }
);
pSoft("This is a worked example, not a guarantee. Your numbers depend on your strategy, discipline, and time in market. The point: passing one Eval and stopping is leaving money on the table.");

h2("Why most traders never get past month one");
bullet("They blow the funded account chasing big size after passing.");
bullet("They skip the 90% upgrade and lose 11% of every payout.");
bullet("They don't add a second account — but the entry on a second program is now a tax-deductible cost against payout income for most jurisdictions.");
pageBreak();

// ============== AFFILIATE ==============
h1("14  ·  Get paid to refer traders");
eyebrow("Affiliate program");
p("This is the easy money play. If your network has any traders, you should be running our affiliate program. 5–20% commissions, weekly payouts, no cap.");

h2("Tier structure");
table(
  [
    { key: "tier", label: "TIER", width: 90, align: "left" },
    { key: "sales", label: "SALES VOLUME", width: 134, align: "left" },
    { key: "rate", label: "COMMISSION", width: 130, align: "center" },
    { key: "annual", label: "AT 5 SALES/MO", width: 130, align: "right" },
  ],
  [
    { tier: "Tier 1", sales: "First 1–9 sales", rate: "5%", annual: "$300/yr" },
    { tier: "Tier 2", sales: "10–49 sales", rate: "10%", annual: "$3,000/yr" },
    { tier: "Tier 3", sales: "50–100 sales", rate: "15%", annual: "$9,000/yr" },
    { tier: "Tier 4", sales: "100+ sales", rate: "20%", annual: "$24,000+/yr" },
  ],
  { rowH: 22 }
);
pSoft("Math assumes ~$500 average plan price. A trader with a 5,000-follower trading Discord can hit Tier 3 inside a single quarter.");

h2("How to start in 30 seconds");
bullet("Visit hybridfunding.co/affiliate, sign up.");
bullet("Get your trackable link. Drop it in your trading content (YouTube, Discord, X, IG).");
bullet("Real-time dashboard shows clicks, conversions, and unpaid balance.");
bullet("Weekly automatic payouts — no chasing.");

bigCTA("Start the affiliate program in 30 seconds", "Tier 4 traders earn $24K+/year referring traders to programs they were going to use anyway.", "https://www.hybridfunding.co/affiliate");
pageBreak();

// ============== BATTLES ==============
h1("15  ·  Join the TradeHouse Battles arena");
eyebrow("Trade live, win funded accounts");
p("TradeHouse Battles is the competitive trading arena built for serious traders. Real-time tournaments. Live leaderboards. Prizes including funded accounts worth $100,000+. Free to enter many events.");

h2("What you can win");
bullet("Funded accounts ($25K – $100K+) directly from the leaderboard.");
bullet("Cash prizes paid weekly.");
bullet("Free upgrades to higher-tier programs.");
bullet("Custom merch and trading tool credits.");

h2("Why traders love Battles");
bullet("It's live and public — you build a track record other traders can verify.");
bullet("Tournament discipline is identical to passing an Eval. Reps for both.");
bullet("Network with other competitive traders. Trading is a lonely game; Battles fixes that.");

bigCTA("Enter the next Battle", "New tournaments every week. Free events monthly.", "https://www.hybridfunding.co/battles");
pageBreak();

// ============== NEXT MOVE ==============
h1("16  ·  Your next move");
p("Pick one. All five paths work. Most traders start with #1.");

h2("1. Pick your challenge tier");
pSoft("All programs, all asset classes, full pricing.");
bigCTA("Start a challenge", "Forex · Crypto · Futures · Single Session Equities", "https://www.hybridfunding.co/challenges");

h2("2. Read the full FAQ");
pSoft("Every rule, every program, with worked examples — by asset class.");
bigCTA("Read the FAQ", "Hands-on rules guide for every program we run.", "https://www.hybridfunding.co/faq");

h2("3. Earn from referrals");
pSoft("5–20% commissions on every referral. Weekly payouts.");
bigCTA("Become an affiliate", "Most active affiliates clear $5K–$20K/month.", "https://www.hybridfunding.co/affiliate");

h2("4. Compete in TradeHouse Battles");
pSoft("Win funded accounts on the leaderboard.");
bigCTA("Enter the arena", "Free entry events every month. Funded accounts on the line.", "https://www.hybridfunding.co/battles");

h2("5. Read the blog");
pSoft("Strategy guides, rule explainers, and asset-class deep dives. New posts weekly.");
bigCTA("Read the blog", "Free, no email required.", "https://www.hybridfunding.co/blog");

h2("Share this playbook");
p("If this helped you — please send it to one trading friend. Forwarding link:");
doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(12).text("hybridfunding.co/playbook", { align: "center" }).moveDown(0.6);
doc.fillColor(TEXT_SOFT).font("Helvetica-Oblique").fontSize(10).text(
  "This playbook is not investment advice. Trading involves risk of loss. © Hybrid Funding LLC.",
  { align: "center" }
);

doc.end();
console.log("Wrote", OUT);

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
    Subject: "Trader operating system, market fit, risk management, rules, and funded-trading education",
    Keywords: "prop firm, forex, crypto, futures, equities, prediction markets, trader DNA, risk management, hybrid funding",
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
const FLOW_BOTTOM = PAGE_H - 82;

function pageBreak() {
  doc.addPage();
  doc.y = 64;
}

function ensureSpace(height = 60) {
  if (doc.y + height > FLOW_BOTTOM) pageBreak();
}

function h1(t) {
  ensureSpace(78);
  doc.moveDown(0.3).fillColor(TEXT).font("Helvetica-Bold").fontSize(28).text(t, { width: CONTENT_W }).moveDown(0.15);
  const startY = doc.y;
  doc.rect(M_LEFT, startY, 70, 4).fill(ACCENT);
  doc.fillColor(TEXT);
  doc.y = startY + 18;
}
function h2(t) {
  ensureSpace(62);
  doc.moveDown(0.35).fillColor(TEXT).font("Helvetica-Bold").fontSize(17).text(t, { width: CONTENT_W }).moveDown(0.15);
}
function h3(t) {
  ensureSpace(48);
  doc.moveDown(0.25).fillColor(TEXT).font("Helvetica-Bold").fontSize(13).text(t, { width: CONTENT_W }).moveDown(0.1);
}
function eyebrow(t) {
  ensureSpace(30);
  doc.moveDown(0.1).fillColor(ACCENT).font("Helvetica-Bold").fontSize(9).text(t.toUpperCase(), { characterSpacing: 3, width: CONTENT_W }).moveDown(0.1);
  doc.fillColor(TEXT);
}
function p(t) {
  doc.font("Helvetica").fontSize(11);
  const h = doc.heightOfString(t, { width: CONTENT_W, lineGap: 3 }) + 14;
  ensureSpace(h);
  doc.fillColor(TEXT).text(t, { width: CONTENT_W, align: "left", lineGap: 3 }).moveDown(0.25);
}
function pSoft(t) {
  doc.font("Helvetica").fontSize(10.5);
  const h = doc.heightOfString(t, { width: CONTENT_W, lineGap: 3 }) + 14;
  ensureSpace(h);
  doc.fillColor(TEXT_SOFT).text(t, { width: CONTENT_W, align: "left", lineGap: 3 }).moveDown(0.25);
  doc.fillColor(TEXT);
}
function bullet(t) {
  doc.font("Helvetica").fontSize(10.5);
  const w = CONTENT_W - 18;
  const h = doc.heightOfString(`•  ${t}`, { width: w, lineGap: 2 }) + 8;
  ensureSpace(h);
  doc.fillColor(TEXT).text(`•  ${t}`, { width: w, indent: 12, lineGap: 2 }).moveDown(0.08);
}
function divider() {
  ensureSpace(24);
  doc.moveDown(0.35);
  const y = doc.y;
  doc.rect(M_LEFT, y, CONTENT_W, 0.7).fill("#D8D8E5");
  doc.fillColor(TEXT);
  doc.y = y + 14;
}
function callout(label, text) {
  doc.font("Helvetica-Oblique").fontSize(10);
  const textH = doc.heightOfString(text, { width: CONTENT_W - 32, lineGap: 3 });
  const boxH = Math.max(56, textH + 34);
  ensureSpace(boxH + 12);
  const startY = doc.y + 6;
  doc.rect(M_LEFT, startY, 4, boxH).fill(ACCENT);
  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(8.5).text(label.toUpperCase(), M_LEFT + 16, startY + 3, { characterSpacing: 2, width: CONTENT_W - 32 });
  doc.fillColor(TEXT_SOFT).font("Helvetica-Oblique").fontSize(10).text(text, M_LEFT + 16, startY + 20, { lineGap: 3, width: CONTENT_W - 32 });
  doc.fillColor(TEXT);
  doc.y = startY + boxH + 8;
}
function pageNumberFooter(currentPage, totalPages) {
  doc.fillColor(SUBTLE).font("Helvetica").fontSize(8.5)
    .text(`Hybrid Funding · Trader Playbook`, M_LEFT, PAGE_H - 40, { width: CONTENT_W / 2, align: "left", lineBreak: false });
  doc.fillColor(SUBTLE).font("Helvetica").fontSize(8.5)
    .text(`${currentPage} / ${totalPages}`, PAGE_W - M_RIGHT - 60, PAGE_H - 40, { width: 60, align: "right", lineBreak: false });
  doc.fillColor(TEXT);
}

/**
 * Render a table with dynamic row heights and repeated headers.
 * cols: [{ key, label, width, align }]
 * rows: [{ key: value, ... }]
 */
function table(cols, rows, opts = {}) {
  const headH = 28;
  const minRowH = opts.rowH || 22;
  const totalW = cols.reduce((a, c) => a + c.width, 0);

  const rowHeights = rows.map((row) => {
    let maxH = minRowH;
    cols.forEach((c) => {
      const val = String(row[c.key] ?? "");
      const isHighlight = row._highlight && c.key === cols[0].key;
      doc.font(isHighlight ? "Helvetica-Bold" : "Helvetica").fontSize(9.4);
      const h = doc.heightOfString(val, { width: c.width - 16, lineGap: 1.5 }) + 12;
      maxH = Math.max(maxH, h);
    });
    return Math.ceil(maxH);
  });

  const fullTableH = headH + rowHeights.reduce((a, b) => a + b, 0) + 10;
  if (fullTableH < FLOW_BOTTOM - 64 && doc.y + fullTableH > FLOW_BOTTOM) pageBreak();

  let y = doc.y;

  const drawHeader = () => {
    let x = M_LEFT;
    doc.rect(M_LEFT, y, totalW, headH).fill(ROW_HEAD);
    cols.forEach((c) => {
      doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(9).text(
        c.label, x + 8, y + 8,
        { width: c.width - 16, align: c.align || "left", lineBreak: false }
      );
      x += c.width;
    });
    y += headH;
  };

  drawHeader();

  rows.forEach((row, i) => {
    const rh = rowHeights[i];
    if (y + rh > FLOW_BOTTOM) {
      pageBreak();
      y = doc.y;
      drawHeader();
    }
    if (i % 2 === 1) doc.rect(M_LEFT, y, totalW, rh).fill(ROW_ALT);

    let cx = M_LEFT;
    cols.forEach((c) => {
      const val = row[c.key];
      const isHighlight = row._highlight && c.key === cols[0].key;
      doc.fillColor(isHighlight ? PRIMARY : TEXT)
        .font(isHighlight ? "Helvetica-Bold" : "Helvetica")
        .fontSize(9.4)
        .text(String(val ?? ""), cx + 8, y + 6, {
          width: c.width - 16,
          align: c.align || "left",
          lineGap: 1.5,
          height: rh - 10
        });
      cx += c.width;
    });
    doc.rect(M_LEFT, y + rh - 0.5, totalW, 0.4).fill("#E8E8F0");
    y += rh;
  });

  doc.y = y + 8;
  doc.fillColor(TEXT);
}

function statPanel(items) {
  const gap = 12;
  const w = (CONTENT_W - gap * (items.length - 1)) / items.length;
  const h = 70;
  ensureSpace(h + 14);
  const startY = doc.y;
  let x = M_LEFT;
  items.forEach((it) => {
    doc.rect(x, startY, w, h).fill("#F4F4FA");
    doc.rect(x, startY, 4, h).fill(ACCENT);
    doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(20).text(it.value, x + 14, startY + 12, { width: w - 22, height: 26 });
    doc.fillColor(SUBTLE).font("Helvetica").fontSize(8.2).text(it.label.toUpperCase(), x + 14, startY + 41, { width: w - 22, height: 22, characterSpacing: 1 });
    x += w + gap;
  });
  doc.y = startY + h + 10;
  doc.fillColor(TEXT);
}

function bigCTA(headline, subline, url) {
  const h = 76;
  ensureSpace(h + 16);
  const y = doc.y + 6;
  doc.rect(M_LEFT, y, CONTENT_W, h).fill(BG_DARK);
  doc.rect(M_LEFT, y, 6, h).fill(ACCENT);
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(14).text(headline, M_LEFT + 18, y + 12, { width: CONTENT_W - 28, height: 20 });
  doc.fillColor("#B8B8D0").font("Helvetica").fontSize(9.5).text(subline, M_LEFT + 18, y + 34, { width: CONTENT_W - 28, height: 18 });
  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(8.5).text(url, M_LEFT + 18, y + 56, { width: CONTENT_W - 28, height: 12 });
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
  "A practical operating manual for trader identity, market fit, risk, and funded-program rules.\nUseful before you buy anything - and designed to stay useful after you do.",
  64, 360, { lineGap: 5, width: 480 }
);

// trust strip
doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(9).text("INSIDE THIS PLAYBOOK", 64, 510, { characterSpacing: 2.5 });
const insideItems = [
  ["Trader DNA + market-fit decision framework", "Position sizing + drawdown worked examples"],
  ["Five market paths: FX, Crypto, Futures, Equities, Prediction", "AI Market Radar as a research queue"],
  ["A 30-day practice-first trader build", "How to build a TradeHouse responsibly"],
];
let insideY = 532;
insideItems.forEach(([a, b]) => {
  doc.fillColor("#FFFFFF").font("Helvetica").fontSize(11).text(`• ${a}`, 64, insideY, { width: 230 });
  doc.fillColor("#FFFFFF").font("Helvetica").fontSize(11).text(`• ${b}`, 310, insideY, { width: 240 });
  insideY += 22;
});

doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(11).text("HYBRIDFUNDING.CO", 64, 684, { characterSpacing: 3, lineBreak: false });
doc.fillColor("#6F6F8A").font("Helvetica").fontSize(9).text("Know your style. Choose your market. Protect capital.", 64, 704, { lineBreak: false });
pageBreak();

// ============== TOC ==============
h1("Table of contents");
const tocRows = [
  ["01", "Quick Reference Card", "The current market-access map and core risk concepts."],
  ["02", "Know Your Trader DNA", "Sniper, Architect, Hybrid, Phoenix + a market-fit decision tree."],
  ["03", "The 5 rules every trader memorizes", "Profit Target, Drawdown, Daily Limit, Window, Consistency."],
  ["04", "Position sizing", "Risk-first sizing math and account-level examples."],
  ["05", "Trailing max drawdown", "Worked geometry of the rule that breaks traders."],
  ["06", "Forex playbook", "Programs, leverage, session rules, and workflow fit."],
  ["07", "Crypto playbook", "24/7 markets, leverage, caps, and weekend behavior."],
  ["08", "Futures 4-Phase playbook", "Phase rules, contract limits, payouts, and platforms."],
  ["09", "Single Session Equities", "GooeyPro, S&P 100, 09:30-15:55 ET."],
  ["10", "Prediction Markets", "Yes/No mechanics, rules, and AI Market Radar."],
  ["11", "Add-on decision tree", "When optional features fit your actual workflow."],
  ["12", "How traders breach", "Common failure patterns and operational fixes."],
  ["13", "Why the Hybrid ecosystem is different", "Five market paths, tools, and transparent rule education."],
  ["14", "30-Day Trader Build", "Observe, test, execute with limits, then decide what to buy."],
  ["15", "Payout planning + scaling", "How to scale responsibility without fantasy income math."],
  ["16", "Build a TradeHouse", "Affiliate tiers, partner standards, and community leadership."],
  ["17", "TradeHouse Battles", "Use competition for reps, accountability, and community."],
  ["18", "Your next move", "DNA, Playbook, rules, markets, Battles, and partner program."],
];
table(
  [
    { key: "no", label: "#", width: 40, align: "left" },
    { key: "title", label: "SECTION", width: 210, align: "left" },
    { key: "sub", label: "WHAT'S IN IT", width: 234, align: "left" },
  ],
  tocRows.map(([no, title, sub]) => ({ no, title, sub })),
  { rowH: 24 }
);
doc.moveDown(0.5);
callout("How to use this guide", "Start with Trader DNA and the market-fit section. Then read the risk pages before the program pages. The goal is to choose rules that fit your process - not force your process into the cheapest plan.");
pageBreak();

// ============== QUICK REFERENCE CARD ==============
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

statPanel([
  { value: "10%", label: "Prediction Eval Target" },
  { value: "3%", label: "Prediction Daily DD" },
  { value: "6%", label: "Prediction Max DD" },
  { value: "0.5%", label: "Max Profit / Event" },
]);

h2("Market access lineup at a glance");
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
    { asset: "Futures", platform: "Tradovate · Volumetrica · DXtrade Futures", leverage: "Per instrument", window: "Program/session rules apply" },
    { asset: "SS Equities", platform: "GooeyPro", leverage: "2:1", window: "09:30 - 15:55 ET only" },
    { asset: "Prediction Markets", platform: "Hybrid prediction dashboard", leverage: "None", window: "Market-dependent" },
  ],
);

callout("Pin this", "If you remember nothing else: don't oversize, get to your trailing-DD lock threshold first, then ladder up to the profit target. That's how the playbook ends well.");
pageBreak();

// ============== TRADER DNA ==============
h1("02  ·  Know Your Trader DNA");
eyebrow("Identity before product");
p("Before choosing an account, identify how you naturally make decisions. Hybrid Funding's Trader DNA assessment uses four archetypes as a conversation starter - not a diagnosis and not a promise that one program will fit you.");

table(
  [
    { key: "type", label: "TYPE", width: 92, align: "left" },
    { key: "edge", label: "NATURAL EDGE", width: 140, align: "left" },
    { key: "risk", label: "COMMON RISK", width: 130, align: "left" },
    { key: "question", label: "ASK YOURSELF", width: 122, align: "left" },
  ],
  [
    { type: "Sniper", edge: "Patience and selectivity", risk: "Too few reps / hesitation", question: "Can I wait without forcing?" },
    { type: "Architect", edge: "Systems and repeatability", risk: "Rigidity when conditions change", question: "Do I follow tested rules?" },
    { type: "Hybrid", edge: "Adaptability", risk: "Style sprawl / weak guardrails", question: "What stays fixed when I adapt?" },
    { type: "Phoenix", edge: "Speed and resilience", risk: "Overtrading after emotion", question: "Can I cap aggression?" },
  ],
  { rowH: 34 }
);

h2("Market-fit decision tree");
bullet("If your edge is event research, news, sports, economics, or probability: study Prediction Markets.");
bullet("If you want U.S. large-cap stocks with a defined intraday session and no overnight positions: study Single Session Equities.");
bullet("If you prefer CME-style products, contract sizing, and structured sessions: study Futures.");
bullet("If you trade currencies, metals, and macro relationships: study Forex.");
bullet("If you want 24/7 digital-asset markets and can manage continuous volatility: study Crypto.");

callout("Do not let the quiz buy for you", "Trader DNA narrows the questions. Your actual choice should still be based on your tested strategy, schedule, risk tolerance, platform needs, and the current rules.");
bigCTA("Take the Trader DNA test", "8 questions. Use the result as a starting point for market and risk-fit research.", "https://www.hybridfunding.co/dna-test");
pageBreak();

// ============== RULE 1-5 (RESTRUCTURED) ==============
h1("03  ·  The 5 rules every trader memorizes");
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
    { program: "Forex Instant Funding", target: "No evaluation profit target", phases: "0", split: "80%" },
    { program: "Forex Instant Funding Lite", target: "No target", phases: "0", split: "80%" },
    { program: "Crypto 1-Step", target: "9%", phases: "1", split: "90%" },
    { program: "Crypto 2-Step", target: "6% → 9%", phases: "2", split: "90%" },
    { program: "Futures Funded (4-Phase)", target: "9% per phase", phases: "4", split: "90%" },
    { program: "Single Session Equities", target: "10% (Eval only)", phases: "1", split: "80%" },
    { program: "Prediction Markets", target: "10% (Eval only)", phases: "1", split: "75%*" },
  ],
  { rowH: 22 }
);
pSoft("*Prediction Markets currently starts at 75/25 and offers a 90/10 add-on. Other splits and add-on pricing vary by program; verify current terms.");

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
    { program: "Prediction Markets", type: "Trailing", amt: "6% equity high" },
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
    { program: "Prediction Markets", limit: "3% EOD equity; resets 5 PM ET" },
  ],
);

h2("Rule 4 — Trading window");
p("When you can have positions open. Violating the window = soft breach (auto-close) at best, hard breach at worst.");
bullet("Forex: 24/5. All positions auto-close 3:45pm EST Friday unless Weekend Hold add-on purchased.");
bullet("Crypto: 24/7. Weekend holds allowed.");
bullet("Futures: All positions and orders cancelled by 15:10 CST. No overnight or weekend holds.");
bullet("Single Session Equities: 09:30 - 15:55 ET only. Open past 15:55 = hard breach (Prohibited Practices).");
bullet("Prediction Markets: market availability/resolution is event-specific; evaluation timing and permitted opening-price rules still apply.");

h2("Rule 5 — Consistency");
p("Designed to filter out lucky entries. Limits how concentrated your profit can be on a single day.");
bullet("Futures Funded: best day cannot exceed 25% of total profit (need 4+ trading days minimum to clear a phase).");
bullet("Single Session Equities Funded phase: 25% Consistency Score.");
bullet("Equities also requires a minimum of 3 profitable trading days at 0.50% - both Eval and Funded.");
bullet("Prediction Markets uses a 0.5% max-profit-per-event cap to limit concentration in any single event.");
pageBreak();

// ============== POSITION SIZING ==============
h1("04  ·  Position sizing");
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
h1("05  ·  Trailing max drawdown");
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
h1("06  ·  Forex playbook");
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
h1("07  ·  Crypto playbook");
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
h1("08  ·  Futures 4-Phase playbook");
p("The Funded Futures path is a four-phase program. Current public site guidance lists Tradovate, Volumetrica, and DXtrade Futures as supported platform choices.");

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

callout("Don't forget", "Complete the required CME market-data attestation through the desktop client for your chosen Futures platform before trading. Current site guidance says this step cannot be completed on mobile or web.");
pageBreak();

// ============== EQUITIES ==============
h1("09  ·  Single Session Equities");
p("Day-trade available S&P 100 equity products on GooeyPro. All positions open and close within the same permitted trading session - flat by 15:55 ET, every day. The structure is built for traders who prefer intraday equities without overnight exposure.");

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

// ============== PREDICTION MARKETS ==============
h1("10  ·  Prediction Markets");
eyebrow("Trade defined event outcomes");
p("Prediction Markets let you take a Yes or No position on a defined real-world outcome. A share trades between $0.00 and $1.00. A winning share settles at $1.00; a losing share settles at $0.00.");

h2("How the position works");
bullet("Buy Yes if you think the event will happen.");
bullet("Buy No if you think it will not happen. There is no conventional short selling.");
bullet("Shares = order amount divided by contract price.");
bullet("Opening trades are allowed between $0.20 and $0.80. You may close at other prices after entry.");
bullet("A 1% commission applies to opening trades.");
bullet("There is no leverage - you pay for the shares you buy.");

h2("Program rules at a glance");
table(
  [
    { key: "rule", label: "RULE", width: 220, align: "left" },
    { key: "value", label: "CURRENT PUBLIC TERM", width: 264, align: "left" },
  ],
  [
    { rule: "Profit Target", value: "10% - Evaluation only" },
    { rule: "Daily Drawdown", value: "3% - EOD equity, resets 5 PM ET" },
    { rule: "Max Drawdown", value: "6% trailing equity high" },
    { rule: "Max Profit / Event", value: "0.5% of account, aggregated" },
    { rule: "Evaluation Time", value: "30 days (60 with Double Time add-on)" },
    { rule: "Opening Price Range", value: "$0.20-$0.80" },
    { rule: "Commission", value: "1% on opening trades" },
    { rule: "Leverage", value: "None" },
  ],
  { rowH: 24 }
);

h2("Worked example");
p("Buy $1,000 of Yes at $0.25 and you hold 4,000 shares before commission. If the live price rises to $0.40, the marked value is about $1,600. If the event resolves Yes, winning shares settle at $1.00. If it resolves No, Yes shares settle at $0.00. Account-level profit caps and drawdown rules still govern.");

h2("Use AI Market Radar as a research queue");
bullet("MOVER: large 24-hour probability changes on liquid markets.");
bullet("VOL SPIKE: unusually heavy volume relative to book depth without a large price move.");
bullet("DECISION: near-resolution markets that remain materially uncertain.");
bullet("BOOK CHECK: mutually exclusive outcome books whose pricing may deserve structural review.");
callout("Research, not recommendation", "Radar signals are mechanically generated research candidates. They are not financial advice, guarantees, or instructions to trade.");

bigCTA("Explore Prediction Markets", "Read the live product rules and see current markets before choosing an account.", "https://www.hybridfunding.co/predictive-markets");
pageBreak();

// ============== ADD-ONS ==============
h1("11  ·  Add-on decision tree");
p("Five add-ons priced as a percentage of plan price. Pick based on your style — not because you're hedging your own discipline.");
table(
  [
    { key: "addon", label: "ADD-ON", width: 200, align: "left" },
    { key: "cost", label: "COST", width: 80, align: "center" },
    { key: "useif", label: "USE IT IF…", width: 204, align: "left" },
  ],
  [
    { addon: "90% Profit Share Upgrade", cost: "15%", useif: "The incremental split fits your expected payout behavior and the current plan economics." },
    { addon: "Weekend Hold (Forex only)", cost: "10%", useif: "You swing trade Sunday → Friday. Skip if you scalp." },
    { addon: "Payout-on-Breach", cost: "25%", useif: "You're on a tight-rules program (SS Equities, Instant Funding). Real safety net." },
    { addon: "Lock-Upon-Payout Waiver", cost: "25%", useif: "You take small frequent payouts. Skip if you batch payouts." },
    { addon: "33% Consistency Threshold", cost: "20%", useif: "You want a looser consistency rule (cheaper to clear)." },
    { addon: "50% Consistency Threshold", cost: "35%", useif: "You have reviewed the exact rule mechanics and it matches your trading distribution." },
  ],
  { rowH: 28 }
);
pageBreak();

// ============== BREACH SCENARIOS ==============
h1("12  ·  How traders breach (and how not to)");
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
h1("13  ·  Why traders use the Hybrid ecosystem");
eyebrow("One ecosystem, multiple workflows");
p("The value is not a single account type. It is the ability to learn, compare, and operate across different market structures without pretending every trader should trade the same way.");

table(
  [
    { key: "what", label: "CAPABILITY", width: 170, align: "left" },
    { key: "why", label: "WHAT IT MEANS FOR YOU", width: 314, align: "left" },
  ],
  [
    { what: "Five market paths", why: "Forex, Crypto, Futures, Single Session Equities, and Prediction Markets give traders multiple ways to express an edge." },
    { what: "Trader DNA", why: "An identity framework that helps you ask better questions about patience, discipline, adaptability, and aggression before choosing a product." },
    { what: "AI Market Radar", why: "A prediction-market research queue for movers, unusual volume, decision windows, and book checks - not a trade-signal promise." },
    { what: "Multi-platform access", why: "Use supported third-party platforms that match the relevant program instead of learning one proprietary interface for everything." },
    { what: "Transparent education", why: "Rules, worked examples, FAQs, and this playbook are designed to make the operating constraints visible before you trade." },
    { what: "TradeHouse ecosystem", why: "Battles, community, and partner tools let traders practice, learn together, and build market-specific groups." },
  ],
  { rowH: 40 }
);
pageBreak();

// ============== 30-DAY ROADMAP ==============
h1("14  ·  30-Day Trader Build");
p("This roadmap starts before purchase. The goal is to prove your process in a demo or low-stakes environment, then decide whether a funded-trading program actually fits.");

h3("Week 1 - Observe + define");
bullet("Take the Trader DNA assessment and write what parts feel accurate vs. inaccurate.");
bullet("Choose one primary market to study for the month.");
bullet("Write your setup criteria, no-trade conditions, daily stop, and maximum risk per idea.");
bullet("Read the rules for the program you are considering - do not buy yet just because of a discount.");

h3("Week 2 - Test + journal");
bullet("Use a demo or practice environment where available.");
bullet("Track every setup, entry reason, stop logic, exit, and rule mistake.");
bullet("Measure average risk, average R, win rate, and maximum losing streak.");
bullet("If you cannot follow your own rules in practice, more account size will not solve the problem.");

h3("Week 3 - Execute with hard limits");
bullet("Trade only the setup(s) you documented.");
bullet("Use a fixed daily stop and a maximum number of attempts.");
bullet("Review drawdown geometry before each session so you know exactly where a breach threshold sits.");
bullet("For Prediction Markets, separate research quality from position sizing - being right about an event does not excuse oversized exposure.");

h3("Week 4 - Review + decide");
bullet("Score process compliance before P&L.");
bullet("Identify whether your actual schedule and holding behavior fit the market/program rules.");
bullet("Choose a program only if the constraints match the process you just tested.");
bullet("If the fit is poor, change the market or keep practicing. A no-purchase decision can be the correct outcome.");

callout("The goal", "At Day 30 you should have a written trading operating system. Funding is optional. Process is not.");
pageBreak();

// ============== COMPOUNDING MATH ==============
h1("15  ·  Payout planning + scaling");
p("Scaling should be earned by process quality, not projected income. More accounts create more rules, more correlation, and more operational risk.");

h2("A responsible scaling ladder");
table(
  [
    { key: "stage", label: "STAGE", width: 100, align: "left" },
    { key: "proof", label: "PROOF REQUIRED", width: 230, align: "left" },
    { key: "next", label: "NEXT ACTION", width: 154, align: "left" },
  ],
  [
    { stage: "Practice", proof: "You follow a written setup and daily stop.", next: "Keep journaling." },
    { stage: "One account", proof: "You can operate inside the rules without rule surprises.", next: "Protect consistency." },
    { stage: "First payout", proof: "You can reach eligibility without changing your risk behavior.", next: "Review, don't celebrate with size." },
    { stage: "Second account", proof: "The first account is operationally boring and repeatable.", next: "Add only if correlation is managed." },
    { stage: "Multi-market", proof: "You have a distinct edge and process for each market.", next: "Avoid duplicated exposure." },
  ],
  { rowH: 30 }
);

h2("Questions before you add size");
bullet("Am I adding capital because my process is stable, or because I want to recover faster?");
bullet("Do my accounts share the same directional risk at the same time?");
bullet("Can I monitor every platform's drawdown, session, and payout rules without confusion?");
bullet("Would one bad day across correlated positions create multiple breaches?");
bullet("Is the additional fee justified by a tested operating plan rather than an earnings projection?");

callout("No fantasy math", "This playbook intentionally avoids annual-income projections. Your job is to build a repeatable process and understand the current payout rules; results vary and losses are possible.");
pageBreak();

// ============== AFFILIATE ==============
h1("16  ·  Build a TradeHouse");
eyebrow("Affiliate + community model");
p("The next-level affiliate model is not 'drop a link.' Build a trader organization that is useful even when a member never purchases a challenge.");

h2("The TradeHouse flywheel");
p("Education -> Identity -> Specialization -> Accountability -> Competition -> Funding -> Referral -> Leadership");
bullet("Education: start every member with the free Trader Playbook.");
bullet("Identity: use Trader DNA as a discussion framework.");
bullet("Specialization: create rooms for Forex, Crypto, Futures, Single Session Equities, and Prediction Markets.");
bullet("Accountability: require a written risk plan and weekly review.");
bullet("Competition: use TradeHouse Battles as structured reps and community events.");
bullet("Leadership: members can grow into contributors, market captains, and TradeHouse leaders.");

h2("Current public affiliate tiers");
table(
  [
    { key: "tier", label: "TIER", width: 110, align: "left" },
    { key: "sales", label: "SALES VOLUME", width: 220, align: "left" },
    { key: "rate", label: "COMMISSION", width: 154, align: "right" },
  ],
  [
    { tier: "Tier 1", sales: "First 1-9 sales", rate: "5%" },
    { tier: "Tier 2", sales: "10-49 sales", rate: "10%" },
    { tier: "Tier 3", sales: "50-100 sales", rate: "15%" },
    { tier: "Tier 4", sales: "100+ sales", rate: "20%" },
  ],
  { rowH: 24 }
);
pSoft("The current public Affiliate page also advertises weekly payouts. Your affiliate dashboard, partner agreement, and current published terms govern if the program changes.");

h2("Partner standard");
bullet("Disclose the affiliate relationship clearly near endorsements and links.");
bullet("Use current rules, prices, platforms, and payout terms.");
bullet("Never promise funding, profitability, payouts, pass rates, or risk-free outcomes.");
bullet("Label hypothetical payout or earnings math as an example - never as an expected result.");
bullet("Describe AI Market Radar as a research tool, not a prediction guarantee.");
bullet("Use email and SMS only with the permissions, opt-outs, and advertising disclosures required for your audience.");

bigCTA("Apply to the partner program", "Build an audience, a website placement, or a TradeHouse around education-first market access.", "https://www.hybridfunding.co/affiliate");
pageBreak();

// ============== BATTLES ==============
h1("17  ·  TradeHouse Battles");
eyebrow("Competition as practice");
p("TradeHouse Battles is Hybrid Funding's competitive trading arena. Use it as a community and accountability layer: practice decision-making under pressure, compare performance, and participate in current published events.");

h2("How to use Battles well");
bullet("Treat the event rules like an evaluation rulebook: read them before the first trade.");
bullet("Score discipline and risk control, not just leaderboard position.");
bullet("Review your best and worst decisions after the event.");
bullet("Use team formats to create TradeHouse accountability and market-specific crews.");
bullet("Check the current event page for active formats, eligibility, and published prizes - these can change.");

callout("Competition is not permission to overtrade", "A leaderboard can reward aggression emotionally. Keep the same daily stop and risk limits you would use outside the event.");

bigCTA("See current Battles", "Review the live event details, rules, and available rewards.", "https://www.hybridfunding.co/battles");
pageBreak();

// ============== NEXT MOVE ==============
h1("18  ·  Your next move");
p("Choose the next step that solves your actual problem. You do not need to buy anything to keep learning.");

h2("1. Learn your Trader DNA");
pSoft("Use the assessment to surface your decision-making tendencies and risk questions.");
bigCTA("Take Trader DNA", "Sniper · Architect · Hybrid · Phoenix", "https://www.hybridfunding.co/dna-test");

h2("2. Compare the five market paths");
pSoft("Forex · Crypto · Futures · Single Session Equities · Prediction Markets");
bigCTA("Explore current programs", "Read the market and program details before choosing an account.", "https://www.hybridfunding.co/challenges");

h2("3. Study Prediction Markets + Radar");
pSoft("Learn Yes/No mechanics, then use AI Market Radar as a research queue.");
bigCTA("Explore Prediction Markets", "Live markets, rules, and research tools.", "https://www.hybridfunding.co/predictive-markets");

h2("4. Read the current FAQ");
pSoft("Rules and platform details can change. The live FAQ should beat an old screenshot.");
bigCTA("Read the FAQ", "Cross-check targets, drawdowns, payouts, and platform rules.", "https://www.hybridfunding.co/faq");

h2("5. Join or build a TradeHouse");
pSoft("Use the Playbook, market rooms, weekly scorecards, and Battles to build accountability.");
bigCTA("See TradeHouse Battles", "Competition + community without replacing your risk plan.", "https://www.hybridfunding.co/battles");

h2("6. Become a partner");
pSoft("If you already teach, publish, run a community, or own a trading website, use the partner program to build a tracked education-first funnel.");
bigCTA("Explore the partner program", "Current public tiers, partner tools, and TradeHouse model.", "https://www.hybridfunding.co/affiliate");

h2("Share this playbook");
p("If this helped you, send it to one trading friend. Forwarding link:");
doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(12).text("hybridfunding.co/playbook", { align: "center" }).moveDown(0.6);
doc.fillColor(TEXT_SOFT).font("Helvetica-Oblique").fontSize(10).text(
  "Educational material only. Trading involves risk of loss. Program rules and availability can change; verify current terms at hybridfunding.co. © Hybrid Funding LLC.",
  { align: "center" }
);

doc.end();
console.log("Wrote", OUT);

const Post = () => (
  <>
    <p className="lead">
      Futures prop firm programs are dense with rules — trailing drawdowns, consistency requirements, contract limits, payout phases. Hybrid Funding's 4-Phase Funded Futures Plan is one of the more transparent in the space, and Tradovate platform integration is on the way for traders who prefer it over Rithmic. Here's the full picture.
    </p>

    <h2>The 4-Phase structure</h2>
    <p>
      The Funded Futures Plan moves through four phases. Each phase has the same numbers:
    </p>
    <ul>
      <li><strong>Profit target:</strong> 9% of starting balance.</li>
      <li><strong>Maximum trailing loss:</strong> 5% (trailing on End of Day balance, locks at starting balance once you reach +5%).</li>
      <li><strong>Consistency requirement:</strong> 25%. Your best trading day's profit cannot exceed 25% of your total profit. With a 25% requirement you need at least 4 trading days (100% / 25% = 4) to clear the phase.</li>
    </ul>
    <p>
      After Phase 4, you transition to a Live Funded account with a 90% profit split.
    </p>

    <h2>Trailing loss math (this is where most traders get confused)</h2>
    <p>
      Maximum Trailing Loss trails using End of Day balance, not intraday equity. End of Day is defined as 1600 CST. Worked example on a $100K account:
    </p>
    <ol>
      <li>Starting balance $100,000, Trailing Loss threshold = $95,000.</li>
      <li>EOD day one: $102,000 closed balance. Trailing Loss threshold trails up to $97,000.</li>
      <li>EOD day two: $104,000. Trailing Loss threshold = $99,000.</li>
      <li>EOD day three: $105,000 (+5%). Trailing Loss locks permanently at $100,000.</li>
      <li>From here on, you can drawdown to your starting balance and continue trading. Anything below $100,000 is a hard breach.</li>
    </ol>
    <p>
      Note: intraday equity does not trail the threshold. Only the closed EOD balance does. Holding a winner overnight without closing it doesn't help your trailing.
    </p>

    <h2>Contract limits per account size</h2>
    <ul>
      <li>$25K — 1 standard / 15 micro contracts</li>
      <li>$50K — 3 standard / 30 micro</li>
      <li>$100K — 6 standard / 60 micro</li>
      <li>$150K — 9 standard / 90 micro</li>
    </ul>

    <h2>Payouts at each phase</h2>
    <p>
      Funded Futures has built-in phase payouts that scale with account size. On a $25K:
    </p>
    <ul>
      <li>Phase 1: $500</li>
      <li>Phase 2: $750</li>
      <li>Phase 3: $750</li>
      <li>Phase 4: $1,500</li>
    </ul>
    <p>
      Larger accounts pay proportionally more. Once you transition to the Live Funded account after Phase 4, you're on the standard 90% split with normal withdrawal cadence.
    </p>

    <h2>Weekend and overnight rules</h2>
    <p>
      All positions must be closed and all open orders cancelled at 15:10 CST each weekday. No overnight or weekend holds on the Futures program. This is non-negotiable for a futures prop firm and protects everyone from gap risk.
    </p>

    <h2>The CME data attestation</h2>
    <p>
      Before you can trade, you must complete the CME market data attestation through R | Trader Pro on desktop. This cannot be done on mobile or web. Once completed in R | Trader Pro, you can use mobile or web platforms. You must attest as a non-professional user.
    </p>

    <h2>Tradovate integration is coming</h2>
    <p>
      Today, Futures runs on Rithmic Pro. Tradovate platform integration is in development and will be available to all Funded Futures traders. We'll publish a migration guide when it ships — same rules, same payouts, just an additional platform option.
    </p>

    <h2>The bottom line</h2>
    <p>
      The 4-Phase plan rewards consistency and discipline. Don't try to clear the 9% target on day one with maxed contracts — you'll either hit the 5% trailing on a small adverse move or fail the 25% consistency rule. Spread your risk over 6–10 trading days per phase, hold contract size to roughly half your maximum, and the structure pays out at every phase.
    </p>
    <p>
      Ready? <a href="/challenges">Pick your tier</a>.
    </p>
  </>
);

export default Post;

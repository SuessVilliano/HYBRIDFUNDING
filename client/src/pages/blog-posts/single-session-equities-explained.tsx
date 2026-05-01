const Post = () => (
  <>
    <p className="lead">
      Single Session Equities is a new asset class at Hybrid Funding for traders who want to day-trade U.S. blue-chip equities without overnight risk. Every position opens and closes inside the same trading session — you're flat by 15:55 ET, every day. This post walks through the rules, the math behind the drawdown, and a worked example on a $100K account.
    </p>

    <h2>What you can trade</h2>
    <ul>
      <li><strong>Universe:</strong> any S&P 100 equity product made available on the platform.</li>
      <li><strong>Platform:</strong> GooeyPro (the only platform supported for this program).</li>
      <li><strong>Liquidity:</strong> sourced directly from Nasdaq.</li>
      <li><strong>Leverage:</strong> up to 2:1.</li>
      <li><strong>Commissions:</strong> $0.02 per share per side, with a $0.50 minimum per transaction.</li>
    </ul>
    <p>
      We always say "Single Session Equities," not "stocks" — because the program isn't designed for overnight stock trading. It's a same-session day-trading product on equity instruments.
    </p>

    <h2>The trading window</h2>
    <p>
      The permitted session is <strong>09:30 ET through 15:55 ET</strong>. Although U.S. equities trade in pre-market and extended hours, you cannot use those windows under this program. All positions must be fully closed by 15:55 ET. The platform will attempt to auto-close at the cutoff, but it's the trader's responsibility to be flat — a position open past 15:55 is treated as a Prohibited Practices violation and a hard breach.
    </p>

    <h2>The math: profit target, drawdown, daily limits</h2>
    <ul>
      <li><strong>Profit target (Evaluation only):</strong> 10% returns to progress to Funded.</li>
      <li><strong>Max drawdown:</strong> 3.0% trailing on closed balance, locks at starting balance once you hit +3%.</li>
      <li><strong>Daily drawdown:</strong> 2.5% trailing intraday.</li>
      <li><strong>Daily profit cap:</strong> 2.5% (Evaluation only — soft breach, not a hard one).</li>
      <li><strong>Minimum profitable trading days:</strong> 3 days at 0.50% — applies to both Evaluation and Funded phases.</li>
      <li><strong>Profit split:</strong> 80% / 20% in your favor.</li>
      <li><strong>Payout cadence:</strong> 14 days initial, then every 14 days.</li>
      <li><strong>Minimum withdrawal:</strong> $100.</li>
      <li><strong>Consistency Score:</strong> 25% (Funded phase only — the best day cannot exceed 25% of total profit).</li>
      <li><strong>Lock upon payout:</strong> yes, unless you purchase the 25% waiver add-on.</li>
      <li><strong>Payout on breach:</strong> none, unless you purchase the 25% add-on.</li>
    </ul>

    <h2>Worked example on a $100K account</h2>
    <p>
      Starting balance: $100,000. Starting Max Drawdown threshold: $97,000. Daily Drawdown: $2,500. Daily Profit Cap: $2,500.
    </p>
    <ol>
      <li>You make $2,000 on day one. Closed balance is $102,000. New high-water mark = $102,000. Max DD threshold trails up to $99,000.</li>
      <li>Day two you take a $1,500 loss. Closed balance $100,500. Max DD threshold stays at $99,000 (it only trails up).</li>
      <li>Day three you make another $2,500. Closed balance $103,000. Max DD threshold locks at the starting balance of $100,000 — permanently.</li>
      <li>You now have a free-roll on the remaining 7% of profit target with a hard floor at $100,000. Risk parameters tighten only on the daily side.</li>
    </ol>

    <h2>Add-ons that change the program</h2>
    <p>
      Five add-ons are priced as a percentage of plan price:
    </p>
    <ul>
      <li>90% Profit Share Upgrade — 15%</li>
      <li>33% Consistency Threshold — 20% (looser consistency requirement)</li>
      <li>50% Consistency Threshold — 35% (tighter)</li>
      <li>Payout-on-Breach — 25%</li>
      <li>Lock-Upon-Payout Waiver — 25%</li>
    </ul>

    <h2>Who Single Session Equities is built for</h2>
    <p>
      Day traders who already trade equities but want firm capital. Traders who don't want to manage overnight gap risk. Traders who like the structure of a hard close at 15:55 ET. If you scalp opens and reversals on names like AAPL, MSFT, NVDA, JPM, or XOM, this product is built for your style.
    </p>
    <p>
      <a href="/challenges">See pricing and start a challenge</a>, or read the full <a href="/faq">FAQ</a>.
    </p>
  </>
);

export default Post;

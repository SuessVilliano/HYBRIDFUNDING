const Post = () => (
  <>
    <p className="lead">
      Most 1-Step failures aren't from bad trades — they're from breaching the trailing max drawdown by half a percent on an otherwise green week. If you understand the geometry of the trailing DD and the psychology of when traders blow up, the 1-Step Forex challenge becomes a math problem, not a gamble.
    </p>

    <h2>The 1-Step rules at a glance</h2>
    <ul>
      <li><strong>Profit target:</strong> 10% of starting balance.</li>
      <li><strong>Max drawdown:</strong> 6% trailing on closed balance until you reach +6%, then it locks at the starting balance.</li>
      <li><strong>Daily loss limit:</strong> none on 1-Step (different from 2-Step's 4% daily).</li>
      <li><strong>Leverage:</strong> 1:20 on Forex 1-Step.</li>
      <li><strong>Weekend hold:</strong> not allowed unless you buy the add-on. Positions auto-close at 3:45pm EST Friday.</li>
      <li><strong>Inactivity:</strong> at least one trade every 30 days.</li>
    </ul>
    <p>
      The full rule list lives on the <a href="/faq">FAQ page</a>. This post is about how the rules interact under real trading conditions.
    </p>

    <h2>The trailing drawdown is the only rule that matters</h2>
    <p>
      The 6% trailing max drawdown is calculated on your <em>closed</em> balance, not your equity. Two consequences most traders miss:
    </p>
    <ol>
      <li>
        Open floating profit doesn't trail the DD up. Only when you close the trade does the high-water mark move. Translation: holding a winner doesn't tighten your stop, but locking it in does.
      </li>
      <li>
        Once your closed balance reaches +6%, the trailing locks at the starting balance forever. After that, you're trading against a static $94,000 floor on a $100,000 account.
      </li>
    </ol>
    <p>
      The play: get to +6% closed balance as fast as you can with disciplined sizing. Once you're locked, the rest of the challenge is a free-roll on the +4% you still need to hit the 10% target.
    </p>

    <h2>Position sizing: the boring math that decides everything</h2>
    <p>
      On a $25K account with 1:20 leverage and a typical 30-pip stop on a major pair, 1 standard lot is a notional of $100K — which is 4× the account. A 30-pip loss at 1 lot is roughly $300, or 1.2% of the account. Two losing 1-lot trades and you're at -2.4%. Three more and you're four ticks from a hard breach.
    </p>
    <p>
      The traders who pass 1-Step generally risk 0.25%–0.5% per trade, which translates to 0.2–0.4 lots on a $25K with a 30-pip stop. That's slow. That's the point. You only need ~25 1R wins to clear the target if you risk 0.4% per trade — and you can absorb 15 losses to get there.
    </p>

    <h2>The Friday close trap</h2>
    <p>
      All Forex positions auto-close at 3:45pm EST Friday. This is a soft breach, not a hard one — your account isn't terminated. But if you're +0.8% on a Friday afternoon swing trade and the market gaps against you Sunday, the auto-close locked in your gain at exactly the wrong moment. The Weekend Hold add-on (10% of plan price) is worth it if you trade swings; skip it if you scalp London/NY sessions only.
    </p>

    <h2>Three patterns that pass</h2>
    <ul>
      <li><strong>The London open scalper:</strong> 0.3%–0.5% risk per trade, 1–3 setups a session, out by 11:00 EST. Rarely holds anything overnight. Hits +6% in 8–12 trading days.</li>
      <li><strong>The NY-session momentum trader:</strong> Watches the 9:30 cash open and the 10:00 economic release. 2–4 setups a week, 1.5–2R targets. Slower path to +6% but rare drawdown excursions.</li>
      <li><strong>The swing setup trader:</strong> One or two pairs, weekly chart bias, daily entries. Buys the Weekend Hold add-on. Usually clears the challenge in 4–6 weeks but with the smoothest equity curve.</li>
    </ul>

    <h2>The bottom line</h2>
    <p>
      The 1-Step Forex challenge isn't a sniper test. It's a discipline test wearing a leverage costume. Risk small, get to +6% to lock the floor, then ladder up to +10%. The trailing DD is your only enemy until it isn't.
    </p>
    <p>
      Ready to put it into practice? <a href="/challenges">Pick your tier</a> and start.
    </p>
  </>
);

export default Post;

import { Link } from "wouter";

const NewFeaturesUpdate = () => (
  <>
    <p>
      Hybrid Funding is rolling out four major checkout and payout upgrades: <strong>Bundles</strong>, <strong>Customer Credit</strong>, a new <strong>Rapid Payout</strong> add-on, and a multi-item <strong>Cart</strong>.
    </p>
    <p>
      The rollout was announced on September 23, 2026 and is scheduled to be enabled within the next 10 business days. The new features require the new dashboard experience, so availability may appear at different times during the rollout window.
    </p>

    <h2>1. Bundles: buy 3 or 5 challenges together</h2>
    <p>
      Instead of checking out one challenge at a time, traders will be able to purchase multiple challenges in one grouped order. Each account remains a normal, separate trading account with its own login, dashboard, and rules.
    </p>
    <ul>
      <li><strong>Buy 3 challenges:</strong> receive the Bi-Weekly Rapid Payout add-on at no extra charge.</li>
      <li><strong>Buy 5 challenges:</strong> receive the Weekly Rapid Payout add-on at no extra charge.</li>
    </ul>
    <p>
      Bundle purchases still count toward the maximum allocation limit of <strong>$1 million per customer</strong>. Because of that limit, bundles of 3 are not available for plans starting above $250K, and bundles of 5 are not available for plans starting above $150K.
    </p>

    <h2>2. Customer Credit: turn a payout into more buying power</h2>
    <p>
      Traders will be able to choose Customer Credit instead of a standard payout and use that credit toward future Hybrid Funding challenges.
    </p>
    <ul>
      <li><strong>Higher profit share:</strong> choosing Customer Credit adds 10 percentage points to the trader profit share. For example, an 80/20 split becomes 90/10.</li>
      <li><strong>365-day validity:</strong> issued credit remains valid for one year.</li>
      <li><strong>Flexible checkout:</strong> use part of the credit or all of it.</li>
      <li><strong>Stacks with discounts:</strong> Customer Credit can be combined with eligible discount codes.</li>
    </ul>

    <h2>3. Rapid Payout: choose how fast you want payout access</h2>
    <p>
      Rapid Payout is a new paid add-on for traders who want a faster payout cadence.
    </p>
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr><th>Payout frequency</th><th>Add-on price</th></tr>
        </thead>
        <tbody>
          <tr><td>Bi-weekly</td><td>+5%</td></tr>
          <tr><td>Weekly</td><td>+10%</td></tr>
          <tr><td>Daily</td><td>+15%</td></tr>
        </tbody>
      </table>
    </div>
    <p>
      Bundle perks can include Rapid Payout at no extra charge: the 3-pack includes bi-weekly and the 5-pack includes weekly.
    </p>

    <h2>4. Cart: multiple purchases, one transaction</h2>
    <p>
      The new cart lets traders add several eligible items and pay once, making it easier to build a complete setup without repeating checkout for every purchase.
    </p>

    <h2>What happens next?</h2>
    <p>
      Hybrid Funding is preparing the new dashboard experience required for these features. During the rollout, you may see some of these options before others. We will keep this page updated as availability changes.
    </p>

    <div className="mt-8 rounded-xl border border-accent/30 bg-accent/10 p-5">
      <strong>Want to compare challenge options now?</strong>
      <p className="mt-2">
        <Link href="/challenges">View current Hybrid Funding challenges</Link>. Existing September promotional codes remain separate from these new features and apply according to their own terms.
      </p>
    </div>
  </>
);

export default NewFeaturesUpdate;

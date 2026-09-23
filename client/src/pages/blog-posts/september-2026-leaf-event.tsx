import { Link } from "wouter";

const SeptemberLeafEvent = () => (
  <>
    <p>
      The September LEAF Event is Hybrid Funding's current month-long promotion, running through <strong>September 30, 2026</strong>.
    </p>

    <h2>Two codes, depending on the plan</h2>
    <ul>
      <li><strong>LEAF40:</strong> 40% off eligible evaluation plans. This code does not apply to Instant Funding or Instant Funding Lite.</li>
      <li><strong>LEAF25:</strong> 25% off Instant Funding and Instant Funding Lite.</li>
    </ul>

    <p>
      Choose the code that matches the plan in your cart. Promotional eligibility is based on the selected product, and the promotion ends September 30.
    </p>

    <h2>New features can work alongside promotions</h2>
    <p>
      Customer Credit is designed to stack with discount codes once that feature is available. Bundles, Customer Credit, Rapid Payout and Cart are rolling out separately during the new dashboard rollout.
    </p>

    <div className="mt-8 rounded-xl border border-accent/30 bg-accent/10 p-5">
      <strong>Ready to compare plans?</strong>
      <p className="mt-2"><Link href="/challenges">See current challenge options and pricing</Link>.</p>
    </div>
  </>
);

export default SeptemberLeafEvent;

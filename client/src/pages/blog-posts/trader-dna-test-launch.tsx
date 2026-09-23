import { Link } from "wouter";

export default function TraderDnaTestLaunch() {
  return (
    <>
      <p className="lead">
        On June 15, 2026, Hybrid Funding launched the Trader DNA Test — an interactive assessment designed to identify a trader's behavioral style and connect that profile to a more suitable funding path.
      </p>
      <h2>Four trader archetypes</h2>
      <p>
        The first release introduced four profiles: The Sniper, The Architect, The Hybrid, and The Phoenix. The assessment focused on patience, discipline, adaptability, aggression, decision-making, and response to drawdown.
      </p>
      <h2>From quiz to acquisition funnel</h2>
      <p>
        The DNA Test later evolved into a full lead-generation funnel with CRM capture, preferred-market segmentation, personalized funding routes, attribution tracking, and affiliate-ready referral parameters.
      </p>
      <p><Link href="/dna-test">Take the Trader DNA Test</Link>.</p>
    </>
  );
}
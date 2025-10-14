export default function PrivacyArticle() {
  return (
    <article className="prose max-w-2xl py-10">
      <h1>Privacy & data</h1>
      <p>High-level overview of what we collect and why.</p>
      <ul>
        <li>Telemetry: pageviews & CTA clicks (PostHog).</li>
        <li>No secrets in client; requests proxied via server.</li>
      </ul>
    </article>
  );
}

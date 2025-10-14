export default function SecurityPage() {
  return (
    <section className="py-12">
      <h1 className="text-3xl font-bold">Security</h1>
      <ul className="mt-3 list-disc pl-6 text-gray-700">
        <li>No API keys in the client; server-side proxy for model calls.</li>
        <li>Key rotation & least privilege for secrets.</li>
        <li>FERPA-aware data practices for EDU pilots.</li>
      </ul>
    </section>
  );
}

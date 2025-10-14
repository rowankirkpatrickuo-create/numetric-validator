"use client";
export function ManageBillingButton() {
  return (
    <button
      className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
      onClick={async () => {
        const r = await fetch("/api/stripe/portal", { method: "POST" });
        const d = await r.json().catch(() => null);
        if (!r.ok || !d?.url) {
          alert(`Billing portal error: ${d?.error ?? r.statusText}`);
          return;
        }
        window.location.href = d.url;
      }}
    >
      Manage Billing
    </button>
  );
}

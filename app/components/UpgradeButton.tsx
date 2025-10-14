"use client";

export function UpgradeButton() {
  async function startCheckout() {
    try {
      const r = await fetch("/api/stripe/checkout", { method: "POST" });
      if (r.status === 401) {
        window.location.href = "/sign-in?redirect_url=/pricing";
        return;
      }
      const data = await r.json().catch(() => null);
      if (!r.ok) {
        alert(`Checkout failed: ${data?.error ?? r.statusText}`);
        console.error("Checkout error:", data);
        return;
      }
      if (!data?.url) {
        alert("Unexpected checkout response (no URL). See console.");
        console.error("Checkout response:", data);
        return;
      }
      window.location.href = data.url;
    } catch (e) {
      console.error(e);
      alert("Network error starting checkout.");
    }
  }
  return (
    <button
      className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
      onClick={startCheckout}
    >
      Upgrade to Instructor
    </button>
  );
}

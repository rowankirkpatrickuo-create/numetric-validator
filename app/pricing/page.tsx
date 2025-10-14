import { UpgradeButton } from "../components/UpgradeButton";

export default function PricingPage() {
  return (
    <section className="py-12">
      <h1 className="text-3xl font-bold">Pricing</h1>
      <p className="mt-3 text-gray-600">
        Free for students. Instructor plan unlocks assignments & dashboards.
      </p>

      <div className="mt-6">
        <UpgradeButton />
      </div>
    </section>
  );
}

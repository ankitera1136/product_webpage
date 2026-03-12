export function AdSlot({ label }: { label: string }) {
  return (
    <div className="ad-slot">
      <strong>Ad slot</strong>
      <div>{label}</div>
      <div style={{ fontSize: 12, marginTop: 6 }}>
        Replace with AdSense code when approved.
      </div>
    </div>
  );
}

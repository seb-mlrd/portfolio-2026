export default function Toggle({ name, label, initial }: { name: string; label: string; initial: boolean }) {
  return (
    <label className="flex items-center gap-3 border border-border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted cursor-pointer">
      <input type="checkbox" name={name} value="true" defaultChecked={initial} className="w-4 h-4 accent-accent" />
      {label}
    </label>
  )
}

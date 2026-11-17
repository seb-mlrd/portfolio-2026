export default function SectionHeader({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-6 mb-16">
      <span className="font-mono text-xs text-accent tracking-[0.3em]">{index}.</span>
      <h2 className="font-mono text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

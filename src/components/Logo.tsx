import logoAsset from "@/assets/miprojet-logo-official.asset.json";

export function Logo({ className = "h-10", plus = true }: { className?: string; plus?: boolean }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <img src={logoAsset.url} alt="MiProjet+" className={className} />
      {plus && (
        <span className="text-gold font-display font-bold text-2xl leading-none -ml-1">+</span>
      )}
    </div>
  );
}

import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div className="grad-sunset flex h-7 w-7 items-center justify-center rounded-lg shadow-[0_6px_24px_rgba(255,106,61,0.33)]">
        <div className="h-2.5 w-2.5 rounded-full bg-bg" />
      </div>
      <div className="font-display text-lg font-bold tracking-tight">
        meetlocal<span className="font-medium text-text-dim">.ai</span>
      </div>
    </Link>
  );
}

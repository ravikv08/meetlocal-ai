import { avatarGradient, initialsFrom } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: number;
  imageUrl?: string | null;
  ring?: boolean;
}

export function Avatar({ name, size = 40, imageUrl, ring }: AvatarProps) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{
          width: size,
          height: size,
          boxShadow: ring ? "0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-coral)" : undefined,
        }}
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-white"
      style={{
        width: size,
        height: size,
        background: avatarGradient(name),
        fontSize: size * 0.34,
        letterSpacing: -0.3,
        boxShadow: ring ? "0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-coral)" : undefined,
      }}
    >
      {initialsFrom(name)}
    </div>
  );
}

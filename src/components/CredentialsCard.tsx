import { Camera, Sparkles, GraduationCap } from "lucide-react";

interface CredentialsCardProps {
  experienceHeadline?: string | null;
  experienceBlurb?: string | null;
  careerHighlight?: string | null;
  education?: string | null;
  /** Used for the eyebrow heading: "Why book {name}" */
  name: string;
}

// Photographer-card style credentials block. Hides cleanly if no fields are
// populated (returns null) so we don't render an empty box.
export function CredentialsCard({
  experienceHeadline,
  experienceBlurb,
  careerHighlight,
  education,
  name,
}: CredentialsCardProps) {
  const hasAny =
    !!experienceHeadline || !!experienceBlurb || !!careerHighlight || !!education;
  if (!hasAny) return null;

  const firstName = name.split(" ")[0];

  return (
    <section>
      <h2 className="font-display text-2xl font-semibold tracking-tight">
        Why book {firstName}
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {experienceHeadline && (
          <Pillar
            icon={<Camera size={18} />}
            title={experienceHeadline}
            body={experienceBlurb}
          />
        )}
        {careerHighlight && (
          <Pillar
            icon={<Sparkles size={18} />}
            title="Career highlight"
            body={careerHighlight}
          />
        )}
        {education && (
          <Pillar
            icon={<GraduationCap size={18} />}
            title="Education & training"
            body={education}
          />
        )}
      </div>
    </section>
  );
}

function Pillar({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-line-2 bg-surface p-5">
      <div className="grad-sunset inline-flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-[0_6px_18px_rgba(255,106,61,0.32)]">
        {icon}
      </div>
      <div className="mt-4 font-display text-base font-semibold leading-snug">
        {title}
      </div>
      {body && (
        <p className="mt-1.5 text-sm leading-relaxed text-text-dim">{body}</p>
      )}
    </div>
  );
}

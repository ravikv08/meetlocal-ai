import { redirect } from "next/navigation";

interface BookPageProps {
  params: Promise<{ localId: string }>;
  searchParams: Promise<{ when?: string }>;
}

// Legacy route — booking now lives inline on /local/[id]. Redirect there,
// preserving the date if it was carried in the URL.
export default async function BookPage({ params, searchParams }: BookPageProps) {
  const { localId } = await params;
  const sp = await searchParams;
  const qs = sp.when ? `?when=${encodeURIComponent(sp.when)}` : "";
  redirect(`/local/${localId}${qs}`);
}

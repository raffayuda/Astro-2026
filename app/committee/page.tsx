import { redirect } from "next/navigation";

export default async function CommitteeAliasPage({
  searchParams,
}: {
  searchParams: Promise<{ division?: string }>;
}) {
  const params = await searchParams;
  const division = params.division;
  if (division) {
    redirect(`/panitia?division=${encodeURIComponent(division)}`);
  }
  redirect("/panitia");
}

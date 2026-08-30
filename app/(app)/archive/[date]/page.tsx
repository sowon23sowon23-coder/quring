import { ArchiveEntryView } from "@/components/views/ArchiveEntryView";

export default async function ArchiveEntryPage({
  params
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  return <ArchiveEntryView date={date} />;
}

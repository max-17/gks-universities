import { UniversityExplorer } from "@/components/university-explorer";
import { getUniversities } from "@/lib/university-list";
export const revalidate = 3600;
export default async function Home() {
  const universities = await getUniversities();
  return <UniversityExplorer universities={universities} />;
}

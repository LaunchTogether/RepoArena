import { ComparisonError } from "@/components/comparison/comparison-error";
import { LiveComparison } from "@/components/comparison/live-comparison";

type ComparisonPageProps = {
  params: Promise<{ slug: string[] }>;
};

export default async function ComparisonPage({ params }: ComparisonPageProps) {
  const { slug } = await params;

  if (slug.length !== 5 || slug[2] !== "vs") {
    return <ComparisonError title="This comparison URL is invalid." detail="Use the comparison form to choose two public GitHub repositories." />;
  }

  const [ownerA, repositoryA, , ownerB, repositoryB] = slug;

  return (
    <LiveComparison
      repoA={`https://github.com/${ownerA}/${repositoryA}`}
      repoB={`https://github.com/${ownerB}/${repositoryB}`}
    />
  );
}

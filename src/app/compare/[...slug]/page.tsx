import { ComparisonError } from "@/components/comparison/comparison-error";
import { LiveComparison } from "@/components/comparison/live-comparison";
import type { ComparisonIntent } from "@/types/comparison";

type ComparisonPageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ intent?: string | string[] }>;
};

const comparisonIntents: ComparisonIntent[] = ["general", "adopting_library", "contributing", "reference_project"];

function resolveIntent(value: string | string[] | undefined): ComparisonIntent {
  return typeof value === "string" && comparisonIntents.includes(value as ComparisonIntent)
    ? value as ComparisonIntent
    : "general";
}

export default async function ComparisonPage({ params, searchParams }: ComparisonPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  if (slug.length !== 5 || slug[2] !== "vs") {
    return <ComparisonError variant="invalid-url" />;
  }

  const [ownerA, repositoryA, , ownerB, repositoryB] = slug;

  return (
    <LiveComparison
      repoA={`https://github.com/${ownerA}/${repositoryA}`}
      repoB={`https://github.com/${ownerB}/${repositoryB}`}
      initialIntent={resolveIntent(query.intent)}
    />
  );
}

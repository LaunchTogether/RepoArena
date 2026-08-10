import { ComparisonError } from "@/components/comparison/comparison-error";
import { ComparisonView } from "@/components/comparison/comparison-view";
import { previewComparison } from "@/lib/preview/comparison-result";

type ComparisonPageProps = {
  params: Promise<{ slug: string[] }>;
};

export default async function ComparisonPage({ params }: ComparisonPageProps) {
  const { slug } = await params;
  const isPreviewRoute = slug.join("/") === "facebook/react/vs/vuejs/core";

  if (!isPreviewRoute) {
    return <ComparisonError title="This comparison is not ready yet." detail="The live GitHub analysis service will validate and fetch any public repository pair. For now, open the React versus Vue UI preview or return to the form." />;
  }

  return <ComparisonView result={previewComparison} />;
}

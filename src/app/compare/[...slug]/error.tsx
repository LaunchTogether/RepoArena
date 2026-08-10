"use client";

import { ComparisonError } from "@/components/comparison/comparison-error";

export default function ComparisonRouteError() {
  return <main className="comparison-loading"><ComparisonError title="The comparison could not be displayed." detail="Refresh the page or return to the repository form and try again." /></main>;
}

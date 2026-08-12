"use client";

import { ComparisonError } from "@/components/comparison/comparison-error";

export default function ComparisonRouteError() {
  return <main className="comparison-loading"><ComparisonError variant="route-error" /></main>;
}

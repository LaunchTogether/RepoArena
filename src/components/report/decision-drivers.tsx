"use client";

import type { ReportDecisionDriver } from "@/types/comparison";
import { useLocale } from "@/components/locale/locale-provider";

type DecisionDriversProps = {
  drivers: ReportDecisionDriver[];
  repoAName: string;
  repoBName: string;
};

export function DecisionDrivers({ drivers, repoAName, repoBName }: DecisionDriversProps) {
  const { messages } = useLocale();

  return (
    <section className="report-panel decision-drivers" aria-labelledby="decision-drivers-title">
      <div className="report-panel-intro">
        <p className="eyebrow">{messages.report.driversKicker}</p>
        <h2 id="decision-drivers-title">{messages.report.driversTitle}</h2>
      </div>
      {drivers.length === 0 ? (
        <p className="report-empty">{messages.report.noDrivers}</p>
      ) : (
        <ol className="decision-driver-list">
          {drivers.map((driver) => {
            const leaderName = driver.lead === "repoA" ? repoAName : repoBName;

            return (
              <li key={`${driver.category}-${driver.lead}`} className="decision-driver">
                <div>
                  <h3>{driver.label}</h3>
                  <p>{driver.detail}</p>
                </div>
                <strong>{messages.report.leads(leaderName)}</strong>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

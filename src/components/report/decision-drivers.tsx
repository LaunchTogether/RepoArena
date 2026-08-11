import type { ReportDecisionDriver } from "@/types/comparison";

type DecisionDriversProps = {
  drivers: ReportDecisionDriver[];
  repoAName: string;
  repoBName: string;
};

export function DecisionDrivers({ drivers, repoAName, repoBName }: DecisionDriversProps) {
  return (
    <section className="report-panel decision-drivers" aria-labelledby="decision-drivers-title">
      <div className="report-panel-intro">
        <p className="eyebrow">Decision drivers</p>
        <h2 id="decision-drivers-title">What drives this result</h2>
      </div>
      {drivers.length === 0 ? (
        <p className="report-empty">No decisive difference emerged from the retrieved evidence.</p>
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
                <strong>{leaderName} leads</strong>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

const metrics = [
  ["A", "Activity", "Commit and release cadence"],
  ["M", "Maintenance", "Issue and pull request hygiene"],
  ["C", "Community", "Contributor and collaboration signals"],
  ["D", "Documentation", "Readme and project guidance"],
  ["H", "Project health", "Standards, automation, and care"],
];

export function MetricsIndex() {
  return (
    <section className="metrics-section" aria-labelledby="metrics-title">
      <div className="section-intro metrics-intro">
        <p className="eyebrow">What gets measured</p>
        <h2 id="metrics-title">The parts that make a repository dependable.</h2>
      </div>
      <div className="metrics-list">
        {metrics.map(([key, title, description]) => (
          <article className="metric-row" key={key}>
            <span className="metric-key" aria-hidden="true">{key}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

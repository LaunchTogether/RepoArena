const steps = [
  ["01", "Name the contenders", "Paste two public GitHub repositories. Short owner/repo notation also works."],
  ["02", "Read the engineering signals", "Activity, maintenance, community, documentation, and project standards are weighed independently."],
  ["03", "Choose with context", "See category wins, raw signals, and the gap behind the final score."],
];

export function HowItWorks() {
  return (
    <section className="method-section" id="method" aria-labelledby="method-title">
      <div className="section-intro">
        <p className="eyebrow">The method</p>
        <h2 id="method-title">A decision trail, not a popularity contest.</h2>
      </div>
      <ol className="method-list">
        {steps.map(([number, title, description]) => (
          <li className="method-item" key={number}>
            <span className="method-number">{number}</span>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

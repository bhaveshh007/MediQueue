function FeatureCard({ icon, title, description, tag }) {
  return (
    <article className="feature-card">
      <div className="feature-header">
        <div className="feature-icon">{icon}</div>
        {tag && <span className="feature-tag">{tag}</span>}
      </div>

      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{description}</p>
      
      <div className="feature-footer">
        <span className="feature-link-text">Learn more</span>
        <svg className="feature-arrow-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </article>
  );
}

export default FeatureCard;
import React from 'react';

function AgencyBadge({ agency }) {
  if (!agency) return null;

  return (
    <span className="agency-line">
      {agency.name}
      {agency.verified && <span className="verified-badge">Verificada</span>}
    </span>
  );
}

export default AgencyBadge;


import { getBookingStatus } from '../utils/status.js';

function StatusBadge({ status }) {
  const current = getBookingStatus(status);
  return <span className={`status-pill status-${current.tone}`}>{current.label}</span>;
}

export default StatusBadge;

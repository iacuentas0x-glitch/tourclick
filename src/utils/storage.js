export function getBookings() {
  try {
    return JSON.parse(localStorage.getItem('tourclick-bookings')) || [];
  } catch {
    return [];
  }
}

export function saveBooking(booking) {
  const current = getBookings();
  const next = [booking, ...current];
  localStorage.setItem('tourclick-bookings', JSON.stringify(next));
  return next;
}

export function formatCurrency(value) {
  return `S/ ${Number(value).toFixed(0)}`;
}

export function readStore(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

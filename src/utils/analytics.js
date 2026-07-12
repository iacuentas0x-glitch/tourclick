export function sum(values, key) {
  return values.reduce((total, item) => total + Number(item[key] || 0), 0);
}

export function groupBookings(bookings, keySelector, valueSelector = () => 1) {
  return bookings.reduce((groups, booking) => {
    const key = keySelector(booking) || 'Sin dato';
    groups[key] = (groups[key] || 0) + valueSelector(booking);
    return groups;
  }, {});
}

export function toChartData(grouped) {
  return Object.entries(grouped)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function getTopTours(bookings, tours) {
  const byTour = tours.map((tour) => {
    const tourBookings = bookings.filter((booking) => booking.tourId === tour.id || booking.tourName === tour.name);
    const reservations = tourBookings.length;
    const revenue = sum(tourBookings, 'subtotal');
    const persons = sum(tourBookings, 'persons');
    return {
      id: tour.id,
      label: tour.name,
      image: tour.image,
      reservations,
      persons,
      revenue,
      value: revenue
    };
  });

  return byTour
    .filter((item) => item.reservations > 0)
    .sort((a, b) => b.revenue - a.revenue || b.reservations - a.reservations)
    .slice(0, 5);
}

export function getClientSegments(bookings) {
  const uniqueClients = new Set(bookings.map((booking) => booking.clientEmail));
  const repeatClients = [...uniqueClients].filter((email) => bookings.filter((booking) => booking.clientEmail === email).length > 1);
  return {
    uniqueClients: uniqueClients.size,
    repeatClients: repeatClients.length,
    repeatRate: uniqueClients.size ? Math.round((repeatClients.length / uniqueClients.size) * 100) : 0
  };
}

export function getAverageTicket(bookings) {
  return bookings.length ? Math.round(sum(bookings, 'subtotal') / bookings.length) : 0;
}

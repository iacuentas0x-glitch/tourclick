import { useEffect, useMemo, useState } from 'react';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api } from '../services/backend.js';
import { formatCurrency } from '../utils/storage.js';
import { getBookingStatus } from '../utils/status.js';

function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    async function load() {
      const allBookings = await api.getBookings();
      setBookings(allBookings.filter((booking) => booking.clientId === user.id));
    }
    load();
  }, [user.id]);

  const totals = useMemo(() => ({
    count: bookings.length,
    paid: bookings.reduce((sum, booking) => sum + booking.subtotal, 0),
    confirmed: bookings.filter((booking) => booking.status === 'confirmed').length
  }), [bookings]);

  return (
    <div className="page section">
      <div className="section-heading">
        <p className="eyebrow">Cliente</p>
        <h1>Mis reservas</h1>
        <p>Consulta tus codigos, pagos pendientes y estado de validacion.</p>
      </div>

      <section className="admin-summary">
        <div><span>Reservas</span><strong>{totals.count}</strong></div>
        <div><span>Total reservado</span><strong>{formatCurrency(totals.paid)}</strong></div>
        <div><span>Confirmadas</span><strong>{totals.confirmed}</strong></div>
        <div><span>Pendientes</span><strong>{totals.count - totals.confirmed}</strong></div>
      </section>

      <section className="booking-history">
        {bookings.map((booking) => {
          const status = getBookingStatus(booking.status);
          return (
            <article className="dashboard-card booking-history-card" key={booking.id}>
              <div>
                <p className="eyebrow">{booking.bookingCode}</p>
                <h2>{booking.tourName}</h2>
                <p>{booking.agencyName} · {booking.date} · {booking.persons} persona{booking.persons > 1 ? 's' : ''}</p>
              </div>
              <div className="booking-history-side">
                <StatusBadge status={booking.status} />
                <strong>{formatCurrency(booking.subtotal)}</strong>
                <span>{status.description}</span>
              </div>
              {booking.paymentMethod === 'Yape' && booking.status !== 'confirmed' && (
                <div className="payment-proof compact-proof">
                  <img src={booking.qrData} alt="QR Yape TourClick" />
                  <p>Usa el codigo {booking.bookingCode} como descripcion del pago.</p>
                </div>
              )}
              {booking.paymentType === 'cash' && (
                <div className="voucher-box">
                  <strong>{booking.voucherCode}</strong>
                  <span>Muestra este voucher en la empresa para validarlo.</span>
                </div>
              )}
            </article>
          );
        })}
        {!bookings.length && (
          <div className="dashboard-card">
            <h2>Aun no tienes reservas</h2>
            <p>Cuando compres un tour, podras hacer seguimiento desde esta pantalla.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default MyBookings;

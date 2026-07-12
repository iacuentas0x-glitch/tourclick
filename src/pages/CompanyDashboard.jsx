import { useEffect, useMemo, useState } from 'react';
import DashboardCharts from '../components/DashboardCharts.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import TourEditor from '../components/TourEditor.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api } from '../services/backend.js';
import { formatCurrency } from '../utils/storage.js';

function CompanyDashboard() {
  const { user } = useAuth();
  const [tours, setTours] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [editing, setEditing] = useState(null);

  const refresh = async () => {
    const [nextTours, nextAgencies, nextBookings] = await Promise.all([api.getTours(), api.getAgencies(), api.getBookings()]);
    setTours(nextTours);
    setAgencies(nextAgencies);
    setBookings(nextBookings);
  };

  useEffect(() => {
    refresh();
  }, []);

  const agency = agencies.find((item) => item.id === user.agencyId);
  const companyTours = tours.filter((tour) => tour.agencyId === user.agencyId);
  const companyBookings = bookings.filter((booking) => booking.agencyId === user.agencyId);

  const totals = useMemo(() => {
    const revenue = companyBookings.reduce((sum, booking) => sum + booking.agencyReceives, 0);
    const gross = companyBookings.reduce((sum, booking) => sum + booking.subtotal, 0);
    const pendingCash = companyBookings.filter((booking) => booking.status === 'pending_cash_validation').length;
    return { revenue, gross, reservations: companyBookings.length, pendingCash };
  }, [companyBookings]);

  const saveTour = async (tour) => {
    await api.upsertTour({ ...tour, agencyId: user.agencyId });
    setEditing(null);
    refresh();
  };

  const validateCash = async (booking) => {
    await api.updateBookingStatus(booking.id, 'confirmed');
    refresh();
  };

  return (
    <div className="page section dashboard-page">
      <div className="section-heading">
        <p className="eyebrow">Empresa</p>
        <h1>{agency?.name || user.name}</h1>
        <p>Ventas, clientes, ingresos y catalogo propio en tiempo real.</p>
      </div>

      <section className="admin-summary">
        <div><span>Reservas</span><strong>{totals.reservations}</strong></div>
        <div><span>Ventas brutas</span><strong>{formatCurrency(totals.gross)}</strong></div>
        <div><span>Empresa recibe</span><strong>{formatCurrency(totals.revenue)}</strong></div>
        <div><span>Voucher efectivo</span><strong>{totals.pendingCash}</strong></div>
      </section>

      <DashboardCharts bookings={companyBookings} tours={companyTours} agencies={agencies} mode="company" />

      <section className="admin-grid">
        <div className="admin-table-wrap">
          <h2>Personas que compraron</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Cliente</th>
                <th>Correo</th>
                <th>Tour</th>
                <th>Pago</th>
                <th>Total</th>
                <th>Empresa recibe</th>
                <th>Estado</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {companyBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.bookingCode}</td>
                  <td>{booking.clientName}</td>
                  <td>{booking.clientEmail}</td>
                  <td>{booking.tourName}</td>
                  <td>{booking.paymentMethod}</td>
                  <td>{formatCurrency(booking.subtotal)}</td>
                  <td>{formatCurrency(booking.agencyReceives)}</td>
                  <td><StatusBadge status={booking.status} /></td>
                  <td>
                    {booking.status === 'pending_cash_validation' && (
                      <button className="btn btn-soft" onClick={() => validateCash(booking)}>Validar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dashboard-card">
          <h2>Lectura comercial</h2>
          <div className="settlement-list">
            <div><span>Mejor canal de pago</span><strong>{companyBookings[0]?.paymentMethod || 'Sin datos'}</strong></div>
            <div><span>Reservas por tour</span><strong>{companyTours.length}</strong></div>
            <div><span>Por validar en oficina</span><strong>{totals.pendingCash}</strong></div>
          </div>
        </div>
      </section>

      <section className="dashboard-split">
        <TourEditor agencies={agencies} agencyId={user.agencyId} selectedTour={editing} onSave={saveTour} onCancel={() => setEditing(null)} />
        <div className="dashboard-card">
          <h2>Mi catalogo</h2>
          <div className="mini-list">
            {companyTours.map((tour) => (
              <button key={tour.id} type="button" onClick={() => setEditing(tour)}>
                <img src={tour.image} alt={tour.name} />
                <span>{tour.name}</span>
                <strong>{formatCurrency(tour.price)}</strong>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default CompanyDashboard;

import { useEffect, useMemo, useState } from 'react';
import DashboardCharts from '../components/DashboardCharts.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import TourEditor from '../components/TourEditor.jsx';
import { api, usingFirebase } from '../services/backend.js';
import { createCompanyUser, seedDemoBookings } from '../services/mockApi.js';
import { formatCurrency } from '../utils/storage.js';

function AdminPanel() {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [tours, setTours] = useState([]);
  const [editing, setEditing] = useState(null);
  const [agencyForm, setAgencyForm] = useState({
    name: '',
    email: '',
    yearsActive: 1,
    responseTime: 'menos de 1 hora',
    badge: 'Verificada'
  });

  const refresh = async () => {
    const [nextBookings, nextUsers, nextAgencies, nextTours] = await Promise.all([
      api.getBookings(),
      api.getUsers(),
      api.getAgencies(),
      api.getTours()
    ]);
    setBookings(nextBookings);
    setUsers(nextUsers);
    setAgencies(nextAgencies);
    setTours(nextTours);
  };

  useEffect(() => {
    refresh();
  }, []);

  const totals = useMemo(() => {
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.subtotal, 0);
    const totalCommission = bookings.reduce((sum, booking) => sum + booking.commission, 0);
    const totalAgencyPayout = bookings.reduce((sum, booking) => sum + booking.agencyReceives, 0);
    const pendingPayments = bookings.filter((booking) => booking.status !== 'confirmed').length;
    return { totalRevenue, totalCommission, totalAgencyPayout, pendingPayments };
  }, [bookings]);

  const saveTour = async (tour) => {
    await api.upsertTour(tour);
    setEditing(null);
    refresh();
  };

  const createAgency = async (event) => {
    event.preventDefault();
    const agency = await api.addAgency({
      ...agencyForm,
      verified: true,
      totalTours: 0,
      rating: 4.5,
      totalReviews: 0
    });
    if (!usingFirebase()) {
      createCompanyUser(agency, 'empresa123');
    }
    setAgencyForm({ name: '', email: '', yearsActive: 1, responseTime: 'menos de 1 hora', badge: 'Verificada' });
    refresh();
  };

  const validateCash = async (booking) => {
    await api.updateBookingStatus(booking.id, 'confirmed');
    refresh();
  };

  const loadDemoBookings = () => {
    seedDemoBookings();
    refresh();
  };

  return (
    <div className="page section admin-page">
      <div className="section-heading">
        <p className="eyebrow">Administracion</p>
        <h1>Control total de TourClick</h1>
        <p>Usuarios, empresas, catalogos, reservas, comisiones y validacion de pagos.</p>
      </div>

      <section className="admin-summary">
        <div><span>Reservas</span><strong>{bookings.length}</strong></div>
        <div><span>Ingresos</span><strong>{formatCurrency(totals.totalRevenue)}</strong></div>
        <div><span>Comision ganada</span><strong>{formatCurrency(totals.totalCommission)}</strong></div>
        <div><span>Pagos pendientes</span><strong>{totals.pendingPayments}</strong></div>
      </section>

      {!usingFirebase() && !bookings.length && (
        <section className="demo-data-callout">
          <div>
            <h2>Datos demo para presentacion</h2>
            <p>Carga ventas simuladas para mostrar graficas, rankings y estados sin hacer reservas manuales.</p>
          </div>
          <button className="btn btn-primary" onClick={loadDemoBookings}>Cargar ventas demo</button>
        </section>
      )}

      <DashboardCharts bookings={bookings} tours={tours} agencies={agencies} mode="admin" />

      <section className="admin-grid">
        <div className="admin-table-wrap">
          <h2>Reservas globales</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Cliente</th>
                <th>Empresa</th>
                <th>Tour</th>
                <th>Pago</th>
                <th>Subtotal</th>
                <th>Comision 10%</th>
                <th>Agencia recibe</th>
                <th>Estado</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.bookingCode}</td>
                  <td>{booking.clientName}</td>
                  <td>{booking.agencyName}</td>
                  <td>{booking.tourName}</td>
                  <td>{booking.paymentMethod}</td>
                  <td>{formatCurrency(booking.subtotal)}</td>
                  <td>{formatCurrency(booking.commission)}</td>
                  <td>{formatCurrency(booking.agencyReceives)}</td>
                  <td><StatusBadge status={booking.status} /></td>
                  <td>
                    {(booking.status === 'pending_cash_validation' || booking.status === 'pending_yape_validation' || booking.status === 'pending_virtual_validation') && (
                      <button className="btn btn-soft" onClick={() => validateCash(booking)}>Validar</button>
                    )}
                  </td>
                </tr>
              ))}
              {!bookings.length && (
                <tr>
                  <td colSpan="10">Aun no hay reservas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dashboard-card">
          <h2>Resumen de liquidacion</h2>
          <div className="settlement-list">
            <div><span>Total cobrado</span><strong>{formatCurrency(totals.totalRevenue)}</strong></div>
            <div><span>Comision TourClick</span><strong>{formatCurrency(totals.totalCommission)}</strong></div>
            <div><span>Por liquidar a empresas</span><strong>{formatCurrency(totals.totalAgencyPayout)}</strong></div>
          </div>
        </div>
      </section>

      <section className="dashboard-split">
        <form className="dashboard-card editor-form" onSubmit={createAgency}>
          <h2>Registrar empresa</h2>
          <label className="field">
            <span>Nombre comercial</span>
            <input required value={agencyForm.name} onChange={(event) => setAgencyForm({ ...agencyForm, name: event.target.value })} />
          </label>
          <label className="field">
            <span>Correo de acceso</span>
            <input required type="email" value={agencyForm.email} onChange={(event) => setAgencyForm({ ...agencyForm, email: event.target.value })} />
          </label>
          <label className="field">
            <span>Años activa</span>
            <input type="number" min="0" value={agencyForm.yearsActive} onChange={(event) => setAgencyForm({ ...agencyForm, yearsActive: event.target.value })} />
          </label>
          <label className="field">
            <span>Badge</span>
            <input value={agencyForm.badge} onChange={(event) => setAgencyForm({ ...agencyForm, badge: event.target.value })} />
          </label>
          <button className="btn btn-primary btn-full">Crear empresa</button>
          <p className="hint">
            En modo demo la clave inicial sera empresa123. En Firebase, crea el usuario de empresa en Authentication y asignale este agencyId.
          </p>
        </form>

        <div className="dashboard-card">
          <h2>Usuarios</h2>
          <div className="user-list">
            {users.map((user) => (
              <div key={user.id}>
                <strong>{user.name}</strong>
                <span>{user.email}</span>
                <em>{user.role}</em>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dashboard-split">
        <TourEditor agencies={agencies} selectedTour={editing} onSave={saveTour} onCancel={() => setEditing(null)} />
        <div className="dashboard-card">
          <h2>Catalogo global</h2>
          <div className="mini-list">
            {tours.map((tour) => (
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

export default AdminPanel;

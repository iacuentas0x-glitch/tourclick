import { getAverageTicket, getClientSegments, getTopTours, groupBookings, toChartData } from '../utils/analytics.js';
import { formatCurrency } from '../utils/storage.js';
import { getBookingStatus } from '../utils/status.js';

const chartColors = ['#6c63ff', '#ff6584', '#43e97b', '#f29f05', '#1a1a2e'];

function getPercentShare(total, value) {
  return total ? Math.round((value / total) * 100) : 0;
}

function BusinessBarChart({ title, subtitle, data, valueFormatter = (value) => value }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const topItem = data[0];

  return (
    <div className="dashboard-card business-chart">
      <div className="chart-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {topItem ? <span className="chart-pill">Pico: {topItem.label}</span> : null}
      </div>
      <div className="chart-summary">
        <div>
          <span>Valor total</span>
          <strong>{valueFormatter(total)}</strong>
        </div>
        <div>
          <span>Mayor aporte</span>
          <strong>{topItem ? `${getPercentShare(total, topItem.value)}%` : '0%'}</strong>
        </div>
      </div>
      <div className="business-bars">
        {data.length ? data.map((item, index) => {
          const width = Math.max(8, (item.value / max) * 100);
          const share = getPercentShare(total, item.value);

          return (
            <div className={`business-bar-row ${index === 0 ? 'is-top' : ''}`} key={item.label}>
              <div className="bar-label">
                <span className="rank-pill">{index + 1}</span>
                <div>
                  <strong>{item.label}</strong>
                  <small>{valueFormatter(item.value)}</small>
                </div>
              </div>
              <div className="bar-track tall">
                <div style={{ width: `${width}%` }} />
              </div>
              <em>{share}%</em>
            </div>
          );
        }) : <p className="hint">Sin datos suficientes para graficar.</p>}
      </div>
    </div>
  );
}

function DonutChart({ title, subtitle, data }) {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let cursor = 0;
  const gradient = total
    ? data.map((item, index) => {
      const start = cursor;
      const end = cursor + (item.value / total) * 100;
      cursor = end;
      return `${chartColors[index % chartColors.length]} ${start}% ${end}%`;
    }).join(', ')
    : '#eef0ff 0 100%';
  const topItem = data[0];
  const share = topItem ? getPercentShare(total, topItem.value) : 0;

  return (
    <div className="dashboard-card donut-card">
      <div className="chart-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {topItem ? <span className="chart-pill">Dominante: {topItem.label}</span> : null}
      </div>
      <div className="donut-layout">
        <div className="donut-wrap">
          <div className="donut" style={{ background: `conic-gradient(${gradient})` }}>
            <div>
              <strong>{total}</strong>
              <span>reservas</span>
            </div>
          </div>
          <div className="donut-caption">
            <span>Segmento lider</span>
            <strong>{topItem ? `${topItem.label} - ${share}%` : 'Sin datos'}</strong>
          </div>
        </div>
        <div className="donut-legend">
          {data.length ? data.map((item, index) => (
            <div className="legend-item" key={item.label}>
              <span style={{ background: chartColors[index % chartColors.length] }} />
              <div className="legend-meta">
                <strong>{item.label}</strong>
                <em>{item.value} - {getPercentShare(total, item.value)}%</em>
              </div>
            </div>
          )) : <p className="hint">Sin datos aun.</p>}
        </div>
      </div>
    </div>
  );
}

function TopTours({ tours }) {
  const maxRevenue = Math.max(...tours.map((tour) => tour.revenue), 1);
  const topTour = tours[0];

  return (
    <div className="dashboard-card top-tours-card">
      <div className="chart-heading">
        <div>
          <h2>Tours mas vendidos</h2>
          <p>Ranking por ingresos generados.</p>
        </div>
        {topTour ? <span className="chart-pill">Top: {topTour.label}</span> : null}
      </div>
      <div className="chart-summary">
        <div>
          <span>Mejor desempeño</span>
          <strong>{topTour ? formatCurrency(topTour.revenue) : formatCurrency(0)}</strong>
        </div>
        <div>
          <span>Ticket de referencia</span>
          <strong>{topTour ? formatCurrency(Math.round(topTour.revenue / Math.max(topTour.reservations, 1))) : formatCurrency(0)}</strong>
        </div>
      </div>
      <div className="top-tour-list">
        {tours.length ? tours.map((tour, index) => {
          const share = Math.round((tour.revenue / maxRevenue) * 100);
          return (
            <article key={tour.id || tour.label} className={index === 0 ? 'is-top' : ''}>
              <span className="rank-number">{index + 1}</span>
              <img src={tour.image} alt={tour.label} />
              <div className="tour-info">
                <strong>{tour.label}</strong>
                <span>{tour.reservations} reservas - {tour.persons} personas</span>
              </div>
              <div className="tour-metric">
                <em>{formatCurrency(tour.revenue)}</em>
                <small>{share}% del top</small>
              </div>
            </article>
          );
        }) : <p className="hint">Aun no hay ventas para rankear tours.</p>}
      </div>
    </div>
  );
}

function InsightStrip({ bookings }) {
  const clients = getClientSegments(bookings);
  const averageTicket = getAverageTicket(bookings);
  const pending = bookings.filter((booking) => booking.status !== 'confirmed').length;

  return (
    <section className="insight-strip">
      <div>
        <span>Ticket promedio</span>
        <strong>{formatCurrency(averageTicket)}</strong>
      </div>
      <div>
        <span>Clientes unicos</span>
        <strong>{clients.uniqueClients}</strong>
      </div>
      <div>
        <span>Clientes recurrentes</span>
        <strong>{clients.repeatClients}</strong>
      </div>
      <div>
        <span>Tasa de retorno</span>
        <strong>{clients.repeatRate}%</strong>
      </div>
      <div>
        <span>Por validar</span>
        <strong>{pending}</strong>
      </div>
    </section>
  );
}

function DashboardCharts({ bookings, tours, agencies, mode = 'admin' }) {
  const topTours = getTopTours(bookings, tours);
  const paymentData = toChartData(groupBookings(bookings, (booking) => booking.paymentMethod));
  const statusData = toChartData(groupBookings(bookings, (booking) => getBookingStatus(booking.status).label));
  const companyRevenue = mode === 'admin'
    ? agencies.map((agency) => ({
      label: agency.name,
      value: bookings
        .filter((booking) => booking.agencyId === agency.id || booking.agencyName === agency.name)
        .reduce((sum, booking) => sum + Number(booking.commission || 0), 0)
    })).filter((item) => item.value > 0).sort((a, b) => b.value - a.value)
    : tours.map((tour) => ({
      label: tour.name,
      value: bookings
        .filter((booking) => booking.tourId === tour.id || booking.tourName === tour.name)
        .reduce((sum, booking) => sum + Number(booking.agencyReceives || 0), 0)
    })).filter((item) => item.value > 0).sort((a, b) => b.value - a.value);

  return (
    <>
      <InsightStrip bookings={bookings} />
      <section className="analytics-grid">
        <TopTours tours={topTours} />
        <BusinessBarChart
          title={mode === 'admin' ? 'Comision por empresa' : 'Ingresos por tour'}
          subtitle={mode === 'admin' ? 'Cuanto gana TourClick por agencia.' : 'Que experiencias sostienen el negocio.'}
          data={companyRevenue}
          valueFormatter={formatCurrency}
        />
        <DonutChart title="Metodos de pago" subtitle="Preferencias de compra de clientes." data={paymentData} />
        <DonutChart title="Estado de reservas" subtitle="Control operativo y pagos pendientes." data={statusData} />
      </section>
    </>
  );
}

export default DashboardCharts;

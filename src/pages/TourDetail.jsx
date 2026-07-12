import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AgencyBadge from '../components/AgencyBadge.jsx';
import BookingForm from '../components/BookingForm.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { api } from '../services/backend.js';
import { formatCurrency } from '../utils/storage.js';
import { getBookingStatus } from '../utils/status.js';

function TourDetail() {
  const { id } = useParams();
  const [tours, setTours] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [persons, setPersons] = useState(1);
  const [confirmed, setConfirmed] = useState(null);
  const tour = tours.find((item) => item.id === Number(id));
  const agency = useMemo(() => agencies.find((item) => item.id === tour?.agencyId), [agencies, tour]);

  useEffect(() => {
    async function load() {
      const [nextTours, nextAgencies] = await Promise.all([api.getTours(), api.getAgencies()]);
      setTours(nextTours);
      setAgencies(nextAgencies);
    }
    load();
  }, []);

  if (!tour) {
    return (
      <div className="page section empty-state">
        <h1>Tour no encontrado</h1>
        <Link className="btn btn-primary" to="/tours">Volver a tours</Link>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="page section confirmation">
        <div className="confirmation-box">
          <span className="success-mark">OK</span>
          <h1>Reserva generada</h1>
          <p>Codigo: <strong>{confirmed.bookingCode}</strong></p>
          <p>Tour: {confirmed.tourName}</p>
          <p>Empresa: {confirmed.agencyName}</p>
          <p>Fecha: {confirmed.date}</p>
          <p>Personas: {confirmed.persons}</p>
          <p>Total: <strong>{formatCurrency(confirmed.subtotal)}</strong></p>
          <p>Estado: <StatusBadge status={confirmed.status} /></p>
          {confirmed.paymentType === 'virtual' ? (
            <div className="payment-proof">
              {confirmed.paymentMethod === 'Yape' ? (
                <>
                  <p>Escanea el QR Yape de TourClick y coloca el codigo {confirmed.bookingCode} en la descripcion del pago.</p>
                  <img src={confirmed.qrData} alt="QR Yape TourClick" />
                  <p>{getBookingStatus(confirmed.status).description}</p>
                </>
              ) : (
                <div className="voucher-box">
                  <h2>Pago virtual pendiente</h2>
                  <p>Usa el codigo {confirmed.bookingCode} como referencia del pago.</p>
                  <span>{getBookingStatus(confirmed.status).description}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="voucher-box">
              <h2>Voucher pendiente</h2>
              <p>{confirmed.voucherCode}</p>
              <span>{getBookingStatus(confirmed.status).description}</span>
            </div>
          )}
          <p>Recibiras un correo de confirmacion en: {confirmed.clientEmail}</p>
          <Link className="btn btn-primary" to="/tours">Reservar otro tour</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page detail-page">
      <section className="detail-hero">
        <img src={tour.image} alt={tour.name} />
      </section>
      <section className="detail-layout">
        <div className="detail-content">
          <div className="detail-title">
            <p className="eyebrow">{tour.category}</p>
            <h1>{tour.name}</h1>
            <p className="rating">★★★★★ <span>{tour.rating} · {tour.reviews} reseñas</span></p>
            <AgencyBadge agency={agency} />
          </div>

          <section className="detail-highlight-row" aria-label="Resumen del tour">
            <div>
              <span>Duración</span>
              <strong>{tour.duration}</strong>
            </div>
            <div>
              <span>Dificultad</span>
              <strong>{tour.difficulty}</strong>
            </div>
            <div>
              <span>Disponibilidad</span>
              <strong>{tour.spotsLeft} cupos</strong>
            </div>
          </section>

          <section className="detail-block calculator">
            <div>
              <h2>{formatCurrency(tour.price)} por persona</h2>
              <p>Total para {persons} persona{persons > 1 ? 's' : ''}: <strong>{formatCurrency(tour.price * persons)}</strong></p>
            </div>
            <input
              type="range"
              min="1"
              max={Math.max(1, tour.spotsLeft || tour.capacity)}
              value={persons}
              onChange={(event) => setPersons(Number(event.target.value))}
            />
          </section>

          <section className="detail-block split">
            <div>
              <h2>Que incluye</h2>
              {tour.includes.map((item) => <p className="check" key={item}>OK {item}</p>)}
            </div>
            <div>
              <h2>No incluye</h2>
              {tour.notIncludes.map((item) => <p className="cross" key={item}>NO {item}</p>)}
            </div>
          </section>

          <section className="detail-block">
            <h2>Itinerario</h2>
            <div className="timeline">
              {tour.itinerary.map((item) => <p key={item}>{item}</p>)}
            </div>
          </section>

          <section className="detail-block">
            <h2>Punto de encuentro</h2>
            <p>{tour.meetingPoint}</p>
            <iframe
              title="Mapa de Huaraz"
              src="https://www.google.com/maps?q=Plaza%20de%20Armas%20Huaraz%20Peru&output=embed"
              loading="lazy"
            />
          </section>

          <section className="detail-block">
            <h2>Politica de cancelacion</h2>
            <p>{tour.cancellationPolicy}</p>
          </section>

          <section className="detail-block">
            <h2>Reseñas</h2>
            <div className="reviews">
              {tour.reviewsList.map((review) => <blockquote key={review}>{review}</blockquote>)}
            </div>
          </section>
        </div>
        <aside className="booking-sticky">
          <BookingForm tour={tour} agency={agency} onConfirmed={setConfirmed} />
        </aside>
      </section>
    </div>
  );
}

export default TourDetail;

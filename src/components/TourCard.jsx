import React from 'react';
import { Link } from 'react-router-dom';
import AgencyBadge from './AgencyBadge.jsx';
import { formatCurrency } from '../utils/storage.js';

function TourCard({ tour, agency }) {
  const isSoldOut = tour.spotsLeft === 0 || !tour.available;
  const availabilityPercent = Math.min(100, Math.max(16, (tour.spotsLeft / Math.max(tour.capacity || 10, 1)) * 100));

  return (
    <article className="tour-card">
      <div className="tour-image">
        <img src={tour.image} alt={tour.name} />
        <div className="tour-image-overlay">
          <span className="tour-pill">{tour.category}</span>
          <span className="tour-pill tour-pill--ghost">{tour.duration}</span>
        </div>
        <span className="price-overlay">{formatCurrency(tour.price)}</span>
        <span className={`difficulty difficulty-${tour.difficulty.toLowerCase().replace('í', 'i')}`}>
          {tour.difficulty}
        </span>
      </div>
      <div className="tour-body">
        <div className="tour-body-head">
          <div>
            <h3>{tour.name}</h3>
            <AgencyBadge agency={agency} />
          </div>
          <span className={`tour-status-pill ${isSoldOut ? 'sold-out' : tour.spotsLeft <= 3 ? 'limited' : 'available'}`}>
            {isSoldOut ? 'Agotado' : tour.spotsLeft <= 3 ? 'Últimos cupos' : 'Disponible'}
          </span>
        </div>
        <p className="rating">★★★★★ <span>{tour.rating} · {tour.reviews} reseñas</span></p>
        <p className="tour-meta">{tour.duration} · Incluye {tour.includes.slice(0, 2).join(', ')}</p>
        <div className="availability-bar" aria-hidden="true">
          <span style={{ width: `${availabilityPercent}%` }} />
        </div>
        <p className={tour.spotsLeft <= 3 ? 'spots urgent' : 'spots'}>
          {isSoldOut ? 'Sin cupos disponibles' : tour.spotsLeft <= 3 ? `¡Solo ${tour.spotsLeft} cupos!` : `${tour.spotsLeft} cupos restantes`}
        </p>
        <div className="card-actions">
          <Link className="btn btn-soft" to={`/tours/${tour.id}`}>Ver detalle</Link>
          <Link className={`btn btn-primary ${isSoldOut ? 'disabled' : ''}`} to={isSoldOut ? '/tours' : `/tours/${tour.id}#booking`}>
            Reservar
          </Link>
        </div>
      </div>
    </article>
  );
}

export default TourCard;


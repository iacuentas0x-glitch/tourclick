import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import TourCard from '../components/TourCard.jsx';
import { api } from '../services/backend.js';

function Home() {
  const [tours, setTours] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [counts, setCounts] = useState({ tours: 0, agencies: 0 });
  const featuredTours = useMemo(() => [...tours].sort((a, b) => b.rating - a.rating).slice(0, 3), [tours]);

  useEffect(() => {
    let timer;
    async function load() {
      const [nextTours, nextAgencies] = await Promise.all([api.getTours(), api.getAgencies()]);
      setTours(nextTours);
      setAgencies(nextAgencies);
      timer = setTimeout(() => setCounts({ tours: nextTours.length, agencies: nextAgencies.length }), 250);
    }
    load();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Huaraz, Peru</p>
          <h1>Reserva tours de montaña con agencias verificadas</h1>
          <div className="hero-search">
            <input placeholder="Busca Laguna 69, Pastoruri, Paron..." />
            <Link className="btn btn-primary" to="/tours">Explorar tours</Link>
          </div>
          <div className="stats-row">
            <strong>{counts.tours}</strong><span>tours disponibles</span>
            <strong>{counts.agencies}</strong><span>agencias registradas</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Favoritos</p>
          <h2>Tours mas reservados</h2>
        </div>
        <div className="tour-grid">
          {featuredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} agency={agencies.find((agency) => agency.id === tour.agencyId)} />
          ))}
        </div>
      </section>

      <section className="section why-section">
        <div className="info-card">
          <span className="icon-circle">S</span>
          <h3>Seguridad</h3>
          <p>Agencias verificadas, guias certificados y cupos controlados por salida.</p>
        </div>
        <div className="info-card">
          <span className="icon-circle">P</span>
          <h3>Precios claros</h3>
          <p>El turista ve el total final por persona y por grupo antes de reservar.</p>
        </div>
        <div className="info-card">
          <span className="icon-circle">R</span>
          <h3>Reserva inmediata</h3>
          <p>Confirmacion con codigo unico y registro automatico para administracion.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;

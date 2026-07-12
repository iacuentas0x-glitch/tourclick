import { useEffect, useState } from 'react';
import TourCard from '../components/TourCard.jsx';
import { api } from '../services/backend.js';

function BudgetPlanner() {
  const [budget, setBudget] = useState(80);
  const [tours, setTours] = useState([]);
  const [agencies, setAgencies] = useState([]);

  useEffect(() => {
    async function load() {
      const [nextTours, nextAgencies] = await Promise.all([api.getTours(), api.getAgencies()]);
      setTours(nextTours);
      setAgencies(nextAgencies);
    }
    load();
  }, []);

  const affordable = tours
    .filter((tour) => tour.price <= budget)
    .sort((a, b) => a.price - b.price);
  const fallback = [...tours].sort((a, b) => a.price - b.price).slice(0, 3);
  const visibleTours = affordable.length ? affordable : fallback;

  return (
    <div className="page section">
      <section className="budget-panel">
        <p className="eyebrow">Planificador</p>
        <h1>Cuanto tienes para gastar?</h1>
        <label className="budget-slider">
          <span>S/ {budget}</span>
          <input type="range" min="30" max="200" step="5" value={budget} onChange={(event) => setBudget(Number(event.target.value))} />
        </label>
        <p>
          {affordable.length
            ? `${affordable.length} tours entran en tu presupuesto.`
            : `Con S/ ${budget} puedes ver estos tours cercanos a tu presupuesto.`}
        </p>
      </section>

      <div className="tour-grid">
        {visibleTours.map((tour) => (
          <TourCard key={tour.id} tour={tour} agency={agencies.find((agency) => agency.id === tour.agencyId)} />
        ))}
      </div>
    </div>
  );
}

export default BudgetPlanner;

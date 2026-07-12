import { useEffect, useState } from 'react';
import Filters from '../components/Filters.jsx';
import TourCard from '../components/TourCard.jsx';
import { api } from '../services/backend.js';

function Tours() {
  const [tours, setTours] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 200,
    duration: 'all',
    difficulty: 'all',
    category: 'all',
    onlyAvailable: false
  });

  useEffect(() => {
    async function load() {
      const [nextTours, nextAgencies] = await Promise.all([api.getTours(), api.getAgencies()]);
      setTours(nextTours);
      setAgencies(nextAgencies);
    }
    load();
  }, []);

  const filteredTours = tours.filter((tour) => (
    tour.price >= filters.minPrice &&
    tour.price <= filters.maxPrice &&
    (filters.duration === 'all' || tour.duration === filters.duration) &&
    (filters.difficulty === 'all' || tour.difficulty === filters.difficulty) &&
    (filters.category === 'all' || tour.category === filters.category) &&
    (!filters.onlyAvailable || tour.available)
  ));

  return (
    <div className="page section">
      <div className="section-heading">
        <p className="eyebrow">Marketplace</p>
        <h1>Tours en Huaraz</h1>
        <p>{filteredTours.length} opciones encontradas segun tus filtros.</p>
      </div>
      <div className="catalog-layout">
        <Filters filters={filters} setFilters={setFilters} />
        <div className="tour-grid">
          {filteredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} agency={agencies.find((agency) => agency.id === tour.agencyId)} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Tours;

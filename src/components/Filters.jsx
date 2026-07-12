import React from 'react';

function Filters({ filters, setFilters }) {
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <aside className="filters-panel">
      <div>
        <p className="eyebrow">Filtros</p>
        <h2>Encuentra tu ruta</h2>
      </div>

      <label className="field">
        <span>Precio máximo: S/ {filters.maxPrice}</span>
        <input
          type="range"
          min="0"
          max="200"
          step="10"
          value={filters.maxPrice}
          onChange={(event) => update('maxPrice', Number(event.target.value))}
        />
      </label>

      <label className="field">
        <span>Duración</span>
        <select value={filters.duration} onChange={(event) => update('duration', event.target.value)}>
          <option value="all">Todas</option>
          <option value="Medio día">Medio día</option>
          <option value="Full Day">Full Day</option>
          <option value="2 días">2 días</option>
          <option value="1 día">1 día</option>
        </select>
      </label>

      <label className="field">
        <span>Dificultad</span>
        <select value={filters.difficulty} onChange={(event) => update('difficulty', event.target.value)}>
          <option value="all">Todas</option>
          <option value="Fácil">Fácil</option>
          <option value="Moderado">Moderado</option>
          <option value="Difícil">Difícil</option>
        </select>
      </label>

      <label className="field">
        <span>Categoría</span>
        <select value={filters.category} onChange={(event) => update('category', event.target.value)}>
          <option value="all">Todas</option>
          <option value="Trekking">Trekking</option>
          <option value="Full Day">Full Day</option>
          <option value="City Tour">City Tour</option>
        </select>
      </label>

      <label className="switch-row">
        <input
          type="checkbox"
          checked={filters.onlyAvailable}
          onChange={(event) => update('onlyAvailable', event.target.checked)}
        />
        <span>Solo disponibles</span>
      </label>
    </aside>
  );
}

export default Filters;


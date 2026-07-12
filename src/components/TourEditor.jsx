import { useEffect, useState } from 'react';

const emptyTour = {
  name: '',
  price: 50,
  duration: 'Full Day',
  difficulty: 'Fácil',
  category: 'Full Day',
  rating: 4.5,
  reviews: 0,
  agencyId: '',
  capacity: 10,
  spotsLeft: 10,
  available: true,
  image: '',
  description: '',
  includesText: 'Transporte\nGuia',
  notIncludesText: 'Comida',
  itineraryText: '7:00am - Salida desde Huaraz',
  meetingPoint: 'Plaza de Armas, Huaraz',
  cancellationPolicy: 'Cancelacion gratuita hasta 48h antes',
  reviewsText: 'Excelente experiencia'
};

function toForm(tour, agencyId) {
  if (!tour) return { ...emptyTour, agencyId };
  return {
    ...emptyTour,
    ...tour,
    agencyId: tour.agencyId || agencyId,
    includesText: (tour.includes || []).join('\n'),
    notIncludesText: (tour.notIncludes || []).join('\n'),
    itineraryText: (tour.itinerary || []).join('\n'),
    reviewsText: (tour.reviewsList || []).join('\n')
  };
}

function toTour(form) {
  const lines = (value) => String(value || '').split('\n').map((item) => item.trim()).filter(Boolean);
  return {
    ...form,
    includes: lines(form.includesText),
    notIncludes: lines(form.notIncludesText),
    itinerary: lines(form.itineraryText),
    reviewsList: lines(form.reviewsText)
  };
}

function TourEditor({ agencies, agencyId, selectedTour, onSave, onCancel }) {
  const [form, setForm] = useState(toForm(selectedTour, agencyId));

  useEffect(() => {
    setForm(toForm(selectedTour, agencyId));
  }, [selectedTour, agencyId]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    onSave(toTour(form));
    setForm(toForm(null, agencyId));
  };

  return (
    <form className="dashboard-card editor-form" onSubmit={submit}>
      <div className="panel-title">
        <h2>{selectedTour ? 'Editar tour' : 'Agregar tour'}</h2>
        {selectedTour && <button className="btn btn-soft" type="button" onClick={onCancel}>Cancelar</button>}
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Nombre</span>
          <input required value={form.name} onChange={(event) => update('name', event.target.value)} />
        </label>
        <label className="field">
          <span>Empresa</span>
          <select required value={form.agencyId} onChange={(event) => update('agencyId', Number(event.target.value))} disabled={Boolean(agencyId)}>
            <option value="">Seleccionar</option>
            {agencies.map((agency) => <option key={agency.id} value={agency.id}>{agency.name}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Precio</span>
          <input required type="number" min="1" value={form.price} onChange={(event) => update('price', event.target.value)} />
        </label>
        <label className="field">
          <span>Cupos</span>
          <input required type="number" min="0" value={form.spotsLeft} onChange={(event) => update('spotsLeft', event.target.value)} />
        </label>
        <label className="field">
          <span>Capacidad</span>
          <input required type="number" min="1" value={form.capacity} onChange={(event) => update('capacity', event.target.value)} />
        </label>
        <label className="field">
          <span>Dificultad</span>
          <select value={form.difficulty} onChange={(event) => update('difficulty', event.target.value)}>
            <option>Fácil</option>
            <option>Moderado</option>
            <option>Difícil</option>
          </select>
        </label>
        <label className="field">
          <span>Categoria</span>
          <select value={form.category} onChange={(event) => update('category', event.target.value)}>
            <option>Full Day</option>
            <option>Trekking</option>
            <option>City Tour</option>
          </select>
        </label>
        <label className="field">
          <span>Duracion</span>
          <input value={form.duration} onChange={(event) => update('duration', event.target.value)} />
        </label>
      </div>

      <label className="field">
        <span>Imagen URL</span>
        <input required value={form.image} onChange={(event) => update('image', event.target.value)} />
      </label>
      <label className="field">
        <span>Descripcion</span>
        <textarea value={form.description} onChange={(event) => update('description', event.target.value)} />
      </label>
      <div className="form-grid">
        <label className="field">
          <span>Incluye</span>
          <textarea value={form.includesText} onChange={(event) => update('includesText', event.target.value)} />
        </label>
        <label className="field">
          <span>No incluye</span>
          <textarea value={form.notIncludesText} onChange={(event) => update('notIncludesText', event.target.value)} />
        </label>
      </div>
      <label className="switch-row">
        <input type="checkbox" checked={form.available} onChange={(event) => update('available', event.target.checked)} />
        <span>Disponible</span>
      </label>
      <button className="btn btn-primary btn-full">Guardar catalogo</button>
    </form>
  );
}

export default TourEditor;

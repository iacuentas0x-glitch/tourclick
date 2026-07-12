import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { tourclickPaymentConfig } from '../config/payments.js';
import { api } from '../services/backend.js';
import { formatCurrency } from '../utils/storage.js';

function BookingForm({ tour, agency, onConfirmed }) {
  const { user } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({
    whatsapp: '',
    date: '',
    persons: 1,
    paymentMethod: 'Yape'
  });

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const total = tour.price * form.persons;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;

    const isCash = form.paymentMethod === 'Efectivo';
    const isYape = form.paymentMethod === 'Yape';
    const pendingStatus = isCash
      ? 'pending_cash_validation'
      : isYape
        ? 'pending_yape_validation'
        : 'pending_virtual_validation';
    const bookingCode = `TC-${Date.now()}`;
    const paymentPayload = {
      bookingCode,
      monto: total,
      tour: tour.name,
      empresa: agency?.name || 'TourClick',
      metodo: form.paymentMethod,
      receptor: isYape ? tourclickPaymentConfig.yapeOwner : 'TourClick',
      yapePhone: isYape ? tourclickPaymentConfig.yapePhone : ''
    };

    const booking = {
      id: Date.now(),
      tourId: tour.id,
      tourName: tour.name,
      agencyId: tour.agencyId,
      agencyName: agency?.name || '',
      clientId: user.id,
      clientName: user.name,
      clientEmail: user.email,
      whatsapp: form.whatsapp || user.phone || '',
      date: form.date,
      persons: Number(form.persons),
      paymentMethod: form.paymentMethod,
      paymentType: isCash ? 'cash' : 'virtual',
      paymentProof: isCash ? 'voucher' : isYape ? 'yape_qr' : 'manual_virtual',
      qrData: isYape ? tourclickPaymentConfig.yapeQrImage : '',
      paymentPayload,
      voucherCode: isCash ? `VCH-${bookingCode}` : '',
      subtotal: total,
      commission: total * 0.1,
      agencyReceives: total * 0.9,
      status: pendingStatus,
      bookingCode
    };

    await api.addBooking(booking);
    onConfirmed(booking);
  };

  if (!user) {
    return (
      <div className="booking-form auth-required" id="booking">
        <p className="eyebrow">Cuenta requerida</p>
        <h2>Ingresa para reservar</h2>
        <p>Necesitamos validar quien realiza la compra antes de generar QR o voucher.</p>
        <Link className="btn btn-primary btn-full" to="/login" state={{ from: location.pathname }}>
          Ingresar o crear cuenta
        </Link>
      </div>
    );
  }

  if (user.role !== 'client') {
    return (
      <div className="booking-form auth-required" id="booking">
        <p className="eyebrow">Rol no habilitado</p>
        <h2>Solo clientes pueden reservar</h2>
        <p>Estas conectado como {user.role}. Usa una cuenta de cliente para comprar tours.</p>
      </div>
    );
  }

  return (
    <form className="booking-form" id="booking" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">Reserva inmediata</p>
        <h2>{formatCurrency(tour.price)} por persona</h2>
      </div>

      <div className="buyer-box">
        <strong>{user.name}</strong>
        <span>{user.email}</span>
      </div>

      <label className="field">
        <span>Numero de WhatsApp</span>
        <input required value={form.whatsapp} onChange={(event) => update('whatsapp', event.target.value)} />
      </label>
      <label className="field">
        <span>Fecha del tour</span>
        <input required type="date" value={form.date} onChange={(event) => update('date', event.target.value)} />
      </label>
      <label className="field">
        <span>Personas: {form.persons}</span>
        <input
          type="range"
          min="1"
          max={Math.max(1, tour.spotsLeft || tour.capacity)}
          value={form.persons}
          onChange={(event) => update('persons', Number(event.target.value))}
        />
      </label>
      <label className="field">
        <span>Metodo de pago</span>
        <select value={form.paymentMethod} onChange={(event) => update('paymentMethod', event.target.value)}>
          <option>Tarjeta</option>
          <option>Yape</option>
          <option>Transferencia</option>
          <option>Efectivo</option>
        </select>
      </label>

      <div className="total-row">
        <span>Total</span>
        <strong>{formatCurrency(total)}</strong>
      </div>
      <button className="btn btn-primary btn-full" disabled={!tour.available || tour.spotsLeft === 0}>
        Confirmar reserva
      </button>
    </form>
  );
}

export default BookingForm;

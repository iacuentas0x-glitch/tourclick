import toursSeed from '../data/tours.json';
import agenciesSeed from '../data/agencies.json';
import usersSeed from '../data/users.json';
import { readStore, writeStore } from '../utils/storage.js';

const KEYS = {
  tours: 'tourclick-tours',
  agencies: 'tourclick-agencies',
  users: 'tourclick-users',
  bookings: 'tourclick-bookings',
  session: 'tourclick-session'
};

function seed(key, fallback) {
  const current = readStore(key, null);
  if (current) return current;
  return writeStore(key, fallback);
}

export function getTours() {
  return seed(KEYS.tours, toursSeed);
}

export function saveTours(tours) {
  return writeStore(KEYS.tours, tours);
}

export function upsertTour(tour) {
  const tours = getTours();
  const nextTour = {
    ...tour,
    id: tour.id ? Number(tour.id) : Date.now(),
    price: Number(tour.price),
    agencyId: Number(tour.agencyId),
    capacity: Number(tour.capacity),
    spotsLeft: Number(tour.spotsLeft),
    rating: Number(tour.rating || 4.5),
    reviews: Number(tour.reviews || 0),
    available: tour.available !== false
  };
  const exists = tours.some((item) => item.id === nextTour.id);
  const next = exists ? tours.map((item) => (item.id === nextTour.id ? nextTour : item)) : [nextTour, ...tours];
  saveTours(next);
  return nextTour;
}

export function getAgencies() {
  return seed(KEYS.agencies, agenciesSeed);
}

export function saveAgencies(agencies) {
  return writeStore(KEYS.agencies, agencies);
}

export function addAgency(agency) {
  const agencies = getAgencies();
  const nextAgency = {
    id: Date.now(),
    rating: 4.5,
    totalReviews: 0,
    verified: true,
    responseTime: 'menos de 2 horas',
    totalTours: 0,
    yearsActive: Number(agency.yearsActive || 1),
    badge: 'Nueva',
    ...agency
  };
  saveAgencies([nextAgency, ...agencies]);
  return nextAgency;
}

export function getUsers() {
  return seed(KEYS.users, usersSeed);
}

export function saveUsers(users) {
  return writeStore(KEYS.users, users);
}

export function getSession() {
  return readStore(KEYS.session, null);
}

export function setSession(user) {
  const publicUser = user ? sanitizeUser(user) : null;
  writeStore(KEYS.session, publicUser);
  return publicUser;
}

export function onSessionChanged(callback) {
  callback(getSession());
  return () => {};
}

export function sanitizeUser(user) {
  const { password, ...publicUser } = user;
  return publicUser;
}

export async function loginUser(email, password) {
  const user = getUsers().find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
  if (!user) throw new Error('Credenciales invalidas');
  return setSession(user);
}

export async function logoutUser() {
  setSession(null);
}

export async function registerClient(payload) {
  const users = getUsers();
  const exists = users.some((item) => item.email.toLowerCase() === payload.email.toLowerCase());
  if (exists) throw new Error('Ya existe una cuenta con ese correo');
  const user = {
    id: Date.now(),
    name: payload.name,
    email: payload.email,
    password: payload.password,
    phone: payload.phone || '',
    role: 'client'
  };
  saveUsers([user, ...users]);
  return setSession(user);
}

export function createCompanyUser(agency, password = 'empresa123') {
  const users = getUsers();
  const email = agency.email || `empresa${agency.id}@tourclick.pe`;
  const user = {
    id: Date.now() + 1,
    name: agency.name,
    email,
    password,
    role: 'company',
    agencyId: agency.id
  };
  saveUsers([user, ...users]);
  return sanitizeUser(user);
}

export function getBookings() {
  return readStore(KEYS.bookings, []);
}

export function saveBookings(bookings) {
  return writeStore(KEYS.bookings, bookings);
}

export function addBooking(booking) {
  const next = [booking, ...getBookings()];
  saveBookings(next);
  return next;
}

export function updateBookingStatus(id, status) {
  const next = getBookings().map((booking) => (booking.id === id ? { ...booking, status } : booking));
  saveBookings(next);
  return next;
}

export function seedDemoBookings() {
  const existing = getBookings();
  if (existing.length) return existing;

  const tours = getTours();
  const agencies = getAgencies();
  const clients = [
    { id: 301, name: 'Mariana Flores', email: 'mariana@mail.com', phone: '987111222' },
    { id: 302, name: 'Diego Ramos', email: 'diego@mail.com', phone: '987333444' },
    { id: 303, name: 'Sofia Vega', email: 'sofia@mail.com', phone: '987555666' },
    { id: 304, name: 'Carlos Paredes', email: 'carlos@mail.com', phone: '987777888' },
    { id: 305, name: 'Lucia Torres', email: 'lucia@mail.com', phone: '987999000' }
  ];
  const paymentMethods = ['Yape', 'Tarjeta', 'Transferencia', 'Efectivo'];
  const statuses = ['confirmed', 'confirmed', 'confirmed', 'pending_yape_validation', 'pending_cash_validation'];
  const tourPlan = [3, 3, 4, 1, 2, 5, 8, 3, 4, 7, 1, 6];

  const demoBookings = tourPlan.map((tourId, index) => {
    const tour = tours.find((item) => item.id === tourId) || tours[index % tours.length];
    const agency = agencies.find((item) => item.id === tour.agencyId) || agencies[0];
    const client = clients[index % clients.length];
    const persons = (index % 3) + 1;
    const subtotal = tour.price * persons;
    const paymentMethod = paymentMethods[index % paymentMethods.length];
    const status = statuses[index % statuses.length];
    const bookingCode = `TC-DEMO-${String(index + 1).padStart(3, '0')}`;

    return {
      id: Date.now() + index,
      tourId: tour.id,
      tourName: tour.name,
      agencyId: tour.agencyId,
      agencyName: agency.name,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      whatsapp: client.phone,
      date: `2026-07-${String(14 + index).padStart(2, '0')}`,
      persons,
      paymentMethod,
      paymentType: paymentMethod === 'Efectivo' ? 'cash' : 'virtual',
      paymentProof: paymentMethod === 'Efectivo' ? 'voucher' : paymentMethod === 'Yape' ? 'yape_qr' : 'manual_virtual',
      qrData: paymentMethod === 'Yape' ? '/payments/tourclick-yape-qr.svg' : '',
      voucherCode: paymentMethod === 'Efectivo' ? `VCH-${bookingCode}` : '',
      subtotal,
      commission: subtotal * 0.1,
      agencyReceives: subtotal * 0.9,
      status,
      bookingCode
    };
  });

  saveBookings(demoBookings);
  return demoBookings;
}

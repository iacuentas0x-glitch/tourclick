import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { firebaseAuth, firestoreDb, isFirebaseConfigured } from '../config/firebase.js';
import * as mockApi from './mockApi.js';

function assertFirebase() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase no esta configurado. Revisa las variables VITE_FIREBASE_*.');
  }
}

function normalizeDoc(snapshot) {
  return { id: snapshot.id, ...snapshot.data() };
}

async function getCollection(name) {
  assertFirebase();
  const snapshot = await getDocs(query(collection(firestoreDb, name), orderBy('createdAt', 'desc')));
  return snapshot.docs.map(normalizeDoc);
}

export function onSessionChanged(callback) {
  if (!isFirebaseConfigured) {
    callback(mockApi.getSession());
    return () => {};
  }

  return onAuthStateChanged(firebaseAuth, async (authUser) => {
    if (!authUser) {
      callback(null);
      return;
    }
    const profile = await getDoc(doc(firestoreDb, 'users', authUser.uid));
    callback(profile.exists() ? normalizeDoc(profile) : null);
  });
}

export async function loginUser(email, password) {
  assertFirebase();
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  const profile = await getDoc(doc(firestoreDb, 'users', credential.user.uid));
  if (!profile.exists()) throw new Error('El usuario no tiene perfil asignado');
  return normalizeDoc(profile);
}

export async function registerClient(payload) {
  assertFirebase();
  const credential = await createUserWithEmailAndPassword(firebaseAuth, payload.email, payload.password);
  const user = {
    id: credential.user.uid,
    name: payload.name,
    email: payload.email,
    phone: payload.phone || '',
    role: 'client',
    createdAt: Date.now()
  };
  await setDoc(doc(firestoreDb, 'users', credential.user.uid), user);
  return user;
}

export async function logoutUser() {
  assertFirebase();
  await signOut(firebaseAuth);
}

export async function getTours() {
  return getCollection('tours');
}

export async function upsertTour(tour) {
  assertFirebase();
  const id = tour.id || String(Date.now());
  const nextTour = {
    ...tour,
    id,
    price: Number(tour.price),
    agencyId: String(tour.agencyId),
    capacity: Number(tour.capacity),
    spotsLeft: Number(tour.spotsLeft),
    rating: Number(tour.rating || 4.5),
    reviews: Number(tour.reviews || 0),
    available: tour.available !== false,
    updatedAt: Date.now(),
    createdAt: tour.createdAt || Date.now()
  };
  await setDoc(doc(firestoreDb, 'tours', id), nextTour, { merge: true });
  return nextTour;
}

export async function getAgencies() {
  return getCollection('agencies');
}

export async function addAgency(agency) {
  assertFirebase();
  const nextAgency = {
    ...agency,
    rating: 4.5,
    totalReviews: 0,
    verified: true,
    totalTours: 0,
    yearsActive: Number(agency.yearsActive || 1),
    createdAt: Date.now()
  };
  const ref = await addDoc(collection(firestoreDb, 'agencies'), nextAgency);
  await updateDoc(ref, { id: ref.id });
  return { ...nextAgency, id: ref.id };
}

export async function getUsers() {
  return getCollection('users');
}

export async function getBookings() {
  return getCollection('bookings');
}

export async function addBooking(booking) {
  assertFirebase();
  const nextBooking = { ...booking, createdAt: Date.now() };
  const ref = await addDoc(collection(firestoreDb, 'bookings'), nextBooking);
  await updateDoc(ref, { id: ref.id });
  return [{ ...nextBooking, id: ref.id }];
}

export async function updateBookingStatus(id, status) {
  assertFirebase();
  await updateDoc(doc(firestoreDb, 'bookings', id), { status, updatedAt: Date.now() });
  return getBookings();
}

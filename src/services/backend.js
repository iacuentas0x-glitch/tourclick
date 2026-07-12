import { isFirebaseConfigured } from '../config/firebase.js';
import * as firebaseApi from './firebaseApi.js';
import * as mockApi from './mockApi.js';

export const backendDriver = import.meta.env.VITE_BACKEND_DRIVER || 'mock';

export function usingFirebase() {
  return backendDriver === 'firebase' && isFirebaseConfigured;
}

export const api = usingFirebase() ? firebaseApi : mockApi;

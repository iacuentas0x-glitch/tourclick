export const tourclickPaymentConfig = {
  yapeQrImage: import.meta.env.VITE_TOURCLICK_YAPE_QR || `${import.meta.env.BASE_URL}payments/tourclick-yape-qr.jpeg`,
  yapeOwner: import.meta.env.VITE_TOURCLICK_YAPE_OWNER || 'TourClick',
  yapePhone: import.meta.env.VITE_TOURCLICK_YAPE_PHONE || ''
};

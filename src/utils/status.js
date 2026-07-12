export const bookingStatusMap = {
  pending_yape_validation: {
    label: 'Pendiente Yape',
    tone: 'warning',
    description: 'El admin valida el pago recibido en la cuenta Yape de TourClick.'
  },
  pending_virtual_validation: {
    label: 'Pago por validar',
    tone: 'warning',
    description: 'El admin valida la operacion bancaria o virtual.'
  },
  pending_cash_validation: {
    label: 'Voucher efectivo',
    tone: 'neutral',
    description: 'La empresa valida el voucher cuando el cliente llega al punto de atencion.'
  },
  confirmed: {
    label: 'Confirmada',
    tone: 'success',
    description: 'Reserva validada y lista para operar.'
  },
  cancelled: {
    label: 'Cancelada',
    tone: 'danger',
    description: 'Reserva cancelada.'
  }
};

export function getBookingStatus(status) {
  return bookingStatusMap[status] || {
    label: status || 'Sin estado',
    tone: 'neutral',
    description: 'Estado no clasificado.'
  };
}

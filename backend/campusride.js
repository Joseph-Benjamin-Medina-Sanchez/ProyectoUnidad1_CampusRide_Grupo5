class CampusRideSystem {
  constructor() {
    this.users = [];
    this.trips = [];
    this.bookings = [];
    this.ratings = [];
  }
  
  registerUser(name, email, password, role = 'Pasajero') {
    const espeRegex = /^[a-zA-Z0-9._%+-]+@espe\.edu\.ec$/;
    if (!espeRegex.test(email)) {
      throw new Error('Debe utilizar un correo institucional válido');
    }
    if (!name || !password || password.length < 6) {
      throw new Error('Datos de registro incompletos o contraseña insegura');
    }
    const newUser = { id: `USR-${this.users.length + 1}`, name, email, role };
    this.users.push(newUser);
    return { message: 'Registro exitoso', user: newUser };
  }

  publishRoute({ id, driverEmail, origin, destination, date, departureTime, availableSeats, isFutureTime = true, stops = [] }) {
    if (availableSeats < 1 || availableSeats > 4 || !isFutureTime) {
      throw new Error('Ingrese entre 1 y 4 cupos y un horario futuro');
    }
    const newTrip = {
      id: id || `TRIP-10${this.trips.length + 1}`,
      driverEmail,
      origin,
      destination,
      date,
      departureTime,
      availableSeats,
      status: 'Disponible', 
      stops: stops.map((stopName, index) => ({ order: index + 1, name: stopName, passengers: [] })),
      confirmedPassengers: []
    };
    this.trips.push(newTrip);
    return newTrip;
  }

  searchTrips(origin, destination, date) {
    const results = this.trips.filter(
      t => t.status === 'Disponible' &&
           t.availableSeats > 0 &&
           t.origin.toLowerCase() === origin.toLowerCase() &&
           t.destination.toLowerCase() === destination.toLowerCase() &&
           t.date === date
    );
    if (results.length === 0) {
      return { message: 'No se encontraron viajes disponibles para los criterios seleccionados', trips: [] };
    }
    return { message: 'OK', trips: results };
  }

  getConfirmedPassengers(tripId) {
    const trip = this.trips.find(t => t.id === tripId);
    if (!trip) throw new Error('Viaje no encontrado');
    if (trip.confirmedPassengers.length === 0) {
      return { message: 'Aún no tienes pasajeros confirmados para este viaje', passengers: [] };
    }
    return { message: 'OK', passengers: trip.confirmedPassengers };
  }

  requestSeat(tripId, passengerName, passengerEmail, pickupPoint = 'Origen Principal') {
    const trip = this.trips.find(t => t.id === tripId);
    if (!trip) throw new Error('Viaje no encontrado');
    if (trip.availableSeats <= 0) {
      throw new Error('Cupos Agotados');
    }
    const booking = {
      id: `BKG-${this.bookings.length + 1}`,
      tripId,
      passengerName,
      passengerEmail,
      pickupPoint,
      status: 'Pendiente',
      uiButtonLabel: 'Solicitud Enviada',
      uiButtonDisabled: true
    };
    this.bookings.push(booking);
    return booking;
  }

  respondToBooking(bookingId, action) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Solicitud no encontrada');
    const trip = this.trips.find(t => t.id === booking.tripId);

    if (action === 'Aceptar') {
      if (trip.availableSeats <= 0) {
        throw new Error('No se puede aceptar la solicitud: Cupos Agotados (0 disponibles)');
      }
      booking.status = 'Aceptada';
      trip.availableSeats -= 1;
      trip.confirmedPassengers.push({
        name: booking.passengerName,
        email: booking.passengerEmail,
        pickupPoint: booking.pickupPoint,
        status: 'Confirmado'
      });

      const matchedStop = trip.stops.find(s => s.name.toLowerCase() === booking.pickupPoint.toLowerCase());
      if (matchedStop) {
        matchedStop.passengers.push(booking.passengerName);
      }
    } else if (action === 'Rechazar') {
      booking.status = 'Rechazada';
    }
    return { booking, remainingSeats: trip.availableSeats };
  }

  startTrip(tripId) {
    const trip = this.trips.find(t => t.id === tripId);
    if (!trip) throw new Error('Viaje no encontrado');
    trip.status = 'En Curso';
    return { status: trip.status, canFinish: true };
  }

  finishTrip(tripId) {
    const trip = this.trips.find(t => t.id === tripId);
    if (!trip) throw new Error('Viaje no encontrado');
    // Corrección BUG-02: Bloqueo de finalización sin inicio previo
    if (trip.status !== 'En Curso') {
      throw new Error('No se puede finalizar un viaje que no ha sido iniciado (Botón Finalizar Deshabilitado)');
    }
    trip.status = 'Completado';
    return { status: trip.status, ratingEnabled: true };
  }
}

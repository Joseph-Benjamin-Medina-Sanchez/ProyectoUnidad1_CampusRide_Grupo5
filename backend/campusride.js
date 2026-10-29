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
}
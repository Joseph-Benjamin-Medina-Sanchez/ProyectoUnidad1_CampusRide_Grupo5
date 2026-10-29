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
}
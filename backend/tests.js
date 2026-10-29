
const assert = require('assert');
const CampusRideSystem = require('./campusride');

console.log('====================================================');
console.log(' INICIANDO EJECUCIÓN DE PRUEBAS CI - CAMPUSRIDE ESPE');
console.log('====================================================\n');

const app = new CampusRideSystem();

const resTest01 = app.registerUser('César Vargas', 'cavargas@espe.edu.ec', 'Segura123!', 'Conductor');
assert.strictEqual(resTest01.message, 'Registro exitoso');
console.log(' TEST-01 [PASS]: Registro exitoso con correo institucional @espe.edu.ec (HU-01)');

assert.throws(() => {
  app.registerUser('Usuario Externo', 'usuario.externo@gmail.com', 'Segura123!', 'Pasajero');
}, /Debe utilizar un correo institucional válido/);
console.log(' TEST-02 [PASS]: Bloqueo de registro con correo externo @gmail.com (HU-01)');

const trip101 = app.publishRoute({
  id: 'TRIP-101',
  driverEmail: 'cavargas@espe.edu.ec',
  origin: 'Valle de los Chillos',
  destination: 'Campus ESPE',
  date: '2026-10-26',
  departureTime: '06:45',
  availableSeats: 3
});
assert.strictEqual(trip101.status, 'Disponible');
assert.strictEqual(trip101.availableSeats, 3);
console.log(' TEST-03 [PASS]: Publicación de ruta válida con 3 cupos disponibles (HU-02)');

const startSearch = performance.now();
const searchRes = app.searchTrips('Valle de los Chillos', 'Campus ESPE', '2026-10-26');
const searchTime = performance.now() - startSearch;
assert.strictEqual(searchRes.trips.length, 1);
assert.ok(searchTime <= 1500, 'Tiempo de búsqueda excede RNF-01 (1.5s)');
console.log(` TEST-04 [PASS]: Búsqueda y filtrado de viajes en ${searchTime.toFixed(2)} ms < 1.5s (HU-03)`);

app.publishRoute({
  id: 'TRIP-102',
  driverEmail: 'cavargas@espe.edu.ec',
  origin: 'Sangolquí',
  destination: 'Campus ESPE',
  date: '2026-10-26',
  departureTime: '07:00',
  availableSeats: 1
});

const bookingA = app.requestSeat('TRIP-102', 'Estudiante A', 'estudiantea@espe.edu.ec', 'Parque Infantil Sangolquí');
const bookingB = app.requestSeat('TRIP-102', 'Estudiante B', 'estudianteb@espe.edu.ec', 'Parque Infantil Sangolquí');
assert.strictEqual(bookingA.status, 'Pendiente');
assert.strictEqual(bookingA.uiButtonLabel, 'Solicitud Enviada');
assert.strictEqual(bookingA.uiButtonDisabled, true);
console.log(' TEST-05 [PASS]: Envío de solicitud de cupo y botón en estado Solicitud Enviada (HU-04)');

const acceptA = app.respondToBooking(bookingA.id, 'Aceptar');
assert.strictEqual(acceptA.remainingSeats, 0);
assert.throws(() => {
  app.respondToBooking(bookingB.id, 'Aceptar');
}, /Cupos Agotados/);
console.log(' TEST-06 [PASS - Reprobado tras BUG-01]: Bloqueo de aceptación cuando cupos llegan a 0 (HU-05)');

const confirmedList = app.getConfirmedPassengers('TRIP-102');
assert.strictEqual(confirmedList.passengers.length, 1);
assert.strictEqual(confirmedList.passengers[0].name, 'Estudiante A');
console.log(' TEST-07 [PASS]: Visualización de lista de pasajeros confirmados en la ruta (HU-06)');

assert.throws(() => {
  app.finishTrip('TRIP-102');
}, /No se puede finalizar un viaje que no ha sido iniciado/);
app.startTrip('TRIP-102');
const finishedTrip = app.finishTrip('TRIP-102');
assert.strictEqual(finishedTrip.status, 'Completado');
console.log(' TEST-08 [PASS - Reprobado tras BUG-02]: Validación de transición En Curso antes de Finalizar Viaje (HU-07)');

const rating = app.rateTrip('TRIP-102', 'estudiantea@espe.edu.ec', 5, 'Viaje puntual y seguro');
assert.strictEqual(rating.readOnly, true);
const historyRes = app.getUserHistory('estudiantea@espe.edu.ec');
assert.strictEqual(historyRes.history.length, 1);
assert.strictEqual(historyRes.history[0].rating, '5★');
console.log(' TEST-09 [PASS]: Calificación de 5 estrellas y registro en Historial del usuario (HU-08 / HU-09)');

const tripCR01 = app.publishRoute({
  id: 'TRIP-103',
  driverEmail: 'cavargas@espe.edu.ec',
  origin: 'San Luis Shopping',
  destination: 'Campus ESPE',
  date: '2026-10-26',
  departureTime: '06:45',
  availableSeats: 2,
  stops: ['Triángulo de San Rafael', 'Parque Infantil Sangolquí']
});
assert.strictEqual(tripCR01.stops.length, 2);
assert.strictEqual(tripCR01.stops[0].name, 'Triángulo de San Rafael');
console.log(' TEST-10 [PASS - Evolución]: Creación de paradas intermedias ordenadas en la ruta (CR-01)');

const suggestion = app.suggestSmartStop('TRIP-103', 'San Rafael');
assert.strictEqual(suggestion.label, 'Parada Inteligente Sugerida: Triángulo de San Rafael');
const bookingCR01 = app.requestSeat('TRIP-103', 'Edwin Gómez', 'egomez@espe.edu.ec', suggestion.suggestedStop);
const acceptCR01 = app.respondToBooking(bookingCR01.id, 'Aceptar');
assert.strictEqual(acceptCR01.remainingSeats, 1);
assert.ok(tripCR01.stops[0].passengers.includes('Edwin Gómez'));
console.log(` TEST-11 [PASS - Evolución]: Sugerencia de Parada Inteligente en ${suggestion.executionTimeMs} ms y actualización de itinerario (CR-01)`);

console.log('\n====================================================');
console.log(' RESULTADO FINAL: 11/11 TESTS EJECUTADOS EN ESTADO PASS');
console.log('====================================================');
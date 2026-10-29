const UIController = {
  validateInstitutionalEmail(email) {
    return /^[a-zA-Z0-9._%+-]+@espe\.edu\.ec$/.test(email);
  },
  getFinishButtonState(tripStatus) {
    // Corrección BUG-02 en UI: deshabilitado si no está 'En Curso'
    return { disabled: tripStatus !== 'En Curso' };
  },
  getAcceptButtonState(availableSeats) {
    // Corrección BUG-01 en UI: deshabilitado cuando asientos libres llegan a 0
    return { disabled: availableSeats <= 0 };
  }
};

if (typeof module !== 'undefined') {
  module.exports = UIController;
}
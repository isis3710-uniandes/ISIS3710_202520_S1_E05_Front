/// <reference types="cypress" />
export {};

beforeEach(() => {
  // Limpia TODO el localStorage
  cy.clearLocalStorage();

  // …y por si quieres limpiar claves puntuales:
  cy.window().then((win) => {
    win.localStorage.removeItem("_notifications_v1");
    win.localStorage.removeItem("_demo_orgs");
  });
});

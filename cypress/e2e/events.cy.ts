describe("Eventos", () => {
  const route = "/orgs/demo"; // AJUSTA si tu ruta real es otra

  function fmtLocal(dt: Date) {
    const p = (n: number) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}T${p(dt.getHours())}:${p(dt.getMinutes())}`;
  }

  beforeEach(() => {
    cy.visit(route);
  });

  it("crea evento PERSONAL (no compartido)", () => {
    const now = new Date();
    const in1h = new Date(now.getTime() + 60 * 60 * 1000);

    cy.get('[data-cy="event-title"]').type("Revisión de PR");
    cy.get('[data-cy="event-start"]').clear().type(fmtLocal(now));
    cy.get('[data-cy="event-end"]').clear().type(fmtLocal(in1h));

    // desmarcar 'compartir con la org' si está marcado por defecto
    cy.get('[data-cy="event-share"]').then(($cb) => {
      if ($cb.is(":checked")) cy.wrap($cb).uncheck({ force: true });
    });

    cy.get('[data-cy="event-create"]').click();

    cy.get('[data-cy="event-list"]').should("contain", "Revisión de PR");
    cy.contains('[data-cy="event-item"]', "Revisión de PR").should("contain", "PERSONAL");
  });

  it("crea evento COMPARTIDO con la organización (ORG)", () => {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 60 * 1000);

    cy.get('[data-cy="event-title"]').type("Daily standup");
    cy.get('[data-cy="event-start"]').clear().type(fmtLocal(now));
    cy.get('[data-cy="event-end"]').clear().type(fmtLocal(in30));

    cy.get('[data-cy="event-share"]').check({ force: true });
    cy.get('[data-cy="event-create"]').click();

    cy.contains('[data-cy="event-item"]', "Daily standup").should("contain", "ORG");
  });

  it.skip("borra un evento (pendiente: la UI actual no tiene botón de borrar)", () => {
    // Cuando agregues el botón de eliminar evento, activamos esta prueba.
  });
});

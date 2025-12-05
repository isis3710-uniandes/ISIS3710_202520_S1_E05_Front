// cypress/e2e/crear_organizacion.cy.ts
describe("Crear Organización (nombre obligatorio + correos con ENTER)", () => {
  const route = "/organizacion";
  const ORG_NAME = "Org Demo X";
  const EMAILS = ["alice@demo.com", "bob@demo.com"];

  // Busca un input asociado a un <label>/placeholder que coincida con el regex
  function getInputByLabelOrPlaceholder(re: RegExp) {
    return cy.get("body").then(($body) => {
      // 1) label visible
      const label = $body
        .find("label")
        .toArray()
        .find((el) => re.test(el.textContent || ""));

      if (label) {
        const $container = Cypress.$(label).parent();
        let $input = $container.find("input");
        if ($input.length === 0) $input = $container.parent().find("input");
        if ($input.length > 0) return cy.wrap($input.first());
      }

      // 2) placeholder
      const inputByPh = $body
        .find("input[placeholder]")
        .toArray()
        .find((el) => re.test(el.getAttribute("placeholder") || ""));
      if (inputByPh) return cy.wrap(inputByPh);

      // 3) name/id (por si usas name="email" / id="email")
      const inputByNameOrId = $body
        .find("input[name], input[id]")
        .toArray()
        .find(
          (el) =>
            re.test(el.getAttribute("name") || "") ||
            re.test(el.getAttribute("id") || "")
        );
      if (inputByNameOrId) return cy.wrap(inputByNameOrId);

      throw new Error(`No encontré input para ${re}`);
    });
  }

  // Hace clic en un “botón” (button, [role=button], a, div, span) por regex de texto
  function clickByText(re: RegExp) {
    return cy.get("body").then(($body) => {
      const el = $body
        .find("button, [role='button'], a, div, span")
        .toArray()
        .find((n) => re.test(n.textContent || ""));
      if (!el) throw new Error(`No encontré botón con texto ${re}`);
      return cy.wrap(el).click({ force: true });
    });
  }

  // Confirma que una cadena aparece en la UI (en select, lista o texto general)
  function expectNameToAppear(name: string) {
    // 1) algun <select> contiene la opción
    cy.get("select", { timeout: 8000 })
      .then(($sels) => {
        const inSelect = Array.from($sels).some((s) =>
          (s.textContent || "").includes(name)
        );
        if (inSelect) {
          expect(true).to.eq(true);
          return;
        }
        // 2) en listas <ul>/<ol> (li), o en tarjetas <div>
        const inList = Array.from($sels.parents().toArray()).some((p) =>
          (p.textContent || "").includes(name)
        );
        if (inList) {
          expect(true).to.eq(true);
          return;
        }
        // 3) texto general (fallback con retry)
        cy.contains(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), {
          timeout: 8000,
        }).should("exist");
      });
  }

  it("flujo completo: nombre + emails (ENTER) + crear", () => {
    cy.visit(route);

    // Si tu UI tiene un botón para abrir el formulario, intenta variantes comunes:
    cy.get("body", { timeout: 8000 }).then(($body) => {
      const trigger = $body
        .find("button, [role='button'], a, div, span")
        .toArray()
        .find((n) =>
          /(Nueva|Crear|Agregar|Add|New)\s+organizaci[oó]n|\+\s*organizaci[oó]n/i.test(
            n.textContent || ""
          )
        );
      if (trigger) cy.wrap(trigger).click({ force: true });
    });

    // 1) Nombre (obligatorio)
    getInputByLabelOrPlaceholder(/nombre/i).then(($inp) => {
      cy.wrap($inp).clear().type(ORG_NAME);
    });

    // 2) Correos: escribir y presionar ENTER tras cada uno
    EMAILS.forEach((mail) => {
      getInputByLabelOrPlaceholder(/correo|email|e-?mail/i).then(($inp) => {
        cy.wrap($inp).clear().type(`${mail}{enter}`);
      });
    });

    // 3) Crear organización (“Crear organización”, “Crear” o “Create”)
    clickByText(/(Crear\s+organizaci[oó]n|^Crear$|Create)/i);

    // 4) Verificar que aparece la nueva organización en la UI
    expectNameToAppear(ORG_NAME);
  });
});

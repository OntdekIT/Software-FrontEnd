// End-to-end login-flow tegen een echte stack (backend + MariaDB + MailHog).
// De seed-admin logt in, de mailcode wordt uit MailHog gehaald en ingevuld,
// waarna de gebruiker is ingelogd.
//
// Config via Cypress-env (met defaults voor lokaal):
//   baseUrl        - waar de frontend draait (default http://localhost:5173)
//   mailhogUrl     - MailHog HTTP API (default http://localhost:8025)
//   adminEmail     - seed-admin e-mail (default admin@example.com)
//   adminPassword  - seed-admin wachtwoord (default Admin123!)

const APP = Cypress.env('baseUrl') || 'http://localhost:5173';
const MAILHOG = Cypress.env('mailhogUrl') || 'http://localhost:8025';
const EMAIL = Cypress.env('adminEmail') || 'admin@example.com';
const PASSWORD = Cypress.env('adminPassword') || 'Admin123!';

describe('Login als admin met mailverificatie', () => {
  beforeEach(() => {
    // Leeg de mailbox zodat we straks de juiste (nieuwste) code pakken.
    cy.request('DELETE', `${MAILHOG}/api/v1/messages`);
  });

  it('logt in en bevestigt met de gemailde code', () => {
    // Ga direct naar de loginpagina (de navbar-loginknop zit op smalle
    // viewports in het ingeklapte mobiele menu).
    cy.visit(`${APP}/auth/login`);

    cy.get('#email').type(EMAIL);
    cy.get('#password').type(PASSWORD);
    cy.get('[data-testid="Login"]').click();

    // Het verify-scherm verschijnt (mailcode is verstuurd).
    cy.get('#code', { timeout: 10000 }).should('be.visible');

    // Haal de 6-cijferige code uit de laatste mail in MailHog.
    cy.waitForMailCode(MAILHOG).then((code) => {
      cy.get('#code').type(code);
      cy.get('[data-testid="verifyCode"]').click();
    });

    // Na succesvolle verificatie ben je ingelogd en niet meer op de auth-pagina.
    cy.url({ timeout: 10000 }).should('not.include', '/auth/login');
    cy.window().its('localStorage.token').should('exist');
  });
});

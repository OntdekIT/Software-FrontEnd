// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import { MailSlurp } from "mailslurp-client";

// The API key is injected at runtime (see cypress.config.js) from the
// MAILSLURP_API_KEY environment variable. It must never be hardcoded here.
const mailslurpApiKey = () => {
  const apiKey = Cypress.env("MAILSLURP_API_KEY");
  if (!apiKey) {
    throw new Error("MAILSLURP_API_KEY is not set. Provide it via the CYPRESS_MAILSLURP_API_KEY environment variable.");
  }
  return apiKey;
};

Cypress.Commands.add("createInbox", () => {
  const mailslurp = new MailSlurp({ apiKey: mailslurpApiKey() });
  return mailslurp.createInbox();
});

Cypress.Commands.add("waitForLatestEmail", (inboxId, timeout = 30000) => {
  const mailslurp = new MailSlurp({ apiKey: mailslurpApiKey() });
  return mailslurp.waitForLatestEmail(inboxId, timeout);
});

// Haalt de 6-cijferige verificatiecode uit de nieuwste mail in MailHog.
// Pollt tot er een mail met code is (of tot de retries op zijn).
Cypress.Commands.add("waitForMailCode", (mailhogUrl, retries = 20) => {
  const poll = (attemptsLeft) => {
    return cy
      .request(`${mailhogUrl}/api/v2/messages?limit=1`)
      .then((res) => {
        const items = res.body.items || [];
        const body = items.length ? items[0].Content.Body : "";
        const match = body.match(/<h1>\s*(\d{6})\s*<\/h1>/);
        if (match) {
          return match[1];
        }
        if (attemptsLeft <= 0) {
          throw new Error("Geen verificatiecode gevonden in MailHog");
        }
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        return cy.wait(500).then(() => poll(attemptsLeft - 1));
      });
  };
  return poll(retries);
});
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
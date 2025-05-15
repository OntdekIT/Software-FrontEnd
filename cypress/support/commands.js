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

Cypress.Commands.add("createInbox", () => {
  const mailslurp = new MailSlurp({ apiKey: "d3a01844b2f28cd6fd6d07da59b2b5b3771e09d34d8b262ba8edbcd2b1d888ee" });
  return mailslurp.createInbox();
});

Cypress.Commands.add("waitForLatestEmail", (inboxId, timeout = 30000) => {
  const mailslurp = new MailSlurp({ apiKey: "d3a01844b2f28cd6fd6d07da59b2b5b3771e09d34d8b262ba8edbcd2b1d888ee" });
  return mailslurp.waitForLatestEmail(inboxId, timeout);
});
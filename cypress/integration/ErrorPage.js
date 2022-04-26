/// <reference types="Cypress" />

describe("render the errorpage", () => {
  it("renders correctly", () => {
    cy.visit("hoi");
    cy.get("h1").should("exist").should("have.text", "Oops!");
  });
});

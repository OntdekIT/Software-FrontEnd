/// <reference types="Cypress" />

describe("Error page tests", () => {

    it("renders correctly", () => {
        //cy.visit("admin");
        //cy.url().should('be.equal', 'http://localhost:3000/login')
        cy.visit("hoi");
        cy.get("h1").should("exist").should("have.text", "Oops!");
    });


});


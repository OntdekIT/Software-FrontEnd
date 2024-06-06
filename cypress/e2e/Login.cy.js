/// <reference types="Cypress" />

describe("Log in page tests", () => {


  it("should login", () => {
    const User = {
      email: "admin@gmail.com",
      password: "admin",
    };

    cy.intercept(
      "POST",
      "http://localhost:8082/api/Authentication/login",
      {}
    ).as("tryLogin");

    cy.visit("/login");

    cy.get("#email").type(User.email);
    cy.get("#password").type(User.password);

    cy.get("button").click();

    cy.wait("@tryLogin").then((interception) => {
      const expectedValue = {
        email: User.email,
        password: User.password,
      };
      expect(JSON.stringify(interception.request.body)).equal(
        JSON.stringify(expectedValue)
      );
    });
  });


});

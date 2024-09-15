it("Should POST the correct json", () => {
  const username = "Piet";
  const email = "test@email.com";
  const password = "Test123@";

  cy.intercept(
    "POST",
    "http://localhost:8082/api/Authentication/register",
    {}
  ).as("addUser");
  cy.visit("/Signup");

  cy.get(":nth-child(2) > .form-control").type(username);
  cy.get(":nth-child(4) > .form-control").type(email);
  cy.get(":nth-child(6) > .form-control").type(password);
  cy.get(":nth-child(8) > .form-control").type(password);

  cy.get(".form-input-btn").click();

  cy.wait("@addUser").then((interception) => {
    const expectedValue = {
      username: username,
      email: email,
      password: password,
    };
    expect(JSON.stringify(interception.request.body)).equal(
      JSON.stringify(expectedValue)
    );
  });
});

describe("See if data isn't posted", () => {
  const username = "Piet";
  const email = "test@email.com";
  const password = "Test123@";

  it("shouldn't post username data", () => {
    cy.visit("/Signup");

    cy.get(":nth-child(2) > .form-control");
    cy.get(":nth-child(4) > .form-control").type(email);
    cy.get(":nth-child(6) > .form-control").type(password);
    cy.get(":nth-child(8) > .form-control").type(password);

    cy.get(".form-input-btn").click();

    cy.get(":nth-child(2) > .form-control").should("have.length", 1);
    cy.get(":nth-child(2) > .form-control").then(($input) => {
      expect($input[0].validationMessage).to.eq("Vul dit veld in.");
    });
  });

  it("shouldn't post email data", () => {
    cy.visit("/Signup");

    cy.get(":nth-child(2) > .form-control").type(username);
    cy.get(":nth-child(4) > .form-control");
    cy.get(":nth-child(6) > .form-control").type(password);
    cy.get(":nth-child(8) > .form-control").type(password);

    cy.get(".form-input-btn").click();

    cy.get(":nth-child(4) > .form-control").should("have.length", 1);
    cy.get(":nth-child(4) > .form-control").then(($input) => {
      expect($input[0].validationMessage).to.eq("Vul dit veld in.");
    });
  });

  it("shouldn't post password data", () => {
    cy.visit("/Signup");

    cy.get(":nth-child(2) > .form-control").type(username);
    cy.get(":nth-child(4) > .form-control").type(email);
    cy.get(":nth-child(6) > .form-control");
    cy.get(":nth-child(8) > .form-control").type(password);

    cy.get(".form-input-btn").click();

    cy.get(":nth-child(6) > .form-control").should("have.length", 1);
    cy.get(":nth-child(6) > .form-control").then(($input) => {
      expect($input[0].validationMessage).to.eq("Vul dit veld in.");
    });
  });

  it("shouldn't post repeat password data", () => {
    cy.visit("/Signup");

    cy.get(":nth-child(2) > .form-control").type(username);
    cy.get(":nth-child(4) > .form-control").type(email);
    cy.get(":nth-child(6) > .form-control").type(password);
    cy.get(":nth-child(8) > .form-control");

    cy.get(".form-input-btn").click();

    cy.get(":nth-child(8) > .form-control").should("have.length", 1);
    cy.get(":nth-child(8) > .form-control").then(($input) => {
      expect($input[0].validationMessage).to.eq("Vul dit veld in.");
    });
  });
});

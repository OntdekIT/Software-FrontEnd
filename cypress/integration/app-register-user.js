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

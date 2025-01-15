describe('try logging in as an admin succes', () => {
  it('Logs in the admin', () => {
    cy.visit('http://localhost:5173/');

    cy.get('[data-testid="LoginButton"]').click();

    cy.get('#email').type('ontdekstation.test@gmail.com');

    cy.get('#password').type('Qwerty123!');

    cy.get('[data-testid="Login"]').click();
  })
})
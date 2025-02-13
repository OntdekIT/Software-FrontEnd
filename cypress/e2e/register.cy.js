describe('try registering a new account', () => {
  it('registers a new account succesfully', () => {
    cy.visit('http://localhost:5173/');

    cy.get('[data-testid="LoginButton"]').click();

    cy.get('[data-testid="RegisterButton"]').click();
  })
})
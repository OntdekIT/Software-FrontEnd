describe('Account page', () => {
    
    beforeEach(() => {
        cy.visit("http://localhost:3000/");
    })
    
    it.only('Loads stations on click', () =>{
        cy.server();
        cy.visit("http://localhost:3000/account");

        // Assert station
        cy.contains('breda');
        cy.contains('tilburg')

        // Click labels
        cy.contains('tilburg').click();

        // Assert correct data for station
        cy.contains('Naam: tilburg');
        cy.contains('Locatie: 2');
        cy.contains('Hoogte: 2');
        cy.contains('Lengtegraad: 2');
        cy.contains('Breedtegraad: 2');
    })
}) 
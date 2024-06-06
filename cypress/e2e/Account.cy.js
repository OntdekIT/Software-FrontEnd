
/// <reference types = "cypress"/>

describe('Account page tests', () => {
    

    it('Loads stations on account page for user 1', () =>{
        cy.intercept('GET', /\/api\/Station\/user\/[0-9]+$/, { fixture: 'account-1-page.json'}).as('getStations');

        cy.visit("http://localhost:3000/Account");
        cy.wait("@getStations");

        // Assert station
        cy.contains('Test one');
        cy.contains('Second Station');
        cy.contains('Final Test');
    })


}) 
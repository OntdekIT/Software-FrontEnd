import Account from "../../src/Pages/Account";

/// <reference types = "cypress"/>

describe('Account page', () => {
    
    beforeEach(() => {
        cy.visit("http://localhost:3000/");
    })
    
    it.only('Loads stations on account page for user 1', () =>{
        cy.server();
        cy.contains('Home');
        cy.request("http://localhost:8082/api/Station/user/1");
        cy.visit("http://localhost:3000/account");

        // Assert station
        cy.contains('breda');
        cy.contains('tilburg')
    })
}) 

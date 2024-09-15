describe('Account page tests', () => {
    

    it('Loads stations on click', () =>{

        cy.intercept('GET', /\/api\/Station\/user\/[0-9]+$/, { fixture: 'account-1-page.json'}).as('getAllStations');
        cy.intercept('GET', /\/api\/Station\/[0-9]+$/, { fixture: 'station-1-page.json'}).as('getStationOne') 

        cy.visit("http://localhost:3000/Account");
        cy.wait("@getAllStations");

        // Click first label
        cy.get('table > ul > :nth-child(1) > a').click();

        cy.wait("@getStationOne");

        // Assert correct data for station
        cy.contains('Naam: Test one');
        cy.contains('Locatie: Name of location');
        cy.contains('Hoogte: 2.5');
        cy.contains('Lengtegraad: 2569.6');
        cy.contains('Breedtegraad: 77036');
    })


}) 
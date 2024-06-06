/// <reference types="Cypress" />

describe("See average data from the map", () => {
        
    it("shouldn't show data", () => {
        
        cy.intercept('GET', 'http://localhost:8082/api/Sensor/average', {}).as("averageData");
        cy.visit("/Map");
        
        cy.get(".legend > p").should("exist").should("have.text", "Geen algemene data gevonden");
    })
    
    
    it("should show data", () => {
        cy.intercept('GET', 'http://localhost:8082/api/Sensor/average', {fixture: 'mock_avgData.json'}).as("averageData");
        cy.visit("/Map");
        
        cy.get("h4").should("exist").should("have.text", "Algemene data");
        cy.get(".legend > ul > :nth-child(1)").contains("Temperatuur: 15");
        
        cy.wait("@averageData").then(inter => {
            //cy.log(JSON.stringify(inter))
            console.log(JSON.stringify(inter))
        });
    })
})
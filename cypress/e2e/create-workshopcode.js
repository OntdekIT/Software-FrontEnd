import {wait} from "@testing-library/user-event/dist/utils";

describe("Register station page tests", () => {
    it("Should POST the correct json WITHOUT public check", () => {
        cy.reload();

        const length = 6;
        const durationMin = 15;
        const creationDate = Date.now();
        const expirationDate = new Date(creationDate + durationMin * 60 * 1000);
        const code = '';

        cy.visit("/Admin/workshopcode/create");

        wait(10000);

        cy.get('.col-2 select').eq(0).select('4 uur');
        cy.get('.col-2 select').eq(1).select('6 cijfers');

        cy.get('.button2').click();

        cy.intercept('POST', '/Admin/workshopcode/create', (req) => {}).as(
            'codeRequest'
            );

        cy.get("@codeRequest").then((interception) => {
            // Get the value from localStorage
            const workshopcode = localStorage.getItem('workshopcode');

            // Ensure random string has correct length
            expect(workshopcode).to.have.lengthOf(length);
        });

    });
});

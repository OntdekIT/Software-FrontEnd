const get2FACode = require('../scripts/get2FACode.js');

describe('Test empty fields', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.visit('/login');
        cy.get("#email").type("ontdekstation013tests@gmail.com");
        cy.get("#password").type("Superww@1");
        cy.get('form').submit();
        cy.url().should('include', '/login');
        cy.get('title').should('contain', 'Verify');
        
        // Fetch the 2FA code and use it in the test
        cy.wrap(null).then(() => {
          // Listen for the emitted code event
          get2FACode.once('code', (code) => {
            cy.get("#code").type(code); // Type the received code
            cy.get('form').submit();
            cy.visit('/Admin/grantUserAdmin');
          });
        });
    });
    
    it('should show error if all fields are empty', () => {
        cy.get('#submitbutton').contains('Volgende').click();
        cy.get('.error-msg').should('contain', 'Please fill in every field');
    });

    it('should show error if user dropdown is empty', () => {
        cy.get('#selectUserDropdown').select('');
        cy.get('#selectAdminRightsDropdown').select('true');
        cy.get('#submitbutton').contains('Volgende').click();
        cy.get('.error-msg').should('contain', 'Please fill in every field');
    });

    it('should show error if admin rights dropdown is empty', () => {
        cy.get('#selectUserDropdown').select(1);
        cy.get('#selectAdminRightsDropdown').select('');
        cy.get('#submitbutton').contains('Volgende').click();
        cy.get('.error-msg').should('contain', 'Please fill in every field');
    });
});


describe('Test admin', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.setCookie('user-id', '34');
        cy.visit('/Admin/grantUserAdmin');
    });

    it('user 1 should get admin rights', () => {
        cy.get('#selectUserDropdown').select(1);
        cy.get('#selectAdminRightsDropdown').select('true');
        cy.get('#submitbutton').contains('Volgende').click();
        cy.setCookie('user-id', '1');
        cy.visit('/Admin/grantUserAdmin');
        cy.get('h4').should('contain', 'Geef een gebruiker administrator rechten');
    });

    it('user 1 should lose admin rights', () => {
        cy.get('#selectUserDropdown').select(1);
        cy.get('#selectAdminRightsDropdown').select('false');
        cy.get('#submitbutton').contains('Volgende').click();
        cy.setCookie('user-id', '1');
        cy.visit('/Admin/grantUserAdmin');
        cy.get('h1').should('contain', 'Nuh uh');
    });
});

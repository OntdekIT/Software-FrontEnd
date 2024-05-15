describe('Test empty fields', () => {
    beforeEach(() => {
        cy.setCookie('user-id', '34');
        cy.visit('/Admin/grantUserAdmin');
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

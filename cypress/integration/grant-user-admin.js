//this file is cypress/integration/grant-user-admin.js
//import get2FACode from '../scripts/2FAScript.js';

describe('Test empty fields', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.visit('/login');
        cy.get("#email").type("ontdekstation013tests@gmail.com");
        cy.get("#password").type("Superww@1");
        cy.get('form').submit();
        cy.url().should('include', '/login');
        cy.get('title').should('contain', 'Verify');
        const code= 0;
        const Imap = require('imap-simple');
        const { simpleParser } = require('mailparser');
        const imapConfig = {};
      //   const imapConfig = {
      //     imap: {
      //     user: "ontdekstation013tests@gmail.com",
      //     password: "superstation123",
      //     host: 'imap.gmail.com',
      //     port: 993,
      //     tls: true,
      //     tlsOptions: { rejectUnauthorized: false },
      //     authTimeout: 3000
      //     }
      // };
        const connection = Imap.connect(imapConfig);
        connection.openBox('INBOX');
        console.log("amogus");
  
        const searchCriteria = ['UNSEEN'];
        const fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'] };

        const messages = connection.search(searchCriteria, fetchOptions);
        for (let message of messages) {
          const all = message.parts.find(part => part.which === 'TEXT').body;
          const parsed = simpleParser(all);
    
          code = parsed.text.match(/Gebruik deze code bij het inloggen op MB Ontdekt: (\d{6})/)[1];
          connection.end();
        }
        cy.get("#code").type(code); // Type the received code
        cy.get('form').submit();
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
        cy.clearCookies()
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




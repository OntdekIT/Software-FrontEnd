describe("User Registration with Email 2FA", () => {
    it("should register and verify user via email 2FA", () => {
      // Step 1: Create a MailSlurp inbox
      cy.createInbox().then((inbox) => {
        const email = inbox.emailAddress;
        const inboxId = inbox.id;
  
        // Step 2: Visit the registration page and fill out the form
        cy.visit('http://localhost:5173/');

        cy.get('[data-testid="LoginButton"]').click();

        cy.get('[data-testid="RegisterButton"]').click();

        cy.then(function () {
            cy.get('input[id="firstName"]').type('TestVoornaam');
            cy.get('input[id="lastName"]').type('TestAchternaam');
            cy.get('input[id="email"]').type(email);
            cy.get('input[id="password"]').type('TestPassword123');
            cy.get('input[id="confirmPassword"]').type('TestPassword123');
            cy.get('input[id="stationCode"]').type('2000');
            cy.get('input[name="workshopCode"]').type('123456');
            cy.get('[data-testid="Register"]').click();
        })
  
        // Step 3: Wait for the 2FA email
        cy.waitForLatestEmail(inboxId).then((email) => {
          // Step 4: Extract the code from email body (assuming it's a 6-digit code)
          const code = email.body.match(/\d{6}/)[0];
          cy.log("2FA Code:", code);

          // Step 5: Enter the code in the verification field
          cy.get('input[id="code"]').type(code);
          cy.get('[data-testid="verifyCode"]').click();
  
          // Step 6: Confirm registration success
          cy.contains("Welcome").should("be.visible");
        });
      });
    });
  });
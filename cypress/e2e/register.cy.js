describe("User Registration with Email 2FA", () => {
    it("should register and verify user via email 2FA", () => {
      cy.createInbox().then((inbox) => {
        const email = inbox.emailAddress;
        const inboxId = inbox.id;
  
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
  
        cy.waitForLatestEmail(inboxId).then((email) => {
          const code = email.body.match(/\d{6}/)[0];
          cy.log("2FA Code:", code);

          cy.get('input[id="code"]').type(code);
          cy.get('[data-testid="verifyCode"]').click();
        });

        cy.get('[data-testid="Visibility"').select('Zichtbaar')
        cy.get('[data-testid="ClaimMeetstationNext"').click();
        cy.wait(1000);
      });
    });
  });
describe("User Registration with Email 2FA", () => {
    it("should register and verify user via email 2FA", () => {
      cy.createInbox().then((inbox) => {
        
        const inboxId = inbox.id;

        const firstName = "TestFirstName";
        const lastName = "TestLastName";
        const email = inbox.emailAddress;
        const password = "TestPassword123";
        const stationCode = "2000";
        const workshopCode = "123456";

        cy.intercept('POST', '**/authentication/register').as('registerRequest');
        cy.intercept('POST', '**/authentication/verify').as('verifyRequest');
        cy.intercept('PUT', '**/Meetstation/Claim').as('stationClaimRequest');

        cy.then(function () { //Navigates to the correct page
          cy.visit('http://localhost:5173/');
          cy.get('[data-testid="LoginButton"]').click();
          cy.get('[data-testid="RegisterButton"]').click();
        })
        
        cy.then(function () { //Fills in all fields correctly
            cy.get('input[id="firstName"]').type(firstName);
            cy.get('input[id="lastName"]').type(lastName);
            cy.get('input[id="email"]').type(email);
            cy.get('input[id="password"]').type(password);
            cy.get('input[id="confirmPassword"]').type(password);
            cy.get('input[id="stationCode"]').type(stationCode);
            cy.get('input[name="workshopCode"]').type(workshopCode);
            cy.get('[data-testid="Register"]').click();
        })

        cy.wait('@registerRequest').then((interception) => {  //Checks if endpoint returns correctly
          expect(interception.response.statusCode).to.eq(201);
          expect(interception.response.body).to.have.property('id');
          expect(interception.request.body.firstName).to.eq(firstName);
          expect(interception.request.body.lastName).to.eq(lastName);
          expect(interception.request.body.email).to.eq(email);
          expect(interception.response.body).to.have.property('role');
          expect(interception.response.body).to.have.property('stations');
        });
  
        cy.waitForLatestEmail(inboxId).then((email) => {  //Waits for email with verification code and fills it in
          const code = email.body.match(/\d{6}/)[0];
          cy.get('input[id="code"]').type(code);
          cy.get('[data-testid="verifyCode"]').click();
        });
        
        cy.wait('@verifyRequest').then((interception) => {  //Checks if endpoint returns correctly
          expect(interception.response.statusCode).to.eq(200);
        });

        cy.then(function (){  //Selects/fills in all fields correctly
          cy.get('[data-testid="Visibility"').select('Zichtbaar')
          cy.get('[data-testid="ClaimMeetstationNext"]').click();
          cy.get('[data-testid="StationName"]').type('TestStationName');
          cy.get('[data-testid="ClaimMeetstationNext"]').click();
          cy.get('[data-testid="ClaimMeetstationNext"]').click();
        })

        cy.wait('@stationClaimRequest').then((interception) => {  //Checks if endpoint returns correctly
          expect(interception.response.statusCode).to.eq(200);
          expect(interception.request.body).to.eq(null);
        });
      });
    });
  });
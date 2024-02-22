describe("Register station page tests", () => {
  it("Should POST the correct json WITHOUT public check", () => {
    const userId = 1;
    const Stationname = "Piet";
    const Address = "Teststraat 123";
    const Height = "20";
    const Longitude = "20.222";
    const Latitude = "20.1234";
    const IsPublic = false;

    cy.intercept("POST", "http://localhost:8082/api/Station", {}).as(
      "addStation"
    );
    cy.visit("/register");

    cy.get("[placeholder=Name]").type(Stationname);
    cy.get("[placeholder=Adress]").type(Address);
    cy.get(":nth-child(5) > .form-control").type(Height);
    cy.get(":nth-child(6) > .form-control").type(Longitude);
    cy.get(":nth-child(7) > .form-control").type(Latitude);

    cy.get(".btn").click();

    cy.wait("@addStation").then((interception) => {
      const expectedValue = {
        userId: userId,
        stationname: Stationname,
        address: Address,
        height: Height,
        longitude: Longitude,
        latitude: Latitude,
        ispublic: IsPublic,
      };
      expect(JSON.stringify(interception.request.body)).equal(
        JSON.stringify(expectedValue)
      );
    });
  });

  it("Should POST the correct json WITH public check", () => {
    const userId = 1;
    const Stationname = "Piet";
    const Address = "Teststraat 123";
    const Height = "20";
    const Longitude = "20.222";
    const Latitude = "20.1234";
    const IsPublic = true;

    cy.intercept("POST", "http://localhost:8082/api/Station", {}).as(
      "addStation"
    );
    cy.visit("/register");

    cy.get("[placeholder=Name]").type(Stationname);
    cy.get("[placeholder=Adress]").type(Address);
    cy.get(":nth-child(5) > .form-control").type(Height);
    cy.get(":nth-child(6) > .form-control").type(Longitude);
    cy.get(":nth-child(7) > .form-control").type(Latitude);
    cy.get(":nth-child(8) > input").click();

    cy.get(".btn").click();

    cy.wait("@addStation").then((interception) => {
      const expectedValue = {
        userId: userId,
        stationname: Stationname,
        address: Address,
        height: Height,
        longitude: Longitude,
        latitude: Latitude,
        ispublic: IsPublic,
      };
      expect(JSON.stringify(interception.request.body)).equal(
        JSON.stringify(expectedValue)
      );
    });
  });
});

describe("See if data isn't posted", () => {
  const username = "Piet";
  const adress = "Testadres 123";
  const height = "10";
  const longitude = "10";
  const latitude = "10";

  it("shouldn't post username data", () => {
    cy.visit("/register");

    cy.get('[placeholder="Name"]');
    cy.get('[placeholder="Adress"]').type(adress);
    cy.get(":nth-child(5) > .form-control").type(height);
    cy.get(":nth-child(6) > .form-control").type(longitude);
    cy.get(":nth-child(7) > .form-control").type(latitude);

    cy.get(".btn").click();

    cy.get('[placeholder="Name"]').should("have.length", 1);
    cy.get('[placeholder="Name"]').then(($input) => {
      expect($input[0].validationMessage).to.eq("Vul dit veld in.");
    });
  });

  it("shouldn't post adress data", () => {
    cy.visit("/register");

    cy.get('[placeholder="Name"]').type(username);
    cy.get('[placeholder="Adress"]');
    cy.get(":nth-child(5) > .form-control").type(height);
    cy.get(":nth-child(6) > .form-control").type(longitude);
    cy.get(":nth-child(7) > .form-control").type(latitude);

    cy.get(".btn").click();

    cy.get('[placeholder="Adress"]').should("have.length", 1);
    cy.get('[placeholder="Adress"]').then(($input) => {
      expect($input[0].validationMessage).to.eq("Vul dit veld in.");
    });
  });

  it("shouldn't post height data", () => {
    cy.visit("/register");

    cy.get('[placeholder="Name"]').type(username);
    cy.get('[placeholder="Adress"]').type(adress);
    cy.get(":nth-child(5) > .form-control");
    cy.get(":nth-child(6) > .form-control").type(longitude);
    cy.get(":nth-child(7) > .form-control").type(latitude);

    cy.get(".btn").click();

    cy.get(":nth-child(5) > .form-control").should("have.length", 1);
    cy.get(":nth-child(5) > .form-control").then(($input) => {
      expect($input[0].validationMessage).to.eq("Vul dit veld in.");
    });
  });

  it("shouldn't post longitude data", () => {
    cy.visit("/register");

    cy.get('[placeholder="Name"]').type(username);
    cy.get('[placeholder="Adress"]').type(adress);
    cy.get(":nth-child(5) > .form-control").type(height);
    cy.get(":nth-child(6) > .form-control");
    cy.get(":nth-child(7) > .form-control").type(latitude);

    cy.get(".btn").click();

    cy.get(":nth-child(6) > .form-control").should("have.length", 1);
    cy.get(":nth-child(6) > .form-control").then(($input) => {
      expect($input[0].validationMessage).to.eq("Vul dit veld in.");
    });
  });

  it("shouldn't post latitude data", () => {
    cy.visit("/register");

    cy.get('[placeholder="Name"]').type(username);
    cy.get('[placeholder="Adress"]').type(adress);
    cy.get(":nth-child(5) > .form-control").type(height);
    cy.get(":nth-child(6) > .form-control").type(longitude);
    cy.get(":nth-child(7) > .form-control");

    cy.get(".btn").click();

    cy.get(":nth-child(7) > .form-control").should("have.length", 1);
    cy.get(":nth-child(7) > .form-control").then(($input) => {
      expect($input[0].validationMessage).to.eq("Vul dit veld in.");
    });
  });
});

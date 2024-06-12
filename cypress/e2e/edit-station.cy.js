describe('Edit station page tests', () => {


  it("Should POST the correct json", () => {
    const Id = 1;
    const StationName = "teststation4";
    const Address = "location4";
    const Height = "54";
    const Longitude = "34";
    const Latitude = "24";
  
    const StationNameEdit = "teststation45";
    const AddressEdit = "location45";
    const HeightEdit = "50";
    const LongitudeEdit = "30";
    const LatitudeEdit = "20";
    
    cy.intercept("GET", "http://localhost:8082/api/Station/1", {}).as("getStation");
  
    cy.visit("http://localhost:3000/Edit/1");
  
  //   cy.get('[name="name"]').should('have.value', StationName)
  //   cy.get('[name="locationName"]').should('have.value', Address)
  //   cy.get(':nth-child(5) > .form-control').should('have.value', Height)
  //   cy.get(':nth-child(6) > .form-control').should('have.value', Longitude)
  //   cy.get(':nth-child(7) > .form-control').should('have.value', Latitude)
  
    cy.wait(1000)
  
  
    cy.get('[name="name"]').clear()
    cy.get('[name="locationName"]').clear()
    cy.get(':nth-child(5) > .form-control').clear()
    cy.get(':nth-child(6) > .form-control').clear()
    cy.get(':nth-child(7) > .form-control').clear()
  
    cy.get('[name="name"]').type(StationNameEdit, { delay: 50 });
    cy.get('[name="locationName"]').type(AddressEdit, { delay: 50 });
    cy.get(':nth-child(5) > .form-control').type(HeightEdit, { delay: 50 });
    cy.get(':nth-child(6) > .form-control').type(LongitudeEdit, { delay: 50 });
    cy.get(':nth-child(7) > .form-control').type(LatitudeEdit, { delay: 50 });
  
    cy.intercept("PUT", "http://localhost:8082/api/Station", {}).as("editStation");
  
    cy.get(".btn").click();
  
    cy.wait("@editStation").then((interception) => {
      const expectedValue = {
        name: StationNameEdit,
        address: AddressEdit,
        height: HeightEdit,
        longitude: LongitudeEdit,
        latitude: LatitudeEdit,
      };
      expect(JSON.stringify(interception.request.body)).equal(
        JSON.stringify(expectedValue)
      );
    });
  });


})
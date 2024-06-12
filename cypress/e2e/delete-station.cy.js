describe('Delete station page tests', () => {


  it("Should POST the correct json", () => {
    const Id = 12;
    
    cy.intercept("GET", "http://localhost:8082/api/Station/12", {}).as("getStation");
    cy.visit("http://localhost:3000/Edit/12");
  
    cy.wait(1000)
  
    cy.intercept("DELETE", "http://localhost:8082/api/Station/12", {}).as("deleteStation");
  
    cy.get('[color="danger"]').click();
  
    cy.wait("@deleteStation").then((interception) => {
        console.log(interception)

      const expectedValue = "Complete";
      expect(JSON.stringify(interception.state)).equal(
        JSON.stringify(expectedValue));

        const expectedStatus = 200;
      expect(JSON.stringify(interception.response.statusCode)).equal(
        JSON.stringify(expectedStatus)
    );
    });
  });


})

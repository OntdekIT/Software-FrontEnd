// register.spec.js

// register.spec.js

describe('Registration Form Tests', () => {
  beforeEach(() => {
    // Visit the registration page before each test
    cy.visit('/register');
    // cy.intercept('POST', '/Authentication/register', (req) => {
    //   const { firstName, lastName, password, confirmPassword, mailAddress, meetstationCode } = req.body;
    //
    //   // Check for empty fields
    //   if (!firstName || !lastName || !password || !confirmPassword || !mailAddress || !meetstationCode) {
    //     req.reply({
    //       statusCode: 400,
    //       body: { message: 'Please fill out all fields' }
    //     });
    //   }
    //   // Check first name length
    //   else if (firstName.length < 2 || firstName.length > 30) {
    //     req.reply({
    //       statusCode: 400,
    //       body: { message: 'First name has to be between 2 and 30 characters' }
    //     });
    //   }
    //   // Check last name length
    //   else if (lastName.length < 2 || lastName.length > 30) {
    //     req.reply({
    //       statusCode: 400,
    //       body: { message: 'Last name has to be between 2 and 30 characters' }
    //     });
    //   }
    //   // Validate first name for alphanumeric characters
    //   else if (!/^[A-Za-z0-9]*$/.test(firstName)) {
    //     req.reply({
    //       statusCode: 400,
    //       body: { message: 'First name can only include letters and numbers' }
    //     });
    //   }
    //   // Check email validity
    //   else if (!/^\S+@\S+\.\S+$/.test(mailAddress)) {
    //     req.reply({
    //       statusCode: 400,
    //       body: { message: 'Invalid email address' }
    //     });
    //   }
    //   // Check password length
    //   else if (password.length < 8 || password.length > 50) {
    //     req.reply({
    //       statusCode: 400,
    //       body: { message: 'Password has to be between 8 and 50 characters' }
    //     });
    //   }
    //   // Check if passwords match
    //   else if (password !== confirmPassword) {
    //     req.reply({
    //       statusCode: 400,
    //       body: { message: 'Password and confirmation password do not match' }
    //     });
    //   }
    //   // If all validations pass, simulate a successful registration
    //   else {
    //     req.reply({
    //       statusCode: 201,
    //       body: {
    //         accessToken: 'fake-access-token',
    //         roles: ['user']
    //       }
    //     });
    //   }
    // }).as('registerRequest');
  });


  it('should show error for empty fields', () => {
    cy.get('button').contains('Registreren').click();
    cy.get('.error-msg').should('contain', 'Please fill out all fields');
  });

  it('should validate first name length', () => {
    cy.get('#firstname').type('A');
    cy.get('#surname').type('Smith');
    cy.get('#email').type('example@example.com');
    cy.get('#password').type('Password123');
    cy.get('#confirmPassword').type('Password123');
    cy.get('#meetstationCode').type('123');
    cy.get('button').contains('Registreren').click();
    cy.get('.error-msg').should('contain', 'First name has to be between 2 and 30 characters');
  });

  it('should validate last name length', () => {
    cy.get('#firstname').type('Aaaa');
    cy.get('#surname').type('a');
    cy.get('#email').type('example@example.com');
    cy.get('#password').type('Password123');
    cy.get('#confirmPassword').type('Password123');
    cy.get('#meetstationCode').type('123');
    cy.get('button').contains('Registreren').click();
    cy.get('.error-msg').should('contain', 'Last name has to be between 2 and 30 characters');
  });

  it('should allow only alphanumeric characters in first name', () => {
    cy.get('#firstname').type('@a');
    cy.get('#surname').type('Smith');
    cy.get('#email').type('example@example.com');
    cy.get('#password').type('Password123');
    cy.get('#confirmPassword').type('Password123');
    cy.get('#meetstationCode').type('123');
    cy.get('button').contains('Registreren').click();
    cy.get('.error-msg').should('contain', 'First name can only include letters and numbers');
  });

  it('should check email validity', () => {
    cy.get('#firstname').type('Aa');
    cy.get('#surname').type('Smith');
    cy.get('#email').type('exampleexample.com');
    cy.get('#password').type('Password123');
    cy.get('#confirmPassword').type('Password123');
    cy.get('#meetstationCode').type('123');
    cy.get('button').contains('Registreren').click();
    cy.get('.error-msg').should('contain', 'Invalid email address');
  });

  it('should check password requirements', () => {
    cy.get('#firstname').type('aA');
    cy.get('#surname').type('Smith');
    cy.get('#email').type('example@example.com');
    cy.get('#password').type('ord123');
    cy.get('#confirmPassword').type('Passwerd123');
    cy.get('#meetstationCode').type('123');
    cy.get('button').contains('Registreren').click();
    cy.get('.error-msg').should('contain', 'Password has to be between 8 and 50 characters');
  });

  it('should check password and confirm password match', () => {
    cy.get('#firstname').type('aA');
    cy.get('#surname').type('Smith');
    cy.get('#email').type('example@example.com');
    cy.get('#password').type('Password123');
    cy.get('#confirmPassword').type('Passwerd123');
    cy.get('#meetstationCode').type('123');
    cy.get('button').contains('Registreren').click();
    cy.get('.error-msg').should('contain', 'Password and confirmation password do not match');
  });

  it('should allow valid registration', () => {
    cy.get('#firstname').type('John');
    cy.get('#surname').type('Doe');
    cy.get('#email').type('example@example.com');
    cy.get('#password').type('Password123');
    cy.get('#confirmPassword').type('Password123');
    cy.get('#meetstationCode').type('123');
    cy.get('button').contains('Registreren').click();
    cy.wait('@registerRequest').its('response.statusCode').should('eq', 201);
  });
});

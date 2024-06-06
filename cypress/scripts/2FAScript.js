//this file is cypress/scripts/2FAScript.js
const Imap = require('imap-simple');
const { simpleParser } = require('mailparser');

const imapConfig = {
  imap: {
    user: "ontdekstation013tests@gmail.com",
    password: "superstation123",
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    authTimeout: 3000
  }
};

export async function get2FACode() {
  const connection = await Imap.connect(imapConfig);
  await connection.openBox('INBOX');
  console.log("amogus");
  
  const searchCriteria = ['UNSEEN'];
  const fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'] };

  const messages = await connection.search(searchCriteria, fetchOptions);
  for (let message of messages) {
    const all = message.parts.find(part => part.which === 'TEXT').body;
    const parsed = await simpleParser(all);
    
    const code = parsed.text.match(/Gebruik deze code bij het inloggen op MB Ontdekt: (\d{6})/)[1];
    if (code) {
      await connection.end();
      console.log(code);
      return code;
    }
  }
  await connection.end();
  throw new Error('2FA code not found in email');
};

module.exports = { get2FACode };
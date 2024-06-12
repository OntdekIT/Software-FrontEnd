const EventEmitter = require('events');
const MailListener = require('mail-listener2');

// Create a new event emitter
const codeEmitter = new EventEmitter();

// Create a new instance of MailListener
const mailListener = new MailListener({
  username: 'ontdekstation013tests@gmail.com', // Your Gmail address
  password: 'superstation123', // Your Gmail password or app password if 2FA is enabled
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
  mailbox: 'INBOX', // Inbox is the default mailbox
  markSeen: true, // Mark emails as read after retrieving them
});

// Listen for server connected event
mailListener.on('server:connected', () => {
  console.log('Connected to IMAP server');
});

// Listen for new email event
mailListener.on('mail', (mail, seqno, attributes) => {
  console.log('New email received:');
  console.log('From:', mail.from[0].address);
  console.log('Subject:', mail.subject);
  console.log('Date:', mail.date);
  console.log('Text:', mail.text);

  // Parse the email body to extract the code
  const codeMatch = mail.text.match(/Gebruik deze code bij het inloggen op MB Ontdekt:\s(\d{6})/);
  if (codeMatch) {
    const code = codeMatch[1];
    // Emit an event with the code
    codeEmitter.emit('code', code);
  }
});

// Listen for error event
mailListener.on('error', (err) => {
  console.error('Mail listener error:', err);
});

// Start listening for emails
mailListener.start();

// Gracefully stop the mail listener on SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('Stopping mail listener...');
  mailListener.stop();
});

module.exports = codeEmitter;

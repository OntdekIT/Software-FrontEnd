import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Inject the MailSlurp API key from the environment so it never lives in
      // the repository. Set it via CYPRESS_MAILSLURP_API_KEY (or MAILSLURP_API_KEY).
      config.env.MAILSLURP_API_KEY =
        config.env.MAILSLURP_API_KEY || process.env.MAILSLURP_API_KEY;
      return config;
    },
  },
});

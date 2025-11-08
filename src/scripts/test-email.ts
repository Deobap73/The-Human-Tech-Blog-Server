// /src/scripts/test-email.ts
'use strict';

import { sendMail } from '../utils/sendMail';

(async () => {
  const result = await sendMail({
    to: process.env.MAIL_DEFAULT_TO || process.env.SMTP_TO || '',
    subject: 'Test Resend integration',
    text: 'Hello from server test',
  });

  console.log('[test-email] result:', result);
  process.exit(result.ok ? 0 : 1);
})();

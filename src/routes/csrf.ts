// /src/routes/csrf.ts
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  // O método csrfToken() é adicionado pelo middleware csurf
  res.json({ csrfToken: req.csrfToken() });
});

export default router;

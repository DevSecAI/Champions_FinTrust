const express = require('express');
const { rateLimit } = require('express-rate-limit');
const usersRouter = require('./routes/users');
const transfersRouter = require('./routes/transfers');
const paymentsRouter = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 4000;

const apiLimiter = rateLimit({
  windowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: (() => {
    const n = Number(process.env.API_RATE_LIMIT_MAX);
    return Number.isFinite(n) && n > 0 ? n : 300;
  })(),
  message: { error: 'Too many requests.', message: 'Rate limit exceeded. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());
app.use('/users', apiLimiter, usersRouter);
app.use('/transfers', apiLimiter, transfersRouter);
app.use('/payments', apiLimiter, paymentsRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Deliberate: stack traces in development for training
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });
});

app.listen(PORT, () => console.log(`FinTrust API on port ${PORT}`));

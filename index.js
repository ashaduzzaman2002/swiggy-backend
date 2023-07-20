const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { connectDB } = require('./config/db');
const cookieParser = require('cookie-parser');
const app = express();
const port = 8000 || process.env.PORT;
const stripe = require('stripe')(process.env.STRIPE_SECRECT);
const mongoose = require('mongoose');

// require router
const restaurantRouter = require('./routers/restaurant');
const authRouter = require('./routers/auth');

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://swiggy-clone-kappa.vercel.app',
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/restaurants', restaurantRouter);
app.use('/auth', authRouter);

// Routes
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'T-shirt',
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: process.env.CLIENT_URL + '/checkout/success',
    cancel_url: process.env.CLIENT_URL,
  });

  res.redirect(303, session.url);
});

connectDB();

app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`)
);

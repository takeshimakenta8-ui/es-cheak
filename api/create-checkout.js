const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const BASE_URL = 'https://es-cheak.ytech-lab.com';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${BASE_URL}/?premium=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/`,
      locale: 'ja',
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

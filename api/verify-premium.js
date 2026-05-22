const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method === 'GET' && req.query.session_id) {
    // 決済直後：session_idで確認
    try {
      const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
      const premium = session.status === 'complete';
      return res.json({ premium, email: session.customer_details?.email || '' });
    } catch (err) {
      return res.status(500).json({ premium: false, error: err.message });
    }
  }

  if (req.method === 'GET' && req.query.email) {
    // 再訪時：メールアドレスでサブスクリプション確認
    try {
      const customers = await stripe.customers.list({
        email: req.query.email.toLowerCase(),
        limit: 1,
      });

      if (customers.data.length === 0) {
        return res.json({ premium: false });
      }

      const subscriptions = await stripe.subscriptions.list({
        customer: customers.data[0].id,
        status: 'active',
        price: process.env.STRIPE_PRICE_ID,
        limit: 1,
      });

      return res.json({ premium: subscriptions.data.length > 0 });
    } catch (err) {
      return res.status(500).json({ premium: false, error: err.message });
    }
  }

  res.status(400).json({ premium: false, error: 'session_id or email required' });
};

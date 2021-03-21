const express = require("express");
const app = express();
const { resolve } = require("path");
const PORT = process.env.PORT || 5000

// Copy the .env.example in the root into a .env file in this folder
const env = require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use(express.static(process.env.STATIC_DIR));
app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);

app.get("/", (req, res) => {
  const path = resolve(process.env.STATIC_DIR + "/index.html");
  res.sendFile(path);
});

// Fetch the Checkout Session to display the JSON result on the success page
app.get("/checkout-session", async (req, res) => {
  const { sessionId } = req.query;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  res.send(session);
});

app.post("/create-checkout-session", async (req, res) => {
  const priceId = process.env.SUBSCRIPTION_PRICE_ID;
  const productId = process.env.DONATION_PRODUCT_ID;
  const domainURL = process.env.DOMAIN;
  const channelId = process.env.CHANNEL_ID;
  const donation = req.body.donation;
  const idToken = req.body.token;
  let userId;

  // IDトークンを検証
  const request = require('request');
  const options = {
    uri: "https://api.line.me/oauth2/v2.1/verify",
    form: {
      "id_token": idToken,
      "client_id": channelId
    }
  };
  request.post(options, async function (err, response, body) {
    userId = JSON.parse(response.body).sub;
    const lineItems = [
      {
        price: priceId,
        quantity: 1,
      },
    ];
  
    if (donation) {
      lineItems.push({
        quantity: 1,
        price_data: {
          product: productId,
          unit_amount: donation * 100,
          currency: "jpy",
        }
      });
    }

    // Sign customer up for subscription and add donation if provided
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: lineItems,
      success_url: `${domainURL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainURL}/cancel.html`,
      allow_promotion_codes: true,
      // メタデータにLINEのuserIdをセット
      subscription_data: {
        metadata: {
          line_user: userId,
        }
      }
    });

    res.send({
      checkoutSessionId: session.id,
    });
  });
});

app.get("/publishable-key", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

// Webhook handler for asynchronous events.
app.post("/webhook", async (req, res) => {
  let data;
  let eventType;
  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === "checkout.session.completed") {
    const items = data.object.display_items;
    const customer = await stripe.customers.retrieve(data.object.customer);

    if (
      items.length &&
      items[0].custom &&
      items[0].custom.name === "Pasha e-book"
    ) {
      console.log(
        `🔔  Customer is subscribed and bought an e-book! Send the e-book to ${customer.email}.`
      );
    } else {
      console.log(`🔔  Customer is subscribed but did not buy an e-book.`);
    }
  }

  res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Node server listening on port ${PORT}!`));

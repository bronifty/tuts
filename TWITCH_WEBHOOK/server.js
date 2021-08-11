// require/import packages
require('dotenv').config();
const express = require('express');
const { ApiClient } = require('twitch');
const { ClientCredentialsAuthProvider } = require('twitch-auth');
// const cors = require('cors');
// init express app
const app = express();
// app.use(cors({ origin: '*' }));
app.use(express.json());
const port = process.env.PORT || 3000;
// init twitch api client
const authProvider = new ClientCredentialsAuthProvider(
  process.env.TWITCH_CLIENT_ID,
  process.env.TWITCH_CLIENT_SECRET
);
const twitch = new ApiClient({ authProvider });
// init twilio client
const twilioClient = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// setup test routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.get('/webhook/callback', (req, res) => {
  res.send('/webhook/callback');
});

// create webhook route with message handler
app.post('/webhook/callback', async (req, res) => {
  // respond to twitch auth challenge to proceed
  const messageType = req.header('Twitch-Eventsub-Message-Type');
  if (messageType === 'webhook_callback_verification') {
    console.log('Verifying Webhook');
    return res.status(200).send(req.body.challenge);
  }
  // get event for text
  const { type } = req.body.subscription;
  const { event } = req.body;
  // log the webhook event
  console.log(
    `Receiving ${type} request for ${event.broadcaster_user_name}: `,
    event
  );
  // when your broadcaster status is stream.online
  if (type === 'stream.online') {
    try {
      sendSMS(event);
    } catch (ex) {
      console.log(
        `An error occurred sending the Online notification for ${event.broadcaster_user_name}: `,
        ex
      );
    }
  }
  res.status(200).end();
});

// send text
const sendSMS = async (event) => {
  const stream = await twitch.helix.streams.getStreamByUserId(
    event.broadcaster_user_id
  );
  twilioClient.messages
    .create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.MY_PHONE_NUMBER,
      body: `${stream._data.user_name} is live; ${stream._data.title}`,
    })
    .then((message) =>
      console.log(
        `streamer: ${stream._data.user_name} \ntitle: ${stream._data.title}`,
        `message.sid: ${message.sid}`
      )
    );
};

// listen for twitch webhook notifications
const listener = app.listen(port, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

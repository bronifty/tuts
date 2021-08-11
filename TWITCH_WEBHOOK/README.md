# Get SMS Notifications via Twitch Webhook When Your Streamer Goes Online

- [Youtube Video of the tutorial](https://www.youtube.com/watch?v=vM-nK3ikHu0){:target='\_blank'}
- credit to code inspiration here: <a href='https://www.courier.com/blog/how-to-handle-real-time-twitch-events'>Courier Blog Handle Twitch Events</a>
  - note: blog series goes into much further detail around another tool and takes some further (confusing) verification steps on the server side, which I skip (unecessary)

## High Level Steps:

- Replace env vars for twitch and twilio
- Start server and put on public web
- Call Twitch API via its CLI tool to get broadcaster id and subscribe to online events

## Detailed Steps

1. Setup env vars (rename .env.example to .env)
   <ol type="a">
      <li><a href='https://dev.twitch.tv/console'>Twitch Developer Console</a></li>
         <ol type="i">
            <li>Client ID</li>
            <li>Client Secret</li>
         </ol>
      <li><a href='https://console.twilio.com'>Twilio Console (under project info in beta console)</a></li>
         <ol type="i">
            <li>ACCOUNT SID</li>
            <li>AUTH TOKEN</li>
            <li>TWILIO PHONE NUMBER (to send  text)</li>
            <li>YOUR PHONE NUMBER (to receive text)</li>
         </ol>
   </ol>
2. Run server (requires env vars to start)
   <ol type="a">
      <li>either npm i && npm start or docker-compose up -d</li>
      <li>Get server on public web (ngrok or some other host like fly.io)</li>
      <li>Put the callback url in the body of the TWITCH CLI request (below in TWITCH CLI section)</li>
   </ol>
3. Call Twitch API with its CLI tool (further details below)
   <ol type="a">
      <li>configure & get token</li>
      <li>retrieve your broadcaster's id</li>
      <li>submit a post request to the eventsub/subscriptions endpoint with your broadcaster's id and the webhook/callback url from your publicly acessible server</li>
   </ol>

### Initialize Twitch CLI

- At the terminal call twitch configure and pass in those values, then call twitch token which will be used throughout the course of your api calls with the CLI

```
$ twitch configure
$ twitch token
```

### Get the user id to subscribe

```
twitch api get users -q login=bronifty
```

### Subscribe to the online event

```
twitch api post eventsub/subscriptions -b '{
"type": "stream.online",
"version": "1",
"condition": {
"broadcaster_user_id": "713584090"
},
"transport": {
"method": "webhook",
"callback": "https://8c4708fefc4a.ngrok.io/webhook/callback",
"secret": "thisissomethrowawaytextyoucanputanythinghere"
}
}'
```

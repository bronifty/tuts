// setup access to process.env
const path = require('path');
const dir = path.join(`${__dirname}`, '.env');
require('dotenv').config({ path: dir });
// import/require external packages
const express = require('express');
const app = express();
app.use(express.json());
// import/require internal code modules
const instagram = require('./instagram');
const download = require('./download');
const upload = require('./upload');

app.get('/', (req, res) => {
  res.send(`<pre>
  send a GET request to /instagram/:username endpoint and expect http url strings in the following format:
  {
    data: {
      username: String<Text>!,
      avatar: String<URL>!,
      posts: [post]!
    }
    // post: {
    //  img: String<URL>!,
    //  alt: String<Text>!,
    // }
  }
  </pre>`);
});

app.get('/instagram/:username', async (req, res) => {
  let username = req.params.username;
  let domain = 'instagram';
  console.log(`username: ${username}`);
  let igRes = await instagram.launch(username);
  // igRes value
  // {
  //   data: {
  //     username,
  //     avatar,
  //     posts: postData,
  //   }
  // }
  let igResParsed = JSON.parse(igRes);
  console.log(`igResParsed ${igResParsed}`);
  let downloadRes = await download.launch(igResParsed);
  // downloadRes value
  // {
  //   data: {
  //     domain,
  //     username,
  //     avatar,
  //     posts,
  //   }
  // }
  let downloadParsed = JSON.parse(downloadRes);
  downloadParsed.data.domain = 'instagram';
  downloadParsed.data.username = username;
  console.log(`downloadParsed ${downloadParsed}`);
  let gcsRes = await upload.launch(downloadParsed);
  // gcsRes value
  // {
  //   data: {
  //     username,
  //     avatar,
  //     posts,
  //   }
  // }
  let gcsParsed = JSON.parse(gcsRes);
  res.json({
    status: 'ok',
    data: gcsParsed.data,
  });
});

app.get('/test', async (req, res) => {
  let requestObject = {
    data: {
      domain: 'instagram',
      username: 'precious_ella_cat',
      avatar: '/Users/bronifty/dev/igscraper/tmp/0.jpg',
      posts: [],
    },
  };

  // let { domain, username, avatar } = requestObject.data;
  let testRequest = await upload.launch(requestObject);
  let testRequestParsed = JSON.parse(testRequest);
  res.json({
    status: 'ok',
    data: testRequestParsed.data,
  });
  // res.send(`<pre>
  // send a GET request to /instagram/:username endpoint and expect http url strings in the following format:
  // {
  //   data: {
  //     username: String<Text>!,
  //     avatar: String<URL>!,
  //     posts: [post]!
  //   }
  //   // post: {
  //   //  img: String<URL>!,
  //   //  alt: String<Text>!,
  //   // }
  // }
  // </pre>`);
});

module.exports = app;

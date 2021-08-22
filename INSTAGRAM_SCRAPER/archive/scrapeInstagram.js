// import chromium from 'chrome-aws-lambda';
import AWS from 'aws-sdk';
const request = require('request');
const fs = require('fs');
const path = require('path');
const dir = path.join(`${__dirname}`, '../../.env');
require('dotenv').config({ path: dir });

// set up staging dir for images to upload to S3
const dir = path.join(`${__dirname}`, '/data');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// set up AWS S3
const S3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});
// set up puppeteer
async function getBrowserInstance() {
  // const executablePath = await chromium.executablePath;

  // if (!executablePath) {
  //   // running locally
  //   const puppeteer = require('puppeteer');
  //   return puppeteer.launch({
  //     args: chromium.args,
  //     headless: true,
  //     defaultViewport: {
  //       width: 1280,
  //       height: 720,
  //     },
  //     ignoreHTTPSErrors: true,
  //   });
  // }

  return chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: 1280,
      height: 720,
    },
    executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });
}
// run puppeteer to scrape instagram
export default async (req, res) => {
  // const url = req.body.url;

  // // Perform URL validation
  // if (!url || !url.trim()) {
  //   res.json({
  //     status: 'error',
  //     error: 'Enter a valid URL',
  //   });

  //   return;
  // }

  let result = null;
  let browser = null;

  try {
    browser = await getBrowserInstance();
    let page = await browser.newPage();
    // await page.goto(url);
    // result = await page.screenshot({
    //   path: 'myScreenshot.png',
    // });

    // go to instagram and save images to S3
    await page.goto('https://www.instagram.com/accounts/login');
    /* login */
    await page.waitForSelector('input[name=username]');
    await page.type('input[name=username]', process.env.INSTAGRAM_USERNAME);
    await page.waitForSelector('input[name=password]');
    await page.type('input[name=password]', process.env.INSTAGRAM_PASSWORD);
    await page.click('button[type="submit"]');

    /* decline save login info */
    await page.waitForSelector(
      '#react-root > section > main > div > div > div > div > button'
    );
    await page.click(
      '#react-root > section > main > div > div > div > div > button'
    );
    /* decline notifications */
    await page.waitForSelector(
      'body > div > div > div > div > div > button:nth-child(2)'
    );
    await page.click(
      'body > div > div > div > div > div > button:nth-child(2)'
    );
    // // go to user page
    await page.goto('https://www.instagram.com/precious_ella_cat');

    /* page.evaluate to run vanilla javascript */
    let details = await page.evaluate(async () => {
      /* get avatar */
      const getAvatar = () => {
        return document
          .querySelector(
            '#react-root > section > main > div > header > div > div > span > img'
          )
          .getAttribute('src')
          ? document
              .querySelector(
                '#react-root > section > main > div > header > div > div > span > img'
              )
              .getAttribute('src')
          : false;
      };
      /* get username */
      const getUsername = () => {
        const selector = document.querySelector(
          '#react-root > section > main > div > header > section > div > h2'
        );
        return selector.innerText ? selector.innerText : false;
      };
      /* get all images in posts */
      const getImages = () => {
        const imgSelectorAll = document.querySelectorAll(
          '#react-root > section > main > div > div > article > div:nth-child(1) > div img'
        );
        const images = Array.from(imgSelectorAll).map((img) => {
          // create image file and load into object
          const imgSrc = img.getAttribute('src');
          let file = fs.createWriteStream(`${dir}/${imgSrc}.jpg`);
          let stream = request(imgSrc)
            .pipe(file)
            .on('finish', () => {
              console.log(`finished downloading the image for ${imgSrc}`);
              resolve();
            })
            .on('error', (err) => {
              console.log(`error downloading the image for ${imgSrc}`);
              reject(err);
            });
          // await new Promise((resolve, reject) => {

          // }).catch((err) => console.log(`${imgSrc} had an error: ${err}`));

          return { src: img.getAttribute('src'), alt: img.getAttribute('alt') };
        });
        return images ? images : false;
      };
      const data = {
        data: {
          avatar: getAvatar(),
          username: getUsername(),
          images: getImages(),
        },
      };
      // console.log('data: ', data);
      return data;
    });
    console.log('details: ', details);

    // const imageBuffer = await page.screenshot();

    // // upload to S3
    // const fileName = 'uploaded_on_' + Date.now() + '.jpg';

    // const params = {
    //   Bucket: process.env.AWS_S3_BUCKET_NAME,
    //   Key: fileName,
    //   Body: imageBuffer,
    // };

    // S3.upload(params, (error, data) => {
    //   console.log(error, data);
    //   if (error) {
    //     return res.json({
    //       status: 'error',
    //       error: error.message || 'Something went wrong',
    //     });
    //   }

    //   const params = {
    //     Bucket: process.env.AWS_S3_BUCKET_NAME,
    //     Key: fileName,
    //     Expires: 600,
    //   };

    //   const signedURL = S3.getSignedUrl('getObject', params);

    res.json({
      status: 'ok',
      data: details,
      // data: result,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: 'error',
      error: err.message || 'Something went wrong',
    });
  } finally {
    await browser.close();
  }
};

// express code
// (async () => {
//   const browser = await puppeteer.launch({
//     headless: true,
//     // headless: false,
//     // devtools: true,
//     ignoreHTTPSErrors: true,
//     // args: ['--proxy-server=51.222.87.166:9090'],
//   });

//   /*  create browser page and go to instagram login */
//   const page = await browser.newPage();
//   // skip image loading
//   // await page.setRequestInterception(true);
//   // page.on('request', (request) => {
//   //   if (request.resourceType() === 'image') {
//   //     request.abort();
//   //   } else {
//   //     request.continue();
//   //   }
//   // });
//   await page.goto('https://www.instagram.com/accounts/login');
//   /* login */
//   await page.waitForSelector('input[name=username]');
//   await page.type('input[name=username]', process.env.INSTAGRAM_USERNAME);
//   await page.waitForSelector('input[name=password]');
//   await page.type('input[name=password]', process.env.INSTAGRAM_PASSWORD);
//   await page.click('button[type="submit"]');

//   /* decline save login info */
//   await page.waitForSelector(
//     '#react-root > section > main > div > div > div > div > button'
//   );
//   await page.click(
//     '#react-root > section > main > div > div > div > div > button'
//   );
//   /* decline notifications */
//   await page.waitForSelector(
//     'body > div > div > div > div > div > button:nth-child(2)'
//   );
//   await page.click('body > div > div > div > div > div > button:nth-child(2)');
//   // // go to user page
//   await page.goto('https://www.instagram.com/precious_ella_cat');

//   /* page.evaluate to run vanilla javascript */
//   let details = await page.evaluate(async () => {
//     /* get avatar */
//     const getAvatar = () => {
//       return document
//         .querySelector(
//           '#react-root > section > main > div > header > div > div > span > img'
//         )
//         .getAttribute('src')
//         ? document
//             .querySelector(
//               '#react-root > section > main > div > header > div > div > span > img'
//             )
//             .getAttribute('src')
//         : false;
//     };
//     /* get username */
//     const getUsername = () => {
//       const selector = document.querySelector(
//         '#react-root > section > main > div > header > section > div > h2'
//       );
//       return selector.innerText ? selector.innerText : false;
//     };
//     /* get all images in posts */
//     const getImages = () => {
//       const imgSelectorAll = document.querySelectorAll(
//         '#react-root > section > main > div > div > article > div:nth-child(1) > div img'
//       );
//       const images = Array.from(imgSelectorAll).map((img) => {
//         return { src: img.getAttribute('src'), alt: img.getAttribute('alt') };
//       });
//       return images ? images : false;
//     };
//     const data = {
//       data: {
//         avatar: getAvatar(),
//         username: getUsername(),
//         images: getImages(),
//       },
//     };
//     // console.log('data: ', data);
//     return data;
//   });
//   console.log('details: ', details);
// })();

// setup access to process.env
const path = require('path');
const dir = path.join(`${__dirname}`, '.env');
require('dotenv').config({ path: dir });
// import/require external packages
const puppeteer = require('puppeteer');
const chromium = require('chrome-aws-lambda');
// code from a tutorial for AWS Lambda puppeteer (no access to fs)
// async function getBrowserInstance() {
//   const executablePath = await chromium.executablePath;
//   if (!executablePath) {
//     // running locally
//     const puppeteer = require('puppeteer');
//     return puppeteer.launch({
//       args: chromium.args,
//       // headless: true,
//       headless: false,
//       defaultViewport: {
//         width: 1280,
//         height: 720,
//       },
//       ignoreHTTPSErrors: true,
//     });
//   }

//   return chromium.puppeteer.launch({
//     args: chromium.args,
//     defaultViewport: {
//       width: 1280,
//       height: 720,
//     },
//     executablePath,
//     headless: chromium.headless,
//     ignoreHTTPSErrors: true,
//   });
// }

const instagram = {
  launch: async (userRequested) => {
    let user = userRequested || 'precious_ella_cat';
    console.log(`Launching browser for ${user}`);
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox'],
    });

    try {
      let page = await browser.newPage();
      await page.waitForTimeout(1000);
      console.log(`Launched browser for ${user}`);
      await page.goto('https://www.instagram.com/accounts/login');
      console.log(`at the login page`);
      await page.waitForTimeout(5000);
      await page.waitForFunction('document.querySelector("body")');
      await page.waitForSelector(
        '#loginForm > div > div:nth-child(1) > div > label > input'
      );
      await page.type(
        '#loginForm > div > div:nth-child(1) > div > label > input',
        process.env.INSTAGRAM_USERNAME
      );
      await page.waitForSelector(
        '#loginForm > div > div:nth-child(2) > div > label > input'
      );
      await page.type(
        '#loginForm > div > div:nth-child(2) > div > label > input',
        process.env.INSTAGRAM_PASSWORD
      );
      await page.click('#loginForm > div > div:nth-child(3) > button');
      await page.waitForTimeout(5000);
      /* decline save login info */
      await page.waitForSelector(
        '#react-root > section > main > div > div > div > div > button'
      );
      await page.waitForFunction('document.querySelector("body")');
      await page.click(
        '#react-root > section > main > div > div > div > div > button'
      );
      await page.waitForTimeout(5000);
      /* decline notifications */
      await page.waitForSelector(
        'body > div > div > div > div > div > button:nth-child(2)'
      );
      await page.waitForFunction('document.querySelector("body")');
      await page.click(
        'body > div > div > div > div > div > button:nth-child(2)'
      );
      await page.waitForTimeout(5000);
      // // go to user page
      await page.waitForFunction('document.querySelector("body")');
      await page.goto(`https://www.instagram.com/${user}`);
      console.log(`at the user page`);
      await page.waitForTimeout(5000);
      // a workaround for a bug waitForFunction
      await page.waitForFunction('document.querySelector("body")');
      /* page.evaluate to run vanilla javascript */
      const data = await page.evaluate(async (user) => {
        let url = `https://www.instagram.com/`;
        console.log(`url is getLocalhost(url): ${url}`);
        let username = user;
        const avatar = document.querySelector(
          '#react-root > section > main > div > header > div > div > span > img'
        ).src
          ? document.querySelector(
              '#react-root > section > main > div > header > div > div > span > img'
            ).src
          : false;

        let postImages = document.querySelectorAll(
          '#react-root > section > main > div > div > article > div:nth-child(1) > div img'
        )
          ? document.querySelectorAll(
              '#react-root > section > main > div > div > article > div:nth-child(1) > div img'
            )
          : false;

        let postImagesArr = Array.from(postImages).map((image) => {
          let img = image.getAttribute('src')
            ? image.getAttribute('src')
            : false;
          let alt = image.getAttribute('alt')
            ? image.getAttribute('alt')
            : false;
          if (!img.includes('http')) {
            img = `${url}${img}`;
          }
          return { img, alt };
          // [{img, alt}]
        });
        // code for getting posts with text and integrating them with the images
        // let postCopy = document.querySelectorAll('.post .copy');
        // let postCopyArr = Array.from(postCopy).map((postCopy) => {
        //   return {
        //     text: postCopy.textContent,
        //   };
        // });
        // // combine postImagesArr and postCopyArr into one array
        // for (let i in postCopyArr) {
        //   postImagesArr[i].text = postCopyArr[i].text;
        // }
        let postData = postImagesArr;

        return {
          data: {
            username,
            avatar,
            posts: postData,
          },
        };
      });
      // await browser.close();
      return JSON.stringify(data);
    } catch (err) {
      console.log(err);
      return null;
    } finally {
      await browser.close();
    }
  },
};
module.exports = instagram;

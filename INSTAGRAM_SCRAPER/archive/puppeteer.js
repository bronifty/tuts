const chromium = require('chrome-aws-lambda');
let browser = null;
let page = null;

async function getBrowserInstance() {
  const executablePath = await chromium.executablePath;
  if (!executablePath) {
    // running locally
    const puppeteer = require('puppeteer');
    return puppeteer.launch({
      args: [...chromium.args, '--no-sandbox'],
      headless: true,
      // headless: false,
      // devtools: true,
      defaultViewport: {
        width: 1280,
        height: 720,
      },
      ignoreHTTPSErrors: true,
    });
  }
  puppeteer.launch({ args: ['--no-sandbox'] });

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

// google domain specific scraper function
async function getGoogle() {
  await page.waitForSelector('body > div > div > div > img');
  const data = await page.evaluate(async () => {
    return {
      src: document
        .querySelector('body > div > div > div > img')
        .getAttribute('src')
        ? document
            .querySelector('body > div > div > div > img')
            .getAttribute('src')
        : false,
    };
  });
  console.log(
    `returning the image src attribute value with JSON.stringify(data = {src}): ${JSON.stringify(
      data
    )}`
  );
  return JSON.stringify(data);
}

async function getLocalhost(reqURL) {
  console.log(
    `in puppeteer's getLocalhost(url) method checking url argument value: ${reqURL}`
  );
  await page.waitForSelector('body div img');
  const data = await page.evaluate(async () => {
    let url = `https://fervent-tesla-9310.netlify.app/`;
    console.log(`url is getLocalhost(url): ${url}`);
    const username = document.querySelector('#username').textContent
      ? document.querySelector('#username').textContent
      : false;
    const avatar = document.querySelector('#avatar img').src
      ? document.querySelector('#avatar img').src
      : false;

    let postImages = document.querySelectorAll('.post img')
      ? document.querySelectorAll('.post img')
      : false;

    let postImagesArr = Array.from(postImages).map((image) => {
      let img = image.getAttribute('src') ? image.getAttribute('src') : false;
      let alt = image.getAttribute('alt') ? image.getAttribute('alt') : false;
      if (!img.includes('http')) {
        img = `${url}${img}`;
      }
      return { img, alt };
    });

    let postCopy = document.querySelectorAll('.post .copy');
    let postCopyArr = Array.from(postCopy).map((postCopy) => {
      return {
        text: postCopy.textContent,
      };
    });
    // combine postImagesArr and postCopyArr into one array
    for (let i in postCopyArr) {
      postImagesArr[i].text = postCopyArr[i].text;
    }
    // for clarity that we are returning the combined array of images and text
    let postData = postImagesArr;
    let domain = 'https://fervent-tesla-9318.netlify.app/';

    return {
      data: {
        domain,
        username,
        avatar,
        posts: postData,
      },
    };
  });
  return JSON.stringify(data);
}

async function getInstagram() {
  // let domain = window.location.host;
  // let pathArray = window.location.pathname.split('/');
  // let username = pathArray[0];
  // log(`domain/username: ${domain}/${username}`);
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
  await page.click('body > div > div > div > div > div > button:nth-child(2)');
  // // go to user page
  await page.goto(`https://www.instagram.com/${username}`);
  const data = await page.evaluate(async () => {
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
    return {
      data: {
        domain,
        username,
        avatar,
        posts: postData,
      },
    };
  });
  return JSON.stringify(data);
}

const puppeteer = {
  launch: async (url) => {
    let igRes = await instagram.launch();
    let igResParsed = JSON.parse(igRes);

    browser = await getBrowserInstance();
    page = await browser.newPage();
    await page.goto(url);
    console.log(`Navigated to ${url}`);
    if (url.includes('google.com')) {
      return await getGoogle();
    } else if (url.includes('netlify')) {
      // return getLocalhost();
      console.log(`what is the url we pass to getLocalhost ${url}`);
      return await getLocalhost(url);
    } else if (url.includes('instagram')) {
      return await getInstagram(url);
    }
  },

  close: async () => {
    await browser.close();
    console.log('Browser closed');
  },
};

module.exports = puppeteer;

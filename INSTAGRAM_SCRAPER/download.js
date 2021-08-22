// setup access to process.env
const path = require('path');
const dir = path.join(`${__dirname}`, '.env');
require('dotenv').config({ path: dir });
// import/require external packages
const fs = require('fs');
const request = require('request');

let tmpDir = path.join(`${__dirname}`, '/tmp');

async function downloadImage(url, fileName) {
  //create tempdir if not exists
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
    console.log(`create tmp dir ${tmpDir}`);
  }
  // get the file name from the url
  const imgSrc = url;
  // const fileName = img.replace(/^.*[\\\/]/, '');
  // create the file with fs.createWriteStream
  let file = fs.createWriteStream(`${tmpDir}/${fileName}`);
  // enter the promise chain and pipe the response into the file
  await new Promise((resolve, reject) => {
    let stream = request(imgSrc)
      .pipe(file)
      .on('finish', () => {
        console.log(`finished downloading the image for ${fileName}`);
        resolve();
      })
      .on('error', (err) => {
        console.log(`error downloading the image for ${fileName}`);
        reject(err);
      });
  }).catch((err) => console.log(`${fileName} had an error: ${err}`));
  const filePath = file.path;
  // return the image path
  let responseData = {
    data: {
      filePath,
    },
  };
  return JSON.stringify(responseData);
}

const download = {
  launch: async (data) => {
    // {
    //   data: {
    //     username,
    //     avatar,
    //     posts: [{img, alt}],
    //   }
    // }
    if (!data) {
      console.log(`puppeteer scrape data missing ${data}`);
      return;
    }
    console.log(`data ${data}`);
    let {
      data: { username, avatar, posts },
    } = data;
    console.log(`download file: ${username} ${avatar} ${posts}`);
    // replace avatar url with the image path
    let avatarRes = await downloadImage(avatar, 'avatar.jpg');
    // return avatarRes;
    // {
    //   data: {
    //     filePath,
    //   }
    // }
    avatar = JSON.parse(avatarRes).data.filePath;
    // replace post image urls with references to the local downloaded files
    postImages = posts.map((post, idx) => ({
      url: post.img,
      fileName: `${idx}.jpg`,
    }));
    let srcArr = [];
    for (let img of postImages) {
      let postImageRes = await downloadImage(img.url, img.fileName);
      // {
      //   data: {
      //     filePath,
      //   }
      // }
      let filePath = JSON.parse(postImageRes).data.filePath;
      srcArr.push(filePath);
      // srcArr = ['/path/to/image.jpg', '/path/to/image2.jpg']
    }
    // loop through the posts array and replace the image url with the local file path
    for (let i in posts) {
      posts[i].img = srcArr[i];
    }
    let responseData = {
      data: {
        username,
        avatar,
        posts,
      },
    };

    return JSON.stringify(responseData);
  },
};

module.exports = download;

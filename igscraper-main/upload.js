// setup access to process.env
const path = require('path');
const dir = path.join(`${__dirname}`, '.env');
require('dotenv').config({ path: dir });
// import/require external packages
const projectId = process.env.GCP_PROJECT_ID;
const bucketId = process.env.GCP_BUCKET_ID;
const { Storage } = require('@google-cloud/storage');
const gcs = new Storage({
  projectId: projectId,
  keyFilename: `${path.join(__dirname, process.env.GCP_KEYFILE_JSON)}`,
});
// const gcs = new Storage({
//   projectId: projectId,
//   keyFilename: `${path.join(__dirname, './creator-test-12345-keyfile.json')}`,
// });
const gcsBucket = gcs.bucket(bucketId, {
  userProject: projectId,
});

async function uploadImage(domain, username, imagePath) {
  // {
  //   data: {
  //     domain: 'instagram',
  //     username: 'precious_ella_cat',
  //     avatar: '/Users/bronifty/dev/igscraper/tmp/0.jpg',
  //     posts: [],
  //   },
  // }
  let sourceFilePath = imagePath;
  let fileName = `${domain}${username}${imagePath.replace(/^.*[\\\/]/, '')}`;

  let targetFileName = fileName;
  await gcsBucket
    .upload(sourceFilePath, {
      destination: targetFileName,
    })
    .catch((err) => {
      console.error(err);
    });
  let outputBucketPath = `https://storage.googleapis.com/${bucketId}/${targetFileName}`;
  let responseData = {
    data: {
      outputBucketPath,
    },
  };
  return JSON.stringify(responseData);
}

const upload = {
  launch: async (requestData) => {
    // requestData
    //   {
    //   data: {
    //     domain: 'instagram',
    //     username: 'precious_ella_cat',
    //     avatar: '/Users/bronifty/dev/igscraper/tmp/0.jpg',
    //     posts: [],
    //   },
    // }
    let {
      data: { domain, username, avatar, posts },
    } = requestData;
    avatarRes = await uploadImage(domain, username, avatar);
    // {
    //   data: {
    //     outputBucketPath,
    //   }
    // }
    avatar = JSON.parse(avatarRes).data.outputBucketPath;
    let outputBucketPaths = [];
    for (let post of posts) {
      let uploadRes = await uploadImage(domain, username, post.img);
      // {
      //   data: {
      //     outputBucketPath,
      //   }
      // }
      let outputBucketPath = JSON.parse(uploadRes).data.outputBucketPath;
      outputBucketPaths.push(outputBucketPath);
      // outputBucketPaths = [`https://storage.cloud.google.com/${bucketId}/${targetFileName}`]
    }
    // replace the original post.img with the outputBucketPaths
    for (let i in posts) {
      posts[i].img = outputBucketPaths[i];
    }
    let responseData = {
      data: {
        domain,
        username,
        avatar,
        posts,
      },
    };
    return JSON.stringify(responseData);
  },
};

module.exports = upload;

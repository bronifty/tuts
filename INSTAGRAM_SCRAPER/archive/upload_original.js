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
  keyFilename: `${path.join(__dirname, './creator-test-12345-keyfile.json')}`,
});
const gcsBucket = gcs.bucket(bucketId, {
  userProject: projectId,
});

async function uploadImage(image) {
  let sourceFilePath = image;
  let fileName = image.replace(/^.*[\\\/]/, '');
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
    // {
    //   data: {
    //     username,
    //     avatar,
    //     posts: [{img, alt}],
    //   }
    // }
    let {
      data: { username, avatar, posts },
    } = requestData;
    avatarRes = await uploadImage(avatar);
    // {
    //   data: {
    //     outputBucketPath,
    //   }
    // }
    avatar = JSON.parse(avatarRes).data.outputBucketPath;
    let outputBucketPaths = [];
    for (let post of posts) {
      let uploadRes = await uploadImage(post.img);
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
    debugger;
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

module.exports = upload;

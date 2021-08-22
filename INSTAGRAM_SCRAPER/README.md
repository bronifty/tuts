# Social Media Scraper Tool (with Puppeteer Login, download of images and upload to cloud bucket inside a Docker Container)

1. Rename env.example to .env and set your variables (follow GCP instructions to get a keyfile for your bucket after you set the access on it and place it in the root of your project then link to it by name - just like it's a literal value)
   a. TLDR; https://cloud.google.com/iam/docs/creating-managing-service-account-keys
   i. Go to Service Accounts choose project add a service account with owner role and create a key for it of JSON type and download it. Put it in the root of the project (rename it to anything you like) and refer to it by its name in the .env file

```
GCP_PROJECT_ID=your-project-name
GCP_BUCKET_ID=your-project-name
GCP_KEYFILE_JSON=your-project-name-keyfile.json

// if you're using S3 include these as well
AWS_S3_ACCESS_KEY_ID=yourkey
AWS_S3_SECRET_ACCESS_KEY=yourkey
AWS_S3_BUCKET_NAME=yourbucket

INSTAGRAM_USERNAME=yourlogin
INSTAGRAM_PASSWORD=yourpassword
```

2. Run docker-compose up locally to test

```
docker-compose up
```

3. Make a get request to the endpoint

```
GET http://localhost:3000/instagram/:username
-e.g., on Postman or Thunder Client GET http://localhost:3000/instagram/precious_ella_cat
```

4. Deploy to Okteto with its git integration. It will take the docker-compose file and treat it like a kubernetes cluster (with 1 node/replica unless you tell it otherwise). Other services like Google Cloud Run will require more configuration with Puppeteer. Or Fly.io.

### END NOTE:

- The / route describes the return value.

```
{
  data: {
    username: String<Text>!,
    avatar: String<URL>!,
    posts: [post]!
  }
  post: {
    img: String<URL>!,
    alt: String<Text>!,
  }
}
```

#### More endpoints are planned for this scraper like Twitter and Tiktok perhaps others. The logic is drop-in replace for any service.

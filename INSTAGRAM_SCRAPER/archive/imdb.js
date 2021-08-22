const fs = require('fs');
const path = require('path');
const request = require('request');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const Json2csvParser = require('json2csv').Parser;

const URLS = [
  {
    id: 'silence_of_the_lambs',
    url: 'https://www.imdb.com/title/tt0102926/?ref_=nv_sr_1',
  },
  {
    id: 'top_gun',
    url: 'https://m.imdb.com/title/tt1745960/?ref_=nv_sr_srsg_0',
  },
];
let moviesData = [];
const dir = path.join(`${__dirname}`, '/data');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

(async () => {
  for (let movie of URLS) {
    // URLS.forEach((movie) => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'text/html',
        'user-agent':
          'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Mobile Safari/537.36',
      },
      body: null,
    };
    const response = await fetch(movie.url, options);
    const text = await response.text();
    let $ = cheerio.load(text);
    let title = $(
      'section div h1[data-testid="hero-title-block__title"]'
    ).text();
    let rating = $('div[class=ipc-button__text] span:nth-child(1)')
      .text()
      .substr(0, 3);
    const poster = $('div[data-testid=hero-media__poster] img').attr('src');
    const genres = [];
    $('li[data-testid="storyline-genres"] a[href*=genres]').each((i, elem) => {
      let genre = $(elem).text();
      genres.push(genre);
    });
    const avatars = [];
    $('.title-cast img').each((i, elem) => {
      let avatar = $(elem).attr('src');
      avatars.push(avatar);
    });
    moviesData.push({ title, rating, poster, genres, avatars });

    let file = fs.createWriteStream(`${dir}/${movie.id}.jpg`);
    await new Promise((resolve, reject) => {
      let stream = request(poster)
        .pipe(file)
        .on('finish', () => {
          console.log(`finished downloading the image for ${movie.id}`);
          resolve();
        })
        .on('error', (err) => {
          console.log(`error downloading the image for ${movie.id}`);
          reject(err);
        });
    }).catch((err) => console.log(`${movie.id} had an error: ${err}`));
  }

  fs.writeFileSync(`${dir}/movies.json`, JSON.stringify(moviesData), 'utf-8');
  const json2csvParser = new Json2csvParser();
  const csv = json2csvParser.parse(moviesData);
  fs.writeFileSync(`${dir}/movies.csv`, csv, 'utf-8');

  // let testPromise = new Promise((resolve, reject) => {
  //   let is_home = false;
  //   if (is_home) {
  //     resolve('12345');
  //   } else {
  //     reject('it is false');
  //   }
  // }).catch((err) => console.log(err));
  // could also put the promise body in a try catch
  // debugger;
})();

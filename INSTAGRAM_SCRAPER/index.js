const app = require('./app.js');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`nodejs-scraper listening on port ${PORT}`));

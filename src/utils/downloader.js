const https = require('https');
const { Transform } = require('stream');

const NodemyResponseError = require('./NodemyResponseError');

const downloader = (url = '') => new Promise((resolve, reject) => {
  https.request(url, (response) => {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      let data = new Transform();

      response.on('data', (chunk) => {
        data.push(chunk);
      });

      response.on('end', () => {
        resolve(data.read());
      });

      response.on('error', (err) => reject(new NodemyResponseError(500, err.message)));
    }
    else {
      reject(new NodemyResponseError(500, ''));
    }
  })
  .on('error', (err) => reject(new NodemyResponseError(500, err.message)))
  .end();
});

module.exports = downloader;

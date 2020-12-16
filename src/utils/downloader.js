const https = require("https");

const NodemyResponseError = require("./NodemyResponseError");

const downloader = (url = "") =>
  new Promise((resolve, reject) => {
    https
      .request(url, (response) => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          const data = "";

          response.on("data", (chunk) => {
            data += chunk;
          });

          response.on("end", () => {
            resolve(data);
          });

          response.on("error", (err) =>
            reject(new NodemyResponseError(500, err.message))
          );
        } else {
          reject(new NodemyResponseError(500, ""));
        }
      })
      .on("error", (err) => reject(new NodemyResponseError(500, err.message)))
      .end();
  });

module.exports = downloader;

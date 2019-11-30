var request = require("request");

module.exports = function(callback) {
  request.post(
    "https://api.sumup.com/token",
    {
      json: {
        grant_type: "password",
        client_id: process.env.SUMUP_CLIENT_ID,
        client_secret: process.env.SUMUP_CLIENT_SECRET,
        username: process.env.SUMUP_USERNAME,
        password: process.env.SUMUP_PASSWORD
      }
    },
    (error, sumupResponse, body) => {
      if (!error && sumupResponse.statusCode == 200) {
        callback(null, body.access_token);
      } else {
        callback(err, null);
      }
    }
  );
};

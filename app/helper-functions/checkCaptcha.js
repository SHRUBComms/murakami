var http = require("http");

module.exports = function(response, remoteip, callback) {
  var post_data = JSON.stringify({
    secret: process.env.RECAPTCHA_SECRET_KEY,
    response: response,
    remoteip: remoteip
  });

  var post_options = {
    host: "google.com",
    port: "80",
    path: "/recaptcha/api/siteverify",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(post_data)
    }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
    res.setEncoding("utf8");
    res.on("data", function(chunk) {
      callback(chunk);
    });
  });

  post_req.write(post_data);
};

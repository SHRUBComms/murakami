const fetch = require("node-fetch");

module.exports = async () => {
  try {

    const requestBody = {
      grant_type: "password",
      client_id: process.env.SUMUP_CLIENT_ID,
      client_secret: process.env.SUMUP_CLIENT_SECRET,
      username: process.env.SUMUP_USERNAME,
      password: process.env.SUMUP_PASSWORD
    }

    const response = await fetch (
      "https://api.sumup.com/token", 
      { 
        method: "post",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(requestBody)       
      }
    );
    
    const json = await response.json();
    return json.access_token;
  } catch (error) {
    return null;
  }
}

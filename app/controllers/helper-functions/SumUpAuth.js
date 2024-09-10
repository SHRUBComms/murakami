const fetch = require("node-fetch");
const crypto = require("crypto");

function decrypt(encryptedText) {
  const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "base64");
  const textParts = encryptedText.split(":");
  const iv = Buffer.from(textParts.shift(), "base64");
  const encryptedTextPart = textParts.join(":");
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedTextPart, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = async () => {
  //Imported late to avoid a dependency issue
  const Models = require("../../models/sequelize");
  const Settings = Models.Settings;

  try {
    const encryptedSumupOauth2Keys = await Settings.getById("encryptedSumupOauth2Keys");
    if (encryptedSumupOauth2Keys) {
      const sumUpCode = encryptedSumupOauth2Keys
        ? decrypt(encryptedSumupOauth2Keys.data.code)
        : null;
      const refreshToken = encryptedSumupOauth2Keys
        ? decrypt(encryptedSumupOauth2Keys.data.refreshToken)
        : null;

      const params = new URLSearchParams();
      params.append("grant_type", "refresh_token");
      params.append("client_id", process.env.OATUH2_SUMUP_CLIENT_ID);
      params.append("client_secret", process.env.OATUH2_SUMUP_CLIENT_SECRET);
      params.append("code", sumUpCode);
      params.append("refresh_token", refreshToken);

      const response = await fetch("https://api.sumup.com/token", {
        method: "post",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });

      const json = await response.json();
      return json.access_token;
    } else {
      //old authentication
      const requestBody = {
        grant_type: "password",
        client_id: process.env.SUMUP_CLIENT_ID,
        client_secret: process.env.SUMUP_CLIENT_SECRET,
        username: process.env.SUMUP_USERNAME,
        password: process.env.SUMUP_PASSWORD,
      };

      const response = await fetch("https://api.sumup.com/token", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const json = await response.json();
      return json.access_token;
    }
  } catch (error) {
    console.error("Failed to retrieve token via client and auth code grant:", error);
    return null;
  }
};

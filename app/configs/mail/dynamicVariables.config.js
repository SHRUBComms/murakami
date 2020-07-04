module.exports = dynamicVariablesAvailable = {
  first_name: {
    descriptor: "the recipient's first name",
    exampleData: "Ringo",
    availableOn: [
      "donation",
      "welcome-paid-member",
      "paid-renewal",
      "renewal-notice-short",
      "renewal-notice-long",
      "goodbye"
    ]
  },
  last_name: {
    descriptor: "the recipient's last name",
    exampleData: "Starr",
    availableOn: [
      "donation",
      "welcome-paid-member",
      "paid-renewal",
      "renewal-notice-short",
      "renewal-notice-long",
      "goodbye"
    ]
  },
  fullname: {
    descriptor: "the recipients full name",
    exampleData: "Ringo Starr",
    availableOn: [
      "donation",
      "welcome-paid-member",
      "paid-renewal",
      "renewal-notice-short",
      "renewal-notice-long",
      "goodbye"
    ]
  },
  membership_id: {
    descriptor: "the recipient's unique membership ID",
    exampleData: "123456789",
    availableOn: [
      "donation",
      "welcome-paid-member",
      "paid-renewal",
      "renewal-notice-short",
      "renewal-notice-long",
      "welcome-volunteer",
      "goodbye"
    ]
  },
  exp_date: {
    descriptor: "the date the recipient's membership will end",
    exampleData: "12th September 2050",
    availableOn: [
      "donation",
      "welcome-paid-member",
      "paid-renewal",
      "renewal-notice-short",
      "renewal-notice-long",
      "goodbye"
    ]
  },
  balance: {
    descriptor: "the recipient's current balance",
    exampleData: "13",
    availableOn: [
      "donation",
      "welcome-paid-member",
      "paid-renewal",
      "renewal-notice-short",
      "renewal-notice-long",
      "goodbye"
    ]
  },
  contact_preferences_link: {
    descriptor:
      "a link the recipient can use to update their contact preferences",
    exampleData: process.env.PUBLIC_ADDRESS + "/contact-preferences/123456789",
    availableOn: ["footer"]
  },
  tokens: {
    descriptor: "the amount of tokens given to member after donation",
    exampleData: "10",
    availableOn: ["donation"]
  },
  formatted_roles: {
    descriptor: "lists assigned volunteer role(s)",
    exampleData: "<ul><li><h5>Shop Assistant</h5><p>Help out at the zero waste hub!</p></li></ul>",
    availableOn: ["welcome-volunteer"]
  },
  wg_summary: {
    descriptor: "adds working group welcome message(s)",
    exampleData: "<h4>Swapshop</h4><p>Welcome to our group!</p>",
    availableOn: ["welcome-volunteer"]
  },
  receipt: {
    descriptor: "details of the transaction",
    exampleData: `<style> table { border-collapse: collapse; font-family: sans-serif; } th, td { text-align: left; padding: 8px; } p { font-size: 14px; font-family: sans-serif; } tr:nth-child(odd) { background-color: #f2f2f2; } </style> <center> <table> <tr> <td>Murakami Transaction ID</td> <td>85628577</td> </tr> <tr> <td>Timestamp</td> <td>28/2/20 09:32 AM</td> </tr> <tr> <td>Location</td> <td>Wee Spoke Hub Till</td> </tr> <tr> <td>Bill</td> <td>Accessories > Bell (New): 2.00 <b>x2</b></td> </tr> <tr> <td>Money Total</td> <td>4.00 (Cash)</td> </tr> <tr> <td>Tokens Total</td> <td>0</td> </tr> </table></center>`,
    availableOn: ["receipt"]
  },
  year: {
    descriptor: "the current year",
    exampleData: new Date().getFullYear(),
    availableOn: ["footer", "generic-footer"]
  }
};

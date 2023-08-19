The latest commit has added the ability for users to record Yoyo reusable cups being returned.

This page details what else needs to be updated for this feature to be fully implemented.

---

### Quick till summary

This endpoint is used to feed data to the till UI to tell a user the total revenue taken over a specified amount of time (by default set to today's date). The UI breaks down the total revenue down by cash and card and shows it on a pie chart.

The API needs to be updated to remove returned cups from total cash revenue. At present, returned cups are being added to the total cash taken instead of being subtracted.

File: **app/routes/api/post/tills/reports/quick-summary.js**
UI: **Tills > Manage Tills > *[select an open till]***

---

### Transactions report

This endpoint generates a report of transactions on a given till over a period of time specified by the user. The report's output is in a table format which can then be downloaded as a spreadsheet.

*Q for Alex: Should returned cups be removed from output, or should a negative cash amount be entered into the cash column?*

File: **app/routes/api/post/tills/reports/transactions.js**
UI: **Tills > Manage Tills > *[select a till]* > Reports**

---

### Transactions by project

This endpoint is used to connect to a Google Sheet which outputs a full list of completed till transactions for each project.

*Q for Alex: Should returned cups be removed from output, or should a negative cash amount be entered into the cash column?*

File: **app/routes/api/post/tills/reports/transactions-by-project.js**

---

### Revenue report

This endpoint is used to connect to a Google Sheet which outputs the total revenue of each working group for each month.

It needs to be updated to remove returned cups from the total revenue. At present, it adds the value of the returned cups to the total revenue instead of subtracting.

File: **app/routes/api/post/tills/reports/revenue.js**

---

### Total cash taken method

This method is used by the till reconciliation (till opening/closing) code to figure out how much cash is currently present in a given till.

It needs to be updated to take into account cash leaving tills due to cups being returned. At present, it adds the value of the returned cups to the total revenue instead of subtracting.

File: **app/models/transactions/methods/getTotalCashTakingsSince.js**

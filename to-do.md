The latest commit has added the ability for users to record Yoyo reusable cups being returned.

This page details what else needs to be updated for this feature to be fully implemented.

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

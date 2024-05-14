// /till

const router = require("express").Router();

const rootDir = process.env.CWD;

const Auth = require(rootDir + "/app/controllers/auth");

const {
  postProcessTransaction,
  getProcessTransaction,
} = require("./transactionService"); // Adjust the path if necessary

router.get("/", Auth.isLoggedIn, (req, res) => {
  res.redirect(process.env.PUBLIC_ADDRESS + "/till/select");
});

// GET endpoint for processing a transaction
router.get(
  "/transaction/:till_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "processTransaction"),
  async (req, res) => {
    try {
      const result = await getProcessTransaction({
        till_id: req.params.till_id,
        user: req.user,
        query: req.query,
      });
      res.render("till/root", result);
    } catch (error) {
      // If there's an error, set status to 500 (Internal Server Error) and send error message
      res.status(500).render("till/root", { status: "fail", message: error.message });
    }
  }
);
// POST endpoint for processing a transaction
router.post(
  "/transaction",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "processTransaction"),
  async (req, res) => {
    try {
      const {
        till_id,
        member_id,
        paymentMethod,
        transaction,
        payWithTokens, //this will be a string 'true' or 'false'
        note,
      } = req.body;
      const user = req.user;

      const payWithTokensBool = payWithTokens === "true";

      // Call the processTransaction function with the destructured parameters
      const result = await postProcessTransaction({
        till_id,
        member_id,
        paymentMethod,
        transaction,
        payWithTokens: payWithTokensBool,
        note,
        user,
      });

      res.send(result);
    } catch (error) {
      console.error("Error processing transaction:", error);
      res.status(500).json({ message: "Failed to process transaction", error });
    }
  }
);

router.use("/donations", require("./donations"));
router.use("/open", require("./open"));
router.use("/dashboard", require("./dashboard"));
router.use("/manage", require("./manage"));
router.use("/close", require("./close"));
router.use("/add", require("./add"));
router.use("/select", require("./select"));
router.use("/reports", require("./reports"));
router.use("/refunds", require("./refunds/root"));
router.use("/receipt", require("./receipt/root"));
router.use("/return-yoyo-cup", require("./return-yoyo-cup/root"));

router.use("/stock", require("./stock/root"));

module.exports = router;

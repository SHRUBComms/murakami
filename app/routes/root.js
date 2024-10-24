// /

const router = require("express").Router();

router.get("/", (req, res) => {
  if (req.user) {
    if (["admin", "staff", "volunteer"].includes(req.user.class)) {
      res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/manage");
    } else {
      res.redirect(process.env.PUBLIC_ADDRESS + "/till");
    }
  } else {
    res.redirect(process.env.PUBLIC_ADDRESS + "/login");
  }
});

// Setup routes
router.use("/members", require("./members/root"));
router.use("/api", require("./api/root"));
router.use("/till", require("./till/root"));
router.use("/settings", require("./settings/root"));
router.use("/working-groups", require("./working-groups/root"));
router.use("/users", require("./users/root"));
router.use("/volunteers", require("./volunteers/root"));
router.use("/carbon-accounting", require("./carbon-accounting/root"));
router.use("/food-collections", require("./food-collections/root"));

router.use("/error", require("./error"));
router.use("/support", require("./support"));
router.use("/login", require("./login"));
router.use("/contact-preferences", require("./contact-preferences"));
router.use("/recover", require("./recover"));
router.use("/logout", require("./logout"));
router.use("/success", require("./success"));
router.use("/privacy", require("./privacy"));

// Legacy path.
router.get("/get-carbon-calculations", (req, res) => {
  const key = req.query.key || "";
  res.redirect(process.env.PUBLIC_ADDRESS + "/api/get/reports/all-time/carbon-saved?key=" + key);
});

// Page not found
router.get("*", (req, res) => {
  res.render("error", {
    title: "Page Not Found",
    notFound: true,
  });
});

module.exports = router;

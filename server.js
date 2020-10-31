// Load environment variables
require("dotenv").config();

const Helpers = require(process.env.CWD + "/app/helper-functions/root");

// Import resources
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars');
const handlebarsPrototypePermission = require('@handlebars/allow-prototype-access')
let path = require("path");
const session = require("cookie-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const back = require("express-back");
const validator = require("express-validator");

if (process.env.NODE_ENV != "development") {
    process.on("uncaughtException", (error) => {
        console.error(error);
        console.log("Exception caught!");
    });
}

// Setup Handlebars
app.set("views", path.join(__dirname, "app/views"));
app.engine(
    "hbs",
    expressHandlebars({
        handlebars: handlebarsPrototypePermission.allowInsecurePrototypeAccess(handlebars),
        layoutsDir: path.join(__dirname, "app/views/layouts"),
        partialsDir: path.join(__dirname, "app/views/partials"),
        defaultLayout: "layout",
        extname: ".hbs",
        helpers: require("./app/configs/hbs_helpers.js").helpers
    })
);
app.set("view engine", "hbs");

// Overwrite default date formatter (broken in current version of node)
Date.prototype.toLocaleDateString = function () {
    return `${this.getDate()}/${this.getMonth() + 1}/${this.getFullYear()}`;
};

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

process.env.NODE_ENV = process.env.NODE_ENV || "development";

// Define port (if not already)
const port = process.env.PORT || 3000;
path = process.env.PUBLIC_PATH || "";

// Define public (static) directory
app.use(path, express.static("app/public"));

// CORS
app.use(cors());

// Set cookie.
Helpers.setCookie(app, session);

app.use(back());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
// Express Validator
app.use(validator(require("./app/configs/express-validators")));

app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());

// Start server
app.listen(port);
console.log("### " + process.env.NODE_ENV.toUpperCase() + " ###");
console.log("Server started on local port " + port);
console.log("Running on public address " + process.env.PUBLIC_ADDRESS);

// Initiate DB stuffs
const Models = require("./app/models/sequelize");

const VolunteerRoles = Models.VolunteerRoles;
const WorkingGroups = Models.WorkingGroups;

// Request pre-processor
app.use(async (req, res, next) => {
    // Server -> client messages
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");

    // Pass base URL to client
    res.locals.public_address = process.env.PUBLIC_ADDRESS;

    // Refresh cookie
    Helpers.setCookie(app, session);

    if (req.user) {

        // Hard-code admin access to modifying access permissions
        if (req.user.class == "admin") {
            req.user.permissions.settings.dataPermissions = true;
        }

        res.locals.user = req.user; // Pass user object to client

        if (req.user.deactivated == 0) {
            req.user[req.user.class] = 1;
            req.user.name = req.user.first_name + " " + req.user.last_name;

            req.user.notification_preferences = req.user.notification_preferences || {};

            // Pass all volunteer roles to client
            const {
                rolesObj
            } = await VolunteerRoles.getAll();
            req.user.allVolunteerRoles = rolesObj;

            // Pass working groups (in various forms) to client
            const {
                allWorkingGroupsObj,
                allWorkingGroupsArray,
                allWorkingGroupsFlat
            } = await WorkingGroups.getAll();
            req.user.allWorkingGroups = allWorkingGroupsObj;
            req.user.allWorkingGroupsObj = allWorkingGroupsObj;
            req.user.all_working_groups_arr = allWorkingGroupsArray;
            req.user.working_groups_arr = allWorkingGroupsArray;
            req.user.allWorkingGroupsFlat = allWorkingGroupsFlat;

            next();
        } else {
            // If user has been deactivated, chuck them out.
            res.locals.user = null;
            req.logout();
            req.session = null;

            next();
        }
    } else {
        // No user logged in -
        res.locals.user = null;

        next();
    }
});

// Automated processes
const automatedMails = require("./app/automated-scripts/emails");
const automatedReports = require("./app/automated-scripts/reports");
const cleanFailedTransactions = require("./app/automated-scripts/clean-failed-transactions");
if (process.env.NODE_ENV == "production") {
    automatedMails.start();
    automatedReports.start();
    cleanFailedTransactions.start();
}

// Define routers
app.use(path, require("./app/routes/root"));

module.exports.getApp = app;
const rootDir = process.env.CWD;

const moment = require("moment");
moment.locale("en-gb");

const Models = require(rootDir + "/app/models/sequelize");

const AccessTokens = Models.AccessTokens;

let Auth = {};

Auth.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect(process.env.PUBLIC_ADDRESS + "/login");
    }
}

Auth.canAccessPage = (parent, page) => {
    return (req, res, next) => {
        try {
            if (req.user.permissions[parent][page]) {
                return next();
            } else {
                res.redirect(process.env.PUBLIC_ADDRESS + "/");
            }
        } catch (error) {
            res.redirect(process.env.PUBLIC_ADDRESS + "/");
        }
    }
}

Auth.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    } else {
        res.redirect(process.env.PUBLIC_ADDRESS + "/");
    }
}

Auth.isOfClass = (allowedClasses) => {
    return (req, res, next) => {
        if (allowedClasses.includes(req.user.class)) {
            return next();
        } else {
            res.redirect("/");
        }
    }
}

Auth.verifyByKey = (resource) => {
    return async (req, res, next) => {

        const validResources = ["carbonSavings", "publicVolunteerRoles", "tillRevenue", "membershipReport", "membershipSignUp"];

        try {
            if (!validResources.includes(resource)) {
                throw "Invalid resource key";
            }

            if (!req.query.key && !req.query.token) {
                throw "Permission denied - no key given";
            }

            const key = req.query.key || req.query.token;
            const accessToken = await AccessTokens.getById(key);

            if (!accessToken) {
                throw "Permission denied - invalid key given";
            }

            if (accessToken.used == 1) {
                throw "Permission denied - key expired";
            }

            if (!moment(accessToken.expirationTimestamp).isAfter(moment())) {
                throw "Permission denied - key expired";
            }

            if (accessToken.details.resource != resource) {
                throw "Permission denied - invalid key given";
            }

            return next();
        } catch (error) {
            console.log(error);
            if (typeof error != "string") {
                error = "Permission denied";
            }

            res.send({
                status: "fail",
                msg: error
            });
        }
    }
}

Auth.hasValidToken = (action) => {
    return async (req, res, next) => {
        try {
            const invite = await AccessTokens.getById(req.params.token || req.query.token);

            if (invite.details.action != action) {
                throw "Token invalid";
            }

            res.invite = invite;
            return next();
        } catch (error) {
            res.redirect("/");
        }
    }
}

module.exports = Auth;

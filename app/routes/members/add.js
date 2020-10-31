// /members/add

const router = require("express").Router();
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;
const WorkingGroups = Models.WorkingGroups;
const AccessTokens = Models.AccessTokens;
const Tills = Models.Tills;
const Transactions = Models.Transactions;

const Auth = require(rootDir + "/app/configs/auth");
const Mail = require(rootDir + "/app/configs/mail/root");
const validateMember = require(rootDir + "/app/controllers/members/validateMember");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("members", "add"), async (req, res) => {
    try {
        let tillMode;
        const till_id = req.query.till_id || null;
        if (till_id) {
            tillMode = true;
        }

        let till = await Tills.getById(till_id);
        if (till) {
            till.status = 1;
            if (till.disabled == 1) {
                till = null;
            }
        }
        const {
            ourVision,
            saferSpacesPolicy,
            membershipBenefits,
            privacyNotice
        } = await Members.getSignUpInfo();

        res.render("members/add", {
            tillMode: res.locals.tillMode || tillMode,
            title: "Add Member",
            membersActive: true,
            addMemberActive: true,
            staticContent: {
                ourVision: ourVision,
                saferSpacesPolicy: saferSpacesPolicy,
                membershipBenefitsInfo: membershipBenefits,
                privacyNotice: privacyNotice
            },
            murakamiMsg: req.query.murakamiMsg || null,
            murakamiStatus: req.query.murakamiStatus || null,

            till_id: till_id,
            till: till
        });
    } catch (error) {
        res.redirect(process.env.PUBLIC_ADDRESS + "/error");
    }
});

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("members", "add"), async (req, res) => {
    let till = null;
    let till_id = req.query.till_id || null;
    const {
        ourVision,
        saferSpacesPolicy,
        membershipBenefits,
        privacyNotice
    } = await Members.getSignUpInfo();

    try {
        till = await Tills.getById(req.query.till_id);
        if (till) {
            if (till.disabled == 1) {
                till = null;
            }
        }

        if (!(req.user.permissions.members.addSpecialMembers == true || till)) {
            throw "You are not permitted to add a member";
        }

        const memberValid = await validateMember(req.params, req.body);

        const emailInUse = await Members.getByEmail(req.body.email);
        if (emailInUse) {
            throw "Email address is already in use!";
        }

        if (!req.body.membership_type && till) {
            req.body.membership_type = "unpaid";
        }

        const generalNewsletterConsent = req.body.generalNewsletterConsent;

        till_id = req.query.till_id;

        const earliest_membership_date = new Date();
        const current_init_membership = earliest_membership_date;
        let current_exp_membership;

        if (req.body.membership_type != "unpaid") {
            if (!till) {
                if (req.user.permissions.members.addSpecialMembers) {
                    if (["lifetime", "staff", "trustee"].includes(req.body.membership_type)) {
                        current_exp_membership = moment("9999-01-01").toDate();
                    } else {
                        throw "Please select a valid membership type";
                    }
                } else {
                    req.body.membership_type = "unpaid";
                }
            }
        }

        const sanitizedMember = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            phone_no: req.body.phone_no,
            address: req.body.address,
            free: 0,
            membership_type: req.body.membership_type,
            earliest_membership_date: earliest_membership_date,
            current_init_membership: current_init_membership,
            current_exp_membership: current_exp_membership || new Date()
        };

        const memberId = await Members.add(sanitizedMember);

        if (req.body.generalNewsletterConsent == "on") {
            await MailchimpAPI.subscribeToNewsletter(process.env.SHRUB_MAILCHIMP_NEWSLETTER_LIST_ID, process.env.SHRUB_MAILCHIMP_SECRET_API_KEY, member);
        }

        await Mail.sendAutomatedMember("welcome-paid-member", memberId, {});

        if (!till) {
            req.flash("success_msg", "New member added!");
            res.redirect(process.env.PUBLIC_ADDRESS + "/members/view/" + memberId);

        } else {
            res.redirect(process.env.PUBLIC_ADDRESS + "/till/transaction/" + req.query.till_id + "?member_id=" + memberId + "&murakamiMsg=" +
                encodeURIComponent(
                    "Member successfully added - please select and pay for a membership to complete registration"
                ) + "&murakamiStatus=ok"
            );
        }

    } catch (error) {
        console.log(error);
        if (typeof error != "string") {
            error = "Something went wrong! Please try again";
        }

        res.render("members/add", {
            errors: [{
                msg: error
            }],
            membersActive: true,
            title: "Add Member",
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            phone_no: req.body.phone_no,
            address: req.body.address,

            staticContent: {
                ourVision: ourVision,
                saferSpacesPolicy: saferSpacesPolicy,
                membershipBenefitsInfo: membershipBenefits,
                privacyNotice: privacyNotice
            },
            shrubExplained: req.body.shrubExplained,
            safeSpace: req.body.safeSpace,
            membershipBenefits: req.body.membershipBenefits,
            contactConsent: req.body.contactConsent,
            privacyNotice: req.body.privacyNotice,
            gdprConsent: req.body.gdprConsent,
            dob: req.body.dob,
            till_id: till_id,
            till: till
        });
    }
});

module.exports = router;

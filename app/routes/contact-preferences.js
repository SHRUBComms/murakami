// /contact-preferences

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;

const MailchimpAPI = require(rootDir + "/app/controllers/mailchimp");

router.get("/:member_id", async (req, res) => {
  try {
    const member = await Members.getById(req.params.member_id, {
      permissions: {
        members: {
          name: true,
          contactDetails: true,
        },
      },
    });

    if (!member) {
      throw "Member not found";
    }

    if (member.contactPreferences) {
      member.contactPreferences.newsletters = {
        shrub: null,
      };
    } else {
      member.contactPreferences = {
        newsletters: {
          shrub: null,
        },
      };
    }

    const isSubscribed = await MailchimpAPI.isSubscribedToNewsletter(
      process.env.SHRUB_MAILCHIMP_NEWSLETTER_LIST_ID,
      process.env.SHRUB_MAILCHIMP_SECRET_API_KEY,
      member.email
    );
    if (isSubscribed) {
      member.contactPreferences.newsletters.shrub = true;
    }

    res.render("contact-preferences.hbs", {
      title: "Contact Preferences",
      member: member,
    });
  } catch (error) {
    res.render("error", {
      title: "Page Not Found",
      notFound: true,
    });
  }
});

router.post("/:member_id", async (req, res) => {
  try {
    const member = await Members.getById(req.params.member_id, {
      permissions: {
        members: {
          name: true,
          contactDetails: true,
        },
      },
    });
    if (!member) {
      throw "Member not found";
    }

    if (!member.contactPreferences) {
      member.contactPreferences = {};
    }

    const contactPreferences = {
      volunteeringOpportunities: member.contactPreferences.volunteeringOpportunities,
      behaviourChangeSurvey: member.contactPreferences.behaviourChangeSurvey,
      newsletters: {},
    };

    if (req.body.newsletters) {
      if (req.body.newsletters.shrub) {
        if (req.body.newsletters.shrub.subscribe) {
          contactPreferences.newsletters.shrub = true;
          await MailchimpAPI.subscribeToNewsletter(
            process.env.SHRUB_MAILCHIMP_NEWSLETTER_LIST_ID,
            process.env.SHRUB_MAILCHIMP_SECRET_API_KEY,
            member
          );
        }

        if (req.body.newsletters.shrub.unsubscribe) {
          contactPreferences.newsletters.shrub = null;
          await MailchimpAPI.unsubscribeFromNewsletter(
            process.env.SHRUB_MAILCHIMP_NEWSLETTER_LIST_ID,
            process.env.SHRUB_MAILCHIMP_SECRET_API_KEY,
            member
          );
        }
      }
    }

    if (req.body.volunteeringOpportunities) {
      if (req.body.volunteeringOpportunities.subscribe) {
        contactPreferences.volunteeringOpportunities = true;
      } else if (req.body.volunteeringOpportunities.unsubscribe) {
        contactPreferences.volunteeringOpportunities = null;
      }
    }

    if (req.body.behaviourChangeSurvey) {
      if (req.body.behaviourChangeSurvey.subscribe) {
        contactPreferences.behaviourChangeSurvey = true;
      } else if (req.body.behaviourChangeSurvey.unsubscribe) {
        contactPreferences.behaviourChangeSurvey = null;
      }
    }

    await Members.updateContactPreferences(req.params.member_id, contactPreferences);

    req.flash("success_msg", "Contact preferences successfully updated!");
    res.redirect(process.env.PUBLIC_ADDRESS + "/contact-preferences/" + member.member_id);
  } catch (error) {
    res.render("error", {
      title: "Page Not Found",
      notFound: true,
    });
  }
});

module.exports = router;

// /volunteers/check-in

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Users = Models.Users;
const Members = Models.Members;
const Volunteers = Models.Volunteers;
const VolunteerCheckIns = Models.VolunteerCheckIns;
const Settings = Models.Settings;

const Auth = require(rootDir + "/app/controllers/auth");

let expectedQuestionnaire;

Settings.findOne({ where: { id: "activities" } }).then((err, skills) => {
  expectedQuestionnaire = {
    W7cnfJVW: {
      question_id: "W7cnfJVW",
      type: "plaintext",
      question: "What’s going well and what’s not going well?",
    },
    DuRN9396: {
      question_id: "DuRN9396",
      type: "plaintext",
      question:
        "Are you getting what you want from this role? Are you developing the skills you’d like to?",
      fromInitialSurvey: "goals",
    },
    V6Q3f9BR: {
      question_id: "V6Q3f9BR",
      type: "multi-select",
      //options: skills.data,
      question:
        "Please select any skills you feel that you've gained or developed during your time volunteering with us.",
      fromInitialSurvey: "goals",
    },
    tfM2S2R4: {
      question_id: "tfM2S2R4",
      type: "plaintext",
      question: "Do you need any additional support?",
    },
    ykCcA43Z: {
      question_id: "ykCcA43Z",
      type: "plaintext",
      question: "Would you like any additional training?",
      fromInitialSurvey: "interests",
    },
    Zmumsq7X: {
      question_id: "Zmumsq7X",
      type: "plaintext",
      question: "Any additional notes/remarks?",
    },
  };
});

router.get("/", (req, res) => {
  res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/manage");
});

router.get(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteers", "conductCheckIn"),
  async (req, res) => {
    try {
      const member = await Members.getById(req.params.member_id, req.user);
      if (!member) {
        throw "Member not found";
      }

      const volunteer = await Volunteers.getVolunteerById(req.params.member_id, req.user);

      if (!volunteer) {
        throw "Member is not a volunteer";
      }

      if (!volunteer.conductCheckIn) {
        throw "You don't have permission to conduct a check-in with this volunteer";
      }

      const checkin = await VolunteerCheckIns.getById(volunteer.checkin_id);
      const { usersObj } = await Users.getAll(req.user);

      res.render("volunteers/check-in", {
        title: "Volunteer Check-in",
        volunteersActive: true,
        allUsers: usersObj,
        member: member,
        volInfo: volunteer,
        lastCheckIn: checkin,
        questionnaire: expectedQuestionnaire,
      });
    } catch (error) {
      console.log(error);
      if (typeof error != "string") {
        error = "Something went wrong! Please try again";
      }
      req.flash("error_msg", error);
      res.redirect(process.env.PUBLIC_ADDRESS + "/members/view/" + req.params.member_id);
    }
  }
);

router.post(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteers", "conductCheckIn"),
  async (req, res) => {
    try {
      const member = await Members.getById(req.params.member_id, req.user);
      if (!member) {
        throw "Member not found";
      }

      const volunteer = await Volunteers.getVolunteerById(req.params.member_id, req.user);

      if (!volunteer) {
        throw "Member is not a volunteer";
      }

      if (!volunteer.conductCheckIn) {
        throw "You don't have permission to conduct a check-in with this volunteer";
      }

      const questionnaire = req.body.questionnaire;
      let questionnaireValid = true;

      for await (const questionId of Object.keys(expectedQuestionnaire)) {
        if (!questionnaire[questionId]) {
          questionnaireValid = false;
          break;
        }

        const question = expectedQuestionnaire[questionId];

        if (question.type == "multi-select") {
          if (!Array.isArray(questionnaire[questionId])) {
            try {
              questionnaire[questionId] = [questionnaire[questionId]];
            } catch (error) {
              questionnaireValid = false;
              break;
            }
          } else if (question.type == "plaintext") {
            try {
              questionnaire[questionId] = String(questionnaire[questionId]);
            } catch (error) {
              questionnaireValid = false;
              break;
            }
          }
        }
      }

      if (!questionnaireValid) {
        throw "Please complete the questionnaire";
      }

      if (Object.keys(questionnaire).length !== Object.keys(expectedQuestionnaire).length) {
        throw "Please complete the questionnaire";
      }

      await VolunteerCheckIns.add(req.params.member_id, req.user.id, questionnaire);

      req.flash(
        "success_msg",
        "Questionnaire complete! Please update this volunteer's details to finish check-in"
      );
      res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/update/" + req.params.member_id);
    } catch (error) {
      req.flash("error_msg", "Please complete the questionnaire!");
      res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/check-in/" + req.params.member_id);
    }
  }
);

module.exports = router;

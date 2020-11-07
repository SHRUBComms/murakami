// /api/get/members/transactions

const router = require("express").Router();
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Transactions = Models.Transactions;
const StockCategories = Models.StockCategories;
const Members = Models.Members;

const Auth = require(rootDir + "/app/controllers/auth");

router.get("/:member_id", Auth.isLoggedIn, Auth.canAccessPage("members", "transactionHistory"), async (req, res) => {
	try {
		const member = await Members.getById(req.params.member_id, req.user);
		if (!member) {
			throw "Member not found";
		}

		const transactions = await Transactions.getByMemberId(req.params.member_id);

		if(!transactions) {
			throw "Member has no transactions"
		}

		const categories = await StockCategories.getCategories("treeKv");

		const formattedTransactions = await Transactions.formatTransactions(transactions, { [member.member_id]: { member } }, categories, req.params.till_id);
		res.send(formattedTransactions);
	} catch (error) {
		console.log(error);
		res.send([]);
	}
});

module.exports = router;

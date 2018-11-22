// /api/get/members/transactions

var router = require("express").Router();
var async = require("async");
var moment = require("moment");

var rootDir = process.env.CWD;

var Tills = require(rootDir + "/app/models/tills");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get("/:member_id", Auth.isLoggedIn, function(req, res) {

  	Tills.getTransactionsByMemberId(
    	req.params.member_id,
    	function(err, transactions) {
	      if (transactions.length > 0) {
	        Tills.getCategoriesByTillId(
	          req.params.till_id,
	          "tree",
	          function(err, categories) {
	            var flatCategories = Helpers.flatten(categories);

	            var flatCategoriesAsObj = {};
	            async.each(
	              flatCategories,
	              function(category, callback) {
	                flatCategoriesAsObj[category.item_id] = category;

	                callback();
	              },
	              function() {
	                formattedTransactions = [];
	                async.each(
	                  transactions,
	                  function(transaction, callback) {
	                    let formattedTransaction = {};

	                    transaction.summary = JSON.parse(
	                      transaction.summary
	                    );

	                    formattedTransaction.date = moment(
	                      transaction.date
	                    );
	                    formattedTransaction.date = moment(
	                      formattedTransaction.date
	                    ).format("D/M/YY hh:mm A");

	                    formattedTransaction.customer = {};
	                    if (transaction.member_id != "anon") {
	                      formattedTransaction.customer.id =
	                        transaction.member_id;
	                      formattedTransaction.customer.name =
	                        "Member (<a href='/members/view/" +
	                        formattedTransaction.customer.id +
	                        "' target='_blank'>view profile</a>)";
	                    } else {
	                      formattedTransaction.customer.name = "Non-member";
	                    }

	                    formattedTransaction.totals = {};
	                    formattedTransaction.totals.tokens =
	                      transaction.summary.totals.tokens || "0";
	                    formattedTransaction.totals.money =
	                      "£" +
	                      (transaction.summary.totals.money || "0.00");
	                    formattedTransaction.paymentMethod =
	                      transaction.summary.paymentMethod || "";
	                    if (formattedTransaction.paymentMethod) {
	                      formattedTransaction.totals.money +=
	                        " (" +
	                        formattedTransaction.paymentMethod.toProperCase() +
	                        ")";
	                    }

	                    formattedTransaction.bill = [];
	                    let bill = "";
	                    for (
	                      let i=0;
	                      i < transaction.summary.bill.length;
	                      i++
	                    ) {
	                      if (
	                        transaction.summary.bill[i].item_id ==
	                        "donation"
	                      ) {
	                        bill +=
	                          "Donation: " +
	                          transaction.summary.bill[i].tokens;
	                      } else if (
	                        transaction.summary.bill[i].item_id ==
	                        "volunteering"
	                      ) {
	                        bill +=
	                          "Volunteering: " +
	                          transaction.summary.bill[i].tokens;
	                      } else if (
	                        flatCategoriesAsObj[
	                          transaction.summary.bill[i].item_id
	                        ]
	                      ) {
	                        bill +=
	                          flatCategoriesAsObj[
	                            transaction.summary.bill[i].item_id
	                          ].absolute_name +
	                          ": " +
	                          parseFloat(transaction.summary.bill[i].tokens).toFixed(2);
	                      } else {
	                      	bill += "Unknown Item: " + parseFloat(transaction.summary.bill[i].tokens).toFixed(2);
	                      }

	                      if (i + 1 !== transaction.summary.bill.length) {
	                        bill += "<br />";
	                      }
	                    }

	                    if(transaction.summary.comment){
	                      bill += "<br />Comment: " + transaction.summary.comment;
	                    }

	                    formattedTransaction.bill = bill;

	                    formattedTransactions.push(formattedTransaction);

	                    callback();
	                  },
	                  function() {
	                    res.send(formattedTransactions);
	                  }
	                );
	              }
	            );
	          }
	        );
	      } else {
	        res.send([]);
	      }
    	}
  	);

});

module.exports = router;

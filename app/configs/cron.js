var CronJob = require('cron').CronJob;
var async = require("async");

// Import models etc.
var Members = require("../models/members");
var Transactions = require("../models/transactions");
var Mail = require("./mail")
var WorkingGroups = require("../models/working-groups")

var job = new CronJob({
  cronTime: '0 30 9 * * *',
  onTick: function() {
    // Begone expired members!
    Members.getMembershipsExpiringToday(function(err, members){
    	async.each(members, function(member, callback){
    		Members.updateStatus(member.member_id, 0, function(err){
    			Mail.sendAutomated("goodbye", member.member_id, function(err) {
                    console.log("Membership expired (" + member.member_id + ")");
                })
    		})
    	});
    });

    Members.getExpired(function(err, members){
    	async.each(members, function(member, callback){
    		Members.updateStatus(member.member_id, 0, function(err){
    			console.log("Membership expired (" + member.member_id + ")");
    		})
    	});
    })

    // Redact personal info of 2+ year old members
    Members.getExpiredTwoYearsAgo(function(err, members){
    	async.each(members, function(member, callback){
    		Members.redact(member.member_id, function(err){
    			console.log("Member redacted (" + member.member_id + ")");
    		})
    	});
    });

    // Process transactions - change active swapper status
    Transactions.getAllFromLast30Days(function(err, transactions){
    	async.each(transactions, function(transaction, callback){
    		Members.updateActiveSwapperStatus(transaction.member_id, 1, function(err){
    			console.log("Member is active swapper (" + transaction.member_id + ")");
    		});
    	});
    });

    // Every 6 months ask members to update



    // Update volunteer statuses

    // Update free vols
    Members.getFreeVols(function(err, volunteers){
        async.each(volunteers, function(volunteer, callback){
            WorkingGroups.getHoursFromPastTwoMonthsByMemberId(volunteer.member_id, function(err, hours){
                if(!hours[0]){
                    Members.updateVolunteerStatus
                }
            });
        });        
    })


  },
  start: false,
  timeZone: 'Europe/London'
});

module.exports = job;
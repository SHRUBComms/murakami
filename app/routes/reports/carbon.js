// /reports/carbon

var router = require("express").Router();
var moment = require("moment");

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

var Carbon = require(rootDir + "/app/models/carbon-calculations");
var Settings = require(rootDir + "/app/models/settings");

router.get('/', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
	var startDate = new Date(req.query.startDate);
	var endDate = req.query.endDate;
	var unit = req.query.unit;
	var type = req.query.type;

	if(unit == "grams") {
		unit = {factor: 1, name: "grams"};
	} else if(unit == "tonnes") {
		unit = {factor: 1e-6, name: "tonnes"};
	} else {
		unit = {factor: 1e-3, name: "kilos"};
	}

	if(endDate){
		endDate = new Date(endDate);
	} else {
		endDate = new Date();
	}

	Settings.getAll(function(err, settings){
		settings = settings[0];
		settings.definitions = JSON.parse(settings.definitions);

		Carbon.getAll(function(err, raw){

			if(type == "monthly_summary"){

				var dataByMonth = []
				let length = Math.ceil(moment(endDate).diff(moment(startDate), 'months', true));

				for(i=0;i<length;i++){

					let date = moment(startDate);
					date = moment(date).add(i, 'M');

					let plain = moment(date).format("MMMM YYYY");

					let categories = {};

					for(j=0;j<settings.definitions.items.length;j++){
						categories[settings.definitions.items[j].id] = 0;
					}

				    dataByMonth.push({month: {simple: new Date(date), plain: plain }, carbon: categories });
				}

				for(i=0;i<raw.length;i++){
					var date = new Date(raw[i].trans_date);
					for(j=0;j<dataByMonth.length;j++){
				        if((date.getMonth() == dataByMonth[j].month.simple.getMonth()) && (date.getYear() == dataByMonth[j].month.simple.getYear())){
				        	raw[i].trans_object = JSON.parse(raw[i].trans_object);
				            Object.keys(raw[i].trans_object).forEach(function(key) {
				            	dataByMonth[j].carbon[key] = dataByMonth[j].carbon[key] + +raw[i].trans_object[key]
				            });
				        }
				    }
				}

				for(i=0;i<dataByMonth.length;i++){
					Object.keys(dataByMonth[i].carbon).forEach(function(key) {
						dataByMonth[i].carbon[key] = (dataByMonth[i].carbon[key] * unit.factor).toFixed(4);
					});
				}

				// console.log(dataByMonth);

				try {
					startDate = startDate.toISOString().split('T')[0];
				} catch(err) {
					startDate = null;
				}
				endDate = endDate.toISOString().split('T')[0] || null;


				res.render("reports/carbon", {
					reportsActive: true,
					title: "Carbon Report",
					carbon: dataByMonth,
					unit: unit,
					type: type,
					settings: settings,
					startDate: startDate,
					endDate: endDate
				})
			} else if(type == "basic_total") {

				formattedData = {};

				for(i=0;i<settings.definitions.items.length;i++){
					formattedData[settings.definitions.items[i].id] = 0;
				}

				for(i=0;i<raw.length;i++){

			        if(raw[i].trans_date >= startDate && raw[i].trans_date <= endDate){
			        	raw[i].trans_object = JSON.parse(raw[i].trans_object);
			            Object.keys(raw[i].trans_object).forEach(function(key) {
			            	formattedData[key] = formattedData[key] + +raw[i].trans_object[key]
			            });
			        }
				   
				}

				Object.keys(formattedData).forEach(function(key) {
					formattedData[key] = (formattedData[key] * unit.factor).toFixed(4);
				});

				try {
					startDate = startDate.toISOString().split('T')[0];
				} catch(err) {
					startDate = null;
				}
				endDate = endDate.toISOString().split('T')[0] || null;


				res.render("reports/carbon", {
					reportsActive: true,
					title: "Carbon Report",
					carbon: formattedData,
					type: type,
					unit: unit,
					settings: settings,
					startDate: startDate,
					endDate: endDate
				})


			} else {
				res.render("reports/carbon", {
					reportsActive: true,
					title: "Carbon Report",
					unit: unit,
					settings: settings,
					startDate: startDate,
					endDate: endDate
				})				
			}
		});
	});
});

module.exports = router;
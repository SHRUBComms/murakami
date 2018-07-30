var mysql = require('mysql');

if(process.env.NODE_ENV == "production") {
	var connection = mysql.createConnection({
	    host: process.env.PROD_DB_HOST,
	    user: process.env.PROD_DB_USER,
	    password: process.env.PROD_DB_PASS,
	    database: process.env.PROD_DB_NAME,
	    multipleStatements: true
	});

} else if(process.env.NODE_ENV == "testing"){
	var connection = mysql.createConnection({
	    host: process.env.TEST_DB_HOST,
	    user: process.env.TEST_DB_USER,
	    password: process.env.TEST_DB_PASS,
	    database: process.env.TEST_DB_NAME,
	    multipleStatements: true
	});

} else {
	var connection = mysql.createConnection({
	    host: process.env.DEV_DB_HOST,
	    user: process.env.DEV_DB_USER,
	    password: process.env.DEV_DB_PASS,
	    database: process.env.DEV_DB_NAME,
	    multipleStatements: true
	});

}

connection.connect(function(err) {
    if (err) throw err;
    console.log("Database connection successful!");
});

module.exports = connection;
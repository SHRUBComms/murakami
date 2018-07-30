var con = require('../models/index');
var mysql = require('mysql');
var express = require('express');
var app = express();
var http = require("http")

var Helpers = {}

Helpers.generateIntId = function(length){
	return Math.floor(Math.pow(10, length-1) + Math.random() * 9 * Math.pow(10, length-1));
}

Helpers.generateBase64Id = function(length){

    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    var result = '';
	  
	for (var i=0; i<length; i++){
	    result += possible.charAt(Math.floor(Math.random() * possible.length));
	}

    return result;
}

Helpers.uniqueIntId = function(length, table, id_name, callback){
	var query = "SELECT ?? FROM ?? WHERE ?? = ?";
	// Generate ID!
	var id = Helpers.generateIntId(length);

	var inserts = [id_name, table, id_name, id];
	var sql = mysql.format(query, inserts);

	con.query(sql, function(err, result) {
	  	if(result.length == 1){
	  		uniqueIntId(length, table, id_name, callback);
	  	} else if(result.length == 0) {
			callback(id);
	  	}
	});


}

Helpers.uniqueBase64Id = function(length, table, id_name, callback){
	var query = "SELECT ?? FROM ?? WHERE ?? = ?";
	// Generate ID!
	var id = Helpers.generateBase64Id(length);

	var inserts = [id_name, table, id_name, id];
	var sql = mysql.format(query, inserts);


	con.query(sql, function(err, result) {
	  	if(result.length == 1){
	  		uniqueBase64Id(length, table, id_name, callback);
	  	} else if(result.length == 0) {
			callback(id);
	  	}
	});


}

Helpers.checkCaptcha = function(response, remoteip, callback){
	var post_data = JSON.stringify({
		'secret' : process.env.RECAPTCHA_SECRET_KEY,
	    'response' : response,
	    'remoteip' : remoteip
	});

  var post_options = {
      host: 'google.com',
      port: '80',
      path: '/recaptcha/api/siteverify',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data)
      }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          callback(chunk)      
      });
  });

  post_req.write(post_data);
}

module.exports = Helpers;

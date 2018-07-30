var express = require('express');
var app = express();

var Auth = {}

Auth.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/login');
    }
}

Auth.isAdmin = function(req, res, next){
	if(req.user.admin == 1) {
		return next();
	} else {
		res.redirect('/');
	}
}

module.exports = Auth

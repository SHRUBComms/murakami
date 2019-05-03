var con = require("./index");
var mysql = require("mysql");
var bcrypt = require("bcrypt-nodejs");
var async = require("async");
var lodash = require("lodash");
var moment = require("moment");
moment.locale("en-gb");

var Helpers = require("../configs/helpful_functions");
var Attempts = require("./attempts");

var Users = {};

module.exports = Users;

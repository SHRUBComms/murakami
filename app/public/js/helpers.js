// Custom handlebar helpers

var register = function(Handlebars) {
  var helpers = {
    select: function(value, options){
	  return options.fn(this)
	    .split('\n')
	    .map(function(v) {
	      var t = 'value="' + value + '"'
	      return ! RegExp(t).test(v) ? v : v.replace(t, t + ' selected')
	    })
	    .join('\n')
    },
    ifEqual: function(conditional, options) {
      if (options.hash.value === conditional) {
        return options.fn(this)
      } else {
        return options.inverse(this);
      }
    },
    ifGreaterThan: function(v1, v2, options) {
      if(v1 > v2) {
        return options.fn(this);
      }
      return options.inverse(this);
    },
    groupedEach: function(every, context, options) {
      var out = "", subcontext = [], i;
      if (context && context.length > 0) {
          for (i = 0; i < context.length; i++) {
              if (i > 0 && i % every === 0) {
                  out += options.fn(subcontext);
                  subcontext = [];
              }
              subcontext.push(context[i]);
          }
          out += options.fn(subcontext);
      }
      return out;      
    },    
    json: function(context) {
      return JSON.stringify(context);      
    }
  };

  if (Handlebars && typeof Handlebars.registerHelper === "function") {
    for (var prop in helpers) {
        Handlebars.registerHelper(prop, helpers[prop]);
    }
  } else {
      return helpers;
  }

};

module.exports.register = register;
module.exports.helpers = register(null);
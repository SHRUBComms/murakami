module.exports = function(app, session){
  var now = new Date();
  if(process.env.NODE_ENV == "production"){
    app.use(
      session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: true,
        maxAge: 12 * 60 * 60 * 1000,
        expires: now.setHours(now.getHours() + 12),
        cookie: {
          path: "/",
          secure: true
        },
        name: "murakami_biscuit"
      })
    );
  } else {
    app.use(
      session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: true,
        maxAge: 12 * 60 * 60 * 1000,
        expires: now.setHours(now.getHours() + 12),
        cookie: {
          path: "/",
          httpOnly: true
        },
        name: "murakami_biscuit"
      })
    );
  }
}

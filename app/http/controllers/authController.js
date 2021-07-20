const flash = require("express-flash");
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const passport = require("passport");

function authController() {
  const _loginRedirect = (req) => {
    return req.user.role === "admin" ? "/admin/orders" : "/customers/orders";
  };

  return {
    login(req, res) {
      res.render("auth/login");
    },

    logout(req, res) {
      req.logout();
      return res.redirect("/login");
    },

    async postLogin(req, res, next) {
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          req.flash("error", info.message);
        }

        if (!user) {
          req.flash("error", info.message);
          return res.redirect("/login");
        }

        req.logIn(user, (err) => {
          if (err) {
            req.flash("error", info.message);
            return next(err);
          }
          return res.redirect(_loginRedirect(req));
        });
      })(req, res, next);
    },

    register(req, res) {
      res.render("auth/register");
    },
    async postRegister(req, res) {
      const { name, email, password } = req.body;
      if (name == "" || email == "" || password == "") {
        req.flash("error", "All fields are required");
        req.flash("email", email);
        req.flash("name", name);
        return res.redirect("/register");
      }

      //Hash password
      let hashPassword = await bcrypt.hash(password, 10);

      try {
        //Check if user exist
        // Check if email exists
        User.exists({ email: email }, (err, result) => {
          if (result) {
            req.flash("error", "Email already taken");
            req.flash("name", name);
            req.flash("email", email);
            return res.redirect("/register");
          }
        });
        let user = new User({
          name,
          email,
          password: hashPassword
        });
        await user.save();
        req.flash("success", "Successfully registered");
        return res.redirect("/login");
      } catch (e) {
        // console.log(e.message);
        req.flash("error", "Error");
        return res.redirect("/register");
      }
    }
  };
}

module.exports = authController;

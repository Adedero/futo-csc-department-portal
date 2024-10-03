const passport = require("../config/passport-jwt.config");

const authenticateWithPassport = (err, user, role) => {
  if (err) return false;
  if (!user) return false;
  if (!user.role || user.role.toLowerCase() !== role.toLowerCase())
    return false;
  return user;
};

const showResponse = (res) => {
  return res.status(401).json({
    success: false,
    authMessage: true,
    info: "Unauthorized",
    message: "Please, sign in to continue",
  });
};

const authenticate = {
  admin: async (req, res, next) => {
    passport.authenticate("jwt", (err, user, info) => {
      const authenticatedUser = authenticateWithPassport(err, user, "ADMIN");
      if (!authenticatedUser) {
        return showResponse(res);
      } else {
        req.user = authenticatedUser;
        next();
      }
    })(req, res, next);
  },

  student: async (req, res, next) => {
    passport.authenticate("jwt", (err, user, info) => {
      const authenticatedUser = authenticateWithPassport(err, user, "STUDENT");
      if (!authenticatedUser) {
        return showResponse(res);
      } else {
        req.user = authenticatedUser;
        next();
      }
    })(req, res, next);
  },

  staff: async (req, res, next) => {
    passport.authenticate("jwt", (err, user, info) => {
      const authenticatedUser = authenticateWithPassport(err, user, "STAFF");
      if (!authenticatedUser) {
        return showResponse(res);
      } else {
        req.user = authenticatedUser;
        next();
      }
    })(req, res, next);
  },

  advisor: async (req, res, next) => {
    passport.authenticate("jwt", (err, user, info) => {
      const authenticatedUser = authenticateWithPassport(err, user, "ADVISOR");
      if (!authenticatedUser) {
        return showResponse(res);
      } else {
        req.user = authenticatedUser;
        next();
      }
    })(req, res, next);
  },

  hod: async (req, res, next) => {
    passport.authenticate("jwt", (err, user, info) => {
      const authenticatedUser = authenticateWithPassport(err, user, "HOD");
      if (!authenticatedUser) {
        return showResponse(res);
      } else {
        req.user = authenticatedUser;
        next();
      }
    })(req, res, next);
  },

  dean: async (req, res, next) => {
    passport.authenticate("jwt", (err, user, info) => {
      const authenticatedUser = authenticateWithPassport(err, user, "DEAN");
      if (!authenticatedUser) {
        return showResponse(res);
      } else {
        req.user = authenticatedUser;
        next();
      }
    })(req, res, next);
  },
};

module.exports = authenticate;

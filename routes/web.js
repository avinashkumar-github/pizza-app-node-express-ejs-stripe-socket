const authController = require("../app/http/controllers/authController");
const cartController = require("../app/http/controllers/customers/cartController");
const orderController = require("../app/http/controllers/customers/orderController");
const auth = require("../app/http/middlewares/auth");
const webController = require("./../app/http/controllers/webController");
const guest = require("./../app/http/middlewares/guest");
const AdminOrderController = require("./../app/http/controllers/admin/orderController");
const admin = require("../app/http/middlewares/admin");
const AdminStatusController = require("./../app/http/controllers/admin/statusController");

function webRoute(app) {
  app.get("/", webController().home);

  app.get("/login", guest, authController().login);

  app.post("/login", authController().postLogin);

  app.post("/logout", authController().logout);

  app.get("/register", guest, authController().register);

  app.post("/register", authController().postRegister);

  app.get("/cart", cartController().cart);

  app.post("/update-cart", cartController().update);

  app.post("/orders", auth, orderController().store);

  app.get("/customers/orders", auth, orderController().index);

  app.get("/customer/orders/:id", auth, orderController().show);

  app.get("/admin/orders", admin, AdminOrderController().index);

  app.post("/admin/order/status", admin, AdminStatusController().update);
}

module.exports = webRoute;

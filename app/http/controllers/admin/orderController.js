const Order = require("../../../models/Order");

function orderController() {
  return {
    index(req, res) {
      Order.find({ status: { $ne: "completed" } }, null, {
        sort: {
          createdAt: -1
        }
      })
        .populate("customerId", "-password")
        .exec((err, orders) => {
          if (err) {
            console.log(err);
          }

          if (req.xhr) {
            return res.json(orders);
          } else {
            return res.render("admin/order");
          }
          //not passing here, will fetch from client side
        });
    }
  };
}

module.exports = orderController;

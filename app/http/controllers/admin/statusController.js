const Order = require("../../../models/Order");

function statusController() {
  return {
    async update(req, res) {
      try {
        await Order.updateOne(
          { _id: req.body.orderId },
          { status: req.body.status }
        );
        const eventEmitter = req.app.get("eventEmitter");
        eventEmitter.emit("orderUpdated", {
          id: req.body.orderId,
          status: req.body.status
        });
        res.redirect("/admin/orders");
      } catch (e) {
        res.redirect("/admin/orders");
      }
    }
  };
}

module.exports = statusController;

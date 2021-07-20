const Order = require("../../../models/Order");
const moment = require("moment");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

function orderController() {
  return {
    async show(req, res) {
      try {
        let order = await Order.findById(req.params.id);

        //Authorize user
        if (req.user._id.toString() === order.customerId.toString()) {
          console.log("============================");
          return res.render("customers/singleOrder", { order });
        }
        console.log("----------------------");
      } catch (e) {
        console.log(e.message);
        return res.redirect("/");
      }
    },
    async index(req, res) {
      try {
        const orders = await Order.find({ customerId: req.user._id }, null, {
          sort: {
            createdAt: -1
          }
        });
        res.header("Cache-Control", "no-store");
        res.render("customers/order", { orders, moment });
      } catch (e) {
        req.flash("error", "Error loading the orders!!");
      }
    },
    store(req, res) {
      const { phone, address, stripeToken, paymentType } = req.body;

      if (phone == "" || address == "") {
        // req.flash("error", "Fill all information");
        // return res.redirect("/cart");
        return res.status(422).json({ message: "All fields are required" });
      }

      // if (paymentType === "card") {
      //   stripe.charges
      //     .create({
      //       amount: req.session.cart.totalPrice * 100,
      //       source: stripeToken,
      //       currency: "inr",
      //       description: `Pizza order: ${placedOrder._id}`
      //     })
      //     .then((response) => {
      //       let order = new Order({
      //         customerId: req.user._id,
      //         items: req.session.cart.items,
      //         phone,
      //         address,
      //         paymentStatus: true,
      //         paymentType: paymentType
      //       });

      //       order
      //         .save()
      //         .then(async (data) => {
      //           if (data) {
      //             Order.populate(
      //               data,
      //               { path: "customerId" },
      //               (err, placedOrder) => {
      //                 // Emit
      //                 const eventEmitter = req.app.get("eventEmitter");
      //                 eventEmitter.emit("orderPlaced", placedOrder);
      //                 delete req.session.cart;
      //                 return res.json({
      //                   message: "Payment successful, Order placed successfully"
      //                 });
      //               }
      //             );
      //           }
      //         })
      //         .catch(() => {
      //           delete req.session.cart;
      //           return res.status(500).json({
      //             message: "Error placing order, will refund the amount"
      //           });
      //         });
      //     })
      //     .catch((err) => {
      //       delete req.session.cart;
      //       return res.status(500).json({
      //         message: "Payment failed, Order not placed"
      //       });
      //     });
      // }

      let order = new Order({
        customerId: req.user._id,
        items: req.session.cart.items,
        phone,
        address
      });

      order
        .save()
        .then(async (data) => {
          if (data) {
            Order.populate(data, { path: "customerId" }, (err, placedOrder) => {
              // req.flash('success', 'Order placed successfully')

              // Stripe payment
              if (paymentType === "card") {
                stripe.charges
                  .create({
                    amount: req.session.cart.totalPrice * 100,
                    source: stripeToken,
                    currency: "inr",
                    description: `Pizza order: ${placedOrder._id}`
                  })
                  .then(() => {
                    placedOrder.paymentStatus = true;
                    placedOrder.paymentType = paymentType;
                    placedOrder
                      .save()
                      .then((ord) => {
                        // Emit
                        const eventEmitter = req.app.get("eventEmitter");
                        eventEmitter.emit("orderPlaced", ord);
                        delete req.session.cart;
                        return res.json({
                          message:
                            "Payment successful, Order placed successfully"
                        });
                      })
                      .catch((err) => {
                        console.log(err);
                      });
                  })
                  .catch((err) => {
                    delete req.session.cart;
                    return res.json({
                      message:
                        "OrderPlaced but payment failed, You can pay at delivery time"
                    });
                  });
              } else {
                placedOrder.paymentStatus = false;
                placedOrder.paymentType = paymentType;
                placedOrder
                  .save()
                  .then((ord) => {
                    // Emit
                    const eventEmitter = req.app.get("eventEmitter");
                    eventEmitter.emit("orderPlaced", ord);
                    delete req.session.cart;
                    return res.json({
                      message: "Payment successful, Order placed successfully"
                    });
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }
            });
          }
        })
        .catch((e) => {
          // req.flash("error", "Error in placing order");
          // return res.redirect("/cart");
          return res.status(500).json({ message: "Something went wrong" });
        });
    }
  };
}

module.exports = orderController;

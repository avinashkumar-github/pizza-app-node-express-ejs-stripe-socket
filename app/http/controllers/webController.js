const Menu = require("../../models/Menu");

function webController() {
  return {
    async home(req, res) {
      const pizzas = await Menu.find();
      res.render("home", { pizzas });
    }
  };
}

module.exports = webController;

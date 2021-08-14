const router = require("express").Router();
const controller = require("./orders.controller");

// TODO: Implement the /orders routes needed to make the tests pass
// In the src/orders/orders.router.js file, add two routes: /orders, and /orders/:orderId and attach the handlers (create, read, update, delete, and list) exported from src/orders/orders.controller.js.
router.route("/")
  .get(controller.list)
  .post(controller.create)

router.route("/:orderId")
  .get(controller.read)
  .put(controller.update)
  .delete(controller.delete)

module.exports = router;

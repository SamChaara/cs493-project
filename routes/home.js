var express = require("express");
var router = express.Router();

const common = require("../controllers/resources/projectCommon");
var home_controller = require("../controllers/homeController");

router.get("/", home_controller.get_home);

router.get("/owners/:owner_id/boats", common.checkJwt, home_controller.get_owner_boats);

module.exports = router;

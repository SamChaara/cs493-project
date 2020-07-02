const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const homeRouter = require("./routes/home");
const userRouter = require("./routes/users");
const boatRouter = require("./routes/boats");
const loadRouter = require("./routes/loads");

const common = require("./controllers/resources/projectCommon");

const app = express();

app.enable("trust proxy");  //Otherwise https shows up as http due to proxy (https://stackoverflow.com/a/46475726)
app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/", homeRouter);
app.use(common.BASEURL_USERS, userRouter); //  users/
app.use(common.BASEURL_BOATS, boatRouter); //  boats/
app.use(common.BASEURL_LOADS, loadRouter); //  loads/

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

const { Datastore } = require("@google-cloud/datastore");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const BOAT = "Boat";
const LOAD = "Load";
const USER = "User";
const BASEURL_BOATS = "/boats";
const BASEURL_LOADS = "/loads";
const BASEURL_USERS = "/users";
const PAGE_SIZE = 5;

const PROJECT_URI = "https://chaaras-cs493-project.uc.r.appspot.com";
const OAUTH_LANDING = PROJECT_URI + BASEURL_USERS + "/user";
const CLIENT_ID = "<<client id here>>";
const CLIENT_SECRET = "<<client secret here>>";

const BOAT400 = {
  Error: "The requested boat object is missing at least one of the required attributes",
};

const BOAT401 = {
  Error: "User is not authorized",
};

const BOAT403 = {
  Error: "Users can only access boats for which they are the owner",
};

const BOAT404 = {
  Error: "No boat with this boat_id exists",
};

const BOAT500 = {
  Error: "Error while trying to update boat object",
};

const LOAD400 = {
  Error: "The requested load object is missing at least one of the required attributes",
};

const LOAD403 = {
  Error: "This load already exists on another boat",
};

const LOAD404 = {
  Error: "No load with this load_id exists",
};

const LOAD500 = {
  Error: "Error while trying to update load object",
};

const USER400 = {
  Error: "First name, last name, and displayname are required to create user",
};

const USER404 = {
  Error: "No user with this user_id exists",
};

function fromDatastore(item) {
  item.id = item[Datastore.KEY].id;
  return item;
}

function addSelfLink(entity, req, baseUrl = null) {
  //If a baseUrl is provided, use that. Otherwise get it from the request
  var baseUrl = baseUrl ? baseUrl : req.baseUrl;
  entity.self = req.protocol + "://" + req.get("host") + baseUrl + "/" + entity.id;
  return entity;
}

function getNextLink(req, cursor) {
  return req.protocol + "://" + req.get("host") + req.baseUrl + "?offset=" + cursor;
}

//checkJwt from "Authentication in Node" learning content (http://classes.engr.oregonstate.edu/eecs/perpetual/cs493-400/modules/7-more-security/3-node-authorization/)
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://www.googleapis.com/oauth2/v3/certs",
  }),

  // Validate the audience and the issuer.
  audience: CLIENT_ID,
  issuer: "https://accounts.google.com",
  algorithms: ["RS256"],
});

module.exports = {
  BOAT: BOAT,
  LOAD: LOAD,
  USER: USER,

  PROJECT_URI: PROJECT_URI,
  OAUTH_LANDING: OAUTH_LANDING,

  CLIENT_ID: CLIENT_ID,
  CLIENT_SECRET: CLIENT_SECRET,

  BASEURL_BOATS: BASEURL_BOATS,
  BASEURL_LOADS: BASEURL_LOADS,
  BASEURL_USERS: BASEURL_USERS,

  PAGE_SIZE: PAGE_SIZE,

  BOAT400: BOAT400,
  BOAT401: BOAT401,
  BOAT403: BOAT403,
  BOAT404: BOAT404,
  BOAT500: BOAT500,

  LOAD400: LOAD400,
  LOAD403: LOAD403,
  LOAD404: LOAD404,
  LOAD500: LOAD500,

  USER400: USER400,
  USER404: USER404,

  fromDatastore: fromDatastore,
  addSelfLink: addSelfLink,
  getNextLink: getNextLink,
  checkJwt: checkJwt,
};

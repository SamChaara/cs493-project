crypto = require("crypto");
const { Datastore } = require("@google-cloud/datastore");
const datastore = new Datastore();
const STATE = "OAUTH_SECRET";
const common = require("./resources/projectCommon");

async function get_random_state() {
  //Getting random values: https://stackoverflow.com/a/25292026
  var state = crypto.randomBytes(64).toString("hex");

  //Store the generated state for verification later
  var stateKey = datastore.key(STATE);
  const newSecret = {
    state: state,
  };

  const newEntity = {
    key: stateKey,
    data: newSecret,
  };

  await datastore.save(newEntity);
  return state;
}

exports.get_home = async function (req, res) {
  const oauth_endpoint = "https://accounts.google.com/o/oauth2/v2/auth";
  const client_id = common.CLIENT_ID;
  const redirect_uri = common.OAUTH_LANDING;
  const response_type = "code";
  const scope = "profile+email+openid";
  const state = await get_random_state();
  const prompt = "consent";

  //Create the url to redirect to OAuth
  var sign_in_url =
    oauth_endpoint +
    "?client_id=" +
    client_id +
    "&redirect_uri=" +
    redirect_uri +
    "&response_type=" +
    response_type +
    "&scope=" +
    scope +
    "&state=" +
    state +
    "&prompt=" +
    prompt;

  res.render("home", { url: sign_in_url });
};

exports.get_owner_boats = async function (req, res) {
  var ownerId = req.params.owner_id;
  console.log(">>ownerId: ", ownerId);
  var query = datastore.createQuery(common.BOAT).filter("owner", "=", ownerId).limit(common.PAGE_SIZE);

  //See if an offset was provided
  if (req.query.offset) {
    //Now start the query at the provided offset (cursor)
    query = query.start(req.query.offset);
  }

  datastore.runQuery(query, (err, entities, info) => {
    //Check to see if there are more results and a "next" link is needed
    if (info.moreResults !== Datastore.NO_MORE_RESULTS) {
      var nextLink = common.getNextLink(req, info.endCursor);
    }

    //Add the id property to each boat
    entities = entities.map(common.fromDatastore);

    //Build a self link locally and assign to each boat
    entities.forEach((entity) => {
      entity = common.addSelfLink(entity, req);

      //Add a self link to each load of each boat listed
      if (entity.loads) {
        entity.loads.forEach((load) => (load = common.addSelfLink(load, req, common.BASEURL_LOADS)));
      }
    });

    //Only include the "next" link if the nextLink was defined above
    var pageResult = nextLink ? { boats: entities, next: nextLink } : { boats: entities };

    res.status(200).json(pageResult);
  });
};

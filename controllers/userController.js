const axios = require("axios");
const jwtDecode = require("jwt-decode");
const common = require("./resources/projectCommon");
const { Datastore } = require("@google-cloud/datastore");
const datastore = new Datastore();
const STATE = "OAUTH_SECRET";

exports.get_current_user = async function (req, res) {
  if (req.query.error) {
    //If there is an error in the query string, the user did not grant access
    console.error(req.query.error);
    res.status(401);
  } else if (req.query.code) {
    /*User authorized access*/
    //Verify the state is in the datastore
    var state = req.query.state;
    const query = datastore.createQuery(STATE).filter("state", "=", state);

    datastore.runQuery(query, (err, entities, info) => {
      if (entities.length == 0) {
        //Errror if the provided state is not found in datastore
        res.status(400).json({ error: "Provided state is invalid" });
      }
    });

    //Make a post request to get a token from Google
    //Example post request: https://nodejs.dev/make-an-http-post-request-using-nodejs
    //(Using axios)
    const data = {
      client_id: common.CLIENT_ID,
      client_secret: common.CLIENT_SECRET,
      code: req.query.code,
      grant_type: "authorization_code",
      redirect_uri: common.OAUTH_LANDING,
    };

    var googleRes = await axios.post("https://oauth2.googleapis.com/token", data);
    var token = googleRes.data.access_token;
    var openid_token = googleRes.data.id_token; //JWT
    var decodedJwt = jwtDecode(openid_token);
    var user_sub = decodedJwt.sub;

    var peopleRes = await axios.get(
      `https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses&access_token=${token}`
    );

    //Check for the user already existing
    const userQuery = datastore.createQuery(common.USER).filter("sub", "=", user_sub).limit(1);

    datastore.runQuery(userQuery, (err, entities, info) => {
      var user_data = {
        sub: user_sub,
        first_name: null,
        last_name: null,
        display_name: null,
      };

      //Check for empty result set
      if (entities.length == 0) {
        //User with provided "sub" value doesn't exist yet -> create it
        //Take the first name in the list for simplicity.
        var user_names = peopleRes.data.names[0];
        user_data.first_name = user_names.givenName;
        user_data.last_name = user_names.familyName;
        user_data.display_name = user_names.displayName;

        var user_key = datastore.key(common.USER);

        console.log(">>CREATING NEW USER: ", JSON.stringify(user_data));

        const new_entity = {
          key: user_key,
          data: user_data,
        };

        datastore.save(new_entity);
      } else {
        //User already exists. Display their info
        user_data.first_name = entities[0].first_name;
        user_data.last_name = entities[0].last_name;
        user_data.display_name = entities[0].display_name;
      }

      user_data.jwt = openid_token;
      res.render("user", user_data);
    });
  }
};

exports.list_users = function (req, res) {
  var query = datastore.createQuery(common.USER).limit(common.PAGE_SIZE);

  //See if an offset was provided
  if (req.query.offset) {
    //Now start the query at the provided offset (cursor)
    query = query.start(req.query.offset);
  }

  datastore.runQuery(query, (err, entities, info) => {
    console.log(">>ERR: ", JSON.stringify(err));
    console.log(">>ENTITIES: ", JSON.stringify(entities));
    console.log(">>INFO: ", JSON.stringify(info));

    //Check to see if there are more results and a "next" link is needed
    if (info.moreResults !== Datastore.NO_MORE_RESULTS) {
      var nextLink = common.getNextLink(req, info.endCursor);
    }

    //Add the id property to each user
    entities = entities.map(common.fromDatastore);

    //Build a self link locally and assign to each user
    entities.forEach((entity) => {
      entity = common.addSelfLink(entity, req);

      //Add a self link to boats, if present
      if (entity.boats) {
        entity.boats = common.addSelfLink(entity.boats, req, common.BASEURL_BOATS);
      }
    });

    //Only include the "next" link if the nextLink was defined above
    var pageResult = nextLink ? { users: entities, next: nextLink } : { users: entities };

    console.log("**Paged Result:**");
    console.log(JSON.stringify(pageResult));
    res.status(200).json(pageResult);
  });
};

/*
Get a User
GET /users/:user_id
*/
exports.get_user = function (req, res) {
  var userId = parseInt(req.params.user_id);
  var userKey = datastore.key([common.USER, userId]);

  //Query datastore and filter by the key generated by the boat_id provided
  const query = datastore.createQuery(common.USER).filter("__key__", "=", userKey).limit(1);

  datastore.runQuery(query, (err, entities, info) => {
    //Check for empty result set
    if (entities.length == 0) {
      res.status(404).json(common.USER404);
    } else {
      //[0][0] to access the query result's object only, rather than list of query results
      var targetEntity = entities[0];
      targetEntity = common.fromDatastore(targetEntity);
      targetEntity = common.addSelfLink(targetEntity, req);

      if (targetEntity.boats) {
        targetEntity.boats.forEach((entity) => (entity = common.addSelfLink(entity, req, common.BASEURL_BOATS)));
      }

      res.status(200).json(targetEntity);
    }
  });
};

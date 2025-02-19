var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const users_utils = require("./utils/users_utils");
const players_utils = require("./utils/players_utils");
const team_utils = require("./utils/team_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users")
      .then((users) => {
        if (users.find((x) => x.user_id === req.session.user_id)) {
          req.user_id = req.session.user_id;
          next();
        }
      })
      .catch((err) => next(err));
  } else {
    res.sendStatus(401);
  }
});

/**
 * This path gets body with playerId and save this player in the favorites list of the logged-in user
 */
router.post("/favoritePlayers", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const player_id = req.body.playerId;
    await users_utils.markPlayerAsFavorite(user_id, player_id);
    res.status(201).send("The player successfully saved as favorite");
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the favorites players that were saved by the logged-in user
 */
router.get("/favoritePlayers", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    let favorite_players = {};
    const player_ids = await users_utils.getFavoritePlayers(user_id);
    let player_ids_array = [];
    player_ids.map((element) => player_ids_array.push(element.player_id)); //extracting the players ids into array
    const results = await players_utils.getPlayersInfo(player_ids_array);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

router.get("/favoriteMatchesTop3", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const favorite_matches = await users_utils.getTop3FutureFavoriteMatches(user_id);
    if(favorite_matches.length==0){
      res.status(204).send("no games to show");
    }
    else{
      let favorite_matches_array = [];
      favorite_matches.map((element) => favorite_matches_array.push(element.match_id)); //extracting the players ids into array
      const results = await users_utils.getFavoriteMatchesDetails(favorite_matches_array);
      res.status(200).send(results);
    }
  } catch (error) {
    next(error);
  }
});

router.get("/favoriteMatches", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const favorite_matches = await users_utils.getFavoriteMatches(user_id);
    if(favorite_matches.length==0){
      res.status(204).send("no games to show");
    }
    else{
      let favorite_matches_array = [];
      favorite_matches.map((element) => favorite_matches_array.push(element.match_id)); //extracting the players ids into array
      const results = await users_utils.getFavoriteMatchesDetails(favorite_matches_array);
      res.status(200).send(results);
    }
  } catch (error) {
    next(error);
  }
});

router.get("/previewPlayerInfo/id/:playerId", async (req, res, next) => {
  try {
    const idArray = JSON.parse(req.params.playerId);
    const results = await players_utils.getPlayersInfo(idArray);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

router.get("/fullPlayerInfo/id/:playerId", async (req, res, next) => {
  try {
    const idArray = JSON.parse(req.params.playerId);
    const results = await players_utils.getFullPlayersInfo(idArray);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});




module.exports = router;

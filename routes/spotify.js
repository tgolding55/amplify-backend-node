const express = require("express");
const router = express.Router();
const request = require("request");
const querystring = require("querystring");
const cors = require("cors");
router.all("*", cors());

const redirect_uri =
  process.env.REDIRECT_URI || "http://localhost:3001/spotify/callback";

router.get("/login", function(req, res) {
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: "user-read-private user-read-email user-top-read",
        redirect_uri
      })
  );
});

router.get("/callback", function(req, res) {
  let code = req.query.code || null;
  let authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri,
      grant_type: "authorization_code"
    },
    headers: {
      Authorization:
        "Basic " +
        new Buffer(
          process.env.SPOTIFY_CLIENT_ID +
            ":" +
            process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64")
    },
    json: true
  };
  request.post(authOptions, function(error, response, body) {
    const access_token = body.access_token;
    let uri = process.env.FRONTEND_URI || "http://localhost:3000/auth";
    res.redirect(uri + "?access_token=" + access_token);
  });
});

router.get("/search", (req, res) => {
  const fetchOptions = {
    url:
      "https://api.spotify.com/v1/search?q=" + req.query.search + "&type=track",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + req.query.auth
    }
  };
  request.get(fetchOptions, (error, response, body) => {
    const json = JSON.parse(body).tracks.items.map(song => {
      return {
        id: song.id,
        uri: song.uri,
        duration: song.duration_ms,
        name: song.name,
        band: song.artists[0].name,
        image: song.album.images[0]["url"]
      };
    });
    res.json(json);
    console.log(body);
  });
});

router.get("/playlists", (req, res) => {
  const fetchOptions = {
    url: "https://api.spotify.com/v1/me/playlists",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + req.query.auth
    }
  };

  request.get(fetchOptions, (error, response, body) => {
    const json = JSON.parse(body).items.map(item => {
      return {
        description: item.description,
        id: item.id,
        uri: item.uri,
        image: item.images[0],
        name: item.name,
        trackNum: item.tracks.total
      };
    });
    res.json(json);
    console.log(json);
  });
});

router.get("/toptracks", (req, res) => {
  const fetchOptions = {
    url:
      "https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=20",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + req.query.auth
    }
  };

  request.get(fetchOptions, (error, response, body) => {
    const json = JSON.parse(body).items.map(song => {
      return {
        id: song.id,
        uri: song.uri,
        duration: song.duration_ms,
        name: song.name,
        band: song.artists[0].name,
        image: song.album.images[0]["url"]
      };
    });
    res.json(json);
  });
});

module.exports = router;

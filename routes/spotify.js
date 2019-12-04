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
        scope:
          "user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private",
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
  request.get(
    fetchOptions(
      req.query.auth,
      `https://api.spotify.com/v1/search?q=${req.query.search}&type=track`
    ),
    (error, response, body) => {
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
    }
  );
});

router.get("/playlists", (req, res) => {
  request.get(
    fetchOptions(req.query.auth, "https://api.spotify.com/v1/me/playlists"),
    (error, response, body) => {
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
    }
  );
});

router.get("/toptracks", (req, res) => {
  request.get(
    fetchOptions(
      req.query.auth,
      "https://api.spotify.com/v1/me/top/tracks?time_range=" +
        req.query.time_range +
        "&limit=20"
    ),
    (error, response, body) => {
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
    }
  );
});

router.post("/playlists", (req, res) => {
  const body = JSON.stringify(req.body);
  request.post(
    fetchOptions(
      req.query.auth,
      "https://api.spotify.com/v1/me/playlists",
      body
    ),
    (error, response, body) => {
      const parsedBody = JSON.parse(body);
      const json = {
        description: parsedBody.description,
        id: parsedBody.id,
        uri: parsedBody.uri,
        name: parsedBody.name,
        trackNum: 0
      };
      res.json(json);
    }
  );
});

router.post("/playlists/:playlistId", (req, res) => {
  request.post(
    fetchOptions(
      req.query.auth,
      "https://api.spotify.com/v1/playlists/" +
        req.params.playlistId +
        "/tracks?uris=" +
        req.query.songURIs
    ),
    (error, response, body) => {
      const json = JSON.parse(body);
      res.json(json);
    }
  );
});

router.get("/playlists/:playlistId", (req, res) => {
  request.get(
    fetchOptions(
      req.query.auth,
      "https://api.spotify.com/v1/playlists/" +
        req.params.playlistId +
        "/tracks"
    ),
    (error, response, body) => {
      const json = JSON.parse(body).items.map(songObj => {
        const song = songObj.track;
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
    }
  );
});

const fetchOptions = (auth, url, body) => {
  return !body
    ? {
        url: url,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth
        }
      }
    : {
        url: url,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth
        },
        form: body
      };
};

router.get("/lyrics", (req, res) => {
  const artist = req.query.artist;
  const track = req.query.track;
  request.get(
    `https://orion.apiseeds.com/api/music/lyric/${artist}/${track}?apikey=1AnWo1GT3xEA6PC7g69iGLmp85720sjzXRJffPdDEM9vwdZGHBTgWd34AW6WFbGA`,
    (error, response, body) => {
      const json = JSON.parse(body);
      res.json(json);
    }
  );
});

module.exports = router;

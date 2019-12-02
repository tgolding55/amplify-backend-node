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
        scope: "user-read-private user-read-email",
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

router.get("/q", (req, res) => {
  console.log(req._parsedURL);
  console.log("dsfsdf");
  const fetchOptions = {
    url: "https://api.spotify.com/v1/search?q=pompeii&type=track",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization:
        "Bearer BQCrV7_8v1EQYowkOCCjL_muct9za4FuEctSceLQkTLQQgZGzGMZENWipnuXNmjYst4uti1OlMmhPLDjg-gZ9VkTK4Qarbp6Dv8hTljnHlAvGtweGCKEwaO9pIITxkbm3Vl7dG5DTABRGC-nStoPnFcfmISjVEatlnFMuh4YdfBo4yM_0lrym4_AkFrtHOOKeJfHkRZmBO7bK-QFRVfpvp3deRim29J5XsDbdzwnVcCn0rK9D8srJAjdWhZ31AZtY1LDbSjini_ks97q"
    }
  };
  request.get(fetchOptions, (error, response, body) => {
    const json = JSON.parse(body).tracks.items.map(song => {
      return {
        id: song.id,
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

const http = require('http');
const express = require('express');
const colyseus = require('colyseus');
const monitor = require("@colyseus/monitor").monitor;
const path = require('path');
//const socialRoutes = require("@colyseus/social/express").default;

const outdoor = require('./room/public').outdoor;

const port = Number(process.env.PORT || 2567) + Number(process.env.NODE_APP_INSTANCE || 0);
const app = express();
const server = http.createServer(app);



//if the REDIS_URL is present? usit it or else use the default local prescence
const gameServer = new colyseus.Server({
    server,
    presence: process.env.REDIS_URL ? new colyseus.RedisPresence(process.env.REDIS_URL) : new colyseus.LocalPresence()
});

// register your room handlers
gameServer.register('outdoor', outdoor);

/* register @colyseus/social routes
app.use("/", socialRoutes);*/


if (process.env.NODE_ENV == "production") {
    app.get('*.js', function(req, res, next) {
        req.url = req.url + '.gz';
        res.set('Content-Encoding', 'gzip');
        res.set('Content-Type', 'text/javascript');
        next();
    });
}

app.use("/assets/game.png" ,  express.static(path.join(__dirname, "./../client/src/assets/game.png")));


app.use(express.static(path.join(__dirname, "./../client/public")));

//register colyseus monitor AFTER registering your room handlers
if (process.env.NODE_ENV != "production") {
    app.use("/colyseus", monitor(gameServer));
}

gameServer.listen(port);
console.log(`listening at http://localhost:${port}`)
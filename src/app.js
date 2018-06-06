const express = require('express');
const app = express();
const cors = require('cors');
const sse = require('./middleware/sse');

app.use(express.static('public'));

app.use(sse());
app.use(cors());

const connections = [];
const votes = {yes: 0, no: 0};

app.get('/vote', function (req, res) {
    req.query.yes === "true" ? votes.yes++ : votes.no++;

    for (let i = 0; i < connections.length; i++) {
        connections[i].sseSend(votes)
    }

    res.sendStatus(200);
});

app.get('/stream', function (req, res) {
    res.sseSetup();
    res.sseSend(votes);

    connections.push(res);
});

app.listen(3444, function () {
    console.log('Listening on port 3444...')
});
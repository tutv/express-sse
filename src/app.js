const express = require('express');
const compression = require('compression');
const app = express();
const cors = require('cors');
const sse = require('./middleware/sse');
const getRandomInt = require('./getRandomInt');

const EventServices = require('./services/EventServices');

const fs = require('fs');

app.use(express.static('public'));

app.use(sse());
app.use(cors());

const connections = [];
const votes = {yes: 0, no: 0};

app.get('/vote', compression(), function (req, res) {
    req.query.yes === "true" ? votes.yes++ : votes.no++;

    for (let i = 0; i < connections.length; i++) {
        connections[i].sseSend(votes)
    }

    EventServices.broadcast({type: 'vote', data: votes});

    res.sendStatus(200);
});

app.get('/stream', (req, res) => {
    res.sseSetup();
    res.sseSend(votes);

    connections.push(res);
});

app.get('/file', (req, res) => {
    fs.readFile('./big.file', (error, data) => {
        if (error) throw error;

        res.send(data);
    });
});

app.get('/stream-file', (req, res) => {
    const src = fs.createReadStream('./big.file');

    src.pipe(res);
});

app.get('/pull', (req, res) => {
    let x = 1;

    const onChange = (state) => {
        res.write(JSON.stringify(state) + ";");
    };

    EventServices.subscribe(onChange);

    res.set('Content-Type', 'application/json');
    res.write(';');
    res.write(JSON.stringify({hello: x}) + ";");

    req.on('close', function (err) {
        interval && clearInterval(interval);

        EventServices.unsubscribe(onChange);
    });


    const interval = setInterval(() => {
        x++;
        res.write(JSON.stringify({hello: x}) + ';');
        console.log('write', Date.now());

        if (x < 5) {
            const timeout = getRandomInt(1, 3);

            setTimeout(() => {
                res.write("hello" + ';');
            }, timeout * 1000);
        }

        if (x > 60) {
            res.end();
            EventServices.unsubscribe(onChange);

            clearInterval(interval);
        }
    }, 1000);
});

app.listen(3444, function () {
    console.log('Listening on port 3444...')
});
// implement your API here
const express = require('express');

const db = require('./data/db.js');

const server = express();
server.use(express.json());

server.get('/', (req, res) => {
    res.send('The Express server for the Users Project is LIVE!');
});

server.listen(4000, () => {
    console.log('API up and running on port 4000');
});
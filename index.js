// implement your API here
const express = require('express');

const db = require('./data/db.js');

const server = express();
server.use(express.json());

server.get('/', (req, res) => {
    res.send('The Express server for the Users Project is LIVE!');
});

// Returns an array of all the user objects contained in the database
server.get('/api/users', (req, res) => {
    db.find()
        .then(users => {
            // 200-299 = success
            // 300-399 = rediret
            // 400-499 = client error
            // 500-599 = server error
            res.status(200).json(users);
        })
        .catch(error => {
            res.status(500).json({ message: 'error returning users' });
        });
});

server.listen(4000, () => {
    console.log('API up and running on port 4000');
});
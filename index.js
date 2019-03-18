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

// Returns the user object with the specified id
server.get('/api/users/:id', (req, res) => {
    const id = req.params.id;
    db.findById(id)
        .then(user => {
            // 200-299 = success
            // 300-399 = rediret
            // 400-499 = client error
            // 500-599 = server error
            res.status(200).json(user);
        })
        .catch(error => {
            res.status(500).json({ message: 'error returning user with matching id' });
        });
});

// Creates a user using the information sent inside the request body.
server.post('/api/users', (req, res) => {
    const userInfo = req.body;

    db.insert(userInfo)
        .then(user => {
            res.status(201).json(user);
        })
        .catch(error => {
            res.status(500).json({ message: 'error creating user' });
        });
});

// Creates a user using the information sent inside the request body.
// server.put('/api/users/, (req, res) => {
//     const id = req.params.id;
//     const userInfo = req.body;
//     console.log('user information ', userInfo);

//     db.update(id, userInfo)
//         .then(user => {
//             res.status(201).json(user);
//         })
//         .catch(error => {
//             res.status(500).json({ message: 'error creating user' });
//         });
// });

server.listen(4000, () => {
    console.log('API up and running on port 4000');
});
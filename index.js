const express = require('express');
const cors = require('cors');
const db = require('./data/db');

const port = 5555;
const server = express();
server.use(express.json()); // This middleware (express.json()) is used to parse data coming in
// server.use(cors({ origin: 'http://localhost:3000' })); // cors is used to enable communication from other ports/URLs

const sendUserError = (status, message, res) => {
  // This is just a helper method that we'll use for sending errors when things go wrong.
  res.status(status).json({ errorMessage: message });
  return;
};

const customLogger = (req, res, next) => {
  // Here we have custom middleware that we can use throughout our application
  const ua = req.headers['user-agent']; // We'll pull off the User Agent details from the req.headers
  const { path } = req; // we'll pull the path from the URL.
  const timeStamp = Date.now(); // Create a time stamp
  const log = { path, ua, timeStamp }; // create our log as an object.
  const stringLog = JSON.stringify(log); // stringify our object
  console.log(stringLog); // log out our log
  next(); // very important to move onto next routeHandler
};

server.use(customLogger); // we could use our logger middleware like this
// if we choose to do this we get a chance to use this middleware for EVERY endpoint
// you should strongly consider whether or not this is necessary.

const searchMiddleWare = (req, res, next) => {
  if (!req.query.name) {
    next();
  }
  db
    .find()
    .then(users => {
      const { name } = req.query; // take query string
      const filteredUsers = users.filter(
        // loop over users
        // filter out any, that do not match our query string.
        user => user.name.toLowerCase() === name.toLowerCase()
      );
      // save the filtered users on req.users.
      req.users = filteredUsers;
      next();
    })
    .catch(err => {
      res.status(500).json({ errorMessage: 'Sumfin bahd!' });
    });
};

server.get('/', searchMiddleWare, (req, res) => {
  // Three ways to pull info off of the req object FROM a user.
  // 1st req.body
  // 2nd req.params
  // 3nd req.query
  console.log(req.query);
  console.log(req.users);
  const { users } = req;
  if (!users) {
    res.json('Welcome to express');
  }
  if (users.length === 0) {
    sendUserError(404, `No ${req.query.name} in our database`, res);
    return;
  } else {
    res.json({ users });
  }
  // 1st arg: route where a resource can be interacted with
  // 2nd arg: callback to deal with sending responses, and handling incoming data.
});

server.post('/api/users', (req, res) => {
  // const { name, bio, created_at, updated_at } = req.body;
  // if (!name || !bio) {
  //   sendUserError(400, 'Must provide name and bio', res);
  //   return;
  // }
  // db
  //   .insert({
  //     name,
  //     bio,
  //     created_at,
  //     updated_at
  //   })
  //   .then(response => {
  //     res.status(201).json(response);
  //   })
  //   .catch(error => {
  //     console.log(error);
  //     sendUserError(400, error, res);
  //     return;
  //   });

  const newUser = req.body;

  if (req.body.hasOwnProperty('name') && req.body.hasOwnProperty('bio')) {
    db
      .insert(newUser)
      .then(newUser => {
        res.status(200).json({ message: "All good here, Captain!" })
      })
      .catch(error => {
        res.status(500).json({ message: "Sorry there was a hiccup!" });
        console.log(error);
      })
  } else {
    res.status(400).json({ message: "Please provide name and bio!" })
  }

});

server.get('/api/users', (req, res) => {
  db
    .find()
    .then(users => {
      res.json({ users });
    })
    .catch(error => {
      sendUserError(500, 'The users information could not be retrieved.', res);
      return;
    });
});

server.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  db
    .findById(id)
    .then(user => {
      if (user.length === 0) {
        sendUserError(404, 'User with that id not found', res);
        return;
      }
      res.json(user);
    })
    .catch(error => {
      sendUserError(500, 'Error looking up user', res);
    });
  // invoke proper db.method(id) passing it the id.
  // handle the promise like above
});

server.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  db
    .remove(id)
    .then(response => {
      if (response === 0) {
        sendUserError(404, 'The user with that ID does not exist."', res);
        return;
      }
      res.json({ success: `User with id: ${id} removed from system` });
    })
    .catch(error => {
      sendUserError(500, 'The user could not be removed', res);
      return;
    });
});

server.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, bio } = req.body;
  if (!name || !bio) {
    sendUserError(400, 'Must provide name and bio', res);
    return;
  }
  db
    .update(id, { name, bio })
    .then(response => {
      if (response == 0) {
        sendUserError(
          404,
          'The user with the specified ID does not exist.',
          res
        );
        return;
      }
      db
        .findById(id)
        .then(user => {
          if (user.length === 0) {
            sendUserError(404, 'User with that id not found', res);
            return;
          }
          res.json(user);
        })
        .catch(error => {
          sendUserError(500, 'Error looking up user', res);
        });
    })
    .catch(error => {
      sendUserError(500, 'Something bad happened in the database', res);
      return;
    });
});

server.listen(port, () => console.log(`Server running on port ${port}`));
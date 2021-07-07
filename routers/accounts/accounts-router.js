const express = require("express");

const db = require("../../data/dbConfig.js");

const router = express.Router();

// {
//     limit: 5,
//     sortby: 'id',
//     sortdir: 'desc'
// }

router.get('/', (req, res) => {
    console.log('req.query', req.query);
    const limit = req.query.limit;
    const sortby = req.query.sortby;
    const dir = req.query.sortdir

    db('*')
      .from("accounts")
      .limit(limit).orderBy(sortby, dir)
      .then(accounts => {
        res.status(200).json(accounts);
      })
      .catch(error => {
        console.log(error);
  
        res.status(500).json({ error: "failed to get the list of accounts" });
      });
});

router.get("/:id", validateId, (req, res) => {
    const { id } = req.params;

    db('accounts').where({ id })
      .then(account => {
        res.status(200).json(account);
      })
      .catch(error => {
        console.log(error);
        res.status(500).json({ error: "failed to get the account" });
      });
});

router.post('/', (req, res) => {
    db('accounts')
      .insert(req.body, 'id')
      .then(ids => {
        return getById(ids[0]).then(inserted => {
          res.status(201).json(inserted[0]);
        });
      })
      .catch(error => {
        console.log(error);
        res.status(500).json({ error: "failed to add the account" });
      });
});

router.put("/:id", validateId, (req, res) => {
    const id = req.params.id;
    const changes = req.body;

    db('accounts')
      .where({ id }) // remember to filter or all records will be updated (BAD PANDA!!)
      .update(changes) // could be partial changes, only one column is enough
      .then(count => {
        res.status(200).json(count);
      })
      .catch(error => {
        console.log(error);
  
        res.status(500).json({ error: "failed to update the account" });
      });
});

router.delete('/:id', validateId, (req, res) => {
    const id = req.params.id;

    db('accounts')
      .where({ id })
      .del()
      .then(count => {
        res.status(200).json(count);
      })
      .catch(error => {
        console.log(error);
  
        res.status(500).json({ error: "failed to remove the account" });
      });
  });

// custom middleware

function validateId(req, res, next) {
    const { id } = req.params;

    getById(id)
    .then(account => {
      console.log('account', account);
      if( !Object.keys(account).length ){
        res.status(400).json({ message: "invalid account id" });
      }else next();
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: `Couldn't retrieve an account with id: ${id}` });
    });
}

module.exports = router;

function getById(id) {
    return db('accounts')
      .where({ id })
      .first();
}
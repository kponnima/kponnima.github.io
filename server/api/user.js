/*
 *  Controller which handles api requests coming from the router.
 *  User API request controller
 */
'use strict';
const mongoose = require('mongoose');
const User = mongoose.model('User');
const utils = require('../lib/utils');

/* GET DATA for HOME */
async function getUser(req, res) {
  let token = await utils.getHeaderToken(req.headers);
  if (token) {
    User.find(
      { username: req.params.username },
      { password: 0 },
      async (err, user) => {
        if (err) return await next(err);
        if (!user) {
          return await res.status(403).send({ success: false, msg: 'Authentication failed. User not found.' });
        } else {
          return await res.json(user);
        }
      });
  } else {
    return await res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
}
/* GET USERS*/
async function getAllUsers(req, res) {
  let token = await utils.getHeaderToken(req.headers);
  if (token) {
    User.find({
    }, async (err, users) => {
      if (err) return await next(err);
      if (!users) {
        return await res.status(401).send({ success: false, msg: 'Authentication failed!' });
      } else {
        // get the list of users
        return await res.json(users);
      }
    });
  } else {
    return await res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
}
/* SAVE USER */
async function createUser(req, res) {
  let token = await utils.getHeaderToken(req.headers);
  if (token) {
    let newUser = new User({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      phone: req.body.phone,
      date_created: req.body.date_created,
      role_id: req.body.role_id,
      privilege_id: req.body.privilege_id,
      status_id: req.body.status_id
    });

    newUser.save(async (err) => {
      if (err) {
        return await res.status(403).send({ success: false, msg: 'Save user failed.' });
      }
      return await res.json({ success: true, msg: 'Successful created new user.' });
    });
  } else {
    return await res.status(401).send({ success: false, msg: 'Unauthorized.' });
  }
}
/* GET SINGLE USER BY USERNAME */
async function getUserDetail(req, res) {
  let token = await utils.getHeaderToken(req.headers);
  if (token) {
    User.find(
      { username: req.params.username }
      , async (err, user) => {
        if (err) return await next(err);
        if (!user) {
          return await res.status(403).send({ success: false, msg: 'Search failed. User not found.' });
        } else {
          return await res.json(user);
        }
      });
  } else {
    return await res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
}
/* UDPATE USER */
async function updateUser(req, res) {
  let token = await utils.getHeaderToken(req.headers);
  if (token) {
    User.findOneAndUpdate(
      req.params.username, req.body
      , async (err, user) => {
        if (err) return await next(err);
        return await res.json(user);
      });
  } else {
    return await res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
}
/* DELETE USER */
async function deleteUser(req, res) {
  let token = await utils.getHeaderToken(req.headers);
  if (token) {
    User.findOneAndRemove(
      req.params.username, async (err) => {
        if (err) return await next(err);
        return await res.status(200).send({ success: true, msg: 'Sucessfully deleted !' });
      });
  } else {
    return await res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
}

module.exports = {
  getUser: getUser,
  getAllUsers: getAllUsers,
  getUserDetail: getUserDetail,
  createUser: createUser,
  updateUser: updateUser,
  deleteUser: deleteUser
}
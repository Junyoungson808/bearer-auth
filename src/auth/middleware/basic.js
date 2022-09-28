'use strict';

const base64 = require('base-64');
const { user } = require('../models/index.js');

module.exports = async (req, res, next) => {

  try {
    if (!req.headers.authorization) { 
      next('Invalid Login'); 
    }
  
    let basic = req.headers.authorization;
    let [username, password] = base64.decode(basic).split(':');
    req.user = await user.authenticateBasic(username, password);
    next();
  } catch (err) {
    console.error(err);
    res.status(403).send('Invalid Login');
  }

};



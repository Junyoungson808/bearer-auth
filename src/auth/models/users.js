'use strict';

require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SECRET = process.env.SECRET || 'TEST_SECRET';

const userSchema = (sequelize, DataTypes) => {
  const model = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    token: {
      type: DataTypes.VIRTUAL,
      get() {
        return jwt.sign({ username: this.username }, SECRET, { expiresIn: '3000000'});
      },
      set(payload){
        return jwt.sign(payload, SECRET);
      },
    },
  });

  model.beforeCreate(async (user) => {
    let hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
  });

  // Basic AUTH: Validating strings (username, password) 
  model.authenticateBasic = async function (username, password) {
    const user = await this.findOne({ username });
    const valid = await bcrypt.compare(password, user.password);
    if (valid) { return user; }
    throw new Error('Invalid User');
  };

  // Bearer AUTH: Validating a token
  model.authenticateToken = async function (token) {
    try {
      const parsedToken = jwt.verify(token, process.env.SECRET);
      const user = await this.findOne({ username: parsedToken.username });
      if (user) { return user; }
      throw new Error('User Not Found');
    } catch (err) {
      throw new Error(err.message);
    }
  };

  return model;
};

module.exports = userSchema;

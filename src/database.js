const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const { dblocation } = require('../config.json');


const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(__dirname + '/../', dblocation)
});

const CTF = sequelize.define('CTF', {
    name: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    active: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
    // other options
});

const Challenge = sequelize.define('Challenge', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    category: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    ctf_id: {
        type: DataTypes.STRING,
        references: {
            model: CTF,
            key: 'name'
        }
    }
}, {
    // other options
});

CTF.sync();
Challenge.sync();

module.exports = { CTF, Challenge };

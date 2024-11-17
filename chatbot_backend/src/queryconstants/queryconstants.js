const { query } = require("express");

class queryConstants{

    register = `insert into register (firstname, lastname, email, password, timestamp, updated_timestamp) values ($1, $2, $3, $4, now(), now())`;

    login = `select * from register where email = $1 and password = $2`;

}

module.exports = new queryConstants();
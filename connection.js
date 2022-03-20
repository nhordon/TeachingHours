const { Pool } = require("pg")


const pool = new Pool({
  user: process.env.ENV_DBUSER,
  host: process.env.ENV_HOST,// db server
  
  database: process.env.ENV_DATABASE,//db name
  password: process.env.ENV_DBPASSWORD,
  port: process.env.ENV_PORT, //db port
});
module.exports = pool;
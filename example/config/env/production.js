/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */
 var parseDbUrl = require("parse-database-url");
 var parseRedisUrl = require("parse-redis-url");

 var dbConfig = parseDbUrl(process.env["DATABASE_URL"]);
 var redisConfig = parseDbUrl(process.env["REDIS_URL"]);

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the production        *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

   connections: {
     dataStore: {
       adapter: 'sails-postgres',
       url: process.env["DATABASE_URL"]
     },
     cacheStore: {
       adapter: 'sails-redis'
     }
   }
  // models: {
  //   connection: 'someMysqlServer'
  // },

  /***************************************************************************
   * Set the port in the production environment to 80                        *
   ***************************************************************************/

  // port: 80,

  /***************************************************************************
   * Set the log level in production environment to "silent"                 *
   ***************************************************************************/

  // log: {
  //   level: "silent"
  // }

};

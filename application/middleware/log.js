/*
 *  Sample URL filter to log all the incoming requests to console
 *  For more information on Middleware visit: http://expressjs.com/api.html#middleware
 */
'use strict';
module.exports = function(req, res, next) {
  logger.audit('IN METHOD application.middleware.log - RECEIVED request: ' + req.url);
  next();
};
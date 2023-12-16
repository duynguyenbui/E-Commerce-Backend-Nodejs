'use strict';

const AccessService = require('../services/access.service');
const { OK, CREATED } = require('../core/success.response');

class AccessController {
  hanlderRefreshToken = async (req, res, next) => {
    new OK({
      message: 'Get token successfully',
      metadata: await AccessService.handleRefreshToken(req.body.refreshToken),
    }).send(res);
  };
  logout = async (req, res, next) => {
    new OK({
      message: 'You have been logged out successfully',
      metadata: await AccessService.logout({ keyStore: req.keyStore }),
    }).send(res);
  };

  login = async (req, res, next) => {
    new OK({
      message: 'Login Successfully',
      metadata: await AccessService.login(req.body),
    }).send(res);
  };

  signUp = async (req, res, next) => {
    console.log(`[P]:::signUp:::`, req.body);
    new CREATED({
      message: 'Register successfully',
      metadata: await AccessService.signUp(req.body),
    }).send(res);
  };
}

module.exports = new AccessController();

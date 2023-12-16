'use strict';

const keytokenModel = require('../models/keytoken.model');
const crypto = require('crypto');

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey }) => {
    try {
      const tokens = await keytokenModel.create({
        user: userId,
        publicKey,
        privateKey,
      });

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      console.log('[CREATE_KEY_TOKEN_ERROR]:::', error);
      return error;
    }
  };

  static generateKeyPair = () => {
    const privateKey = crypto.randomBytes(64).toString('hex');
    const publicKey = crypto.randomBytes(64).toString('hex');

    return { privateKey, publicKey };
  };
}

module.exports = KeyTokenService;

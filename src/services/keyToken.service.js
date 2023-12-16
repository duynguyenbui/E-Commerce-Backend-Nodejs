'use strict';

const { Types } = require('mongoose');
const keyTokenModel = require('../models/keytoken.model');
const crypto = require('crypto');

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      const filter = { user: userId };
      const update = {
        publicKey,
        privateKey,
        refreshTokensUsed: [],
        refreshToken,
      };
      const options = { upsert: true, new: true };

      const tokens = await keyTokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };

  static generateKeyPair = () => {
    const privateKey = crypto.randomBytes(64).toString('hex');
    const publicKey = crypto.randomBytes(64).toString('hex');

    return { privateKey, publicKey };
  };

  static findByUserId = async (userId) => {
    return await keyTokenModel
      .findOne({ user: new Types.ObjectId(userId) })
      .lean();
  };

  static removeTokenById = async ({ id }) => {
    const result = await keyTokenModel.deleteOne({
      _id: new Types.ObjectId(id),
    });
    return result;
  };
}

module.exports = KeyTokenService;

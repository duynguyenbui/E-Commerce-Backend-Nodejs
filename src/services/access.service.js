'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const {
  InternalServerError,
  BadRequestError,
} = require('../core/error.response');
const KeyTokenService = require('./keyToken.service');
const shopModel = require('../models/shop.model');
const { createTokenPair } = require('../auth/authUtils');
const { CREATED, OK } = require('../core/success.response');
const { getInfoData } = require('../utils');
const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN',
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    const holder = await shopModel.findOne({ email }).lean();

    if (holder) {
      throw new BadRequestError('ERROR: Shop already exists', 403);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      const { privateKey, publicKey } = KeyTokenService.generateKeyPair();

      console.log({ privateKey, publicKey });

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new InternalServerError('Cannot create public key');
      }

      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey
      );

      console.log('Created tokens successfully:::', tokens);

      return {
        shop: getInfoData(['_id', 'name', 'email'], newShop),
        tokens,
      };
    }

    return new OK();
  };
}

module.exports = AccessService;

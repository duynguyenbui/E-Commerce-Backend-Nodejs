'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const {
  InternalServerError,
  BadRequestError,
  ConfictRequestError,
  AuthFailureError,
} = require('../core/error.response');
const KeyTokenService = require('./keyToken.service');
const shopModel = require('../models/shop.model');
const { createTokenPair } = require('../auth/authUtils');
const { OK } = require('../core/success.response');
const { getInfoData } = require('../utils');
const { findByEmail } = require('./shop.service');

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN',
};

class AccessService {
  static logout = async ({ keyStore }) => {
    const delKey = await KeyTokenService.removeTokenById({
      id: keyStore._id,
    });
    console.log({ delKey });
    return {
      delKey,
    };
  };

  static login = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email });
    console.log(foundShop);
    if (!foundShop) throw new BadRequestError('Shop not registered');

    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError('Authentication Error');

    const privateKey = crypto.randomBytes(64).toString('hex');
    const publicKey = crypto.randomBytes(64).toString('hex');

    const { _id: userId } = foundShop;

    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      userId,
      privateKey,
      publicKey,
      refreshToken: tokens.refreshToken,
    });
    return {
      shop: getInfoData(['_id', 'name', 'email'], foundShop),
      tokens,
    };
  };

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
        throw new InternalServerError('Cannot create public key', 500);
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

    throw ConfictRequestError('Created! But cannot create tokens', 200);
  };
}

module.exports = AccessService;

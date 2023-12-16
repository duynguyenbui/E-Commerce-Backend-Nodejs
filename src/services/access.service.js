'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const {
  InternalServerError,
  BadRequestError,
  ConfictRequestError,
  AuthFailureError,
  ForbiddenError,
} = require('../core/error.response');
const KeyTokenService = require('./keyToken.service');
const shopModel = require('../models/shop.model');
const { createTokenPair, verifyJWT } = require('../auth/authUtils');

const { getInfoData } = require('../utils');
const { findByEmail } = require('./shop.service');

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN',
};

class AccessService {
  static handleRefreshToken = async (refreshToken) => {
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken);
    console.log('Toi da toi day ===> ');
    console.log(foundToken);
    if (foundToken) {
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );
      console.log({ userId, email });

      await KeyTokenService.deleteKeyById(userId);
      throw new Error('Forbidden Error');
    }

    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);

    if (!holderToken) {
      throw new AuthFailureError('Shop not registered 1');
    }

    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );

    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError('Shop not registered 2');

    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );

    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken, // da duoc su dung de lay token
      },
    });

    return {
      user: { userId, email },
      tokens,
    };
  };

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

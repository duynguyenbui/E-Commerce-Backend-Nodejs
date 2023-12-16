'use strict';

const JWT = require('jsonwebtoken');
const { asyncHandler } = require('../helpers/asyncHandler');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { findByUserId } = require('../services/keyToken.service');
const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
};
const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: '2 days',
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: '7 days',
    });

    // Verify tokens
    JWT.verify(accessToken, publicKey, (error, decode) => {
      if (error) {
        console.error('Error verify:::', error);
      } else {
        console.log('Decode verify:::', decode);
      }
    });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error('[CREATE_TOKEN_PAIR_ERROR]', error);
  }
};

const authentication = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID];

  if (!userId) throw new AuthFailureError('Invalid request!! Mising client ID');

  const keyStore = await findByUserId(userId);

  if (!keyStore) throw new NotFoundError('Not found UserID in KeyStore');

  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken)
    throw new AuthFailureError('Invalid request!! Mising access token');

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);

    if (userId !== decodeUser.userId)
      throw new AuthFailureError('Invalid User ID');
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createTokenPair,
  authentication,
};

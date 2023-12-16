'use strict';

const JWT = require('jsonwebtoken');

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

module.exports = {
  createTokenPair,
};

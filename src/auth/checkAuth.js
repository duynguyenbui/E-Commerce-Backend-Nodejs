'use strict';

const { BadRequestError } = require('../core/error.response');
const { findById } = require('../services/apikey.service');

const HEADER = {
  API_KEY: 'x-api-key',
  AUTHORIZATION: 'authorization',
};

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();

    if (!key) {
      // Sử dụng next để chuyển điều khiển cho middleware hoặc route tiếp theo
      return res.status(403).json({
        message: 'Not found API Key',
      });
    }

    // Kiểm tra object key
    const objectKey = await findById(key);

    if (!objectKey) {
      // Sử dụng next để chuyển điều khiển cho middleware hoặc route tiếp theo
      return res.status(403).json({
        message: 'Invalid API Key',
      });
    }

    req.objKey = objectKey;

    // Sử dụng next để chuyển điều khiển cho middleware hoặc route tiếp theo
    return next();
  } catch (error) {
    console.error('[MIDDLEWARE_API_KEY_ERROR]', error);
    // Sử dụng next để chuyển điều khiển cho middleware xử lý lỗi chung hoặc route xử lý lỗi
    return next(error);
  }
};

const permissions = (permission) => {
  return (req, res, next) => {
    if (!req.objKey.permissions) {
      return res.status(403).json({
        message: 'Permission Denied',
      });
    }
    const isValid = req.objKey.permissions.includes(permission);
    if (!isValid) {
      return res.status(403).json({
        message: 'Permission Denied',
      });
    }

    return next();
  };
};



module.exports = {
  apiKey,
  permissions,
};

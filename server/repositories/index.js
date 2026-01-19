/**
 * Repository Index
 * Central export point for all repositories
 */

const UserRepository = require('./UserRepository');
const OrderRepository = require('./OrderRepository');
const OtpRepository = require('./OtpRepository');

module.exports = {
  UserRepository,
  OrderRepository,
  OtpRepository
};

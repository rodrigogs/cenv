const debug = require('debug')('cenv:config');

/**
 * @class Config
 */
class Config {
  /**
   * @param {ConfigFile|Object} [config = {}]
   */
  constructor(config = {}) {
    debug('loading config');
    this._registry = config.registry;
    this._timeout = config.timeout;
    this._token = config.token;
    this._username = config.username;
    this._password = config.password;
  }

  /**
   * @return {String}
   */
  get registry() {
    return this._registry;
  }

  /**
   * @param {String} registry
   */
  set registry(registry) {
    this._registry = registry;
  }

  /**
   * @return {Number}
   */
  get timeout() {
    return this._timeout;
  }

  /**
   * @param {Number} timeout
   */
  set timeout(timeout) {
    this._timeout = timeout;
  }

  /**
   * @return {String}
   */
  get token() {
    return this._token;
  }

  /**
   * @param {String} token
   */
  set token(token) {
    this._token = token;
  }

  /**
   * @return {String}
   */
  get username() {
    return this._username;
  }

  /**
   * @param {String} username
   */
  set username(username) {
    this._username = username;
  }

  /**
   * @return {String}
   */
  get password() {
    return this._password;
  }

  /**
   * @param {String} password
   */
  set password(password) {
    this._password = password;
  }
}

module.exports = Config;

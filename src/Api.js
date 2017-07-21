const debug = require('debug')('cenv:api');
const axios = require('axios');
const url = require('url');

/**
 * @param {Error} err
 */
const handleErrors = (err) => {
  if (err && err.response && err.response.data && err.response.data.error) {
    throw new Error(err.response.data.error);
  }
  throw err;
};

/**
 * @class Api
 */
class Api {
  /**
   * @param {Object} config
   */
  constructor(config) {
    debug('configuring api');
    const hasRegistry = !!config.registry;
    const hasToken = !!config.token;
    const hasAuth = (config.username && config.password);

    if (!hasRegistry) throw new Error('Registry ulr must be specified');
    if (!hasToken && !hasAuth) throw new Error('Neither token or user auth was specified');

    const axiosConfig = {
      baseURL: url.resolve(config.registry, 'v1'),
      timeout: config.timeout || 1000,
    };
    if (config.token) {
      axiosConfig.headers = { Authorization: `Bearer ${config.token}` };
    }

    this.config = config;
    this.instance = axios.create(axiosConfig);
  }

  /**
   * @return {Boolean}
   */
  get authNeeded() {
    return !this.config.token;
  }

  /**
   * @return {Promise.<TResult>}
   */
  authenticate() {
    if (!this.authNeeded) return Promise.resolve();
    debug('authenticating');

    const { username, password } = this.config;
    return this.instance.post('auth', { username, password })
      .then((response) => {
        this.config.token = response.data.token;
        this.instance.defaults.headers.common.Authorization = `Bearer ${this.config.token}`;
      })
      .catch(handleErrors);
  }

  /**
   * @param {String} name
   * @return {Promise.<TResult>}
   */
  environment(name) {
    debug(`retrieving variables for "${name}" environment`);

    const request = () => this.instance.get(`environment/${name}`)
      .catch(handleErrors);

    return this.authenticate()
      .then(request);
  }
}

module.exports = Api;

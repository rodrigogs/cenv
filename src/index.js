const debug = require('debug')('cenv:index');

const ConfigFile = require('./ConfigFile');
const Api = require('./Api');

/**
 * @param {String} environment
 * @param {Object} [options={}]
 * @return {Promise.<void>}
 */
const cenv = async (environment, options = {}) => {
  debug(`loading "${environment}" environment`);

  const config = new ConfigFile(options.file, options.relative);
  Object.assign(config, options);

  const api = new Api(config);

  const request = await api.environment(environment);
  request.data.forEach((variable) => {
    const { name, value } = variable;
    debug(`adding "${name}" variable`);

    if (!process.env[name]) process.env[name] = value;
  });

  debug('environment loaded');
};

module.exports = cenv;

const debug = require('debug')('cenv:index');

const ConfigFile = require('./ConfigFile');
const Config = require('./Config');
const Api = require('./Api');

/**
 * @param {Object} [options = {}]
 * @return {Promise.<void>}
 */
const cenv = async (options = {}) => {
  const { environment, file, token, registry, timeout, username, password } = options;

  debug(`loading "${environment}" environment`);

  const configFile = new ConfigFile(file);
  const config = new Config(configFile);
  config.registry = registry || config.registry;
  config.timeout = timeout || config.timeout;
  config.token = token || config.token;
  config.username = username || config.username;
  config.password = password || config.password;

  const api = new Api(config);

  const variables = await api.environment(environment);

  variables.data.forEach((variable) => {
    const { name, value } = variable;
    debug(`adding "${name}" variable`);

    if (!process.env[name]) process.env[name] = value;
  });

  debug('environment loaded');
};

module.exports = cenv;

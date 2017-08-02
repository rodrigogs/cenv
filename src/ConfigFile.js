const debug = require('debug')('cenv:configFile');
const path = require('path');
const fs = require('fs');
const YAML = require('yamljs');
const ini = require('ini');

/**
 * @param {String} file
 * @return {boolean}
 * @private
 */
const _exists = (file) => {
  try {
    fs.accessSync(file);
  } catch (err) {
    return !(err.code === 'ENOENT');
  }
  return true;
};

/**
 * @param {String} file
 * @return {Object|*}
 * @private
 */
const _read = (file) => {
  debug(`resolving "${file}" file`);

  if (!_exists(file)) {
    debug(`"${file}" file not found`);
    return null;
  }

  debug(`found "${file}" file`);

  if (file.endsWith('.yml') || file.endsWith('.yaml')) {
    debug('parsing yml file');
    return YAML.load(file);
  }

  if (file.endsWith('.json')) {
    debug('parsing json file');
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  debug('parsing properties file');
  return ini.parse(fs.readFileSync(file, 'utf8'));
};

/**
 * @class ConfigFile
 */
class ConfigFile {
  /**
   * @param {String} [fileName = '.cenv']
   */
  constructor(fileName = '.cenv') {
    this.filePath = path.resolve(fileName);

    const file = _read(this.filePath);
    if (!file) throw new Error(`File "${this.filePath}" not found`);

    this.registry = file.registry;
    this.timeout = file.timeout ? Number(file.timeout) : undefined;
    this.username = file.username;
    this.password = file.password;
    this.token = file.token;
  }
}

module.exports = ConfigFile;

const chai = require('chai');
const mockfs = require('mock-fs');
const path = require('path');

chai.should();

const ConfigFile = require('../src/ConfigFile');

// Setup
const COMPLETE_CONFIG = {
  registry: 'http://localhost:3000',
  timeout: 10000,
  username: 'admin',
  password: 'admin',
  token: '123456789',
};
const { registry, timeout, username, password, token } = COMPLETE_CONFIG;
const COMMON_CONFIG_FILE = `
registry=${registry}
timeout=${timeout}
username=${username}
password=${password}
`;
const INI_CONFIG_FILE = `
registry=${registry}
timeout=${timeout}
username=${username}
password=${password}
token=${token}
`;
const INI_NO_TIMEOUT_CONFIG_FILE = `
registry=${registry}
username=${username}
password=${password}
token=${token}
`;
const JSON_CONFIG_FILE = `{
  "registry": "${registry}",
  "timeout": ${timeout},
  "username": "${username}",
  "password": "${password}",
  "token": "${token}"
}`;
const YML_CONFIG_FILE = `
registry: ${registry}
tiomeout: ${timeout}
username: ${username}
password: ${password}
token: ${token}
`;
const JSON_INVALID_CONFIG_FILE = '{ERROR}';
const YML_INVALID_CONFIG_FILE = `
ERROR
`;
const cwd = process.cwd();

// Mocks
const mockFileSystem = () => {
  const allFiles = {
    '.cenv': INI_CONFIG_FILE,
    '.cenv.json': JSON_CONFIG_FILE,
    '.cenv.yml': YML_CONFIG_FILE,
    '.cenv.no.timeout': INI_NO_TIMEOUT_CONFIG_FILE,
    '.cenv.invalid.json': JSON_INVALID_CONFIG_FILE,
    '.cenv.invalid.yml': YML_INVALID_CONFIG_FILE,
  };

  mockfs({
    '.cenv': COMMON_CONFIG_FILE,
    '/root/fake/dir': allFiles,
    'relative/fake/dir': allFiles,
  });
};

// Tests
before(() => {
  mockFileSystem();
});

after(() => {
  mockfs.restore();
});

suite('Config', () => {
  suite('Constructor', () => {
    test('should throw an error when file doesn\'t exist', () => {
      chai.expect(() => new ConfigFile('.test')).to.throw(`File "${path.join(cwd, '.test')}" not found`);
    });

    test('should throw an error if json file is invalid', () => {
      chai.expect(() => new ConfigFile('relative/fake/dir/.cenv.invalid.json')).to.throw('Unexpected token E in JSON at position 1');
    });

    test('should throw an error if yml file is invalid', () => {
      chai.expect(() => new ConfigFile('relative/fake/dir/.cenv.invalid.yml')).to.throw('Unable to parse.');
    });

    test('should default file path to .cenv when no file is specified', () => {
      const config = new ConfigFile();
      config.filePath.should.be.equal(path.join(cwd, '.cenv'));
    });

    test('should resolve relative file path', () => {
      const config = new ConfigFile('relative/fake/dir/.cenv.yml');
      config.filePath.should.be.equal(path.join(cwd, 'relative/fake/dir/.cenv.yml'));
    });

    test('should resolve absolute file path', () => {
      const config = new ConfigFile('/root/fake/dir/.cenv.yml', false);
      config.filePath.should.be.equal(path.resolve('/root/fake/dir/.cenv.yml'));
    });

    test('should leave timeout as undefined if it\'s not present in the file', () => {
      const config = new ConfigFile('relative/fake/dir/.cenv.no.timeout');
      chai.expect(config.timeout).to.be.undefined;
    });

    test('should create a ConfigFile instance from an ini file', () => {
      const config = new ConfigFile('relative/fake/dir/.cenv');
      config.should.be.a('object');
      config.filePath.should.be.equal(path.join(cwd, 'relative/fake/dir/.cenv'));
      config.registry.should.be.equal(registry);
      config.timeout.should.be.equal(timeout);
      config.username.should.be.equal(username);
      config.password.should.be.equal(password);
      config.token.should.be.equal(token);
    });
  });
});

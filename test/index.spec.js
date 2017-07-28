const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const nock = require('nock');
const mockfs = require('mock-fs');

chai.use(chaiAsPromised);
chai.should();

const cenv = require('../src/index');

// Setup
const COMPLETE_CONFIG = {
  registry: 'http://localhost:3000',
  timeout: 10000,
  username: 'admin',
  password: 'admin',
  token: '123456789',
};
const { registry, timeout, username, password, token } = COMPLETE_CONFIG;
const registryUrl = `${registry}/v1`;
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

// Mocks
const mockApi = () => {
  nock(registryUrl)
    .persist()

    .post('/auth', (body) => {
      return body.password === 'error';
    })
    .reply(500, { error: 'Server error' })

    .post('/auth', (body) => {
      return body.password === 'requestError';
    })
    .replyWithError('request error')

    .post('/auth', (body) => {
      return body.username === username && body.password === password;
    })
    .reply(200, { token })

    .post('/auth', (body) => {
      return body.username !== username || body.password !== password;
    })
    .reply(401, { error: 'Unauthorized' })

    .get('/environment/env')
    .reply(200, { variables: [{ name: 'var', value: 'value' }] })

    .get('/environment/notAnEnv')
    .reply(404, { error: 'Environment "notAnEnv" not found' })

    .get('/environment/error')
    .reply(500, { error: 'Server error' })

    .get('/environment/requestError')
    .replyWithError('request error');
};

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
  mockApi();
  mockFileSystem();
});

after(() => {
  nock.cleanAll();
  mockfs.restore();
});

suite('cenv', () => {
  test('should try to load options from the default try when undefined', async () => {
    await cenv('env').should.be.fulfilled;
    process.env.var.should.be.equal('value');
  });

  test('should disable config file loading when file path is \'false\'', async () => {
    await cenv('env', { file: 'false' }).should.be.rejectedWith('Registry ulr must be specified');
  });

  test('should load an absolute file', async () => {
    await cenv('env', { file: '/root/fake/dir/.cenv.yml' }).should.be.fulfilled;
    process.env.var.should.be.equal('value');
  });

  test('should load config from a json file', async () => {
    await cenv('env', { file: 'relative/fake/dir/.cenv.json' }).should.be.fulfilled;
    process.env.var.should.be.equal('value');
  });

  test('should load config from a yml file', async () => {
    await cenv('env', { file: 'relative/fake/dir/.cenv.yml' }).should.be.fulfilled;
    process.env.var.should.be.equal('value');
  });

  test('should throw an error if json file is invalid', async () => {
    await cenv('env', { file: 'relative/fake/dir/.cenv.invalid.json' }).should.be.rejectedWith('Unexpected token E in JSON at position 1');
  });

  test('should throw an error if yml file is invalid', async () => {
    await cenv('env', { file: 'relative/fake/dir/.cenv.invalid.yml' }).should.be.rejectedWith('Unable to parse.');
  });

  test('should override file options with options object', async () => {
    await cenv('env', { registry: 'http://localhost:2000' }).should.be.rejectedWith('connect ECONNREFUSED 127.0.0.1:2000');
  });

  test('should fail trying to authenticate with invalid credentials', async () => {
    await cenv('env', { username: 'error', password: 'invalid' }).should.be.rejectedWith('Unauthorized');
  });

  test('should retrieve variables from an environment', async () => {
    await cenv('env').should.be.fulfilled;
    process.env.var.should.be.equal('value');
  });
});

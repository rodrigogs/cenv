const chai = require('chai');
const nock = require('nock');

chai.should();

const Api = require('../src/Api');

// Setup
const COMPLETE_CONFIG = {
  registry: 'http://localhost:8080',
  timeout: 10000,
  username: 'admin',
  password: 'admin',
  token: '123456789',
};
const { registry, timeout, username, password, token } = COMPLETE_CONFIG;
const registryUrl = `${registry}/v1`;

// Mocks
nock(registryUrl)
  .post('/auth', (body) => {
    return body.username === username && body.password === password;
  })
  .reply(200, { token });

nock(registryUrl)
  .post('/auth', (body) => {
    return body.username !== username || body.password !== password;
  })
  .reply(401, { error: 'Unauthorized' });

nock(registryUrl)
  .get('/environment/env')
  .reply(200, []);

nock(registryUrl)
  .get('/environment/notAnEnv')
  .reply(404, { error: 'Environment "notAnEnv" not found' });

// Tests
suite('Api', () => {
  suite('#Constructor()', () => {
    test('should throw TypeError when no config is given', () => {
      chai.expect(() => new Api()).to.throw('Cannot read property \'registry\' of undefined');
    });

    test('should throw error when config has no registry', () => {
      chai.expect(() => new Api({})).to.throw('Registry ulr must be specified');
    });

    test('should throw error when config has no auth info', () => {
      chai.expect(() => new Api({ registry })).to.throw('Neither token or user auth was specified');
    });

    test('should throw error when config has no username', () => {
      chai.expect(() => new Api({ registry, password })).to.throw('Neither token or user auth was specified');
    });

    test('should throw error when config has no password', () => {
      chai.expect(() => new Api({ registry, username })).to.throw('Neither token or user auth was specified');
    });

    test('should create an Api instance with the given config', () => {
      const api = new Api(COMPLETE_CONFIG);
      api.should.be.a('object');
      api.config.should.be.a('object');
      api.config.should.be.a('object');
      api.config.registry.should.be.equal(registry);
      api.config.timeout.should.be.equal(timeout);
      api.config.username.should.be.equal(username);
      api.config.password.should.be.equal(password);
      api.config.token.should.be.equal(token);
      api.instance.should.be.a('function');
      api.instance.defaults.timeout.should.be.equal(timeout);
      api.instance.defaults.baseURL.should.be.equal(registryUrl);
      api.instance.defaults.headers.Authorization.should.be.equal(`Bearer ${token}`);
    });
  });

  suite('#authNeeded', () => {
    test('should require auth when config has no token', () => {
      const api = new Api({ registry, username, password });
      api.authNeeded.should.be.true;
    });

    test('should not require auth when config has token', () => {
      const api = new Api({ registry, token });
      api.authNeeded.should.be.false;
    });
  });

  suite('#authenticate()', () => {
    test('should authenticate and store the received token in the current instance', async () => {
      const api = new Api({ registry, username, password });
      await api.authenticate();
      api.instance.defaults.headers.common.Authorization.should.be.equal(`Bearer ${token}`);
    });

    test('should fail to authenticate', async () => {
      const api = new Api({ registry, username, password: 'fail' });
      try {
        await api.authenticate();
      } catch (err) {
        err.message.should.be.equal('Unauthorized');
      }
    });
  });

  suite('#environment()', () => {
    test('should retrieve an environment from the registry', async () => {
      const api = new Api({ registry, username, password });
      const variables = await api.environment('env');
      variables.data.should.be.an('array');
    });

    // test('should fail to authenticate', async () => {
    //   const api = new Api({ registry, username, password });
    //   const variables = await api.environment('notAnEnv');
    //   variables.data.should.be.an('array');
    // });
  });
});

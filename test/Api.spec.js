const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const nock = require('nock');

chai.use(chaiAsPromised);
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

// Tests
before(() => {
  mockApi();
});

after(() => {
  nock.cleanAll();
});

suite('Api', () => {
  suite('Constructor', () => {
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

    test('should automatically authenticate when token is present', async () => {
      const api = new Api({ registry, token });
      await api.authenticate();
      api.instance.defaults.headers.common.Authorization.should.be.equal(`Bearer ${token}`);
    });

    test('should fail to authenticate', async () => {
      const api = new Api({ registry, username, password: 'fail' });
      await api.authenticate().should.be.rejectedWith('Unauthorized');
    });

    test('should fail to request authenticate with an unexpected error', async () => {
      const api = new Api({ registry, username, password: 'requestError' });
      await api.authenticate().should.be.rejectedWith('request error');
    });

    test('should fail to authenticate with an unexpected server error', async () => {
      const api = new Api({ registry, username, password: 'error' });
      await api.authenticate().should.be.rejectedWith('Server error');
    });
  });

  suite('#environment()', () => {
    test('should retrieve an environment from the registry', async () => {
      const api = new Api({ registry, username, password });
      const variables = await api.environment('env');
      variables.data.should.be.an('object');
      variables.data.variables.should.be.an('array');
      variables.data.variables.should.have.length(1);
      variables.data.variables[0].name.should.be.equal('var');
      variables.data.variables[0].value.should.be.equal('value');
    });

    test('should fail to retrieve an unexistent environment', async () => {
      const api = new Api({ registry, username, password });
      await api.environment('notAnEnv').should.be.rejectedWith('Environment "notAnEnv" not found');
    });

    test('should fail to request an environment with an unexpected error', async () => {
      const api = new Api({ registry, username, password });
      await api.environment('requestError').should.be.rejectedWith('request error');
    });

    test('should fail to retrieve an environment with an unexpected server error', async () => {
      const api = new Api({ registry, username, password });
      await api.environment('error').should.be.rejectedWith('Server error');
    });
  });
});

import * as assert from 'assert';
import * as sinon from 'sinon';
import appInsights from '../../../../appInsights';
import auth from '../../../../Auth';
import { Logger } from '../../../../cli';
import Command, { CommandError } from '../../../../Command';
import request from '../../../../request';
import Utils from '../../../../Utils';
import commands from '../../commands';
const command: Command = require('./theme-list');

describe(commands.THEME_LIST, () => {
  let log: string[];
  let logger: Logger;
  let loggerSpy: sinon.SinonSpy;

  before(() => {
    sinon.stub(auth, 'restoreAuth').callsFake(() => Promise.resolve());
    sinon.stub(appInsights, 'trackEvent').callsFake(() => {});
    auth.service.connected = true;
    auth.service.spoUrl = 'https://contoso.sharepoint.com';
  });

  beforeEach(() => {
    log = [];
    logger = {
      log: (msg: string) => {
        log.push(msg);
      }
    };
    loggerSpy = sinon.spy(logger, 'log');
  });

  afterEach(() => {
    Utils.restore([
      request.post
    ]);
  });

  after(() => {
    Utils.restore([
      auth.restoreAuth,
      appInsights.trackEvent
    ]);
    auth.service.connected = false;
    auth.service.spoUrl = undefined;
  });

  it('has correct name', () => {
    assert.strictEqual(command.name.startsWith(commands.THEME_LIST), true);
  });

  it('has a description', () => {
    assert.notStrictEqual(command.description, null);
  });

  it('uses correct API url', (done) => {
    const postStub: sinon.SinonStub = sinon.stub(request, 'post').callsFake((opts) => {
      if ((opts.url as string).indexOf('/_api/thememanager/GetTenantThemingOptions') > -1) {
        return Promise.resolve('Correct Url')
      }

      return Promise.reject('Invalid request');
    });

    command.action(logger, {
      options: {
        debug: false,
      }
    }, () => {
      try {
        assert.strictEqual(postStub.lastCall.args[0].url, 'https://contoso-admin.sharepoint.com/_api/thememanager/GetTenantThemingOptions');
        assert.strictEqual(postStub.lastCall.args[0].headers['accept'], 'application/json;odata=nometadata');
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('uses correct API url (debug)', (done) => {
    const postStub: sinon.SinonStub = sinon.stub(request, 'post').callsFake((opts) => {
      if ((opts.url as string).indexOf('/_api/thememanager/GetTenantThemingOptions') > -1) {
        return Promise.resolve('Correct Url')
      }
      return Promise.reject('Invalid request');
    });

    command.action(logger, {
      options: {
        debug: true,
      }
    }, () => {
      try {
        assert.strictEqual(postStub.lastCall.args[0].url, 'https://contoso-admin.sharepoint.com/_api/thememanager/GetTenantThemingOptions');
        assert.strictEqual(postStub.lastCall.args[0].headers['accept'], 'application/json;odata=nometadata');
        assert.strictEqual(loggerSpy.called, true);
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('retrieves available themes from the tenant store', (done) => {
    const themes: any = {
      "themePreviews": [{ "name": "Mint", "themeJson": "{\"isInverted\":false,\"name\":\"Mint\",\"palette\":{\"themePrimary\":\"#43cfbb\",\"themeLighterAlt\":\"#f2fcfa\",\"themeLighter\":\"#ddf6f2\",\"themeLight\":\"#adeae1\",\"themeTertiary\":\"#71dbcb\",\"themeSecondary\":\"#4ad1bd\",\"themeDarkAlt\":\"#32c3ae\",\"themeDark\":\"#248b7b\",\"themeDarker\":\"#1f776a\",\"neutralLighterAlt\":\"#f8f8f8\",\"neutralLighter\":\"#f4f4f4\",\"neutralLight\":\"#eaeaea\",\"neutralQuaternaryAlt\":\"#dadada\",\"neutralQuaternary\":\"#d0d0d0\",\"neutralTertiaryAlt\":\"#c8c8c8\",\"neutralTertiary\":\"#a6a6a6\",\"neutralSecondary\":\"#666666\",\"neutralPrimaryAlt\":\"#3c3c3c\",\"neutralPrimary\":\"#333\",\"neutralDark\":\"#212121\",\"black\":\"#1c1c1c\",\"white\":\"#fff\",\"primaryBackground\":\"#fff\",\"primaryText\":\"#333\",\"bodyBackground\":\"#fff\",\"bodyText\":\"#333\",\"disabledBackground\":\"#f4f4f4\",\"disabledText\":\"#c8c8c8\"}}" }, { "name": "Mint Inverted", "themeJson": "{\"isInverted\":true,\"name\":\"Mint Inverted\",\"palette\":{\"themePrimary\":\"#43cfbb\",\"themeLighterAlt\":\"#f2fcfa\",\"themeLighter\":\"#ddf6f2\",\"themeLight\":\"#adeae1\",\"themeTertiary\":\"#71dbcb\",\"themeSecondary\":\"#4ad1bd\",\"themeDarkAlt\":\"#32c3ae\",\"themeDark\":\"#248b7b\",\"themeDarker\":\"#1f776a\",\"neutralLighterAlt\":\"#f8f8f8\",\"neutralLighter\":\"#f4f4f4\",\"neutralLight\":\"#eaeaea\",\"neutralQuaternaryAlt\":\"#dadada\",\"neutralQuaternary\":\"#d0d0d0\",\"neutralTertiaryAlt\":\"#c8c8c8\",\"neutralTertiary\":\"#a6a6a6\",\"neutralSecondary\":\"#666666\",\"neutralPrimaryAlt\":\"#3c3c3c\",\"neutralPrimary\":\"#333\",\"neutralDark\":\"#212121\",\"black\":\"#1c1c1c\",\"white\":\"#fff\",\"primaryBackground\":\"#fff\",\"primaryText\":\"#333\",\"bodyBackground\":\"#fff\",\"bodyText\":\"#333\",\"disabledBackground\":\"#f4f4f4\",\"disabledText\":\"#c8c8c8\"}}" }]
    };
    sinon.stub(request, 'post').callsFake((opts) => {
      if ((opts.url as string).indexOf('/_api/thememanager/GetTenantThemingOptions') > -1) {
        return Promise.resolve(themes);
      }
      return Promise.reject('Invalid request');
    });

    command.action(logger, { options: { debug: true, verbose: true } }, () => {
      try {
        assert(loggerSpy.calledWith([{
          Name: 'Mint',
        },
        {
          Name: 'Mint Inverted'
        }]), 'Invalid request');
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('retrieves available themes from the tenant store with all properties for JSON output', (done) => {
    let expected: any = {
      "themePreviews": [{ "name": "Mint", "themeJson": "{\"isInverted\":false,\"name\":\"Mint\",\"palette\":{\"themePrimary\":\"#43cfbb\",\"themeLighterAlt\":\"#f2fcfa\",\"themeLighter\":\"#ddf6f2\",\"themeLight\":\"#adeae1\",\"themeTertiary\":\"#71dbcb\",\"themeSecondary\":\"#4ad1bd\",\"themeDarkAlt\":\"#32c3ae\",\"themeDark\":\"#248b7b\",\"themeDarker\":\"#1f776a\",\"neutralLighterAlt\":\"#f8f8f8\",\"neutralLighter\":\"#f4f4f4\",\"neutralLight\":\"#eaeaea\",\"neutralQuaternaryAlt\":\"#dadada\",\"neutralQuaternary\":\"#d0d0d0\",\"neutralTertiaryAlt\":\"#c8c8c8\",\"neutralTertiary\":\"#a6a6a6\",\"neutralSecondary\":\"#666666\",\"neutralPrimaryAlt\":\"#3c3c3c\",\"neutralPrimary\":\"#333\",\"neutralDark\":\"#212121\",\"black\":\"#1c1c1c\",\"white\":\"#fff\",\"primaryBackground\":\"#fff\",\"primaryText\":\"#333\",\"bodyBackground\":\"#fff\",\"bodyText\":\"#333\",\"disabledBackground\":\"#f4f4f4\",\"disabledText\":\"#c8c8c8\"}}" }, { "name": "Mint Inverted", "themeJson": "{\"isInverted\":true,\"name\":\"Mint Inverted\",\"palette\":{\"themePrimary\":\"#43cfbb\",\"themeLighterAlt\":\"#f2fcfa\",\"themeLighter\":\"#ddf6f2\",\"themeLight\":\"#adeae1\",\"themeTertiary\":\"#71dbcb\",\"themeSecondary\":\"#4ad1bd\",\"themeDarkAlt\":\"#32c3ae\",\"themeDark\":\"#248b7b\",\"themeDarker\":\"#1f776a\",\"neutralLighterAlt\":\"#f8f8f8\",\"neutralLighter\":\"#f4f4f4\",\"neutralLight\":\"#eaeaea\",\"neutralQuaternaryAlt\":\"#dadada\",\"neutralQuaternary\":\"#d0d0d0\",\"neutralTertiaryAlt\":\"#c8c8c8\",\"neutralTertiary\":\"#a6a6a6\",\"neutralSecondary\":\"#666666\",\"neutralPrimaryAlt\":\"#3c3c3c\",\"neutralPrimary\":\"#333\",\"neutralDark\":\"#212121\",\"black\":\"#1c1c1c\",\"white\":\"#fff\",\"primaryBackground\":\"#fff\",\"primaryText\":\"#333\",\"bodyBackground\":\"#fff\",\"bodyText\":\"#333\",\"disabledBackground\":\"#f4f4f4\",\"disabledText\":\"#c8c8c8\"}}" }]
    };
    sinon.stub(request, 'post').callsFake((opts) => {
      if ((opts.url as string).indexOf('/_api/thememanager/GetTenantThemingOptions') > -1) {
        return Promise.resolve(expected);
      }
      return Promise.reject('Invalid request');
    });

    command.action(logger, { options: { debug: true, verbose: true, output: 'json' } }, () => {
      try {
        assert(loggerSpy.calledWith(expected.themePreviews), 'Invalid request');
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('retrieves available themes - no custom themes available', (done) => {
    let expected: any = {
      "themePreviews": []
    };
    sinon.stub(request, 'post').callsFake((opts) => {
      if ((opts.url as string).indexOf('/_api/thememanager/GetTenantThemingOptions') > -1) {
        return Promise.resolve(expected);
      }
      return Promise.reject('Invalid request');
    });

    command.action(logger, { options: { debug: true, verbose: true } }, () => {
      try {
        assert(loggerSpy.calledWith('No themes found'), 'Invalid request');
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('retrieves available themes - handle error', (done) => {
    sinon.stub(request, 'post').callsFake((opts) => {
      if ((opts.url as string).indexOf('/_api/thememanager/GetTenantThemingOptions') > -1) {
        return Promise.reject('An error has occurred');
      }
      return Promise.reject('Invalid request');
    });

    command.action(logger, { options: { debug: true, verbose: true } } as any, (err?: any) => {
      try {
        assert.strictEqual(JSON.stringify(err), JSON.stringify(new CommandError('An error has occurred')));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('supports debug mode', () => {
    const options = command.options();
    let containsDebugOption = false;
    options.forEach(o => {
      if (o.option === '--debug') {
        containsDebugOption = true;
      }
    });
    assert(containsDebugOption);
  });
});
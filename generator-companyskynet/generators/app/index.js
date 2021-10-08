/* eslint-disable no-restricted-globals */
const Generator = require('yeoman-generator');
const fs = require('fs');
const mkdirp = require('mkdirp');
const {
  confirmStart,
  getServiceName,
  getProductId,
  getTileId,
  getWhatThrottles,
  getDayThrottleLimits,
  getHourThrottleLimits,
  getSecondThrottleLimits,
  getMinuteThrottleLimits,
  getReserveCapForDirect,
  getSafeThrottleLimit,
  getIsBulkFetchEnabled,
  getIsBulkTransitionEnabled,
  getEnableWebhook,
  checkExisting,
  chooseExistingMiddleware,
  getMiddlewareName,
} = require('./prompts');

const {
  functionConfigs,
  resourceQueueConfigs,
  resourceSubscriptionConfigs,
  queueRefPolicyConfigs,
  iamSqsResources,
} = require('./slsConfigOptions');

class skynetGenerator extends Generator {
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);
    this.fixAppName = (appname) => appname.replace(/\s+|_+/g, '-');

    this.proceed = true;
    this.envData = {
      region: 'us-east-1',
      accountId: 811255529278,
      retryCntForCapacity: 3,
    };

    this.doWeStart = async () => {
      const answer = await this.prompt([{ ...confirmStart, default: this.fixAppName(this.appname) }]);
      return answer.start;
    };

    this.formatEnvToYml = () => ({
      serviceName: this.answers.service,
      ...this.envData,
      ...this.answers,
      throttleLmts: JSON.stringify({
        ...(this.answers.dayThrottleLimits ? { day: this.answers.dayThrottleLimits } : {}),
        ...(this.answers.hourThrottleLimits ? { hour: this.answers.hourThrottleLimits } : {}),
        ...(this.answers.minutesThrottleLimits ? { minutes: this.answers.minutesThrottleLimits } : {}),
        ...(this.answers.secondThrottleLimits ? { second: this.answers.secondThrottleLimits } : {}),
      }).replace(/"/g, "'"),
    });

    this.getCurrentMiddlewareNames = () => {
      const middlewareFiles = fs.readdirSync(this.destinationPath('middleware'));
      return middlewareFiles.filter(fileName => fileName !== 'index.js')
    }

    this.addMiddleware = () => {
      if (!fs.existsSync(this.destinationRoot('/middleware'))) {
        mkdirp.sync(this.destinationRoot('/middleware'));
      }
      if (this.answers.newCustom) {
        this.fs.copyTpl(
          this.templatePath(
            'middleware/template.txt',
          ),
          this.destinationPath(`middleware/${this.answers.newCustom}.js`, {
            middlewareName: this.answers.newCustom,
          }),
        );
      }
      this.fs.copyTpl(
        this.templatePath(
          'middleware/index.txt',
        ),
        this.destinationPath('middleware/index.js', generateMiddlewareIndex(this.getCurrentMiddlewareNames(), this.answers.chooseExistingMiddleware || [])),
      );
    };

    this.finishProvisioning = () => {
      const getSlsConfigOptions = (configs, answers) => {
        let slsString = '';
        if (answers.bulkFetch) {
          slsString = slsString.concat(configs.bulkFetch);
        }
        if (answers.bulkTransition) {
          slsString = slsString.concat(configs.bulkTransition);
        }
        if (answers.enableWebhook) {
          slsString = slsString.concat(configs.webhook);
        }
        return slsString;
      };

      if (this.proceed === false) {
        return;
      }
      this.fs.copy(this.templatePath('workers/fetchWorker.js'), this.destinationPath('workers/fetchWorker.js'));
      this.fs.copy(
        this.templatePath('workers/transitionWorker.js'),
        this.destinationPath('workers/transitionWorker.js'),
      );
      this.fs.copy(this.templatePath('database.config.json'), this.destinationPath('database.config.json'));
      this.fs.copy(this.templatePath('handler.js'), this.destinationPath('handler.js'));
      this.fs.copy(this.templatePath('webpack.config.js'), this.destinationPath('webpack.config.js'));
      this.fs.copy(this.templatePath('.eslintrc.js'), this.destinationPath('.eslintrc.js'));
      this.fs.copy(this.templatePath('.gitignore'), this.destinationPath('.gitignore'));
      this.fs.copy(this.templatePath('README.md'), this.destinationPath('README.md'));
      this.fs.copyTpl(this.templatePath('package.json'), this.destinationPath('package.json'), {
        appName: this.answers.service,
      });
      this.fs.copyTpl(this.templatePath('env.yml'), this.destinationPath('env.yml'), this.formatEnvToYml());
      this.fs.copyTpl(this.templatePath('serverless.yml'), this.destinationPath('serverless.yml'), {
        serviceName: this.answers.service,
        optionalIamSqsResources: getSlsConfigOptions(iamSqsResources, this.answers),
        optionalFunctionConfigs: getSlsConfigOptions(functionConfigs, this.answers),
        optionalQueueCreation: getSlsConfigOptions(resourceQueueConfigs, this.answers),
        optionalQueueSubscriptions: getSlsConfigOptions(resourceSubscriptionConfigs, this.answers),
        optionalQueuePolicies: getSlsConfigOptions(queueRefPolicyConfigs, this.answers),
      });
      this.fs.copyTpl(
        this.templatePath('tests/sampleMessage.json'),
        this.destinationPath('tests/sampleMessage.json'),
        this.answers,
      );
      this.fs.copyTpl(
        this.templatePath('.vscode/launch.json'),
        this.destinationPath('.vscode/launch.json'),
        this.answers,
      );
      mkdirp.sync(`${this.destinationRoot()}/services`);
      this.fs.copyTpl(
        this.templatePath(
          this.answers.enableWebhook ? 'workers/webhookWorker-enabled.js' : 'workers/webhookWorker-disabled.js',
        ),
        this.destinationPath('workers/webhookWorker.js'),
      );
      mkdirp.sync(`${this.destinationRoot()}/middleware`);
      this.fs.copyTpl(
        this.templatePath(
          'middleware/index.txt',
        ),
        this.destinationPath('middleware/index.js', generateMiddlewareIndex(this.getCurrentMiddlewareNames(), this.answers.chooseExistingMiddleware || [])),
      );
    };
  }
}

module.exports = class extends skynetGenerator {
  async prompting() {
    const preExistingService = fs.existsSync(this.destinationPath('package.json'));

    this.startUp = await this.prompt(preExistingService ? [
      confirmStart,
      checkExisting,
    ] : [confirmStart]);
    console.log('this.startUp', this.startUp)
    if (this.startUp.start) {
      if (!preExistingService || this.startUp.generateFullService === 'Generate Full Service') {
        this.type = 'fullService';
        this.answers = await this.prompt([
          { ...getServiceName, default: this.fixAppName(this.appname) },
          getProductId,
          getTileId,
          getWhatThrottles,
          getDayThrottleLimits,
          getHourThrottleLimits,
          getMinuteThrottleLimits,
          getSecondThrottleLimits,
          getIsBulkFetchEnabled,
          getIsBulkTransitionEnabled,
          getReserveCapForDirect,
          getSafeThrottleLimit,
          getEnableWebhook,
          chooseExistingMiddleware,
        ]);
        this.answers.safeThrottleLimit = this.answers.safeThrottleLimit ? this.answers.safeThrottleLimit / 100 : 0.8;
        this.answers.reserveCapForDirect = this.answers.reserveCapForDirect ? this.answers.reserveCapForDirect / 100 : 0.3;
      } else if (this.startUp.generateFullService === 'Add Custom Middleware') {
        this.type = 'middleware';
        this.answers = await this.prompt([
          chooseExistingMiddleware,
          getMiddlewareName,
        ]);
      }
    } else {
      this.type = 'none';
    }
  }


  writing() {
    switch(this.type) {
      case 'fullService':
        this.finishProvisioning();
        break;
      case 'middleware':
        this.addMiddleware();
        break;
      default:
        break;
    }
  }

  end() {
    this.log(
      'Your service is now generated, please read the included README.md and comments for instructions on how to get started.',
    );
  }
};

const Generator = require('yeoman-generator');
const mkdirp = require('mkdirp');

class skynetGenerator extends Generator {
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);
    this.fixAppName = appname => appname.replace(/\s+/g, '-');

    this.proceed = true;
    this.region = 'us-east-1';
    this.accountId = 811255529278;
    this.envData = {
      region: 'us-ease-1',
      accountId: 811255529278,
      reserveCapForDirect: 0.3,
      retryCntForCapacity: 3,
      safeThrottleLimit: 0.8,
    };

    this.doWeStart = async () => {
      const answer = await this.prompt([
        {
          type: 'confirm',
          name: 'start',
          message: 'Hi. Welcome to company skynet generator. Enter \'Y\' and hit \'Return\' to continue and answer a few questions to enable me to generate the project for you.',
          store: false,
        },
      ]);
      return answer.value;
    }

    this.getBasicAnswers = async () => {
      return this.prompt([
        {
          type: 'input',
          name: 'service',
          message: 'Your service name',
          default: this.fixAppName(this.appname),
          store: false,
        },
        {
          type: 'input',
          name: 'productId',
          message: 'Your productId',
          store: false,
        },
        {
          type: 'input',
          name: 'tileId',
          message: 'Your tileId',
          store: false,
        },
      ]);
    };

    this.getThrottleLimits = async () => {
      let throttleLmts = {};
      const throttleOn = await this.prompt([
        {
          type: 'confirm',
          name: 'value',
          message: 'Does your API have any throttle limits?',
          store: false,
        },
      ]);

      if (throttleOn.value === false) {
        return throttleLmts;
      }

      const throttlePerDayOn = await this.prompt([
        {
          type: 'confirm',
          name: 'value',
          message: 'Does your API have any per day throttle limits?',
          store: false,
        },
      ]);

      if (throttlePerDayOn.value === true) {
        let value = 'x';
        while (isNaN(value)) {
          value = (await this.prompt([
            {
              type: 'input',
              name: 'value',
              message: 'What is the per day throttle limit  (enter only a number)?',
              default: 0,
              store: false,
            },
          ])).value;
        }
        throttleLmts = {
          ...throttleLmts, day: value
        };
      }

      const throttlePerHourOn = await this.prompt([
        {
          type: 'confirm',
          name: 'value',
          message: 'Does your API have any per hour throttle limits?',
          store: false,
        },
      ]);

      if (throttlePerHourOn.value === true) {
        let value = 'x';
        while (isNaN(value)) {
          value = (await this.prompt([
            {
              type: 'input',
              name: 'value',
              message: 'What is the per hour throttle limit (enter only a number)?',
              default: 0,
              store: false,
            },
          ])).value;
        }
        throttleLmts = {
          ...throttleLmts, hour: value
        };
      }

      const throttlePerMinOn = await this.prompt([
        {
          type: 'confirm',
          name: 'value',
          message: 'Does your API have any per minute throttle limits?',
          store: false,
        },
      ]);

      if (throttlePerMinOn.value === true) {
        let value = 'x';
        while (isNaN(value)) {
          value = (await this.prompt([
            {
              type: 'input',
              name: 'value',
              message: 'What is the per minute throttle limit (enter only a number)?',
              default: 0,
              store: false,
            },
          ])).value;
        }
        throttleLmts = {
          ...throttleLmts, minute: value
        };
      }

      const throttlePerSecOn = await this.prompt([
        {
          type: 'confirm',
          name: 'value',
          message: 'Does your API have any per second throttle limits?',
          store: false,
        },
      ]);

      if (throttlePerSecOn.value === true) {
        let value = 'x';
        while (isNaN(value)) {
          value = (await this.prompt([
            {
              type: 'input',
              name: 'value',
              message: 'What is the per second throttle limit (enter only a number)?',
              default: 0,
              store: false,
            },
          ])).value;
        }
        throttleLmts = {
          ...throttleLmts, second: value
        };
      }
      return { throttleLmts };
    };

    this.getSafeLimits = async () => {
      const toReturn = {};
      let value = 'x';
      while (isNaN(value) || value < 0 || value > 100) {
        value = (await this.prompt([
          {
            type: 'input',
            name: 'value',
            message: 'What % of capacity would you like to reserve for direct calls to the API?',
            default: this.envData.reserveCapForDirect * 100,
            store: false,
          },
        ])).value;
      }
      toReturn.reserveCapForDirect = value / 100;

      value = 'x';
      while (isNaN(value) || value < 0 || value > 100) {
        value = (await this.prompt([
          {
            type: 'input',
            name: 'value',
            message: 'What % of throttle capacity would you like to at the most for calls to the API?',
            default: this.envData.safeThrottleLimit * 100,
            store: false,
          },
        ])).value;
      }
      toReturn.safeThrottleLimit = value / 100;
      return toReturn;
    }

    this.formatEnvToYml = () => {
      return { ...this.envData, throttleLmts: JSON.stringify(this.envData.throttleLmts) };
    }

    this.finishProvisioning = () => {
      if (this.proceed === false) {
        return;
      }
      this.envData.region = this.region;
      this.envData.accountId = this.accountId;
      this.log(JSON.stringify(this.envData, null, 4));
      this.fs.copy(
        this.templatePath('workers/fetchWorker.js'),
        this.destinationPath('workers/fetchWorker.js')
      );
      this.fs.copy(
        this.templatePath('workers/transitionWorker.js'),
        this.destinationPath('workers/transitionWorker.js')
      );
      this.fs.copy(
        this.templatePath('database.config.json'),
        this.destinationPath('database.config.json')
      );
      this.fs.copy(
        this.templatePath('handler.js'),
        this.destinationPath('handler.js')
      );
      this.fs.copy(
        this.templatePath('serverless.yml'),
        this.destinationPath('serverless.yml')
      );
      this.fs.copy(
        this.templatePath('webpack.config.js'),
        this.destinationPath('webpack.config.js')
      );
      this.fs.copy(
        this.templatePath('.eslintrc'),
        this.destinationPath('.eslintrc')
      );
      this.fs.copy(
        this.templatePath('.gitignore'),
        this.destinationPath('.gitignore')
      );
      this.fs.copy(
        this.templatePath('README.md'),
        this.destinationPath('README.md')
      );
      this.fs.copyTpl(
        this.templatePath('package.json'),
        this.destinationPath('package.json'),
        { appName: this.envData.service }
      );
      this.fs.copyTpl(
        this.templatePath('env.yml'),
        this.destinationPath('env.yml'),
        this.formatEnvToYml()
      );
      mkdirp.sync(`${this.destinationRoot()}/tests`);
      mkdirp.sync(`${this.destinationRoot()}/services`);
    };
  }

}

module.exports = class extends skynetGenerator {
  constructor(args, opts) {
    super(args, opts);
  }

  async prompting() {
    if (await this.doWeStart() === false) {
      this.proceed = false;
      return null;
    }

    this.envData = {
      ...this.envData,
      ...await this.getBasicAnswers(),
      ...await this.getThrottleLimits(),
      ...await this.getSafeLimits()
    };
  }

  
  writing() {
    this.finishProvisioning();
  };

  install() {
    this.npmInstall();
  }
};
'use strict';
var fs = require('fs');
var path = require('path');
var util = require('util');
var angularUtils = require('../util.js');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var wiredep = require('wiredep');
var slash = require('slash');

var Config = require('../config.js');
var Feature = require('../feature.js');

var Generator = module.exports = function Generator(args, options) {
  yeoman.generators.Base.apply(this, arguments);

  // Get configuration
  this.config = Config.getConfig({
    path: '',
    file: 'config.json'
  });

  this.argument('appname', { type: String, required: false });
  this.appname = this.appname || path.basename(process.cwd());
  this.appname = this._.camelize(this._.slugify(this._.humanize(this.appname)));

  this.option('app-suffix', {
    desc: 'Allow a custom suffix to be added to the module name',
    type: String,
    required: 'false'
  });
  this.scriptAppName = this.appname + angularUtils.appName(this);

  args = ['main'];

  // Application path will be read from config.json file (this.config.app.path).
  /*if (typeof this.env.options.appPath === 'undefined') {
    try {
      this.env.options.appPath = require(path.join(process.cwd(), 'bower.json')).appPath;
    } catch (e) {}
    this.env.options.appPath = this.env.options.appPath || this.config.app.path || 'app';
  }

  this.appPath = this.env.options.appPath;*/

  if (typeof this.env.options.coffee === 'undefined') {
    this.option('coffee', {
      desc: 'Generate CoffeeScript instead of JavaScript'
    });

    // attempt to detect if user is using CS or not
    // if cml arg provided, use that; else look for the existence of cs
    if (!this.options.coffee &&
      this.expandFiles(path.join(this.config.source.fullPath, '**/*.coffee'), {}).length > 0) {
      this.options.coffee = true;
    }

    this.env.options.coffee = this.options.coffee;
  }

  if (typeof this.env.options.minsafe === 'undefined') {
    this.option('minsafe', {
      desc: 'Generate AngularJS minification safe code'
    });
    this.env.options.minsafe = this.options.minsafe;
    args.push('--minsafe');
  }

  this.hookFor('angular-feature:common', {
    args: args,
    options: {
      options: {
        'config': this.config
      }
    }
  });

  this.hookFor('angular-feature:main', {
    args: args,
    options: {
      options: {
        'config': this.config
      }
    }
  });

  this.hookFor('angular-feature:controller', {
    args: args,
    options: {
      options: {
        'config': this.config
      }
    }
  });

  this.on('end', function () {
    this.installDependencies({
      skipInstall: this.options['skip-install'],
      callback: this._injectDependencies.bind(this)
    });

    var enabledComponents = [];

    if (this.resourceModule) {
      enabledComponents.push('angular-resource/angular-resource.js');
    }

    if (this.cookiesModule) {
      enabledComponents.push('angular-cookies/angular-cookies.js');
    }

    if (this.sanitizeModule) {
      enabledComponents.push('angular-sanitize/angular-sanitize.js');
    }

    if (this.routeModule) {
      enabledComponents.push('angular-route/angular-route.js');
    }

    this.invoke('karma:app', {
      options: {
        coffee: this.options.coffee,
        travis: true,
        'skip-install': this.options['skip-install'],
        components: [
          'angular/angular.js',
          'angular-mocks/angular-mocks.js'
        ].concat(enabledComponents)
      }
    });

    Config.rewriteFile({
      path: process.cwd(),
      file: 'karma.conf.js',
      map: {
        'app/bower_components': slash(path.join(this.config.vendor.fullPath, 'bower_components')),
        'app/scripts': this.config.source.fullPath,
        'test/': Feature.getFullPath(this.config.test.fullPath, '**') + '/'
      }
    });
  });

  this.pkg = require('../package.json');
};

util.inherits(Generator, yeoman.generators.Base);

Generator.prototype.welcome = function welcome() {
  // welcome message
  if (!this.options['skip-welcome-message']) {
    console.log(this.yeoman);
    console.log(
      'Out of the box I include Bootstrap and some AngularJS recommended modules.\n'
    );

    // Deprecation notice for minsafe
    if (this.options.minsafe) {
      console.warn(
        '\n** The --minsafe flag is being deprecated in 0.7.0 and removed in ' +
        '0.8.0. For more information, see ' +
        'https://github.com/yeoman/generator-angular#minification-safe. **\n'
      );
    }
  }
};

Generator.prototype.askForCompass = function askForCompass() {
  var cb = this.async();

  this.prompt([{
    type: 'confirm',
    name: 'compass',
    message: 'Would you like to use Sass (with Compass)?',
    default: true
  }], function (props) {
    this.compass = props.compass;

    cb();
  }.bind(this));
};

Generator.prototype.askForBootstrap = function askForBootstrap() {
  var compass = this.compass;
  var cb = this.async();

  this.prompt([{
    type: 'confirm',
    name: 'bootstrap',
    message: 'Would you like to include Twitter Bootstrap?',
    default: true
  }, {
    type: 'confirm',
    name: 'compassBootstrap',
    message: 'Would you like to use the Sass version of Twitter Bootstrap?',
    default: true,
    when: function (props) {
      return props.bootstrap && compass;
    }
  }], function (props) {
    this.bootstrap = props.bootstrap;
    this.compassBootstrap = props.compassBootstrap;

    cb();
  }.bind(this));
};

Generator.prototype.askForModules = function askForModules() {
  var cb = this.async();

  var prompts = [{
    type: 'checkbox',
    name: 'modules',
    message: 'Which modules would you like to include?',
    choices: [{
      value: 'resourceModule',
      name: 'angular-resource.js',
      checked: true
    }, {
      value: 'cookiesModule',
      name: 'angular-cookies.js',
      checked: true
    }, {
      value: 'sanitizeModule',
      name: 'angular-sanitize.js',
      checked: true
    }, {
      value: 'routeModule',
      name: 'angular-route.js',
      checked: true
    }]
  }];

  this.prompt(prompts, function (props) {
    var hasMod = function (mod) { return props.modules.indexOf(mod) !== -1; };
    this.resourceModule = hasMod('resourceModule');
    this.cookiesModule = hasMod('cookiesModule');
    this.sanitizeModule = hasMod('sanitizeModule');
    this.routeModule = hasMod('routeModule');

    var angMods = [];

    if (this.cookiesModule) {
      angMods.push("'ngCookies'");
    }

    if (this.resourceModule) {
      angMods.push("'ngResource'");
    }
    if (this.sanitizeModule) {
      angMods.push("'ngSanitize'");
    }
    if (this.routeModule) {
      angMods.push("'ngRoute'");
      this.env.options.ngRoute = true;
    }

    if (angMods.length) {
      this.env.options.angularDeps = "\n  " + angMods.join(",\n  ") +"\n";
    }

    cb();
  }.bind(this));
};

Generator.prototype.readIndex = function readIndex() {
  this.ngRoute = this.env.options.ngRoute;
  this.indexFile = this.engine(this.read('../../templates/common/index.html'), this);
};

Generator.prototype.bootstrapFiles = function bootstrapFiles() {
  var sass = this.compass;
  var mainFile = 'main.' + (sass ? 's' : '') + 'css';

  if (this.bootstrap && !sass) {
    var _path = Feature.getFullPath(this.config.fonts.fullPath, this.config.common.path);
    this.copy('fonts/glyphicons-halflings-regular.eot', path.join(_path, 'glyphicons-halflings-regular.eot'));
    this.copy('fonts/glyphicons-halflings-regular.ttf', path.join(_path, 'glyphicons-halflings-regular.ttf'));
    this.copy('fonts/glyphicons-halflings-regular.svg', path.join(_path, 'glyphicons-halflings-regular.svg'));
    this.copy('fonts/glyphicons-halflings-regular.woff', path.join(_path, 'glyphicons-halflings-regular.woff'));
  }

  this.copy('styles/' + mainFile, path.join(Feature.getFullPath(this.config.styles.fullPath, this.config.common.path), mainFile));
};

Generator.prototype.appJs = function appJs() {
  this.indexFile = this.appendFiles({
    html: this.indexFile,
    fileType: 'js',
    optimizedPath: slash(path.join(this.config.source.path, 'scripts.js')),
    sourceFileList: [
                      slash(path.join(this.config.source.path, 'app.js')),
                      slash(path.join(Feature.getFullPath(this.config.controller.appPath, this.config.common.path), 'main.js'))
                    ],
    searchPath: ['.tmp', this.config.app.path]
  });
};

Generator.prototype.createIndexHtml = function createIndexHtml() {
  this.indexFile = this.indexFile.replace(/&apos;/g, "'");
  this.write(path.join(this.config.app.path, 'index.html'), this.indexFile);
};

Generator.prototype.packageFiles = function () {
  this.coffee = this.env.options.coffee;
  this.template('../../templates/common/_bower.json', 'bower.json');
  this.template('../../templates/common/_package.json', 'package.json');
  this.template('../../templates/common/Gruntfile.js', 'Gruntfile.js');
};

Generator.prototype.imageFiles = function () {
  this.sourceRoot(path.join(__dirname, 'templates'));
  this.directory('images', Feature.getFullPath(this.config.images.fullPath, this.config.common.path), true);
};

Generator.prototype._injectDependencies = function _injectDependencies() {
  var howToInstall =
    '\nAfter running `npm install & bower install`, inject your front end dependencies into' +
    '\nyour HTML by running:' +
    '\n' +
    chalk.yellow.bold('\n  grunt bower-install');

  if (this.options['skip-install']) {
    console.log(howToInstall);
  } else {
    wiredep({
      directory: path.join(this.config.vendor.fullPath, 'bower_components'),
      bowerJson: JSON.parse(fs.readFileSync('./bower.json')),
      ignorePath: this.config.app.path,
      htmlFile: path.join(this.config.app.path, 'index.html'),
      cssPattern: '<link rel="stylesheet" href="{{filePath}}">'
    });
  }
};


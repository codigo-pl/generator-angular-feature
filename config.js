'use strict';
var fs = require('fs');
var util = require('util');
var path = require('path');
var slash = require('slash');

module.exports = {
  getConfig: getConfig,
  rewriteFile: rewriteFile
};

function getConfig(args) {
  var fullPath = path.join(args.path, args.file);
  var config = null;

  if (fs.existsSync(fullPath))
    config = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  else
    config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/templates/config-component.json'), 'utf8'));

  calculateFullPath(config, config['structure'], undefined, config.structure.type);
  calculateAppPath(config, config['structure'].app, undefined, config.structure.type);

  return config;
}

function rewriteFile(args) {
  args.path = args.path || process.cwd();
  var fullPath = path.join(args.path, args.file);
  var file = fs.readFileSync(fullPath, 'utf8');

  for (var key in args.map)
    file = file.replace(new RegExp(escapeRegExp(key), 'g'), args.map[key]);

  fs.writeFileSync(fullPath, file);
};

function calculateFullPath(rootNode, node, nodePath, type) {
  if (typeof(node) == 'object')
    for (var key in node) {
      if (typeof node[key].path !== 'undefined') {
        if (!rootNode[key])
          rootNode[key] = {};
        rootNode[key].path = slash(substitutePath(node, key));
        rootNode[key].fullPath = slash(path.join((nodePath ? nodePath : ''), rootNode[key].path));
        if (type != 'feature') {
          rootNode[key].gruntPath = rootNode[key].fullPath;
        }
        calculateFullPath(rootNode, node[key], rootNode[key].fullPath, type);
      }
    }
}

function calculateAppPath(rootNode, node, nodePath, type) {
  if (typeof(node) == 'object')
    for (var key in node) {
      if (typeof node[key].path !== 'undefined') {
        if (!rootNode[key])
          rootNode[key] = {};
        var _path = substitutePath(node, key);
        rootNode[key].appPath = slash(path.join((nodePath ? nodePath : ''), _path));
        if (type == 'feature') {
            rootNode[key].gruntPath = rootNode[key].appPath
        }
        calculateAppPath(rootNode, node[key], rootNode[key].appPath, type);
      }
    }
}

function substitutePath(node, key) {
  var subPath = node[key].path.match(/\[.+\]/);
  if (subPath != null) {
    var subKeyName = subPath[0].replace(/\[/, '').replace(/\]/, '');
    return node[key].path.replace(subPath[0], substitutePath(node, subKeyName));
  }
  else {
    return node[key].path;
  }
}

function escapeRegExp (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

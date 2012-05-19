/*jslint white: true, forin: false, node: true, indent: 4 */
(function (module) {
    "use strict";

    var fs = require('fs');

    function getHome() {
        return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    }

    function merge(result, content) {
        var keys = Object.keys(content);

        return keys.forEach(function(key){
            result[key] = content[key];
        });
    }

    function loadConfigFile(config, result, cb) {
        var matched = config.match(/(~)?([^#]+)(?:#(\w+))?/);

        if (!matched) {
            return cb(new Error("not a valid file name " + config));
        }

        var home = matched[1],
            file = matched[2],
            qualifier = matched[3];

        if (home) {
            file = getHome() + file;
        }

        return fs.readFile('file', "utf-8", function (err, content) {
            if (err) {
                return cb(err);
            }

            var parsed = JSON.parse(content);

            if (qualifier) {
                parsed = parsed[qualifier];
            }

            return cb(undefined, merge(result, content));
        });
    }

    function loadConfigs(args, result, cb) {
        if (!args.length) {
            return cb(undefined, result);
        }

        var config = args.pop();

        if (Object.prototype.toString.call(config) == '[object String]') {
            return loadConfigFile(config, result, function(err, result) {
                if (err) {
                    return cb(err, result);
                }

                return loadConfigs(args, result, cb);
            });
        }

        var keys = Object.keys(config);

        return keys.forEach(function(key){
            var variable = config[key];

            result[key] = process.env[variable];
        });
    }

    module.exports = function() {
        var args = Array.prototype.slice.call(arguments),
            cb = args.pop();

        return loadConfigs(args, {}, cb);
    };
})(module);

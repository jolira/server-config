/*jslint white: true, forin: false, node: true, indent: 4 */
(function (module) {
    "use strict";

    var fs = require('fs');

    function getHome() {
        return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    }

    function loadConfigFile(config, cb) {
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

        return fs.readFile(file, "utf-8", function (err, content) {
            if (err) {
                return cb(); // ignore readfile errors
            }

            var parsed = JSON.parse(content);

            if (qualifier) {
                parsed = parsed[qualifier];
            }

            return cb(undefined, parsed);
        });
    }

    function merge(result, content) {
        var keys = Object.keys(content);

        keys.forEach(function(key){
            var value = content[key];

            if (value) {
                result[key] = value;
            }
        });

        return result;
    }

    function loadConfigs(args, result, cb) {
        if (!args.length) {
            return cb(undefined, result);
        }

        var config = args.shift();

        if (Object.prototype.toString.call(config) == '[object String]') {
            return loadConfigFile(config, function(err, content) {
                if (err) {
                    return cb(err, result);
                }

                if (content) {
                    result = merge(result, content);
                }

                return loadConfigs(args, result, cb);
            });
        }

        return loadConfigs(args, merge(result, config), cb);
    }

    module.exports = function() {
        var args = Array.prototype.slice.call(arguments),
            cb = args.pop();

        return loadConfigs(args, {}, cb);
    };
})(module);

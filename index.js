/*jslint white: true, forin: false, node: true, indent: 4 */
(function (module) {
    "use strict";

    var fs = require('fs'),
        Batch = require('batch'),
        http = require('http');

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

    function merge(result, content, cb) {
        var batch = new Batch(),
            keys = Object.keys(content);

        keys.forEach(function (key) {
            var value = content[key];

            if (value) {
                if (value.__isEC2InstanceData__) {
                    return batch.push(function (done) {
                        value(function (err, value) {
                            if (err) {
                                return done(err);
                            }

                            result[key] = value;
                            return done();
                        });
                    });
                }

                return result[key] = value;
            }
        });

        return batch.end(function (err) {
            return cb(err, result);
        });
    }

    function loadConfigs(args, result, cb) {
        if (!args.length) {
            return cb(undefined, result);
        }

        var config = args.shift();

        if (Object.prototype.toString.call(config) == '[object String]') {
            return loadConfigFile(config, function (err, content) {
                if (err) {
                    return cb(err, result);
                }

                if (content) {
                    return merge(result, content, function (result) {
                        if (err) {
                            return cb(err, result);
                        }

                        return loadConfigs(args, result, cb);
                    });
                }

                return loadConfigs(args, result, cb);
            });
        }

        return loadConfigs(args, merge(result, config), cb);
    }

    module.exports = function () {
        var args = Array.prototype.slice.call(arguments),
            cb = args.pop();

        return loadConfigs(args, {}, cb);
    };

    // http://169.254.169.254/latest/meta-data/instance-id
    module.exports.ec2instance = function (key) {
        var value = function (cb) {
            return http.request({
                host:'169.254.169.254',
                port:80,
                path:'/latest/' + key
            },function (res) {
                var data = "";

                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    data += chunk;
                });
                return res.on('end', function () {
                    return cb(undefined, data);
                });
            }).on('error', function (e) {
                    return cb(e);
                });
        };

        value.__isEC2InstanceData__ = true;

        return value;
    };
})(module);

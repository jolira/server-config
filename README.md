server-config
=============

One of the fundamental problems of software development is keeping configuration information for
different environments. Most organizations distinguish environments such as DEV, QA, Staging, and
Production.

The configuration approach promoted by this little utility makes it uncesseary to keep an elaborate
build process supporting these different enviroments. Using this utility, configuration information
can be stored in three different locations:

* "_embedded_": Defaults can be embedded with the component, such as a ``defaults.json`` file
  next to the ``package.json`` file. This file should contain all the default settings.
* "_host specific_": The "_embedded_" defaults can be overriden by host specific configuration
  settings either defined in a configuration file in the user home-directory or using
  enviornment variables (like one would do for services such as Heroku).

# Example

```
var path = require('path'),
    loadConfig = require('server-config'),
    embedded = path.join(__dirname, 'defaults.json'),
    host = '~/.defaults.json#myapp',
    env = {
        mongdb: MONGODB,
        seaPort: SEA_PORT
    };

    loadConfig(embedded, host, env, function(err, config) {
        if (err) {
          throw err();
        }
    });
```

The example will first load JSON from the ``embedded`` file and than the file identified by ``host``.
From the host file it will extract the ``myapp`` entry and merge it into the data-structure
previously loaded from ``embedded``. Lastly it will process the ``env`` structure and override
any matching value in the existing config and merge the onces that do not exist.

Let's assume that this is the content of the ``embedded`` file:

```
{
  "httpPort": 80,
  "httpsPort": 443,
  "seaPort": 9090
}
```

Let's further assume the ``host`` file contains:

```
{
  "myapp": {
    "httpPort": 3000,
    "mongodb": "mongodb://localhost/testbase",
    "welcomeMsg: "Hellow World!"
  }
}
```

Lastly, let's assume that there is one evnironment variable defined:

```
export SEA_PORT=2000
```

If all this is the case, the resulting config information returned by the call above would be:

```
{
  "httpPort": 3000,
  "httpsPort": 443,
  "welcomeMsg: "Hellow World!",
  "seaPort": 2000
}
```

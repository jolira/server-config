server-config
=============

One of the fundamental problems of software development is keeping configuration information for
different environments. Most organizations distinguish environments such as DEV, QA, Staging, and
Production.

The configuration approach promoted by this little utility makes it uncesseary to keep an elaborate
build process supporting these different enviroments. Using this utility, configuration information
can be stored in embedded defaults that can be overriden using a configuration file and
environment variables.


# Example

```
var path = require('path'),
    loadConfig = require('server-config'),
    embedded = {
      "httpPort": 80,
      "httpsPort": 443,
      "seaPort": 9090
    },
    host = '~/.defaults.json#myapp',
    env = {
        mongdb: process.env["MONGODB"],
        seaPort: process.env["SEA_PORT"]
    };

    loadConfig(embedded, host, env, function(err, config) {
        if (err) {
          throw err();
        }
    });
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

# jsForceInAction

This project is an example usage of the jsForce library. 

##setup
Install node, grunt-cli, and bower.

https://nodejs.org/en/
http://gruntjs.com/getting-started
http://bower.io/#install-bower

You will also need redis, a local key value store

http://redis.io/download

After installation start redis, the default port is used in the application.
```
<Install Location>/redis/current/src/redis-server
```

Run npm install and bower update
```
cd jsForceInAction
npm install
bower update
```
 
You will need to create a connected app for OAuth credentials for Salesforce. 
See this blog post for instructions on getting that information.
https://developer.salesforce.com/blogs/developer-relations/2015/08/creating-jquery-application-using-rest-api.html

Copy the clientId and secret and populate the values  
```server/config/environment/development.json```
under the app.key and app.secret properties.

Set two environment variables.  Note that you will need to update the NODE_PATH to match your local install directory.
```
export NODE_PATH=development
export NODE_PATH=/Users/gbockus/local:/Users/gbockus/local/lib/node_modules:/Users/gbockus/github/jsForceInAction/server
```

Execute the grunt serve command
```
grunt serve
```

Open a browser to https://localhost:21000

## More Info
The part of this application that relates to jsforce can be found in the following files:
```
server/services/SalesforceService.js
server/services/SalesforceService.spec.js
```

The SalesforceService.js file is where jsforce is being integrated with bluebird 
promised and used to interact with Salesforce.
The SalesforceService.spec.js file is where the service function are being tested.

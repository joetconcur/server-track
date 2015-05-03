#ServerTrack

##Description
Server Tracking Service

## Record loads for a server
Send a POST request to the server, `http://localhost:8090/servertrack/loads`
### JSON Schema of a load
```json
{
    "title": "Load",
    "type": "object",
    "properties": {
        "serverName": { "type": "string", "minLength": 1 },
		"cpu": { "type": "number", "minimum": 0, "maximum": 100 },
		"ram": { "type": "number", "minimum": 0, "maximum": 100 }
	},
	"required": ["serverName", "cpu", "ram"]
}
```

Note that cpu and ram values are percentage values.

### Sample POST request
```json
{
    "serverName": "server1",
    "cpu": 10,
    "ram": 5
}
```

## Display loads for a given server
Send a GET request to the server, `http://localhost:8090/servertrack/loads/servername`

##Server setup
- Install [Node.js](https://nodejs.org/)
- Environment variables

| Env Varriable | Default Value |
|---------------|---------------|
| SERVER_TRACK_PORT | 8090 |

- To run tests, run `npm test`

- To start the service, run
    1. `npm install`
    2. `node app.js`

- For CI, run `grunt test` to verify the build

##TODO
- Persist the data so that we can retrieve old data even when the server goes down.
- Load tests
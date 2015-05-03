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

Successful request returns the following response:
```json
{
    "message": "success"
}
```

## Display loads for a given server
Send a GET request to the server, `http://localhost:8090/servertrack/loads/servername`

This returns data (if it has any) for the given server:
- A list of the average load values for the last 60 minutes broken down by minute
- A list of the average load values for the last 24 hours broken down by hour

### Sample GET response
```json
{
	"serverName" : "server1",
	"avgLast60Minutes" : {
		"1" : {
			"avgCPU" : 15,
			"avgRAM" : 10
		}
	},
	"avgLast24Hours" : {
		"1" : {
			"avgCPU" : 15,
			"avgRAM" : 10
		},
		"2" : {
			"avgCPU" : 20,
			"avgRAM" : 15
		}
	}
}
```

##Server setup
- Install [Node.js](https://nodejs.org/)
- Environment variables

| Env Varriable | Default Value |
|---------------|---------------|
| SERVER_TRACK_PORT | 8090 |

- To run tests, run `npm test`

- To get code coverage, run `npm run coverage`

- To start the service, run
    1. `npm install`
    2. `node app.js`

- For CI, run `grunt test` to verify the build

##TODO
- Further reduce the size of the filtered loads used to query by time.
- Use async for filter and reduce.
- Load tests
- Persist the data so that we can retrieve old data even when the server goes down.

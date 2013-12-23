# zero-s3

receive upload messages via zmq push/pull

## Config

```
// .zero-s3rc:
{
	// knox or faulty
	"clientType": "knox",

	// list of message senders to connect to (pull side of zmq push/pull socket)
	"fileLoggers": [
		"tcp://127.0.0.1:5003"
	],

	// how many times to try an upload before giving up
	"uploadAttempts": 5
}
```
```
// .s3shieldrc:

{
	// aws config
	"aws": {
		"region": "us-standard",
		"accessKeyId": "your access key",
		"secretAccessKey": "your secret"
	},

	// see lru-cache for all the options
	// used by knox client provider to catch a client per bucket
	"lru": {
		"max": 100,
		"maxAge": 360000
	},

	// if enabled will gzip a message or a file to local file before uploading

	"gzip": {
		"enabled": false,

		// see http://nodejs.org/api/zlib.html#zlib_options
		"options": undefined,

		// if enabled the unzipped file will be deleted after upload (but not the zipped one)
		// this only applies to file messages
		"deleteFileAfterUpload": false
	},


	// in put() functions where a string or an object is provided (and not a buffer) this enconding
	// will be used when turning the data into a buffer
	"uploadEncoding": "utf8",

	// "faulty s3 client is used for testing"
	"faulty": {

		// how many time should I fail
		"failures": 3
	}
}
```
see [RC module](https://github.com/dominictarr/rc) for further details

### Message format
```
	{
		"bucket": "name of the bucket",
		"key": "path in the bucket",
		"data": "some data to write",
		"url": "instead of embedding the data in the message, zero-s3 will issue an http request to get this data and upload to s3 - not implemented fully yet"
		"path": "instead of embedding the data in the message, zero-s3 will upload a local file to s3"
	}
```
***if both url and data exist in the message, there is no guarentee which will take effect***
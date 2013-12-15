# zero-s3

receive upload messages via zmq push/pull

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
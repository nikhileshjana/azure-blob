curl --location --request GET 'http://localhost:3000/partial-download/<container_name>/<blob_name>' \
--header 'startbyte: 1' \
--header 'offset: 5000'

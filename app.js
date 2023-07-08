const http = require('http');


http.createServer((req,res)=>{
	res.write('Hey Im balveer learning nginx');
	res.end();
}).listen(3000);


console.log('server started on port 3000');

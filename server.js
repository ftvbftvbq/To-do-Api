var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

var todos = [{
	id: 1,
	description: "准备购物",
	completed: false
},{
	id: 2,
	description: "准备吃午饭",
	completed: false
}

]

app.get('./', function(req, res){

	res.send("看这里！");

});

app.get('/todos', function(req, res){
	res.json(todos);
});

app.listen(PORT, function(){
	console.log('Express start at '+ PORT + '!');
});
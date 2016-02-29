var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [
// {
// 	id: 1,
// 	description: "准备购物",
// 	completed: false
// },{
// 	id: 2,
// 	description: "准备吃午饭",
// 	completed: false
// }

];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('./', function(req, res){

	res.send("看这里！");

});

app.get('/todos', function(req, res){
	res.json(todos);
});



app.get('/todos/:id', function(req, res){
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	// todos.forEach(function(todo) {
	// 	if (todoId === todo.id){
	// 		matchedTodo = todo;
	// 	}
	// });

	if (matchedTodo){

			res.json(matchedTodo);
		}else{
			res.status(404).send();
		}

});

//Post

app.post('/todos', function(req, res){
	// var body = req.body;
	var body = _.pick(req.body, 'description', 'completed');

	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
		return res.status(400).send();
	}

	body.description =  body.description.trim();

	 body.id =  todoNextId++;

	 todos.push(body);
	 res.json(body);

	});

app.listen(PORT, function(){
	console.log('Express start at '+ PORT + '!');
});
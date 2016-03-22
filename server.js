var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db =  require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

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

//get /todos/
// app.get('/todos', function (req, res){
// 	res.json(todos);
// });


//GET /todos?completed=false&q=work
app.get('/todos',middleware.requireAuthentication,function (req, res){

var query = req.query;
var where = {
	userId: req.user.get('id')
};

if (query.hasOwnProperty('completed') && query.completed === 'true') {
	where.completed = true;
}else if (query.hasOwnProperty('completed') && query.completed === 'false') {
	where.completed = false;
}

if (query.hasOwnProperty('q') && query.q.length > 0){
		where.description = {
			$like: '%' + query.q + '%'
		};
	}
	db.todo.findAll({
		where: where
	}).then (function (todos) {
		res.json(todos);
	}, function (e){
		res.status(500).send();
	});
});

// 	var queryParams = req.query;
// 	var filteredTodos = todos;



// 	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
// 		filteredTodos = _.where(filteredTodos, {completed: true});

// 	}else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
// 		filteredTodos = _.where(filteredTodos, {completed: false});
// 	}


// 	if (queryParams.hasOwnProperty('q') && queryParams.q.length >0){
// 		filteredTodos = _.filter(filteredTodos, function (todo) {
// 			return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
// 		});
// 	}
// 	res.json(filteredTodos);
// });


//GET /todos/:id 
app.get('/todos/:id',middleware.requireAuthentication,function (req, res){
	var todoId = parseInt(req.params.id, 10);

	db.todo.findOne({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	}).then(function (todo) {
		if (!!todo) {
				res.json(todo.toJSON());
			}else {
				res.status(404).send();
			}
		}, function (e){
			res.status(500).send();
		});	
	});
	// var matchedTodo = _.findWhere(todos, {id: todoId});

	// // todos.forEach(function(todo) {
	// // 	if (todoId === todo.id){
	// // 		matchedTodo = todo;
	// // 	}
	// // });

	// if (matchedTodo){

	// 		res.json(matchedTodo);
	// 	}else{
	// 		res.status(404).send();
	// 	}



//Post
app.post('/todos',middleware.requireAuthentication,function (req, res){
	// var body = req.body;
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function (todo){
		req.user.addTodo(todo).then(function () {
				return todo.reload();
			}).then(function (todo) {
				res.json(todo.toJSON());
			});
		}, function (e){
			res.status(400).json(e);
		});
	});

	// if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
	// 	return res.status(400).send();
	// }

	// body.description =  body.description.trim();

	//  body.id =  todoNextId++;

	//  todos.push(body);
	//  res.json(body);



//Delete 

app.delete('/todos/:id',middleware.requireAuthentication,function (req, res){
	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function (rowsDeleted) {
		if (rowsDeleted === 0){
			res.status(404).json({
				error: 'no data'
			});
		}else {
			res.status(204).send();
		}

	}, function(){
		res.status(500).send();
	});
});
// 	var matchedTodo = _.findWhere(todos, {id: todoId});
// 	if (!matchedTodo){
// 		res.status(404).json({"error": "no todo found with that id"});
// 	}else{
// 		todos = _.without(todos, matchedTodo);
// 		res.json(matchedTodo);
// 	}
// });


//PUT
app.put('/todos/:id',middleware.requireAuthentication,function(req, res){
	var todoId = parseInt(req.params.id,  10);
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};

	if (body.hasOwnProperty('completed')) {

		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {

		attributes.description = body.description;
	}

	db.todo.findOne({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	}).then(function (todo) {
		if (todo) {
			todo.update(attributes).then(function(todo){
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).send();
			});
		} else {
			res.status(404).send();
		}

	}, function(){
	res.status(500).send();
	});

});
	// var todoId = parseInt(req.params.id, 10);
	// var matchedTodo = _.findWhere(todos, {id: todoId});
	// var body = _.pick(req.body, 'description', 'completed');
	// var validAttributes = {};

	// if (!matchedTodo){
	// 	res.status(404).send();
	// }
	// if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
	// 	validAttributes.completed =  body.completed;
	// }else if (body.hasOwenProperty('completed')){
	// 	return res.status(404).send();
	// }

	// if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length >0){
	// 	validAttributes.description =  body.description;
	// }else if (body.hasOwenProperty('description')){
	// 	return res.status(404).send();
	// }

	// _.extend(matchedTodo, validAttributes);
	// res.json(matchedTodo);


//  /users/
app.post('/users', function (req, res) {
	var body = _.pick(req.body,'email','password');

	db.user.create(body).then(function (user) {
		res.json(user.toPublicJSON());
	}, function (e) {
		res.status(400).json(e);
	});
});


//users/login
app.post('/users/login', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then(function (user) {
		res.header('Auth', user.generateToken('authentication')).json(user.toPublicJSON());
	}, function() {
		res.status(401).send();
	});
});

// {force: true}
//middleWare
db.sequelize.sync({force: true}).then(function() {
	app.listen(PORT, function(){
		console.log('Express start at '+ PORT + '!');
	});
});	
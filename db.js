var Sequelize =  require('Sequelize');

var env = process.env.NODE_ENV || 'development';

if (env === 'production'){
	var sequelize =  new Sequelize(process.env.DATABASE_URL), {
		dialect: 'postgres'
	});

}else{
	sequelize = new Sequelize(undefined, undefined, undefined, {
		'dialect' :'sqlite',
		'storage' : __dirname + '/data/todo-api.sqlite'
	});
}

var db = {};

db.todo = sequelize.import(__dirname + '/models/todo.js');

db.sequelize = sequelize;

db.Sequelize = Sequelize;

module.exports = db;
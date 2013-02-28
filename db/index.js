var mongo = require('mongodb');

var mongoServer = mongo.Server;
var mongoDb = mongo.Db;
var BSON = mongo.BSONPure;

var dbServer = new mongoServer('localhost', 27017, {auto_reconnect: true});

var db = new mongoDb('nodetemp', dbServer);

db.open(function(err, db){
	if(!err){
		console.log('connected to mongodb');
		db.collection('temps', {safe:true}, function(err, collection){
			if(err){
				console.log('collection doesnt exist!');
			}
		});
	}
	else{
		console.log(err);
	}
});

exports.addEntry = function(data){
	var entry = data;
	console.log("adding entry"  + JSON.stringify(entry));
	db.collection('temps', function(err, collection){
		collection.insert(entry, {safe:true}, function(err, result){
			if(result){
				return result;
			}
		});
	});
};

exports.newTherm = function(data){
	var entry = data;
	console.log("adding new Thermostat value:" + JSON.stringify(entry));
	db.collection('therms', function(err, collection){
		collection.insert(entry, {safe:true}, function(err, result){
			if(result){
				return result;
			}
		});
	});
};

exports.allRecords = function(socket){
	
	var gitems = [];
	var gchanges = [];
	
	db.collection('temps', function(err, collection){
		collection.find().toArray(function(err, items){
			gitems = items;
			getChanges();
		});
	});

	function getChanges(){
		db.collection('changes', function(err, collection){
			collection.find().toArray(function(err, changes){
				gchanges = changes;
				sendData();
			});
		});
	}
	/*items = [
			{'temp': 68.0, 'time': 'Feb 25 2013 09:25:38 GMT-0500 (EST)'},
			{'temp': 69.1, 'time': 'Feb 25 2013 09:26:38 GMT-0500 (EST)'},
			{'temp': 69.1, 'time': 'Feb 25 2013 09:27:38 GMT-0500 (EST)'},
			{'temp': 68.0, 'time': 'Feb 25 2013 09:28:38 GMT-0500 (EST)'},
			{'temp': 68.0, 'time': 'Feb 25 2013 09:29:38 GMT-0500 (EST)'},
			{'temp': 67.0, 'time': 'Feb 25 2013 09:30:38 GMT-0500 (EST)'},
			{'temp': 66.0, 'time': 'Feb 25 2013 09:30:38 GMT-0500 (EST)'}
		];

	changes = [
			{'temp': 68.0, 'time': 'Feb 25 2013 09:25:38 GMT-0500 (EST)'},
			{'temp': 64.0, 'time': 'Feb 25 2013 09:28:38 GMT-0500 (EST)'}
		];*/
	function sendData(){
		socket.emit('newData', {'items': gitems, 'changes': gchanges});
	}
};


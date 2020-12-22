const mongoose = require("mongoose");

module.exports = {
	connect: function() {
		let db = mongoose.connect("mongodb://admin:admin@mycluster-shard-00-00.kwthm.mongodb.net:27017,mycluster-shard-00-01.kwthm.mongodb.net:27017,mycluster-shard-00-02.kwthm.mongodb.net:27017/internship?ssl=true&replicaSet=atlas-8vg6bj-shard-0&authSource=admin&retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        }).then(() => {
        	console.log("Database connected");
        });
        mongoose.Promise = global.Promise;
	}
}
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let pageSchema = Schema({
	name: {
		type: String, 
		required: true,
	},
    content: {
        type: String
    },
	incoming: [],
	outgoing: [],
    pagerank: {
        type: Number
    }
});

module.exports = mongoose.model("Page", pageSchema);
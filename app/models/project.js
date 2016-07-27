import mongoose from 'mongoose';
const projectSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	clients: [String],
	managers: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Employee'
	}],
	employees: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Employee'
	}]
});

projectSchema.index({name: "text"});

mongoose.model('Project', projectSchema);


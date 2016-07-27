import mongoose from 'mongoose';
require('./project');
let Project = mongoose.model('Project');
const employeeSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	emailId: {
		type: String,
		required: true,
		unique: true
	},
	role: {
		type: String,
		required: true
	},
	projects: [Project],
	manager: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Employee'
	},
	subOrdinates: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Employee'
	}]
});

mongoose.model('Employee', employeeSchema);

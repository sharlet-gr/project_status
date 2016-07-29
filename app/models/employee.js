import mongoose from 'mongoose';
const employeeSchema = new mongoose.Schema({
	name: {
		type: String,
	},
	googleId: String,
	googleToken: String,
	emailId: {
		type: String,
		required: true,
		unique: true
	},
	role: {
		type: String,
		required: true,
		enum: ['Admin', 'Manager', 'Employee']
	},
	projects: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Project'
	}],
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


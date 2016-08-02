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
	admin: {
		type: Boolean,
		default: false
	},
	projects: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Project'
	}]
});

mongoose.model('Employee', employeeSchema);


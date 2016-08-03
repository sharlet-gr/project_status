import mongoose from 'mongoose';
const taskSchema = new mongoose.Schema({
	employee: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Employee'
		required: true
	},
	day: {
		type: Date,
		required: true
	}
	inTime: String,
	outTime: String,
	breakTime: String,
	workHours: String,
	projects: [{
		project: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Project'
		}
		billableTime: String,
		billableTask: String,
		nonBillableTime: String,
		nonBillableTask: String
	}]
});

mongoose.model('Task', taskSchema);


import mongoose from 'mongoose';
const projectSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	clients: [String],
	members: [{
		_id: false,
		person: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Employee'
		},
		role: {
			type: String,
			enum: ['Manager', 'Employee']
		}
	}]
});

projectSchema.index({name: "text"});

mongoose.model('Project', projectSchema);


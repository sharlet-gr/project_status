let mongoose=require('mongoose');
require('../models/employee');
let Employee = mongoose.model('Employee');

module.exports = (app, passport) => {

	//Admin posts a new employee
	app.post('/employees', (req,res) => {
		Employee.findOne({emailId: req.body.emailId}, (err, employee) => {
			if(err)
				return res.json(err);
			if(employee)
				return res.json({"message":"This employee already exists!"});
			let newEmployee = new Employee(req.body);
			newEmployee.save((err, employee) => {
				if(err)
					return res.json(err);
				return res.json(employee);
			});
		});
	});

	//View list of employees
	app.get('/employees', (req,res) => {
		Employee.find({},{name:1, emailId:1, role:1},{sort: {role: -1, name: 1}},(err, employees) => {
			if(err)
				return res.json(err);
			return res.json(employees);
		});
	});

	//View a particular employee
	app.get('/employees/:employeeId', (req,res) => {
		Employee.findOne({_id: req.params.employeeId}, (err, employee) => {
			if(err)
				return res.json(err);
			if(!employee)
				return res.json({"message":"This employee does not exist!"});
			return res.json(employee);
		});
	});

	//Delete a particular employee
	app.delete('/employees/:employeeId', (req, res) => {
		Employee.remove({_id: req.params.employeeId}, (err, obj) => {
			if(err)
				return res.json(err);
			if(obj.result.n === 0) 
				return res.json({"message":"This employee does not exist"});
			res.json({"message":"Deleted Successfully!"});
		});
	});
}
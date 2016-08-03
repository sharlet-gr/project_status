let mongoose=require('mongoose');
require('../models/employee');
let Employee = mongoose.model('Employee');
require('../models/project');
let Project = mongoose.model('Project');

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
		//Only allow admin to view the employees
		if(!req.user)
			return res.json({"message":"You are not logged in"});
		if(req.user.admin == false)
			return res.json({"message":"You are not authorized to perform this action"});
		//If user is an admin
		Employee.find({},{name:1, emailId:1},(err, employees) => {
			if(err)
				return res.json(err);
			return res.json(employees);
		});	
	});

	//View a particular employee
	app.get('/employees/:employeeId', (req,res) => {
		if(!req.user)
			return res.json({"message":"You are not logged in"});
		if(req.user.admin == false)
			return res.json({"message":"You are not authorized to perform this action"});
		//If user is an admin
		Employee.findOne({_id: req.params.employeeId}, (err, employee) => {
			if(err)
				return res.json(err);
			if(!employee)
				return res.json({"message":"This employee does not exist!"});
			return res.json(employee);
		});	
	});

	//Modify data of an employee
	app.patch('/employees/:employeeId', (req,res) => {
		Employee.findOne({_id: req.params.employeeId}, (err, employee) => {
			if(err)
				return res.json(err);
			//If employee emailId is modified
			if(req.body.emailId!=undefined && req.body.emailId!=employee.emailId){
				employee.emailId = req.body.emailId;
				employee.googleId = null;
				employee.googleToken = null;
			}
			//If admin control is modified
			if(req.body.admin!=undefined && req.body.admin!=employee.admin)
				employee.admin = req.body.admin;
			//If projects are modified
			if(req.body.projects!=employee.projects){
				if(req.body.projects){
					let length = employee.projects.length;
					for(let i=0; i<length; i++){
						if(!checkAvailability(req.body.projects, employee.projects[i].toString())){
							//Remove member from project model for project that has been removed
							Project.update({_id: employee.projects[i]}, 
								{$pull: {members: {person: req.params.employeeId}}}, (err) => {
									if(err)
										return (err);
							});
						}
					}
					length = req.body.projects.length;
					for(let i=0;i<length;i++){
						let member = {person: req.params.employeeId, role: req.body.role[i]};
						Project.findByIdAndUpdate(req.body.projects[i], {$addToSet: {members: member}}, 
							(err, project) => {
							if(err)
								return err;
							for(let j=0; j<project.members.length; j++){
								//Condition to check whether the member existed in project with a different role
								//If so, remove that document from project model
								if(project.members[j].person == member.person && project.members[j].role != member.role){	
									Project.findByIdAndUpdate(req.body.projects[i], 
										{$pull: {members: project.members[j]}},(err, project) => {
											if(err)
												res.json(err);
									});
									break;
								}
							}
						});
					} 
				}
				else{
					let length = employee.projects.length;
					for(let i=0; i<length; i++){
						//Remove member from project model for project that has been removed
						Project.update({_id: employee.projects[i]}, 
							{$pull: {members: {person: req.params.employeeId}}}, (err) => {
								if(err)
									return (err);
						});
					}
				}	
				employee.projects = req.body.projects;		
			}
			employee.save();
			res.json(employee);
		});
	});

	//Delete a particular employee
	app.delete('/employees/:employeeId', (req, res) => {
		Employee.remove({_id: req.params.employeeId}, (err) => {
			if(err)
				return res.json(err);
			res.json({"message":"Deleted Successfully!"});
		});
	});
}

//Function to check if val exists in array arr
function checkAvailability(arr, val){
	return arr.some((arrVal) => {
		return val === arrVal;
	});
}
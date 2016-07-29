let mongoose=require('mongoose');
require('../models/project');
let Project = mongoose.model('Project');
require('../models/employee');
let Employee = mongoose.model('Employee');

module.exports = (app, passport) => {
	
	//Admin posts a project
	app.post('/projects', (req,res) => {
		if(!req.user)
			return res.json({"message":"You are not logged in"});
		if(req.user.role!="Admin")
			return res.json({"message":"You are not authorized to perform this action"});
		Project.findOne({$text: {$search: req.body.name}}, (err,project) => {
			if(err)
				return res.json(err);

			//Do not save if the project already exists
			if(project)
				return res.json({"message":"This project already exists!"});
			
			//Replace space after commas & then split at comma
			req.body.clients = req.body.clients.replace(/,\s/g, ',').split(",");
			let newProject = new Project(req.body);
			newProject.save((err, project) => {
				if(err)
					return res.json(err);
				return res.json(project);
			});
		});
	});

	//View the list of projects
	app.get('/projects', (req,res) => {
		if(!req.user)
			return res.json({"message":"You are not logged in"});
		if(req.user.role=="Employee")
			return res.json({"message":"You are not authorized to perform this action"});
		
		//If user is a manager, only display the alloted projects
		if(req.user.role=="Manager"){
			Employee.findOne({_id:req.user._id}, (err,employee) => {
				if(err)
					return res.json(err);
				employee.populate('projects',(err,employee) => {
					if(err)
						return err;
					return res.json(employee.projects);
				});
			});
		}
		//If user is an admin, display all the projects
		else
		{
			Project.find({},(err, projects) => {
				if(err)
					return res.json(err);
				return res.json(projects);
			});
		}
	});

	//Modify a project
	app.patch('/projects/:projectId', (req,res) => {
		Project.findOne({_id: req.params.projectId}, (err,project) => {
			if(err)
				return res.json(err);
			if(!project)
				return res.json({"message":"This project does not exist"});
			
			//If project name is modified
			if(req.body.name!=undefined)
				project.name = req.body.name;

			//If clients are modified
			if(req.body.clients!=undefined){		
				//Replace space after commas & then split at comma
				req.body.clients = req.body.clients.replace(/,\s/g, ',').split(",");
				project.clients = req.body.clients;
			}

			//If managers are modified
			if(req.body.managers!=undefined){
				
				//Replace space after commas & then split at comma
				req.body.managers = req.body.managers.replace(/,\s/g, ',').split(",");
				
				//To save the list of managers (oldManagers) that might have been removed in modification
				let length = project.managers.length;
				let oldManagers = [];
				for(let i=0; i<length; i++){
					if(!checkAvailability(req.body.managers, project.managers[i].toString())){
						oldManagers.push(project.managers[i]);
					}
				}
				project.managers = req.body.managers;
				
				//Save project in employee model for managers
				length = project.managers.length;
				for(let i=0; i<length; i++){
					Employee.update({_id: project.managers[i]},{$addToSet:{projects: project._id}}, (err) => {
						if(err)
							return(err);
					});
				}

				//Remove project from employee model for managers that have been removed
				length = oldManagers.length;
				for(let i=0; i<length; i++){
					Employee.update({_id: oldManagers[i]}, {$pull: {projects: project._id}}, (err) => {
						if(err)
							return(err);
					})
				} 
			}

			//If employees are modified
			if(req.body.employees!=undefined){	
				//Replace space after commas & then split at comma
				req.body.employees = req.body.employees.replace(/,\s/g, ',').split(",");
				project.employees = req.body.employees;
			}
			project.save();
			res.json(project);
		});
	});

	//Delete a project
	app.delete('/projects/:projectId', (req,res) => {
		
		//Check if the user is logged in & has the right to proceed
		if(!req.user)
			return res.json({"message":"You are not logged in"});
		if(req.user.role!="Admin")
			return res.json({"message":"You are not authorized to perform this action"});
		
		//Perform deletion only if user is an admin
		Project.remove({_id: req.params.projectId}, (err, obj) => {
			if(err)
				return res.json(err);
			if(obj.result.n === 0) 
				return res.json({"message":"This project does not exist"});
			
			//Also remove the project from employee model
			Employee.update({}, {$pull: {projects: req.params.projectId}}, {multi: true}, (err) => {
						if(err)
							return(err);
			})
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
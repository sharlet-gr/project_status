import mongoose from 'mongoose';
require('../models/project');
let Project = mongoose.model('Project');
require('../models/employee');
let Employee = mongoose.model('Employee');

module.exports = (app, passport) => {
	
	//Admin posts a project
	app.post('/projects', (req,res) => {
		
		Project.findOne({$text: {$search: req.body.name}}, (err,project) => {
			if(err)
				return res.json(err);

			//Do not save if the project already exists
			if(project)
				return res.json({"message":"This project name already exists!"});
			
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
		if(req.user.admin == true){
			Project.find({},(err, projects) => {
				if(err)
					return res.json(err);
				return res.json(projects);
			});
		}
		//If user is not an admin, display only the alloted projects
		Employee.findOne({_id:req.user._id}, (err,employee) => {
			if(err)
				return res.json(err);
			employee.populate('projects',(err,employee) => {
				if(err)
					return err;
				return res.json(employee.projects);
			});
		});
	});

	//Modify a project
	app.patch('/projects/:projectId', (req,res) => {
		Project.findOne({_id: req.params.projectId}, (err,project) => {
			if(err)
				return res.json(err);
			
			//If project name is modified
			if(req.body.name!=undefined && req.body.name!=project.name)
			{
				Project.findOne({$text: {$search: req.body.name}}, (err, project) => {
					if(err)
						return res.json(err);
					if(project)
						return res.json({"message":"This project name already exists!"});
					project.name = req.body.name;
				});
	
			}
			//If clients are modified (list of clients is a comma separated list)
			if(req.body.clients!=undefined){		
				//Replace space after commas & then split at comma
				req.body.clients = req.body.clients.replace(/,\s/g, ',').split(",");
				if(req.body.clients!=project.clients)
					project.clients = req.body.clients;
			}
			//If members are modified (list of members and roles are two different arrays)
			if(req.body.members!=undefined){
				let length = project.members.length;
				for(let i=0; i<length; i++){
					if(!checkAvailability(req.body.members, project.members[i].person.toString())){
						//Remove project from employee model for members that have been removed
						Employee.update({_id: project.members[i].person}, 
							{$pull: {projects: project._id}}, (err) => {
							if(err)
								return(err);
						});	
						//Remove member from project model for members that have been removed
						Project.update({_id: req.params.projectId},
							{$pull: {members: {person: project.members[i].person}}}, 
							(err) => {
								if(err)
									return(err);
							});
					}
				}
				length = req.body.members.length;
				//Save project in project and employee model for members
				for(let i=0; i<length; i++){
					let member = {person: req.body.members[i], role: req.body.role[i]};
					Project.findByIdAndUpdate(req.params.projectId, 
						{$addToSet: {members: member}}, (err, project) => {
							if(err)
								return(err);
							for(let i=0; i<project.members.length; i++){
								//Condition to check whether the member existed in project with a different role
								//If so, remove that document from project model
								if(project.members[i].person == member.person && project.members[i].role != member.role){	
									Project.findByIdAndUpdate(req.params.projectId, 
										{$pull: {members: project.members[i]}},(err, project) => {
											if(err)
												res.json(err);
									});
									break;
								}
							}
					});
					Employee.findByIdAndUpdate(req.body.members[i],
						{$addToSet: {projects: project._id}}, (err) => {
						if(err)
							return(err);
					});
				}
			}
			else{
				let length = project.members.length;
				for(let i=0; i<length; i++){
					//Remove project from employee model for members that have been removed
					Employee.update({_id: project.members[i].person}, 
						{$pull: {projects: project._id}}, (err) => {
						if(err)
							return(err);
					});	
				}
				Project.update({_id: req.params.projectId}, {$set: {members: []}}, (err) => {
					if(err)
						return (err);
				});
			}
			project.save();
			res.json("Updation successful");	
		});
	});

	//Delete a project
	app.delete('/projects/:projectId', (req,res) => {
		
		//Perform deletion only if user is an admin
		Project.remove({_id: req.params.projectId}, (err) => {
			if(err)
				return res.json(err);
			
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
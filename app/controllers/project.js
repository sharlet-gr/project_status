let mongoose=require('mongoose');
require('../models/project');
let Project = mongoose.model('Project');

module.exports = (app) => {
	
	//Admin posts a project
	app.post('/projects', (req,res) => {
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
		Project.find({},(err, projects) => {
			if(err)
				return res.json(err);
			res.json(projects);
		});
	});

	//Modify a project
	app.patch('/projects/:projectId', (req,res) => {
		Project.findOne({_id: req.params.projectId}, (err,project) => {
			if(err)
				return res.json(err);
			if(!project)
				return res.json({"message":"This project does not exist"});
			if(req.body.name!=undefined)
				project.name = req.body.name;
			if(req.body.clients!=undefined){
				//Replace space after commas & then split at comma
				req.body.clients = req.body.clients.replace(/,\s/g, ',').split(",");
				project.clients = req.body.clients;
			}
			if(req.body.managers!=undefined){
				//Replace space after commas & then split at comma
				req.body.managers = req.body.managers.replace(/,\s/g, ',').split(",");
				project.managers = req.body.managers;
			}
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
		Project.remove({_id: req.params.projectId}, (err, obj) => {
			if(err)
				return res.json(err);
			if(obj.result.n === 0) 
				return res.json({"message":"This project does not exist"});
			res.json({"message":"Deleted Successfully!"});
		});
	});
}
GUI = (function(){ //IIFE for all Views
//Initialize a variable to store active user. Updated in LoginView.grantAccess()
var activeUser;
//	//	//	//	//	//	//	//	//	//	//	//	//	//	//	//
//!! CAUTION: activeUser stores the MODEL of the active user. //
//So if you need to access the active user's username, use 		//
// activeUser.get("username")	!!															//
//	//	//	//	//	//	//	//	//	//	//	//	//	//	//	//


var TaskView = Backbone.View.extend({
	render: function () {
		var taskTitle = this.model.get("title");
	  var taskDescription = this.model.get("description");
	  var taskCreator = this.model.get("creator");
	  var taskAssignee = this.model.get("assignee");
	  var taskStatus = this.model.get("status");
		var assignBtn = "<button id='assignBtn'>Assign it!</button>"
		var allUsers = "";
		for (var i = 0; i < app.users.length; i++){
			var userMod = app.users.get(i);
			var user = userMod.get("username");
			allUsers += "<option>" + user + "</option>";
		}
    this.$el.html( "</div> <div><h4>" + taskTitle + "</h4>" + "Description: " + taskDescription +
									 "<br> Added By: " + taskCreator + "<br>Status: " + taskStatus + "</div>" );
		if(taskStatus === "Unassigned") {
			this.$el.append("Assign to: <select id='newAssignee'>" + allUsers + "</select>" + assignBtn);
		}

	},
	initialize: function () {

	},
 	events: {
 			"click #clearBtn" : "clear",
			"click #assignBtn" : "assign"
 	},
 	clear: function () {
 			this.model.replace("");
 	},
	assign: function() {
		var newAssignee = $("#newAssignee").val();
		app.tasks.add({
			assignee: newAssignee, status: "Assigned",
			description: this.model.get("description"),
			creator: this.model.get("creator"),
			title: this.model.get("title")
		});
		app.tasks.remove(this.model);
		this.remove();
	}
 });

var CreateTaskView = Backbone.View.extend({
	render: function () {
		var saveBtn = '<button id = "saveBtn"> Save Task </button>';
		 //make text input fields which show default attributes upon load
	  var titleInput = '<input id= "title" type="text" value="" />';
		var descrInput = '<textarea id= "description"></textarea>';
		var allUsers = "";
		for (var i = 0; i < app.users.length; i++){
			var userMod = app.users.get(i);
			var user = userMod.get("username");
			allUsers += "<option>" + user + "</option>";
		}
		//append text input titles, text input fields, and save button into a div into task-list
		this.$el.html("Task Title" + "<div>" + titleInput + "</div>" +
		 							"Description" + "<br><div>" + descrInput + "</div>" +
									"<div> Assign to: <select id='assignee'>" + "<option> Nobody </option>" + allUsers + "</select>" +
									"<br><div>" + saveBtn + "</div>");
	},
	initialize: function () {

	},
	events: {
			"click #saveBtn" : "save"
	},


	 save: function() {
		 var titleStr = $("#title").val();
		 var descrStr = $("#description").val();
		 var assigneeStr = $("#assignee").val();
		 if (assigneeStr !== "Nobody") {
			 var statusStr = "Assigned";
		 } else {
			 var statusStr = "Unassigned";
		 }
		 //Added if statement to specify correct creator if there's an active user
		 if(activeUser) {
			 this.collection.add({title: titleStr, description: descrStr,
			 creator: activeUser.get("username"), assignee: assigneeStr, status: statusStr});
		 } else {
		 this.collection.add({title: titleStr, description: descrStr, assignee: assigneeStr, status: statusStr});
	 	}
		//clear text box
		$("#title").val('');
		$("#description").val('');
},

});

var UnassignedTasksView = Backbone.View.extend({
	render: function() {
	},

	initialize: function () {
    this.listenTo(this.collection, 'add', this.investigateNewModel);
  },

  investigateNewModel: function(newModel){
		var currentStatus = newModel.get("status");
		if (currentStatus === "Unassigned") {
			var view = new TaskView({model: newModel, collection: app.users});
			view.render();
			this.$el.append(view.$el);
		}
	},

  events : {

  },

});

var UserTasksView = Backbone.View.extend({

	render: function() {
		$("#userTasks").html("<h3>Tasks for " + this.model.get("username") +
		":</h3>");
		//Get all the tasks associated with a user
		var userCreatedTasks = this.collection.where({creator: activeUser.get("username")});
		var userAssignedTasks = this.collection.where({assignee: activeUser.get("username")});
		//If user has any tasks, append them. Otherwise, tell us we don't have any
		if (userCreatedTasks.length !== 0) {
			userCreatedTasks.forEach(this.appendNew, this);
		}
		if (userAssignedTasks.length !== 0) {
			userAssignedTasks.forEach(this.appendNew, this);
		}
		if (userCreatedTasks.length === 0 && userAssignedTasks.length === 0) {
			$("#userTasks").append("<p>You currently have no tasks.</p>");
		}
	},

	appendNew: function(newModel) {
		var taskTitle = newModel.get("title");
		var taskDescription = newModel.get("description");
		var taskCreator = newModel.get("creator");
		var taskAssignee = newModel.get("assignee");
		var taskStatus = newModel.get("status");
		$("#userTasks").append( "</div> <div><h4>" + taskTitle + "</h4>" + "Description: " + taskDescription +
									 "<br> Added By: " + taskCreator + "<br>Status: " + taskStatus + "<br>Assigned to: " + taskAssignee + "</div>" );
	},

	initialize: function() {
		//Whenever a new model is added to the collection, check if it
		//was created by or assigned to the active user.
		this.listenTo(this.collection, "add", this.render);
		this.listenTo(this.collection, "remove", this.render);
	},

	events: {

	}
});

var UserView = Backbone.View.extend({
	hasView: false,

	render: function() {
		this.$el.html("<p>Welcome, "+this.model.get('username')+"</p>"+
		"<button id='logOut'>Log Out</button>");
		if (this.collection.length !== 0 && this.hasView === false)	this.addView();

	},
	initialize: function() {
		//Start up the UserTasksView as soon as the UserView is up.
			this.listenTo(app.tasks, "add", this.belongsToUser);
	},
	belongsToUser: function(task) {
		if(task.get("creator") === activeUser.get("username") ||
		task.get("assignee") === activeUser.get("username") ) {
			this.collection.add(task);
			this.addView();
		}
	},
	addView: function() {
		if(this.hasView == false) {
			var userTasksView = new UserTasksView({model: activeUser, collection: app.tasks,
			userTasksCollection: this.collection});
			userTasksView.render();
			$("#userTasks").append(userTasksView.$el);
			this.hasView = true;
		}
	},
	events: {
		"click #logOut": "logOut"
	},
	logOut: function() {

		this.model = undefined;
		this.$el.html('');
		$('#createTasks').html('');
		$('#unassignedTasks').html('');
		$('#userTasks').html('');
		this.hasView = false;
		loginView = new LoginView({collection: app.users});
		loginView.render();
		$("#login").append(loginView.$el);
		this.remove();
	}

});

// jquery add text if username/ pword Incorrect
// remove when click log in button (click or enter)
// stop direct to text "incorrect"
//clear input field (make empty string)
// selector for text color

var LoginView = Backbone.View.extend({
	render: function() {
		var loginBtn = "<button id='loginBtn'>Log In</button>";
		this.$el.html("<h2>Log In</h2>" + "Username <input id='userInput'></input>" +
		"Password <input type='password' id='passInput'></input>" + loginBtn);
	},
	events: {
		"click #loginBtn": "authenticate",
		"keypress input" : "loginOnEnter"
	},

	loginOnEnter: function (e){
			if(e.keyCode == 13) {
					this.authenticate();
			}
	},
	authenticate: function() {
		var userInput = $("#userInput").val(); //Grab the user input
		var passInput = $("#passInput").val();

		if(!this.collection.findWhere({username: userInput})) {
				$("<p id='wrongUsername'>Incorrect Username </p>").appendTo("#login");
				$("#userInput").val('');
				$("#passInput").val('');
				$( "#userInput" ).click(function() {
					$( "#wrongUsername" ).remove();
				});
		} else {
			var user = this.collection.findWhere({username: userInput});
		}
		if (user.get("password") === passInput) {
			this.grantAccess(user);		//This will load the UserView.
		} else
			$("<p id='wrongPassword'>Incorrect Password</p>").appendTo("#login");
			$("#passInput").val('');
			$( "#passInput" ).click(function() {
				$( "#wrongPassword" ).remove();
			});
	},

// perhaps add specific "if username AND password are incorrect" ?

	grantAccess : function(user) {
		//First set the active user to be the user that just logged in
		activeUser = user;
		//Create a new UserView and UserTasksView to replace the LoginView
		var userTasksCollection = new UserTasksCollection({user: activeUser});
		var userView = new UserView({model: user, collection: userTasksCollection});
		userView.render();
		//this starts process - creates CreateTasksView with a TaskCollection (which has TaskModel in it)
		createTaskView = new CreateTaskView({collection: app.tasks, model: activeUser});
		//immediately runs the render function in CreateasksView (which just shows the 'Create New Task' button)
		createTaskView.render();
		$("#createTasks").append(createTaskView.$el);
		$("#welcome").append(userView.$el);
		unassignedTasksView = new UnassignedTasksView({collection: app.tasks});
		unassignedTasksView.render();
		$('#unassignedTasks').append(unassignedTasksView.$el);

		this.remove();
	}
});

// generic ctor to represent interface:
function GUI(users, tasks, el) {
	// users is collection of User models
	this.users = users;
	// tasks is collection of Task models
	this.tasks = tasks;
	// el is selector for where GUI connects in DOM
	this.el = el;


	//Start the user on the LoginView. Authenticate their info, then
	//send them on to the
	loginView = new LoginView({collection: app.users});
	loginView.render();
	$("#login").append(loginView.$el);


}
return GUI;

})();

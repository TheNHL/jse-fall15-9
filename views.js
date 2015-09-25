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
    this.$el.html( "<div><h4>" + taskTitle + "</h4>" + "Description: " + taskDescription +
									 "<br> Added By: " + taskCreator + "<br>Status: " + taskStatus + "</div>" );
	},
	initialize: function () {   //must be called initialize!
		this.listenTo(this.collection, 'add', this.render());
			//this.model.on("change", this.render, this);
			// last argument 'this' ensures that render's
			// 'this' means the view, not the model
	},
 	events: {
 			"click #clearBtn" : "clear"
 	},
 	clear: function () {
 			this.model.replace("");
 	}
 });
var CreateTaskView = Backbone.View.extend({
	render: function () {
		//put the default attribute values in variables.  They will show in the text input fields when loaded.
		 //var taskTitle = this.model.get("title");
		 //var taskDescription = this.model.get("description");
		 //create our Save button
		var saveBtn = '<button id = "saveBtn"> Save Task </button>';
		 //make text input fields which show default attributes upon load
	  var titleInput = '<input id= "title" type="text" value="" />';
		var descrInput = '<textarea id="description"></textarea>';
		//append text input titles, text input fields, and save button into a div into task-list
		this.$el.html("Task Title" + "<div>" + titleInput + "</div>" +
		 							"Description" + "<br><div>" + descrInput + "</div>" +
									"<br><div>" + saveBtn + "</div>");
	},
	initialize: function () {
			//this.model.on("change", this.render, this);
			//this.listenTo(this.collection, 'add', this.addView);
	},
	events: {
		//when click Save button, run save function.
			"click #saveBtn" : "save"
	},

	//creates a new CreateTaskView with the model that is created from addModel and renders CreateTaskView's render function

	//This function should find the input in the text inputs (see comment in function for example) and then set the model's attributes to the inputted values.
	//Then we should like create a new TaskView that just shows our task...no input fields.
	 save: function() {
	 	 var titleStr = this.$el.find("#title").val();
		 var descrStr = this.$el.find("#description").val();
		 //Added if statement to specify correct creator if there's an active user
		 if(activeUser) {
			 this.collection.add({title: titleStr, description: descrStr,
			 creator: activeUser.get("username")});
		 } else {
		 this.collection.add({title: titleStr, description: descrStr});
	 	}
},

});

var UnassignedTasksView = Backbone.View.extend({
	//render function runs immediately which is just putting the 'Create New Task' button in a div called 'task-list' inside the app div
	render: function() {

	},
  //this listens for a collection to be added (which happens when addModel is called by clicking the 'Create New Task' button) and then calls addView
	initialize: function () {
    this.listenTo(this.collection, 'add', this.investigateNewModel);
  },

  investigateNewModel: function(newModel){
		var currentStatus = newModel.get("status");
		if (currentStatus === "Unassigned") {
			var view = new TaskView({model: newModel});
			view.render();
			this.$el.append(view.$el);
		}
	},

  events : {

  },

});

var UserTasksView = Backbone.View.extend({
	//Need to figure out why the first user to log in gets all tasks
	//added by someone else in their UserTasksView. Must have something to
	// do with this.render or this.belongsToUser ...
	render: function(caller) {
		this.$el.html("<p>Tasks for user " + this.model.get("username") +
		":</p>");
		//Get all the tasks associated with a user
		var userCreatedTasks = this.collection.where({creator: activeUser.get("username")});
		var userAssignedTasks = this.collection.where({assignee: activeUser.get("username")});
		//If user has any tasks, append them. Otherwise, tell us we don't have any
		if (userCreatedTasks.length !== 0) {
			userCreatedTasks.forEach(this.appendNew, this);
		} else this.$el.append("<p>You currently have no tasks.</p>");
	},
	/*belongsToUser: function(task) {
		console.log(task.get("creator"), task.get("assignee"));
		if(task.get("creator") === activeUser.get("username") ||
		task.get("assignee") === activeUser.get("username") ) {
			console.log(task.get("creator") === activeUser.get("username"));
			this.userTasksCollection.add(task);
		}
	}, */

	// THIS NEEDS WORK. Right now I'm cheating and displaying some data from
	// the array of tasks I got above in this.render
	//Eventually I need to make this display the proper TaskViews!

	appendNew: function(newTask) {
		this.$el.append("<p>Title: "+newTask.get("title")+"</p>" +
	"<p>Creator:" + newTask.get("creator")+"</p>");
	},
	reRender: function() {
		this.$el.html('');
		this.render('reRender');
	},
	initialize: function() {

		this.listenTo(this.collection, "add")

		//Whenever a new model is added to the collection, check if it
		//was created by or assigned to the active user.
	this.listenTo(this.collection, "add", this.belongsToUser);

	this.listenTo(this.collection, "add", this.reRender);

		//Whenever a new model is added to the collection, check if it
		//was created by or assigned to the active user.
		this.listenTo(this.collection, "add", this.reRender);

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
			userTasksView.render('UserView.addView');
			this.$el.append(userTasksView.$el);
			this.hasView = true;
		}
	},
	events: {
		"click #logOut": "logOut"
	},
	logOut: function() {
		//this.model = undefined;
		//this.$el.html('');
	//	userTasksView.html('');
		loginView = new LoginView({collection: app.users});
		loginView.render();
		$("#login").append(loginView.$el);
		this.remove();
	}

});

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

		//Check to see if there's a user with given username
		//If not, tell us. If so, see if the passwords match
		//Then load a UserView!
		// Could we add a "try again" or "return" button when it redirects us to "username does not match any registered users"
		if(!this.collection.findWhere({username: userInput})) {
			this.$el.html("<p class='hideSoon'>Username " + userInput +
			//In the future I want to hide these 'hidesoon's after a while
			" does not match any registered users.</p>");
		} else {
			var user = this.collection.findWhere({username: userInput});
		}
		if (user.get("password") === passInput) {
			this.grantAccess(user);		//This will load the UserView.
		} else this.$el.html("<p class='hideSoon'>Incorrect password.</p>");
	},
	grantAccess : function(user) {
		//First set the active user to be the user that just logged in
		activeUser = user;
		//Create a new UserView and UserTasksView to replace the LoginView
		var userTasksCollection = new UserTasksCollection({user: activeUser});
		var userView = new UserView({model: user, collection: userTasksCollection});
		userView.render();
		$("#app").append(userView.$el);
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

	//this starts process - creates CreateTasksView with a TaskCollection (which has TaskModel in it)
	createTaskView = new CreateTaskView({collection: app.tasks, model: activeUser});
	//immediately runs the render function in CreateasksView (which just shows the 'Create New Task' button)
	createTaskView.render();

	//appends render stuff into our app div
	$(el).append(createTaskView.$el);
	unassignedTasksView = new UnassignedTasksView({collection: app.tasks});
	unassignedTasksView.render();
	$(el).append(unassignedTasksView.$el);
}
return GUI;

})();

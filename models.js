var UserModel = Backbone.Model.extend({
	defaults: {
		username:''
	}
})

var TaskModel = Backbone.Model.extend({
	defaults : {
		title:'',
		description:'',
		creator:'',
		assignee:'',
		status:'Unassigned',
	}
	// Add methods if needed...
})

var UserCollection = Backbone.Collection.extend({
	model:UserModel,
	url:'/users'
})

var TaskCollection = Backbone.Collection.extend({
	model:TaskModel,
	url:'/tasks'
})

var UserTasksCollection = Backbone.Collection.extend({
	model: TaskModel
})

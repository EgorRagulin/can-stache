var QUnit = require("steal-qunit");
var stache = require("can-stache");
var DefineList = require("can-define/list/list");
var canReflect = require("can-reflect");
require("./-for-of");


QUnit.module("can-stache #for(of) helper");

test("basics", function(){

    var template = stache("<div>{{#for(value of list)}}<p>{{this.vmProp}}{{value}}</p>{{/for}}</div>");
    var list = new DefineList([34234,2,1,3]);
    var frag = template({
		list: list,
		vmProp: "1"
	});
    list.sort();
    // list.splice(0,4,1,2,3,34234);

    var order = [].map.call( frag.firstChild.getElementsByTagName("p"), function(p){
        return +p.innerHTML;
    });

    deepEqual(order, [11,12,13,134234]);



	template = stache(
		"<div>"+
		"Hello, you have  {{this.users.length}}."+
		"{{# for(user of this.users) }}"+
		"  <div>"+
		"     {{user.name}}"+
		"     <ul>"+
		"       {{# for(todo of user.todos) }}"+
		"         <li>{{todo.name}}  {{ this.isOwner(user, todo) }}</li>"+
		"       {{/ for }}"+
		"     </ul>"+
		"  </div>"+
		"{{/ for }}"+
		"</div>"
	);

	var vm = {
		users: [
			{
				name: "Justin",
				todos: [{name: "for-in"}]
			}
		],
		isOwner: function(user, todo){
			return user.name === "Justin" && todo.name === "for-in" ? "yes" : "no";
		}
	};

	var result = template(vm).firstChild.innerHTML.replace(/\s+/g," ");
	QUnit.equal(result, "Hello, you have 1. <div> Justin <ul> <li>for-in yes</li> </ul> </div>");
});

QUnit.test("create an observable let scope (#593)", function(){
	var template = stache("<div>{{# for(thing of this.stuff)}}"+
		"{{let theValue=null}}"+
		"{{write theValue}}"+
		"<label>{{theValue}}</label>"+
    "{{/ for}}</div>");

	var obs = [];
	var frag = template({
		stuff: [{},{}],
		write: function(theValueObservable){
			obs.push(theValueObservable);
		}
	});

	canReflect.setValue( obs[0] , 1);
	canReflect.setValue( obs[1] , 2);

	var labels = frag.firstChild.getElementsByTagName("label");

	QUnit.equal(labels[0].innerHTML,"1", "first element");
	QUnit.equal(labels[1].innerHTML,"2", "first element");


});

# W3View
## The HTML was created for this
- Extremely light and fast. 
- Simple and absolutely painless.
- Componentize your work in easiest way.

11 kB of documented, not minified code.

## What W3View does ?
W3View generates **reusable UI components** from HTML based declarative 
definitions.

W3View allows you to build reach interfaces and combine powerful frontend.
<a 
	href="https://rawgit.com/vitalydmitriev1970/W3View/master/examples/window.html">Popup windows</a>, <a 
	href="https://rawgit.com/vitalydmitriev1970/W3View/master/examples/grid.html">data grid</a> and <a 
	href="https://rawgit.com/vitalydmitriev1970/W3View/master/examples/slider.html"
	>color chooser</a> are just small examples and can be used as parts of your great UI.

+ W3View components, generated by W3View are just DOM nodes with lifecycle
methods mixed in, they also can contain the table of inner references,
that are DOM nodes too. 
+ The definition of component is just HTML markup, 
plus optional lifecycle handlers in the embedded script. 
+ Definition of W3View component is not template - it is data structure. 

Each instance of W3View contains its own namespace and independent 
set of components. 
Therefore the number of independent applications can be mounted on the page.
Also one W3View app can use the number of mounting points on the page, 
and it can run the number of W3View apps inside one W3View app. 
This is the real power of Javascript.

## What W3View is ?
* **Small (really small!) and well documented browser script, 
contains one constructor**
* **HTML based definition of components**
* **Small set of additional attributes**
* **Natural, manageble DOM Nodes as component instances**
* **Natural DOM events**
* **Only five new methods to use**
* **Up to five methods to implement**
* **API and lifecycle are oriented on reactive programming**

## What W3View is not?
* **MAGIC CARPET**
* **SILVER BULLET**
* **NUMBER OF NEW CONCEPTIONS**
* **COFFEE MAKER**

## What is main Conception, the W3View provides?
The main conception of W3View is - NO NEW CONCEPTIONS and the 
second conception is - NO NEW WORDS.

## How to create UI components with W3View ?
Component definition - is the markup of one sample HTMLElement.
Just write some HTML markup and embedded constructor script,
like this:

		//"hello-world" definition
		<div as="hello-world">
			<input ref="input" placeholder="type your name here">
			<h1>Hello <span ref="name">Anonimous</span>!</h1>
			<script>
				this.ref.input.onkeyup = function(e){
					this.setData(this.ref.input.value);
				}.bind(this);
				this.onSetData = function(data){
					this.ref.name.innerText = data || 'Anonimous';
				};
			</script>
		</div>
		//Here:
		//"this" - is the reference to DIV, that is instance of "hello-world".
		//attribute "ref" - is some one like *id*, inside the component.
		//"this.ref" - is the table of references to corresponded elements.

Looks like web page, when web was young, is not it? 
Yes, but it is **reusable component**.
It can be used as simple application,
and it can be used as part of more complex app inside another component, 
for example:

		<div as="double-hello-world">
			<hello-world></hello-world>
			<hr>
			<hello-world></hello-world>
		</div>

Okay, lets combine these examples, make complete HTML page and 
run "double-hello-world" app:

	<!DOCTYPE html>
	<html>
		<head>
			<meta http-equiv="content-type" content="text/html;charset=utf-8">
			<title>Double Hello</title>
		<head>
		<script src="w3view.js"></script>
		<script type="text/w3view" id="components">
			
			//any text can be placed between components definitions,
			//except HTML markup.
			
			//hello-world component
			<div as="hello-world">
				<h1 ref="content"></h1>
				<input ref="input" placeholder="type your name here">
				<h2>Hello <span ref="name">Anonimous</span>!</h2>
				<constructor>
					//CONSTRUCTOR tag should be used inside SCRIPT tag
					this.ref.input.onkeyup = function(e){
						this.setData(this.ref.input.value);
					}.bind(this);
					this.onSetData = function(data){
						this.ref.name.innerText = data || 'Anonimous';
					};
				</constructor>
			</div>
			
			//root of app 
			<div as="double-hello-world">
				<hello-world>Hello first</hello-world>
				<hr>
				<hello-world>Hello second</hello-world>
			</div>

		</script>

		<body style="margin:50px;">
			<script defer="defer">
				var w3view = new W3View();
				w3view.parse(components.textContent);
				w3view.create('double-hello-world').mount(document.body);
			</script>
		</body>
	</html>

You can find this example in ./examples folder of this repo.
or <a href="https://rawgit.com/vitalydmitriev1970/W3View/master/examples/readmeExample.html">click here</a>

## Where can You use the W3View ?
You can use W3View as View layer of any kind of MVC.
W3View is ready to Flux, reactive programming, 
and event driven programming. All what You can do with HTML and Javascript,
You can do with W3View components.

## What You need to start using W3View ?
You need just w3view.js file, text editor and browser.
Any browser, including IE9.

## What You need to know to start using W3View ?
You need to know HTML and Javascript.
You also need to know basics of DOM API.

### More examples and descriptions You can find in the ./howto.md, detailed API - in the api-doc.md

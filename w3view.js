/**
 * @author Vitaly Dmitriev, 2016
 */

'use strict';

function W3View(appContext){
	var registry = {};
	var factory = this;
	var mixin = {};

	this.getRegistry = function(){return registry;};
	this.setRegistry = function(newRegistry){registry=newRegistry; return factory;};
	this.putModule = function(name, module){
		modules[name] = module;
	};
	
	/**
	 * 
	 */
	var modules = {};

	var document = W3View.document || window.document;
	/**
	 * Mount element into target content
	 * at index position
	 * 
	 * @param {DOMNode} target - destination target
	 * @param {number} index - index in destination
	 */
	mixin.mount=function(target, index){
		target = target.ref && target.ref.content ? target.ref.content : target;
		this.unmount();
		if(index === undefined || target.children.length <= index ) 
			target.appendChild(this);
		else target.insertBefore(this,target.children[index < 0 ? 0 : index]);
		this.onMount();
	};
	/**
	 * Unmount element from DOM tree
	 */
	mixin.unmount=function(){
		this.onUnmount();
		if(this.parentNode) this.parentNode.removeChild(this);
	}
	/**
	 * setData - public API methods for
	 * setting data into element, user defined onSetData callback will
	 * be called immediately
	 * 
	 * @param {any} data
	 * @param {any} opts
	 * @param {any} a1
	 */
	mixin.setData=function(data,opts,a1){
		this.onSetData(data,opts,a1);
	};
	/**
	 * recursively destroy self and subtree
	 */
	mixin.destroy=function(){
		if(this.unmount){
			this.unmount();
		} else this.parentNode.removeChild(this);
		if(this.onDestroy){
			this.onDestroy();
		}
		while(this.children.length){
			if(!this.children[0].destroy){
				this.children[0].destroy = mixin.destroy;
			} 
			this.children[0].destroy();
		}
	};

	///lifecycle callbacks
	/**
	 * all of these callbacks already presented in each
	 * instance of W3View components.
	 * Author of component can override each of them.
	 */
	/**
	 * Mock, callback on this.setData
	 */
	mixin.onSetData=function(data,opts){};

	/**
	 * Mock, callbacks on element.mount and element.unmount
	 * in this time you can touch parentElement if needed,
	 * onMount will be called after inserting into DOM tree
	 * onUnmount - before removing
	 */
	mixin.onMount=function(){};
	mixin.onUnmount=function(){};

	/**
	 * Mock, callback called immediately after element created
	 * before mount 
	 */
	mixin.onCreate=function(){};
	/**
	 * Mock, callback called when destroy
	 * Please cleanup all references to this,
	 * including callbacks, placed into any kind of dispatchers,
	 * observables and event listeners
	 */
	mixin.onDestroy=function(){};
	
	this.findPrep=function(find){
		var name=(find + '').toUpperCase();
		return (registry[name] && registry[name].prep) ? registry[name].prep : undefined;
	};

	var initInstance=function(instance, name){
		var prep = factory.findPrep(name);
		if(prep){
			if(prep.super){
				initInstance(instance,prep.super);
			}
			if(prep.script){
				instance.__ = prep.script;
				instance.__(appContext,factory,document);
				instance.onCreate();
			}
		}
	};
	/**
	 * Make preparat from sample HTMLElement
	 */
	function nmToObj(nm){
		var res = {};
		for(var i=0;i<nm.length;i++){
			res[nm[i].name.toLowerCase()]=nm[i].value;
		}
		return res;
	}

	function setAttributes(instance, attr){
		if(attr && instance && instance.setAttribute)
		for(var key in attr){
				instance.setAttribute(key, attr[key]);
		}
	}

	function prepare (root){
		var res={};
		res.tgn=root.getAttribute('tagname') || root.tagName;
		res.as=root.getAttribute('as') || undefined;
		res.attr=nmToObj(root.attributes);
		res.ch=[];
		res.super = root.getAttribute('super') || undefined;
		var ch=root.childNodes;
		for(var i=0; i < ch.length; i++){
			if(ch[i].nodeType > 3) continue;
			if(!ch[i].tagName){
				res.ch.push({text:ch[i].textContent});
				continue;
			}
			var tgn=ch[i].tagName.toUpperCase();
			if(tgn==='CONSTRUCTOR' || tgn==='SCRIPT'){
				var construct="\n"+(ch[i].textContent || ch[i].innerText)+
					"\n//# sourceURL=W3View:///"+res.as+"";
				res.script = new Function('appContext,factory,document', construct);
			} else {
				var child = prepare(ch[i]);
				delete child.script;
				delete child.as;
				res.ch.push(child);
			}
		}
		return res;
	}
	
	/**
	 * register Components, takes definitions from
	 * string, append new definitions into registry
	 * @param {string} str
	 * @returns {void} 
	 */
	factory.parse=function(str){
		var matrix=document.createElement('div');
		matrix.innerHTML=str;
		var ch=matrix.children;
		factory.register(ch);
	};


	factory.register = function(ch){
		for(var i=0;i<ch.length;i++){
			if(ch[i].tagName.toUpperCase()==='IMPORT'){
				factory.imports =factory.imports || [];
				factory.imports.push(
					{src:ch[i].getAttribute('src'), name:ch[i].getAttribute('name')}
				);
				continue;
			}
			var asName=(ch[i].getAttribute('as') || '').toUpperCase();
			if( asName ) {
				if(!registry[asName]){
					var prep = prepare(ch[i]);
					registry[asName]={};
					registry[asName].prep=prep;
				} else {
					console.error(asName + ' - already registered component')
				}
			}
		}
	};

	/**
	 * Magic method, - factory of components - 
	 * does all dirty work at DOM nodes creation,
	 * attribute setting, adding children and references registration
	 */
	factory.create=function(name, attr, ch, root){
		var instance;
		//если есть зарегистрированный компонент с таким именем
		//тогда создадим его инстанс из препарата
		var prep=this.findPrep(name);
		if(!prep ){
			var path = name.split(':');
			if(path.length>1 && modules[path[0]]){
				return modules[path[0]].create(
					path.slice(1).join(':'),
					attr, ch, root
				);
			}
		}
		if(prep){
			//если в препарате есть функция для создания
			//инстанса, возвратить результат её работы
			if(prep.create) return prep.create(attr,ch,root);
			//определить имя тэга
			//если тэг определён для создаваемого инстанса
			//с помощью атрибута, необходимо использовать значение атрибута
			//иначе нужно применить имя тэга из препарата
			var tagname = (attr && attr.usetag) ? attr.usetag : prep.tgn;
			//создаём инстанс 
			instance=document.createElement(tagname);
			instance.as=prep.as;
			//назначить ссылку на элемент для вставки контента,
			//по умолчанию - на самого себя 
			instance.ref={content:instance};
			//*/
			//если в препарате указаны атрибуты
			//пройти и установить их в инстанс
			setAttributes(instance, prep.attr)
			//если в препарате указаны вложенные ноды
			//пройти и добавить их
			if(prep.ch && prep.ch.length)
			for(var i=0;i < prep.ch.length;i++){
				//если нода текстовая
				if(!prep.ch[i].tgn){
					//создать и установить её
					instance.appendChild(document.createTextNode(prep.ch[i].text));
					continue;
				}
				//иначе создать ноду этой фабрикой,
				//указывая в качестве корня себя и
				//в качестве параметров ноды - атрибуты и 
				//вложенные ноды из её описания в инстансе
				var cch=factory.create(prep.ch[i].tgn, prep.ch[i].attr, prep.ch[i].ch,instance);
				//если у созданной ноды есть атрибут ref
				//добавить ссылку на ноду в ref инстанса
				var ref=cch.getAttribute('ref');
				if(ref){
					instance.ref[ref]=cch;
				}
				//добавить ноду в инстанс 
				instance.appendChild(cch);
				if (cch.onMount) cch.onMount();
			}
			//*/
		} 
		//если нет зарегистрированного компонента с таким именем
		//просто создадим элемент
		else {
			instance=document.createElement(name);
			instance.ref={content:instance};
		}
		//начинаем заполнять инстанс из параметров
		// - такой вариант выполняется всегда при условии, если
		//инстанс является вложенной нодой,
		//или если Вам так вдруг захотелось и Вы сами указали параметры
		if(!root) root=instance;
		//ставим атрибуты
		setAttributes(instance, attr);
		//вставляем дочерние ноды в ref.content
		if(ch && ch.length)
		for(var i = 0; i < ch.length; i++){
			//если нода текстовая
			if(!ch[i].tgn){
				instance.ref.content.appendChild(document.createTextNode(ch[i].text));
				continue;
			}
			//иначе создаём этой фабрикой, указывая атрибуты и деток из 
			//параметров
			var cch=factory.create(ch[i].tgn, ch[i].attr, ch[i].ch, root);
			//устанавливаем ref в корень, если он есть
			var ref=cch.getAttribute('ref');
			if(ref){
				root.ref=root.ref || {}; 
				root.ref[ref]=cch;
			}
			//монтируем дочернюю ноду в контент текущей
			if(cch.mount){
				cch.mount(instance);
			} else {
				instance.ref.content.appendChild(cch);
			}
		}
		//микшируем W3View API, если инстанс - экземпляр зарегистрированного
		//компонента, вызываем конструктор и отрабатываем
		//пользовательское событие на создание
		if(prep){
			for(var k in mixin){
				instance[k] = mixin[k];
			}
			initInstance(instance, name);
		}
		//всем создаваемым нодам микшируем деструктор
		//для каскадного разрушения
		instance.destroy = mixin.destroy;
		return instance;
	};

	//var factory = this;
	factory.byExample = function byExample(tpl){
		if(!tpl.as){
			throw new Error('Sample should be registered component');
		}
		var res = factory.create(tpl.as, nmToObj(tpl.attributes));
		return res;
	};
	///builtin components
	//ARRAY-ITERATOR
	factory.parse('<div as="ARRAY-ITERATOR"></div>');
	factory.findPrep('ARRAY-ITERATOR').script = function(appContext,factory,document){
		var templates=[];
		while(this.children.length > 0){
			templates.push(this.removeChild(this.children[0]));
		}
		this.ref = {};

		this.onSetData = function(array, opts){
			if(!array) array=[];
			if(!Array.isArray(array)) {
				array=[array];
			}
			for(var i=0; i < array.length || i < this.children.length; i++){
				if(this.children[i] && array.length <= i){
					this.children[i].destroy();
					i--;
					continue;
				}
				var item = array[i];
				var child=this.children[i];
				if(!child){
				  child=factory.byExample(templates[i%templates.length]);
					child.mount(this);
				}
				child.setData(item, opts, i);
			}
		}
	};
};

if(typeof (module) === 'object'){
	module.exports = W3View;
}

/**
 *
 * Copyright (C) 2012 by Scott Byrns
 * http://github.com/scottbyrns
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 */

__GLOBAL_NAMESPACE__ = window;

Object.prototype.setType = function (type) {
	this.objectType = type;
	return this;
};

Object.prototype.checkType = function (object) {
	var type = object;
	if (type == this.objectType) {
		return this;
	}
	throw new Error("Object of type: " + type + " found, expected object of type: " + this.objectType);
};

Object.prototype.getType = function () {
	if (this.objectType === "undefined") {
		this.objectType = typeof this;
	}
	return this.objectType;
};

Function.prototype.checkType = function () {
	for (var i = 0; i < arguments.length; i += 1) {
		var type = (typeof arguments[i]);
		try {
			arguments[i].getType();
		}
		catch (e) {
			// No type probabbly a primative.
		}
		if (this.interface['input-parameters'][i].type != type) {
			throw new Error("Expected value of type: " + this.interface['input-parameters'][i].type + " but found value of type: " + type + ' for argument named: ' + this.interface['input-parameters'][i].name);
		}
	}
	return true;
}

Function.prototype.setInterface = Object.prototype.setInterface = function (interface) {
	this.interface = interface;
};

Function.prototype.isImplementationOf = Object.prototype.isImplementationOf = function (object) {
	try {
		return this.checkInterfaceAgainst(object);
	}
	catch (e) {
		return false;
	}
};

Function.prototype.checkInterfaceAgainst = Object.prototype.checkInterfaceAgainst = function (object) {
	if (this.interface == undefined && object && object.interface) {
		throw new Error("Interface was not defined.");
	}
	if (object.interface) {
		if (object.interface['input-parameters'] && this.interface['input-parameters']) {
			for (
				var valueIndex = 0, valueLength = this.interface['input-parameters'].length;
				valueIndex < valueLength;
				valueIndex += 1
			)
			{
				if (this.interface['return-value'].type != object.interface['return-value'].type) {
					throw new Error([
						"Provided object does not return a value of type: ",
						this.interface['return-value'].type
					].join(""));
				}
				if (this.interface['input-parameters'][valueIndex].name != object.interface['input-parameters'][valueIndex].name) {
					throw new Error([
						"Provided object does accept argument named: ",
						this.interface['input-parameters'][valueIndex].name,
						'.'
					].join(''));
				}
				if (this.interface['input-parameters'][valueIndex].type != object.interface['input-parameters'][valueIndex].type) {
					throw new Error([
						"Provided object does accept argument named: ",
						this.interface['input-parameters'][valueIndex].name,
						' of type ',
						this.interface['input-parameters'][valueIndex].type,
						'.'
					].join(''));
				}
			}
		}
		else {
			throw new Error("No interface was defined.");
		}
	}
	return true;
};

var TypeSafeClass = function (global) {
	var classRegister = {};
	return function (config) {
		var theClass = function (config) {
			return function () {
				if (this == __GLOBAL_NAMESPACE__) {
					throw new Error("No static constructor is available for this type safe class.");
				}
				try {
					this.setType(config.type);
					config.constructor.setInterface(Interface.getInterfaceNamed(config.implements).getConstructor());
					config.constructor.checkType.apply(arguments);
					config.constructor.apply(this, arguments);
					this.setInterface(Interface.getInterfaceNamed(config.implements));
				}
				catch (e) {
					throw new Error("No static constructor is available for this type safe class.")
				}
			}
		}(config);
		theClass.setInterface(config.interface);

		var properties = config.properties;
		for (propertyIndex in properties) {
			if (properties.hasOwnProperty(propertyIndex)) {
				var txt = properties[propertyIndex].name;
				var type = properties[propertyIndex].type;
				var camelCasedMethodName = txt.substr(0, 1).toUpperCase() + txt.substr(1, txt.length);
				theClass.prototype['get' + camelCasedMethodName] = function () {
					return this[txt];
				};
				theClass.prototype['set' + camelCasedMethodName] = function (typedValue) {
					var inputType = (typeof typedValue);
					if (typedValue.getType && typedValue.getType() != undefined) {
						inputType = typedValue.getType();						
					}
					try {
						if (inputType == type) {
							this[txt] = arguments[0];
						}
						else {
							throw new Error("Expected value of type: " + type + " but found value of type: " + inputType);
						}
					}
					catch (e) {
						throw new Error(e);
						throw new Error("Setting typed value with untyped parameter.");
					}
				};
			}
		}

		var methods = Interface.getInterfaceNamed(config.implements).getMethods();

		for (methodId in methods) {
			if (!methods.hasOwnProperty(methodId)) {
				continue;
			}
			var method = methods[methodId];
			theClass.prototype[method.name] = function (method) {
				if (config[method.name]) {
					config[method.name].setInterface(method.interface);
					var operation = function () {
						var allGo = config[method.name].checkType.apply(arguments);
						if (allGo) {
							return config[method.name].apply(this, arguments);
						}
					};
					operation.setInterface(method.interface);
					return operation;
				}
				else {
					throw new Error("Class does not implement " + method.name);
				}
			}(method);

			method.name
			method.interface
			method.interface['return-value'] // type
			method.interface['input-parameters'] // array
		}
		classRegister[config.type] = theClass;
		var typePath = config.type.split('.');
		var depth = global;
		for (var i = 0; i < typePath.length - 1; i += 1) {
			depth = depth[typePath[i]] = depth[typePath[i]] || {};
		}
		depth[typePath[typePath.length - 1]] = theClass;
		return theClass;
	};
}(__GLOBAL_NAMESPACE__);

var Interface = function () {
	var interfaceRegister = {
		
	};
	var Interface = function (config) {
		this.setType(config.type);
		this.constructor = config.constructor;
		this.methods = config.methods;
		interfaceRegister[config.type] = this;
	};

	Interface.prototype.getConstructor = function () {
		return this.constructor;
	},

	Interface.prototype.getMethods = function () {
		return this.methods;
	};
	
	Interface.getInterfaceNamed = function (name) {
		return interfaceRegister[name];
	}
	return Interface;
}();







new Interface({
	type: "com.example.IntegerInterface",
	constructor: {
		'return-value': {
			type: 'com.example.Integer'
		},
		'input-parameters': [
			{
				name: 'factor',
				type: 'number'
			}
		]
	},
	methods: [
		{
			name: "multiplyBy",
			interface: {
				'return-value': {
					type: 'com.example.Integer'
				},
				'input-parameters': [
					{
						name: 'factor',
						type: 'com.example.Integer'
					}
				]
			}
		}
	]
});

new TypeSafeClass({
	type: 'com.example.Integer',
	implements: 'com.example.IntegerInterface',
	constructor: function (value) {
		this.setValue(value || 0);
	},
	properties: [
		{
			name: 'value',
			type: 'number'
		}
	],
	multiplyBy: function (factor) {
		return new com.example.Integer(this.getValue() * factor.getValue());
	}
});

var rows = new com.example.Integer(2);
var columns = new com.example.Integer(7);
columns.setValue(12);

var cells = rows.multiplyBy(columns);
cells.getValue(); // 24
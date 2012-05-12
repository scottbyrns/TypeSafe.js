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

var TypeSafeClass = function (config) {
	var theClass = function (config) {
		if (config.extends) {
			
		}
		return function () {
			this.setType(config.type);
			config.constructor.setInterface(config.extends.getConstructor());
			config.constructor.checkType.apply(arguments);
			config.constructor.apply(this, arguments);
			// this.interface = config.interface;
			this.setInterface(config.interface);
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
	
	var instanceMethods = config.instanceMethods;
	var self = this;
	for (method in instanceMethods) {
		if (instanceMethods.hasOwnProperty(method)) {
			theClass.prototype[instanceMethods[method].name] = function (method) {
				var operation = function () {
					var allGo = method.operation.checkType.apply(arguments);
					if (allGo) {
						return method.operation.apply(this, arguments);
					}
				};
				operation.setInterface(method.interface);
				return operation;
			}(instanceMethods[method]);
		}
	}
	return theClass;
};

var Interface = function (config) {
	this.setType(config.type);
	this.constructor = config.constructor;
	this.methods = config.methods;
};

Interface.prototype.getConstructor = function () {
	return this.constructor;
},

Interface.prototype.getMethods = function () {
	return this.methods;
};

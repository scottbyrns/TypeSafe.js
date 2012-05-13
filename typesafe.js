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

Object.prototype.__setType = function (type) {
	this.__objectType__ = type;
	return this;
};

Object.prototype.__checkType = function (object) {
	var type = object;
	if (type == this.__objectType__) {
		return this;
	}
	throw new Error("Object of type: " + type + " found, expected object of type: " + this.__objectType__);
};

Object.prototype.__getType = function () {
	if (this.__objectType__ === "undefined") {
		this.__objectType__ = typeof this;
	}
	return this.__objectType__;
};

Function.prototype.checkType = function () {
	for (var i = 0; i < arguments.length; i += 1) {
		var type = (typeof arguments[i]);
		try {
			arguments[i].__getType();
		}
		catch (e) {
			// No type probabbly a primative.
		}
		if (this.__interface__['input-parameters']) {
			if (this.__interface__['input-parameters'][i].type != type) {
				throw new Error("Expected value of type: " + this.__interface__['input-parameters'][i].type + " but found value of type: " + type + ' for argument named: ' + this.__interface__['input-parameters'][i].name);
			}	
		}
	}
	return true;
}

Function.prototype.__set_interface__ = Object.prototype.__set_interface__ = function (interface) {
	this.__interface__ = interface;
};

Function.prototype.getInterface = Object.prototype.getInterface = function () {
	return this.__interface__;
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
	if (this.__interface__ == undefined && object && object.__interface__) {
		throw new Error("Interface was not defined.");
	}
	if (object.__interface__) {
		if (object.__interface__['input-parameters'] && this.__interface__['input-parameters']) {
			for (
				var valueIndex = 0, valueLength = this.__interface__['input-parameters'].length;
				valueIndex < valueLength;
				valueIndex += 1
			)
			{
				if (this.__interface__['return-value'].type != object.__interface__['return-value'].type) {
					throw new Error([
						"Provided object does not return a value of type: ",
						this.__interface__['return-value'].type
					].join(""));
				}
				if (this.__interface__['input-parameters'][valueIndex].name != object.__interface__['input-parameters'][valueIndex].name) {
					throw new Error([
						"Provided object does accept argument named: ",
						this.__interface__['input-parameters'][valueIndex].name,
						'.'
					].join(''));
				}
				if (this.__interface__['input-parameters'][valueIndex].type != object.__interface__['input-parameters'][valueIndex].type) {
					throw new Error([
						"Provided object does accept argument named: ",
						this.__interface__['input-parameters'][valueIndex].name,
						' of type ',
						this.__interface__['input-parameters'][valueIndex].type,
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
			// Creating an access controll list for restricting method access.
			var methodAccessControlList = {};
			try {
				var methodInterfaces = Interface.getInterfaceNamed(config.implements).methods;
			}
			catch (e) {
				throw new Error("Interface definition for: " + config.implements + " not found.");
			}
			for (var mii = 0; mii < methodInterfaces.length; mii += 1) {
				var method = methodInterfaces[mii];
				methodAccessControlList[method.name] = {scope:method.interface.scope, uid:new Date().getTime()} || {scope:'private', uid:new Date().getTime()};
			}
			return function () {
				if (this == __GLOBAL_NAMESPACE__) {
					throw new Error("No static constructor is available for this type safe class.");
				}
				try {
					this.__setType(config.type);
					config.constructor.__set_interface__(Interface.getInterfaceNamed(config.implements).getConstructor());
					config.constructor.checkType.apply(arguments);
					config.constructor.apply(this, arguments);
					this.__set_interface__(Interface.getInterfaceNamed(config.implements));
				}
				catch (e) {
					console.log(e);
					throw new Error("No static constructor is available for this type safe class.")
				}
				this.__get_access_control_list__ = function (internalCall) {
					return methodAccessControlList;
				}
			};
		}(config);
		theClass.__set_interface__(Interface.getInterfaceNamed(config.implements));

		var properties = config.properties;
		var privateProperties = {};
		for (propertyIndex in properties) {
			if (properties.hasOwnProperty(propertyIndex)) {
				var txt = properties[propertyIndex].name;
				var type = properties[propertyIndex].type;
				var camelCasedMethodName = txt.substr(0, 1).toUpperCase() + txt.substr(1, txt.length);
				config['get' + camelCasedMethodName] = theClass.prototype['get' + camelCasedMethodName] = function () {
					return privateProperties[txt];
				};
				config['set' + camelCasedMethodName] = theClass.prototype['set' + camelCasedMethodName] = function (typedValue) {
					var inputType = (typeof typedValue);
					if (typedValue.__getType && typedValue.__getType() != undefined) {
						inputType = typedValue.__getType();						
					}

					if (inputType == type) {
						privateProperties[txt] = arguments[0];
					}
					else {
						throw new Error("Expected value of type: " + type + " but found value of type: " + inputType);
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
					config[method.name].__set_interface__(method.interface);
					var operation = function () {
						var allGo = config[method.name].checkType.apply(arguments);
						if (this.__get_access_control_list__()[method.name].scope == 'private') {
							if (this.__access_token__ != this.__get_access_control_list__()[method.name].uid) {
								throw new Error("Access violation. Call to private method.");
							}
						}
						if (allGo) {
							// Issue UID to our object.
							this.__access_token__ = this.__get_access_control_list__()[method.name].uid;
							var input = config[method.name].getInterface()['input-parameters'];
							if (!(input == undefined && arguments.length == 0)) {
								for (var i = 0, len = input.length; i < len; i += 1) {
									try {
										var type = arguments[i].__getType() || typeof arguments[i];
										try {
											if (Interface.getInterfaceNamed(input[i].type).hasAliasOf(type)) {
												type = input[i].type;
											}
										}
										catch (e) {
											// No aliases.
										}
										if (input[i].type != type) {
											throw new Error("Invalid argument for parameter named: " + input[i].name + ". Expected input of type: " + input[i].type + " but received input of type: " + type + ".");
										}
									}
									catch (e) {
										throw e;
										throw new Error("Invalid arguments.");
									}
								}	
							}
							else if (input == undefined && arguments.length > 0) {
								throw new Error("No arguments were expected.");
							}
							var output = config[method.name].apply(this, arguments);
							// Strip the UID now that our method call is finished.
							this.__access_token__ = undefined;
							return output;
						}
					};
					operation.__set_interface__(method.interface);
					return operation;
				}
				else {
					throw new Error("Class does not implement " + method.name);
				}
			}(method);

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
	
	var Interface = function (interfaceRegister) {
		return function (config) {
			this.__setType(config.type);
			this.constructor = config.constructor;
			this.methods = config.methods;
			this.alias = config.alias;
			interfaceRegister[config.type] = this;
		};
	}(interfaceRegister);
	
	Interface.prototype.hasAliasOf = function (alias) {
		for (var i = 0; i < this.alias.length; i += 1) {
			if (this.alias[i] == alias) {
				return true;
			}
		}
		return false;
	};

	Interface.prototype.getConstructor = function () {
		return this.constructor;
	};

	Interface.prototype.getMethods = function () {
		return this.methods;
	};

	// 
	// Interface.prototype.toXML = function () {
	// 	
	// };
	// 
	// Interface.prototype.toJSON = function () {
	// 
	// };
	// 
	// Interface.prototype.toJava = function () {
	// 	var outputObject = {
	// 		type: this.getType(),
	// 		constructor: this.constructor,
	// 		methods: this.methods
	// 	};
	// };
	// 
	// Interface.prototype.toObjC = function () {
	// 	
	// };
	// 
	// Interface.prototype.python = function () {
	// 	
	// };
	// 

	Interface.getInterfaceNamed = function (interfaceRegister) {
		return function (name) {
			return interfaceRegister[name];
		}
	}(interfaceRegister);
	return Interface;
}();


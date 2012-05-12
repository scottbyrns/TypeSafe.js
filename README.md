## TypeSafe.js

Type safety for javascript.

### Notes ###
Automatic type safe getter and setter generation for properties.
All type violations should throw exceptions. I need to add specific type exceptions that can be handled specifically.
No autoboxing for primatives yet.
Not much error handling in the way of stabalizing unhappy paths through the code.

### Example Ussage
```java
var IntegerInterface = new Interface({
	type: "integer-interface",
	constructor: {
		'return-value': {
			type: 'int'
		},
		'input-parameters': [
			{
				name: 'factor',
				type: 'number'
			}
		]
	}
});

var Integer = new TypeSafeClass({
	type: 'int',
	extends: IntegerInterface,
	constructor: function (value) {
		this.setValue(value || 0);
	},
	properties: [
		{
			name: 'value',
			type: 'number'
		}
	],
	instanceMethods: [
		{
			name: "multiplyBy",
			interface: {
				'return-value': {
					type: 'int'
				},
				'input-parameters': [
					{
						name: 'factor',
						type: 'int'
					}
				]
			},
			operation: function (factor) {
				return new Integer(this.getValue() * factor.getValue());
			}
		}
	]
});
```

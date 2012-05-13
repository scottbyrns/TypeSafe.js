## TypeSafe.js

Type safety for javascript.

### Notes ###
* Automatic type safe getter and setter generation for properties.
* Private & Public methods.
* All type violations should throw exceptions. I need to add specific type exceptions that can be handled specifically.
* No auto-boxing for primitives yet.
* Not much error handling in the way of stabilizing unhappy paths through the code.

### Example Usage
```java
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
			'scope': 'public',
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
	},
	{
		name: "doMultiply",
		interface: {
			'scope': 'private',
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
		return this.doMultiply(factor);
	},
	doMultiply: function (factor) {
		return new com.example.Integer(this.getValue() * factor.getValue());
	}
});

var rows = new com.example.Integer(2);
var columns = new com.example.Integer(7);
columns.setValue(12);

var cells = rows.multiplyBy(columns);
cells.getValue(); // 24



```

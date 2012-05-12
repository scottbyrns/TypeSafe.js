## TypeSafe.js

Type safety for javascript.

### Notes ###
Automatic type safe getter and setter generation for properties.
All type violations should throw exceptions. I need to add specific type exceptions that can be handled specifically.
No autoboxing for primatives yet.
Not much error handling in the way of stabalizing unhappy paths through the code.

### Example Ussage
```java
new Interface({
	type: "Integer",
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
	},
	methods: [
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
			}
		}
	]
});

var Integer = new TypeSafeClass({
	type: 'int',
	implements: 'Integer',
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
		return new Integer(this.getValue() * factor.getValue());
	}
});

var rows = new Integer(2);
var columns = new Integer(2);
columns.setValue(12);

var cells = rows.multiplyBy(columns);
cells.getValue(); // 24

```

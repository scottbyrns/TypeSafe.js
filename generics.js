new Interface({
	type: "com.example.Integer",
	alias: [
		"number"
	],
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
	implements: 'com.example.Integer',
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
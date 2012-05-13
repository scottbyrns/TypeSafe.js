new Interface({
	type: "com.scottbyrns.geo.Location",
	constructor: {
		'return-value': {
			type: 'com.scottbyrns.geo.Location'
		},
		'input-parameters': [
			{
				name: "latitude",
				type: "number"
			},
			{
				name: "longitude",
				type: "number"
			}
		]
	},
	methods: [
	// public double getLatitude()
	{
		name: "getLatitude",
		interface: {
			'scope': 'public',
			'return-value': {
				type: 'com.example.Integer'
			}
		}
	},
	{
		name: "getLongitude",
		interface: {
			'scope': 'public',
			'return-value': {
				type: 'com.example.Integer'
			}
		}
	},
	// public void setLatitude(float latitude)
	{
		name: "setLatitude",
		interface: {
			'scope': 'public',
			'return-value': {
				type: 'com.example.Integer'
			},
			'input-parameters': [
				{
					name: 'latitude',
					type: 'com.example.Integer'
				}
			]
		}
	},
	{
		name: "setLongitude",
		interface: {
			'scope': 'public',
			'return-value': {
				type: 'com.example.Integer'
			},
			'input-parameters': [
				{
					name: 'longitude',
					type: 'com.example.Integer'
				}
			]
		}
	},
	],
	
});
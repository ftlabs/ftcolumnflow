var config = module.exports;


config["My tests"] = {
    rootPath: "../",
    environment: "browser", // or "node"
    sources: [
        "src/FTColumnflow.js",
    ],
    tests: [
        "test/*-test.js"
    ],
    testHelpers: [
        "test/helpers/*.js"
    ],
    resources: [
    	{
			path: "/",
			content: '<!DOCTYPE html>\n'
				+ '<html lang="en">\n'
				+ '  <head>\n'
				+ '    <title>Custom Buster.JS test bed</title>\n'
				+ '    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">\n'
				+ '  </head>\n'
				+ '  <body></body>\n'
				+ '</html>'
		},
		{
			path: '/all.css',
			file: 'test/css/AllTests.css',
		},
		{
			path: '/config.css',
			file: 'test/css/ConfigTest.css',
		},
		{
			path: '/columnwrap.css',
			file: 'test/css/ColumnWrapTest.css',
		},
		{
			path: '/baselinegrid.css',
			file: 'test/css/BaselineGridTest.css',
		},
		{
			path: '/fixedelements.css',
			file: 'test/css/FixedElementsTest.css',
		},
		{
			path: '/reflow.css',
			file: 'test/css/ReflowTest.css',
		}
	]
}

// Add more configuration groups as needed




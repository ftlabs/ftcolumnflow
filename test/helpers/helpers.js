var cf, target, viewport;

function createCf(config) {
	cf = new FTColumnflow('targetid', 'viewportid', config || {
		columnGap   : 25,
		columnCount : 3
	});
	target   = document.getElementById('targetid');
	viewport = document.getElementById('viewportid');

	return cf;
}

function cssProp(element, property) {
    return window.getComputedStyle(element, null).getPropertyValue(property);
}

var assert = buster.assert;
var refute = buster.refute;
var expect = buster.expect;
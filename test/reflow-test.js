/**
 * FTColumnflow Reflow test suite
 *
 * @copyright The Financial Times Limited [All Rights Reserved]
*/


buster.testCase('Reflow', {

	setUp : function(done) {
		this.timeout = 1000;
		document.body.innerHTML = '<div id="viewportid"><div id="targetid"></div></div>';
		addStylesheets(['all.css', 'reflow.css'], done);
	},

	tearDown : function() {
		removeStyleSheets();
		document.body.className = '';
	},

	'ShouldRewriteCssBlockAndNotAddItAgain' : function() {

		var lengthBefore = document.getElementsByTagName('style').length;

		createCf().flow('<div class="height600">height600</div>');

		var lengthAfter = document.getElementsByTagName('style').length;

		cf.flow();

		assert.match(document.getElementsByTagName('style').length, lengthAfter);
	},

	'//ShouldReflow' : function() {

		// page is 800 x 600, columns are 350 x 600
		createCf({
			columnGap     : 100,
			columnCount   : 2,
		}).flow('<div class="height3000">height3000</div>');

		// Change viewport dimensions
		viewport.style.width  = "600px";
		viewport.style.height = "500px";

		// page is 600 x 500, columns are 250 x 500
		cf.reflow();

		assert.match(target.querySelectorAll('.cf-page-1').length, 1);

		var page = target.querySelector('.cf-page-1');

		assertTrue(page instanceof HTMLElement);
		assert.match(page.clientWidth, 600);
		assert.match(page.clientHeight, 500);

		var column1 = page.querySelector('.cf-column-1');
		var column2 = page.querySelector('.cf-column-2');

		assert.match(column1.clientWidth, 250);
		assert.match(column1.clientHeight, 500);

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 1);

		assert.match(column2.childNodes[0].style.marginTop, '-500px');
	},

	'ShouldReflowUsingNewConfig' : function() {

		createCf({
			columnGap     : 100,
			columnCount   : 2
		}).flow('<div class="height3000">height3000</div>');

		var column1 = target.querySelector('.cf-page-1 .cf-column-1');

		assert.match(column1.clientWidth, 350);
		assert.match(column1.clientHeight, 600);
		assert.match(target.querySelectorAll('.cf-page-1 .cf-column').length, 2);
		assert.match(column1.childNodes.length, 1);
		assert.className(column1.childNodes[0], 'height3000');

		cf.reflow({
			columnGap   : 25,
			columnCount : 3,
		});

		var column1 = target.querySelector('.cf-page-1 .cf-column-1');

		assert.match(column1.clientWidth, 250);
		assert.match(column1.clientHeight, 600);
		assert.match(target.querySelectorAll('.cf-page-1 .cf-column').length, 3);
		assert.match(column1.childNodes.length, 1);
	},

	'ShouldRemoveStylesAndDomNodesOnDestroy' : function() {

		var stylesBefore = document.querySelectorAll('style').length;

		createCf().flow('<div class="height3000">height3000</div>');

		assert.defined(target);
		refute.equals(target.innerHTML, '');
		assert.match(document.querySelectorAll('style').length, (stylesBefore + 1));

		cf.destroy();

		assert.isNull(document.getElementById('targetid'));
		assert.match(document.querySelectorAll('style').length, stylesBefore);
	},


/*


// NB - height sanitizing routine should not round up every time the line-height is changed! Need to work with the original, untouched elements and padding each time, and round up without modifying them somehow.

//*/

});
/**
 * FTColumnflow Reflow test suite
 *
 * @copyright The Financial Times Limited [All Rights Reserved]
*/


function createCf(config) {
	cf = new FTColumnflow('targetid', 'viewportid', config || {
		columnGap   : 25,
		columnCount : 3
	});
	target   = document.getElementById('targetid');
	viewport = document.getElementById('viewportid');

	return cf;
}


TestCase('Reflow', {

	setUp : function() {
		document.body.innerHTML = '<div id="viewportid"><div id="targetid"></div></div>';
		document.body.className = 'reflow';
	},

	tearDown : function() {

		var styles = document.getElementsByTagName('style');
		for (var i = 0, len = styles.length; i < len; i++) {
			if (styles[i] && styles[i].nodeType == 1) styles[i].parentNode.removeChild(styles[i]);
		}
	},

	testItShouldRewriteCssBlockAndNotAddItAgain : function() {

		var lengthBefore = document.getElementsByTagName('style').length;

		createCf().flow('<div class="height600">height600</div>');

		var lengthAfter = document.getElementsByTagName('style').length;

		cf.flow();

		assertEquals(lengthAfter, document.getElementsByTagName('style').length);
	},

/*
	testItShouldReflow : function() {

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

		assertEquals(1, target.querySelectorAll('.cf-page-1').length);

		var page = target.querySelector('.cf-page-1');

		assertTrue(page instanceof HTMLElement);
		assertEquals(600, page.clientWidth);
		assertEquals(500, page.clientHeight);

		var column1 = page.querySelector('.cf-column-1');
		var column2 = page.querySelector('.cf-column-2');

		assertEquals(250, column1.clientWidth);
		assertEquals(500, column1.clientHeight);

		assertEquals(1, column1.childNodes.length);
		assertEquals(1, column2.childNodes.length);

		assertEquals('-500px', column2.childNodes[0].style.marginTop);
	},
 */

	testItShouldReflowUsingNewConfig : function() {

		createCf({
			columnGap     : 100,
			columnCount   : 2,
		}).flow('<div class="height3000">height3000</div>');

		var column1 = target.querySelector('.cf-page-1 .cf-column-1');

		assertEquals(350, column1.clientWidth);
		assertEquals(600, column1.clientHeight);
		assertEquals(2, target.querySelectorAll('.cf-page-1 .cf-column').length);
		assertEquals(1, column1.childNodes.length);
		assertClassName('height3000', column1.childNodes[0]);

		cf.reflow({
			columnGap   : 25,
			columnCount : 3,
		});

		var column1 = target.querySelector('.cf-page-1 .cf-column-1');

		assertEquals(250, column1.clientWidth);
		assertEquals(600, column1.clientHeight);
		assertEquals(3, target.querySelectorAll('.cf-page-1 .cf-column').length);
		assertEquals(1, column1.childNodes.length);
	},

	testItShouldRemoveStylesAndDomNodesOnDestroy : function() {

		var stylesBefore = document.querySelectorAll('style').length;

		createCf().flow('<div class="height3000">height3000</div>');

		assertNotUndefined(target);
		assertNotEquals('', target.innerHTML);
		assertEquals((stylesBefore + 1), document.querySelectorAll('style').length);

		cf.destroy();

		assertNull(document.getElementById('targetid'));
		assertEquals(stylesBefore, document.querySelectorAll('style').length);
	},


/*


// NB - height sanitizing routine should not round up every time the line-height is changed! Need to work with the original, untouched elements and padding each time, and round up without modifying them somehow.

//*/

});
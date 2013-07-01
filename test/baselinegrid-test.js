/**
 * FTColumnflow BaselineGrid test suite
 *
 * @copyright The Financial Times Limited [All Rights Reserved]
*/


buster.testCase('BaselineGrid', {
	setUp : function(done) {
		document.body.innerHTML = '<div id="viewportid"><div id="targetid"></div></div>';
		addStylesheets(['all.css', 'baselinegrid.css'], done);
	},

	tearDown : function() {
		removeStyleSheets();
		document.body.className = '';
	},

	'ShouldRemoveTopMarginOnFirstElement' : function() {

		createCf().flow('<p>flowedContent</p>');

		var column  = target.querySelector('.cf-column-1');
		var p       = column.querySelector('p');

		assert.match(p.offsetTop, 0);
		assert.match(cssProp(p, 'margin-top'), '0px');
	},

	'ShouldReduceColumnHeightToNearestMultipleOfLineheight' : function() {

		document.body.className = 'lineheight17';

		createCf().flow('<p>flowedContent</p>');

		var column  = target.querySelector('.cf-column-1');

		assert.match(column.offsetHeight, 595);
	},

	'ShouldReduceColumnHeightToNearestMultipleOfLineheight' : function() {

		document.body.className = 'lineheight17';

		createCf().flow('<p>flowedContent</p>');

		var column  = target.querySelector('.cf-column-1');

		assert.match(column.offsetHeight, 595);
	},

	'ShouldCalculateCorrectGridHeightWhenLineheightIsInEms' : function() {

		document.body.className = 'lineheight-in-ems';

		createCf({
			columnGap     : 20,
			columnCount   : 2,
			pagePadding   : 50,
			pageArrangement : 'vertical',
		}).flow('<p>flowedContent</p>');

		var column  = target.querySelector('.cf-column-1');

		assert.match(column.offsetHeight, 493);
	},

	'ShouldCalculateCorrectGridHeightWhenLineheightIsInPercent' : function() {

		document.body.className = 'lineheight-in-percent';

		createCf({
			columnGap     : 20,
			columnCount   : 2,
			pagePadding   : 50,
			pageArrangement : 'vertical',
		}).flow('<p>flowedContent</p>');

		var column  = target.querySelector('.cf-column-1');

		assert.match(column.offsetHeight, 493);
	},

	'ShouldCalculateCorrectGridHeightWhenLineheightIsInherit' : function() {

		document.body.className = 'lineheight-inherit';

		createCf({
			columnGap     : 20,
			columnCount   : 2,
			pagePadding   : 50,
			pageArrangement : 'vertical',
		}).flow('<p>flowedContent</p>');

		var column  = target.querySelector('.cf-column-1');

		assert.match(column.offsetHeight, 493);
	},

	'ShouldCalculateCorrectGridHeightWhenLineheightIsMultiplier' : function() {

		document.body.className = 'lineheight-multiplier';

		createCf({
			columnGap     : 20,
			columnCount   : 2,
			pagePadding   : 50,
			pageArrangement : 'vertical',
		}).flow('<p>flowedContent</p>');

		var column  = target.querySelector('.cf-column-1');

		assert.match(column.offsetHeight, 493);
	},

	'ShouldCalculateCorrectGridHeightWhenLineheightIsNormal' : function() {

		document.body.className = 'lineheight-normal';

		createCf().flow('<p>Test paragraph</p><p class="ten-elements">&nbsp;<br />&nbsp;<br />&nbsp;<br />&nbsp;<br />&nbsp;<br />&nbsp;<br />&nbsp;<br />&nbsp;<br />&nbsp;<br />&nbsp;</p>');

		var column = target.querySelector('.cf-column-1');
		var span   = column.querySelector('.ten-elements');

		var lineHight = span.offsetHeight / 10;

		assert.match((column.offsetHeight % lineHight) , 0);
	},

	'ShouldUseTheMedianLineheightFromASampleOfElements' : function() {

		document.body.className = 'lineheight-variable';

		createCf().flow('<p>Test paragraph</p><p>Test paragraph</p><p>Test paragraph</p><p>Test paragraph</p><p>Test paragraph</p>');

		var column  = target.querySelector('.cf-column-1');

		assert.match(column.offsetHeight, 595);
	},

	'ShouldAddMoreElementsIfThereAreNotEnoughToGetAMedianSample' : function() {

		document.body.className = 'lineheight-variable';

		createCf().flow('<p>Test paragraph</p><p>Test paragraph</p>');

		var column  = target.querySelector('.cf-column-1');

		assert.match(column.offsetHeight, 595);
	},

	'ShouldUseLineHeightIfSpecifiedAndNotCalculateIt' : function() {

		document.body.className = 'lineheight-variable';

		createCf({
			columnGap   : 25,
			columnCount : 3,
			lineHeight  : 19
		}).flow('<p>Test paragraph</p><p>Test paragraph</p><p>Test paragraph</p><p>Test paragraph</p><p>Test paragraph</p>');

		var column  = target.querySelector('.cf-column-1');

		assert.match(column.offsetHeight, 589);
	},

	'ShouldNotPadElementsByDefault' : function() {

		document.body.className = 'unpadded-parags';

		createCf().flow('<p>Test paragraph</p><p>Test paragraph</p><p>Test paragraph</p>');

		var column = target.querySelector('.cf-column-1');
		var parags = column.getElementsByTagName('p');

		assert.match(parags[0].offsetHeight, 53);
		assert.match(parags[1].offsetHeight, 53);
		assert.match(parags[2].offsetHeight, 53);

		assert.match(parags[0].offsetTop, 0);
		assert.match(parags[1].offsetTop, 73);
		assert.match(parags[2].offsetTop, 146);
	},

	'ShouldPadElementsWhenConfigured' : function() {

		document.body.className = 'unpadded-parags';

		createCf({
			standardiseLineHeight : true,
		}).flow('<p>Test paragraph</p><p>Test paragraph</p><p>Test paragraph</p>');

		var column = target.querySelector('.cf-column-1');
		var parags = column.getElementsByTagName('p');

		assert.match(parags[0].offsetHeight, 60);
		assert.match(parags[1].offsetHeight, 60);
		assert.match(parags[2].offsetHeight, 60);

		assert.match(parags[0].offsetTop, 0);
		assert.match(parags[1].offsetTop, 80);
		assert.match(parags[2].offsetTop, 160);
	},

	'ShouldPadElementsIgnoringPlainTextNodes' : function() {

		document.body.className = 'unpadded-parags';

		createCf({
			standardiseLineHeight : true,
		}).flow('<p>Test paragraph</p>\n<p>Test paragraph</p>\n<p>Test paragraph</p>');

		var column = target.querySelector('.cf-column-1');
		var parags = column.getElementsByTagName('p');

		assert.match(parags[0].offsetHeight, 60);
		assert.match(parags[1].offsetHeight, 60);
		assert.match(parags[2].offsetHeight, 60);

		assert.match(parags[0].offsetTop, 0);
		assert.match(parags[1].offsetTop, 80);
		assert.match(parags[2].offsetTop, 160);
	},

	'RegressionItShouldNotMissOffEndOfLastElement' : function() {

		document.body.className = 'unequal-margin';

		createCf().flow('<p class="unequal-margin height1140">height1140</p><p class="unequal-margin height40">height40</p>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');
		var column3 = target.querySelector('.cf-column-3');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 2);
		assert.match(column3.childNodes.length, 1);

		assert.match(column3.childNodes[0].style.marginTop, '-20px');
	},

	'RegressionItShouldNotRepeatALine' : function() {

		document.body.className = 'unequal-margin';

		createCf().flow('<p class="height600">height600</p><p class="height620">height620</p>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');
		var column3 = target.querySelector('.cf-column-3');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 1);
		assert.match(column3.childNodes.length, 1);

		assert.match(column3.childNodes[0].style.marginTop, '-600px');
	},

	'RegressionItShouldRemoveTopMarginOfFirstParagInAColumn' : function() {

		document.body.className = 'unequal-margin';

		createCf().flow('<p class="height580"></p><p>test parag</p>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 1);

		assert.match(column2.childNodes[0].style.marginTop, '0px');
	},

//*/

});
/**
 * FTColumnflow BaselineGrid test suite
 *
 * @copyright The Financial Times Limited [All Rights Reserved]
*/


function createCf(config) {
	cf = new FTColumnflow('targetid', 'viewportid', config || {
		columnGap   : 25,
		columnCount : 3
	});
	target = document.getElementById('targetid');

	return cf;
}

TestCase('BaselineGrid', {

	setUp : function() {
		document.body.innerHTML = '<div id="viewportid"><div id="targetid"></div></div>';
		document.body.className = 'baselinegrid';
	},

	tearDown : function() {

		var styles = document.getElementsByTagName('style');
		for (var i = 0, len = styles.length; i < len; i++) {
			if (styles[i] && styles[i].nodeType == 1) styles[i].parentNode.removeChild(styles[i]);
		}
	},

	testItShouldRemoveTopMarginOnFirstElement : function() {

		createCf().flow('<p>flowedContent</p>');

		var column  = target.querySelector('.cf-column-1');
		var p       = column.querySelector('p');

		assertEquals(0, p.offsetTop);
		assertEquals('0px', window.getComputedStyle(p).getPropertyValue('margin-top'));
	},

	testItShouldReduceColumnHeightToNearestMultipleOfLineheight : function() {

		document.body.classList.add('lineheight17');

		createCf().flow('<p>flowedContent</p>');

		var column  = target.querySelector('.cf-column-1');

		assertEquals(595, column.offsetHeight);
	},

	testItShouldReduceColumnHeightToNearestMultipleOfLineheight : function() {

		document.body.classList.add('lineheight17');

		createCf().flow('<p>flowedContent</p>');

		var column  = target.querySelector('.cf-column-1');

		assertEquals(595, column.offsetHeight);
	},

	testItShouldCalculateCorrectGridHeightWhenLineheightIsInEms : function() {

		document.body.classList.add('lineheight-in-ems');

		createCf({
			columnGap     : 20,
			columnCount   : 2,
			pagePadding   : 50,
			pageArrangement : 'vertical',
		}).flow('<p>flowedContent</p>');

		var column  = target.querySelector('.cf-column-1');

		assertEquals(493, column.offsetHeight);
	},

	testItShouldCalculateCorrectGridHeightWhenLineheightIsInPercent : function() {

		document.body.classList.add('lineheight-in-percent');

		createCf({
			columnGap     : 20,
			columnCount   : 2,
			pagePadding   : 50,
			pageArrangement : 'vertical',
		}).flow('<p>flowedContent</p>');

		var column  = target.querySelector('.cf-column-1');

		assertEquals(493, column.offsetHeight);
	},

	testItShouldCalculateCorrectGridHeightWhenLineheightIsInherit : function() {

		document.body.classList.add('lineheight-inherit');

		createCf({
			columnGap     : 20,
			columnCount   : 2,
			pagePadding   : 50,
			pageArrangement : 'vertical',
		}).flow('<p>flowedContent</p>');

		var column  = target.querySelector('.cf-column-1');

		assertEquals(493, column.offsetHeight);
	},

	testItShouldCalculateCorrectGridHeightWhenLineheightIsMultiplier : function() {

		document.body.classList.add('lineheight-multiplier');

		createCf({
			columnGap     : 20,
			columnCount   : 2,
			pagePadding   : 50,
			pageArrangement : 'vertical',
		}).flow('<p>flowedContent</p>');

		var column  = target.querySelector('.cf-column-1');

		assertEquals(493, column.offsetHeight);
	},

	testItShouldCalculateCorrectGridHeightWhenLineheightIsNormal : function() {

		document.body.classList.add('lineheight-normal');

		createCf().flow('<p>Test paragraph</p><p class="ten-elements">&nbsp;<br />&nbsp;<br />&nbsp;<br />&nbsp;<br />&nbsp;<br />&nbsp;<br />&nbsp;<br />&nbsp;<br />&nbsp;<br />&nbsp;</p>');

		var column = target.querySelector('.cf-column-1');
		var span   = column.querySelector('.ten-elements');

		var lineHight = span.offsetHeight / 10;

		assertEquals(0, (column.offsetHeight % lineHight) );
	},

	testItShouldUseTheMedianLineheightFromASampleOfElements : function() {

		document.body.classList.add('lineheight-variable');

		createCf().flow('<p>Test paragraph</p><p>Test paragraph</p><p>Test paragraph</p><p>Test paragraph</p><p>Test paragraph</p>');

		var column  = target.querySelector('.cf-column-1');

		assertEquals(595, column.offsetHeight);
	},

	testItShouldAddMoreElementsIfThereAreNotEnoughToGetAMedianSample : function() {

		document.body.classList.add('lineheight-variable');

		createCf().flow('<p>Test paragraph</p><p>Test paragraph</p>');

		var column  = target.querySelector('.cf-column-1');

		assertEquals(595, column.offsetHeight);
	},

	testItShouldUseLineHeightIfSpecifiedAndNotCalculateIt : function() {

		document.body.classList.add('lineheight-variable');

		createCf({
			columnGap   : 25,
			columnCount : 3,
			lineHeight  : 19
		}).flow('<p>Test paragraph</p><p>Test paragraph</p><p>Test paragraph</p><p>Test paragraph</p><p>Test paragraph</p>');

		var column  = target.querySelector('.cf-column-1');

		assertEquals(589, column.offsetHeight);
	},

	testitShouldNotPadElementsByDefault : function() {

		document.body.classList.add('unpadded-parags');

		createCf().flow('<p>Test paragraph</p><p>Test paragraph</p><p>Test paragraph</p>');

		var column = target.querySelector('.cf-column-1');
		var parags = column.getElementsByTagName('p');

		assertEquals(53, parags[0].offsetHeight);
		assertEquals(53, parags[1].offsetHeight);
		assertEquals(53, parags[2].offsetHeight);

		assertEquals(0, parags[0].offsetTop);
		assertEquals(73, parags[1].offsetTop);
		assertEquals(146, parags[2].offsetTop);
	},

	testitShouldPadElementsWhenConfigured : function() {

		document.body.classList.add('unpadded-parags');

		createCf({
			standardiseLineHeight : true,
		}).flow('<p>Test paragraph</p><p>Test paragraph</p><p>Test paragraph</p>');

		var column = target.querySelector('.cf-column-1');
		var parags = column.getElementsByTagName('p');

		assertEquals(60, parags[0].offsetHeight);
		assertEquals(60, parags[1].offsetHeight);
		assertEquals(60, parags[2].offsetHeight);

		assertEquals(0, parags[0].offsetTop);
		assertEquals(80, parags[1].offsetTop);
		assertEquals(160, parags[2].offsetTop);
	},

	testitShouldPadElementsIgnoringPlainTextNodes : function() {

		document.body.classList.add('unpadded-parags');

		createCf({
			standardiseLineHeight : true,
		}).flow('<p>Test paragraph</p>\n<p>Test paragraph</p>\n<p>Test paragraph</p>');

		var column = target.querySelector('.cf-column-1');
		var parags = column.getElementsByTagName('p');

		assertEquals(60, parags[0].offsetHeight);
		assertEquals(60, parags[1].offsetHeight);
		assertEquals(60, parags[2].offsetHeight);

		assertEquals(0, parags[0].offsetTop);
		assertEquals(80, parags[1].offsetTop);
		assertEquals(160, parags[2].offsetTop);
	},

	testRegressionItShouldNotMissOffEndOfLastElement : function() {

		document.body.classList.add('unequal-margin');

		createCf().flow('<p class="unequal-margin height1140">height1140</p><p class="unequal-margin height40">height40</p>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');
		var column3 = target.querySelector('.cf-column-3');

		assertEquals(1, column1.childNodes.length);
		assertEquals(2, column2.childNodes.length);
		assertEquals(1, column3.childNodes.length);

		assertEquals('-20px', column3.childNodes[0].style.marginTop);
	},

	testRegressionItShouldNotRepeatALine : function() {

		document.body.classList.add('unequal-margin');

		createCf().flow('<p class="height600">height600</p><p class="height620">height620</p>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');
		var column3 = target.querySelector('.cf-column-3');

		assertEquals(1, column1.childNodes.length);
		assertEquals(1, column2.childNodes.length);
		assertEquals(1, column3.childNodes.length);

		assertEquals('-600px', column3.childNodes[0].style.marginTop);
	},

	testRegressionItShouldRemoveTopMarginOfFirstParagInAColumn : function() {

		document.body.classList.add('unequal-margin');

		createCf().flow('<p class="height580"></p><p>test parag</p>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assertEquals(1, column1.childNodes.length);
		assertEquals(1, column2.childNodes.length);

		assertEquals('0px', column2.childNodes[0].style.marginTop);
	},

//*/

});
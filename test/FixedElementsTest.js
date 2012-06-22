/**
 * FTColumnflow FixedElements test suite
 *
 * @copyright The Financial Times Limited [All Rights Reserved]
*/

var cf, target, viewport;

function createCf(config) {
	cf = new FTColumnflow('targetid', 'viewportid', config || {
		columnGap   : 25,
		columnCount : 3
	});
	target   = document.getElementById('targetid');

	return cf;
}

TestCase('FixedElements', {

	setUp : function() {
		document.body.innerHTML = '<div id="viewportid"><div id="targetid"></div></div>';
		document.body.className = 'fixedelements';
	},

	tearDown : function() {

		var styles = document.getElementsByTagName('style');
		for (var i = 0, len = styles.length; i < len; i++) {
			if (styles[i] && styles[i].nodeType == 1) styles[i].parentNode.removeChild(styles[i]);
		}
	},

	testItShouldCreateAHiddenPreloadArea : function() {

		createCf().flow();

		var preload = target.querySelector('.cf-preload-fixed');

		assertTrue(preload instanceof HTMLElement);
		assertEquals('hidden', window.getComputedStyle(preload).getPropertyValue('visibility'));
		assertEquals('absolute', window.getComputedStyle(preload).getPropertyValue('position'));
	},

	testItShouldAddFlowedContentToPreloadArea : function() {

		createCf().flow('', '<div class="fixed">fixedContent</div>');

		var preload = target.querySelector('.cf-preload-fixed');

		assertMatch(/^<div[^.]*>fixedContent<\/div>$/, preload.innerHTML);
	},

	testAFixedElementShouldBePlacedOnPage1 : function() {

		createCf().flow('<p>flowedContent</p>', '<div class="fixed">fixedContent</div>');

		var page   = target.querySelector('.cf-page-1');
		var fixed  = page.querySelector('.fixed');

		assertEquals(2, page.childNodes.length);
		assertTrue(fixed instanceof HTMLElement);
		assertEquals('fixedContent', fixed.innerHTML);
	},

	testTextNodesShouldBeIgnored : function() {

		createCf().flow('<p>flowedContent</p>', '\n<div class="fixed">fixedContent</div>\n');

		var page   = target.querySelector('.cf-page-1');
		var fixed  = page.querySelector('.fixed');

		assertEquals(2, page.childNodes.length);
		assertTrue(fixed instanceof HTMLElement);
		assertEquals('fixedContent', fixed.innerHTML);
	},

	testAFixedElementShouldBePlacedAbsoluteTopLeftByDefault : function() {

		createCf().flow('<p>flowedContent</p>', '<div class="fixed">fixedContent</div>');

		var page   = target.querySelector('.cf-page-1');
		var fixed  = page.querySelector('.fixed');

		assertEquals('absolute', window.getComputedStyle(fixed).getPropertyValue('position'));
		assertEquals(0, fixed.offsetTop);
		assertEquals(0, fixed.offsetLeft);
	},

	testAFixedElementShouldRespectPagePadding : function() {

		createCf({
			columnGap     : 25,
			columnCount   : 3,
			pagePadding   : 50,
		}).flow('<p>flowedContent</p>', '<div class="fixed">fixedContent</div>');

		var page   = target.querySelector('.cf-page-1');
		var fixed  = page.querySelector('.fixed');

		assertEquals('absolute', window.getComputedStyle(fixed).getPropertyValue('position'));
		assertEquals(0, fixed.offsetTop);
		assertEquals(50, fixed.offsetLeft);
	},

	testAFixedElementShouldRespectPagePaddingInVerticalArrangement : function() {

		createCf({
			columnGap     : 25,
			columnCount   : 3,
			pagePadding   : 50,
			pageArrangement : 'vertical',
		}).flow('<p>flowedContent</p>', '<div class="fixed">fixedContent</div>');

		var page   = target.querySelector('.cf-page-1');
		var fixed  = page.querySelector('.fixed');

		assertEquals('absolute', window.getComputedStyle(fixed).getPropertyValue('position'));
		assertEquals(50, fixed.offsetTop);
		assertEquals(0, fixed.offsetLeft);
	},

	testItShouldShortenTheAffectedColumnAndPlaceItLower : function() {

		createCf().flow('<p>flowedContent</p>', '<div class="fixed">fixedContent</div>');

		var page   = target.querySelector('.cf-page-1');
		var column = page.querySelector('.cf-column');

		assertEquals(220, column.offsetTop);
		assertEquals(380, column.offsetHeight);
	},

	testItShouldReduceTheAvailableSpaceInAColumn : function() {

		createCf().flow('<div class="height600">height600</div>', '<div class="fixed">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var column1 = page.querySelector('.cf-column-1');
		var column2 = page.querySelector('.cf-column-2');

		assertTrue(column2 instanceof HTMLElement);

		var element = column2.childNodes[0];
		assertEquals('-380px', window.getComputedStyle(element).getPropertyValue('margin-top'));
	},

	testItShouldShortenMultipleColumnsWhenTheElementSpans : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed col-span-2">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var column1 = page.querySelector('.cf-column-1');
		var column2 = page.querySelector('.cf-column-2');
		var column3 = page.querySelector('.cf-column-3');

		assertEquals(220, column1.offsetTop);
		assertEquals(380, column1.offsetHeight);

		assertEquals(220, column2.offsetTop);
		assertEquals(380, column2.offsetHeight);

		assertEquals(0, column3.offsetTop);
		assertEquals(600, column3.offsetHeight);

		var element = column3.childNodes[0];
		assertEquals('-160px', window.getComputedStyle(element).getPropertyValue('margin-top'));
	},

	testItShouldReduceASpanValueIfTooLarge : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed col-span-4">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');

		assertEquals(3, page.querySelectorAll('.cf-column').length);
	},

	testItShouldSpanAllColumns : function() {

		createCf().flow('<div class="height1000">height1000</div>', '<div class="fixed col-span-all">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = target.querySelector('.fixed');
		var column3 = page.querySelector('.cf-column-3');
		var element = column3.childNodes[0];

		assertEquals('800px', window.getComputedStyle(fixed).getPropertyValue('width'));
		assertEquals('-760px', window.getComputedStyle(element).getPropertyValue('margin-top'));
	},

	testItShouldRoundUpTheHeightOfEachFixedElement : function() {

		createCf().flow('<p>flowedContent</p>', '<div class="fixed205">fixedContent</div>');

		var page   = target.querySelector('.cf-page-1');
		var column = page.querySelector('.cf-column');

		assertEquals(360, column.offsetHeight);
		assertEquals(240, column.offsetTop);
	},

	testItShouldPlaceSecondFixedElementUnderneathFirstWithAGap : function() {

		createCf().flow('<div class="height600">height600</div>', '<div class="fixed col-span-2">fixedContent</div><div class="fixed col-span-1">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed1  = page.querySelector('.col-span-2');
		var fixed2  = page.querySelector('.col-span-1');
		var column1 = page.querySelector('.cf-column-1');
		var column2 = page.querySelector('.cf-column-2');
		var column3 = page.querySelector('.cf-column-3');

		assertEquals(0, fixed1.offsetTop);
		assertEquals(220, fixed2.offsetTop);

		assertEquals(440, column1.offsetTop);
		assertEquals(160, column1.offsetHeight);

		assertEquals(220, column2.offsetTop);
		assertEquals(380, column2.offsetHeight);

		assertEquals('-160px', window.getComputedStyle(column2.childNodes[0]).getPropertyValue('margin-top'));
		assertEquals('-540px', window.getComputedStyle(column3.childNodes[0]).getPropertyValue('margin-top'));
	},

	testItShouldRespectSpecifiedPageAttachment : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed attach-page-2">fixedContent</div>');


		var page1   = target.querySelector('.cf-page-1');
		var page2   = target.querySelector('.cf-page-2');
		var fixed   = page2.querySelector('.fixed');

		var p2col1  = page2.querySelector('.cf-column-1');

		assertTrue(fixed instanceof HTMLElement);
		assertEquals(0, fixed.offsetTop);

		assertEquals(220, p2col1.offsetTop);
		assertEquals(380, p2col1.offsetHeight);
	},

	testItShouldAnchorToTopRight : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed anchor-top-right">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed');
		var column3 = page.querySelector('.cf-column-3');

		assertEquals(0, fixed.offsetTop);
		assertEquals(550, fixed.offsetLeft);

		assertEquals(220, column3.offsetTop);
		assertEquals('0px', window.getComputedStyle(column3.childNodes[0]).getPropertyValue('margin-top'));
	},

	testItShouldAnchorToTopRightAndSpanLeft : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed anchor-top-right col-span-2-left">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed');

		var column2 = page.querySelector('.cf-column-2');
		var column3 = page.querySelector('.cf-column-3');

		assertEquals(0, fixed.offsetTop);
		assertEquals(275, fixed.offsetLeft);

		assertEquals(220, column2.offsetTop);
		assertEquals(220, column3.offsetTop);
	},

	testItShouldShiftAcrossToLeftToFit : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed anchor-top-right col-span-2">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed');

		var column1 = page.querySelector('.cf-column-1');
		var column2 = page.querySelector('.cf-column-2');
		var column3 = page.querySelector('.cf-column-3');

		assertEquals(0, fixed.offsetTop);
		assertEquals(275, fixed.offsetLeft);

		assertEquals(0, column1.offsetTop);
		assertEquals(220, column2.offsetTop);
		assertEquals(220, column3.offsetTop);
	},

	testItShouldShiftAcrossToLeftToFit : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed anchor-top-left col-span-2-left">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed');

		var column1 = page.querySelector('.cf-column-1');
		var column2 = page.querySelector('.cf-column-2');
		var column3 = page.querySelector('.cf-column-3');

		assertEquals(0, fixed.offsetTop);
		assertEquals(0, fixed.offsetLeft);

		assertEquals(220, column1.offsetTop);
		assertEquals(220, column2.offsetTop);
		assertEquals(0, column3.offsetTop);
	},

	testItShouldReduceImpossibleSpanToLeft : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed anchor-top-right col-span-4-left">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed');

		var column1 = page.querySelector('.cf-column-1');
		var column2 = page.querySelector('.cf-column-2');
		var column3 = page.querySelector('.cf-column-3');

		assertEquals(0, fixed.offsetTop);
		assertEquals(0, fixed.offsetLeft);

		assertEquals(220, column1.offsetTop);
		assertEquals(220, column2.offsetTop);
		assertEquals(220, column3.offsetTop);
	},

	testItShouldAnchorToBottomRightAndSpanLeft : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed205 anchor-bottom-right col-span-2-left">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed205');

		var column2 = page.querySelector('.cf-column-2');
		var column3 = page.querySelector('.cf-column-3');

		assertEquals(395, fixed.offsetTop);
		assertEquals(275, fixed.offsetLeft);

		assertEquals(0, column2.offsetTop);
		assertEquals(360, column2.offsetHeight);

		assertEquals(0, column3.offsetTop);
		assertEquals(360, column3.offsetHeight);
	},

	testItShouldAnchorToBottomRightAndStack : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed fixed-1 anchor-bottom-right col-span-2-left">fixedContent</div><div class="fixed fixed-2 anchor-bottom-right">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed1  = page.querySelector('.fixed-1');
		var fixed2  = page.querySelector('.fixed-2');

		var column2 = page.querySelector('.cf-column-2');
		var column3 = page.querySelector('.cf-column-3');

		assertEquals(400, fixed1.offsetTop);
		assertEquals(275, fixed1.offsetLeft);

		assertEquals(180, fixed2.offsetTop);
		assertEquals(550, fixed2.offsetLeft);

		assertEquals(0, column2.offsetTop);
		assertEquals(380, column2.offsetHeight);

		assertEquals(0, column3.offsetTop);
		assertEquals(160, column3.offsetHeight);
	},

	testItShouldAnchorToColumn2 : function() {

		createCf({
			columnGap   : 25,
			columnCount : 5
		}).flow('<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed anchor-top-col-2 col-span-2">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.cf-render-area .fixed');
		var column1 = page.querySelector('.cf-column-1');
		var column2 = page.querySelector('.cf-column-2');
		var column3 = page.querySelector('.cf-column-3');

		assertEquals(0, fixed.offsetTop);
		assertEquals(165, fixed.offsetLeft);
		assertEquals(305, fixed.offsetWidth);

		assertEquals(0, column1.offsetTop);
		assertEquals(600, column1.offsetHeight);

		assertEquals(220, column2.offsetTop);
		assertEquals(380, column2.offsetHeight);

		assertEquals(220, column3.offsetTop);
		assertEquals(380, column3.offsetHeight);
	},
/*

	testItShouldAnchorToSpecifiedColumn : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed anchor-top-right col-span-2-left">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed');

		var column2 = page.querySelector('.cf-column-2');
		var column3 = page.querySelector('.cf-column-3');

		assertEquals(0, fixed.offsetTop);
		assertEquals(275, fixed.offsetLeft);

		assertEquals(220, column2.offsetTop);
		assertEquals(220, column3.offsetTop);
	},
 */

	testAFixedElementAtTheBottomShouldRespectPagePadding : function() {

		createCf({
			columnGap     : 25,
			columnCount   : 3,
			pagePadding   : 50,
			pageArrangement : 'vertical',
		}).flow('<p>flowedContent</p>', '<div class="fixed anchor-bottom-left">fixedContent</div>');

		var page   = target.querySelector('.cf-page-1');
		var fixed  = page.querySelector('.fixed');

		assertEquals(350, fixed.offsetTop);
	},

	testItShouldOverlapElementsRatherThanOmitThem : function() {

		createCf().flow('<div class="height100">height100</div>', '<div class="fixed fixed-1">fixedContent</div><div class="fixed fixed-2">fixedContent</div><div class="fixed fixed-3">fixedContent</div><div class="fixed fixed-4">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');

		var fixed1  = page.querySelector('.fixed-1');
		var fixed2  = page.querySelector('.fixed-2');
		var fixed3  = page.querySelector('.fixed-3');
		var fixed4  = page.querySelector('.fixed-4');

		assertEquals(0, fixed1.offsetTop);
		assertEquals(220, fixed2.offsetTop);
		assertEquals(400, fixed3.offsetTop);
		assertEquals(400, fixed4.offsetTop);
	},

	testItShouldOverlapBottomElementsToo : function() {

		createCf().flow('<div class="height100">height100</div>', '<div class="fixed fixed-1 anchor-bottom-left">fixedContent</div><div class="fixed fixed-2 anchor-bottom-left">fixedContent</div><div class="fixed fixed-3 anchor-bottom-left">fixedContent</div><div class="fixed fixed-4 anchor-bottom-left">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');

		var fixed1  = page.querySelector('.fixed-1');
		var fixed2  = page.querySelector('.fixed-2');
		var fixed3  = page.querySelector('.fixed-3');
		var fixed4  = page.querySelector('.fixed-4');

		assertEquals(400, fixed1.offsetTop);
		assertEquals(180, fixed2.offsetTop);
		assertEquals(0, fixed3.offsetTop);
		assertEquals(0, fixed4.offsetTop);
	},

	testItShouldNotPrintAColumnWhenFixedElementsHaveFilledTheSpace : function() {

		createCf().flow('<div class="height100">height100</div>', '<div class="fixed fixed600">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var column2 = page.querySelector('.cf-column-2');

		assertNull(page.querySelector('.cf-column-1'));

		assertEquals(0, column2.offsetTop);
		assertEquals(275, column2.offsetLeft);
		assertEquals(1, column2.childNodes.length);
	},

	testItShouldNotPrintAnyColumnsOnPage1WhenFixedElementsHaveFilledTheSpace : function() {

		createCf().flow('<div class="height100">height100</div>', '<div class="fixed fixed600 col-span-3">fixedContent</div>');

		var page1   = target.querySelector('.cf-page-1');
		var page2   = target.querySelector('.cf-page-2');

		var fixed   = page1.querySelector('.fixed600');
		var column  = page2.querySelector('.cf-column-1');

		assertTrue(fixed instanceof HTMLElement);
		assertEquals(0, page1.querySelectorAll('.cf-column').length);

		assertEquals(0, column.offsetTop);
		assertEquals(0, column.offsetLeft);
		assertEquals(1, column.childNodes.length);
	},

	testItShouldVerticallyCenterAFixedElement : function() {

		createCf().flow('<div class="height200">height200</div>', '<div class="fixed anchor-middle-left">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed');

		assertEquals(200, fixed.offsetTop);
		assertEquals(0, fixed.offsetLeft);

		var columns = page.querySelectorAll('.cf-column-1');
		assertEquals(2, columns.length);

		var topCol1    = columns[0];
		var bottomCol1 = columns[1];

		assertEquals(0, topCol1.offsetLeft);
		assertEquals(0, topCol1.offsetTop);
		assertEquals(180, topCol1.offsetHeight);

		assertEquals(0, bottomCol1.offsetLeft);
		assertEquals(420, bottomCol1.offsetTop);
		assertEquals(180, bottomCol1.offsetHeight);

		assertEquals('-180px', window.getComputedStyle(bottomCol1.childNodes[0]).getPropertyValue('margin-top'));
	},

	testItShouldCorrectlyHandleATallVerticallyCenteredElement : function() {

		createCf().flow('<div class="height200">height200</div>', '<div class="fixed600 anchor-middle-left">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed600');

		assertEquals(0, fixed.offsetTop);
		assertEquals(0, fixed.offsetLeft);

		assertNull(page.querySelector('.cf-column-1'));

		var column2 = page.querySelector('.cf-column-2');

		assertEquals(0, column2.offsetTop);
		assertEquals('0px', window.getComputedStyle(column2.childNodes[0]).getPropertyValue('margin-top'));
	},

	testItShouldCorrectlyHandleATallVerticallyCenteredElementInCol2 : function() {

		createCf().flow('<div class="height1000">height1000</div>', '<div class="fixed600 anchor-middle-col-2">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed600');

		assertNull(target.querySelector('.cf-page-2'));

		assertEquals(0, fixed.offsetTop);
		assertEquals(275, fixed.offsetLeft);

		assertNull(page.querySelector('.cf-column-2'));

		var column1 = page.querySelector('.cf-column-1');
		var column3 = page.querySelector('.cf-column-3');

		assertEquals(0, column1.offsetTop);
		assertEquals('0px', window.getComputedStyle(column1.childNodes[0]).getPropertyValue('margin-top'));

		assertEquals(0, column3.offsetTop);
		assertEquals('-600px', window.getComputedStyle(column3.childNodes[0]).getPropertyValue('margin-top'));
	},

	testItShouldCorrectlyHandleATallVerticallyCenteredElementInCol2 : function() {

		createCf().flow('<div class="height1000">height1000</div>', '<div class="fixed600 anchor-middle-col-2">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed600');

		assertNull(target.querySelector('.cf-page-2'));

		assertEquals(0, fixed.offsetTop);
		assertEquals(275, fixed.offsetLeft);

		assertNull(page.querySelector('.cf-column-2'));

		var column1 = page.querySelector('.cf-column-1');
		var column3 = page.querySelector('.cf-column-3');

		assertEquals(0, column1.offsetTop);
		assertEquals('0px', window.getComputedStyle(column1.childNodes[0]).getPropertyValue('margin-top'));

		assertEquals(0, column3.offsetTop);
		assertEquals('-600px', window.getComputedStyle(column3.childNodes[0]).getPropertyValue('margin-top'));
	},

	testItShouldHandleANormalAndACenteredElementInTheSameColumn : function() {

		createCf().flow('<div class="height600">height600</div>', '<div class="fixed100 anchor-top-left">fixedContent</div><div class="fixed100 anchor-middle-left">fixedContent</div>');

		var target   = document.getElementById('targetid');
		var page     = target.querySelector('.cf-page-1');
		var fixedTop = page.querySelector('.anchor-top-left');
		var fixedMid = page.querySelector('.anchor-middle-left');

		assertNull(target.querySelector('.cf-page-2'));

		assertEquals(0, fixedTop.offsetTop);
		assertEquals(250, fixedMid.offsetTop);

		var column1s = page.querySelectorAll('.cf-column-1');
		assertEquals(2, column1s.length);

		assertEquals(120, column1s[0].offsetTop);
		assertEquals(100, column1s[0].offsetHeight);

		assertEquals(380, column1s[1].offsetTop);
		assertEquals(220, column1s[1].offsetHeight);
		assertEquals('-100px', window.getComputedStyle(column1s[1].childNodes[0]).getPropertyValue('margin-top'));

		var column2 = page.querySelector('.cf-column-2');
		assertEquals('-320px', window.getComputedStyle(column2.childNodes[0]).getPropertyValue('margin-top'));
	},

	testItShouldHandleANormalAndACenteredElementInTheSameColumnButSwapped : function() {

		createCf().flow('<div class="height600">height600</div>', '<div class="fixed100 anchor-middle-left">fixedContent</div><div class="fixed100 anchor-top-left">fixedContent</div>');

		var target   = document.getElementById('targetid');
		var page     = target.querySelector('.cf-page-1');
		var fixedTop = page.querySelector('.anchor-top-left');
		var fixedMid = page.querySelector('.anchor-middle-left');

		assertNull(target.querySelector('.cf-page-2'));

		assertEquals(0, fixedTop.offsetTop);
		assertEquals(250, fixedMid.offsetTop);

		var column1s = page.querySelectorAll('.cf-column-1');
		assertEquals(2, column1s.length);

		assertEquals(120, column1s[0].offsetTop);
		assertEquals(100, column1s[0].offsetHeight);

		assertEquals(380, column1s[1].offsetTop);
		assertEquals(220, column1s[1].offsetHeight);
		assertEquals('-100px', window.getComputedStyle(column1s[1].childNodes[0]).getPropertyValue('margin-top'));

		var column2 = page.querySelector('.cf-column-2');
		assertEquals('-320px', window.getComputedStyle(column2.childNodes[0]).getPropertyValue('margin-top'));
	},

	testItShouldAllowABottomAlignedElementUnderneathACenteredElement : function() {

		createCf().flow('<div class="height600">height600</div>', '<div class="fixed100 anchor-middle-left">fixedContent</div><div class="fixed100 anchor-bottom-left">fixedContent</div>');

		var target   = document.getElementById('targetid');
		var page     = target.querySelector('.cf-page-1');
		var fixedBot = page.querySelector('.anchor-bottom-left');
		var fixedMid = page.querySelector('.anchor-middle-left');

		assertNull(target.querySelector('.cf-page-2'));

		assertEquals(500, fixedBot.offsetTop);
		assertEquals(250, fixedMid.offsetTop);

		var column1 = page.querySelectorAll('.cf-column-1');
		assertEquals(2, column1.length);

		assertEquals(0, column1[0].offsetTop);
		assertEquals(220, column1[0].offsetHeight);

		assertEquals(380, column1[1].offsetTop);
		assertEquals(100, column1[1].offsetHeight);
	},

	testItShouldHandleACollisionBetweenCenteredElements : function() {

		createCf().flow('<div class="height600">height600</div>', '<div class="fixed100 anchor-middle-left">fixedContent</div><div class="fixed anchor-middle-left">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed1  = page.querySelector('.fixed100');
		var fixed2  = page.querySelector('.fixed');

		assertEquals(250, fixed1.offsetTop);
		assertEquals(200, fixed2.offsetTop);

		var column1 = page.querySelectorAll('.cf-column-1');
		assertEquals(2, column1.length);

		assertEquals(0, column1[0].offsetTop);
		assertEquals(180, column1[0].offsetHeight);

		assertEquals(420, column1[1].offsetTop);
		assertEquals(180, column1[1].offsetHeight);

		var column2 = page.querySelector('.cf-column-2');
		assertEquals('-360px', window.getComputedStyle(column2.childNodes[0]).getPropertyValue('margin-top'));
	},

	testItShouldHonourTheMinimumColumnHeight : function() {

		createCf({
			columnGap     : 25,
			columnCount   : 3,
			columnFragmentMinHeight : 100,
		}).flow('<div class="height600">height600</div>', '<div class="fixed500">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');

		assertNull(page.querySelector('.cf-column-1'));

		var column2 = page.querySelector('.cf-column-2');
		assertEquals(0, column2.offsetTop);
		assertEquals(600, column2.offsetHeight);
		assertEquals('0px', window.getComputedStyle(column2.childNodes[0]).getPropertyValue('margin-top'));
	},

	testRegressionPageClassShouldNotResultInEmptyPages : function() {

		createCf({
			columnGap     : 25,
			columnCount   : 3,
			columnFragmentMinHeight : 100,
		}).flow('<div class="height600">height600</div>', '<div class="fixed">fixed1</div><div class="fixed attach-page-2">fixed2</div>');

		var page1  = target.querySelector('.cf-page-1');
		var page2  = target.querySelector('.cf-page-2');
		var column = page1.querySelector('.cf-column-1');

		assertTrue(column instanceof HTMLElement);
		assertNull(page2.querySelector('.cf-column-1'));
	},

	testItShouldCorrectlyFlowContentWhenColspan1IsFollowedByColspan2 : function() {

		createCf({
			columnGap     : 25,
			columnCount   : 3,
			columnFragmentMinHeight : 100,
		}).flow('<div class="height700">height700</div>', '<div class="fixed col-span-1">1</div><div class="fixed col-span-2">2</div>');

		var page    = target.querySelector('.cf-page-1');
		var column1 = page.querySelector('.cf-column-1');

		assertEquals(440, column1.offsetTop);
		assertEquals(160, column1.offsetHeight);

		var column2s = page.querySelectorAll('.cf-column-2');
		assertEquals(2, column2s.length);

		assertEquals(0, column2s[0].offsetTop);
		assertEquals(200, column2s[0].offsetHeight);

		assertEquals(440, column2s[1].offsetTop);
		assertEquals(160, column2s[1].offsetHeight);

	},

	testItShouldAllowFixedElementsToBeShiftedVertically : function() {

		createCf().flow('<div class="height300">height300</div>', '<div class="fixed col-span-1 shift-up">1</div>');

		var page    = target.querySelector('.cf-page-1');
		var column1 = page.querySelector('.cf-column-1');

		assertEquals(200, column1.offsetTop);
		assertEquals(400, column1.offsetHeight);

	},

	testItShouldSetExplicitWidthOnFixedElementsWithAutoWidth : function() {

		createCf().flow('<div class="height300">height300</div>', '<div class="fixed col-span-1 auto-width">1</div>');

		var page    = target.querySelector('.cf-page-1');
		var column1 = page.querySelector('.cf-column-1');
		var fixed   = page.querySelector('.fixed');

		assertEquals("250px", fixed.style.width);
		assertEquals(250, parseInt(window.getComputedStyle(fixed).getPropertyValue('width')));

	},

	testItShouldSetExplicitWidthOnFixedElementsOverTwoColumns : function() {

		createCf().flow('<div class="height300">height300</div>', '<div class="fixed col-span-2 auto-width">1</div>');

		var page    = target.querySelector('.cf-page-1');
		var column1 = page.querySelector('.cf-column-1');
		var fixed   = page.querySelector('.fixed');

		assertEquals("525px", fixed.style.width);
		assertEquals(525, parseInt(window.getComputedStyle(fixed).getPropertyValue('width')));

	},

	testItShouldRespectAFloatValueForMinFixedPadding : function() {

		// 205px, minimum gap 20px, next element starts at 240px
		createCf().flow('<p>flowedContent</p>', '<div class="fixed fixed205">fixedContent</div>');

		var page   = target.querySelector('.cf-page-1');
		var column = page.querySelector('.cf-column');

		assertEquals(240, column.offsetTop);
		assertEquals(360, column.offsetHeight);


		// 205px, minimum gap 10px, next element starts at 220px
		createCf({
			columnGap   : 25,
			columnCount : 3,
			minFixedPadding : 0.5
		}).flow('<p>flowedContent</p>', '<div class="fixed fixed205">fixedContent</div>');

		var page   = target.querySelector('.cf-page-1');
		var column = page.querySelector('.cf-column');

		assertEquals(220, column.offsetTop);
		assertEquals(380, column.offsetHeight);


		// 200px, minimum gap 30px, next element starts at 240px
		createCf({
			columnGap   : 25,
			columnCount : 3,
			minFixedPadding : 1.5
		}).flow('<p>flowedContent</p>', '<div class="fixed">fixedContent</div>');

		var page   = target.querySelector('.cf-page-1');
		var column = page.querySelector('.cf-column');

		assertEquals(240, column.offsetTop);
		assertEquals(360, column.offsetHeight);
	},

/*
	testItShouldSetExplicitHeightOnImagesWithSpecifiedAspectRatio : function() {

		createCf().flow('<div class="height300">height300</div>', '<div class="fixed col-span-2"><img style="width: 200px" data-aspect-ratio="2" src="http://www.google.co.uk/images/srpr/logo3w.png" /></div>');

		var page    = target.querySelector('.cf-page-1');
		var column1 = page.querySelector('.cf-column-1');
		var fixed   = page.querySelector('.fixed');
		var img     = fixed.querySelector('img');

		assertEquals("200px", img.style.width);
		assertEquals("100px", img.style.height);
		assertEquals(200, parseInt(window.getComputedStyle(img).getPropertyValue('width')));
		assertEquals(100, parseInt(window.getComputedStyle(img).getPropertyValue('height')));
	},
 */



//*/

});
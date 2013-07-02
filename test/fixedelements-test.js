/**
 * FTColumnflow FixedElements test suite
 *
 * @copyright The Financial Times Limited [All Rights Reserved]
*/

buster.testCase('FixedElements', {

	setUp : function(done) {
		document.body.innerHTML = '<div id="viewportid"><div id="targetid"></div></div>';
		addStylesheets(['all.css', 'fixedelements.css'], done);
	},

	tearDown : function() {
		removeStyleSheets();
		document.body.className = '';
	},

	'ShouldCreateAHiddenPreloadArea' : function() {

		createCf().flow();

		var preload = target.querySelector('.cf-preload-fixed');

		assert(preload instanceof HTMLElement);
		assert.match(cssProp(preload, 'visibility'), 'hidden');
		assert.match(cssProp(preload, 'position'), 'absolute');
	},

	'ShouldAddFlowedContentToPreloadArea' : function() {

		createCf().flow('', '<div class="fixed">fixedContent</div>');

		var preload = target.querySelector('.cf-preload-fixed');

		assert.match(preload.innerHTML, /^<div[^.]*>fixedContent<\/div>$/);
	},

	'AFixedElementShouldBePlacedOnPage1' : function() {

		createCf().flow('<p>flowedContent</p>', '<div class="fixed">fixedContent</div>');

		var page   = target.querySelector('.cf-page-1');
		var fixed  = page.querySelector('.fixed');

		assert.match(page.childNodes.length, 2);
		assert(fixed instanceof HTMLElement);
		assert.match(fixed.innerHTML, 'fixedContent');
	},

	'TextNodesShouldBeIgnored' : function() {

		createCf().flow('<p>flowedContent</p>', '\n<div class="fixed">fixedContent</div>\n');

		var page   = target.querySelector('.cf-page-1');
		var fixed  = page.querySelector('.fixed');

		assert.match(page.childNodes.length, 2);
		assert(fixed instanceof HTMLElement);
		assert.match(fixed.innerHTML, 'fixedContent');
	},

	'AFixedElementShouldBePlacedAbsoluteTopLeftByDefault' : function() {

		createCf().flow('<p>flowedContent</p>', '<div class="fixed">fixedContent</div>');

		var page   = target.querySelector('.cf-page-1');
		var fixed  = page.querySelector('.fixed');

		assert.match(cssProp(fixed, 'position'), 'absolute');
		assert.match(fixed.offsetTop, 0);
		assert.match(fixed.offsetLeft, 0);
	},

	'AFixedElementShouldRespectPagePadding' : function() {

		createCf({
			columnGap     : 25,
			columnCount   : 3,
			pagePadding   : 50,
		}).flow('<p>flowedContent</p>', '<div class="fixed">fixedContent</div>');

		var page   = target.querySelector('.cf-page-1');
		var fixed  = page.querySelector('.fixed');

		assert.match(cssProp(fixed, 'position'), 'absolute');
		assert.match(fixed.offsetTop, 0);
		assert.match(fixed.offsetLeft, 50);
	},

	'AFixedElementShouldRespectPagePaddingInVerticalArrangement' : function() {

		createCf({
			columnGap     : 25,
			columnCount   : 3,
			pagePadding   : 50,
			pageArrangement : 'vertical',
		}).flow('<p>flowedContent</p>', '<div class="fixed">fixedContent</div>');

		var page   = target.querySelector('.cf-page-1');
		var fixed  = page.querySelector('.fixed');

		assert.match(cssProp(fixed, 'position'), 'absolute');
		assert.match(fixed.offsetTop, 50);
		assert.match(fixed.offsetLeft, 0);
	},

	'ShouldShortenTheAffectedColumnAndPlaceItLower' : function() {

		createCf().flow('<p>flowedContent</p>', '<div class="fixed">fixedContent</div>');

		var page   = target.querySelector('.cf-page-1');
		var column = page.querySelector('.cf-column');

		assert.match(column.offsetTop, 220);
		assert.match(column.offsetHeight, 380);
	},

	'ShouldReduceTheAvailableSpaceInAColumn' : function() {

		createCf().flow('<div class="height600">height600</div>', '<div class="fixed">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var column1 = page.querySelector('.cf-column-1');
		var column2 = page.querySelector('.cf-column-2');

		assert(column2 instanceof HTMLElement);

		var element = column2.childNodes[0];
		assert.match(cssProp(element, 'margin-top'), '-380px');
	},

	'ShouldShortenMultipleColumnsWhenTheElementSpans' : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed col-span-2">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var column1 = page.querySelector('.cf-column-1');
		var column2 = page.querySelector('.cf-column-2');
		var column3 = page.querySelector('.cf-column-3');

		assert.match(column1.offsetTop, 220);
		assert.match(column1.offsetHeight, 380);

		assert.match(column2.offsetTop, 220);
		assert.match(column2.offsetHeight, 380);

		assert.match(column3.offsetTop, 0);
		assert.match(column3.offsetHeight, 600);

		var element = column3.childNodes[0];
		assert.match(cssProp(element, 'margin-top'), '-160px');
	},

	'ShouldReduceASpanValueIfTooLarge' : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed col-span-4">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');

		assert.match(page.querySelectorAll('.cf-column').length, 3);
	},

	'ShouldSpanAllColumns' : function() {

		createCf().flow('<div class="height1000">height1000</div>', '<div class="fixed col-span-all">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = target.querySelector('.fixed');
		var column3 = page.querySelector('.cf-column-3');
		var element = column3.childNodes[0];

		assert.match(cssProp(fixed, 'width'), '800px');
		assert.match(cssProp(element, 'margin-top'), '-760px');
	},

	'ShouldRoundUpTheHeightOfEachFixedElement' : function() {

		createCf().flow('<p>flowedContent</p>', '<div class="fixed205">fixedContent</div>');

		var page   = target.querySelector('.cf-page-1');
		var column = page.querySelector('.cf-column');

		assert.match(column.offsetHeight, 360);
		assert.match(column.offsetTop, 240);
	},

	'ShouldPlaceSecondFixedElementUnderneathFirstWithAGap' : function() {

		createCf().flow('<div class="height600">height600</div>', '<div class="fixed col-span-2">fixedContent</div><div class="fixed col-span-1">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed1  = page.querySelector('.col-span-2');
		var fixed2  = page.querySelector('.col-span-1');
		var column1 = page.querySelector('.cf-column-1');
		var column2 = page.querySelector('.cf-column-2');
		var column3 = page.querySelector('.cf-column-3');

		assert.match(fixed1.offsetTop, 0);
		assert.match(fixed2.offsetTop, 220);

		assert.match(column1.offsetTop, 440);
		assert.match(column1.offsetHeight, 160);

		assert.match(column2.offsetTop, 220);
		assert.match(column2.offsetHeight, 380);

		assert.match(cssProp(column2.childNodes[0], 'margin-top'), '-160px');
		assert.match(cssProp(column3.childNodes[0], 'margin-top'), '-540px');
	},

	'ShouldRespectSpecifiedPageAttachment' : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed attach-page-2">fixedContent</div>');


		var page1   = target.querySelector('.cf-page-1');
		var page2   = target.querySelector('.cf-page-2');
		var fixed   = page2.querySelector('.fixed');

		var p2col1  = page2.querySelector('.cf-column-1');

		assert(fixed instanceof HTMLElement);
		assert.match(fixed.offsetTop, 0);

		assert.match(p2col1.offsetTop, 220);
		assert.match(p2col1.offsetHeight, 380);
	},

	'ShouldAnchorToTopRight' : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed anchor-top-right">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed');
		var column3 = page.querySelector('.cf-column-3');

		assert.match(fixed.offsetTop, 0);
		assert.match(fixed.offsetLeft, 550);

		assert.match(column3.offsetTop, 220);
		assert.match(cssProp(column3.childNodes[0], 'margin-top'), '0px');
	},

	'ShouldAnchorToTopRightAndSpanLeft' : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed anchor-top-right col-span-2-left">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed');

		var column2 = page.querySelector('.cf-column-2');
		var column3 = page.querySelector('.cf-column-3');

		assert.match(fixed.offsetTop, 0);
		assert.match(fixed.offsetLeft, 275);

		assert.match(column2.offsetTop, 220);
		assert.match(column3.offsetTop, 220);
	},

	'ShouldShiftAcrossToLeftToFit' : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed anchor-top-right col-span-2">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed');

		var column1 = page.querySelector('.cf-column-1');
		var column2 = page.querySelector('.cf-column-2');
		var column3 = page.querySelector('.cf-column-3');

		assert.match(fixed.offsetTop, 0);
		assert.match(fixed.offsetLeft, 275);

		assert.match(column1.offsetTop, 0);
		assert.match(column2.offsetTop, 220);
		assert.match(column3.offsetTop, 220);
	},

	'ShouldShiftAcrossToLeftToFit' : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed anchor-top-left col-span-2-left">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed');

		var column1 = page.querySelector('.cf-column-1');
		var column2 = page.querySelector('.cf-column-2');
		var column3 = page.querySelector('.cf-column-3');

		assert.match(fixed.offsetTop, 0);
		assert.match(fixed.offsetLeft, 0);

		assert.match(column1.offsetTop, 220);
		assert.match(column2.offsetTop, 220);
		assert.match(column3.offsetTop, 0);
	},

	'ShouldReduceImpossibleSpanToLeft' : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed anchor-top-right col-span-4-left">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed');

		var column1 = page.querySelector('.cf-column-1');
		var column2 = page.querySelector('.cf-column-2');
		var column3 = page.querySelector('.cf-column-3');

		assert.match(fixed.offsetTop, 0);
		assert.match(fixed.offsetLeft, 0);

		assert.match(column1.offsetTop, 220);
		assert.match(column2.offsetTop, 220);
		assert.match(column3.offsetTop, 220);
	},

	'ShouldAnchorToBottomRightAndSpanLeft' : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed205 anchor-bottom-right col-span-2-left">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed205');

		var column2 = page.querySelector('.cf-column-2');
		var column3 = page.querySelector('.cf-column-3');

		assert.match(fixed.offsetTop, 395);
		assert.match(fixed.offsetLeft, 275);

		assert.match(column2.offsetTop, 0);
		assert.match(column2.offsetHeight, 360);

		assert.match(column3.offsetTop, 0);
		assert.match(column3.offsetHeight, 360);
	},

	'ShouldAnchorToBottomRightAndStack' : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed fixed-1 anchor-bottom-right col-span-2-left">fixedContent</div><div class="fixed fixed-2 anchor-bottom-right">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed1  = page.querySelector('.fixed-1');
		var fixed2  = page.querySelector('.fixed-2');

		var column2 = page.querySelector('.cf-column-2');
		var column3 = page.querySelector('.cf-column-3');

		assert.match(fixed1.offsetTop, 400);
		assert.match(fixed1.offsetLeft, 275);

		assert.match(fixed2.offsetTop, 180);
		assert.match(fixed2.offsetLeft, 550);

		assert.match(column2.offsetTop, 0);
		assert.match(column2.offsetHeight, 380);

		assert.match(column3.offsetTop, 0);
		assert.match(column3.offsetHeight, 160);
	},

	'ShouldAnchorToColumn2' : function() {

		createCf({
			columnGap   : 25,
			columnCount : 5
		}).flow('<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed anchor-top-col-2 col-span-2">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.cf-render-area .fixed');
		var column1 = page.querySelector('.cf-column-1');
		var column2 = page.querySelector('.cf-column-2');
		var column3 = page.querySelector('.cf-column-3');

		assert.match(fixed.offsetTop, 0);
		assert.match(fixed.offsetLeft, 165);
		assert.match(fixed.offsetWidth, 305);

		assert.match(column1.offsetTop, 0);
		assert.match(column1.offsetHeight, 600);

		assert.match(column2.offsetTop, 220);
		assert.match(column2.offsetHeight, 380);

		assert.match(column3.offsetTop, 220);
		assert.match(column3.offsetHeight, 380);
	},
/*

	'ShouldAnchorToSpecifiedColumn' : function() {

		createCf().flow('<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div>', '<div class="fixed anchor-top-right col-span-2-left">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed');

		var column2 = page.querySelector('.cf-column-2');
		var column3 = page.querySelector('.cf-column-3');

		assert.match(fixed.offsetTop, 0);
		assert.match(fixed.offsetLeft, 275);

		assert.match(column2.offsetTop, 220);
		assert.match(column3.offsetTop, 220);
	},
 */

	'AFixedElementAtTheBottomShouldRespectPagePadding' : function() {

		createCf({
			columnGap     : 25,
			columnCount   : 3,
			pagePadding   : 50,
			pageArrangement : 'vertical'
		}).flow('<p>flowedContent</p>', '<div class="fixed anchor-bottom-left">fixedContent</div>');

		var page   = target.querySelector('.cf-page-1');
		var fixed  = page.querySelector('.fixed');

		assert.match(fixed.offsetTop, 350);
	},

	'ShouldOverlapElementsRatherThanOmitThem' : function() {

		createCf().flow('<div class="height100">height100</div>', '<div class="fixed fixed-1">fixedContent</div><div class="fixed fixed-2">fixedContent</div><div class="fixed fixed-3">fixedContent</div><div class="fixed fixed-4">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');

		var fixed1  = page.querySelector('.fixed-1');
		var fixed2  = page.querySelector('.fixed-2');
		var fixed3  = page.querySelector('.fixed-3');
		var fixed4  = page.querySelector('.fixed-4');

		assert.match(fixed1.offsetTop, 0);
		assert.match(fixed2.offsetTop, 220);
		assert.match(fixed3.offsetTop, 400);
		assert.match(fixed4.offsetTop, 400);
	},

	'ShouldOverlapBottomElementsToo' : function() {

		createCf().flow('<div class="height100">height100</div>', '<div class="fixed fixed-1 anchor-bottom-left">fixedContent</div><div class="fixed fixed-2 anchor-bottom-left">fixedContent</div><div class="fixed fixed-3 anchor-bottom-left">fixedContent</div><div class="fixed fixed-4 anchor-bottom-left">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');

		var fixed1  = page.querySelector('.fixed-1');
		var fixed2  = page.querySelector('.fixed-2');
		var fixed3  = page.querySelector('.fixed-3');
		var fixed4  = page.querySelector('.fixed-4');

		assert.match(fixed1.offsetTop, 400);
		assert.match(fixed2.offsetTop, 180);
		assert.match(fixed3.offsetTop, 0);
		assert.match(fixed4.offsetTop, 0);
	},

	'ShouldNotPrintAColumnWhenFixedElementsHaveFilledTheSpace' : function() {

		createCf().flow('<div class="height100">height100</div>', '<div class="fixed fixed600">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var column2 = page.querySelector('.cf-column-2');

		assert.isNull(page.querySelector('.cf-column-1'));

		assert.match(column2.offsetTop, 0);
		assert.match(column2.offsetLeft, 275);
		assert.match(column2.childNodes.length, 1);
	},

	'ShouldNotPrintAnyColumnsOnPage1WhenFixedElementsHaveFilledTheSpace' : function() {

		createCf().flow('<div class="height100">height100</div>', '<div class="fixed fixed600 col-span-3">fixedContent</div>');

		var page1   = target.querySelector('.cf-page-1');
		var page2   = target.querySelector('.cf-page-2');

		var fixed   = page1.querySelector('.fixed600');
		var column  = page2.querySelector('.cf-column-1');

		assert(fixed instanceof HTMLElement);
		assert.match(page1.querySelectorAll('.cf-column').length, 0);

		assert.match(column.offsetTop, 0);
		assert.match(column.offsetLeft, 0);
		assert.match(column.childNodes.length, 1);
	},

	'ShouldVerticallyCenterAFixedElement' : function() {

		createCf().flow('<div class="height200">height200</div>', '<div class="fixed anchor-middle-left">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed');

		assert.match(fixed.offsetTop, 200);
		assert.match(fixed.offsetLeft, 0);

		var columns = page.querySelectorAll('.cf-column-1');
		assert.match(columns.length, 2);

		var topCol1    = columns[0];
		var bottomCol1 = columns[1];

		assert.match(topCol1.offsetLeft, 0);
		assert.match(topCol1.offsetTop, 0);
		assert.match(topCol1.offsetHeight, 180);

		assert.match(bottomCol1.offsetLeft, 0);
		assert.match(bottomCol1.offsetTop, 420);
		assert.match(bottomCol1.offsetHeight, 180);

		assert.match(cssProp(bottomCol1.childNodes[0], 'margin-top'), '-180px');
	},

	'ShouldCorrectlyHandleATallVerticallyCenteredElement' : function() {

		createCf().flow('<div class="height200">height200</div>', '<div class="fixed600 anchor-middle-left">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed600');

		assert.match(fixed.offsetTop, 0);
		assert.match(fixed.offsetLeft, 0);

		assert.isNull(page.querySelector('.cf-column-1'));

		var column2 = page.querySelector('.cf-column-2');

		assert.match(column2.offsetTop, 0);
		assert.match(cssProp(column2.childNodes[0], 'margin-top'), '0px');
	},

	'ShouldCorrectlyHandleATallVerticallyCenteredElementInCol2' : function() {

		createCf().flow('<div class="height1000">height1000</div>', '<div class="fixed600 anchor-middle-col-2">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed600');

		assert.isNull(target.querySelector('.cf-page-2'));

		assert.match(fixed.offsetTop, 0);
		assert.match(fixed.offsetLeft, 275);

		assert.isNull(page.querySelector('.cf-column-2'));

		var column1 = page.querySelector('.cf-column-1');
		var column3 = page.querySelector('.cf-column-3');

		assert.match(column1.offsetTop, 0);
		assert.match(cssProp(column1.childNodes[0], 'margin-top'), '0px');

		assert.match(column3.offsetTop, 0);
		assert.match(cssProp(column3.childNodes[0], 'margin-top'), '-600px');
	},

	'ShouldCorrectlyHandleATallVerticallyCenteredElementInCol2' : function() {

		createCf().flow('<div class="height1000">height1000</div>', '<div class="fixed600 anchor-middle-col-2">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed   = page.querySelector('.fixed600');

		assert.isNull(target.querySelector('.cf-page-2'));

		assert.match(fixed.offsetTop, 0);
		assert.match(fixed.offsetLeft, 275);

		assert.isNull(page.querySelector('.cf-column-2'));

		var column1 = page.querySelector('.cf-column-1');
		var column3 = page.querySelector('.cf-column-3');

		assert.match(column1.offsetTop, 0);
		assert.match(cssProp(column1.childNodes[0], 'margin-top'), '0px');

		assert.match(column3.offsetTop, 0);
		assert.match(cssProp(column3.childNodes[0], 'margin-top'), '-600px');
	},

	'ShouldHandleANormalAndACenteredElementInTheSameColumn' : function() {

		createCf().flow('<div class="height600">height600</div>', '<div class="fixed100 anchor-top-left">fixedContent</div><div class="fixed100 anchor-middle-left">fixedContent</div>');

		var target   = document.getElementById('targetid');
		var page     = target.querySelector('.cf-page-1');
		var fixedTop = page.querySelector('.anchor-top-left');
		var fixedMid = page.querySelector('.anchor-middle-left');

		assert.isNull(target.querySelector('.cf-page-2'));

		assert.match(fixedTop.offsetTop, 0);
		assert.match(fixedMid.offsetTop, 250);

		var column1s = page.querySelectorAll('.cf-column-1');
		assert.match(column1s.length, 2);

		assert.match(column1s[0].offsetTop, 120);
		assert.match(column1s[0].offsetHeight, 100);

		assert.match(column1s[1].offsetTop, 380);
		assert.match(column1s[1].offsetHeight, 220);
		assert.match(cssProp(column1s[1].childNodes[0], 'margin-top'), '-100px');

		var column2 = page.querySelector('.cf-column-2');
		assert.match(cssProp(column2.childNodes[0], 'margin-top'), '-320px');
	},

	'ShouldHandleANormalAndACenteredElementInTheSameColumnButSwapped' : function() {

		createCf().flow('<div class="height600">height600</div>', '<div class="fixed100 anchor-middle-left">fixedContent</div><div class="fixed100 anchor-top-left">fixedContent</div>');

		var target   = document.getElementById('targetid');
		var page     = target.querySelector('.cf-page-1');
		var fixedTop = page.querySelector('.anchor-top-left');
		var fixedMid = page.querySelector('.anchor-middle-left');

		assert.isNull(target.querySelector('.cf-page-2'));

		assert.match(fixedTop.offsetTop, 0);
		assert.match(fixedMid.offsetTop, 250);

		var column1s = page.querySelectorAll('.cf-column-1');
		assert.match(column1s.length, 2);

		assert.match(column1s[0].offsetTop, 120);
		assert.match(column1s[0].offsetHeight, 100);

		assert.match(column1s[1].offsetTop, 380);
		assert.match(column1s[1].offsetHeight, 220);
		assert.match(cssProp(column1s[1].childNodes[0], 'margin-top'), '-100px');

		var column2 = page.querySelector('.cf-column-2');
		assert.match(cssProp(column2.childNodes[0], 'margin-top'), '-320px');
	},

	'ShouldAllowABottomAlignedElementUnderneathACenteredElement' : function() {

		createCf().flow('<div class="height600">height600</div>', '<div class="fixed100 anchor-middle-left">fixedContent</div><div class="fixed100 anchor-bottom-left">fixedContent</div>');

		var target   = document.getElementById('targetid');
		var page     = target.querySelector('.cf-page-1');
		var fixedBot = page.querySelector('.anchor-bottom-left');
		var fixedMid = page.querySelector('.anchor-middle-left');

		assert.isNull(target.querySelector('.cf-page-2'));

		assert.match(fixedBot.offsetTop, 500);
		assert.match(fixedMid.offsetTop, 250);

		var column1 = page.querySelectorAll('.cf-column-1');
		assert.match(column1.length, 2);

		assert.match(column1[0].offsetTop, 0);
		assert.match(column1[0].offsetHeight, 220);

		assert.match(column1[1].offsetTop, 380);
		assert.match(column1[1].offsetHeight, 100);
	},

	'ShouldHandleACollisionBetweenCenteredElements' : function() {

		createCf().flow('<div class="height600">height600</div>', '<div class="fixed100 anchor-middle-left">fixedContent</div><div class="fixed anchor-middle-left">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');
		var fixed1  = page.querySelector('.fixed100');
		var fixed2  = page.querySelector('.fixed');

		assert.match(fixed1.offsetTop, 250);
		assert.match(fixed2.offsetTop, 200);

		var column1 = page.querySelectorAll('.cf-column-1');
		assert.match(column1.length, 2);

		assert.match(column1[0].offsetTop, 0);
		assert.match(column1[0].offsetHeight, 180);

		assert.match(column1[1].offsetTop, 420);
		assert.match(column1[1].offsetHeight, 180);

		var column2 = page.querySelector('.cf-column-2');
		assert.match(cssProp(column2.childNodes[0], 'margin-top'), '-360px');
	},

	'ShouldHonourTheMinimumColumnHeight' : function() {

		createCf({
			columnGap     : 25,
			columnCount   : 3,
			columnFragmentMinHeight : 100,
		}).flow('<div class="height600">height600</div>', '<div class="fixed500">fixedContent</div>');

		var page    = target.querySelector('.cf-page-1');

		assert.isNull(page.querySelector('.cf-column-1'));

		var column2 = page.querySelector('.cf-column-2');
		assert.match(column2.offsetTop, 0);
		assert.match(column2.offsetHeight, 600);
		assert.match(cssProp(column2.childNodes[0], 'margin-top'), '0px');
	},

	'RegressionPageClassShouldNotResultInEmptyPages' : function() {

		createCf({
			columnGap     : 25,
			columnCount   : 3,
			columnFragmentMinHeight : 100
		}).flow('<div class="height600">height600</div>', '<div class="fixed">fixed1</div><div class="fixed attach-page-2">fixed2</div>');

		var page1  = target.querySelector('.cf-page-1');
		var page2  = target.querySelector('.cf-page-2');
		var column = page1.querySelector('.cf-column-1');

		assert(column instanceof HTMLElement);
		assert.isNull(page2.querySelector('.cf-column-1'));
	},

	'ShouldCorrectlyFlowContentWhenColspan1IsFollowedByColspan2' : function() {

		createCf({
			columnGap     : 25,
			columnCount   : 3,
			columnFragmentMinHeight : 100
		}).flow('<div class="height700">height700</div>', '<div class="fixed col-span-1">1</div><div class="fixed col-span-2">2</div>');

		var page    = target.querySelector('.cf-page-1');
		var column1 = page.querySelector('.cf-column-1');

		assert.match(column1.offsetTop, 440);
		assert.match(column1.offsetHeight, 160);

		var column2s = page.querySelectorAll('.cf-column-2');
		assert.match(column2s.length, 2);

		assert.match(column2s[0].offsetTop, 0);
		assert.match(column2s[0].offsetHeight, 200);

		assert.match(column2s[1].offsetTop, 440);
		assert.match(column2s[1].offsetHeight, 160);

	},

	'ShouldAllowFixedElementsToBeShiftedVertically' : function() {

		createCf().flow('<div class="height300">height300</div>', '<div class="fixed col-span-1 shift-up">1</div>');

		var page    = target.querySelector('.cf-page-1');
		var column1 = page.querySelector('.cf-column-1');

		assert.match(column1.offsetTop, 200);
		assert.match(column1.offsetHeight, 400);

	},

	'ShouldSetExplicitWidthOnFixedElementsWithAutoWidth' : function() {

		createCf().flow('<div class="height300">height300</div>', '<div class="fixed col-span-1 auto-width">1</div>');

		var page    = target.querySelector('.cf-page-1');
		var column1 = page.querySelector('.cf-column-1');
		var fixed   = page.querySelector('.fixed');

		assert.match(fixed.style.width, "250px");
		assert.match(parseInt(cssProp(fixed, 'width')), 250);

	},

	'ShouldSetExplicitWidthOnFixedElementsOverTwoColumns' : function() {

		createCf().flow('<div class="height300">height300</div>', '<div class="fixed col-span-2 auto-width">1</div>');

		var page    = target.querySelector('.cf-page-1');
		var column1 = page.querySelector('.cf-column-1');
		var fixed   = page.querySelector('.fixed');

		assert.match(fixed.style.width, "525px");
		assert.match(parseInt(cssProp(fixed, 'width')), 525);

	},

	'ShouldRespectAFloatValueForMinFixedPadding' : function() {

		// 205px, minimum gap 20px, next element starts at 240px
		createCf().flow('<p>flowedContent</p>', '<div class="fixed fixed205">fixedContent</div>');

		var page   = target.querySelector('.cf-page-1');
		var column = page.querySelector('.cf-column');

		assert.match(column.offsetTop, 240);
		assert.match(column.offsetHeight, 360);


		// 205px, minimum gap 10px, next element starts at 220px
		createCf({
			columnGap   : 25,
			columnCount : 3,
			minFixedPadding : 0.5
		}).flow('<p>flowedContent</p>', '<div class="fixed fixed205">fixedContent</div>');

		var page   = target.querySelector('.cf-page-1');
		var column = page.querySelector('.cf-column');

		assert.match(column.offsetTop, 220);
		assert.match(column.offsetHeight, 380);


		// 200px, minimum gap 30px, next element starts at 240px
		createCf({
			columnGap   : 25,
			columnCount : 3,
			minFixedPadding : 1.5
		}).flow('<p>flowedContent</p>', '<div class="fixed">fixedContent</div>');

		var page   = target.querySelector('.cf-page-1');
		var column = page.querySelector('.cf-column');

		assert.match(column.offsetTop, 240);
		assert.match(column.offsetHeight, 360);
	},

	'//ShouldSetExplicitHeightOnImagesWithSpecifiedAspectRatio' : function() {

		createCf().flow('<div class="height300">height300</div>', '<div class="fixed col-span-2"><img style="width: 200px" data-aspect-ratio="2" src="http://www.google.co.uk/images/srpr/logo3w.png" /></div>');

		var page    = target.querySelector('.cf-page-1');
		var column1 = page.querySelector('.cf-column-1');
		var fixed   = page.querySelector('.fixed');
		var img     = fixed.querySelector('img');

		assert.match(img.style.width, "200px");
		assert.match(img.style.height, "100px");
		assert.match(parseInt(cssProp(img, 'width')), 200);
		assert.match(parseInt(cssProp(img, 'height')), 100);
	},



//*/

});
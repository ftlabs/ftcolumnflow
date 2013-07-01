/**
 * FTColumnflow ColumnWrap test suite
 *
 * @copyright The Financial Times Limited [All Rights Reserved]
*/

"use strict";

var _exactHeightWrap     = '<div class="height500">height500</div><div class="height100">height100</div><div class="height100">height100</div>';
var _wrapToPage2         = '<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div><div class="height100">height100</div>';
var _overflowedElement   = '<div class="height500">height500</div><div class="height50">height50</div><div class="height100">height100</div>';





buster.testCase('ColumnWrap', {

	setUp : function(done) {
		document.body.innerHTML = '<div id="viewportid"><div id="targetid"></div></div>';
		addStylesheets(['all.css', 'columnwrap.css'], done);
	},

	tearDown : function() {
		removeStyleSheets();
		document.body.className = '';
	},

	'ShouldAcceptNodeOrStringAsContentParameter' : function() {

		createCf();

		refute.exception(function test() {
			cf.flow(document.createElement('p'));
		});

		refute.exception(function test() {
			cf.flow('<p>foo</p>');
		});

		assert.exception(function test() {
			cf.flow(new Array);
		}, 'FTColumnflowFlowedContentException');
	},

	'ShouldAcceptNodeOrStringAsFixedParameter' : function() {

		createCf();

		refute.exception(function test() {
			cf.flow('', document.createElement('p'));
		});

		refute.exception(function test() {
			cf.flow('', '<p>foo</p>');
		});

		assert.exception(function test() {
			cf.flow('', new Array);
		}, 'FTColumnflowFixedContentException');
	},

	'ShouldNotChangeExistingTargetId' : function() {

		createCf().flow();
		assert(target instanceof HTMLElement);
	},

	'ShouldAddAnIdToTargetIfNotSet' : function() {

		document.body.innerHTML = '<div id="viewportid"><div class="targetClass"></div></div>';
		var target = document.querySelector('.targetClass');

		new FTColumnflow(target, 'viewportid').flow();

		assert.match(target.id, /^cf-target-\d{10}$/);
	},

	'ShouldCreateAHiddenPreloadArea' : function() {

		createCf().flow();

		var preload = target.querySelector('.cf-preload');

		assert(preload instanceof HTMLElement);
		assert.className(preload, 'cf-page');

		assert.match(cssProp(preload, 'visibility'), 'hidden');
		assert.match(cssProp(preload, 'position'), 'absolute');
	},

	'ShouldCreateAPreloadColumnOfTheCorrectWidth' : function() {

		createCf().flow();

		var preload = target.querySelector('.cf-preload');
		var column  = preload.querySelector('.cf-column');

		assert.match(preload.childNodes.length, 1);
		assert(column instanceof HTMLElement);
		assert.match(column.clientWidth, 250);
	},

	'ShouldRespectConfigColumnAndClassNamesInPreloadArea' : function() {

		createCf({
			pageClass   : 'mypage',
			columnClass : 'mycol',
		}).flow();

		var preload = target.querySelector('.cf-preload');
		assert.className(preload, 'mypage');

		var column = preload.childNodes[0];
		assert.className(column, 'mycol');
	},

	'ShouldAddFlowedContentToPreloadArea' : function() {

		createCf().flow('<p>Hello there!</p>');

		var preload = target.querySelector('.cf-preload');
		var column  = preload.childNodes[0];

		assert.match(column.innerHTML, /^<p.*?>Hello there!<\/p>$/);
	},

	'ShouldAddContentFromAnExistingElement' : function() {

		var contentContainer = document.createElement('div');
		var flowedContent    = document.createElement('p');
		var text             = document.createTextNode('Hello there!');
		flowedContent.appendChild(text);
		contentContainer.appendChild(flowedContent);

		createCf().flow(contentContainer);

		var preload = target.querySelector('.cf-preload');
		var column  = preload.childNodes[0];

		assert.match(column.innerHTML, /^<p.*?>Hello there!<\/p>$/);
	},

	'ShouldLeaveOriginalContentUntouched' : function() {

		var contentContainer = document.createElement('div');
		contentContainer.id  = 'contentContainer';
		var flowedContent    = document.createElement('p');
		var text             = document.createTextNode('Hello there!');
		flowedContent.appendChild(text);
		contentContainer.appendChild(flowedContent);

		document.getElementById('viewportid').appendChild(contentContainer);

		createCf().flow(contentContainer);

		assert.match(document.getElementById('contentContainer').innerHTML, '<p>Hello there!</p>');
	},

	'ShouldAddAShortParagraphToPage1Column1' : function() {

		createCf().flow('<p>Hello there!</p>');

		var page = target.querySelector('.cf-page-1');
		assert(page instanceof HTMLElement);
		assert.className(page, 'cf-page');

		var column = page.querySelector('.cf-column-1');
		assert(column instanceof HTMLElement);
		assert.className(column, 'cf-column');

		assert.match(column.innerHTML, /^<p.*?>Hello there!<\/p>$/);
	},

	'ShouldOverwriteTargetContents' : function() {

		target.innerHTML = 'OVERWRITE';

		createCf().flow('<p>Hello there!</p>');

		refute.match(target.innerHTML, /OVERWRITE/);
	},

	'ShouldSetCorrectPageDimensions' : function() {

		createCf().flow('<p>Hello there!</p>');

		var page   = target.querySelector('.cf-page-1');

		assert.match(page.clientWidth, 800);
		assert.match(page.clientHeight, 600);
	},

	'ShouldRespectConfigColumnAndClassNames' : function() {

		createCf({
			pageClass     : 'mypage',
			columnClass   : 'mycol',
		}).flow('<p>Hello there!</p>');

		var page = target.querySelector('.mypage-1');
		assert.className(page, 'mypage');

		var column = page.querySelector('.mycol-1');
		assert.className(column, 'mycol');
	},

	'ShouldHideOverflowOnGeneratedColumns' : function() {

		createCf().flow('<p>Hello there!</p>');

		var column = target.querySelector('.cf-column-1');

		assert.match(cssProp(column, 'overflow'), 'hidden');
	},

	'ShouldSetTheCorrectWidthAndHeightOnTheGeneratedColumn' : function() {

		createCf().flow('<p>Hello there!</p>');

		var column = target.querySelector('.cf-column-1');

		assert.match(column.clientWidth, 250);
		assert.match(column.clientHeight, 600);
	},

	'ShouldSetCorrectAbsolutePositioningCss' : function() {

		createCf().flow('<p>Hello there!</p>');

		var page   = target.querySelector('.cf-page-1');
		var column = target.querySelector('.cf-column-1');

		assert.match(cssProp(target, 'position'), 'relative');
		assert.match(cssProp(page, 'position'), 'absolute');
		assert.match(cssProp(column, 'position'), 'absolute');
	},

	'ShouldSetTheCorrectPositionOnColumn1' : function() {

		createCf().flow('<p>Hello there!</p>');

		var column = target.querySelector('.cf-column-1');

		assert.match(column.offsetTop, 0);
		assert.match(column.offsetLeft, 0);
	},

	'ShouldCreateASecondColumnWhenFirstIsFull' : function() {

		createCf().flow(_exactHeightWrap);

		var column1 = target.querySelector('.cf-column-1');

		var column2 = target.querySelector('.cf-column-2');
		assert(column2 instanceof HTMLElement);

	},

	'ShouldSetCorrectDimensionsAndPositionOnSecondColumn' : function() {

		createCf().flow(_exactHeightWrap);

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assert.match(column1.clientWidth, 250);
		assert.match(column1.clientHeight, 600);

		assert.match(column2.clientWidth, 250);
		assert.match(column2.offsetTop, 0);
		assert.match(column2.offsetLeft, 275);
	},

	'ShouldWriteCorrectElementsToColumns' : function() {

		createCf().flow(_exactHeightWrap);

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assert.match(column1.childNodes.length, 2);

		assert.className(column1.childNodes[0], 'height500');
		assert.className(column1.childNodes[1], 'height100');

		assert.match(column2.childNodes.length, 1);

		assert.className(column2.childNodes[0], 'height100');
	},

	'ShouldFillColumnsAndCreateSecondPage' : function() {

		createCf().flow(_wrapToPage2);

		var page1  = target.querySelector('.cf-page-1');
		var page2  = target.querySelector('.cf-page-2');

		assert.match(page1.childNodes.length, 3);

		assert(page2 instanceof HTMLElement);
		assert.match(page2.childNodes.length, 1);

		var page2col1 = page2.querySelector('.cf-column-1');

		assert.match(page2col1.childNodes.length, 1);
		assert.className(page2col1.childNodes[0], 'height100');
	},

	'ShouldDisplayPagesHorizontallyByDefault' : function() {

		createCf().flow(_wrapToPage2);

		var page1  = target.querySelector('.cf-page-1');
		var page2  = target.querySelector('.cf-page-2');

		assert.match(cssProp(page1, 'left'), '0px');
		assert.match(cssProp(page1, 'top'), '0px');

		assert.match(cssProp(page2, 'left'), '800px');
		assert.match(cssProp(page2, 'top'), '0px');
	},

	'ShouldDisplayPagesVerticallyWhenSpecified' : function() {

		createCf({
			columnGap   : 25,
			columnCount : 3,
			pageArrangement : 'vertical',
		}).flow(_wrapToPage2);

		var page1  = target.querySelector('.cf-page-1');
		var page2  = target.querySelector('.cf-page-2');

		assert.match(cssProp(page1, 'left'), '0px');
		assert.match(cssProp(page1, 'top'), '0px');

		assert.match(cssProp(page2, 'left'), '0px');
		assert.match(cssProp(page2, 'top'), '600px');
	},

	'ShouldAddPagePadding' : function() {

		createCf({
			pagePadding   : 50,
			columnGap     : 25,
			columnCount   : 5,
		}).flow(_wrapToPage2 + _wrapToPage2);

		var page1  = target.querySelector('.cf-page-1');
		var page2  = target.querySelector('.cf-page-2');

		assert.match(page1.clientWidth, 800);
		assert.match(page1.clientHeight, 600);

		assert.match(page2.clientWidth, 800);
		assert.match(page2.clientHeight, 600);

		assert.match(cssProp(page1, 'left'), '0px');
		assert.match(cssProp(page1, 'top'), '0px');

		assert.match(cssProp(page2, 'left'), '800px');
		assert.match(cssProp(page2, 'top'), '0px');

		assert.match(page1.querySelector('.cf-column-1').offsetLeft, 50);
		assert.match(page1.querySelector('.cf-column-1').offsetWidth, 120);

		assert.match(page1.querySelector('.cf-column-2').offsetLeft, 195);
		assert.match(page1.querySelector('.cf-column-5').offsetLeft, 630);

		assert.match(page2.querySelector('.cf-column-1').offsetLeft, 50);
	},

	'ShouldAddVerticalPagePadding' : function() {

		createCf({
			pagePadding   : 50,
			columnGap   : 25,
			columnCount : 5,
			pageArrangement : 'vertical',
		}).flow(_wrapToPage2 + _wrapToPage2);

		var page1  = target.querySelector('.cf-page-1');
		var page2  = target.querySelector('.cf-page-2');

		assert.match(page1.clientWidth, 800);
		assert.match(page1.clientHeight, 600);

		assert.match(page2.clientWidth, 800);
		assert.match(page2.clientHeight, 600);

		assert.match(cssProp(page1, 'left'), '0px');
		assert.match(cssProp(page1, 'top'), '0px');

		assert.match(cssProp(page2, 'left'), '0px');
		assert.match(cssProp(page2, 'top'), '600px');

		assert.match(page1.querySelector('.cf-column-1').offsetLeft, 0);
		assert.match(page1.querySelector('.cf-column-1').offsetTop, 50);
		assert.match(page1.querySelector('.cf-column-1').offsetWidth, 140);
		assert.match(page1.querySelector('.cf-column-1').offsetHeight, 500);

		assert.match(page2.querySelector('.cf-column-1').offsetTop, 50);
	},

	'ShouldRepeatAnOverflowedElementOnTheNextColumn' : function() {

		createCf().flow(_overflowedElement);

		var column1 = target.querySelector('.cf-column-1');

		assert.className(column1.childNodes[column1.childNodes.length - 1], 'height100');

		var column2 = target.querySelector('.cf-column-2');
		assert(column2 instanceof HTMLElement);

		assert.match(column2.childNodes.length, 1);
		assert.className(column2.childNodes[0], 'height100');

		assert.match(column2.childNodes[0].innerHTML, column1.childNodes[2].innerHTML);
	},

	'ShouldSetNegativeTopMarginOnRemainderOfOverflowedElement' : function() {

		createCf().flow(_overflowedElement);

		var column2 = target.querySelector('.cf-column-2');
		var element = column2.childNodes[0];

		assert.match(cssProp(element, 'margin-top'), '-50px');
	},

	'ShouldCorrectlyWrapALargeElementOverManyColumns' : function() {

		createCf().flow('<div class="height300">height300</div><div class="height1000">height1000</div>');

		var column2 = target.querySelector('.cf-column-2');
		var column3 = target.querySelector('.cf-column-3');

		assert.match(cssProp(column2.childNodes[0], 'margin-top'), '-300px');
		assert.match(cssProp(column3.childNodes[0], 'margin-top'), '-900px');
	},

	'ShouldCorrectlyWrapAHugeElementOverManyColumns' : function() {

		createCf().flow('<div class="height3000">height3000</div>');

		var page2   = target.querySelector('.cf-page-2');
		var p2col2  = page2.querySelector('.cf-column-2');

		assert.match(cssProp(p2col2.childNodes[0], 'margin-top'), '-2400px');
		assert.isNull(page2.querySelector('.cf-column-3'));
	},

	'ShouldWrapPlainTextInParagraphTags' : function() {

		createCf().flow('plain text');

		var column = target.querySelector('.cf-column-1');

		assert.match(column.innerHTML, /^<p.*?>plain text<\/p>$/);
	},

	'ShouldIgnoreEmptyTextNodes' : function() {

		createCf().flow('\n<p>parag 1</p>\n<p>parag 2</p>\n');

		var column = target.querySelector('.cf-column-1');

		assert.match(column.innerHTML, /^<p.*?>parag 1<\/p><p.*?>parag 2<\/p>$/);
	},

	'ShouldNotCarryParagraphBottomMarginsOverToNextColumn' : function() {

		createCf().flow('<div class="simulated-parags">simulated-parags</div><div class="simulated-parags">simulated-parags</div><div class="simulated-parags">simulated-parags</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assert.match(column1.childNodes.length, 2);
		assert.match(column2.childNodes.length, 1);

		var element = column2.childNodes[0];
		assert.match(element.style.marginTop, '0px');
	},

	'ShouldNotWrapAnElementWithNowrapClass' : function() {

		createCf().flow('<div class="height500">height500</div><div class="height200 nowrap">height200 nowrap</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 1);

		var element = column2.childNodes[0];

		assert.className(element, 'nowrap');
		assert.match(element.style.marginTop, '0px');
	},

	'ShouldNotMoveAnElementWithNowrapClassWhichFitsInAColumn' : function() {

		createCf().flow('<div class="height500">height500</div><div class="height100 nowrap">height100 nowrap</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assert.match(column1.childNodes.length, 2);
		assert.isNull(column2);
	},

	'ShouldCorrectlyPositionSuccessiveNowrapElements' : function() {

		createCf().flow('<div class="height500">height500</div><div class="height500 nowrap">height500 nowrap</div><div class="height500 nowrap">height500 nowrap</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');
		var column3 = target.querySelector('.cf-column-3');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 1);
		assert.match(column3.childNodes.length, 1);

		assert.match(column2.childNodes[0].style.marginTop, '0px');
		assert.match(column3.childNodes[0].style.marginTop, '0px');
	},

	'ShouldCropATallNowrapElement' : function() {

		createCf().flow('<div class="height1000 nowrap">height1000 nowrap</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assert.match(column1.childNodes.length, 1);
		assert.isNull(column2);
	},

	'ShouldMoveThenCropATallNowrapElement' : function() {

		createCf().flow('<div class="height500">height500</div><div class="height1000 nowrap">height1000 nowrap</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');
		var column3 = target.querySelector('.cf-column-3');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 1);
		assert.isNull(column3);

		var element = column2.childNodes[0];

		assert.className(element, 'nowrap');
		assert.match(element.style.marginTop, '0px');
	},

	'ShouldNotWrapAnElementWhichMatchesNoWrapOnTags' : function() {

		createCf({
			columnGap   : 25,
			columnCount : 3,
			noWrapOnTags : ['section'],
		}).flow('<div class="height500">height500</div><section class="height200">height200 nowrap</section>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 1);

		var element = column2.childNodes[0];

		assert.tagName(element, 'section');
		assert.match(element.style.marginTop, '0px');
	},

	'ShouldIgnoreCaseOfNoWrapOnTags' : function() {

		createCf({
			columnGap   : 25,
			columnCount : 3,
			noWrapOnTags : ['SECTION'],
		}).flow('<div class="height500">height500</div><section class="height200">height200 nowrap</section>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 1);

		var element = column2.childNodes[0];

		assert.tagName(element, 'section');
		assert.match(element.style.marginTop, '0px');
	},

	'ShouldNotWrapAnElementWithKeepwithnextClass' : function() {

		createCf().flow('<div class="height500">height500</div><div class="height200 keepwithnext">height200 keepwithnext</div><div class="height100">height100</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 2);

		var element = column2.childNodes[0];

		assert.className(element, 'keepwithnext');
		assert.match(element.style.marginTop, '0px');
	},

	'ShouldWrapAKeepwithnextElementWhenItsTheFinalElement' : function() {

		createCf().flow('<div class="height500">height500</div><div class="height200 keepwithnext">height200 keepwithnext</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assert.match(column1.childNodes.length, 2);
		assert.match(column2.childNodes.length, 1);

		var element = column2.childNodes[0];

		assert.className(element, 'keepwithnext');
		assert.match(element.style.marginTop, '-100px');
	},

	'ShouldMoveThenCropATallKeepwithnextElement' : function() {

		createCf().flow('<div class="height500">height500</div><div class="height1000 keepwithnext">height1000 keepwithnext</div><div class="height100">height100</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');
		var column3 = target.querySelector('.cf-column-3');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 1);
		assert.match(column3.childNodes.length, 1);

		assert.className(column2.childNodes[0], 'keepwithnext');
		assert.match(column2.childNodes[0].style.marginTop, '0px');

		assert.className(column3.childNodes[0], 'height100');
		assert.match(column3.childNodes[0].style.marginTop, '0px');
	},

	'ShouldCropATallKeepwithnextElement' : function() {

		createCf().flow('<div class="height1000 keepwithnext">height1000 keepwithnext</div><div class="height100">height100</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 1);

		assert.className(column2.childNodes[0], 'height100');
		assert.match(column2.childNodes[0].style.marginTop, '0px');
	},

	'ShouldMoveAKeepwithnextElementToJoinFollowingPlainTextElement' : function() {

		createCf().flow('<div class="height500">height500</div><div class="height100 keepwithnext">height100 keepwithnext</div><div class="height100">height100</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 2);

		assert.className(column2.childNodes[0], 'keepwithnext');
		assert.match(column2.childNodes[0].style.marginTop, '0px');
	},

	'ShouldIgnoreKeepwithnextClassOnFinalElement' : function() {

		createCf().flow('<div class="height400">height400</div><div class="height100 keepwithnext">height100 keepwithnext</div>');

		var column1 = target.querySelector('.cf-column-1');

		assert.match(column1.childNodes.length, 2);
		assert.isNull(target.querySelector('.cf-column-2'));
	},

	'ShouldCorrectlyHandleAnElementWithBothKeepwithnextAndNowrapClasses' : function() {

		createCf().flow('<div class="height500">height500</div><div class="height200 keepwithnext nowrap">height200 keepwithnext</div><div class="height100">height100</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 2);

		assert.match(column2.childNodes[0].style.marginTop, '0px');
	},

	'NowrapShouldNotAffectFollowingColumns' : function() {

		createCf().flow('<div class="height500">height500</div><div class="height200 nowrap">height200 nowrap</div><div class="height500">height500</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');
		var column3 = target.querySelector('.cf-column-3');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 2);
		assert.match(column3.childNodes.length, 1);

		assert.match(column3.childNodes[0].style.marginTop, '-400px');
	},

	'KeepwithnextShouldNotAffectFollowingColumns' : function() {

		createCf().flow('<div class="height500">height500</div><div class="height100 keepwithnext">height100 keepwithnext</div><div class="height500">height500</div><div class="height500">height500</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');
		var column3 = target.querySelector('.cf-column-3');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 2);
		assert.match(column3.childNodes.length, 1);

		assert.match(column2.childNodes[0].style.marginTop, '0px');
		assert.match(column3.childNodes[0].style.marginTop, '0px');
	},

	'ShouldCorrectlyPositionANowrapFollowingAKeepwithnext' : function() {

		createCf().flow('<div class="height400">height400</div><div class="height100 keepwithnext">height100 keepwithnext</div><div class="height200 nowrap">height200 nowrap</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 2);
		assert.isNull(target.querySelector('.cf-column-3'));

		assert.className(column2.childNodes[0], 'keepwithnext');
		assert.match(column2.childNodes[0].style.marginTop, '0px');
	},

	'ShouldObeyKeepwithnextWhenNextElementHasNowrapClassAndOverflows' : function() {

		createCf().flow('<div class="height400">height400</div><div class="height100 keepwithnext">height100 keepwithnext</div><div class="height200 nowrap">height200 nowrap</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 2);

		var element = column2.childNodes[0];

		assert.className(element, 'keepwithnext');
		assert.match(element.style.marginTop, '0px');
	},

	'Regression1ItShouldUpdateColumnHeightAfterAnElementIsCropped' : function() {

		createCf().flow('<div class="height700 keepwithnext">700 keepwithnext</div><div class="height300">300</div><div class="height300 ">300 </div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 2);
		assert.isNull(target.querySelector('.cf-column-3'));
	},

	'Regression2MissingLastElement' : function() {

		createCf().flow('<div class="height700">700</div><div class="height200 keepwithnext">200 keepwithnext</div><div class="height100">100</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 3);
		assert.isNull(target.querySelector('.cf-column-3'));

		assert.className(column2.childNodes[0], 'height700');
		assert.match(column2.childNodes[0].style.marginTop, '-600px');
	},

	'Regression5LargeSpaceAdded' : function() {

		createCf().flow('<div class="height700">700</div><div class="height200 nowrap keepwithnext">200 nowrap keepwithnext</div><div class="height500">500</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');
		var column3 = target.querySelector('.cf-column-3');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 3);
		assert.match(column3.childNodes.length, 1);

		assert.className(column3.childNodes[0], 'height500');
		assert.match(column3.childNodes[0].style.marginTop, '-300px');
	},

	'Regression7ItShouldNotGetIntoAnEndlessLoop' : function() {

		// With the loop-protection removed, this test should cause an endless loop if the bug is not fixed.

		createCf().flow('<div class="height600  keepwithnext">1: 600  keepwithnext</div><div class="height700">2: 700</div>');
		assert(true);

	},

	'Regression10TheLastElementShouldNotBeCropped' : function() {

		createCf().flow('<div class="height500 keepwithnext">5: 500 keepwithnext</div><div class="height200 keepwithnext">7: 200 keepwithnext</div>');


		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assert.match(column1.childNodes.length, 2);
		assert.match(column2.childNodes.length, 1);

		assert.match(column2.childNodes[0].style.marginTop, '-100px');
	},

	'Regression10SecondElementShouldBeInColumn2' : function() {

		createCf().flow('<div class="height300 keepwithnext">2: 300 keepwithnext</div><div class="height400 keepwithnext">3: 400 keepwithnext</div><div class="height200">4: 200</div>');


		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 2);

		assert.className(column2.childNodes[0], 'height400');
		assert.className(column2.childNodes[0], 'keepwithnext');
		assert.match(column2.childNodes[0].style.marginTop, '0px');
	},

	'RegressionItShouldCorrectlyPlaceSuccessiveFullheightElements' : function() {

		createCf().flow('<p class="height600">height600</p><p class="height600">height600</p>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assert.match(column1.childNodes.length, 1);
		assert.match(column2.childNodes.length, 1);

		assert.isNull(target.querySelector('.cf-column-3'));
		assert.match(column2.childNodes[0].style.marginTop, '0px');
	},

	'ShouldCorrectlyReportSinglePageCount' : function() {

		createCf({
			columnCount : 1
		}).flow('<div class="height300">height300</div>');

		assert.match(cf.pageCount, 1);
	},

	'ShouldCorrectlyReportLargerPageCount' : function() {

		createCf({
			columnCount : 1
		}).flow('<div class="height3000">height3000</div>');

		assert.match(cf.pageCount, 5);
	},

	'ShouldAddExplicitWidthAndHeightToTarget' : function() {

		createCf().flow('<div class="height300">height300</div>');

		assert.match(target.style.width, '800px');
		assert.match(cssProp(target, 'width'), '800px');
		assert.match(cssProp(target, 'height'), '600px');
	},

	'ShouldCorrectlyReportLayoutDimensions' : function() {

		createCf({
			columnGap   : 20,
			columnCount : 4,
			pagePadding : 50
		}).flow('<div class="height300">height300</div>');

 		var dimesions = cf.layoutDimensions;

 		assert.match(dimesions.pageInnerWidth, 700);
 		assert.match(dimesions.pageInnerHeight, 600);
 		assert.match(dimesions.colDefaultTop, 0);
 		assert.match(dimesions.colDefaultLeft, 50);
 		assert.match(dimesions.columnCount, 4);
 		assert.match(dimesions.columnWidth, 160);
 		assert.match(dimesions.columnGap, 20);
	},

	'//ShouldSetExplicitHeightOnImagesWithSpecifiedAspectRatio' : function() {

		createCf().flow('<div class="height300">height300</div><img style="width: 200px" data-aspect-ratio="2" src="http://www.google.co.uk/images/srpr/logo3w.png" /><div class="height300">height300</div>');

		var page    = target.querySelector('.cf-page-1');
		var column1 = page.querySelector('.cf-column-1');
		var column2 = page.querySelector('.cf-column-2');
		var img     = column1.querySelector('img');
		var div2    = column2.querySelector('div');

		assert.match(img.style.width, "200px");
		assert.match(img.style.height, "100px");
		assert.match(parseInt(cssProp(img, 'width')), 200);
		assert.match(parseInt(cssProp(img, 'height')), 100);

		assert.match(div2.style.marginTop, '-200px');
	},

	'//ShouldObeyAllHistoricalKeepwithnextElementsWhichFitInNextColumn' : function() {

		createCf().flow('<div class="height100 keepwithnext">1 height100 keepwithnext</div><div class="height100 plaintext">2 height100 plaintext</div><div class="height100 keepwithnext">3 height100 keepwithnext</div><div class="height100 keepwithnext">4 height100 keepwithnext</div><div class="height100 keepwithnext">5 height100 keepwithnext</div><div class="height100 keepwithnext">6 height100 keepwithnext</div><div class="height100 plaintext">7 height100 plaintext</div>');
	},

	'//ShouldMoveLastInAStringOfKeepwithnextElementIntoNextColumn' : function() {},

	'//ShouldSplitALongStreamOfKeepwithnextElementsWhenAColumnIsFull' : function() {},

	'//ShouldObeyAllHistoricalKeepwithnextElementsUntilStartOfColumn' : function() {},


//*/



	// Regression 4 - The two 100 keepwithnext should be in col 1.
	// <div class="height100 ">100 </div><div class="height100 ">100 </div><div class="height200 nowrap">200 nowrap</div><div class="height100 nowrap keepwithnext">100 nowrap keepwithnext</div><div class="height100 nowrap keepwithnext">100 nowrap keepwithnext</div><div class="height500 keepwithnext">500 keepwithnext</div><div class="height200 ">200 </div><div class="height300 ">300 </div>

	// Consider some 'typographical measure' logic - reduce the number of columns per page if the measure is too small (because the font size is too large)
	// We should remove any padding on the viewport, and any padding or margin on the articles.
	// Run Arrhythmia("body").validateRhythm(); (https://github.com/mattbaker/Arrhythmia) to check vertical rhythm after I've added padding functionality.
	// Add 'near-parag-14' or similar class to images, and attempt to get them onto the same page. If an inline image overflows the bottom of a column, there are two options: 1) leave whitespace and place image at top of next col. 2) start the paragraph of text, and place image at top of next col, continuing parag afterwards.
	// Allow column-spans for inline images. This is a future feature request.
	// Consider a breakafter class, or similar, to always break after this element.
	// Shouldn't most tags (img, headings, etc.) be nowrap by default? Perhaps have a default list of tags which are NOT nowrap, and allow it to be overridden.

});
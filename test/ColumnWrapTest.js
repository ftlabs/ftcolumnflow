/**
 * FTColumnflow ColumnWrap test suite
 *
 * @copyright The Financial Times Limited [All Rights Reserved]
*/


var _exactHeightWrap     = '<div class="height500">height500</div><div class="height100">height100</div><div class="height100">height100</div>';
var _wrapToPage2         = '<div class="height600">height600</div><div class="height600">height600</div><div class="height600">height600</div><div class="height100">height100</div>';
var _overflowedElement   = '<div class="height500">height500</div><div class="height50">height50</div><div class="height100">height100</div>';


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

TestCase('ColumnWrap', {

	setUp : function() {
		document.body.innerHTML = '<div id="viewportid"><div id="targetid"></div></div>';
		document.body.className = 'columnwrap';
	},

	tearDown : function() {
		var styles = document.getElementsByTagName('style');
		for (var i = 0, len = styles.length; i < len; i++) {
			if (styles[i] && styles[i].nodeType == 1) styles[i].parentNode.removeChild(styles[i]);
		}
	},

	testItShouldAcceptNodeOrStringAsContentParameter : function() {

		createCf();

		assertNoException(function test() {
			cf.flow(document.createElement('p'));
		});

		assertNoException(function test() {
			cf.flow('<p>foo</p>');
		});

		assertException(function test() {
			cf.flow(new Array);
		}, 'FTColumnflowFlowedContentException');
	},

	testItShouldAcceptNodeOrStringAsFixedParameter : function() {

		createCf();

		assertNoException(function test() {
			cf.flow('', document.createElement('p'));
		});

		assertNoException(function test() {
			cf.flow('', '<p>foo</p>');
		});

		assertException(function test() {
			cf.flow('', new Array);
		}, 'FTColumnflowFixedContentException');
	},

	testItShouldNotChangeExistingTargetId : function() {

		createCf().flow();
		assertTrue(target instanceof HTMLElement);
	},

	testItShouldAddAnIdToTargetIfNotSet : function() {

		document.body.innerHTML = '<div id="viewportid"><div class="targetClass"></div></div>';
		var target = document.querySelector('.targetClass');

		cf = new FTColumnflow(target, 'viewportid');
		cf.flow();

		assertMatch(/^cf-target-\d{10}$/, target.id);
	},

	testItShouldCreateAHiddenPreloadArea : function() {

		createCf().flow();

		var preload = target.querySelector('.cf-preload');

		assertTrue(preload instanceof HTMLElement);
		assertClassName('cf-page', preload);

		assertEquals('hidden', window.getComputedStyle(preload).getPropertyValue('visibility'));
		assertEquals('absolute', window.getComputedStyle(preload).getPropertyValue('position'));
	},

	testItShouldCreateAPreloadColumnOfTheCorrectWidth : function() {

		createCf().flow();

		var preload = target.querySelector('.cf-preload');
		var column  = preload.querySelector('.cf-column');

		assertEquals(1, preload.childNodes.length);
		assertTrue(column instanceof HTMLElement);
		assertEquals(250, column.clientWidth);
	},

	testItShouldRespectConfigColumnAndClassNamesInPreloadArea : function() {

		createCf({
			pageClass   : 'mypage',
			columnClass : 'mycol',
		}).flow();

		var preload = target.querySelector('.cf-preload');
		assertClassName('mypage', preload);

		var column = preload.childNodes[0];
		assertClassName('mycol', column);
	},

	testItShouldAddFlowedContentToPreloadArea : function() {

		createCf().flow('<p>Hello there!</p>');

		var preload = target.querySelector('.cf-preload');
		var column  = preload.childNodes[0];

		assertMatch(/^<p.*?>Hello there!<\/p>$/, column.innerHTML);
	},

	testItShouldAddContentFromAnExistingElement : function() {

		var contentContainer = document.createElement('div');
		var flowedContent    = document.createElement('p');
		var text             = document.createTextNode('Hello there!');
		flowedContent.appendChild(text);
		contentContainer.appendChild(flowedContent);

		createCf().flow(contentContainer);

		var preload = target.querySelector('.cf-preload');
		var column  = preload.childNodes[0];

		assertMatch(/^<p.*?>Hello there!<\/p>$/, column.innerHTML);
	},

	testItShouldLeaveOriginalContentUntouched : function() {

		var contentContainer = document.createElement('div');
		contentContainer.id  = 'contentContainer';
		var flowedContent    = document.createElement('p');
		var text             = document.createTextNode('Hello there!');
		flowedContent.appendChild(text);
		contentContainer.appendChild(flowedContent);

		document.getElementById('viewportid').appendChild(contentContainer);

		createCf().flow(contentContainer);

		assertEquals('<p>Hello there!</p>', document.getElementById('contentContainer').innerHTML);
	},

	testItShouldAddAShortParagraphToPage1Column1 : function() {

		createCf().flow('<p>Hello there!</p>');

		var page = target.querySelector('.cf-page-1');
		assertTrue(page instanceof HTMLElement);
		assertClassName('cf-page', page);

		var column = page.querySelector('.cf-column-1');
		assertTrue(column instanceof HTMLElement);
		assertClassName('cf-column', column);

		assertMatch(/^<p.*?>Hello there!<\/p>$/, column.innerHTML);
	},

	testItShouldOverwriteTargetContents : function() {

		target.innerHTML = 'OVERWRITE';

		createCf().flow('<p>Hello there!</p>');

		assertNoMatch(/OVERWRITE/, target.innerHTML);
	},

	testItShouldSetCorrectPageDimensions : function() {

		createCf().flow('<p>Hello there!</p>');

		var page   = target.querySelector('.cf-page-1');

		assertEquals(800, page.clientWidth);
		assertEquals(600, page.clientHeight);
	},

	testItShouldRespectConfigColumnAndClassNames : function() {

		createCf({
			pageClass     : 'mypage',
			columnClass   : 'mycol',
		}).flow('<p>Hello there!</p>');

		var page = target.querySelector('.mypage-1');
		assertClassName('mypage', page);

		var column = page.querySelector('.mycol-1');
		assertClassName('mycol', column);
	},

	testItShouldHideOverflowOnGeneratedColumns : function() {

		createCf().flow('<p>Hello there!</p>');

		var column = target.querySelector('.cf-column-1');

		assertEquals('hidden', window.getComputedStyle(column).getPropertyValue('overflow'));
	},

	testItShouldSetTheCorrectWidthAndHeightOnTheGeneratedColumn : function() {

		createCf().flow('<p>Hello there!</p>');

		var column = target.querySelector('.cf-column-1');

		assertEquals(250, column.clientWidth);
		assertEquals(600, column.clientHeight);
	},

	testItShouldSetCorrectAbsolutePositioningCss : function() {

		createCf().flow('<p>Hello there!</p>');

		var page   = target.querySelector('.cf-page-1');
		var column = target.querySelector('.cf-column-1');

		assertEquals('relative', window.getComputedStyle(target).getPropertyValue('position'));
		assertEquals('absolute', window.getComputedStyle(page).getPropertyValue('position'));
		assertEquals('absolute', window.getComputedStyle(column).getPropertyValue('position'));
	},

	testItShouldSetTheCorrectPositionOnColumn1 : function() {

		createCf().flow('<p>Hello there!</p>');

		var column = target.querySelector('.cf-column-1');

		assertEquals(0, column.offsetTop);
		assertEquals(0, column.offsetLeft);
	},

	testItShouldCreateASecondColumnWhenFirstIsFull : function() {

		createCf().flow(_exactHeightWrap);

		var column1 = target.querySelector('.cf-column-1');

		var column2 = target.querySelector('.cf-column-2');
		assertTrue(column2 instanceof HTMLElement);

	},

	testItShouldSetCorrectDimensionsAndPositionOnSecondColumn : function() {

		createCf().flow(_exactHeightWrap);

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assertEquals(250, column1.clientWidth);
		assertEquals(600, column1.clientHeight);

		assertEquals(250, column2.clientWidth);
		assertEquals(0, column2.offsetTop);
		assertEquals(275, column2.offsetLeft);
	},

	testItShouldWriteCorrectElementsToColumns : function() {

		createCf().flow(_exactHeightWrap);

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assertEquals(2, column1.childNodes.length);

		assertClassName('height500', column1.childNodes[0]);
		assertClassName('height100', column1.childNodes[1]);

		assertEquals(1, column2.childNodes.length);

		assertClassName('height100', column2.childNodes[0]);
	},

	testItShouldFillColumnsAndCreateSecondPage : function() {

		createCf().flow(_wrapToPage2);

		var page1  = target.querySelector('.cf-page-1');
		var page2  = target.querySelector('.cf-page-2');

		assertEquals(3, page1.childNodes.length);

		assertTrue(page2 instanceof HTMLElement);
		assertEquals(1, page2.childNodes.length);

		var page2col1 = page2.querySelector('.cf-column-1');

		assertEquals(1, page2col1.childNodes.length);
		assertClassName('height100', page2col1.childNodes[0]);
	},

	testItShouldDisplayPagesHorizontallyByDefault : function() {

		createCf().flow(_wrapToPage2);

		var page1  = target.querySelector('.cf-page-1');
		var page2  = target.querySelector('.cf-page-2');

		assertEquals('0px', window.getComputedStyle(page1).getPropertyValue('left'));
		assertEquals('0px', window.getComputedStyle(page1).getPropertyValue('top'));

		assertEquals('800px', window.getComputedStyle(page2).getPropertyValue('left'));
		assertEquals('0px', window.getComputedStyle(page2).getPropertyValue('top'));
	},

	testItShouldDisplayPagesVerticallyWhenSpecified : function() {

		createCf({
			columnGap   : 25,
			columnCount : 3,
			pageArrangement : 'vertical',
		}).flow(_wrapToPage2);

		var page1  = target.querySelector('.cf-page-1');
		var page2  = target.querySelector('.cf-page-2');

		assertEquals('0px', window.getComputedStyle(page1).getPropertyValue('left'));
		assertEquals('0px', window.getComputedStyle(page1).getPropertyValue('top'));

		assertEquals('0px', window.getComputedStyle(page2).getPropertyValue('left'));
		assertEquals('600px', window.getComputedStyle(page2).getPropertyValue('top'));
	},

	testItShouldAddPagePadding : function() {

		createCf({
			pagePadding   : 50,
			columnGap     : 25,
			columnCount   : 5,
		}).flow(_wrapToPage2 + _wrapToPage2);

		var page1  = target.querySelector('.cf-page-1');
		var page2  = target.querySelector('.cf-page-2');

		assertEquals(800, page1.clientWidth);
		assertEquals(600, page1.clientHeight);

		assertEquals(800, page2.clientWidth);
		assertEquals(600, page2.clientHeight);

		assertEquals('0px', window.getComputedStyle(page1).getPropertyValue('left'));
		assertEquals('0px', window.getComputedStyle(page1).getPropertyValue('top'));

		assertEquals('800px', window.getComputedStyle(page2).getPropertyValue('left'));
		assertEquals('0px', window.getComputedStyle(page2).getPropertyValue('top'));

		assertEquals(50, page1.querySelector('.cf-column-1').offsetLeft);
		assertEquals(120, page1.querySelector('.cf-column-1').offsetWidth);

		assertEquals(195, page1.querySelector('.cf-column-2').offsetLeft);
		assertEquals(630, page1.querySelector('.cf-column-5').offsetLeft);

		assertEquals(50, page2.querySelector('.cf-column-1').offsetLeft);
	},

	testItShouldAddVerticalPagePadding : function() {

		createCf({
			pagePadding   : 50,
			columnGap   : 25,
			columnCount : 5,
			pageArrangement : 'vertical',
		}).flow(_wrapToPage2 + _wrapToPage2);

		var page1  = target.querySelector('.cf-page-1');
		var page2  = target.querySelector('.cf-page-2');

		assertEquals(800, page1.clientWidth);
		assertEquals(600, page1.clientHeight);

		assertEquals(800, page2.clientWidth);
		assertEquals(600, page2.clientHeight);

		assertEquals('0px', window.getComputedStyle(page1).getPropertyValue('left'));
		assertEquals('0px', window.getComputedStyle(page1).getPropertyValue('top'));

		assertEquals('0px', window.getComputedStyle(page2).getPropertyValue('left'));
		assertEquals('600px', window.getComputedStyle(page2).getPropertyValue('top'));

		assertEquals(0, page1.querySelector('.cf-column-1').offsetLeft);
		assertEquals(50, page1.querySelector('.cf-column-1').offsetTop);
		assertEquals(140, page1.querySelector('.cf-column-1').offsetWidth);
		assertEquals(500, page1.querySelector('.cf-column-1').offsetHeight);

		assertEquals(50, page2.querySelector('.cf-column-1').offsetTop);
	},

	testItShouldRepeatAnOverflowedElementOnTheNextColumn : function() {

		createCf().flow(_overflowedElement);

		var column1 = target.querySelector('.cf-column-1');

		assertClassName('height100', column1.childNodes[column1.childNodes.length - 1]);

		var column2 = target.querySelector('.cf-column-2');
		assertTrue(column2 instanceof HTMLElement);

		assertEquals(1, column2.childNodes.length);
		assertClassName('height100', column2.childNodes[0]);

		assertEquals(column1.childNodes[2].innerHTML, column2.childNodes[0].innerHTML);
	},

	testItShouldSetNegativeTopMarginOnRemainderOfOverflowedElement : function() {

		createCf().flow(_overflowedElement);

		var column2 = target.querySelector('.cf-column-2');
		var element = column2.childNodes[0];

		assertEquals('-50px', window.getComputedStyle(element).getPropertyValue('margin-top'));
	},

	testItShouldCorrectlyWrapALargeElementOverManyColumns : function() {

		createCf().flow('<div class="height300">height300</div><div class="height1000">height1000</div>');

		var column2 = target.querySelector('.cf-column-2');
		var column3 = target.querySelector('.cf-column-3');

		assertEquals('-300px', window.getComputedStyle(column2.childNodes[0]).getPropertyValue('margin-top'));
		assertEquals('-900px', window.getComputedStyle(column3.childNodes[0]).getPropertyValue('margin-top'));
	},

	testItShouldCorrectlyWrapAHugeElementOverManyColumns : function() {

		createCf().flow('<div class="height3000">height3000</div>');

		var page2   = target.querySelector('.cf-page-2');
		var p2col2  = page2.querySelector('.cf-column-2');

		assertEquals('-2400px', window.getComputedStyle(p2col2.childNodes[0]).getPropertyValue('margin-top'));
		assertNull(page2.querySelector('.cf-column-3'));
	},

	testItShouldWrapPlainTextInParagraphTags : function() {

		createCf().flow('plain text');

		var column = target.querySelector('.cf-column-1');

		assertMatch(/^<p.*?>plain text<\/p>$/, column.innerHTML);
	},

	testItShouldIgnoreEmptyTextNodes : function() {

		createCf().flow('\n<p>parag 1</p>\n<p>parag 2</p>\n');

		var column = target.querySelector('.cf-column-1');

		assertMatch(/^<p.*?>parag 1<\/p><p.*?>parag 2<\/p>$/, column.innerHTML);
	},

	testItShouldNotCarryParagraphBottomMarginsOverToNextColumn : function() {

		createCf().flow('<div class="simulated-parags">simulated-parags</div><div class="simulated-parags">simulated-parags</div><div class="simulated-parags">simulated-parags</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assertEquals(2, column1.childNodes.length);
		assertEquals(1, column2.childNodes.length);

		var element = column2.childNodes[0];
		assertEquals('0px', element.style.marginTop);
	},

	testItShouldNotWrapAnElementWithNowrapClass : function() {

		createCf().flow('<div class="height500">height500</div><div class="height200 nowrap">height200 nowrap</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assertEquals('1 elem in col 1', 1, column1.childNodes.length);
		assertEquals('1 elem in col 2', 1, column2.childNodes.length);

		var element = column2.childNodes[0];

		assertClassName('nowrap', element);
		assertEquals('0px', element.style.marginTop);
	},

	testItShouldNotMoveAnElementWithNowrapClassWhichFitsInAColumn : function() {

		createCf().flow('<div class="height500">height500</div><div class="height100 nowrap">height100 nowrap</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assertEquals(2, column1.childNodes.length);
		assertNull(column2);
	},

	testItShouldCorrectlyPositionSuccessiveNowrapElements : function() {

		createCf().flow('<div class="height500">height500</div><div class="height500 nowrap">height500 nowrap</div><div class="height500 nowrap">height500 nowrap</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');
		var column3 = target.querySelector('.cf-column-3');

		assertEquals(1, column1.childNodes.length);
		assertEquals(1, column2.childNodes.length);
		assertEquals(1, column3.childNodes.length);

		assertEquals('0px', column2.childNodes[0].style.marginTop);
		assertEquals('0px', column3.childNodes[0].style.marginTop);
	},

	testItShouldCropATallNowrapElement : function() {

		createCf().flow('<div class="height1000 nowrap">height1000 nowrap</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assertEquals(1, column1.childNodes.length);
		assertNull(column2);
	},

	testItShouldMoveThenCropATallNowrapElement : function() {

		createCf().flow('<div class="height500">height500</div><div class="height1000 nowrap">height1000 nowrap</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');
		var column3 = target.querySelector('.cf-column-3');

		assertEquals(1, column1.childNodes.length);
		assertEquals(1, column2.childNodes.length);
		assertNull(column3);

		var element = column2.childNodes[0];

		assertClassName('nowrap', element);
		assertEquals('0px', element.style.marginTop);
	},

	testItShouldNotWrapAnElementWhichMatchesNoWrapOnTags : function() {

		createCf({
			columnGap   : 25,
			columnCount : 3,
			noWrapOnTags : ['section'],
		}).flow('<div class="height500">height500</div><section class="height200">height200 nowrap</section>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assertEquals('1 elem in col 1', 1, column1.childNodes.length);
		assertEquals('1 elem in col 2', 1, column2.childNodes.length);

		var element = column2.childNodes[0];

		assertTagName('section', element);
		assertEquals('0px', element.style.marginTop);
	},

	testItShouldIgnoreCaseOfNoWrapOnTags : function() {

		createCf({
			columnGap   : 25,
			columnCount : 3,
			noWrapOnTags : ['SECTION'],
		}).flow('<div class="height500">height500</div><section class="height200">height200 nowrap</section>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assertEquals('1 elem in col 1', 1, column1.childNodes.length);
		assertEquals('1 elem in col 2', 1, column2.childNodes.length);

		var element = column2.childNodes[0];

		assertTagName('section', element);
		assertEquals('0px', element.style.marginTop);
	},

	testItShouldNotWrapAnElementWithKeepwithnextClass : function() {

		createCf().flow('<div class="height500">height500</div><div class="height200 keepwithnext">height200 keepwithnext</div><div class="height100">height100</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assertEquals(1, column1.childNodes.length);
		assertEquals(2, column2.childNodes.length);

		var element = column2.childNodes[0];

		assertClassName('keepwithnext', element);
		assertEquals('0px', element.style.marginTop);
	},

	testItShouldWrapAKeepwithnextElementWhenItsTheFinalElement : function() {

		createCf().flow('<div class="height500">height500</div><div class="height200 keepwithnext">height200 keepwithnext</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assertEquals(2, column1.childNodes.length);
		assertEquals(1, column2.childNodes.length);

		var element = column2.childNodes[0];

		assertClassName('keepwithnext', element);
		assertEquals('-100px', element.style.marginTop);
	},

	testItShouldMoveThenCropATallKeepwithnextElement : function() {

		createCf().flow('<div class="height500">height500</div><div class="height1000 keepwithnext">height1000 keepwithnext</div><div class="height100">height100</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');
		var column3 = target.querySelector('.cf-column-3');

		assertEquals(1, column1.childNodes.length);
		assertEquals(1, column2.childNodes.length);
		assertEquals(1, column3.childNodes.length);

		assertClassName('keepwithnext', column2.childNodes[0]);
		assertEquals('0px', column2.childNodes[0].style.marginTop);

		assertClassName('height100', column3.childNodes[0]);
		assertEquals('0px', column3.childNodes[0].style.marginTop);
	},

	testItShouldCropATallKeepwithnextElement : function() {

		createCf().flow('<div class="height1000 keepwithnext">height1000 keepwithnext</div><div class="height100">height100</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assertEquals(1, column1.childNodes.length);
		assertEquals(1, column2.childNodes.length);

		assertClassName('height100', column2.childNodes[0]);
		assertEquals('0px', column2.childNodes[0].style.marginTop);
	},

	testItShouldMoveAKeepwithnextElementToJoinFollowingPlainTextElement : function() {

		createCf().flow('<div class="height500">height500</div><div class="height100 keepwithnext">height100 keepwithnext</div><div class="height100">height100</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assertEquals(1, column1.childNodes.length);
		assertEquals(2, column2.childNodes.length);

		assertClassName('keepwithnext', column2.childNodes[0]);
		assertEquals('0px', column2.childNodes[0].style.marginTop);
	},

	testItShouldIgnoreKeepwithnextClassOnFinalElement : function() {

		createCf().flow('<div class="height400">height400</div><div class="height100 keepwithnext">height100 keepwithnext</div>');

		var column1 = target.querySelector('.cf-column-1');

		assertEquals(2, column1.childNodes.length);
		assertNull(target.querySelector('.cf-column-2'));
	},

	testItShouldCorrectlyHandleAnElementWithBothKeepwithnextAndNowrapClasses : function() {

		createCf().flow('<div class="height500">height500</div><div class="height200 keepwithnext nowrap">height200 keepwithnext</div><div class="height100">height100</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assertEquals(1, column1.childNodes.length);
		assertEquals(2, column2.childNodes.length);

		assertEquals('0px', column2.childNodes[0].style.marginTop);
	},

	testNowrapShouldNotAffectFollowingColumns : function() {

		createCf().flow('<div class="height500">height500</div><div class="height200 nowrap">height200 nowrap</div><div class="height500">height500</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');
		var column3 = target.querySelector('.cf-column-3');

		assertEquals(1, column1.childNodes.length);
		assertEquals(2, column2.childNodes.length);
		assertEquals(1, column3.childNodes.length);

		assertEquals('-400px', column3.childNodes[0].style.marginTop);
	},

	testKeepwithnextShouldNotAffectFollowingColumns : function() {

		createCf().flow('<div class="height500">height500</div><div class="height100 keepwithnext">height100 keepwithnext</div><div class="height500">height500</div><div class="height500">height500</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');
		var column3 = target.querySelector('.cf-column-3');

		assertEquals(1, column1.childNodes.length);
		assertEquals(2, column2.childNodes.length);
		assertEquals(1, column3.childNodes.length);

		assertEquals('0px', column2.childNodes[0].style.marginTop);
		assertEquals('0px', column3.childNodes[0].style.marginTop);
	},

	testItShouldCorrectlyPositionANowrapFollowingAKeepwithnext : function() {

		createCf().flow('<div class="height400">height400</div><div class="height100 keepwithnext">height100 keepwithnext</div><div class="height200 nowrap">height200 nowrap</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assertEquals(1, column1.childNodes.length);
		assertEquals(2, column2.childNodes.length);
		assertNull(target.querySelector('.cf-column-3'));

		assertClassName('keepwithnext', column2.childNodes[0]);
		assertEquals('0px', column2.childNodes[0].style.marginTop);
	},

	testItShouldObeyKeepwithnextWhenNextElementHasNowrapClassAndOverflows : function() {

		createCf().flow('<div class="height400">height400</div><div class="height100 keepwithnext">height100 keepwithnext</div><div class="height200 nowrap">height200 nowrap</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assertEquals(1, column1.childNodes.length);
		assertEquals(2, column2.childNodes.length);

		var element = column2.childNodes[0];

		assertClassName('keepwithnext', element);
		assertEquals('0px', element.style.marginTop);
	},

	testRegression1ItShouldUpdateColumnHeightAfterAnElementIsCropped : function() {

		createCf().flow('<div class="height700 keepwithnext">700 keepwithnext</div><div class="height300">300</div><div class="height300 ">300 </div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assertEquals(1, column1.childNodes.length);
		assertEquals(2, column2.childNodes.length);
		assertNull(target.querySelector('.cf-column-3'));
	},

	testRegression2MissingLastElement : function() {

		createCf().flow('<div class="height700">700</div><div class="height200 keepwithnext">200 keepwithnext</div><div class="height100">100</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assertEquals(1, column1.childNodes.length);
		assertEquals(3, column2.childNodes.length);
		assertNull(target.querySelector('.cf-column-3'));

		assertClassName('height700', column2.childNodes[0]);
		assertEquals('-600px', column2.childNodes[0].style.marginTop);
	},

	testRegression5LargeSpaceAdded : function() {

		createCf().flow('<div class="height700">700</div><div class="height200 nowrap keepwithnext">200 nowrap keepwithnext</div><div class="height500">500</div>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');
		var column3 = target.querySelector('.cf-column-3');

		assertEquals(1, column1.childNodes.length);
		assertEquals(3, column2.childNodes.length);
		assertEquals(1, column3.childNodes.length);

		assertClassName('height500', column3.childNodes[0]);
		assertEquals('-300px', column3.childNodes[0].style.marginTop);
	},

	testRegression7ItShouldNotGetIntoAnEndlessLoop : function() {

		// With the loop-protection removed, this test should cause an endless loop if the bug is not fixed.

		createCf().flow('<div class="height600  keepwithnext">1: 600  keepwithnext</div><div class="height700">2: 700</div>');

	},

	testRegression10TheLastElementShouldNotBeCropped : function() {

		createCf().flow('<div class="height500 keepwithnext">5: 500 keepwithnext</div><div class="height200 keepwithnext">7: 200 keepwithnext</div>');


		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assertEquals(2, column1.childNodes.length);
		assertEquals(1, column2.childNodes.length);

		assertEquals('-100px', column2.childNodes[0].style.marginTop);
	},

	testRegression10SecondElementShouldBeInColumn2 : function() {

		createCf().flow('<div class="height300 keepwithnext">2: 300 keepwithnext</div><div class="height400 keepwithnext">3: 400 keepwithnext</div><div class="height200">4: 200</div>');


		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assertEquals(1, column1.childNodes.length);
		assertEquals(2, column2.childNodes.length);

		assertClassName('height400', column2.childNodes[0]);
		assertClassName('keepwithnext', column2.childNodes[0]);
		assertEquals('0px', column2.childNodes[0].style.marginTop);
	},

	testRegressionItShouldCorrectlyPlaceSuccessiveFullheightElements : function() {

		createCf().flow('<p class="height600">height600</p><p class="height600">height600</p>');

		var column1 = target.querySelector('.cf-column-1');
		var column2 = target.querySelector('.cf-column-2');

		assertEquals(1, column1.childNodes.length);
		assertEquals(1, column2.childNodes.length);

		assertNull(target.querySelector('.cf-column-3'));
		assertEquals('0px', column2.childNodes[0].style.marginTop);
	},

	testItShouldCorrectlyReportSinglePageCount : function() {

		createCf({
			columnCount : 1
		}).flow('<div class="height300">height300</div>');

		assertEquals(1, cf.pageCount);
	},

	testItShouldCorrectlyReportLargerPageCount : function() {

		createCf({
			columnCount : 1
		}).flow('<div class="height3000">height3000</div>');

		assertEquals(5, cf.pageCount);
	},

	testItShouldAddExplicitWidthAndHeightToTarget : function() {

		createCf().flow('<div class="height300">height300</div>');

		assertEquals('800px', target.style.width);
		assertEquals('800px', window.getComputedStyle(target).getPropertyValue('width'));
		assertEquals('600px', window.getComputedStyle(target).getPropertyValue('height'));
	},

	testItShouldCorrectlyReportLayoutDimensions : function() {

		createCf({
			columnGap   : 20,
			columnCount : 4,
			pagePadding : 50
		}).flow('<div class="height300">height300</div>');

 		var dimesions = cf.layoutDimensions;

 		assertEquals(700, dimesions.pageInnerWidth);
 		assertEquals(600, dimesions.pageInnerHeight);
 		assertEquals(0, dimesions.colDefaultTop);
 		assertEquals(50, dimesions.colDefaultLeft);
 		assertEquals(4, dimesions.columnCount);
 		assertEquals(160, dimesions.columnWidth);
 		assertEquals(20, dimesions.columnGap);
	},



/*
	testItShouldSetExplicitHeightOnImagesWithSpecifiedAspectRatio : function() {

		createCf().flow('<div class="height300">height300</div><img style="width: 200px" data-aspect-ratio="2" src="http://www.google.co.uk/images/srpr/logo3w.png" /><div class="height300">height300</div>');

		var page    = target.querySelector('.cf-page-1');
		var column1 = page.querySelector('.cf-column-1');
		var column2 = page.querySelector('.cf-column-2');
		var img     = column1.querySelector('img');
		var div2    = column2.querySelector('div');

		assertEquals("200px", img.style.width);
		assertEquals("100px", img.style.height);
		assertEquals(200, parseInt(window.getComputedStyle(img).getPropertyValue('width')));
		assertEquals(100, parseInt(window.getComputedStyle(img).getPropertyValue('height')));

		assertEquals('-200px', div2.style.marginTop);
	},
 */


//*/


/*

	testItShouldObeyAllHistoricalKeepwithnextElementsWhichFitInNextColumn : function() {

		createCf().flow('<div class="height100 keepwithnext">1 height100 keepwithnext</div><div class="height100 plaintext">2 height100 plaintext</div><div class="height100 keepwithnext">3 height100 keepwithnext</div><div class="height100 keepwithnext">4 height100 keepwithnext</div><div class="height100 keepwithnext">5 height100 keepwithnext</div><div class="height100 keepwithnext">6 height100 keepwithnext</div><div class="height100 plaintext">7 height100 plaintext</div>');
	},


testItShouldMoveLastInAStringOfKeepwithnextElementIntoNextColumn

testItShouldSplitALongStreamOfKeepwithnextElementsWhenAColumnIsFull

testItShouldObeyAllHistoricalKeepwithnextElementsUntilStartOfColumn





/*

Regression 4 - The two 100 keepwithnext should be in col 1.

<div class="height100 ">100 </div><div class="height100 ">100 </div><div class="height200 nowrap">200 nowrap</div><div class="height100 nowrap keepwithnext">100 nowrap keepwithnext</div><div class="height100 nowrap keepwithnext">100 nowrap keepwithnext</div><div class="height500 keepwithnext">500 keepwithnext</div><div class="height200 ">200 </div><div class="height300 ">300 </div>

*/


// Consider some 'typographical measure' logic - reduce the number of columns per page if the measure is too small (because the font size is too large)
// We should remove any padding on the viewport, and any padding or margin on the articles.
// Run Arrhythmia("body").validateRhythm(); (https://github.com/mattbaker/Arrhythmia) to check vertical rhythm after I've added padding functionality.
// Add 'near-parag-14' or similar class to images, and attempt to get them onto the same page. If an inline image overflows the bottom of a column, there are two options: 1) leave whitespace and place image at top of next col. 2) start the paragraph of text, and place image at top of next col, continuing parag afterwards.
// Allow column-spans for inline images. This is a future feature request.
// Consider a breakafter class, or similar, to always break after this element.
// Shouldn't most tags (img, headings, etc.) be nowrap by default? Perhaps have a default list of tags which are NOT nowrap, and allow it to be overridden.


// */

});
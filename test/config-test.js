/**
 * FTColumnflow Config test suite
 *
 * @copyright The Financial Times Limited [All Rights Reserved]
*/

"use strict";

buster.testCase('Config', {

	setUp : function(done) {
		document.body.innerHTML = '<div id="viewportid"><div id="targetid"></div></div>';
		addStylesheets(['all.css', 'config.css'], done);
	},

	tearDown : function() {
		removeStyleSheets();
		document.body.className = '';
	},

	"InstantiateWithNoParamsThrowsException" : function() {

		assert.exception(function test() {
			new FTColumnflow();
		}, 'FTColumnflowParameterException');
	},

	"ThrowExceptionOnInvalidFirstParam" : function() {

		assert.exception(function test() {
			new FTColumnflow(1, 'test');
		}, 'FTColumnflowParameterException');

		assert.exception(function test() {
			new FTColumnflow(new Array, 'test');
		}, 'FTColumnflowParameterException');

	},

	"ThrowExceptionOnInvalidSecondParam" : function() {

		assert.exception(function test() {
			new FTColumnflow('targetid', 1);
		}, 'FTColumnflowParameterException');

		assert.exception(function test() {
			new FTColumnflow('targetid', new Array);
		}, 'FTColumnflowParameterException');

	},

	"StringTargetMustExist" : function() {

		refute.exception(function test() {
			new FTColumnflow('targetid', 'viewportid');
		});

		assert.exception(function test() {
			new FTColumnflow('missingid', 'viewportid');
		}, 'FTColumnflowSelectorException');

	},

	"StringViewportMustExist" : function() {

		refute.exception(function test() {
			new FTColumnflow('targetid', 'viewportid');
		});

		assert.exception(function test() {
			new FTColumnflow('targetid', 'missingid');
		}, 'FTColumnflowSelectorException');

	},

	"TargetElementAcceptedAsFirstParam" : function() {

		refute.exception(function test() {
			new FTColumnflow(document.getElementById('targetid'), 'viewportid');
		});
	},

	"ViewportElementAcceptedAsSecondParam" : function() {

		refute.exception(function test() {
			new FTColumnflow('targetid', document.getElementById('viewportid'));
		});
	},

	"TargetMustBeAChildOfViewport" : function() {

		refute.exception(function test() {
			new FTColumnflow('targetid', 'viewportid');
		});

		assert.exception(function test() {
			new FTColumnflow('viewportid', 'targetid');
		}, 'FTColumnflowInheritanceException');
	},

	"ShouldUseDefaultValueForColumnCount" : function() {

		var cf = new FTColumnflow('targetid', 'viewportid');

		assert.equals(1, cf.layoutDimensions.columnCount);
	},

	"ShouldUseViewportWidthForColumnWidthByDefault" : function() {

		var cf = new FTColumnflow('targetid', 'viewportid');

		assert.equals(800, cf.layoutDimensions.columnWidth);
	},

	"ShouldUse1emByDefaultForColumnGap" : function() {

		document.body.className = 'columnGaptest';
		var cf = new FTColumnflow('targetid', 'viewportid');

		assert.equals(12, cf.layoutDimensions.columnGap);
	},

	"ShouldThrowExceptionOnInvalidConfigParameter" : function() {

		assert.exception(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'invalid' : 'abc'
			});
		}, 'FTColumnflowParameterException');

	},

	"ShouldThrowExceptionOnInvalidColumnDimensionType" : function() {

		assert.exception(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'columnGap' : 'abc'
			});
		}, 'FTColumnflowColumnDimensionException');

		assert.exception(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'columnCount' : 'abc'
			});
		}, 'FTColumnflowColumnDimensionException');

		assert.exception(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'columnWidth' : 'abc'
			});
		}, 'FTColumnflowColumnDimensionException');
	},

	"ShouldThrowExceptionOnNegativeColumnDimensionValue" : function() {

		assert.exception(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'columnGap' : -20
			});
		}, 'FTColumnflowColumnDimensionException');

		assert.exception(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'columnCount' : -20
			});
		}, 'FTColumnflowColumnDimensionException');

		assert.exception(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'columnWidth' : -20
			});
		}, 'FTColumnflowColumnDimensionException');
	},

	"ShouldRespectSpecifiedColumnGap" : function() {

		document.body.className = 'columnGaptest';
		var cf = new FTColumnflow('targetid', 'viewportid', {
			'columnGap' : 20
		});

		assert.equals(20, cf.layoutDimensions.columnGap);
	},


	// Pseudo-code from http://www.w3.org/TR/css3-multicol/#pseudo-algorithm
	//
	//	if (column-width = auto) and (column-count != auto) then
	//		N := column-count
	//		W := max(0, (available-width - ((N - 1) * column-gap)) / N)
	//	exit
	"ShouldCalculateColumnWidthWhenCountIsSet" : function() {

		var cf = new FTColumnflow('targetid', 'viewportid', {
			'columnGap'   : 25,
			'columnCount' : 5,
		});

		assert.equals(140, cf.layoutDimensions.columnWidth);
	},

	"ShouldUseWholeWidthWhenOnlyOneColumn" : function() {

		var cf = new FTColumnflow('targetid', 'viewportid', {
			'columnCount' : 1,
		});

		assert.equals(800, cf.layoutDimensions.columnWidth);
	},


	//	if (column-width != auto) and (column-count = auto) then
	//		N := max(1, floor((available-width + column-gap) / (column-width + column-gap)))
	//		W := ((available-width + column-gap) / N) - column-gap
	//	exit
	"ShouldUseViewportWidthWhenColumnWidthIsTooLarge" : function() {

		var cf = new FTColumnflow('targetid', 'viewportid', {
			'columnWidth' : 900,
		});

		assert.equals(800, cf.layoutDimensions.columnWidth);
		assert.equals(1, cf.layoutDimensions.columnCount);
	},

	"ShouldUseSpecifiedWidthWhenItFitsExactly" : function() {

		var cf = new FTColumnflow('targetid', 'viewportid', {
			'columnGap'   : 25,
			'columnWidth' : 140,
		});

		assert.equals(5, cf.layoutDimensions.columnCount);
	},

	"ShouldWidenSmallColumnsToFit" : function() {

		var cf = new FTColumnflow('targetid', 'viewportid', {
			'columnGap'   : 25,
			'columnWidth' : 130,
		});

		assert.equals(140, cf.layoutDimensions.columnWidth);
		assert.equals(5, cf.layoutDimensions.columnCount);
	},


	//	if (column-width != auto) and (column-count != auto) then
	//		N := min(column-count, floor((available-width + column-gap) / (column-width + column-gap)))
	//		W := ((available-width + column-gap) / N) - column-gap
	//	exit
	"ShouldReduceCountIfThereIsNoSpace" : function() {

		var cf = new FTColumnflow('targetid', 'viewportid', {
			'columnGap'   : 25,
			'columnWidth' : 140,
			'columnCount' : 6,
		});

		assert.equals(140, cf.layoutDimensions.columnWidth);
		assert.equals(5, cf.layoutDimensions.columnCount);
	},

	"ShouldTreatCountAsMaximumWhenWidthIsAlsoDefined" : function() {

		var cf = new FTColumnflow('targetid', 'viewportid', {
			'columnGap'   : 25,
			'columnWidth' : 140,
			'columnCount' : 3,
		});

		assert.equals(250, cf.layoutDimensions.columnWidth);
		assert.equals(3, cf.layoutDimensions.columnCount);
	},


	"ShouldThrowExceptionOnInvalidClassNames" : function() {

		assert.exception(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'pageClass' : 20
			});
		}, 'FTColumnflowClassnameException');

		assert.exception(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'columnClass' : new Array()
			});
		}, 'FTColumnflowClassnameException');

	},

	"ShouldNormaliseClassNamesAndProvideGetter" : function() {

		var cf = new FTColumnflow('targetid', 'viewportid', {
			'pageClass'   : 'class with spaces',
			'columnClass' : 'class&with*illegal@chars'
		});

		assert.equals('class-with-spaces', cf.pageClass);
		assert.equals('class-with-illegal-chars', cf.columnClass);
	},

	"ShouldThrowAnExceptionOnInvalidPageArrangementValue" : function() {

		assert.exception(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'pageArrangement' : 20
			});
		}, 'FTColumnflowArrangementException');

		assert.exception(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'pageArrangement' : 'invalid'
			});
		}, 'FTColumnflowArrangementException');

		refute.exception(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'pageArrangement' : 'vertical'
			});
		});

		refute.exception(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'pageArrangement' : 'horizontal'
			});
		});
	},

	"ShouldThrowExceptionOnInvalidMarginType" : function() {

		assert.exception(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'pagePadding' : 'invalid'
			});
		}, 'FTColumnflowPaddingException');

		refute.exception(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'pagePadding' : 50
			});
		});
	},

	"ShouldThrowExceptionIfViewportHasNoWidthOrHeight" : function() {

		document.body.innerHTML = '<div id="unstyled-viewportid"><div id="unstyled-targetid"></div></div>';

		assert.exception(function test() {
			new FTColumnflow('unstyled-targetid', 'unstyled-viewportid');
		}, 'FTColumnflowViewportException');
	},

	"ShouldThrowExceptionOnInvalidStandardiseLineHeightType" : function() {

		assert.exception(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'standardiseLineHeight' : 'invalid'
			});
		}, 'FTColumnflowStandardiseLineheightException');

		refute.exception(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'standardiseLineHeight' : true
			});
		});
	},

	"ShouldThrowExceptionOnInvalidMinColumnHeight" : function() {

		assert.exception(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'columnFragmentMinHeight' : 'invalid'
			});
		}, 'FTColumnflowColumnDimensionException');

		refute.exception(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'columnFragmentMinHeight' : 20
			});
		});
	},
//*/

});
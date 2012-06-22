/**
 * FTColumnflow Config test suite
 *
 * @copyright The Financial Times Limited [All Rights Reserved]
*/


TestCase('Config', {

	setUp : function() {
		document.body.innerHTML = '<div id="viewportid"><div id="targetid"></div></div>';
		document.body.className = 'config';
	},

	tearDown : function() {

		var styles = document.getElementsByTagName('style');
		for (var i = 0, len = styles.length; i < len; i++) {
			if (styles[i] && styles[i].nodeType == 1) styles[i].parentNode.removeChild(styles[i]);
		}
	},


	testInstantiateWithNoParamsThrowsException : function() {

		assertException(function test() {
			new FTColumnflow();
		}, 'FTColumnflowParameterException');
	},

	testExceptionThrownOnInvalidFirstParam : function() {

		assertException(function test() {
			new FTColumnflow(1, 'test');
		}, 'FTColumnflowParameterException');

		assertException(function test() {
			new FTColumnflow(new Array, 'test');
		}, 'FTColumnflowParameterException');

	},

	testExceptionThrownOnInvalidSecondParam : function() {

		assertException(function test() {
			new FTColumnflow('targetid', 1);
		}, 'FTColumnflowParameterException');

		assertException(function test() {
			new FTColumnflow('targetid', new Array);
		}, 'FTColumnflowParameterException');

	},

	testStringTargetMustExist : function() {

		assertNoException(function test() {
			new FTColumnflow('targetid', 'viewportid');
		});

		assertException(function test() {
			new FTColumnflow('missingid', 'viewportid');
		}, 'FTColumnflowSelectorException');

	},

	testStringViewportMustExist : function() {

		assertNoException(function test() {
			new FTColumnflow('targetid', 'viewportid');
		});

		assertException(function test() {
			new FTColumnflow('targetid', 'missingid');
		}, 'FTColumnflowSelectorException');

	},

	testTargetElementAcceptedAsFirstParam : function() {

		new FTColumnflow(document.getElementById('targetid'), 'viewportid');
	},

	testViewportElementAcceptedAsSecondParam : function() {

		new FTColumnflow('targetid', document.getElementById('viewportid'));
	},

	testTargetMustBeAChildOfViewport : function() {

		assertNoException(function test() {
			new FTColumnflow('targetid', 'viewportid');
		});

		assertException(function test() {
			new FTColumnflow('viewportid', 'targetid');
		}, 'FTColumnflowInheritanceException');
	},

	testItShouldUseDefaultValueForColumnCount : function() {

		var cf = new FTColumnflow('targetid', 'viewportid');

		assertEquals(1, cf.layoutDimensions.columnCount);
	},

	testItShouldUseViewportWidthForColumnWidthByDefault : function() {

		var cf = new FTColumnflow('targetid', 'viewportid');

		assertEquals(800, cf.layoutDimensions.columnWidth);
	},

	testItShouldUse1emByDefaultForColumnGap : function() {

		document.body.classList.add('columnGaptest');
		var cf = new FTColumnflow('targetid', 'viewportid');

		assertEquals(12, cf.layoutDimensions.columnGap);
	},

	testItShouldThrowExceptionOnInvalidConfigParameter : function() {

		assertException(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'invalid' : 'abc'
			});
		}, 'FTColumnflowParameterException');

	},

	testItShouldThrowExceptionOnInvalidColumnDimensionType : function() {

		assertException(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'columnGap' : 'abc'
			});
		}, 'FTColumnflowColumnDimensionException');

		assertException(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'columnCount' : 'abc'
			});
		}, 'FTColumnflowColumnDimensionException');

		assertException(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'columnWidth' : 'abc'
			});
		}, 'FTColumnflowColumnDimensionException');
	},

	testItShouldThrowExceptionOnNegativeColumnDimensionValue : function() {

		assertException(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'columnGap' : -20
			});
		}, 'FTColumnflowColumnDimensionException');

		assertException(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'columnCount' : -20
			});
		}, 'FTColumnflowColumnDimensionException');

		assertException(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'columnWidth' : -20
			});
		}, 'FTColumnflowColumnDimensionException');
	},

	testItShouldRespectSpecifiedColumnGap : function() {

		document.body.classList.add('columnGaptest');
		var cf = new FTColumnflow('targetid', 'viewportid', {
			'columnGap' : 20
		});

		assertEquals(20, cf.layoutDimensions.columnGap);
	},


	// Pseudo-code from http://www.w3.org/TR/css3-multicol/#pseudo-algorithm
	//
	//	if (column-width = auto) and (column-count != auto) then
	//		N := column-count
	//		W := max(0, (available-width - ((N - 1) * column-gap)) / N)
	//	exit
	testItShouldCalculateColumnWidthWhenCountIsSet : function() {

		var cf = new FTColumnflow('targetid', 'viewportid', {
			'columnGap'   : 25,
			'columnCount' : 5,
		});

		assertEquals(140, cf.layoutDimensions.columnWidth);
	},

	testItShouldUseWholeWidthWhenOnlyOneColumn : function() {

		var cf = new FTColumnflow('targetid', 'viewportid', {
			'columnCount' : 1,
		});

		assertEquals(800, cf.layoutDimensions.columnWidth);
	},


	//	if (column-width != auto) and (column-count = auto) then
	//		N := max(1, floor((available-width + column-gap) / (column-width + column-gap)))
	//		W := ((available-width + column-gap) / N) - column-gap
	//	exit
	testItShouldUseViewportWidthWhenColumnWidthIsTooLarge : function() {

		var cf = new FTColumnflow('targetid', 'viewportid', {
			'columnWidth' : 900,
		});

		assertEquals(800, cf.layoutDimensions.columnWidth);
		assertEquals(1, cf.layoutDimensions.columnCount);
	},

	testItShouldUseSpecifiedWidthWhenItFitsExactly : function() {

		var cf = new FTColumnflow('targetid', 'viewportid', {
			'columnGap'   : 25,
			'columnWidth' : 140,
		});

		assertEquals(5, cf.layoutDimensions.columnCount);
	},

	testItShouldWidenSmallColumnsToFit : function() {

		var cf = new FTColumnflow('targetid', 'viewportid', {
			'columnGap'   : 25,
			'columnWidth' : 130,
		});

		assertEquals(140, cf.layoutDimensions.columnWidth);
		assertEquals(5, cf.layoutDimensions.columnCount);
	},


	//	if (column-width != auto) and (column-count != auto) then
	//		N := min(column-count, floor((available-width + column-gap) / (column-width + column-gap)))
	//		W := ((available-width + column-gap) / N) - column-gap
	//	exit
	testItShouldReduceCountIfThereIsNoSpace : function() {

		var cf = new FTColumnflow('targetid', 'viewportid', {
			'columnGap'   : 25,
			'columnWidth' : 140,
			'columnCount' : 6,
		});

		assertEquals(140, cf.layoutDimensions.columnWidth);
		assertEquals(5, cf.layoutDimensions.columnCount);
	},

	testItShouldTreatCountAsMaximumWhenWidthIsAlsoDefined : function() {

		var cf = new FTColumnflow('targetid', 'viewportid', {
			'columnGap'   : 25,
			'columnWidth' : 140,
			'columnCount' : 3,
		});

		assertEquals(250, cf.layoutDimensions.columnWidth);
		assertEquals(3, cf.layoutDimensions.columnCount);
	},


	testItShouldThrowExceptionOnInvalidClassNames : function() {

		assertException(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'pageClass' : 20
			});
		}, 'FTColumnflowClassnameException');

		assertException(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'columnClass' : new Array()
			});
		}, 'FTColumnflowClassnameException');

	},

	testItShouldNormaliseClassNamesAndProvideGetter : function() {

		var cf = new FTColumnflow('targetid', 'viewportid', {
			'pageClass'   : 'class with spaces',
			'columnClass' : 'class&with*illegal@chars'
		});

		assertEquals('class-with-spaces', cf.pageClass);
		assertEquals('class-with-illegal-chars', cf.columnClass);
	},

	testItShouldThrowAnExceptionOnInvalidPageArrangementValue : function() {

		assertException(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'pageArrangement' : 20
			});
		}, 'FTColumnflowArrangementException');

		assertException(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'pageArrangement' : 'invalid'
			});
		}, 'FTColumnflowArrangementException');

		assertNoException(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'pageArrangement' : 'vertical'
			});
		});

		assertNoException(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'pageArrangement' : 'horizontal'
			});
		});
	},

	testItShouldThrowExceptionOnInvalidMarginType : function() {

		assertException(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'pagePadding' : 'invalid'
			});
		}, 'FTColumnflowPaddingException');

		assertNoException(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'pagePadding' : 50
			});
		});
	},

	testitShouldThrowExceptionIfViewportHasNoWidthOrHeight : function() {

		document.body.innerHTML = '<div id="unstyled-viewportid"><div id="unstyled-targetid"></div></div>';

		assertException(function test() {
			new FTColumnflow('unstyled-targetid', 'unstyled-viewportid');
		}, 'FTColumnflowViewportException');
	},

	testItShouldThrowExceptionOnInvalidStandardiseLineHeightType : function() {

		assertException(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'standardiseLineHeight' : 'invalid'
			});
		}, 'FTColumnflowStandardiseLineheightException');

		assertNoException(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'standardiseLineHeight' : true
			});
		});
	},

	testItShouldThrowExceptionOnInvalidMinColumnHeight : function() {

		assertException(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'columnFragmentMinHeight' : 'invalid'
			});
		}, 'FTColumnflowColumnDimensionException');

		assertNoException(function test() {
			new FTColumnflow('targetid', 'viewportid', {
				'columnFragmentMinHeight' : 20
			});
		});
	},
//*/

});
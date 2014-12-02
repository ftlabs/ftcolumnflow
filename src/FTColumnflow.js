/**
 * @preserve FTColumnflow is a polyfill that fixes the inadequacies of CSS column layouts.
 *
 * It is developed by FT Labs (http://labs.ft.com), part of the Financial Times.
 * It is extensively used in the FT Web App (http://app.ft.com), where it allows us to
 * publish articles with complex newspaper/magazine style layouts, including features such as:
 *		- Configurable column widths, gutters and margins
 *		- Fixed-position elements
 *		- Elements spanning columns
 *		- Keep-with-next to avoid headings at the bottom of a column
 *		- No-wrap class to avoid splitting elements across columns
 *		- Grouping of columns into pages
 *		- Horizontal or vertical alignment of pages
 *		- Standardised line height to align text baseline to a grid
 *		- Rapid reflow as required by events such as device orientation or font-size change
 * It is designed with the same column dimension specification API as the CSS3 multi-column specification
 * (http://www.w3.org/TR/css3-multicol/), but gives far greater flexibility over element positioning within those columns.
 *
 * @copyright The Financial Times Limited [All Rights Reserved]
 * @license MIT License (see LICENCE.txt)
 * @codingstandard ftlabs-jslint
 */

/*jslint browser:true, es5: true*/
/*global Node*/


// UMD from https://gist.github.com/wilsonpage/8598603
;(function(define){define(function(require,exports,module){

	"use strict";


	// Set up FTColumnflowException class
	function FTColumnflowException(name, message) {
		this.name    = 'FTColumnflow' + name || 'FTColumnflowException';
		this.message = message || '';
	}
	FTColumnflowException.prototype   = new Error();
	FTColumnflowException.constructor = FTColumnflowException;



	/* Scope vars */

	var

		layoutDimensionList = [
			'pageInnerWidth',
			'pageInnerHeight',
			'colDefaultTop',
			'colDefaultLeft',
			'columnCount',
			'columnWidth',
			'columnGap'
		],

		defaultConfig = {
			layoutDimensions:         null,
			columnFragmentMinHeight:  0,
			viewportWidth:            null,
			viewportHeight:           null,
			columnWidth:              'auto',
			columnCount:              'auto',
			columnGap:                'normal',
			pageClass:                'cf-page',
			columnClass:              'cf-column',
			pageArrangement:          'horizontal',
			pagePadding:              0,
			debug:                    false,
			showGrid:                 false,
			standardiseLineHeight:    false,
			minFixedPadding:          1,
			lineHeight:               null,
			noWrapOnTags:             [],
			allowReflow:              true
		},

		// CSS Style declarations
		cssStyles = '#[targetId] { position: relative; height: 100%; }\n' +
		'#[targetId] .[preloadAreaClassName].[pageClass] { visibility: hidden; position: absolute; overflow: hidden; }\n' +
		'#[targetId] .[preloadFixedAreaClassName] { visibility: hidden; position: absolute; }\n' +
		'#[targetId] .[pageClass] { position: absolute; width: [viewportWidth]px; height: [viewportHeight]px; [pageArrangement] }\n' +
		'#[targetId] .[columnClass] { position: absolute; width: [columnWidth]px; overflow: hidden; }\n' +
		'#[targetId] .[pageClass] .[fixedElementClassName] { position: absolute; }\n' +
		'#[targetId] .[pageClass] .[columnClass] > :first-child { margin-top: 0px; }\n',

		cssColumnStyles = '#[targetId] .[columnClass].[columnClass]-[columnNum] { left: [leftPos]px; }\n',

		showGridStyles = '#[targetId] .[pageClass] { background-image: -webkit-linear-gradient(skyblue 1px, transparent 1px); background-size: 100% [lh]px; background-origin: content-box; }',


		// Implement outerHTML in browsers which don't support it
		// Adapted from Modernizr's outerHTML polyfill: bit.ly/polyfills
		_outerHTML = (function() {
			var outerHTMLContainer;
			if (typeof document !== "undefined" && !document.documentElement.hasOwnProperty('outerHTML')) {
				outerHTMLContainer = document.createElementNS("http://www.w3.org/1999/xhtml", "_");
				return function _outerHTMLNode(node) {
					var html;
					outerHTMLContainer.appendChild(node.cloneNode(false));
					html = outerHTMLContainer.innerHTML.replace("><", ">" + node.innerHTML + "<");
					outerHTMLContainer.innerHTML = "";
					return html;
				};
			} else {
				return function _outerHTMLNative(node) {
					return node.outerHTML;
				};
			}
		}());



	function FTColumnflow(target, viewport, userConfig) {

		var

			// Instance configuration
			config = {},

			// Debugging
			showGrid,

			// String or DOM node
			flowedContent,
			fixedContent,

			// Dimensions
			colDefaultBottom,
			colMiddle,
			minFixedPadding,
			fixedPadding,

			// DOM elements
			renderArea,
			preloadColumn,
			fixedPreloadArea,
			headElement,
			headerStyles,

			// Class names
			targetIdPrefix            = 'cf-target-',
			renderAreaClassName       = 'cf-render-area',
			preloadAreaClassName      = 'cf-preload',
			preloadFixedAreaClassName = 'cf-preload-fixed',
			fixedElementClassName     = 'cf-fixed',
			nowrapClassName           = 'nowrap',
			keepwithnextClassName     = 'keepwithnext',

			// HTML fragments
			lineHeightTestContents,

			// Collections
			pagedContent = [],
			pagedEndContent = [],

			// Counters
			borderElementIndex,
			indexedPageNum,
			indexedColumnNum,
			indexedColumnFrag,
			topElementOverflow,
			totalColumnHeight,

			// Object references
			workingPage,
			workingColumn,
			workingColumnFrag,

			// Copy of parent scope
			that = this;


		/* Constructor */

		this.target   = target;
		this.viewport = viewport;

		this._checkInstanceArgs();

		_setConfig(userConfig);

		_setLayoutDimensions();



		function _setConfig(userConfig) {
			var i;

			// Reference local config as public property
			that.config = config = {};

			// Copy defaultConfig settings into config
			for (i in defaultConfig) {
				if (defaultConfig.hasOwnProperty(i)) {
					config[i] = defaultConfig[i];
				}
			}

			// Merge userConfig settings into config
			for (i in userConfig) {
				if (userConfig.hasOwnProperty(i)) {
					if (config[i] === undefined) {
						throw new FTColumnflowException('ParameterException', 'Unknown config parameter [' + i + '].');
					}
					config[i] = userConfig[i];
				}
			}

			// Enable showGrid?
			if (config.showGrid !== undefined) showGrid = !!config.showGrid;

			// Check page params
			if ('horizontal' !== config.pageArrangement && 'vertical' !== config.pageArrangement) {
				throw new FTColumnflowException('ArrangementException', config.pageArrangement + ' is not a valid Page Arrangement value.');
			}

			config.pagePadding = parseInt(config.pagePadding, 10);
			if (isNaN(config.pagePadding)) {
				throw new FTColumnflowException('PaddingException', config.pagePadding + ' is not a valid Page Padding value.');
			}

			// Check column dimension specifications are valid
			['columnWidth', 'columnCount', 'columnGap', 'columnFragmentMinHeight'].forEach(function _checkColumnSpecification(type) {

				if (defaultConfig[type] === config[type]) return true;
				config[type] = parseInt(config[type], 10);

				if (isNaN(config[type]) || config[type] < 0) {
					throw new FTColumnflowException('ColumnDimensionException', type + ' must be an positive integer or "' + defaultConfig[type] + '".');
				}
			});

			// Check standardiseLineHeight
			if (typeof config.standardiseLineHeight !== 'boolean') {
				throw new FTColumnflowException('StandardiseLineheightException', 'standardiseLineHeight must be a boolean value.');
			}

			// Check minFixedPadding
			config.minFixedPadding = parseFloat(config.minFixedPadding);
			if (isNaN(config.minFixedPadding)) {
				throw new FTColumnflowException('MinFixedPaddingException', 'minFixedPadding must be a float or integer.');
			}

			// Check viewportWidth, if specified
			if ((config.viewportWidth !== null) && isNaN(config.viewportWidth = parseInt(config.viewportWidth, 10))) {
				throw new FTColumnflowException('ViewportWidthException', 'viewportWidth must be an integer.');
			}

			// Check viewportHeight, if specified
			if ((config.viewportHeight !== null) && isNaN(config.viewportHeight = parseInt(config.viewportHeight, 10))) {
				throw new FTColumnflowException('ViewportHeightException', 'viewportHeight must be an integer.');
			}

			// Check lineHeight, if specified
			if ((config.lineHeight !== null) && isNaN(config.lineHeight = parseInt(config.lineHeight, 10))) {
				throw new FTColumnflowException('LineheightException', 'lineHeight must be an integer.');
			}

			// Check class names are valid
			config.pageClass   = _normaliseClassName('pageClass', config.pageClass);
			config.columnClass = _normaliseClassName('columnClass', config.columnClass);

			// Check noWrapOnTags
			if (!Array.isArray(config.noWrapOnTags)) {
				throw new FTColumnflowException('NoWrapException', 'noWrapOnTags must be an Array.');
			}

			// Ensure tags are lowercase
			config.noWrapOnTags = config.noWrapOnTags.map(function _lowercase(item) {
				return item.toLowerCase();
			});
		}


		function _setLayoutDimensions() {

			var i, l, derivedColumnCount, computedStyle;

			// If the layoutDimensions parameter was passed in
			if (config.layoutDimensions !== null) {

				// Check each one
				for (i = 0, l = layoutDimensionList.length; i < l; i++) {
					if (isNaN(Number(config.layoutDimensions[layoutDimensionList[i]]))) {
						throw new FTColumnflowException('DimensionCacheException', 'Must specify an integer value for ' + layoutDimensionList[i]);
					}
				}

				// Done
				return;
			}

			config.layoutDimensions = {};

			// Determine viewport dimensions if they have not been specified
			if (!config.viewportWidth) {
				computedStyle = window.getComputedStyle(that.viewport);
				config.viewportWidth = parseInt(computedStyle.getPropertyValue('width'), 10);
			}

			if (!config.viewportHeight) {
				if (!computedStyle) computedStyle = window.getComputedStyle(that.viewport);
				config.viewportHeight = parseInt(computedStyle.getPropertyValue('height'), 10);
			}

			if (!config.viewportWidth || !config.viewportHeight) {
				throw new FTColumnflowException('ViewportException', 'Viewport element must have width and height.');
			}

			// Determine column gap - 'normal' defaults to 1em
			if ('normal' === config.columnGap) {
				if (!computedStyle) computedStyle = window.getComputedStyle(that.viewport);
				config.layoutDimensions.columnGap = parseInt(computedStyle.fontSize, 10);
			} else {
				config.layoutDimensions.columnGap = config.columnGap;
			}

			// Determine page dimensions
			if ('horizontal' === config.pageArrangement) {
				config.layoutDimensions.pageInnerWidth  = config.viewportWidth - (2 * config.pagePadding);
				config.layoutDimensions.pageInnerHeight = config.viewportHeight;
				config.layoutDimensions.colDefaultTop   = 0;
				config.layoutDimensions.colDefaultLeft  = config.pagePadding;
			} else {
				config.layoutDimensions.pageInnerWidth  = config.viewportWidth;
				config.layoutDimensions.pageInnerHeight = config.viewportHeight - (2 * config.pagePadding);
				config.layoutDimensions.colDefaultTop   = config.pagePadding;
				config.layoutDimensions.colDefaultLeft  = 0;
			}

			// Determine columns per page and column dimensions.
			// For logic, see pseudo-code at http://www.w3.org/TR/css3-multicol/#pseudo-algorithm
			if ('auto' === config.columnWidth && 'auto' === config.columnCount) {

				// Auto - default to 1 column
				config.layoutDimensions.columnCount = 1;
				config.layoutDimensions.columnWidth = config.layoutDimensions.pageInnerWidth;
			} else if ('auto' === config.columnWidth && 'auto' !== config.columnCount) {

				// Determine column width from specified column count and page width
				config.layoutDimensions.columnCount = config.columnCount;
				config.layoutDimensions.columnWidth = (config.layoutDimensions.pageInnerWidth - ((config.columnCount - 1) * config.layoutDimensions.columnGap)) / config.columnCount;

			// Column width is specified.
			} else {

				// Derive the optimal column count
				// COMPLEX:GC:20120312: Add 1px to the page width to avoid precision errors in the case that the config values
				// result in a column count very near to a whole number
				derivedColumnCount = Math.max(1, Math.floor((config.layoutDimensions.pageInnerWidth + 1 + config.layoutDimensions.columnGap) / (config.columnWidth + config.layoutDimensions.columnGap)));

				if ('auto' === config.columnCount) {

					// Use the derived count
					config.layoutDimensions.columnCount = derivedColumnCount;
					config.layoutDimensions.columnWidth = ((config.layoutDimensions.pageInnerWidth + config.layoutDimensions.columnGap) / config.layoutDimensions.columnCount) - config.layoutDimensions.columnGap;
				} else {

					// Count is specified, but we may be able to fit more
					config.layoutDimensions.columnCount = Math.min(config.columnCount, derivedColumnCount);
					config.layoutDimensions.columnWidth = ((config.layoutDimensions.pageInnerWidth + config.layoutDimensions.columnGap) / config.layoutDimensions.columnCount) - config.layoutDimensions.columnGap;
				}
			}

			config.layoutDimensions.columnHeight = config.lineHeight ? _roundDownToGrid(config.layoutDimensions.pageInnerHeight) : config.layoutDimensions.pageInnerHeight;
		}


		/* Add the necessary CSS to <head> */

		function _writeTargetStyles() {

			var styleContents, columnNum;

			if (!headElement) headElement = document.querySelector('head');

			// Set a random ID on the target
			if (!that.target.id) that.target.id = targetIdPrefix + Math.floor(Math.random() * (9000000000) + 1000000000);

			// Main styles
			styleContents = _replaceStringTokens(cssStyles, {
				targetId:                   that.target.id,
				preloadAreaClassName:       preloadAreaClassName,
				preloadFixedAreaClassName:  preloadFixedAreaClassName,
				fixedElementClassName:      fixedElementClassName,
				pageClass:                  config.pageClass,
				columnClass:                config.columnClass,
				columnWidth:                config.layoutDimensions.columnWidth,
				viewportWidth:              config.viewportWidth,
				viewportHeight:             config.viewportHeight,
				pageArrangement:            ('horizontal' === config.pageArrangement) ? 'top: 0;' : 'left: 0;'
			});

			// Column-specific styles
			for (columnNum = 1; columnNum <= config.layoutDimensions.columnCount; columnNum++) {

				styleContents += _replaceStringTokens(cssColumnStyles, {
					targetId:        that.target.id,
					columnClass:     config.columnClass,
					columnNum:       columnNum,
					leftPos:         config.layoutDimensions.colDefaultLeft + (config.layoutDimensions.columnWidth * (columnNum - 1)) + (config.layoutDimensions.columnGap * (columnNum - 1))
				});
			}

			if (headerStyles) {

				// Remove existing CSS
				while (headerStyles.hasChildNodes()) {
					headerStyles.removeChild(headerStyles.firstChild);
				}

			} else {
				headerStyles = document.createElement('style');
				headerStyles.setAttribute('type', 'text/css');
			}

			headerStyles.appendChild(document.createTextNode(styleContents));
			headElement.appendChild(headerStyles);
		}

		function _createTargetElements() {

			var preloadElement, targetChildren;

			// Create the preload and render areas
			targetChildren   = document.createDocumentFragment();
			preloadElement   = targetChildren.appendChild(document.createElement('div'));
			renderArea       = targetChildren.appendChild(document.createElement('div'));

			// Add the flowed content to the preload area
			if ('string' === typeof flowedContent || !flowedContent) {
				preloadColumn = preloadElement.appendChild(document.createElement('div'));
				if (flowedContent) preloadColumn.innerHTML = flowedContent;
			} else if (flowedContent instanceof HTMLElement) {
				preloadColumn = flowedContent.cloneNode(true);
				preloadElement.appendChild(preloadColumn);
			} else {
				throw new FTColumnflowException('FlowedContentException', 'flowedContent must be a HTML string or a DOM element.');
			}

			// Add the fixed content to the preload area
			if ('string' === typeof fixedContent || !fixedContent) {
				fixedPreloadArea = targetChildren.appendChild(document.createElement('div'));
				if (fixedContent) fixedPreloadArea.innerHTML = fixedContent;
			} else if (fixedContent instanceof HTMLElement) {
				fixedPreloadArea = fixedContent.cloneNode(true);
				targetChildren.appendChild(fixedPreloadArea);
			} else {
				throw new FTColumnflowException('FixedContentException', 'fixedContent must be a HTML string or a DOM element.');
			}

			preloadElement.className   = preloadAreaClassName + ' ' + config.pageClass;
			renderArea.className       = renderAreaClassName;
			preloadColumn.className    = config.columnClass;
			fixedPreloadArea.className = preloadFixedAreaClassName;

			that.target.appendChild(targetChildren);
		}


		/* Determine the baseline grid for the flowed content from the line-height */

		function _findLineHeight() {

			var lineHeights, i, l, node, testNode, testLineHeight;

			// If the grid height is not pre-set, we need to determine it
			if (!config.lineHeight) {

				if (!lineHeightTestContents) {

					// 10 lines of text
					lineHeightTestContents = new Array(10).join('x<br />') + 'x';
				}

				// Here we take the mode (most common) line-height value from the first few
				// elements (maximum 10), and assume that that is our desired baseline grid value
				lineHeights = [];
				for (i = 0, l = Math.min(10, (preloadColumn.childNodes.length)); i < l; i++) {

					node = preloadColumn.childNodes[i];
					if (Node.ELEMENT_NODE !== node.nodeType) continue;

					testLineHeight = parseInt(window.getComputedStyle(node).getPropertyValue('line-height'), 10);

					// We haven't found a pixel lineheight, so it must be 'normal' or 'inherit'. Unless there's
					// a better way of doing this, for now we just create a (similar) element at the end of the
					// column with 10 lines of text, and measure its height
					if (!testLineHeight) {

						testNode = node.cloneNode(false);

						if (node.className) testNode.className = node.className;
						testNode.style.padding = "0px";
						testNode.style.border  = "none";
						testNode.style.height  = "auto";
						testNode.innerHTML     = lineHeightTestContents;

						preloadColumn.appendChild(testNode);
						testLineHeight = testNode.offsetHeight / 10;
						preloadColumn.removeChild(testNode);
					}

					lineHeights.push(testLineHeight);
				}

				if (lineHeights.length < 5) {

					// If we haven't yet build up a large enough sample, add some simple paragraphs
					testNode = document.createElement('p');

					testNode.style.padding = "0px";
					testNode.style.border  = "none";
					testNode.style.height  = "auto";
					testNode.innerHTML     = lineHeightTestContents;

					preloadColumn.appendChild(testNode);
					testLineHeight = testNode.offsetHeight / 10;
					preloadColumn.removeChild(testNode);

					for (i = lineHeights.length; i < 5; i++) lineHeights.push(testLineHeight);
				}

				config.lineHeight = _mode(lineHeights);
			}

			// Now the line-height is known, the column height can be determined
			config.layoutDimensions.columnHeight = config.lineHeight ? _roundDownToGrid(config.layoutDimensions.pageInnerHeight) : config.layoutDimensions.pageInnerHeight;

			// For debugging, show the grid lines with CSS
			if (showGrid) {

				headerStyles.innerHTML += _replaceStringTokens(showGridStyles, {
					targetId:    that.target.id,
					pageClass:   config.pageClass,
					'lh':        config.lineHeight
				});
			}
		}


		function _setFixedElementHeight(element) {

			var computedStyle, indexedColStart, indexedColEnd,
				matches, anchorY, anchorX, colSpan, spanDir;

			// Don't do any manipulation on text nodes, or nodes which are hidden
			if (Node.TEXT_NODE === element.nodeType) return false;

			computedStyle = window.getComputedStyle(element);
			if ('none' === computedStyle.getPropertyValue('display')) return false;

			// Determine the anchor point
			matches = element.className.match(/(\s|^)anchor-(top|middle|bottom)-(left|right|(?:col-(\d+)))(\s|$)/);
			if (matches) {

				anchorY = matches[2];

				if (matches[4]) {

					// A numeric column anchor
					anchorX = Math.max(0, (Math.min(matches[4], config.layoutDimensions.columnCount) - 1));
				} else {

					// Left or right
					anchorX = matches[3];
				}

			} else {
				anchorY = 'top';
				anchorX = 'left';
			}

			// Determine the affected columns
			matches = element.className.match(/(\s|^)col-span-(\d+|all)(-(left|right))?(\s|$)/);
			if (matches) {

				spanDir = matches[4] || 'right';

				if (matches[2] === 'all') {
					colSpan = config.layoutDimensions.columnCount;
				} else {
					colSpan = parseInt(matches[2], 10);
				}

				if ('left' === anchorX) {
					indexedColStart = 0;
					indexedColEnd   = Math.min(colSpan, config.layoutDimensions.columnCount) - 1;
				} else if ('right' === anchorX) {
					indexedColEnd   = config.layoutDimensions.columnCount - 1;
					indexedColStart = config.layoutDimensions.columnCount - Math.min(colSpan, config.layoutDimensions.columnCount);
				} else {
					if ('right' === spanDir) {
						indexedColStart = anchorX;
						indexedColEnd   = Math.min((indexedColStart + colSpan), config.layoutDimensions.columnCount) - 1;
					} else {
						indexedColEnd   = anchorX;
						indexedColStart = Math.max((indexedColEnd - colSpan - 1), 0);
					}
				}
			} else {

				if ('left' === anchorX) {
					indexedColStart = 0;
				} else if ('right' === anchorX) {
					indexedColStart = config.layoutDimensions.columnCount - 1;
				} else {
					indexedColStart = anchorX;
				}

				indexedColEnd = indexedColStart;
			}

			// Set an explicit width to that of the columnspan attribute
			element.style.width = _round(((indexedColEnd - indexedColStart) * (config.layoutDimensions.columnWidth + config.layoutDimensions.columnGap)) + config.layoutDimensions.columnWidth) + 'px';

			return {
				element:          element,
				preComputedStyle: computedStyle,
				indexedColStart:  indexedColStart,
				indexedColEnd:    indexedColEnd,
				anchorY:          anchorY,
				anchorX:          anchorX
			};
		}


		function _addFixedElement(elementDefinition) {

			var element = elementDefinition.element,
				matches, pageNum, workingPage, normalisedElementHeight,
				elementTopPos, elementBottomPos, lowestTopPos, highestBottomPos,
				topSplitPoint, bottomSplitPoint,
				firstColFragment, lastColFragment, newColumnFragment, newFragmentHeight,
				fragment, column, fragNum, fragLen,	columnNum;


			// Determine the page
			if (element.classList.contains('attach-page-last')) {

				// Add to a separate store of elements to be added after all the other content is rendered
				pagedEndContent.push({
					'fixed': [{
						content: _outerHTML(element),
						top:     config.layoutDimensions.colDefaultTop,
						left:    config.layoutDimensions.colDefaultLeft
					}]
				});
				return;

			} else {

				// Look for a numeric page
				matches = element.className.match(/(\s|^)attach-page-(\d+)(\s|$)/);
				if (matches) {
					pageNum = matches[2] - 1;
				} else {
					pageNum = 0;
				}
			}

			// Create any necessary page objects
			_createPageObjects(pageNum);
			workingPage = pagedContent[pageNum];

			// Determine the height of the element, taking into account any vertical shift applied to it using margin-top
			normalisedElementHeight = element.offsetHeight + parseInt(elementDefinition.preComputedStyle.getPropertyValue('margin-top'), 10);

			// Find the most appropriate available space for the element on the page
			switch (elementDefinition.anchorY) {

				case 'top':
					elementTopPos = config.layoutDimensions.colDefaultTop;
					lowestTopPos  = colDefaultBottom - normalisedElementHeight;

					for (columnNum = elementDefinition.indexedColStart; columnNum <= elementDefinition.indexedColEnd; columnNum++) {

						// Find the topmost column fragment
						firstColFragment = workingPage.columns[columnNum].fragments[0];

						if (!firstColFragment) {

							// Column is full, so place element at the bottom
							elementTopPos = lowestTopPos;
						} else {

							// If the fragment starts below the element top position, move the element down
							if (firstColFragment.top > elementTopPos) {
								elementTopPos = (firstColFragment.top > lowestTopPos) ? lowestTopPos : firstColFragment.top;
							}
						}
					}
					elementBottomPos = elementTopPos + normalisedElementHeight;
					topSplitPoint    = elementTopPos - config.lineHeight;
					bottomSplitPoint = _roundUpToGrid(elementBottomPos, true);
					break;

				case 'middle':
					elementTopPos    = colMiddle - (normalisedElementHeight / 2);
					topSplitPoint    = _roundDownToGrid(elementTopPos, true);
					bottomSplitPoint = _roundUpToGrid(elementTopPos + normalisedElementHeight, true);

					if (topSplitPoint < 0) topSplitPoint = 0;
					if (bottomSplitPoint > config.layoutDimensions.columnHeight) bottomSplitPoint = config.layoutDimensions.columnHeight;
					break;

				case 'bottom':
					elementBottomPos = colDefaultBottom;
					highestBottomPos = normalisedElementHeight;

					for (columnNum = elementDefinition.indexedColStart; columnNum <= elementDefinition.indexedColEnd; columnNum++) {

						// Find the bottommost column fragment
						lastColFragment = workingPage.columns[columnNum].fragments[workingPage.columns[columnNum].fragments.length - 1];

						if (!lastColFragment) {

							// Column is full, so place element at the top
							elementBottomPos = highestBottomPos;
						} else {

							// If the fragment ends above the element bottom position, move the element up
							if (lastColFragment.bottom < elementBottomPos) {
								elementBottomPos = (lastColFragment.bottom < highestBottomPos) ? highestBottomPos : lastColFragment.bottom;
							}
						}
					}

					elementTopPos    = elementBottomPos - normalisedElementHeight;
					topSplitPoint    = _roundDownToGrid(elementTopPos, true);
					bottomSplitPoint = elementBottomPos + config.lineHeight;
					break;
			}


			/* Alter dimensions and placing of any affected column fragments. */

			// Loop the columns spanned by the element
			for (columnNum = elementDefinition.indexedColStart; columnNum <= elementDefinition.indexedColEnd; columnNum++) {

				column = workingPage.columns[columnNum];

				// Loop the fragments
				for (fragNum = 0, fragLen = column.fragments.length; fragNum < fragLen; fragNum++) {

					fragment = column.fragments[fragNum];

					// The fragment is entirely overlapped by the fixed element, so delete it and continue the loop
					if (topSplitPoint < fragment.top && bottomSplitPoint > fragment.bottom) {
						column.fragments.splice(fragNum, 1);
						fragLen--;
						continue;
					} else if (topSplitPoint > fragment.bottom || bottomSplitPoint < fragment.top) {

						// The fragment is not disturbed by the element at all
						continue;
					}

					// Determine the height of the new fragment
					newFragmentHeight = fragment.top + fragment.height - bottomSplitPoint;

					// Modify the original column fragment
					fragment.height = topSplitPoint - fragment.top;
					fragment.bottom = fragment.top + fragment.height;


					if (!fragment.height || fragment.height < config.columnFragmentMinHeight) {

						// The fragment is now too small, so delete it and decrement the iteration counter
						column.fragments.splice(fragNum--, 1);
						fragLen--;
					}

					// Only create the new fragment if it has enough height
					if (newFragmentHeight && newFragmentHeight >= config.columnFragmentMinHeight) {

						// Create a new column fragment
						newColumnFragment = _createColumnFragment();

						newColumnFragment.top    = bottomSplitPoint;
						newColumnFragment.height = newFragmentHeight;
						newColumnFragment.bottom = newColumnFragment.top + newColumnFragment.height;

						// Insert it into the collection, and increment the iteration counter
						column.fragments.splice(++fragNum, 0, newColumnFragment);
						fragNum++;
						fragLen++;
					}
				}
			}

			// Save the fixed content string, plus positioning details
			workingPage.fixed.push({
				content: _outerHTML(element),
				top:     elementTopPos,
				left:    (config.layoutDimensions.colDefaultLeft + (('left' === elementDefinition.anchorX) ? 0 : ((config.layoutDimensions.columnWidth + config.layoutDimensions.columnGap) * elementDefinition.indexedColStart)))
			});

		}

		function _normaliseFlowedElement(element) {

			var p;

			if (Node.TEXT_NODE !== element.nodeType) return;

			if (element.nodeValue.match(/^\s*$/)) {

				// A plain text node, containing only white space
				element.parentNode.removeChild(element);

			} else {

				// A plain text node, containing more than just white space.
				// Wrap it in a <p> tag
				p = document.createElement('p');

				p.appendChild(document.createTextNode(element.nodeValue));
				element.parentNode.replaceChild(p, element);
			}
		}


		function _flowContent() {

			var fixedElementDefinitions = [],
				fixedElementDefinition, i, l;

			// Initialise some variables
			pagedContent      = [];
			pagedEndContent   = [];

			indexedPageNum         =
				indexedColumnNum   =
				indexedColumnFrag  =
				borderElementIndex =
				indexedColumnNum   =
				indexedColumnFrag  =
				topElementOverflow =
				totalColumnHeight  = 0;

			// Set the maximum column height to a multiple of the lineHeight
			colDefaultBottom  = config.layoutDimensions.columnHeight + config.layoutDimensions.colDefaultTop;
			colMiddle         = config.layoutDimensions.colDefaultTop + (config.layoutDimensions.columnHeight / 2);
			minFixedPadding   = config.minFixedPadding * config.lineHeight;
			fixedPadding      = _roundUpToGrid(minFixedPadding);

			// Add each fixed element to a page in the correct position,
			// and determine the remaining free space for columns
			// Two loops are run: the first sets an explicit width on the element, therefore invalidating the layout,
			// and the second reads the element's width, forcing a recalculation of styles. This batching avoids layout thrashing.
			for (i = 0, l = fixedPreloadArea.childNodes.length; i < l; i++) {
				fixedElementDefinition = _setFixedElementHeight(fixedPreloadArea.childNodes[i]);
				if (fixedElementDefinition) fixedElementDefinitions.push(fixedElementDefinition);
			}

			for (i = 0, l = fixedElementDefinitions.length; i < l; i++) {
				_addFixedElement(fixedElementDefinitions[i]);
			}

			/* Loop through the preload elements, and determine which column to put them in */

			// Preliminary loop to remove whitespace, and wrap plain text nodes
			for (i = preloadColumn.childNodes.length - 1; i >= 0; i--) {
				_normaliseFlowedElement(preloadColumn.childNodes[i]);
			}

			if (!preloadColumn.childNodes.length) return;

			// Select the first available column for content
			_createPageObjects(indexedPageNum);

			workingPage       = pagedContent[indexedPageNum];
			workingColumn     = workingPage.columns[indexedColumnNum];
			workingColumnFrag = workingColumn.fragments[indexedColumnFrag];

			if (!workingColumnFrag) {
				_advanceWorkingColumnFragment();
			}

			// Start with the free space in the first available column
			totalColumnHeight = workingColumnFrag.height;

			// TODO:GC: Save these measurements, so there's no need to re-measure
			// when we return to an orientation we've already rendered.
			for (i = 0, l = preloadColumn.childNodes.length; i < l; i++) {
				_addFlowedElement(preloadColumn.childNodes[i], i);
			}

			// Wrap one more time, to add everything from borderElementIndex to the the final element
			_wrapColumn(l - 1, false);

			if (!config.allowReflow) {
				if (fixedPreloadArea.parentNode) fixedPreloadArea.parentNode.removeChild(fixedPreloadArea);
				fixedPreloadArea = null;

				if (preloadColumn.parentNode && preloadColumn.parentNode.parentNode) preloadColumn.parentNode.parentNode.removeChild(preloadColumn.parentNode);
				preloadColumn = null;
			}
		}

		function _addFlowedElement(element, index) {

			var originalMargin, existingMargin, nextElementOffset, elementHeight,
				newMargin, largestMargin, overflow, loopCount,

				nextElement = element.nextSibling;

			// Check if it's necessary to sanitize elements to conform to the baseline grid
			if (config.standardiseLineHeight) {

				existingMargin = parseFloat(window.getComputedStyle(element).getPropertyValue('margin-bottom'), 10);

				// If reflowing is enabled, try to read the original margin for the
				// element, in case it was already modified
				if (config.allowReflow) {
					originalMargin = parseFloat(element.getAttribute('data-cf-original-margin'), 10) || null;
					if (null === originalMargin) {
						originalMargin = existingMargin;
						element.setAttribute('data-cf-original-margin', originalMargin);
					} else if (originalMargin !== existingMargin) {

						// Return the element to its original margin
						element.style.marginBottom = originalMargin + 'px';
					}
				} else {
					originalMargin = existingMargin;
				}

				nextElementOffset = _getNextElementOffset(element, nextElement);
				elementHeight     = element.offsetHeight;

				// The next element's top is not aligned to the grid
				if (nextElementOffset % config.lineHeight) {

					// Allow for collapsing margins
					largestMargin = Math.max(existingMargin, nextElement ? parseFloat(window.getComputedStyle(nextElement).getPropertyValue('margin-top'), 10) : 0);
					newMargin     = _roundUpToGrid(elementHeight) - elementHeight + _roundUpToGrid(largestMargin);

					if (newMargin !== existingMargin) {
						element.style.marginBottom = newMargin + 'px';
					}
				}
			}

			element.offsetBottom = element.offsetTop + element.offsetHeight;

			// TODO:GC: Remove this loop-protection check
			loopCount = 0;
			while ((element.offsetBottom >= totalColumnHeight || (nextElement && nextElement.offsetTop >= totalColumnHeight)) && (loopCount++ < 30)) {

				overflow = (element.offsetBottom > totalColumnHeight);
				_wrapColumn(index, overflow);
			}

			// TODO:GC: Remove this loop-protection check
			if (loopCount >= 30) console.error('FTColumnflow: Caught and destroyed a loop when wrapping columns for element', element.outerHTML.substr(0, 200) + '...');
		}

		function _getNextElementOffset(element, nextElement) {
			if (!element.getBoundingClientRect) {
				return nextElement ? (nextElement.offsetTop - element.offsetTop) : element.offsetHeight;
			}
			return nextElement ? nextElement.getBoundingClientRect().top - element.getBoundingClientRect().top : element.getBoundingClientRect().height;
		}

		function _wrapColumn(currentElementIndex, overflow) {

			var nowrap, keepwithnext, prevElementKeepwithnext, firstInColumn, finalColumnElementIndex,
				cropCurrentElement, pushElement, pushFromElementIndex, i, lastElement, element,

				currentElement = preloadColumn.childNodes[currentElementIndex],
				nextElement    = currentElement.nextSibling,
				prevElement    = currentElement.previousSibling;

			// Determine any special classes
			nowrap                  = currentElement.classList.contains(nowrapClassName);
			keepwithnext            = currentElement.classList.contains(keepwithnextClassName);
			prevElementKeepwithnext = (prevElement && prevElement.classList.contains(keepwithnextClassName));

			// Assume nowrap if element's tag is in the noWrapOnTags list
			if (-1 !== config.noWrapOnTags.indexOf(currentElement.tagName.toLowerCase())) {
				nowrap = true;
			}

			// Is this the last element of all?
			if (!nextElement) {
				lastElement = true;
			}

			// Is this the first element of a column?
			if (currentElementIndex === borderElementIndex) {
				firstInColumn = true;
			}

			// Does the element fit if we collapse the bottom margin?
			if (currentElement.offsetBottom === totalColumnHeight) {
				overflow = false;
				if (nextElement) totalColumnHeight = nextElement.offsetTop;
			}

			// Do we need to crop the current element?
			if ((nowrap || (keepwithnext && nextElement)) && overflow && (firstInColumn)) {
				cropCurrentElement = true;
			}

			// Do we need to push the current element to the next column?
			if (!cropCurrentElement && !firstInColumn && ((nowrap && overflow) || (keepwithnext && nextElement))) {
				pushElement = true;
				pushFromElementIndex = currentElementIndex;
			}

			// Do we need to push the previous element to the next column?
			if ((currentElementIndex - 1) > borderElementIndex && prevElementKeepwithnext && overflow && nowrap) {
				pushElement = true;
				pushFromElementIndex = currentElementIndex - 1;
			}

			// Determine the final element in this column
			finalColumnElementIndex = pushElement ? pushFromElementIndex - 1 : currentElementIndex;

			if (finalColumnElementIndex < borderElementIndex) {

				// We've already added all the elements. We're finished.
				return;
			}

			// Set the overflow for the current column to the value determined in the last iteration
			workingColumnFrag.overflow = topElementOverflow;

			// Loop through all elements from the last column border element up to the current element
			for (i = borderElementIndex; i <= finalColumnElementIndex; i++) {

				element = preloadColumn.childNodes[i];

				// Add the content of the element to the column
				workingColumnFrag.elements.push({
					content: _outerHTML(element)
				});
			}

			// Determine the new border element
			if (pushElement) {
				borderElementIndex = pushFromElementIndex;
			} else if (overflow && !cropCurrentElement) {
				borderElementIndex = currentElementIndex;
			} else {
				borderElementIndex = currentElementIndex + 1;
			}

			if (pushElement) {

				// By pushing an element to the next column prematurely, white space has effectively been added to the stream of
				// column elements. Measurements will therefore be wrong unless the total column height is changed to reflect this. Set
				// the column height to be the top of the pushed element.
				totalColumnHeight = preloadColumn.childNodes[pushFromElementIndex].offsetTop;

			} else if (cropCurrentElement && nextElement) {

				// By cropping an element, white space has been removed, so adjust the
				// column height to be equal to the top of the next element.
				totalColumnHeight = nextElement.offsetTop;
			}

			// Set the required negative top margin for the first element in the next column
			if (!overflow || (nowrap || (keepwithnext && nextElement))) {
				topElementOverflow = 0;
			} else {
				topElementOverflow = totalColumnHeight - currentElement.offsetTop;
			}

			// Add the height of the next column
			_advanceWorkingColumnFragment();
			totalColumnHeight += workingColumnFrag.height;
		}


		/* Add the flowed and fixed content to the target, arranged in pages and columns */

		function _renderFlowedContent() {

			var outputHTML = '', indexedPageNum, page_len, pageHTML, page, i, l, element, indexedColumnNum,
				column_len, column, indexedColumnFrag, fragLen, el, fragment;

			for (indexedPageNum = 0, page_len = pagedContent.length; indexedPageNum < page_len; indexedPageNum++) {

				pageHTML = '';
				page     = pagedContent[indexedPageNum];

				// Add any fixed elements for this page
				for (i = 0, l = page.fixed.length; i < l; i++) {

					element = page.fixed[i];
					element.content = _addClass(element.content, fixedElementClassName);
					pageHTML += _addStyleRule(element.content, 'top:' + _round(element.top) + 'px;left:' + _round(element.left) + 'px;');
				}

				// Add flowed content for this page
				// First loop the columns
				for (indexedColumnNum = 0, column_len = page.columns.length; indexedColumnNum < column_len; indexedColumnNum++) {

					column = page.columns[indexedColumnNum];

					// Loop the column fragments
					for (indexedColumnFrag = 0, fragLen = column.fragments.length; indexedColumnFrag < fragLen; indexedColumnFrag++) {

						fragment = column.fragments[indexedColumnFrag];

						// Don't write empty columns to the page
						if (0 === fragment.elements.length) {
							continue;
						}

						// Open a column div
						pageHTML += _openColumn(fragment, indexedColumnNum);

						for (el = 0, l = fragment.elements.length; el < l; el++) {

							element = fragment.elements[el];

							// Set the top margin on the first element of the column
							if (el === 0) {

								// Set a *negative* top margin to shift the element up and hide the content already displayed
								element.content = _addStyleRule(element.content, 'margin-top:' + (-fragment.overflow) + 'px;');
							}

							pageHTML += element.content;
						}

						// Close the column
						pageHTML += '</div>';
					}
				}

				// Don't write empty pages
				if ('' === pageHTML) {
					pagedContent.splice(indexedPageNum, 1);
					indexedPageNum--;
					page_len--;
					continue;
				}

				// Add the page contents to the HTML string
				outputHTML += _openPage(indexedPageNum) + pageHTML + '</div>';
			}

			// Add any end pages
			for (indexedPageNum = 0, page_len = pagedEndContent.length; indexedPageNum < page_len; indexedPageNum++) {
				pageHTML = '';
				page     = pagedEndContent[indexedPageNum];

				for (i = 0, l = page.fixed.length; i < l; i++) {

					element = page.fixed[i];
					element.content = _addClass(element.content, fixedElementClassName);
					pageHTML += _addStyleRule(element.content, 'top:' + _round(element.top) + 'px;left:' + _round(element.left) + 'px;');
				}

				// Add the page contents to the HTML string
				outputHTML += _openPage(pagedContent.length + indexedPageNum) + pageHTML + '</div>';
			}

			renderArea.innerHTML = outputHTML;
			page_len = pagedContent.length + pagedEndContent.length;

			// Set an explicit width on the target - not necessary but will allow adjacent content to flow around the flowed columns normally
			that.target.style.width = (config.viewportWidth * page_len) + 'px';

			// Update the instance page counter
			that.pagedContentCount = page_len;
		}


		/* Private methods */

		function _addClass(element, className) {

			// Modify the opening tag of the element
			return element.replace(/<(\w+)([^>]*)>/, function _addRuleToTag(string, tag, attributes) {

				// If there's not yet a style attribute, add one
				if (!string.match(/class\s*=/)) {
					string = '<' + tag + ' class="" ' + attributes + '>';
				}

				// Add the class name
				string = string.replace(/class=(["'])/, 'class=$1 ' + className + ' ');
				return string;
			});
		}


		function _addStyleRule(element, rule) {

			// Modify the opening tag of the element
			return element.replace(/<(\w+)([^>]*)>/, function _addRuleToTag(string, tag, attributes) {

				// If there's not yet a style attribute, add one
				if (!string.match(/style\s*=/)) {
					string = '<' + tag + ' style="" ' + attributes + '>';
				}

				// Add the style rule
				string = string.replace(/style=(["'])/, 'style=$1 ' + rule);
				return string;
			});
		}


		function _roundDownToGrid(val, addPadding) {
			var resized = val - (val % config.lineHeight);

			// If the difference after rounding down is less than the minimum padding, also subtract one grid line
			if (addPadding && ((val - resized) < minFixedPadding)) {
				resized -= fixedPadding;
			}

			return resized;
		}


		function _roundUpToGrid(val, addPadding) {

			var delta   = val % config.lineHeight,
				resized = (delta ? (val - delta + config.lineHeight) : val);

			// If the difference after rounding up is less than the minimum padding, also add one grid line
			if (addPadding && ((resized - val) < minFixedPadding)) {
				resized += fixedPadding;
			}

			return resized;
		}

		function _round(val) {
			return Math.round(val * 100) / 100;
		}

		function _replaceStringTokens(string, tokens) {
			return string.replace(/\[(\w+)\]/g,
				function _replace(a, b) {
					var r = tokens[b];
					return typeof r === 'string' || typeof r === 'number' ? r : a;
				});
		}


		function _normaliseClassName(type, value) {

			if (typeof value !== 'string') {
				throw new FTColumnflowException('ClassnameException', type + ' must be a string.');
			}

			return value.replace(/[^\w]/g, '-');
		}


		function _createPageObjects(indexedPageNum) {
			var pageNum, indexedColNum;

			for (pageNum = pagedContent.length; pageNum <= indexedPageNum; pageNum++) {

				pagedContent.push({
					'fixed':    [],
					'columns':  []
				});

				for (indexedColNum = 0; indexedColNum < config.layoutDimensions.columnCount; indexedColNum++) {
					pagedContent[pageNum].columns.push({
						fragments: [_createColumnFragment()]
					});
				}
			}
		}


		function _createColumnFragment() {

			return {
				elements:    [],
				overflow:    0,
				height:      config.layoutDimensions.columnHeight,
				top:         config.layoutDimensions.colDefaultTop,
				bottom:      colDefaultBottom
			};
		}


		function _advanceWorkingColumnFragment() {

			// Advance the fragment counter and check for another fragment
			if (!workingColumn.fragments[++indexedColumnFrag]) {
				indexedColumnFrag = 0;

				// Advance the column counter and check for another column
				if (!workingPage.columns[++indexedColumnNum]) {
					indexedColumnNum = 0;

					// Advance the page counter and create another page if necessary
					indexedPageNum++;
					_createPageObjects(indexedPageNum);
				}
			}

			workingPage       = pagedContent[indexedPageNum];
			workingColumn     = workingPage.columns[indexedColumnNum];
			workingColumnFrag = workingColumn.fragments[indexedColumnFrag];

			if (!workingColumnFrag) {
				_advanceWorkingColumnFragment();
			}
		}


		function _openPage(indexedPageNum) {
			var pagePos;

			if ('horizontal' === config.pageArrangement) {
				pagePos = 'left: ' + (indexedPageNum * config.viewportWidth) + 'px;';
			} else {
				pagePos = 'top: ' + (indexedPageNum * config.viewportHeight) + 'px;';
			}

			return '<div class="' + config.pageClass + ' ' + config.pageClass + '-' + (indexedPageNum + 1) + '" style="' + pagePos + '">';
		}


		function _openColumn(column, indexedColumnNum) {
			return '<div class="' + config.columnClass + ' ' + config.columnClass + '-' + (indexedColumnNum + 1) + '" style="height: ' + _round(column.height) + 'px; top: ' + _round(column.top) + 'px;">';
		}


		function _mode(array) {

			var modeMap = {},
				maxEl, maxCount, i, el;

			if (array.length === 0) {
				return null;
			}

			maxEl = array[0];
			maxCount = 1;

			for (i = 0; i < array.length; i++) {
				el = array[i];
				if (modeMap[el] === undefined) {
					modeMap[el] = 1;
				} else {
					modeMap[el]++;
				}
				if (modeMap[el] > maxCount) {
					maxEl = el;
					maxCount = modeMap[el];
				}
			}
			return maxEl;
		}


		/* Public methods */

		this.flow = function(flowed, fixed) {

			flowedContent = flowed;
			fixedContent  = fixed;

			_writeTargetStyles();
			_createTargetElements();

			_findLineHeight();
			_flowContent();
			_renderFlowedContent();
		};

		this.reflow = function(newConfig) {

			if (!config.allowReflow) {
				throw new FTColumnflowException('ReflowException', 'reflow() was called but "allowReflow" config option was false.');
			}

			if (newConfig) {
				_setConfig(newConfig);
			}

			_setLayoutDimensions();
			_writeTargetStyles();

			_findLineHeight();
			_flowContent();
			_renderFlowedContent();
		};

		this.destroy = function() {

			if (headerStyles) {
				headerStyles.parentNode.removeChild(headerStyles);
				headerStyles = null;
			}

			if (that.target) {
				that.target.parentNode.removeChild(that.target);
				that.target = null;
			}
		};
	}

	FTColumnflow.prototype = {
		get layoutDimensions() {
			return this.config.layoutDimensions;
		},
		set layoutDimensions(value) {
			throw new FTColumnflowException('SetterException', 'Setter not defined for layoutDimensions.');
		},
		get pageClass() {
			return this.config.pageClass;
		},
		set pageClass(value) {
			throw new FTColumnflowException('SetterException', 'Setter not defined for pageClass.');
		},
		get columnClass() {
			return this.config.columnClass;
		},
		set columnClass(value) {
			throw new FTColumnflowException('SetterException', 'Setter not defined for columnClass.');
		},
		get pageCount() {
			return this.pagedContentCount;
		},
		set pageCount(value) {
			throw new FTColumnflowException('SetterException', 'Setter not defined for pageCount.');
		},

		_checkInstanceArgs: function () {

			var that = this;

			// Check type of required target and viewport parameters
			['target', 'viewport'].forEach(function _checkArg(name) {

				var arg = that[name];

				switch (typeof arg) {

					case 'string':

						arg = document.getElementById(arg);
						if (!arg) throw new FTColumnflowException('SelectorException', name + ' must be a valid DOM element.');
						break;

					case 'object':
						if (!(arg instanceof HTMLElement)) {
							throw new FTColumnflowException('ParameterException', name + ' must be a string ID or DOM element.');
						}
						break;

					default:
						throw new FTColumnflowException('ParameterException', name + ' must be a string ID or DOM element.');
				}

				that[name] = arg;
			});

			// Check target is a child of viewport
			if (this.viewport.compareDocumentPosition(this.target) < this.viewport.DOCUMENT_POSITION_CONTAINED_BY) {
				throw new FTColumnflowException('InheritanceException', 'Target element must be a child of the viewport.');
			}

			// Ensure we have an empty target
			while (this.target.lastChild) {
				this.target.removeChild(this.target.lastChild);
			}
		}
	};

	module.exports = FTColumnflow;

// Close UMD
});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('FTColumnflow',this));

# FTColumnflow

FTColumnflow is a polyfill that fixes the inadequacies of CSS column layouts.  It is developed by [FT Labs](http://labs.ft.com), part of the Financial Times.  It is extensively used in the [FT Web App](http://app.ft.com), where it allows us to publish articles with complex newspaper/magazine style layouts, including features such as:

* Configurable column widths, gutters and margins
* Fixed-position elements
* Elements spanning columns
* Keep-with-next to avoid headings at the bottom of a column
* No-wrap class to avoid splitting elements across columns
* Grouping of columns into pages
* Horizontal or vertical alignment of pages
* Standardised line height to align text baseline to a grid
* Rapid reflow as required by events such as device orientation or font-size change

It is designed with the same column dimension specification API as the [CSS3 multi-column specification](http://www.w3.org/TR/css3-multicol/) (specify `columnWidth`, `columnCount` and/or  `columnGap`), but gives far greater flexibility over element positioning within those columns.


## Usage

Include FTColumnflow.js in your JavaScript bundle or add it to your HTML page like this:

    <script type='text/javascript' src='/src/FTColumnflow.js'></script>

The script must be loaded prior to instantiating FTColumnflow on any element of the page. FTColumnflow adds pages and columns to the DOM inside a specified `target` element, which must be a child of the `viewport` element. The resulting pages are the same dimensions as the `viewport`, which allows for a scrolling window of multiple `target`s and pages to sit inside it.

FTColumnflow accepts two types of content—`fixed` and `flowed`—which can be specified either as text strings or as DOM nodes from which to copy elements. Fixed elements can be positioned using CSS classes to specify page number, vertical/horizontal anchoring, column span and span direction. Flowed elements will be flowed over columns and pages (created automatically) and can optionally include CSS classes to control wrapping behaviour.

To activate FTColumnflow on an article, create a target element inside a viewport:

	<section id="viewport">
		...
		<article id="article-1"></article>
		...
	</section>

Create a new instance of FTColumnflow, passing either ID names or DOM element references for `target` and `viewport`, along with an object of configuration parameters (all of which are optional):

	var cf = new FTColumnflow('article-1', 'viewport', {
		columnCount: 3,
		standardiseLineHeight: true,
		pagePadding: 30,
	});

or:

	var articleEl  = document.getElementById('article-1');
	var viewportEl = document.getElementById('viewport');

	var cf = new FTColumnflow(articleEl, viewportEl, {
		columnCount: 3,
		standardiseLineHeight: true,
		pagePadding: 30,
	});

To render flowed content, pass either text strings or DOM nodes into the FTColumnflow.flow() method.  For example, if you have the following content, separated into flowed and fixed groups:

	<div id="flowedContent">
		<p>One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</p>
		<p>The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me? " he thought. It wasn't a dream.</p>
		...
	</div>

	<div id="fixedContent">
		<div class="col-span-2">
			<h1>The Metamorphosis</h1>
			<h2>Franz Kafka, 1915</h2>
		</div>
		<figure class="anchor-bottom-col-2">
			<img src="http://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Metamorphosis.jpg/147px-Metamorphosis.jpg" style="width: 147px; height: 239px;" />
		</figure>
	</div>

You could apply FTColumnflow to this content with code such as:

	var flowedContent = document.getElementById('flowedContent'),
		fixedContent  = document.getElementById('fixedContent');

	cf.flow(flowedContent, fixedContent);

Alternatively, you can pass your content into the flow method directly:

	cf.flow(
		'<p>One morning, when Gregor Samsa woke from troubled dreams...',
		'<div class="col-span-2"><h1>The Metamorphosis</h1><h2>Franz Kafka, 1915</h2></div>...'
	);



## Examples

Here are some examples of FTColumnflow in use - feel free to copy the code and use as the basis for your own projects.

* [Native CSS3 columns - useful, but limited](ftcolumnflow/examples/6.html), demonstrating the capability of CSS columns without using FTColumnflow.
* [Basic usage example](ftcolumnflow/examples/1.html)
* [Another layout](ftcolumnflow/examples/5.html)
* [FTColumnflow elements highlighted](ftcolumnflow/examples/2.html), which shows the derived baseline grid, the pages and columns, and also exposes the mechanism by which FTColumnflow overflows columns with content, then hides the overflow.
* [Vertically-orientated pages](ftcolumnflow/examples/3.html)
* [noWrap class and noWrapOnTags config setting](ftcolumnflow/examples/4.html)

## Configuration

Configuration options can be specified at create-time by passing a JSON object as the third argument to the `FTColumnflow` constructor. All parameters are optional; any which are specified will override default values.

Column dimension configuration is designed to be as close as possible to the [CSS3 multi-column specification](http://www.w3.org/TR/css3-multicol/), using the same logic to determine `columnWidth`, `columnCount` and  `columnGap`.

*	`pageClass: 'mypageclass',`

	Class name to add to each page created by FTColumnflow. Class names are normalised (invalid characters are replaced with a `-`). *(String, default 'cf-page')*

*	`columnClass: 'mycolumnclass',`

	Class name to add to each column created by FTColumnflow. Class names are normalised (invalid characters are replaced with a `-`). *(String, default 'cf-column')*

*	`viewportWidth: 800,`

	Viewport width in pixels if known, otherwise it will be measured.  Note this is not the browser viewport, but refers to a DOM element passed to the FTColumnflow constructor.  See Public interface for details.  *(Integer, default null)*

*	`viewportHeight: 600,`

	Viewport height in pixels if known, otherwise it will be measured.  Note this is not the browser viewport, but refers to a DOM element passed to the FTColumnflow constructor.  See Public interface for details. *(Integer, default null)*

*	`layoutDimensionsCache: {...},`

	Pass in cached values from a previous invocation of FTColumnflow with exactly the same configuration parameters and viewport dimensions. These can be obtained from a previous flow using `cf.layoutDimensions();` *(Object, default null)*

*	`pageArrangement: 'horizontal',`

	Pages are absolutely positioned with respect to the target parent container. This parameter determines their arrangement. *('horizontal'|'vertical', default 'horizontal')*

*	`pagePadding: 10,`

	Padding in pixels to add to each page (resulting `page + padding` will equal the viewport dimensions). For horizontal arrangement, padding is added to left/right only, and for vertical to the top/bottom only. *(Integer, default 0)*

*	`columnFragmentMinHeight: 20,`

	Minimum height of each column 'fragment', in pixels. If fixed-position elements result in shortened, fragmented columns, no blocks of text will be shorter than this value. *(Integer, default 0)*

*	`columnWidth: 200,`

	Optimal column width in pixels, or 'auto'. Integer must be greater than 0. The actual columns may be wider (to fill the available space) or narrower if the specified columnWidth is greater than the available width. A value of auto will result in a column width determined by using the other properties (columnCount and columnGap). *(Integer|'auto', default 'auto')*

*	`columnCount: 3,`

	Optimal number of columns per page, or 'auto'. Integer must be greater than 0. If both columnWidth and columnCount are defined, columnCount is the *maximum* number of columns per page. A value of auto will result in a column count determined by using the other properties (columnWidth and columnGap). *(Integer|'auto', default 'auto')*

*	`columnGap: 20,`

	Column gap in pixels, or 'normal'. Integer must be greater than 0. The default value, 'normal', is set to 1em. *(Integer|'auto', default 'normal')*

*	`standardiseLineHeight: true,`

	If false, FTColumnflow assumes all column content is corrected/padded to conform to a baseline grid (for example, paragraph margins should be a multiple of their line-height value), and determines the grid height from the lineheight of a paragraph. If true, FTColumnflow uses the mode of the first few line-heights found, and adds padding to all other element to conform to the grid. *(Boolean, default false)*

*	`lineHeight: 20`

	Specify the line-height of the flowed content. If not set, it will be determined by analysing the content. *(Integer, default null)*

*	`minFixedPadding: 0.5,`

	Minimum space between fixed elements and columns, expressed as a multiple of the grid height. *(Float, default 1)*

*	`noWrapOnTags: ['figure', 'h3', ...],`

	Assume a 'nowrap' class for every element which matches the list of tags. *(Array, default [])*

*	`showGrid: true */,`

	Show the baseline grid - very useful for debugging line-height issues. *(Boolean, default false)*

*	`debug: true */,`

	Print internal calls to _log() to the console (Useful for development, not used in this release). *(Boolean, default false)*


## Public interface

### Constructor

*	`var cf = new FTColumnflow(target, viewport, {...});`

	Instantiate an FTColumnflow instance, which will operate on `target` within `viewport`.

	* `target`

		DOM element, or element ID attribute, into which FTColumnflow should write pages and columns. This should be an empty container; all contents will be overwritten.

	* `viewport`

		DOM element, or element ID attribute, for the viewport from which to determine page and column dimensions.

	* `config`

		Object of key/value configuration pairs (see **Configuration** above).

	When FTColumnflow is instntiated on an element, the return value from the constructor is an object that offers a number of public properties, methods and events.

### Methods

*	`flow(flowed, fixed);`

	Flow `flowed` content over columns and pages, and position `fixed` content according to style rules on the elements.

	* `flowed`

		DOM element containing content to flow, or an HTML string of elements. Flowed elements may optionally specify CSS classes to control wrapping behaviour:

		* `nowrap`

			This element must not span a column break (eg. an image, header, etc.).

		* `keepwithnext`

			Avoid a column or page break after this element; prefer a break before if necessary

	* `fixed`

		DOM element containing content to position absolutely, or an HTML string of elements. Fixed elements are anchored in the order they appear in the DOM, so the second item to be anchored top-left will appear underneath the first (with a margin equal to one grid height). Elements should be given CSS classes to specify their position on the page:

		* `anchor-<vertical-pos>-<horizontal-pos>` OR `anchor-<vertical-pos>-col-<n>`

			Page position to which fixed element should be anchored. (Default `anchor-top-left`).

			* *vertical-pos*   : [top, middle, bottom]
			* *horizontal-pos* : [left, right]
			* *n*              : integer

		* `col-span-<n|all>[-<left>|-<right>]`

			Fixed element should span `n` columns (or all columns), optionally specifying a direction in which to span. (Default: col-span-1, default span direction: right).

		* `attach-page-<n>`

			Fixed element should appear on page `n`. (Default: attach-page-1).

*	`reflow({});`

		Re-flow the same content using different configuration parameters. This is useful when a hand-held device is rotated (orientationchange event), or font-sized is changed on the page, for example.

		* `config` 		- Object of key/value configuration pairs (see **Configuration** above).

*	`destroy();`

	Destroy the FTColumnflow DOM nodes, and free up memory.

### Properties

All public properties are read-only.

*	`pageClass`

	The normalised class name added to pages (see pageClass in **Configuration** above).

*	`columnClass`

	The normalised class name added to columns (see columnClass in **Configuration** above).

*	`pageCount`

	The number of pages created by the last run of `cf.flow()`

*	`layoutDimensions`

	The dimensions configuration object produced by the last run of `cf.flow()`. This can be cached externally, and fed back into FTColumnflow using the `layoutDimensionsCache` config parameter (see **Configuration** above) to reduce calculations and DOM reads on subsequent flows.

	Example output:

		{
			"pageInnerWidth":  740,
			"pageInnerHeight": 600,
			"colDefaultTop":   0,
			"colDefaultLeft":  30,
			"columnCount":     3,
			"columnWidth":     236,
			"columnGap":       16
		}

## Compatibility

FTColumnflow supports the following browsers:

* Google Chrome (18+)
* Apple Safari (5+)
* Firefox (10+)
* Mobile Safari (iOS 5+)
* Android browser (ICS+)
* Blackberry browser (PlaybookOS 2.0.1+)
* Microsoft Internet Explorer (10+)

## Testing

FTColumnflow is a fully Test-Driven codebase. Modifcations to the code should have an accompanying test case added to verify the new feature, or confirm the regression or bug is fixed.

FTColumnflow uses [JsTestDriver](http://code.google.com/p/js-test-driver) as a TDD framework. This requires a Java application to be run, which provides a server to which real browsers can be attached. There is a [Ruby wrapper](http://cjohansen.no/en/javascript/jstdutil_a_ruby_wrapper_over_jstestdriver) over JsTestDriver, which provides a slightly better interface.

### Usage

*	Change to FTColumnflow directory:

	`$ cd [FTColumnflow root directory]`
*	Start test suite server:

	`$ java -jar JsTestDriver.jar --port 4224`
*	Visit [http://localhost:4224](http://localhost:4224) in any number of browsers, and capture them to run tests in that browser.

*	OR, run the server with the path to the browser binary already set:

	`$ jstestdriver --port 4224 --browser "/Applications/Safari.app/Contents/MacOS/Safari"`
*	Run tests in a new shell (passing the correct path to your `JsTestDriver.jar` file):

	`$ java -jar JsTestDriver.jar --tests all --captureConsole`

### Or, with the Ruby wrapper:

*	Change to FTColumnflow directory:

	`$ cd [FTColumnflow root directory]`
*	Start test suite server:

	`$ jstestdriver --port 4224`
*	Visit [http://localhost:4224](http://localhost:4224) in any number of browsers, and capture them to run tests in that browser.

*	Run tests in a new shell (passing the correct path to your `JsTestDriver.jar` file):

	`$ jstestdriver --tests all --captureConsole`

Substitute `--tests Config` or `--tests Config,ColumnWrap` for `--tests all` to run a subset of tests


## Credits and collaboration

The lead developer of FTColumnflow is George Crawford at FT Labs.  All open source code released by FT Labs is licenced under the MIT licence.  We welcome comments, feedback and suggestions.  Please feel free to raise an issue or pull request.  Enjoy.











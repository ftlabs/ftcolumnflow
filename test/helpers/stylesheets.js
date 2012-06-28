function addStylesheets(urls, callback) {

	var url = urls.shift(),

	    _loaded = function(success, element) {
			if (success) {
				if ((url = urls.shift())) {
					loadStyleSheet(url, _loaded);
				} else {
					callback();
				}
			} else {
				console.error('Failed to load stylesheet', url, arguments);
			}
		}

	loadStyleSheet(url, _loaded);
}


function removeStyleSheets() {
	var styles = document.getElementsByTagName('style');
	for (var i = 0, len = styles.length; i < len; i++) {
		if (styles[i] && styles[i].nodeType == 1) styles[i].parentNode.removeChild(styles[i]);
	}
}






/* http://thudjs.tumblr.com/post/637855087/stylesheet-onload-or-lack-thereof */

( function( GLOBAL, WIN ) {
	var ERROR_TIMEOUT = 15000, // How long to wait (in milliseconds) before realising the style sheet has failed to load
		HEAD = WIN.document.getElementsByTagName( 'head' )[0], // a reference to the document.head for inserting link nodes into
		ID_PREFIX = 'stylesheet-',
		READYSTATE_INTERVAL = 10, // How often to check (in milliseconds) whether the style sheet has loaded successfully
		callbacks = {}, count = 0, cssRules, loaded = {}, queue = {}, sheet;

	function loadStyleSheet( path, fn, scope ) {
		addCallback( path, fn, scope ); // add the callback for this stylesheet
		if ( queue[path] ) return GLOBAL; // if the style sheet is already queued the we just need to wait
		if ( loaded[path] && inDoc( loaded[path].id ) ) { // if the style sheet is already in the document then just fire the last callback that was added
			fireStyleSheetLoaded( path, true, loaded[path] );
			return GLOBAL;
		}

		var el = createStyleSheet( path ), id,
			interval_id = setTimeout( partial( onError, path ), ERROR_TIMEOUT ), // start counting down to FAIL!
			timeout_id  = setInterval( partial( checkStyleSheetLoaded, path ), READYSTATE_INTERVAL ); // start checking if the style sheet is loaded

		queue[path] = { el : el, interval : interval_id, path : path, timeout : timeout_id }; // add the style sheet to the queue of loading style sheets

		if ( 'onload' in el ) el.onload = partial( _handleOnLoad, path );
		if ( 'onreadystatechange' in el ) el.onreadystatechange = partial( _handleReadyState, path );

		id = setTimeout( function() { // pop out of current stack to prevent browser lock
			clearTimeout( id ); id = null;
			HEAD.appendChild( el ); // insert the link node into the DOM, this will actually start the browser trying to load the style sheet
		}, 1 );

		return GLOBAL;
	}

	function _handleOnLoad( path ) {
		var o = queue[path];
		return this[sheet][cssRules].length ? onLoad( o ) : onError( path );
	}

	function _handleReadyState( path ) {
		if ( this.readyState == 'complete' || this.readyState == 'loaded' ) _handleOnLoad.call( this, path );
	}

	function addCallback( path, fn, scope ) {
		if ( !isFunc( fn ) ) return;
		callbacks[path] || ( callbacks[path] = [] ); // create a callback array for this path if one doesn't exist already
		callbacks[path].push( { fn : fn, scope : scope } ); // add the callback function and (optional) scope to the array
	}

	function checkStyleSheetLoaded( path ) { // checking to see if the stylesheet is loaded
		var o = queue[path], el;
		if ( !o ) return false; // fixes an issue with MSIE that calls this again after the style sheet has been removed from the queue
		el = o.el;
		try { el[sheet] && el[sheet][cssRules].length && onLoad( o ); } // this is where we check that the stylesheet has loaded successfully and if so fire the onLoad function
		catch( e ) { return false; }
	}

	function clear( o ) { // when the style sheet has loaded or has failed to load we want to:
		delete queue[o.path];        // delete it from the queue of loading style sheets
		clearInterval( o.interval ); // stop checking it has loaded
		clearTimeout( o.timeout );   // clear the fail timeout (for efficiency)
		var el = o.el;
		if ( 'onload' in el ) el.onload = null;
		if ( 'onreadystatechange' in el ) el.onreadystatechange = null;
	}

	function createStyleSheet( path ) { // pretty self explanatory
		var el = document.createElement( 'link' );
		el.id = ID_PREFIX + ( ++count );
		el.setAttribute( 'href', path );
		el.setAttribute( 'rel', 'stylesheet' );
		el.setAttribute( 'type', 'text/css' );

		if ( !sheet ) { // only assign these once
			cssRules = 'cssRules'; sheet = 'sheet';
			if ( !( sheet in el ) ) { // MSIE uses non-standard property names
				cssRules = 'rules';
				sheet = 'styleSheet';
			}
		}

		return el;
	}

	function fireStyleSheetLoaded( path, success, el ) {
		var cbs = callbacks[path], o;
		if ( !cbs ) return;
//  we shift all the callbacks off to clear the callbacks queue for this specific style sheet to prevent them been called again
		while ( o = cbs.shift() ) fireCallback( o.fn, o.scope, success, el );
	}

	function fireCallback( fn, scope, success, el ) { fn.call( scope || WIN, success, el ); }

	function inDoc( id ) { return !!WIN.document.getElementById( id ); } // checks whether a style sheet is still in the document, if not we can load it again

	function isFunc( fn ) { return typeof fn == 'function'; }

	function onError( path ) {
		var o = queue[path], el = o.el;
		clear( o );
		HEAD.removeChild( el ); // since the style sheet failed to load, let's remove it from the DOM
		fireStyleSheetLoaded( path, false, el );
	}

	function onLoad( o ) {
		var el = o.el, path = o.path;
		clear( o );
		loaded[path] = el;
		fireStyleSheetLoaded( path, true , el );
	}

	function partial() {
		var slice = Array.prototype.slice,
			args = slice.call( arguments ),
			fn = args.shift();
		return !args.length ? fn : function() {
			return fn.apply( this, args.concat( slice.call( arguments ) ) );
		}
	}

	GLOBAL.loadStyleSheet = loadStyleSheet;

} )( this /* <- a reference to your global namespace object, will assign the loadStyleSheet method there.
			    e.g. pass your "$" object to be able to call $.loadStyleSheet();
			    alternatively, leave as "this" to use as window.loadStyleSheet(); */,
     this /* <- a reference to the current window object */ );




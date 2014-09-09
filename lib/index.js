/**
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 */

'use strict';

var path = require( 'path' );

module.exports = {
	name: 'bender-framework-mocha',
	files: [
		path.join( require.resolve( 'mocha' ), '../mocha.js' ),
		path.join( __dirname, '/adapter.js' )
	]
};

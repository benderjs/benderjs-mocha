/**
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 */

( function( mocha, bender ) {
	'use strict';

	var duration = 0,
		passed = 0,
		failed = 0,
		errors = 0,
		ignored = 0,
		total = 0,
		config;

	// handle runner's event and pass the results to Bender
	function benderReporter( runner ) {
		// runner events:
		// - start
		// - end
		// - suite
		// - suite end
		// - test
		// - test end
		// - pass
		// - fail

		function buildError( errors ) {
			var pattern = /\n.*mocha.js.*/gi,
				errorMessage = [],
				error,
				i;

			for ( i = 0; i < errors.length; i++ ) {
				error = errors[ i ];

				if ( !error.stack ) {
					continue;
				}

				if ( error.stack.indexOf( error.message ) === -1 ) {
					errorMessage.push( error.message );
				}

				errorMessage.push( error.stack.replace( pattern, '' ) );
			}

			return errorMessage.join( '\n' );
		}

		runner.on( 'test', function( test ) {
			test.errors = [];
		} );

		runner.on( 'fail', function( test, error ) {
			// test is done so we can publish the result
			if ( test.sent ) {
				var result = {};

				result.module = test.parent.title || '';
				result.name = test.title;
				result.fullName = ( test.parent.title || bender.testData.id ) + ' ' + test.title;
				result.success = false;
				result.error = buildError( [ error ] );
				result.errors = 1;

				bender.result( result );
				// an error occured in one of the hooks - throw it immediately
			} else if ( test.type === 'hook' ) {
				throw error;
				// add it to the test's error stack
			} else {
				test.errors.push( error );
			}
			errors++;
		} );

		runner.on( 'test end', function( test ) {
			var result = {};

			duration += test.duration || 0;

			result.module = test.parent.title || '';
			result.name = test.title;
			result.fullName = ( test.parent.title || bender.testData.id ) + ' ' + test.title;
			result.success = true;
			result.duration = test.duration;

			if ( test.state === 'passed' ) {
				passed++;
			} else if ( test.pending ) {
				result.ignored = true;
				ignored++;
			} else {
				result.success = false;
				result.error = buildError( test.errors );
				result.errors = errors;
				failed++;
			}

			bender.result( result );
			test.sent = true;
		} );

		runner.on( 'end', function() {
			bender.next( {
				duration: duration,
				passed: passed,
				failed: failed,
				errors: errors,
				ignored: ignored,
				total: total,
				coverage: window.__coverage__
			} );
		} );
	}

	// checks if the test is a regression
	function isRegression( title ) {
		var condition;

		return bender.regressions &&
			( condition = bender.regressions[ bender.testData.id + '#' + title ] ) &&
			eval( condition );
	}

	// filter tests to run a single one
	function setupFilter() {
		if ( window.location.hash && window.location.hash !== '#child' ) {
			return decodeURIComponent( window.location.hash.substr( 1 ) );
		}
	}

	// build a configuration for Mocha
	function buildConfig() {
		var defaultConfig = {
				reporter: benderReporter,
				ui: 'bdd',
				globals: [ '__cov*' ],
				grep: setupFilter()
			},
			config;

		if ( bender.config && ( config = bender.config.mocha ) ) {
			Object.keys( config ).forEach( function( name ) {
				// don't override the reporter
				if ( name === 'reporter' ) {
					return;
				}

				// extend default globals list
				if ( name === 'globals' ) {
					defaultConfig.globals = defaultConfig.globals.concat( config.globals );
					return;
				}

				defaultConfig[ name ] = config[ name ];
			} );
		}

		return defaultConfig;
	}

	config = buildConfig();

	// setup mocha
	mocha.setup( config );

	// override "it" to allow regression handling
	if ( config.ui === 'bdd' ) {
		var oldIt = window.it;

		window.it = function( title, fn ) {
			oldIt( title, isRegression( title ) ? null : fn );
		};

		window.it.skip = oldIt.skip;
	}

	// override "test" to allow regression handling
	if ( config.ui === 'tdd' || config.ui === 'qunit' ) {
		var oldTest = window.test;

		window.test = function( title, fn ) {
			oldTest( title, isRegression( title ) ? null : fn );
		};

		window.test.skip = oldTest.skip;
	}

	bender.start = function() {
		mocha.run();
	};

	bender.stopRunner = function() {
		// TODO see if this can be implemented?
	};

} )( window.mocha || {}, bender );

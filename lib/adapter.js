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
		total = 0;

	function benderReporter( runner ) {
		// runner events
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
				error = [],
				exp,
				i;

			for ( i = 0; i < errors.length; i++ ) {
				exp = errors[ i ];

				if ( exp.stack.indexOf( exp.message ) === -1 ) {
					error.push( exp.message );
				}

				error.push(
					exp.stack
					.replace( pattern, '' )
				);
			}

			return error.join( '\n' );
		}

		runner.on( 'test', function( test ) {
			test.errors = [];
		} );

		runner.on( 'fail', function( test, error ) {
			test.errors.push( error );
			errors++;
		} );

		runner.on( 'test end', function( test ) {
			var result = {};

			duration += test.duration || 0;

			result.module = test.parent.title || '';
			result.name = test.title;
			result.fullName = ( test.parent.title || bender.testData.id ) + ' - ' + test.title;
			result.success = true;
			result.duration = test.duration;

			if ( test.state === 'passed' ) {
				passed++;
			} else if ( test.pending ) {
				result.ignored = true;
				ignored++;
			} else {
				result.success = false;
				result.error = buildError( test.errors ); // TODO
				result.errors = errors;
				failed++;
			}

			bender.result( result );
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

	function setupFilter() {
		// TODO handle regressions

		if ( window.location.hash && window.location.hash !== '#child' ) {
			return decodeURIComponent( window.location.hash.substr( 1 ) );
		}
	}

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

	// setup mocha
	mocha.setup( buildConfig() );

	bender.start = function() {
		mocha.run();
	};

	bender.stopRunner = function() {
		// TODO see if this can be implemented?
	};

} )( window.mocha || {}, bender );

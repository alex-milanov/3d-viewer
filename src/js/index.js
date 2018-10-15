'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;

// iblokz
const vdom = require('iblokz-snabbdom-helpers');
const {obj, arr} = require('iblokz-data');

// app
const app = require('./util/app');
let actions = app.adapt(require('./actions'));
let ui = require('./ui');
let actions$;
const state$ = new Rx.BehaviorSubject();

// services
let render3d = require('./services/render3d.js');
let viewport = require('./services/viewport.js');

// hot reloading
if (module.hot) {
	// actions
	actions$ = $.fromEventPattern(
    h => module.hot.accept("./actions", h)
	).flatMap(() => {
		actions = app.adapt(require('./actions'));
		return actions.stream.startWith(state => state);
	}).merge(actions.stream);
	// ui
	module.hot.accept("./ui", function() {
		ui = require('./ui');
		actions.stream.onNext(state => state);
	});
	// services
	module.hot.accept("./services/render3d.js", function() {
		console.log(render3d.unhook);
		render3d.unhook();
		render3d = require('./services/render3d.js');
		render3d.hook({state$, actions});
		actions.stream.onNext(state => state);
	});
	module.hot.accept("./services/viewport.js", function() {
		viewport.unhook();
		setTimeout(() => {
			viewport = require('./services/viewport.js');
			viewport.hook({state$, actions});
			actions.stream.onNext(state => state);
		});
	});
} else {
	actions$ = actions.stream;
}

// actions -> state
actions$
	.map(action => (
		// action.path && console.log(action.path.join('.'), action.payload),
		// console.log(action),
		action
	))
	.startWith(() => actions.initial)
	.scan((state, change) => change(state), {})
	.subscribe(state => state$.onNext(state));

// logging
state$
	.map(state => obj.filter(state, key => key !== 'viewport'))
	.distinctUntilChanged(state => state)
	.subscribe(state => console.log(state));

// services
render3d.hook({state$, actions});
viewport.hook({state$, actions});

// state -> ui
const ui$ = state$.map(state => ui({state, actions}));
vdom.patchStream(ui$, '#ui');

// livereload impl.
if (module.hot) {
	document.write(`<script src="http://${(location.host || 'localhost').split(':')[0]}` +
	`:35729/livereload.js?snipver=1"></script>`);
}

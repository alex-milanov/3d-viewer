'use strict';
// lib
const Rx = require('rx');
const $ = Rx.Observable;

const time = require('../util/time.js');

const degreeToRadiant = deg => Math.PI / (180 / deg);
const calcucalateAngle = (viewport, range) => ({
	x: (viewport.mouse.x / viewport.screen.width * range.h) + range.hOffset,
	y: (viewport.mouse.y / viewport.screen.height * range.v) + range.vOffset
});

let unhook = () => {};
const hook = ({state$, actions}) => {
	let subs = [];

	unhook = () => subs.forEach(sub => sub.dispose());
};

module.exports = {
	hook,
	unhook: () => unhook()
};

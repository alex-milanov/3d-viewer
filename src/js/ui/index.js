'use strict';

// dom
const {
	h1, a, div,
	section, button, span,
	canvas, header, footer
} = require('iblokz-snabbdom-helpers');
// components
const controls = require('./controls');

module.exports = ({state, actions}) => section('#ui', [
	header(
		h1('3D Viewer')
	),
	section('#view3d[width="800"][height="600"]'),
	footer([
		a(`[href="https://www.blendswap.com/blends/view/73454"][target="_blank"]`, 'Office Chair'),
		span(' by '),
		a(`[href="https://www.blendswap.com/user/MLDP"][target="_blank"]`, 'MLDP'),
		span(' | '),
		a(`[href="https://www.blendswap.com/blends/view/46902"][target="_blank"]`, 'Plant'),
		span(' by '),
		a(`[href="https://www.blendswap.com/user/sparazza"][target="_blank"]`, 'sparazza'),
		span(' | '),
		a(`[href="https://texturehaven.com/tex/?t=floor_tiles_06"][target="_blank"]`, 'Floor Texture')
	]),
	controls({state, actions})
]);

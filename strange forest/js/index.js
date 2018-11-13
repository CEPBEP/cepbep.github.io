"use strict";

{
	const code = {
		setup() {
			this.render({
				startShape: 'imagine',
				background: '#fff',
				maxShapesPerFrame: 2000
			});
		},
		rules() {
			return {
				imagine: [
					5, s => this.imagine(s, {sat: 1, h: 1}),
					2, s => this.imagine(s, {x: this.randpos([-2, -1, 1, 2])}),
					.2, s => this.imagine(s, {x: this.randpos([-20, -10, 10, 20])}),
					1, s => this.imagine(s, {y: -2, z: 2, s: 1.05}),
					1, s => this.imagine(s, {y: -1, z: 1, s: 1.025}),
					1, s => this.imagine(s, {y: 1, z: -1, s: .975}),
					1, s => this.imagine(s, {y: 2, z: -2, s: .95}),
					1, s => this.imagine(s, {r: .7}),
					1, s => this.imagine(s, {r: -.77}),
					1, s => this.imagine(s, {f: 90}),
					1, s => {
						this.CIRCLE(s, {y: -0.8, s: [1.5, 0.5]});
						this.tree(s);
    				this.imagine(s);
					},
					.01, s => {}
				],
				shadow: s => {
					this.CIRCLE(s, {sat: -1, b: -1, a: -.98, s: [1, .3]});
					this.shadow(s, {s: .92});
				},
				tree: s => {
					this.trunk(s, {b: 0.1});
					this.shadow(s, {y: -.45, s: 10, zIndex: 100});
				},
				trunk: [
					80, s => {
						this.SQUARE(s, { s: 1.5 });
    				this.trunk(s, { y: 0.2, s: 0.99, b: .01, h: .02, a: -.009});
					},
					1, s => {
						this.SQUARE(s);
						this.SPIRAL(s);
					}
				],
				SPIRAL: [
					80, s => {
						this.SQUARE(s, { s: 1.5 });
    				this.SPIRAL(s, { y: 0.2, r: -1, s: 0.99, b: .01, h: .02, a: -.009});
					},
					1, s => {
						this.SPIRAL(s);
						this.SPIRAL(s, {flip: 90});
					}
				]
			};
		}
	};
	// import cfdg library
	cfdg.apply(code);
	// run code
	code.setup();
	// Click canvas to generate a new image
	["click", "touchdown"].forEach(event => {
		document.addEventListener(event, e => code.setup(), false);
	});
}
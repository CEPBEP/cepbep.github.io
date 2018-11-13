"use strict";

const cfdg = function() {
	let gl,
		gpu,
		seed = 0,
		iter = null,
		minSize = 0,
		numShapes = 0,
		minComplexity = 0,
		maxShapesPerFrame = 0;
	const stack = [], shapes = [];
	// GPU setup
	const GPU = (p) => {
		const geometry = [];
		let vertices = [],
			box = [],
			width = 0,
			height = 0,
			vOffset = 0,
			tile = p.tile || 0,
			background = p.background || "#000",
			resolution = p.resolution || 2,
			scale = 0,
			offsetX = 0,
			offsetY = 0,
			ozi = 0,
			ooff = 9999,
			ocol = 0,
			prepass = true;
		// WebGL context
		const canvas = document.querySelector("canvas");
		const options = {
			alpha: false,
			depth: true,
			preserveDrawingBuffer: true
		};
		const gl =
			canvas.getContext("webgl", options) ||
			canvas.getContext("experimental-webgl", options);
		if (!gl) return false;
		// combining alpha blending *AND* depth testing
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		const vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(
			vertexShader,	`
			precision highp float;
			attribute vec2 aPosition;
			uniform mat3 uMatrix;
			uniform vec4 uColor;
			uniform vec2 uResolution;
			uniform float zIndex;
			varying vec4 vColor;
			vec3 hsv2rgb(vec3 c) {
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			void main() {
				vec3 pos = uMatrix * vec3(aPosition, 1.0);
				gl_Position = vec4(
					((pos.x / uResolution.x * 2.0) - 1.0),
					((pos.y / uResolution.y * 2.0) - 1.0),
					zIndex,
					1.0
				);
				vColor = vec4(hsv2rgb(uColor.rgb), uColor.w);
			}
		`);
		gl.compileShader(vertexShader);
		const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(
			fragmentShader,	`
			precision highp float;
			varying vec4 vColor;
			void main() {
			gl_FragColor = vColor;
			}
		`);
		gl.compileShader(fragmentShader);
		// create program
		const program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		gl.useProgram(program);
		// center/scale scene
		const autoscale = (z, ox, oy, s) => {
			if (s) scale = s; 
			else scale = Math.min(width / (box[1] - box[0]), height / (box[3] - box[2])) * z;
			if (ox || oy || s) {
				offsetX = width * ox || width * 0.5;
				offsetY = height * oy || height * 0.5;
			} else {
				offsetX = width * 0.5 - (box[0] + box[1]) * 0.5 * scale;
				offsetY = height * 0.5 - (box[3] + box[2]) * 0.5 * scale;
			}				
		};
		// geometry
		const mesh = v => {
			const bx = box;
			const transform = CFDGtransform(false);
			const num = v.length / 2;
			const off = vOffset;
			const uMat = new Float32Array([
				1, 0, 0,
				0, 1, 0,
				0, 0, 1
			]);
			const uMatrix = gl.getUniformLocation(program, "uMatrix");
			gl.enableVertexAttribArray(uMatrix);
			const zIndex = gl.getUniformLocation(program, "zIndex");
			gl.enableVertexAttribArray(zIndex);
			const uColor = gl.getUniformLocation(program, "uColor");
			gl.enableVertexAttribArray(uColor);
			vertices = vertices.concat(v);
			vOffset += v.length * Float32Array.BYTES_PER_ELEMENT;
			// draw shape
			const drawShape = (uMat, s, scale, offsetX, offsetY) => {
				uMat[0] = s[0] * scale;
				uMat[1] = s[1] * scale;
				uMat[3] = s[2] * scale;
				uMat[4] = s[3] * scale;
				uMat[6] = s[4] * scale + offsetX;
				uMat[7] = s[5] * scale + offsetY;
				const col = s[6] + s[7] + s[8] + s[9];
				if (col !== ocol) {
					ocol = col;
					gl.uniform4f(uColor, s[6] / 360, s[7], s[8], s[9]);
				}
				const zi = 0.5 + s[10] / 100000;
				if (zi !== ozi) {
					ozi = zi;
					gl.uniform1f(zIndex, zi);
				}
				gl.uniformMatrix3fv(uMatrix, false, uMat);
				if (off !== ooff) {
					ooff = off;
					gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
					gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, off);
				}
				gl.drawArrays(gl.TRIANGLES, 0, num);
			};
			return (s, t) => {
				s = transform(s, t);
				if (prepass) {
					// bounding box
					const x = s[4];
					const y = s[5];
					if (x < bx[0]) bx[0] = x; else if (x > bx[1]) bx[1] = x;
					if (y < bx[2]) bx[2] = y; else if (y > bx[3]) bx[3] = y;
					return;
				}
				numShapes++;
				if (tile) {
					for (let x = -2; x <= 2; x++) {
						for (let y = -1; y <= 1; y++) {
							drawShape(
								uMat,
								s,
								scale,
								offsetX + x * tile * scale,
								offsetY + y * tile * scale
							);
						}
					}
				} else drawShape(uMat, s, scale, offsetX, offsetY);
			};
		};
		// Square
		geometry[0] = mesh([
			-0.5, -0.5,
			-0.5,  0.5,
			 0.5, -0.5,
			 0.5,	-0.5,
			-0.5,  0.5,
			 0.5,  0.5
		]);
		// Triangle
		geometry[1] = mesh([0, 0.577350269, -0.5, -0.28867513, 0.5, -0.28867513]);
		// Circle
		const verts = [],
			step = 2 * Math.PI / 72;
		for (let i = 0; i < 2 * Math.PI - step; i += step) {
			verts.push(
				0.5 * Math.cos(i - step),
				0.5 * Math.sin(i - step),
				0,
				0,
				0.5 * Math.cos(i),
				0.5 * Math.sin(i)
			);
		}
		geometry[2] = mesh(verts);
		// load meshes into GPU
		const aPosition = gl.getAttribLocation(program, "aPosition");
		gl.enableVertexAttribArray(aPosition);
		const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		vertices.length = 0;
		// User interface
		return {
			gl: gl,
			geometry: geometry,
			autoscale: autoscale,
			set prepass (p) {	prepass = p; },
			get prepass () { return prepass; },
			resize() {
				width = canvas.width = canvas.offsetWidth * resolution;
				height = canvas.height = canvas.offsetHeight * resolution;
				let rgb = background
					.replace(
						/^#?([a-f\d])([a-f\d])([a-f\d])$/i,
						(m, r, g, b) => "#" + r + r + g + g + b + b
					)
					.substring(1)
					.match(/.{2}/g)
					.map(x => parseInt(x, 16) / 256);
				gl.clearColor(rgb[0], rgb[1], rgb[2], 1.0);
				const uResolution = gl.getUniformLocation(program, "uResolution");
				gl.enableVertexAttribArray(uResolution);
				gl.uniform2f(uResolution, width, height);
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
				gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
			},
			boxreset () {
				box[0] = 0;
				box[1] = 0;
				box[2] = 0;
				box[3] = 0;
			}
		};
	};
	// execute loop
	const loop = () => {
		const transform = CFDGtransform(true);
		const copy = copyState;
		return (n, s, t, f) => {
			let ls = copy(s);
			for (let i = 0; i < n; i++) {
				f(ls, i);
				ls = transform(ls, t);
				if (!ls) return;
			}
		};
	};
	// random seedable function
	const random = _ => {
		seed = (seed * 16807) % 2147483647;
		return (seed - 1) / 2147483646;
	};
	// random integers
	const randint = (s, e = 0) => {
		if (e === 0) {
			e = s;
			s = 0;
		}
		return Math.floor(s + random() * (e - s + 1));
	};
	// return random position in array
	const randpos = a => {
		return a[Math.floor(random() * a.length)];
	};
	// copy state
	const copyState = s => {
		return [
			s[0],  // a00
			s[1],  // a10
			s[2],  // a01
			s[3],  // a11
			s[4],  // tx
			s[5],  // ty
			s[6],  // hue
			s[7],  // saturation
			s[8],  // brillance
			s[9],  // alpha
			s[10], // zIndex
			s[11], // m0
			s[12], // m1
			s[13]  // primitive
		];
	};
	// CFDG affine transforms
	const CFDGtransform = minTest => {
		const min = minSize;
		const copy = copyState;
		const transforms = {
			x(m, v) {
				m[4] += v * m[0];
				m[5] += v * m[1];
			},
			y(m, v) {
				m[4] += v * m[2];
				m[5] += v * m[3];
			},
			z(m, v) {
				m[10] -= v;
			},
			zIndex(m, v) {
				m[10] = v;
			},
			s(m, v) {
				const a = Array.isArray(v);
				const x = a ? v[0] : v;
				const y = a ? v[1] : x;
				m[0] *= x;
				m[1] *= x;
				m[2] *= y;
				m[3] *= y;
			},
			r(m, v) {
				const rad = Math.PI * v / 180;
				const cos = Math.cos(rad);
				const sin = Math.sin(rad);
				const r00 = cos * m[0] + sin * m[2];
				const r01 = cos * m[1] + sin * m[3];
				m[2] = cos * m[2] - sin * m[0];
				m[3] = cos * m[3] - sin * m[1];
				m[0] = r00;
				m[1] = r01;
			},
			f(m, v) {
				const rad = Math.PI * v / 180;
				const x = Math.cos(rad);
				const y = Math.sin(rad);
				const n = 1 / (x * x + y * y);
				const b00 = (x * x - y * y) / n;
				const b01 = 2 * x * y / n;
				const b10 = 2 * x * y / n;
				const b11 = (y * y - x * x) / n;
				const r00 = b00 * m[0] + b01 * m[2];
				const r01 = b00 * m[1] + b01 * m[3];
				m[2] = b10 * m[0] + b11 * m[2];
				m[3] = b10 * m[1] + b11 * m[3];
				m[0] = r00;
				m[1] = r01;
			},
			skew(m, v) {
				const x = Math.tan(Math.PI * v[0] / 180);
				const y = Math.tan(Math.PI * v[1] / 180);
				const r00 = m[0] + y * m[2];
				const r01 = m[1] + y * m[3];
				m[2] = x * m[0] + m[2];
				m[3] = x * m[1] + m[3];
				m[0] = r00;
				m[1] = r01;
			},
			h(m, v) {
				m[6] += v;
				m[6] %= 360;
			},
			sat(m, v) {
				this.col(m, v, 7);
			},
			b(m, v) {
				this.col(m, v, 8);
			},
			a(m, v) {
				this.col(m, v, 9);
			},
			col(m, v, p) {
				if (v > 0) {
					m[p] += v * (1 - m[p]);
				} else {
					m[p] += v * m[p];
				}
			},
			m0(m, v) {
				m[11] = v;
			},
			m1(m, v) {
				m[12] = v;
			}
		};
		transforms.brightness = transforms.b;
		transforms.hue = transforms.h;
		transforms.flip = transforms.f;
		transforms.scale = transforms.s;
		transforms.size = transforms.s;
		transforms.rotate = transforms.r;
		transforms.alpha = transforms.a;
		// return transform function
		if (minTest) {
			return (s, p) => {
				let m = copy(s);
				for (const c in p) {
					transforms[c](m, p[c]);
				}
				const x = m[0] * m[0] + m[1] * m[1];
				const y = m[2] * m[2] + m[3] * m[3];
				return x < min && y < min ? false : m;
			};
		} else {
			return (s, p) => {
				let m = copy(s);
				for (const c in p) {
					transforms[c](m, p[c]);
				}
				return m;
			};
		}
	};
	// return execute function for single rule
	const singlerule = (i, stack) => {
		const transform = CFDGtransform(true);
		return (s, t) => {
			s = transform(s, t, true);
			if (!s) return;
			s[13] = i;
			stack.push(s);
		};
	};
	// return execute function for multiple rules
	const randomrule = (totalWeight, weight, index, len, random, stack) => {
		const transform = CFDGtransform(true);
		return (s, t) => {
			s = transform(s, t, true);
			if (!s) return;
			let w = 0;
			const r = random() * totalWeight;
			for (let i = 0; i < len; i++) {
				w += weight[i];
				if (r <= w) {
					s[13] = index[i];
					stack.push(s);
					return;
				}
			}
		};
	};
	// compile JS shapes functions
	const compileshapes = () => {
		shapes.length = 0;
		this.code = this.rules(11, 12);
		for (const namerule in this.code) {
			const rules = this.code[namerule];
			if (Array.isArray(rules)) {
				let totalWeight = 0;
				const weight = [];
				const index = [];
				for (let i = 0; i < rules.length; i += 2) {
					totalWeight += rules[i];
					shapes.push(rules[i + 1]);
					weight.push(rules[i]);
					index.push(shapes.length - 1);
				}
				this[namerule] = randomrule(
					totalWeight,
					weight,
					index,
					index.length,
					random,
					stack
				);
			} else {
				shapes.push(rules);
				this[namerule] = singlerule(shapes.length - 1, stack);
			}
		}
	};
	// stack iterator
	const iterator = function*() {
		let t1 = performance.now();
		do {
			const s = stack.shift();
			shapes[s[13]](s);
			if (maxShapesPerFrame && (numShapes > maxShapesPerFrame || performance.now() - t1 > 8)) {
				numShapes = 0;
				yield refresh();
				t1 = performance.now();
			}
		} while (stack.length);
		yield refresh();
	};
	// request Annimation Frame
	const next = _ => iter.next();
	const refresh = _ => requestAnimationFrame(next);
	// start first shape
	const render = p => {
		// init shapes
		minSize = (p.minSize || 0.1) / 100;
		if (!this.code) {
			this.gpu = gpu = GPU(p);
			this.gl = gl = gpu.gl;
			this.SQUARE = gpu.geometry[0];
			this.TRIANGLE = gpu.geometry[1];
			this.CIRCLE = gpu.geometry[2];
			compileshapes();
		}
		// resize canvas
		gpu.resize();
		minComplexity = p.minComplexity || 100;
		maxShapesPerFrame = p.maxShapesPerFrame || 0;
		if (p.seed) seed = p.seed;
		else seed = Math.round(Math.random() * 1000000);
		let oseed = seed;
		// running shapes (prepass)
		if (!p.scale) {
			gpu.prepass = true;
			let minComp = minComplexity;
			let comp = 0;
			do {
				comp = 0;
				oseed = seed;
				gpu.boxreset();
				stack.length = 0;
				this[p.startShape]([1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0], p.transform || {});
				do {
					const s = stack.shift();
					shapes[s[13]](s);
					comp++;
				} while (stack.length);
			} while (comp < minComp--);
			seed = oseed;
			gpu.autoscale(p.zoom || 1, p.offsetX, p.offsetY, p.scale);
		}
		// running shapes (draw)
		gpu.prepass = false;
		numShapes = 0;
		seed = oseed;
		if (p.prerun) p.prerun(gl);
		stack.length = 0;
		this[p.startShape]([1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0], p.transform || {});
		iter && iter.return();
		iter = iterator();
		iter.next();
	};
	// public functions
	this.random = random;
	this.randint = randint;
	this.randpos = randpos;
	this.render = render;
	this.loop = loop();
};
"use strict";
function updateVis(a) {
    $.ctx.clearRect(0, 0, S.w, S.h), 1 === a ? curr_vis = curr_vis < VIS.length - 1 ? curr_vis + 1 : 0 : -1 === a && (curr_vis = curr_vis > 0 ? curr_vis - 1 : VIS.length - 1), vis = VIS[curr_vis]
}
function updateColor(a) {
    1 === a ? curr_color = curr_color < COLOR.length - 1 ? curr_color + 1 : 0 : -1 === a && (curr_color = curr_color > 0 ? curr_color - 1 : COLOR.length - 1), color = COLOR[curr_color]
}
function toggleVis() {
    playing = !playing
}
function handleAudio(a) {
    var b = window.AudioContext || window.webkitAudioContext;
    A.audio_ctx = new b, A.audio_src = A.audio_ctx.createMediaStreamSource(a), A.audio_analyser = A.audio_analyser || A.audio_ctx.createAnalyser(), A.audio_analyser.minDecibels = -90, A.audio_analyser.maxDecibels = 0, A.audio_analyser.smoothingTimeConstant = .8, A.audio_analyser.fftSize = A.fft, A.audio_src.connect(A.audio_analyser), loop()
}
function setup() {
    function a(a) {
        console.log(a)
    }
    navigator.mediaDevices.getUserMedia ? navigator.mediaDevices.getUserMedia({
        audio: !0
    }).then(handleAudio).catch(a) : (navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia, navigator.getUserMedia && navigator.getUserMedia({
        audio: !0
    }, handleAudio, a))
}
function loop() {
    var b = new Uint8Array(A.audio_analyser.frequencyBinCount);
    vis.data ? A.audio_analyser[vis.data](b) : A.audio_analyser.getByteFrequencyData(b), vis.keep || $.ctx.clearRect(0, 0, S.w, S.h), $.ctx_fg.clearRect(0, 0, S.w, S.h), $.ctx.lineWidth = 1, V.points1 = [], V.points2 = [], V.points3 = [], V.points4 = [];
    var c = "getByteTimeDomainData" === vis.data;
    b = Array.from(b), c || (b = b.slice(0, Math.round(b.length / 2))), b = vis.sort ? vis.sort(b) : sortNone(b);
    var d = b.length;
    if (S.squares = d, d <= 0 || !playing) return void window.requestAnimationFrame(loop);
    S.sq_per_row = S.divisible.y, S.sq_rows = S.divisible.x, S.sq_w = S.w / S.sq_per_row, S.sq_h = S.h / S.sq_rows, S.meter_w = S.w / S.squares, S.meter_max_h = .5 * S.h, A.average = 0;
    for (var f = 0; f < d / 2; f++) A.average += b[f];
    A.rms = A.average / (d / 2), A.rms /= A.max - A.min;
    for (var f = 0; f < d; f++) {
        var g = b[f];
        g = c ? g / 256 : (g - A.min) / (A.max - A.min), g < 0 && (g = 0), vis.fn(g, f, d);
        var h = c ? b[f] : b[f];
        h > A.max && (A.max = h), h < A.min && (A.min = h)
    }
    window.requestAnimationFrame(loop)
}

function noise(a, b, c) {
    var d = S.h,
        e = .02 * d,
        f = (1 - a) * S.h_rad,
        g = (b - .75 * c) * PI * 2,
        h = g / c,
        j = S.w_rad + Math.cos(h) * f * .8,
        k = S.h_rad + Math.sin(h) * f * .8,
        l = .6 * a + .4;
    $.ctx.fillStyle = hsla(l, b), $.ctx.beginPath();
    var m = e / 2 * (.7 * a + .3);
    $.ctx.arc(j, k, m, 0, 2 * PI, !1), $.ctx.fill()
}

function dots(a, b, c) {
    var d = S.w / c,
        e = b * S.meter_w + S.meter_w / 2,
        f = S.meter_max_h * a,
        g = .5 * S.h - f / 2,
        h = .8 * a + .2;
    $.ctx.fillStyle = hsla(h, b), $.ctx.beginPath();
    var i = d / 2;
    $.ctx.arc(e, g, i, 0, 2 * PI, !1), $.ctx.fill()
}

function lines(a, b) {
    var d = b * S.meter_w + S.meter_w / 2 - 1,
        e = S.meter_max_h * a,
        f = .5 * S.h - e / 2,
        g = .8 * a + .2;
    $.ctx.fillStyle = hsla(g, b), $.ctx.fillRect(d, f, 2, e)
}

function future(a, b) {
    var d = b * S.meter_w + S.meter_w / 2,
        e = S.h,
        f = 0,
        g = a;
    $.ctx.fillStyle = hsla(g, b), $.ctx.fillRect(d, f, S.meter_w, e)
}

function circles(a, b) {
    var d = 0,
        e = S.w_rad + d,
        f = S.h_rad + d,
        g = .8 * a * Math.min(.8 * S.w_rad, .8 * S.h_rad),
        h = a;
    $.ctx.beginPath(), $.ctx.arc(e, f, g, 0, 2 * PI, !1), $.ctx.strokeStyle = hsla(h, b), $.ctx.stroke()
}

function runner(a, b) {
    var d = V.runners[b];
    if (d) {
        if (a < .2) return
    } else d = {}, d.x = S.w_rad, d.y = S.h_rad, d.dir_x = 1, d.dir_y = 1;
    var e = a * a * S.w_rad * .1,
        f = d.x > 0,
        g = d.x < S.w,
        h = d.y > 0,
        i = d.y < S.h;
    d.dir_x = f && g ? Math.random() > .5 ? 1 : -1 : f ? -1 : 1, Math.random() > .6 && (d.dir_x = 0), d.dir_y = h && i ? Math.random() > .5 ? 1 : -1 : h ? -1 : 1, Math.random() > .6 && (d.dir_y = 0);
    var j = .1 * A.rms,
        k = d.x + d.dir_x * e,
        l = d.y + d.dir_y * e;
    $.ctx.strokeStyle = hsla(j, Math.floor(Math.random() * V.random_hues.length)), $.ctx.beginPath(), $.ctx.moveTo(d.x, d.y), $.ctx.lineTo(k, l), $.ctx.stroke(), d.x = k, d.y = l, V.runners[b] = d, $.ctx_fg.beginPath(), $.ctx_fg.fillStyle = hsla(.9, Math.floor(Math.random() * V.random_hues.length)), $.ctx_fg.arc(d.x, d.y, 2, 0, 2 * PI, !1), $.ctx_fg.closePath(), $.ctx_fg.fill()
}

function wave(a, b, c) {
    var d = b * S.meter_w + S.meter_w / 2;
    a -= .5, a = Math.min(.5, Math.max(a, -.5));
    var e = S.h_rad,
        f = a * e;
    if (f = S.h_rad + f, V.points1.push(d), V.points1.push(f), b === c - 1) {
        drawCurve($.ctx, V.points1, .5, !1, 32);
        var g = .8 * A.rms + .2;
        $.ctx.strokeStyle = hsla(g, Math.floor(Math.random() * V.random_hues.length)), $.ctx.lineWidth = 10 * A.rms, $.ctx.stroke()
    }
}

function hills(a, b, c) {
    var d = b * S.meter_w + S.meter_w / 2,
        e = S.meter_max_h * a,
        f = 1.2 * S.h_rad - e,
        g = 1.2 * S.h_rad + .3 * e;
    if (V.points1.push(d), V.points1.push(f), V.points2.push(d), V.points2.push(g), b === c - 1) {
        drawCurve($.ctx, V.points1, .5, !1, 32);
        var h = .2 * A.rms;
        $.ctx.strokeStyle = hsla(h, Math.floor(Math.random() * V.random_hues.length)), $.ctx.lineWidth = Math.floor(6 * A.rms), $.ctx.stroke(), $.ctx.strokeStyle = hsla(.25 * h, Math.floor(Math.random() * V.random_hues.length)), drawCurve($.ctx, V.points2, .5, !1, 32), $.ctx.stroke()
    }
}

function squares(a, b) {
    var d = b % S.sq_per_row,
        e = Math.floor(b / S.sq_per_row);
    d *= S.sq_w, e *= S.sq_h;
    var f = a;
    $.ctx.fillStyle = hsla(f, b), $.ctx.fillRect(d, e, S.sq_w, S.sq_h)
}

function bars(a, b) {
    var d = b * S.meter_w,
        e = S.h * a,
        f = S.h - e,
        g = a;
    $.ctx.fillStyle = hsla(g, b), $.ctx.fillRect(d, f, S.meter_w, e)
}

function dashes(a, b) {
    var d = .5,
        e = S.meter_w * d,
        f = (S.meter_w - e) / 2,
        g = b * S.meter_w + f,
        h = S.h * a,
        i = S.h - h,
        j = .8 * a + .2;
    $.ctx.fillStyle = hsla(j, b), $.ctx.fillRect(g, i, e, S.h), $.ctx.fillStyle = hsla(1, b), $.ctx.fillRect(g, i, e, .05 * S.h)
}

function solid(a, b, c) {
    outlinePoints(a, b, c, function() {
        $.ctx.fill()
    })
}

function outline(a, b, c) {
    outlinePoints(a, b, c, function() {
        $.ctx.stroke()
    }, !0)
}

function outlinePoints(a, b, c, d, e) {
    var f = b * S.meter_w + S.meter_w / 2,
        g = S.meter_max_h * a,
        h = .5 * S.h - g / 2,
        i = .5 * S.h + g / 2;
    if (V.points1.push([f, h]), V.points2.push([f, i]), b === c - 1) {
        V.points2.reverse();
        var j = .8 * A.rms + .2;
        $.ctx.strokeStyle = hsla(1, Math.floor(Math.random() * A.fft)), $.ctx.fillStyle = hsla(j, Math.floor(Math.random() * A.fft)), $.ctx.beginPath(), $.ctx.moveTo(V.points1[0][0], V.points1[0][1]);
        for (var k = 1; k < V.points1.length; k++) $.ctx.lineTo(V.points1[k][0], V.points1[k][1]);
        e && (d(), $.ctx.beginPath());
        for (var k = 0; k < V.points2.length; k++) $.ctx.lineTo(V.points2[k][0], V.points2[k][1]);
        d()
    }
}

function radial(a, b, c) {
    var d = a * S.h_rad,
        e = b * PI * 2,
        f = e / c,
        h = S.w_rad + Math.cos(f) * d,
        i = S.h_rad + Math.sin(f) * d,
        j = S.w_rad + Math.cos(-f) * d,
        k = S.h_rad + Math.sin(-f) * d,
        l = S.w - h,
        m = S.w - j,
        n = [
            [h, i],
            [l, i],
            [j, k],
            [m, k]
        ],
        r = a;
    $.ctx.strokeStyle = hsla(r, b), $.ctx.beginPath();
    for (var s = 0; s < n.length; s++) $.ctx.moveTo(S.w_rad, S.h_rad), $.ctx.lineTo(n[s][0], n[s][1]), $.ctx.stroke()
}

function hsla(a, b) {
    var c = "RANDOM" === color[0] ? V.random_hues[b] : color[0];
    return "hsla(" + c + ", " + color[1] + "%, " + color[2] + "%, " + a + ")"
}

function randomHues() {
    V.random_hues = [];
    for (var a = 0; a < A.fft; a++) V.random_hues.push(Math.round(360 * Math.random()))
}

function sortNone(a) {
    return a
}

function sortNoZero(a) {
    for (var b = [], c = 0; c < a.length; c++) a[c] > 0 && b.push(a[c]);
    return b
}

function sortNoise(a) {
    return sortDoubleInvert(sortShuffle(sortDoubleInvert(sortNoZero(a))))
}

function sortDoubleInvertNoZero(a) {
    return sortDoubleInvert(sortNoZero(a))
}

function sortTopMidNoZero(a) {
    return sortTopMid(sortNoZero(a))
}

function sortReverse(a) {
    return a.reverse(), a
}

function sortTopUp(a) {
    return a = sortTopDown(a), a.reverse(), a
}

function sortTopDown(a) {
    return a.sort(), a
}

function sortDoubleInvert(a) {
    a.reverse(), a = Array.from(a);
    var b = Array.from(a);
    return b.reverse(), a.concat(b)
}

function sortTopMid(a) {
    a = Array.from(a);
    var b = [];
    for (a.sort(function(a, b) {
            return a - b
        }), b.push(a.pop()); a.length;) b[a.length % 2 === 0 ? "push" : "unshift"](a.pop());
    return b
}

function sortShuffle(a) {
    for (var b = a.length, c = void 0, d = void 0; 0 !== b;) d = Math.floor(Math.random() * b), b -= 1, c = a[b], a[b] = a[d], a[d] = c;
    return a
}

function checkHTTPS() {
    if ("https:" !== location.protocol) {
        var a = document.createElement("div");
        a.classList.add("alert");
        var b = document.createElement("p");
        b.innerHTML = "This pen uses your microphone which requires https. <br>";
        var c = document.createElement("a");
        return c.setAttribute("href", "https://codepen.io/jakealbaugh/pen/XNWPmv/"), c.setAttribute("target", "_blank"), c.innerHTML = "Open in https", b.appendChild(c), a.appendChild(b), document.body.appendChild(a), !1
    }
    return !0
}

function divisible(a, b, c) {
    c = c || {
        x: 0,
        y: 0,
        diff: 1 / 0
    }, b || (b = a);
    var d = a / b,
        e = Math.abs(b - d);
    return Math.round(d) === d && e < c.diff && (c = {
        x: b,
        y: d,
        diff: e
    }), 1 === b ? c : divisible(a, b - 1, c)
}

function drawCurve(a, b, c, d, e, f) {
    if (f = f ? f : !1, a.beginPath(), drawLines(a, getCurvePoints(b, c, d, e)), f)
        for (var g = 0; g < b.length - 1; g += 2) a.rect(b[g] - 2, b[g + 1] - 2, 4, 4)
}

function getCurvePoints(a, b, c, d) {
    b = "undefined" != typeof b ? b : .5, c = c ? c : !1, d = d ? d : 16;
    var g, h, i, j, k, l, m, n, o, p, q, e = [],
        f = [];
    e = a.slice(0), c ? (e.unshift(a[a.length - 1]), e.unshift(a[a.length - 2]), e.unshift(a[a.length - 1]), e.unshift(a[a.length - 2]), e.push(a[0]), e.push(a[1])) : (e.unshift(a[1]), e.unshift(a[0]), e.push(a[a.length - 2]), e.push(a[a.length - 1]));
    for (var t = 2; t < e.length - 4; t += 2)
        for (var u = 0; u <= d; u++) i = (e[t + 2] - e[t - 2]) * b, j = (e[t + 4] - e[t]) * b, k = (e[t + 3] - e[t - 1]) * b, l = (e[t + 5] - e[t + 1]) * b, q = u / d, m = 2 * Math.pow(q, 3) - 3 * Math.pow(q, 2) + 1, n = -(2 * Math.pow(q, 3)) + 3 * Math.pow(q, 2), o = Math.pow(q, 3) - 2 * Math.pow(q, 2) + q, p = Math.pow(q, 3) - Math.pow(q, 2), g = m * e[t] + n * e[t + 2] + o * i + p * j, h = m * e[t + 1] + n * e[t + 3] + o * k + p * l, f.push(g), f.push(h);
    return f
}

function drawLines(a, b) {
    a.moveTo(b[0], b[1]);
    for (var c = 2; c < b.length - 1; c += 2) a.lineTo(b[c], b[c + 1])
}
console.clear();
var https = checkHTTPS(),
    $ = {},
    A = {},
    S = {},
    V = {},
    PI = Math.PI,
    heap_limit = window.performance.memory.jsHeapSizeLimit > 12e8,
    cpu_limit = window.navigator.hardwareConcurrency >= 8,
    hi_res = heap_limit || cpu_limit || window.innerWidth > 1400;
A.fft = hi_res ? 2048 : 256, A.max = 200, A.min = 100, A.rms = 0, S.divisible = divisible(A.fft / 4), S.w = window.innerWidth, S.h = window.innerHeight, hi_res && (S.w *= 2, S.h *= 2), S.w_rad = S.w / 2, S.h_rad = S.h / 2, $.cvs = document.createElement("canvas"), $.cvs_fg = document.createElement("canvas"), $.ctx = $.cvs.getContext("2d"), $.ctx_fg = $.cvs_fg.getContext("2d"), document.body.appendChild($.cvs), document.body.appendChild($.cvs_fg), $.cvs.width = S.w, $.cvs_fg.width = S.w, $.cvs.height = S.h, $.cvs_fg.height = S.h, V.runners = [];
var COLOR = [
    ["RANDOM", 100, 60],
             [0, 0, 80],
           [0, 100, 60],
          [60, 100, 60],
         [120, 100, 60],
        [180, 100, 60],
        [240, 100, 60],
        [300, 100, 60]
    ],
    VIS = [{
        fn: dashes
    }, {
        fn: bars
    }, {
        fn: future
    }, {
        fn: radial,
        sort: sortNoZero
    }, {
        fn: solid,
        sort: sortDoubleInvert
    }, {
        fn: outline,
        sort: sortDoubleInvert
    }, {
        fn: dots,
        sort: sortDoubleInvertNoZero
    }, {
        fn: lines,
        sort: sortDoubleInvertNoZero
    }, {
        fn: wave,
        data: "getByteTimeDomainData"
    }, {
        fn: circles
    }, {
        fn: hills,
        keep: !0
    }, {
        fn: runner,
        keep: !0
    }, {
        fn: noise,
        sort: sortNoise
    }, {
        fn: squares,
        sort: sortTopMid
    }],
    curr_color = 0,
    playing = !0,
    curr_vis = 4,
    color = COLOR[curr_color],
    vis = VIS[curr_vis];
randomHues(), https && setup(), document.body.addEventListener("keyup", function(a) {
    switch (a.keyCode) {
        case 27:
            toggleVis();
            break;
        case 37:
            updateVis(-1);
            break;
        case 39:
            updateVis(1);
            break;
        case 38:
            updateColor(-1);
            break;
        case 40:
            updateColor(1)
    }
});

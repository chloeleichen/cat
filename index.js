'use strict';

var dotDensity = 0.24;

var damping = 0.7;
var kRadiusFactor = 0.5;
var kSpeed = 3.0;
var minDistFactor = 2.5;
var nParticles = 2200;
var catSpeed = 2;
var nFrames = 1;

var imageWidth = 135;
var imageHeight = 68;

var width = 500;
var height = 214;

var imageScale = width / imageWidth;
var cats = [];

var particles = [];

var medArea = width * height / nParticles;
var medRadius = Math.sqrt(medArea / Math.PI);
var minRadius = medRadius;
var maxRadius = medRadius * medRadius * 1;

var canvas = d3.select('body').append('canvas').attr('width', imageWidth).attr('height', imageHeight);

var svg = d3.select('#container').append('svg').attr('width', width).attr('height', height).append('g');

var context = canvas.node().getContext('2d');

for (var i = 0; i < nFrames; ++i) {
  var image = new Image();
  image.src = 'images/cats' + i + '.png';
  cats.push(image);
}

// load all cats
window.onload = start;

function start() {
  cats.forEach(function (cat, i) {
    context.drawImage(cat, 0, 0);
    cats[i] = context.getImageData(0, 0, imageWidth, imageHeight);
  });
  for (var _i = 0; _i < nParticles; ++_i) {
    var particle = new Particle(Math.random() * width, Math.random() * height);
    particles.push(particle);
  }
  svg.selectAll('cricle').data(particles).enter().append('circle').attr('cx', function (d) {
    return d.x;
  }).attr('cy', function (d) {
    return d.y;
  }).attr('r', medRadius / 2).style('fill', '#000000');
  update();
}

function update() {
  d3.timer(function (t) {
    doPhysics();
    svg.selectAll('circle').data(particles).attr('cx', function (d) {
      return d.x;
    }).attr('cy', function (d) {
      return d.y;
    });
  });
}

function doPhysics() {
  var reference = cats[0];
  for (var _i2 = 0; _i2 < nParticles; ++_i2) {
    var px = parseInt(particles[_i2].x / imageScale);
    var py = parseInt(particles[_i2].y / imageScale);
    if (px >= 0 && px < reference.width && py >= 0 && py < reference.height) {
      // get red color
      var v = reference.data[(imageWidth * py + px) * 4];
      particles[_i2].rad = d3.scale.linear().domain([0, 1]).range([minRadius, maxRadius])(v / 255.0);
    }
  }
  for (var _i3 = 0; _i3 < nParticles; ++_i3) {
    var p = particles[_i3];
    p.fx = p.fy = p.wt = 0;
    p.vx *= damping;
    p.vy *= damping;
  }

  // Particle -> particle interactions
  for (var _i4 = 0; _i4 < nParticles - 1; ++_i4) {
    var _p = particles[_i4];
    for (var j = _i4 + 1; j < nParticles; ++j) {
      var pj = particles[j];
      if (_i4 === j || Math.abs(pj.x - _p.x) > _p.rad * minDistFactor || Math.abs(pj.y - _p.y) > _p.rad * minDistFactor) {
        continue;
      }

      var dx = _p.x - pj.x;
      var dy = _p.y - pj.y;
      var distance = Math.sqrt(dx * dx + dy * dy);

      var maxDist = _p.rad + pj.rad;
      var diff = maxDist - distance;
      if (diff > 0) {
        var scale = diff / maxDist;
        scale = Math.pow(scale, 2);
        _p.wt += scale;
        pj.wt += scale;
        scale = scale * kSpeed / distance;
        _p.fx += dx * scale;
        _p.fy += dy * scale;
        pj.fx -= dx * scale;
        pj.fy -= dy * scale;
      }
    }
  }

  for (var _i5 = 0; _i5 < nParticles; ++_i5) {
    var _p2 = particles[_i5];

    // keep within edges
    var _dx = void 0;
    var _dy = void 0;
    var _distance = void 0;
    var _scale = void 0;
    var _diff = void 0;
    var _maxDist = _p2.rad;

    // left edge
    _distance = _dx = _p2.x - 0;
    _dy = 0;
    _diff = _maxDist - _distance;
    if (_diff > 0) {
      _scale = _diff / _maxDist;
      _scale = _scale * _scale;
      _p2.wt += _scale;
      _scale = _scale * kSpeed / _distance;
      _p2.fx += _dx * _scale;
      _p2.fy += _dy * _scale;
    }
    // right edge
    _dx = _p2.x - width;
    _dy = 0;
    _distance = -_dx;
    _diff = _maxDist - _distance;
    if (_diff > 0) {
      _scale = _diff / _maxDist;
      _scale = _scale * _scale;
      _p2.wt += _scale;
      _scale = _scale * kSpeed / _distance;
      _p2.fx += _dx * _scale;
      _p2.fy += _dy * _scale;
    }
    // top edge
    _distance = _dy = _p2.y - 0;
    _dx = 0;
    _diff = _maxDist - _distance;
    if (_diff > 0) {
      _scale = _diff / _maxDist;
      _scale = _scale * _scale;
      _p2.wt += _scale;
      _scale = _scale * kSpeed / _distance;
      _p2.fx += _dx * _scale;
      _p2.fy += _dy * _scale;
    }
    // bot edge
    _dy = _p2.y - height;
    _dx = 0;
    _distance = -_dy;
    _diff = _maxDist - _distance;
    if (_diff > 0) {
      _scale = _diff / _maxDist;
      _scale = _scale * _scale;
      _p2.wt += _scale;
      _scale = _scale * kSpeed / _distance;

      _p2.fx += _dx * _scale;
      _p2.fy += _dy * _scale;
    }
    if (_p2.wt > 0) {
      _p2.vx += _p2.fx / _p2.wt;
      _p2.vy += _p2.fy / _p2.wt;
    }
    _p2.x += _p2.vx;
    _p2.y += _p2.vy;
  }
}

var Particle = function Particle(_x, _y) {
  return {
    vx: 0,
    vy: 0,
    x: _x,
    y: _y,
    rad: 1,
    wt: 0,
    fx: 0,
    fy: 0
  };
};

const dotDensity = 0.24;

const damping = 0.7;
const kRadiusFactor = 0.5;
const kSpeed = 3.0;
const minDistFactor = 2.5;
const nParticles = 2200;
const catSpeed = 2;
const nFrames = 1;

const imageWidth = 135;
const imageHeight = 68;

const width = 500;
const height = 214;

const imageScale = width / imageWidth;
let cats = [];

let particles = [];

let medArea = (width * height) / nParticles;
let medRadius = Math.sqrt(medArea / Math.PI);
let minRadius = medRadius;
let maxRadius = medRadius * medRadius * 1;

let canvas = d3.select('body').append('canvas')
    .attr('width', imageWidth)
    .attr('height', imageHeight);

let svg = d3.select('#container')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g');

let context = canvas.node().getContext('2d');

for (let i = 0; i < nFrames; ++i) {
  let image = new Image();
  image.src = `images/cats${i}.png`;
  cats.push(image);
}

// load all cats
window.onload = start;

function start(){
  cats.forEach((cat, i)=>{
    context.drawImage(cat, 0, 0);
    cats[i] = context.getImageData(0, 0, imageWidth, imageHeight);
  });
  for (let i = 0; i < nParticles; ++i) {
    let particle = new Particle(Math.random() * width, Math.random() * height);
    particles.push(particle);
  }
  svg.selectAll('cricle')
     .data(particles)
     .enter()
     .append('circle')
     .attr('cx', d => d.x)
     .attr('cy', d => d.y)
     .attr('r', medRadius/2)
     .style('fill', '#000000');
update();
}

function update(){
  d3.timer((t)=>{
    doPhysics();
    svg.selectAll('circle')
    .data(particles)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
  })
}


function doPhysics(){
  let reference = cats[0];
  for (let i = 0; i < nParticles; ++i) {
        let px = parseInt(particles[i].x / imageScale);
        let py = parseInt(particles[i].y / imageScale);
        if (px >= 0 && px < reference.width && py >= 0 && py < reference.height) {
          // get red color
          let v = reference.data[((imageWidth * py) + px) * 4];
          particles[i].rad = d3.scale.linear().domain([0, 1]).range([minRadius, maxRadius])(v/255.0);
        }
    }
  for (let i = 0; i < nParticles; ++i) {
    let p = particles[i];
    p.fx = p.fy = p.wt = 0;
    p.vx *= damping;
    p.vy *= damping;
  }

  // Particle -> particle interactions
  for (let i = 0; i < nParticles - 1; ++i) {
    let p = particles[i];
    for (let j = i + 1; j < nParticles; ++j) {
      let pj = particles[j];
      if (i === j || Math.abs(pj.x - p.x) > p.rad * minDistFactor ||
        Math.abs(pj.y - p.y) > p.rad * minDistFactor) {
        continue;
      }

      let dx = p.x - pj.x;
      let dy = p.y - pj.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      let maxDist = (p.rad + pj.rad);
      let diff = maxDist - distance;
      if (diff > 0) {
        let scale = diff / maxDist;
        scale = Math.pow(scale, 2);
        p.wt += scale;
        pj.wt += scale;
        scale = scale*kSpeed / distance;
        p.fx += dx * scale;
        p.fy += dy * scale;
        pj.fx -= dx * scale;
        pj.fy -= dy * scale;
      }
    }
  }

  for (let i = 0; i < nParticles; ++i) {
      let p = particles[i];

      // keep within edges
      let dx;
      let dy;
      let distance;
      let scale;
      let diff;
      let maxDist = p.rad;

      // left edge
      distance = dx = p.x - 0;
      dy = 0;
      diff = maxDist - distance;
      if (diff > 0) {
        scale = diff/maxDist;
        scale = scale*scale;
        p.wt += scale;
        scale = scale*kSpeed/distance;
        p.fx += dx*scale;
        p.fy += dy*scale;
      }
      // right edge
      dx = p.x - width;
      dy = 0;
      distance = -dx;
      diff = maxDist - distance;
      if (diff > 0) {
        scale = diff/maxDist;
        scale = scale*scale;
        p.wt += scale;
        scale = scale*kSpeed/distance;
        p.fx += dx*scale;
        p.fy += dy*scale;
      }
      // top edge
      distance = dy = p.y - 0;
      dx = 0;
      diff = maxDist - distance;
      if (diff > 0) {
        scale = diff/maxDist;
        scale = scale*scale;
        p.wt += scale;
        scale = scale*kSpeed/distance;
        p.fx += dx*scale;
        p.fy += dy*scale;
      }
      // bot edge
      dy = p.y - height;
      dx = 0;
      distance = -dy;
      diff = maxDist - distance;
      if (diff > 0) {
        scale = diff/maxDist;
        scale = scale*scale;
        p.wt += scale;
        scale = scale*kSpeed/distance;

        p.fx += dx*scale;
        p.fy += dy*scale;
      }
      if (p.wt > 0) {
        p.vx += p.fx/p.wt;
        p.vy += p.fy/p.wt;
      }
      p.x += p.vx;
      p.y += p.vy;
    }
}


let Particle = function(_x, _y) {
  return {
    vx: 0,
    vy: 0,
    x: _x,
    y: _y,
    rad: 1,
    wt: 0,
    fx: 0,
    fy: 0
  }
};
"use strict";

var _Math = Math;
var _random = _Math.random;
var atan2 = _Math.atan2;
var cos = _Math.cos;
var sin = _Math.sin;
var hypot = _Math.hypot;

var max = 200;
var canvas = document.createElement("canvas");
var $ = canvas.getContext('2d');
var body = document.body;
var particles = [];

body.style.backgroundColor = "black";
body.style.overflow = "hidden";
body.appendChild(canvas);

var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight;
var point = { x: width / 2, y: height / 2 };
var hue = 0;

function Particle() {};

Particle.prototype = {
    init: function init() {
        this.hue = hue;
        this.alpha = 0;
        this.size = this.random(1, 5);
        this.x = this.random(0, width);
        this.y = this.random(0, height);
        this.velocity = this.size * .5;
        this.changed = null;
        this.changedFrame = 0;
        this.maxChangedFrames = 50;
        return this;
    },
    draw: function draw() {
        $.strokeStyle = "hsla(" + this.hue + ", 100%, 50%, " + this.alpha + ")";
        $.beginPath();
        $.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        $.stroke();
        this.update();
    },
    update: function update() {
        if (this.changed) {
            this.alpha *= .92;
            this.size += 2;
            this.changedFrame++;
            if (this.changedFrame > this.maxChangedFrames) {
                this.reset();
            }
        } else if (this.distance(point.x, point.y) < 50) {
            this.changed = true;
        } else {
            var dx = point.x - this.x;
            var dy = point.y - this.y;
            var angle = atan2(dy, dx);

            this.alpha += .01;
            this.x += this.velocity * cos(angle);
            this.y += this.velocity * sin(angle);
            this.velocity += .02;
        }
    },
    reset: function reset() {
        this.init();
    },
    distance: function distance(x, y) {
        return hypot(x - this.x, y - this.y);
    },
    random: function random(min, max) {
        return _random() * (max - min) + min;
    }
};

function animate() {
    $.fillStyle = "rgba(0,0,0, .2)";
    $.fillRect(0, 0, width, height);
    particles.forEach(function (p) {
        p.draw();
    });
    hue += .3;
    window.requestAnimationFrame(animate);
}

function touches(e) {
    point.x = e.touches ? e.touches[0].clientX : e.clientX;
    point.y = e.touches ? e.touches[0].clientY : e.clientY;
}

function setup() {
    for (var i = 0; i < max; i++) {
        setTimeout(function () {
            var p = new Particle().init();
            particles.push(p);
        }, i * 10);
    }

    canvas.addEventListener("mousemove", touches);
    canvas.addEventListener("touchmove", touches);
    canvas.addEventListener("mouseleave", function () {
        point = { x: width / 2, y: height / 2 };
    });
    window.addEventListener("resize", function () {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        point = { x: width / 2, y: height / 2 };
    });
    animate();
}

setup();
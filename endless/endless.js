/**
 * ENDLESS / jQuery Plugin
 * A stunning slideshow with infinite zoom and parallax effect
 *
 * Copyright © 2017 - Thierry Thiers <webcoder31@gmail.com>
 *
 * This  software  is governed  by  the CeCILL-C  license under French  law  and
 * abiding  by the rules of distribution of free  software. You can  use, modify
 * and/or redistribute the software under the terms  of the  CeCILL-C license as
 * circulated by CEA, CNRS and INRIA at the following URL:
 *
 * http://www.cecill.info
 *
 * As a counterpart to the access to the source code  and rights to copy, modify
 * and redistribute  granted by  the  license, users are  provided  only with  a
 * limited  warranty and  the software's author,  the  holder  of  the  economic
 * rights, and the successive licensors have only limited liability.
 *
 * In this respect, the user's  attention is drawn to the risks  associated with
 * loading, using, modifying and/or  developing or reproducing  the software  by
 * the user in light of its specific status of free software, that may mean that
 * it is complicated to manipulate,  and that also  therefore means  that it  is
 * reserved  for  developers   and  experienced  professionals  having  in-depth
 * computer  knowledge. Users  are  therefore  encouraged to load  and  test the
 * software's suitability as  regards  their requirements in conditions enabling
 * the security of their systems and/or data to be  ensured and, more generally,
 * to use and operate it in the same conditions as regards security.
 *
 * The  fact  that you are  presently  reading  this  means  that you  have  had
 * knowledge of the CeCILL-C license and that you accept its terms.
 *
 * @author    Thierry Thiers <webcoder31@gmail.com>
 * @copyright 2017 - Thierry Thiers <webcoder31@gmail.com>
 * @license   http://www.cecill.info  CeCILL-C License
 * @version   v1.0.0
 */

/**
 * Endless class
 */
class Endless {

  constructor(element, customSettings) {

    // Plugin default settings.
    let defaultSettings = {

      // Images list (required)
      images: [],
      shuffle: true,

      // Basic parameters
      fxCycleDuration: 30,
      opacity: 100,
      grayscale: false,
      hue: 0,
      speed: 10,
      vpOffsetFactorX: 0,
      vpOffsetFactorY: 0,

      // Speed FX parameters
      speedFX: true,
      speedFXOffset: 1.20,
      speedFXGain: 0.70,
      speedFXDamping: 1.25,
      speedFXFrequency: 1,
      speedFXPhase: -1.45,

      // Parallax FX parameters
      parallaxFX: true,
      parallaxFXGainX: 0.55,
      parallaxFXFrequencyX: 3,
      parallaxFXPhaseX: -0.75,
      parallaxFXGainY: 0.45,
      parallaxFXFrequencyY: 4,
      parallaxFXPhaseY: 0.35,

      // Opacity FX parameters
      opacityFX: true,
      opacityFXFrequency: 6,

      // Hue FX parameters
      hueFX: true,
      hueFXFrequency: 6,

      // Hooks
      loaded: () => {},
      beforeAnimate: (time, clock) => {},
      afterAnimate: (time, clock, fxValues) => {},
    };

    // Create a canvas that fit the given element.
    this.canvas = $("<canvas></canvas>")[0];
    $(this.canvas).css({
      "left": 0,
      "top": 0,
      "width": "100%",
      "height": "100%",
      "margin": 0,
      "padding": 0,
      "opacity": 0
    });
    $(element).prepend(this.canvas);

    // Initialize instance members.
    this.layers = [];
    this.curLayerIndex = 0;
    this.nextLayerIndex = 0;
    this.lastFrameTimestamp = 0;
    this.isLoaded = false;
    this.isStarted = false;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.clock = -Math.PI;
    this.drawFrameReqId = null;
    this.context = this.canvas.getContext('2d');

    // Merge user settings with default settings.
    this.settings = $.extend({}, defaultSettings, customSettings);
    let settings = this.settings;

    // Convert all non function settings to functions.
    $.each(this.settings, (param, value) => {
      if (!$.isFunction(value)) {
        settings[param] = () => value;
      }
    });

    // Shuffle the mages of the plugin instance.
    if (this.settings.shuffle()) {
      this.settings.images().sort(() => {
        return .5 - Math.random();
      });
    }

    // Load an image then blur its edges to trasparent color..
    const createLayer = (src, canvas) => {
      const layer = {};
      layer.isReady = false;
      layer.canvas = canvas;
      layer.image = new Image();
      layer.image.crossOrigin = "Anonymous";
      layer.image.src = src;
      layer.image.onload = () => {
        if (layer.isReady) return;
        let imageCanvas = document.createElement('canvas');
        imageCanvas.width = layer.image.width;
        imageCanvas.height = layer.image.height;
        let imageCtx = imageCanvas.getContext("2d");
        imageCtx.drawImage(layer.image, 0, 0);
        let isLandscape = layer.image.width > layer.image.height;
        let scaleFactor = isLandscape
          ? layer.image.height / layer.image.width
          : layer.image.width / layer.image.height;
        let radius = Math.max(layer.image.width, layer.image.height) / 2;
        let maskCanvas = document.createElement('canvas');
        maskCanvas.width = 2 * radius;
        maskCanvas.height = 2 * radius;
        let maskCtx = maskCanvas.getContext('2d');
        let radialGradient = maskCtx.createRadialGradient(radius, radius, 0, radius, radius, radius);
        radialGradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        radialGradient.addColorStop(0.2, 'rgba(0, 0, 0, 1)');
        radialGradient.addColorStop(0.95, 'rgba(0, 0, 0, 0)');
        maskCtx.fillStyle = radialGradient;
        maskCtx.setTransform(isLandscape ? 1 : scaleFactor, 0, 0, isLandscape ? scaleFactor : 1, 0, 0);
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        imageCtx.globalCompositeOperation = "destination-in";
        imageCtx.drawImage(maskCanvas, 0, 0);
        layer.image.src = imageCanvas.toDataURL();
        layer.isReady = true;
        // When all images are oladed and processed...
        setTimeout(() => {
          if (!this.isLoaded && this.layers.every(l => l.isReady)) {
            this.isLoaded = true;
            this.settings.loaded();
            // Start slideshow.
            $(canvas).animate({ 'opacity': 1 }, 5000);
            this.start();
            // Listen to "rezise" events.
            window.addEventListener('resize', this.onWindowResize);
            this.onWindowResize();
          }
        }, 0);
      };
      return layer;
    };

    // Load and prepare images.
    this.settings.images().map(src => {
      this.layers.push(createLayer(src, this.canvas, this));
    });
  }

  // Render an animation step.
  draw(curFrameTimestamp) {

    // Compute elapsed time since the previous step of the animation.
    let delta = curFrameTimestamp - this.lastFrameTimestamp;

    // If animation is stopped, exit.
    if (this.nextLayerIndex === false || !delta) {
      return;
    }

    // Request an animation frame to draw the next step.
    this.drawFrameReqId = requestAnimationFrame((frameTimestamp) => this.draw(frameTimestamp));

    // Compute elased time since the animation has started.
    if (this.startTime == 0) {
      this.startTime = curFrameTimestamp;
    }
    else {
      this.elapsedTime = curFrameTimestamp - this.startTime;
    }

    // Store current frame timestamp bacause we wiil need it at next step.
    this.lastFrameTimestamp = curFrameTimestamp;

    // Utility function that sanitize user settings values.
    let sanitize = (v, min = 0, max = 10, round = false) => {
      let res = Math.max(Math.min(v, max), min);
      return round ? Math.floor(res) : res;
    };

    // Convert elapsed time to a cyclic value comprised in the range -π to +π.
    this.clock += delta * 2 * Math.PI / (1000 * sanitize(this.settings.fxCycleDuration(this.elapsedTime, this.clock), 1, 60));
    if (this.clock >= Math.PI) {
      this.clock = Math.acos(Math.cos(this.clock)) - 2 * Math.PI;
    }

    // Execute beforeAnimate hook.
    this.settings.beforeAnimate(this.elapsedTime, this.clock);

    // Read speed setting.
    let SN = sanitize(this.settings.speed(this.elapsedTime, this.clock), -100, 100, true);
    let S = SN;

    // Apply speed FX if required.
    if (this.settings.speedFX(this.elapsedTime, this.clock)) {
      let SO = sanitize(this.settings.speedFXOffset(this.elapsedTime, this.clock), -2, 2);
      let SG = sanitize(this.settings.speedFXGain(this.elapsedTime, this.clock), 0, 1);
      let SD = sanitize(this.settings.speedFXDamping(this.elapsedTime, this.clock), -2, 2);
      let SF = sanitize(this.settings.speedFXFrequency(this.elapsedTime, this.clock), 1, 10, true);
      let SP = sanitize(this.settings.speedFXPhase(this.elapsedTime, this.clock), -Math.PI, Math.PI);

      // Compute varigated speed.
      S = SN * (SO + SG * Math.sin(this.clock * SF + SP + SD * Math.cos(this.clock * 2 * SF)));
    }

    // Compute the deltas of the moving of the images on the Z axis.
    this.nextLayerIndex = this.curLayerIndex + 10;

    let deltaZ = (S / 100000) * delta * Math.abs(this.nextLayerIndex - this.curLayerIndex);
    if (this.curLayerIndex > this.nextLayerIndex) {
      this.curLayerIndex -= deltaZ;
    }
    else {
      this.curLayerIndex += deltaZ;
    }

    if (this.curLayerIndex < 0) {
      this.curLayerIndex += this.layers.length;
      this.nextLayerIndex += this.layers.length;
    }

    if (this.curLayerIndex > this.layers.length) {
      this.curLayerIndex -= this.layers.length;
      this.nextLayerIndex -= this.layers.length;
    }

    // Get vanishing point offset factors.
    let vpOffsetFactorX = sanitize(this.settings.vpOffsetFactorX(this.elapsedTime, this.clock), -100, 100, true) / 100;
    let vpOffsetFactorY = sanitize(this.settings.vpOffsetFactorY(this.elapsedTime, this.clock), -100, 100, true) / 100;

    // Get and initialize parallax FX parameters.
    let parallaxFXOn = false;
    let parallaxOffsetX = 0;
    let parallaxOffsetY = 0;
    let shiftFactorX = 0;
    let shiftFactorY = 0;

    if (this.settings.parallaxFX(this.elapsedTime, this.clock)) {
      parallaxFXOn = true;

      let PGX = sanitize(this.settings.parallaxFXGainX(this.elapsedTime, this.clock), 0, 1);
      let PFX = sanitize(this.settings.parallaxFXFrequencyX(this.elapsedTime, this.clock), 1, 10, true);
      let PPX = sanitize(this.settings.parallaxFXPhaseX(this.elapsedTime, this.clock), -Math.PI, Math.PI);
      let PGY = sanitize(this.settings.parallaxFXGainY(this.elapsedTime, this.clock), 0, 1);
      let PFY = sanitize(this.settings.parallaxFXFrequencyY(this.elapsedTime, this.clock), 1, 10, true);
      let PPY = sanitize(this.settings.parallaxFXPhaseY(this.elapsedTime, this.clock), -Math.PI, Math.PI);

      shiftFactorX = PGX * Math.sin(this.clock * PFX + PPX);
      shiftFactorY = PGY * Math.cos(this.clock * PFY + PPY);

      vpOffsetFactorX = Math.abs(vpOffsetFactorX) * shiftFactorX;
      vpOffsetFactorY = Math.abs(vpOffsetFactorY) * shiftFactorY;
    }

    // Get opacity parameter Apply opacity FX on canvas if required.
    let ON = sanitize(this.settings.opacity(this.elapsedTime, this.clock), 0, 100, true) / 100;
    let O = ON;
    if (this.settings.opacityFX(this.elapsedTime, this.clock)) {
      let OF = sanitize(this.settings.opacityFXFrequency(this.elapsedTime, this.clock), 1, 10, true);
      O = 0.05 + 0.3 * ON * Math.abs(S / SN) * (0.5 + 0.5 * Math.sin(this.clock * OF + (Math.PI / 2) * (S / SN)));
    }

    // Compute the largest scale of the zoom effect to apply on images.
    let scale = (Math.pow(2, (this.curLayerIndex % 1))) * 4;

    // Render the images that compose this animation step.
    let max = Math.min(10, this.layers.length);

    for (let i = 0; i < max; i++) {
      let index = Math.floor(this.curLayerIndex) + i;
      let curLayer = this.layers[index % this.layers.length];

      if (curLayer.isReady) {
        let curLayerWidth = curLayer.image.width * scale;
        let curLayerHeight = curLayer.image.height * scale;

        // Apply parallax FX on the current image if required.
        if (parallaxFXOn) {
          parallaxOffsetX = shiftFactorX * curLayerWidth / 2;
          parallaxOffsetY = shiftFactorY * curLayerHeight / 2;
        }

        // Set the opacity of the current image and draw it on the canvas.
        this.context.save();
        this.context.globalAlpha = O * (0.5 + 0.5 * Math.cos(i * Math.PI / max)) / (scale * 0.5);
        this.context.drawImage(
          curLayer.image,
          this.centerX + this.centerX * vpOffsetFactorX - (curLayerWidth / 2) + parallaxOffsetX,
          this.centerY - this.centerY * vpOffsetFactorY - (curLayerHeight / 2) + parallaxOffsetY,
          curLayerWidth,
          curLayerHeight
        );
        this.context.restore();

        // Decrease the scale of the zoom effect.
        scale /= 2;
      }
    }

    // Get hue parameter and dpply hue FX if required.
    let H = sanitize(this.settings.hue(this.elapsedTime, this.clock), 0, 360, true);

    if (this.settings.hueFX(this.elapsedTime, this.clock)) {
      let HF = sanitize(this.settings.hueFXFrequency(this.elapsedTime, this.clock), 1, 10, true);
      H = Math.abs(Math.floor(((0.75 + S / 10) * this.clock * HF * 180 / Math.PI) % 360));
    }

    let colorFilter = 'hue-rotate(' + H + 'deg)';

    if (this.settings.grayscale(this.elapsedTime, this.clock)) {
      // Since hue has no effect on grayscale images, we use brightness filter instead.
      let delta = Math.sin(H * Math.PI / 180);
      colorFilter = 'grayscale(1) brightness(' + (1.25 + 0.25 * delta) + ') contrast(' + (1.25 + 0.25 * delta) + ')';
    }

    $(this.canvas).css('-webkit-filter', colorFilter);
    $(this.canvas).css('-moz-filter', colorFilter);
    $(this.canvas).css('-ms-filter', colorFilter);
    $(this.canvas).css('-o-filter', colorFilter);
    $(this.canvas).css('filter', colorFilter);

    // Execute afterAnimate hook.
    this.settings.afterAnimate(this.elapsedTime, this.clock, {
      speed: S,
      parallaxOffsetX: parallaxOffsetX,
      parallaxOffsetY: parallaxOffsetY,
      opacity: O,
      grayscale: H / 360,
      hue: H,
    });
  }


  // Start command.
  start() {
    this.nextLayerIndex = this.curLayerIndex + 10;
    this.drawFrameReqId = requestAnimationFrame((frameTimestamp) => this.draw(frameTimestamp));
  }


  // Stop command.
  stop() {
    this.startTime = 0;
    this.nextLayerIndex = false;
    cancelAnimationFrame(this.drawFrameReqId);
  }


  // On resize, adjust canvas size to fit its parent container.
  onWindowResize(event) {
    let canvasWidth = $(this.canvas).parent().width();
    let canvasHeight = $(this.canvas).parent().height();
    this.centerX = canvasWidth / 2;
    this.centerY = canvasHeight / 2;
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
  }

}

(function($, window, document) {

  // Plugin name.
  let pluginName = 'endless';

  // Create plugin instances for each selected DOM elements.
  $.fn[pluginName] = function (options) {
    let args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Endless(this, options));
      }
      // else if (Plugin.prototype[options]) {
      else {
        $.data(this, 'plugin_' + pluginName)[options].apply(
          $.data(this, 'plugin_' + pluginName), args
        );
      }
    });
  }

})(jQuery, window, document);

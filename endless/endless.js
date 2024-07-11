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

(function ($, window, document, undefined) {

    // Plugin name.
    var pluginName = 'endless';

    // Plugin default settings.
    var defaults = {

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
        loaded: function() {},
        beforeAnimate: function(time, clock) {},
        afterAnimate: function(time, clock, fxValues) {}
    };


    // Create a plugin instance for the given DOM element.
    function Plugin(element, options)
    {
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

        // Merge user options with plugin defalt settings
        this.settings = $.extend({}, defaults, options);
        var settings = this.settings;

        // Convert all non function settings to functions.
        $.each(this.settings, function(option, value)
        {
            if(! $.isFunction(value)) {
                settings[option] = function() {
                    return value;
                };
            }
        });

        // Load images used by the plugin instance.
        var plugin = this;
        this.layer = function(src, canvas)
        {
            this.canvas = canvas;
            this.isLoaded = false;
            this.image = new Image();
            this.image.src = src;
            this.image.onload = function()
            {
                this.isLoaded = true;
                setTimeout(function() {
                    if (plugin.layers.every(function(layer) {return layer.isLoaded;}))
                    {
                        $(canvas).animate({'opacity': 1}, 5000);
                        plugin.settings.loaded();
                    }
                }, 0);
            }.bind(this);
        };

        // Bind plugin instance (this) to the functions of the plugin prototype.
        this.draw = this.draw.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);

        // Construct plugin instance from its prototype.
        this.construct();
    }


    // Plugin prototype (act as a POO class).
    Plugin.prototype =
    {
        // Plugin instance constructor.
        construct: function ()
        {
            // define some members.
            this.drawFrameReqId = null;
            this.context = this.canvas.getContext('2d');

            // Load images of the plugin instance.
            this.settings.images().map(function(src)
            {
                this.layers.push(new this.layer(src, this.canvas));
            }.bind(this));

            // Shuffle the mages of the plugin instance.
            if(this.settings.shuffle())
            {
                this.layers.sort(function()
                {
                    return .5 - Math.random();
                });
            }

            // ???
            this.drawFrameReqId = requestAnimationFrame(this.draw);

            // Listen to "rezise" events.
            window.addEventListener('resize', this.onWindowResize);
            this.onWindowResize();
        },


        // Render an animation step.
        draw: function(curFrameTimestamp)
        {
            // Compute elapsed time since the previous step of the animation.
            var delta = curFrameTimestamp - this.lastFrameTimestamp;

            // If animation is stopped, exit.
            if (this.nextLayerIndex === false || ! delta)
            {
                return;
            }

            // Request an animation frame to draw the next step.
            this.drawFrameReqId = requestAnimationFrame(this.draw);

            // Compute elased time since the animation has started.
            if(this.startTime == 0)
            {
                this.startTime = curFrameTimestamp;
            }
            else
            {
                this.elapsedTime = curFrameTimestamp - this.startTime;
            }

            // Store current frame timestamp bacause we wiil need it at next step.
            this.lastFrameTimestamp = curFrameTimestamp;

            // Utility function that sanitize user settings values.
            var sanitize = function(v, min = 0, max = 10, round = false)
            {
                var res = Math.max(Math.min(v, max), min);
                return round ? Math.floor(res) : res;
            };

            // Convert elapsed time to a cyclic value comprised in the range -π to +π.
            this.clock += delta * 2 * Math.PI / (1000 * sanitize(this.settings.fxCycleDuration(this.elapsedTime, this.clock), 1, 60));
            if (this.clock >= Math.PI)
            {
                this.clock = Math.acos(Math.cos(this.clock)) - 2 * Math.PI;
            }

            // Execute beforeAnimate hook.
            this.settings.beforeAnimate(this.elapsedTime, this.clock);

            // Read speed setting.
            var SN = sanitize(this.settings.speed(this.elapsedTime, this.clock), -100, 100, true);
            var S = SN;

            // Apply speed FX if required.
            if (this.settings.speedFX(this.elapsedTime, this.clock))
            {
                var SO = sanitize(this.settings.speedFXOffset(this.elapsedTime, this.clock), -2, 2);
                var SG = sanitize(this.settings.speedFXGain(this.elapsedTime, this.clock), 0, 1);
                var SD = sanitize(this.settings.speedFXDamping(this.elapsedTime, this.clock), -2, 2);
                var SF = sanitize(this.settings.speedFXFrequency(this.elapsedTime, this.clock), 1, 10, true);
                var SP = sanitize(this.settings.speedFXPhase(this.elapsedTime, this.clock), -Math.PI, Math.PI);

                // Compute varigated speed.
                S = SN * (SO + SG * Math.sin(this.clock * SF + SP + SD * Math.cos(this.clock * 2 * SF)));
            }

            // Compute the deltas of the moving of the images on the Z axis.
            this.nextLayerIndex = this.curLayerIndex + 10;

            var deltaZ = (S / 100000) * delta * Math.abs(this.nextLayerIndex - this.curLayerIndex);
            if (this.curLayerIndex > this.nextLayerIndex)
            {
                this.curLayerIndex -= deltaZ;
            }
            else
            {
                this.curLayerIndex += deltaZ;
            }

            if (this.curLayerIndex < 0)
            {
                this.curLayerIndex += this.layers.length;
                this.nextLayerIndex += this.layers.length;
            }

            if (this.curLayerIndex > this.layers.length)
            {
                this.curLayerIndex -= this.layers.length;
                this.nextLayerIndex -= this.layers.length;
            }

            // Get vanishing point offset factors.
            var vpOffsetFactorX = sanitize(this.settings.vpOffsetFactorX(this.elapsedTime, this.clock), -100, 100, true) / 100;
            var vpOffsetFactorY = sanitize(this.settings.vpOffsetFactorY(this.elapsedTime, this.clock), -100, 100, true) / 100;

            // Get and initialize parallax FX parameters.
            var parallaxFXOn = false;
            var parallaxOffsetX = 0;
            var parallaxOffsetY = 0;

            if (this.settings.parallaxFX(this.elapsedTime, this.clock))
            {
                parallaxFXOn = true;

                var PGX = sanitize(this.settings.parallaxFXGainX(this.elapsedTime, this.clock), 0, 1);
                var PFX = sanitize(this.settings.parallaxFXFrequencyX(this.elapsedTime, this.clock), 1, 10, true);
                var PPX = sanitize(this.settings.parallaxFXPhaseX(this.elapsedTime, this.clock), -Math.PI, Math.PI);
                var PGY = sanitize(this.settings.parallaxFXGainY(this.elapsedTime, this.clock), 0, 1);
                var PFY = sanitize(this.settings.parallaxFXFrequencyY(this.elapsedTime, this.clock), 1, 10, true);
                var PPY = sanitize(this.settings.parallaxFXPhaseY(this.elapsedTime, this.clock), -Math.PI, Math.PI);

                var shiftFactorX = PGX * Math.sin(this.clock * PFX + PPX);
                var shiftFactorY = PGY * Math.cos(this.clock * PFY + PPY);

                vpOffsetFactorX = Math.abs(vpOffsetFactorX) * shiftFactorX;
                vpOffsetFactorY = Math.abs(vpOffsetFactorY) * shiftFactorY;
            }

            // Get opacity parameter Apply opacity FX on canvas if required.
            var ON = sanitize(this.settings.opacity(this.elapsedTime, this.clock), 0, 100, true) / 100;
            var O = ON;
            if (this.settings.opacityFX(this.elapsedTime, this.clock))
            {
                var OF = sanitize(this.settings.opacityFXFrequency(this.elapsedTime, this.clock), 1, 10, true);
                O = 0.05 + 0.3 * ON * Math.abs(S / SN) * (0.5 + 0.5 * Math.sin(this.clock * OF + (Math.PI / 2) * (S / SN)));
            }

            // Compute the largest scale of the zoom effect to apply on images.
            var scale = (Math.pow(2, (this.curLayerIndex % 1))) * 4;

            // Render the images that compose this animation step.
            var max = Math.min(10, this.layers.length);

            for (var i = 0; i < max; i++)
            {
                var index = Math.floor(this.curLayerIndex) + i;
                var curLayer = this.layers[index % this.layers.length];

                if (curLayer.isLoaded)
                {
                    var curLayerWidth = curLayer.image.width * scale;
                    var curLayerHeight = curLayer.image.height * scale;

                    // Apply parallax FX on the current image if required.
                    if (parallaxFXOn)
                    {
                        parallaxOffsetX = shiftFactorX * curLayerWidth / 2;
                        parallaxOffsetY = shiftFactorY * curLayerHeight / 2;
                    }

                    // Set the opacity of the current image and draw it on the canvas.
                    this.context.save();
                    this.context.globalAlpha =  O * (0.5 + 0.5 * Math.cos(i * Math.PI / max)) / (scale * 0.5);
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
            var H = sanitize(this.settings.hue(this.elapsedTime, this.clock), 0, 360, true);

            if (this.settings.hueFX(this.elapsedTime, this.clock))
            {
                var HF = sanitize(this.settings.hueFXFrequency(this.elapsedTime, this.clock), 1, 10, true);
                H = Math.abs(Math.floor(((0.75 + S / 10) * this.clock * HF * 180 / Math.PI) % 360));
            }

            var colorFilter = 'hue-rotate(' + H + 'deg)';

            if (this.settings.grayscale(this.elapsedTime, this.clock))
            {
                // Since hue has no effect on grayscale images, we use brightness filter instead.
                var delta = Math.sin(H * Math.PI / 180);
                colorFilter = 'grayscale(1) brightness(' + (1.25 + 0.25 *  delta) + ') contrast(' + (1.25 + 0.25 * delta) + ')';
            }

            $(this.canvas).css('-webkit-filter', colorFilter);
            $(this.canvas).css('-moz-filter', colorFilter);
            $(this.canvas).css('-ms-filter', colorFilter);
            $(this.canvas).css('-o-filter', colorFilter);
            $(this.canvas).css('filter', colorFilter);

            // Execute afterAnimate hook.
            this.settings.afterAnimate(this.elapsedTime, this.clock, {
                    'speed': S,
                    'parallaxOffsetX': parallaxOffsetX,
                    'parallaxOffsetY': parallaxOffsetY,
                    'opacity': O,
                    'grayscale': H / 360,
                    'hue': H
                });
        },


        // Start command.
        start: function()
        {
            this.nextLayerIndex = this.curLayerIndex + 10;
            this.drawFrameReqId = requestAnimationFrame(this.draw);
        },


        // Stop command.
        stop: function()
        {
            this.startTime = 0;
            this.nextLayerIndex = false;
            cancelAnimationFrame(this.drawFrameReqId);
        },


        // On resize, adjust canvas size to fit its parent container.
        onWindowResize: function (event)
        {
            var canvasWidth = $(this.canvas).parent().width();
            var canvasHeight = $(this.canvas).parent().height();
            this.centerX = canvasWidth / 2;
            this.centerY = canvasHeight / 2;
            this.canvas.width = canvasWidth;
            this.canvas.height = canvasHeight;
        }
    };


    // Create plugin instances for each selected DOM elements.
    $.fn[pluginName] = function(options)
    {
        var args = Array.prototype.slice.call(arguments, 1);

        return this.each(function()
        {
            if (!$.data(this, 'plugin_' + pluginName))
            {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
            else if (Plugin.prototype[options])
            {
                $.data(this, 'plugin_' + pluginName)[options].apply(
                    $.data(this, 'plugin_' + pluginName), args
                );
            }
        });
    }

})(jQuery, window, document);

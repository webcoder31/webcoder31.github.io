// Extends jQuery functions with isOnScreen() that indicates wether an element
// is currently visible in the viewport or not.
$.fn.isOnScreen = function () {

  let win = $(window);

  let viewport = {
    top: win.scrollTop(),
    left: win.scrollLeft()
  };
  viewport.right = viewport.left + win.width();
  viewport.bottom = viewport.top + win.height();

  let bounds = this.offset();
  bounds.right = bounds.left + this.outerWidth();
  bounds.bottom = bounds.top + this.outerHeight();

  return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
};

// Rezize banner according to various situations.
const resizeBanner = fullscreen => {

  if (fullscreen === undefined) {
    fullscreen = false;
  }

  let offset;
  let newHeight;

  let scrollTop = $(window).scrollTop();

  let navbarHeight = $('#section-header .uk-navbar').outerHeight();
  let bannerHeight = $('#banner .banner-head div').outerHeight();
  let tweakersHeight = $('#section-tweakers > .uk-section').outerHeight();

  let winHeight = $(window).height()
  let maxHeight = Math.round(winHeight / 3);
  let minHeight = Math.round(maxHeight / 2);

  if (minHeight < bannerHeight) minHeight = bannerHeight;

  // Determine new banner height and corresponding height for the sticky
  // placeholder.
  if (fullscreen) {
    // Make the banner full screen (navbar remains visible).
    newHeight = winHeight - navbarHeight;
    stickyHeight = 0;
  }
  else if (scrollTop <= 0 && !$('#banner').hasClass('tweaked')) {
    // Make the banner 1/3 of window height when we're at the top of the
    // document.
    newHeight = maxHeight;
    stickyHeight = 0;
  }
  else if ($('#banner').hasClass('tweaked')) {
    // Make the banner occupying all the space available between the navbar
    // and the tweaker panel when this one revealed.
    newHeight = winHeight - navbarHeight - tweakersHeight;
    stickyHeight = 0;
  }
  else if (scrollTop > navbarHeight + minHeight) {
    // Make the banner height 1/6 of window height when document is scrolled
    // down to 1/6 of window height plus the navbar height.
    newHeight = minHeight;
    stickyHeight = newHeight;
  }
  else {
    // Adjust banner height to intermediary height when document is scrolled
    // between top and 1/3 of window height.
    newHeight = maxHeight - scrollTop;
    stickyHeight = scrollTop;
  }

  if (newHeight != $('#banner').height()) {
    // Banner new height is different than current one.
    // Animate banner height to reach the new one and update endless plugin
    // size and the top location of the tweakers panel accordingly.
    $('#banner').stop().animate(
      {
        'max-height': newHeight + "px",
        'height': newHeight + "px"
      },
      {
        duration: 500,
        easing: 'linear',
        step: () => {
          if (newHeight != $('#banner').height()) {
            $('#banner').endless('onWindowResize');
            $('#section-tweakers').css('top', ($('#banner').height() + navbarHeight) + 'px');
          }
        },
        done: () => {
          resizeStickyPlaceholder(stickyHeight);
          $('#banner').endless('onWindowResize');
          $('#section-tweakers').css('top', ($('#banner').height() + navbarHeight) + 'px');
        }
      }
    );

    // Animate font size of banner text content according to new banner height.
    if (!fullscreen) {
      let ratio = window.innerWidth < 640 ? 0.8 : 1.2;
      let fontSize = (1.625 * ratio * newHeight + 0.5 * newHeight / ratio) / maxHeight;
      $('#banner h1').stop().animate(
        {
          'font-size': fontSize + "rem"
        },
        {
          duration: 500,
          easing: 'linear',
        }
      );
    }
  }
  else {
    // Banner new height is same as current one. Maybe just banner width has changed.
    // Simply update endless plugin size and the top location of the
    // tweakers panel accordingly.
    $('#banner').endless('onWindowResize');
    $('#section-tweakers').css('top', ($('#banner').height() + navbarHeight) + 'px');
  }
};


// Update sticky header placeholder height.
const resizeStickyPlaceholder = newHeight => {
  let stickyPlceHolder = $('#sticky-header-wrapper .uk-sticky-placeholder');

  stickyPlceHolder.stop().animate(
    {
      'height': stickyPlceHolder.prev().outerHeight() + newHeight + "px"
    },
    {
      duration: 500,
      easing: 'linear'
    }
  );
};


// Initialize graphs and tweakers.
const initFXConfigurators = (options = {}) => {
  let defaults = {

    // Basic parameters
    fxCycleDuration: 45,
    opacity: 100,
    grayscale: false,
    hue: 180,
    speed: 6,
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
    opacityFX: false,
    opacityFXFrequency: 6,

    // Hue FX parameters
    hueFX: true,
    hueFXFrequency: 6
  };

  let settings = $.extend({}, defaults, options);

  // Tweaker class.
  class Tweaker {
    constructor() {
      this.board = null;
      this.sliders = {};
    }
  }

  // Graph class.
  class Graph {
    constructor() {
      this.board = null;
      this.boundingbox = null;
      this.gliders = {};
      this.moveGliders = t => {};
    }
  }

  // Configurator class.
  class Configurator {
    constructor() {
      this.tweaker = new Tweaker();
      this.graph = new Graph();
    }
  }


  // Override JSXGraph default styles.
  let textColor = $('html').css("color");

  JXG.Options = JXG.merge(
    JXG.Options,
    {
      axis: {
        strokeColor: textColor,
        highlight: false,
        ticks: {
          strokeColor: textColor,
          label: {
            strokeColor: textColor,
            highlight: false
          },
        },
        withLabel: true,
        label: {
          strokeColor: '#fff',
          highlight: false,
        },
      },
      board: {
        keepAspectRatio: false,
        showCopyright: false,
        showNavigation: false,
        pan: {
          enabled: false
        },
      },
      checkbox: {
        strokeColor: textColor,
        highlightStrokeColor: textColor,
        highlightStrokeOpacity: 1,
        highlight: 'false',
        withLabel: true,
        label: {
          strokeColor: textColor,
          highlight: false,
        },
      },
      circle: {
        strokeColor: '#D6DF22',
        highlight: 'false',
        strokeWidth: 1,
        fixed: true,
      },
      curve: {
        strokeColor: '#D6DF22',
        highlight: 'false',
        strokeWidth: 1,
      },
      navbar: {
        strokeColor: '#D6DF22',
        fillColor: 'transparent',
        highlightFillColor: '#969c1a',
        padding: '2px',
        position: 'absolute',
        fontSize: '12px',
        cursor: 'pointer',
        zIndex: '100',
        right: '5px',
        bottom: '5px',
      },
      point: {
        size: 3,
        withLabel: false,
        strokeColor: '#D6DF22',
        highlightStrokeColor: '#D6DF22',
        fillColor: '#D6DF22',
        highlightFillColor: '#D6DF22',
      },
      rect: {
        fixed: true,
      },
      slider: {
        size: 4,
        strokeColor: '#D6DF22',
        highlightStrokeColor: '#D6DF22',
        highlightFillColor: '#D6DF22',
        withTicks: false,
        baseline: {
          strokeWidth: 1,
          dash: 1,
          strokeColor: '#969c1a',
          highlight: false,
          visible: true,
        },
        highline: {
          strokeWidth: 1,
          strokeColor: '#D6DF22',
          highlight: false,
          visible: true,
        },
        label: {
          offset: [40, 0],
          strokeColor: textColor,
          highlight: false
        }
      },
      text: {
        strokeColor: textColor,
        cssDefaultStyle: 'font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;',
        highlightCssDefaultStyle: 'font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;',
        highlight: false,
        fixed: true
      }
    }
  );

  const arePointsVisualyClose = (point, nextPoint) => {
    let coords = point.coords.scrCoords;
    let nextCoords = nextPoint.coords.scrCoords;
    let r = 1;
    return (Math.abs(Math.abs(coords[1]) - Math.abs(nextCoords[1])) > r) ||
      (Math.abs(Math.abs(coords[2]) - Math.abs(nextCoords[2])) > r);
  };

  let i;

  // Basic options configurator.
  let opts = new Configurator();
  i = 1;

  opts.tweaker.board = JXG.JSXGraph.initBoard(
    'options-tweaker',
    {
      boundingbox: [-0.5, 0.5, 20.5, -6.5],
      axis: false,
      keepAspectRatio: false,
      showCopyright: false,
      showNavigation: false,
    }
  );

  opts.tweaker.sliders.fxCycleDuration = opts.tweaker.board.create(
    'slider',
    [[0, --i], [8, i], [1, settings.fxCycleDuration, 60]],
    {
      name: 'fxCycleDuration',
      snapWidth: 1,
    }
  );

  opts.tweaker.sliders.vpOffsetFactorX = opts.tweaker.board.create(
    'slider',
    [[0, --i], [8, i], [-100, settings.vpOffsetFactorX, 100]],
    {
      name: 'vpOffsetFactorX',
      snapWidth: 1,
    }
  );

  opts.tweaker.sliders.vpOffsetFactorY = opts.tweaker.board.create(
    'slider',
    [[0, --i], [8, i], [-100, settings.vpOffsetFactorY, 100]],
    {
      name: 'vpOffsetFactorY',
      snapWidth: 1,
    }
  );

  opts.graph.boundingBox = [-3.5, 3.5, 3.5, -3.5];

  opts.graph.board = JXG.JSXGraph.initBoard(
    'options-graph',
    {
      boundingbox: opts.graph.boundingBox,
      axis: false,
      keepAspectRatio: false,
      showCopyright: false,
      strokeWidth: 0,
    }
  );

  opts.tweaker.board.addChild(opts.graph.board);


  // Speed FX configurator.
  let sfx = new Configurator();
  i = 1;

  sfx.tweaker.board = JXG.JSXGraph.initBoard(
    'speedfx-tweaker',
    {
      boundingbox: [-0.5, 0.5, 20.5, -6.5],
      axis: false,
      keepAspectRatio: false,
      showCopyright: false,
      showNavigation: false,
    }
  );

  sfx.tweaker.sliders.speed = sfx.tweaker.board.create(
    'slider',
    [[0, --i], [8, i], [-100, settings.speed, 100]],
    {
      name: 'speed (ns)',
      snapWidth: 1,
    }
  );

  sfx.tweaker.sliders.speedFX = sfx.tweaker.board.create(
    'checkbox',
    [0, --i, 'speedFX'],
  );
  sfx.tweaker.sliders.speedFX.rendNodeCheckbox.checked = settings.speedFX;

  sfx.tweaker.sliders.speedFXOffset = sfx.tweaker.board.create(
    'slider',
    [[0, --i], [8, i], [-2, settings.speedFXOffset, 2]],
    {
      name: 'speedFXOffset',
    }
  );

  sfx.tweaker.sliders.speedFXGain = sfx.tweaker.board.create(
    'slider',
    [[0, --i], [8, i], [0, settings.speedFXGain, 1]],
    {
      name: 'speedFXGain',
    }
  );

  sfx.tweaker.sliders.speedFXDamping = sfx.tweaker.board.create(
    'slider',
    [[0, --i], [8, i], [-2, settings.speedFXDamping, 2]],
    {
      name: 'speedFXDamping',
    }
  );

  sfx.tweaker.sliders.speedFXFrequency = sfx.tweaker.board.create(
    'slider',
    [[0, --i], [8, i], [0, settings.speedFXFrequency, 10]],
    {
      name: 'speedFXFrequency',
      snapWidth: 1,
    }
  );

  sfx.tweaker.sliders.speedFXPhase = sfx.tweaker.board.create(
    'slider',
    [[0, --i], [8, i], [-Math.PI, settings.speedFXPhase, Math.PI]],
    {
      name: 'speedFXPhase',
    }
  );


  sfx.graph.boundingBox = [-3.5, 3.5, 3.5, -3.5];

  sfx.graph.board = JXG.JSXGraph.initBoard(
    'speedfx-graph',
    {
      boundingbox: sfx.graph.boundingBox,
      axis: false,
      keepAspectRatio: false,
      showCopyright: false,
      strokeWidth: 0,
    }
  );

  sfx.graph.board.create(
    'axis',
    [[0, 0], [1, 0]],
    {
      name: 't',
      label: {
        position: 'rt',
        offset: [0, 15],
      },
      ticks: {
        scale: Math.PI,
        scaleSymbol: 'π',
      }
    }
  );

  sfx.graph.board.create(
    'axis',
    [[0, 0], [0, 1]],
    {
      name: 'Speed',
      label: {
        position: 'rt',
        offset: [10, 5],
      },
      ticks: {
        scaleSymbol: 'ns',
      },
    }
  );

  sfx.tweaker.board.addChild(sfx.graph.board);
  opts.tweaker.board.addChild(sfx.graph.board);

  sfx.graph.board.create(
    'functiongraph',
    [
      t => {
        let sliders = sfx.tweaker.sliders;
        return (sliders.speed.Value() / Math.abs(sliders.speed.Value())) * (sliders.speedFXOffset.Value() + sliders.speedFXGain.Value() * Math.sin(t * sliders.speedFXFrequency.Value() + sliders.speedFXPhase.Value() + sliders.speedFXDamping.Value() * Math.cos(t * 2 * sliders.speedFXFrequency.Value())));
      }
    ],
    {
      highlight: false,
      strokeColor: '#4e501c',
      highlightStrokeColor: '#4e501c',
    }
  );

  sfx.graph.board.create(
    'functiongraph',
    [
      t => {
        let sliders = sfx.tweaker.sliders;
        return sliders.speed.Value() / Math.abs(sliders.speed.Value());
      }
    ],
    {
      strokeColor: textColor,
      dash: 2,
      highlight: false,
      name: 'Nominal speed (ns)',
      withLabel: true,
      label: {
        strokeColor: textColor,
        highlight: false,
        offset: [-20, 10],
        anchorX: 'right',
        position: 'bot',
      }
    }
  );

  sfx.graph.gliders.speed = sfx.graph.board.create(
    'point',
    [0, 0]
  );

  sfx.graph.gliders.speedNext = sfx.graph.board.create(
    'point',
    [0, 0],
    {
      visible: false
    }
  );

  sfx.graph.moveGliders = t => {
    let sliders = sfx.tweaker.sliders;

    let x = t;
    let y = sliders.speed.Value() / Math.abs(sliders.speed.Value());

    if (sliders.speedFX.Value()) {
      y = (sliders.speed.Value() / Math.abs(sliders.speed.Value())) * (sliders.speedFXOffset.Value() + sliders.speedFXGain.Value() * Math.sin(t * sliders.speedFXFrequency.Value() + sliders.speedFXPhase.Value() + sliders.speedFXDamping.Value() * Math.cos(t * 2 * sliders.speedFXFrequency.Value())));
    }

    sfx.graph.gliders.speedNext.setPosition(JXG.COORDS_BY_USER, [x, y]);

    if (arePointsVisualyClose(sfx.graph.gliders.speed, sfx.graph.gliders.speedNext)) {
      sfx.graph.gliders.speed.moveTo([x, y]);
    }
  }


  // Parallax FX configurator.
  let pfx = new Configurator();
  i = 1;

  pfx.tweaker.board = JXG.JSXGraph.initBoard(
    'parallaxfx-tweaker',
    {
      boundingbox: [-0.5, 0.5, 20.5, -6.5],
      axis: false,
    }
  );

  pfx.tweaker.sliders.parallaxFX = pfx.tweaker.board.create(
    'checkbox',
    [0, --i, 'parallaxFX'],
  );
  pfx.tweaker.sliders.parallaxFX.rendNodeCheckbox.checked = settings.parallaxFX;

  pfx.tweaker.sliders.parallaxFXGainX = pfx.tweaker.board.create(
    'slider',
    [[0, --i], [8, i], [0, settings.parallaxFXGainX, 1]],
    {
      name: 'parallaxFXGainX',
    }
  );

  pfx.tweaker.sliders.parallaxFXFrequencyX = pfx.tweaker.board.create(
    'slider',
    [[0, --i], [8, i], [0, settings.parallaxFXFrequencyX, 10]],
    {
      name: 'parallaxFXFrequencyX',
      snapWidth: 1,
    }
  );

  pfx.tweaker.sliders.parallaxFXPhaseX = pfx.tweaker.board.create(
    'slider',
    [[0, --i], [8, i], [-Math.PI, settings.parallaxFXPhaseX, Math.PI]],
    {
      name: 'parallaxFXPhaseX',
    }
  );

  pfx.tweaker.sliders.parallaxFXGainY = pfx.tweaker.board.create(
    'slider',
    [[0, --i], [8, i], [0, settings.parallaxFXGainY, 1]],
    {
      name: 'parallaxFXGainY',
    }
  );

  pfx.tweaker.sliders.parallaxFXFrequencyY = pfx.tweaker.board.create(
    'slider',
    [[0, --i], [8, i], [0, settings.parallaxFXFrequencyY, 10]],
    {
      name: 'parallaxFXFrequencyY',
      snapWidth: 1,
    }
  );

  pfx.tweaker.sliders.parallaxFXPhaseY = pfx.tweaker.board.create(
    'slider',
    [[0, --i], [8, i], [-Math.PI, settings.parallaxFXPhaseY, Math.PI]],
    {
      name: 'parallaxFXPhaseY',
    }
  );


  pfx.graph.boundingBox = [-16, 9, 16, -9];

  pfx.graph.board = JXG.JSXGraph.initBoard(
    'parallaxfx-graph',
    {
      boundingbox: pfx.graph.boundingBox,
      axis: false,
      keepAspectRatio: true,
    }
  );

  pfx.graph.board.create(
    'axis',
    [[0, 0], [1, 0]],
    {
      name: 'X',
      withLabel: true,
      label: {
        position: 'rt',
        offset: [0, 15],
      },
      ticks: {
        visible: false,
      },
    }
  );

  pfx.graph.board.create(
    'axis', [[0, 0], [0, 1]],
    {
      name: 'Y',
      withLabel: true,
      label: {
        position: 'rt',
        offset: [10, 5],
      },
      ticks: {
        visible: false,
      }
    }
  );

  pfx.tweaker.board.addChild(pfx.graph.board);
  opts.tweaker.board.addChild(pfx.graph.board);

  pfx.graph.board.create(
    'polygon',
    [[-16 * 0.8, 9 * 0.8], [16 * 0.8, 9 * 0.8], [16 * 0.8, -9 * 0.8], [-16 * 0.8, -9 * 0.8]],
    {
      fillColor: 'none',
      highlight: false,
      borders: {
        strokeColor: textColor,
        dash: 2,
        highlight: false,
      },
      vertices: {
        visible: false,
        fixed: true,
      },
      fixed: true,
    }
  );

  pfx.graph.board.create(
    'text',
    [-16 * 0.8, 9 * 0.92, '16/9 area'],
    {
      strokeColor: textColor,
    }
  );

  pfx.graph.board.create(
    'text',
    [-16 * 0.8, -9 * 0.92, 'Dot: vanishing point'],
    {
      strokeColor: textColor,
    }
  );

  pfx.graph.board.create(
    'text',
    [-16 * 0.8, -9 * 1.08, 'Arrow: parallax strengh & direction'],
    {
      strokeColor: textColor,
    }
  );

  pfx.graph.board.create(
    'curve',
    [
      t => {
        let sliders = pfx.tweaker.sliders;
        return 16 * 0.8 * sliders.parallaxFXGainX.Value() * Math.sin(t * sliders.parallaxFXFrequencyX.Value() + sliders.parallaxFXPhaseX.Value());
      },
      t => {
        let sliders = pfx.tweaker.sliders;
        return 9 * 0.8 * sliders.parallaxFXGainY.Value() * Math.cos(t * sliders.parallaxFXFrequencyY.Value() + sliders.parallaxFXPhaseY.Value());
      },
      -Math.PI,
      Math.PI,
    ],
    {
      highlight: false,
      strokeColor: '#4e501c',
      highlightStrokeColor: '#4e501c',
    }
  );

  pfx.graph.gliders.parallaxStart = pfx.graph.board.create(
    'point',
    [0, 0],
  );

  pfx.graph.gliders.parallaxStartNext = pfx.graph.board.create(
    'point',
    [0, 0],
    {
      visible: false,
    }
  );

  pfx.graph.gliders.parallaxEnd = pfx.graph.board.create(
    'point',
    [0, 0],
    {
      size: 0,
    }
  );

  pfx.graph.gliders.parallaxEndNext = pfx.graph.board.create(
    'point',
    [0, 0],
    {
      visible: false,
    }
  );

  pfx.graph.board.create(
    'line',
    [pfx.graph.gliders.parallaxStart, pfx.graph.gliders.parallaxEnd],
    {
      straightFirst: false,
      straightLast: false,
      strokeWidth: 2,
      strokeColor: '#D6DF22',
      highlightStrokeColor: '#D6DF22',
      lastArrow: true,
    }
  );

  pfx.graph.moveGliders = t => {
    let sliders = pfx.tweaker.sliders;

    let xStart = 16 * 0.8 * settings.vpOffsetFactorX / 100;
    let yStart = 9 * 0.8 * settings.vpOffsetFactorY / 100;
    let xEnd = 16 * 0.8 * settings.vpOffsetFactorX / 100;
    let yEnd = 9 * 0.8 * settings.vpOffsetFactorY / 100;

    if (sliders.parallaxFX.Value()) {
      xStart = 16 * 0.8 * sliders.parallaxFXGainX.Value() * Math.sin(t * sliders.parallaxFXFrequencyX.Value() + sliders.parallaxFXPhaseX.Value());
      yStart = 9 * 0.8 * sliders.parallaxFXGainY.Value() * Math.cos(t * sliders.parallaxFXFrequencyY.Value() + sliders.parallaxFXPhaseY.Value());
      xEnd = pfx.graph.gliders.parallaxStart.X() + 16 * 0.8 * sliders.parallaxFXGainX.Value() * Math.cos(t * sliders.parallaxFXFrequencyX.Value() + sliders.parallaxFXPhaseX.Value());
      yEnd = pfx.graph.gliders.parallaxStart.Y() + 9 * 0.8 * sliders.parallaxFXGainY.Value() * Math.sin(t * sliders.parallaxFXFrequencyY.Value() + sliders.parallaxFXPhaseY.Value());
    }

    pfx.graph.gliders.parallaxStartNext.setPosition(JXG.COORDS_BY_USER, [xStart, yStart]);
    pfx.graph.gliders.parallaxEndNext.setPosition(JXG.COORDS_BY_USER, [xEnd, yEnd]);

    if (arePointsVisualyClose(pfx.graph.gliders.parallaxStart, pfx.graph.gliders.parallaxStartNext) || arePointsVisualyClose(pfx.graph.gliders.parallaxEnd, pfx.graph.gliders.parallaxEndNext)) {
      pfx.graph.gliders.parallaxStart.setPosition(JXG.COORDS_BY_USER, [xStart, yStart]);
      pfx.graph.gliders.parallaxEnd.setPosition(JXG.COORDS_BY_USER, [xEnd, yEnd]);
      pfx.graph.board.update();
    }
  }


  // Color FX configurator.
  let cfx = new Configurator();
  i = 1;

  cfx.tweaker.board = JXG.JSXGraph.initBoard(
    'colorfx-tweaker',
    {
      boundingbox: [-0.5, 0.5, 20.5, -6.5],
      axis: false,
    }
  );

  cfx.tweaker.sliders.hue = cfx.tweaker.board.create(
    'slider',
    [[0, --i], [8, i], [0, settings.hue, 360]],
    {
      name: 'hue',
      snapWidth: 1,
    }
  );

  cfx.tweaker.sliders.hueFX = cfx.tweaker.board.create(
    'checkbox',
    [0, --i, 'hueFX'],
  );
  cfx.tweaker.sliders.hueFX.rendNodeCheckbox.checked = settings.hueFX;

  cfx.tweaker.sliders.hueFXFrequency = cfx.tweaker.board.create(
    'slider',
    [[0, --i], [8, i], [1, settings.hueFXFrequency, 10]],
    {
      name: 'hueFXFrequency',
      snapWidth: 1,
    }
  );

  cfx.tweaker.sliders.grayscale = cfx.tweaker.board.create(
    'checkbox',
    [0, --i, 'grayscale']
  );
  cfx.tweaker.sliders.grayscale.rendNodeCheckbox.checked = settings.grayscale;

  cfx.tweaker.sliders.opacity = cfx.tweaker.board.create(
    'slider',
    [[0, --i], [8, i], [0, settings.opacity, 100]],
    {
      name: 'opacity',
      snapWidth: 1,
    }
  );

  cfx.tweaker.sliders.opacityFX = cfx.tweaker.board.create(
    'checkbox',
    [0, --i, 'opacityFX']
  );
  cfx.tweaker.sliders.opacityFX.rendNodeCheckbox.checked = settings.opacityFX;

  cfx.tweaker.sliders.opacityFXFrequency = cfx.tweaker.board.create(
    'slider',
    [[0, --i], [8, i], [1, settings.opacityFXFrequency, 10]],
    {
      name: 'opacityFXFrequency',
      snapWidth: 1,
    }
  );

  cfx.graph.boundingBox = [-1.5, 1.5, 1.5, -1.5];

  cfx.graph.board = JXG.JSXGraph.initBoard(
    'colorfx-graph',
    {
      boundingbox: cfx.graph.boundingBox,
      axis: false,
      keepAspectRatio: true,
      strokeWidth: 0,
    }
  );

  cfx.tweaker.board.addChild(cfx.graph.board);

  let hueCurve = cfx.graph.board.create(
    'circle',
    [[0, 0], 0.9],
    {
      strokeColor: '#D6DF22',
      highlightStrokeColor: '#D6DF22',
      strokeWidth: 9,
      highlightStrokeWidth: 9,
    }
  );

  cfx.graph.gliders.hue = cfx.graph.board.create(
    'point',
    [0, 0],
    {
      size: 5,
    }
  );

  cfx.graph.gliders.opacity = cfx.graph.board.create(
    'point',
    [0, 0],
    {
      size: 5,
      strokeColor: '#ffffff',
      highlightStrokeColor: '#ffffff',
      fillColor: '#ffffff',
      highlightFillColor: '#ffffff',
    }
  );

  const hue2HexColor = (hue, grayscale) => {

    const byte2Hex = b => {
      const hexString = "0123456789ABCDEF";
      const high = (b >> 4) & 0x0F;
      const low = b & 0x0F;
      return String(hexString.substring(high, high + 1)) + hexString.substring(low, low + 1);
    }

    let r;
    let g;
    let b;

    let rad = hue * Math.PI / 180;

    if (grayscale) {
      let gray = Math.sin(rad) * 107 + 148;
      r = gray;
      g = gray;
      b = gray;
    }
    else {
      r = Math.sin(rad) * 127 + 128;
      g = Math.sin(rad + 4 * Math.PI / 3) * 127 + 128;
      b = Math.sin(rad + 2 * Math.PI / 3) * 127 + 128;
    }

    return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
  };

  cfx.graph.moveGliders = (hue, opacity) => {
    let hexColor = hue2HexColor(hue, cfx.tweaker.sliders.grayscale.Value());

    hueCurve.setAttribute({
      strokeColor: hexColor,
      highlightStrokeColor: hexColor,
      strokeOpacity: opacity,
      highlightStrokeOpacity: opacity,
      fillOpacity: opacity,
      highlightFillCOpacity: opacity,
    });

    cfx.graph.gliders.hue.setAttribute({
      strokeColor: hexColor,
      highlightStrokeColor: hexColor,
      fillColor: hexColor,
      highlightFillColor: hexColor,
    });

    let hueRad = hue * Math.PI / 180;
    cfx.graph.gliders.hue.moveTo([0.65 * Math.cos(hueRad), 0.65 * Math.sin(hueRad)]);

    cfx.graph.gliders.opacity.setAttribute({
      size: Math.round(opacity * 10),
      strokeColor: hexColor,
      highlightStrokeColor: hexColor,
      fillColor: hexColor,
      highlightFillColor: hexColor,
      strokeOpacity: opacity,
      highlightStrokeOpacity: opacity,
      fillOpacity: opacity,
      highlightFillCOpacity: opacity,
    });

    let opacityRad = (-Math.PI) + opacity * 2 * Math.PI;
    cfx.graph.gliders.opacity.moveTo([0.65 * Math.sin(opacityRad), 0.65 * Math.cos(opacityRad)]);
  }


  // Update boards on window resize.
  const resizeConfigurators = () => {
    let w;
    let h;

    w = opts.graph.board.containerObj.clientWidth;
    h = opts.graph.board.containerObj.clientHeight;
    opts.graph.board.resizeContainer(w, h, true);
    opts.graph.board.setBoundingBox(opts.tweaker.boundingBox, true);
    opts.graph.board.fullUpdate();

    w = opts.tweaker.board.containerObj.clientWidth;
    h = opts.tweaker.board.containerObj.clientHeight;
    opts.tweaker.board.resizeContainer(w, h, true);
    opts.tweaker.board.fullUpdate();


    w = sfx.graph.board.containerObj.clientWidth;
    h = sfx.graph.board.containerObj.clientHeight;
    sfx.graph.board.resizeContainer(w, h, true);
    sfx.graph.board.setBoundingBox(sfx.tweaker.boundingBox, true);
    sfx.graph.board.fullUpdate();

    w = sfx.tweaker.board.containerObj.clientWidth;
    h = sfx.tweaker.board.containerObj.clientHeight;
    sfx.tweaker.board.resizeContainer(w, h, true);
    sfx.tweaker.board.fullUpdate();


    w = pfx.graph.board.containerObj.clientWidth;
    h = pfx.graph.board.containerObj.clientHeight;
    pfx.graph.board.resizeContainer(w, h, true);

    let ratio
    if (window.innerWidth < 640) {
      pfx.graph.boundingBox = [-16, 9, 16, -9];
      ratio = 1.77;
    }
    else {
      pfx.graph.boundingBox = [-16, 9, 16, -9];
      ratio = 1.77;
    }
    pfx.graph.board.setBoundingBox(
      [
        pfx.graph.boundingBox[0] + ((w - h) / (ratio * h)) * 0.5 * pfx.graph.boundingBox[0],
        pfx.graph.boundingBox[1],
        pfx.graph.boundingBox[2] + ((w - h) / (ratio * h)) * 0.5 * pfx.graph.boundingBox[2],
        pfx.graph.boundingBox[3]
      ],
      true
    );
    pfx.graph.board.fullUpdate();

    w = pfx.tweaker.board.containerObj.clientWidth;
    h = pfx.tweaker.board.containerObj.clientHeight;
    pfx.tweaker.board.resizeContainer(w, h, true);
    pfx.tweaker.board.fullUpdate();

    w = cfx.graph.board.containerObj.clientWidth;
    h = cfx.graph.board.containerObj.clientHeight;
    cfx.graph.board.resizeContainer(w, h, true);
    cfx.graph.board.setBoundingBox(
      [
        cfx.graph.boundingBox[0] + ((w - h) / (0.5 * h)) * 0.5 * cfx.graph.boundingBox[0],
        cfx.graph.boundingBox[1],
        cfx.graph.boundingBox[2] + ((w - h) / (0.5 * h)) * 0.5 * cfx.graph.boundingBox[2],
        cfx.graph.boundingBox[3]
      ],
      true
    );
    cfx.graph.board.fullUpdate();

    w = cfx.tweaker.board.containerObj.clientWidth;
    h = cfx.tweaker.board.containerObj.clientHeight;
    cfx.tweaker.board.resizeContainer(w, h, true);
    cfx.tweaker.board.fullUpdate();
  }

  // Handle window resizing to automatically resize configurators.
  // Here we delay the call to the resizeConfigurators() function because
  // window takes a bit to maximize / restaure using buttons in the
  // top right corner of the browser.
  $(window).on('resize', function () {
    setTimeout(() => {
      resizeConfigurators();
    }, 150);
  });


  return $.extend({},
    opts.tweaker.sliders,
    sfx.tweaker.sliders,
    pfx.tweaker.sliders,
    cfx.tweaker.sliders,
    {
      moveSpeedGliders: sfx.graph.moveGliders,
      moveParallaxGliders: pfx.graph.moveGliders,
      moveColorGliders: cfx.graph.moveGliders,
    }
  );
};


// Initialize.
$(document).ready(function () {

  // Is it mobile device?
  let isMobileDevice = /Android|BB|BB10|BlackBerry|iPad|iPhone|iPod|Kindle|mobi|nexus 7|opera mini|PlayBook|Silk|tablet|webOS|Windows Phone/i.test(navigator.userAgent);

  // Initialize widgets that control the slideshow.
  let fxCtrl = initFXConfigurators();

  // Initialize ENDLESS slideshow.
  let slideshow = $('#banner').endless({

    loaded: function () {
      $('#spinner').hide();
    },

    afterAnimate: function (time, clock, fxValues) {
      if (!isMobileDevice) {
        // Animate gliders only on desktop.
        if ($('#speedfx-graph').isOnScreen()) fxCtrl.moveSpeedGliders(clock);
        if ($('#parallaxfx-graph').isOnScreen()) fxCtrl.moveParallaxGliders(clock);
        if ($('#colorfx-graph').isOnScreen()) fxCtrl.moveColorGliders(fxValues.hue, fxValues.opacity);
      }
    },

    fxCycleDuration: function () { return fxCtrl.fxCycleDuration.Value(); },
    vpOffsetFactorX: function () { return fxCtrl.vpOffsetFactorX.Value(); },
    vpOffsetFactorY: function () { return fxCtrl.vpOffsetFactorY.Value(); },

    speed: function () { return fxCtrl.speed.Value(); },
    speedFX: function () { return fxCtrl.speedFX.Value(); },
    speedFXOffset: function () { return fxCtrl.speedFXOffset.Value(); },
    speedFXGain: function () { return fxCtrl.speedFXGain.Value(); },
    speedFXDamping: function () { return fxCtrl.speedFXDamping.Value(); },
    speedFXFrequency: function () { return fxCtrl.speedFXFrequency.Value(); },
    speedFXPhase: function () { return fxCtrl.speedFXPhase.Value(); },

    parallaxFX: function () { return fxCtrl.parallaxFX.Value(); },
    parallaxFXGainX: function () { return fxCtrl.parallaxFXGainX.Value(); },
    parallaxFXFrequencyX: function () { return fxCtrl.parallaxFXFrequencyX.Value(); },
    parallaxFXPhaseX: function () { return fxCtrl.parallaxFXPhaseX.Value(); },
    parallaxFXGainY: function () { return fxCtrl.parallaxFXGainY.Value(); },
    parallaxFXFrequencyY: function () { return fxCtrl.parallaxFXFrequencyY.Value(); },
    parallaxFXPhaseY: function () { return fxCtrl.parallaxFXPhaseY.Value(); },

    grayscale: function () { return fxCtrl.grayscale.Value(); },

    hue: function () { return fxCtrl.hue.Value(); },
    hueFX: function () { return fxCtrl.hueFX.Value(); },
    hueFXFrequency: function () { return fxCtrl.hueFXFrequency.Value(); },

    opacity: function () { return fxCtrl.opacity.Value(); },
    opacityFX: function () { return fxCtrl.opacityFX.Value(); },
    opacityFXFrequency: function () { return fxCtrl.opacityFXFrequency.Value(); },

    shuffle: true,
    images: [
      'images/1.jpg',
      'images/2.jpg',
      'images/3.jpg',
      'images/4.jpg',
      'images/5.jpg',
      'images/6.jpg',
      'images/7.jpg',
      'images/8.jpg',
      'images/9.jpg',
      'images/10.jpg',
      'images/11.jpg',
      'images/12.jpg',
      'images/13.jpg',
      'images/14.jpg',
      'images/15.jpg',
      'images/16.jpg',
      'images/17.jpg',
      'images/18.jpg',
      'images/19.jpg',
      'images/20.jpg',
      'images/21.jpg',
      'images/22.jpg',
      'images/23.jpg',
      'images/24.jpg',
      'images/25.jpg',
      'images/26.png',
    ]
  });

  // Register event listeners to handle window scrolling and resizing.
  $(window).on('scroll', () => {
    if (!$('banner').hasClass('tweaked')) {
      resizeBanner();
    }
  });

  // Handle window resizing to automatically resize banner
  // Here we delay the call to the resizeConfigurators() function because
  // window takes a bit to maximize / restaure using buttons in the
  // top right corner of the browser.
  $(window).on('resize', () => {
    window.setTimeout(() => {
      resizeBanner();
    }, 150);
  });

  // Register click event listener on all <a> elements pointing to document
  // anchors in order to keep track of the location in the browser history
  // because it is disabled by UIkit when it make use of scroll feature.
  $('a[href^="#anchor-"]').on('click', () => {
    window.setTimeout(function (el) {
      window.location = $(el).attr('href');
    }, 0, this);
  });

  // Start / stop the slideshow on button click.
  $('#slideshowButton').on('click', () => {
    if ($(this).html() == 'STOP') {
      slideshow.endless('stop');
      $(this).html('START');
    }
    else {
      slideshow.endless('start');
      $(this).html('STOP');
    }
  });

  // Register event listeners to handle dropdown events.
  $('#section-tweakers').on('beforeshow', () => {
    $('#banner').addClass('tweaked');
  });

  $('#section-tweakers').on('shown', () => {
    $(window).resize();
  });

  $('#section-tweakers').on('hidden', e => {
    $('#banner').removeClass('tweaked');
    resizeBanner();
  });

  // Register event listeners on switcher panes to prevent them
  // to bubble and be catched by dropdown event listeners.
  $('#section-tweakers .widget').on('beforeshow', e => {
    e.stopPropagation();
  });

  $('#section-tweakers .widget').on('shown', e => {
    e.stopPropagation();
  });

  $('#section-tweakers .widget').on('hidden', e => {
    e.stopPropagation();
  });

  // Start the slideshow.
  // slideshow.endless('start');

  // Clicking on "Controllable" big button reveals the tweakers panel but it
  // does not resize the banner to make it occupying all the available space.
  // So we need to do it ourselves, after a little delay to let dropdown
  // animation to finish.
  // NOTE : We use native event listener because we need to catch the event
  //        during bubbling phase, after the dropdown component is shown.
  $('#button-card-controllable').get(0).addEventListener("click", () => {
    setTimeout(() => {
      $('#banner').addClass('tweaked');
      // $(window).resize();
    }, 250);
  }, false);

  // Emit a resize event to force components size calculation.
  $(window).resize();
});
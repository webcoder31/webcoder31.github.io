# ENDLESS / jQuery Plugin: An amazing slideshow with infinite zoom and parallax effects

This plugin provides an amazing slideshow that look like a movie. It zoom endlessly through a set of faded images applying a parallax effect. It optionnaly rotate the hue of merged images or fade them to greyscale. As result, it look like a never ending movie clip.

**NOTE:** This plugin is **requireJS** ready.

The author of the **endless** jQuery plugin is Thierry Thiers.


## Requirements

* jQuery
* Browser that support `canvas`.


## How to Install?

### Using npm

```sh
npm install @webcoder31/endless
```

The plugin will be installed in the `node_modules` folder of your project.


### Using composer

```sh
php composer.phar require "webcoder31/endless"
```

The plugin will be installed in the `components` folder of your project.


### Manualy

You can also clone it (or download it as a ZIP archive) from its [GitHub repositary](https://github.com/webcoder31/endless.git) and use it the way you want in your project.


## How to use?

### The classical way

1) Load jQuery and the `endless.js` file in your HTML file.
2) Add a `div` tag where you want to render the slideshow.
3) Apply plugin to the `div` tag you've creates.
4) Start the plugin animation.

### The requireJS way

1) Load jQuery and the `endless.js` file in your HTML file.
2) Add a `div` tag where you want to render the slideshow.
3) Apply plugin to the `div` tag you've creates.
4) Start the plugin animation.


## Examples

### ENDLESS banner

```html
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Raleway:200">
    <style>
        body {
            font-family: "Raleway", "Helvetica Neue", Helvetica, Arial, sans-serif;
        }
        #header {
            width: 100%;
            margin: 1em auto;
            background: #202020;
            text-align: center;
        }
        #banner {
            width: 100%;
            height: 240px;
            margin: 1em auto;
            background: #000;
        }
        #content {
            max-width: 720px;
            height: 240px;
            margin: 1em auto;
            background: #404040;
        }
        #footer {
            width: 100%;
            margin: 1em auto;
            background: #202020;
            text-align: center;
        }
    </style>
</head>
<body>
    <div id="header">ENDLESS BANNER</div>
    <div id="banner"></div>
    <div id="content">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel sagittis ante. Nunc efficitur lobortis neque. Nullam nec malesuada tellus. Vestibulum blandit quam est, vel pretium mauris congue eu. Quisque eget nibh laoreet, dictum augue sit amet, malesuada ipsum. Praesent vitae felis gravida, iaculis dui quis, laoreet orci. Etiam eget neque est. Vivamus eleifend dignissim turpis non pulvinar. Quisque eu tellus hendrerit lectus sodales rhoncus. Nullam vel turpis tortor.</p>
        <p>Curabitur euismod vitae dolor ac lobortis. Phasellus magna sapien, pellentesque et orci sit amet, ornare suscipit metus. Mauris ultricies porta dolor vestibulum consectetur. Donec quis ipsum sit amet libero ultrices mollis. In volutpat quis elit vel accumsan. Vivamus molestie elit et enim iaculis rhoncus. In et accumsan felis. Mauris scelerisque odio velit, sit amet euismod leo convallis nec. Proin ac sem erat. Vivamus condimentum gravida nibh id pulvinar. Suspendisse potenti. Nullam dignissim sollicitudin vestibulum. Donec eu nunc vestibulum, eleifend odio et, vulputate dolor. Nam sed est quis nisl sodales auctor.</p>
    </div>
    <div id="footer">
        <p><a href="https://github.com/webcoder31/endless">https://github.com/webcoder31/endless</a></p>
        <p>Copyright © 2017 Thierry Thiers</p>
    </div>
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
    <script src="endless.js"></script>
    <script type="text/javascript">

        $(document).ready(function()
        {
            $("#background").endless({
                shuffle: true,
                opacity: 100,
                greyScale: false,
                speed: 20,
                speedFX: true,
                speedFXGain: 0.75,
                speedFXOffset: 0.65,
                speedFXFrequency: 2,
                speedFXPhase: Math.PI / 3,
                parallaxFX: true,
                parallaxFXGainX: 0.88,
                parallaxFXFrequencyX: 4,
                parallaxFXPhaseX: -Math.PI / 6,
                parallaxFXGainY: 0.55,
                parallaxFXFrequencyY: 3,
                parallaxFXPhaseY: Math.PI / 4,
                hueFX: true,
                hueFXFrequency: 6,
                images: [
                    'images/space-01.png',
                    'images/space-02.png',
                    'images/space-03.png',
                    'images/space-04.png',
                    'images/space-05.png',
                    'images/space-06.png',
                    'images/space-07.png',
                    'images/space-08.png',
                    'images/space-09.png',
                    'images/space-10.png',
                    'images/space-11.png',
                    'images/space-12.png',
                    'images/space-13.png',
                    'images/space-14.png',
                    'images/space-15.png',
                    'images/space-16.png',
                    'images/space-17.png',
                    'images/space-18.png',
                    'images/space-19.png',
                    'images/space-20.png',
                    'images/space-21.png',
                    'images/space-22.png',
                    'images/space-23.png',
                    'images/space-24.png',
                    'images/space-25.png',
                    'images/space-26.png'
                ]
            });
            $('#background').endless('start');
        });

    </script>
</body>
</html>
```


## Documentation

Online documentation is available here : [EZXMLDSIG Documentation](https://webcoder31.github.io/ezxmldsig/).


## How to Contribute?

* [Open Issues](https://github.com/webcoder31/endless/issues)
* [Open Pull Requests](https://github.com/webcoder31/endless/pulls)

# StickyPlayer

Low-profile JavaScript music player that accepts SoundCloud, YouTube, Dropbox and direct web links.

## Location of files

- Local demo [example/index.html](https://github.com/jpodpro/stickyplayer/tree/master/example/index.html) file.
- All Compiled and minified files (JS & CSS) as well as image files are in the [dist/](https://github.com/jpodpro/stickyplayer/tree/master/dist) folder.
- Source script files are in the [src/](https://github.com/jpodpro/stickyplayer/tree/master/src) folder and source image files are in the [assets/](https://github.com/jpodpro/stickyplayer/tree/master/assets) folder.

## Build

To compile StickyPlayer by yourself, make sure you have [Node.js](http://nodejs.org/), [Grunt.js](https://github.com/cowboy/grunt), [Ruby](https://www.ruby-lang.org) and [Sass](http://sass-lang.com) installed. Then:

1) Clone the repository

`git clone https://github.com/jpodpro/stickyplayer.git`

2) Install Node dependencies

`cd stickyplayer && npm install`

3) Run `grunt` to generate the JS files in the `dist` folder

`grunt`

Optionally:

- Run `grunt watch` to automatically rebuild files when you change files in `src/` or `assets/`.

## Dependencies

- [CrossPlayer](https://github.com/jpodpro/crossplayer)
- [jQuery](http://jquery.com)
- [Bootstrap](http://getbootstrap.com)

## Usage

1) Include Dependencies

```html
<!-- CrossPlayer -->
<script src="https://cdn.rawgit.com/jpodpro/crossplayer/master/dist/crossplayer.js"></script>

<!-- jQuery -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>

<!-- Bootstrap -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
```

2) Include StickyPlayer JS and CSS files

```html
<script src="stickyplayer.min.js"></script>
<link href="stickyplayer.min.css" rel="stylesheet">
```

3) Create a DOM element for the player with unique ID:

```html
<div id="unique-id"></div>
```

4) Init StickyPlayer with required options (see options section below for more info). Make sure to initialize this script after the DOM has been rendered. Either place the init call before the `</body>` tag or use `jQuery(document).ready()` to init the player when the page has loaded.

```javascript
var player = new StickyPlayer( {
    playerId: 'unique-id',
    observeElementId: 'observe',
    playButtonClass: 'sp-play-button'
} );
```

5) Create links with specific attributes. They will automatically launch in the player. See "Play Button Schema" for more info.

```html
<a class="sp-play-button" stream-link="https://www.youtube.com/watch?v=23idtAQna00" title="JPOD - BlissCoast vol6: Cape & Kalimba" artwork="http://jpodtbc.com/wp-content/uploads/2016/09/JPOD-BlissCoast-6-Cape-Kalimba2-300x300.jpg">Play</a>
```

## Options

- `playerId` the ID of the player DOM element. REQUIRED.
- `observeElementId` the ID of the element to watch for DOM changes. This allows the player to function in an SPA by watching a container element for changes. As long as a child element has the required attributes it will automatically register itself to launch in the player. REQUIRED.
- `playButtonClass` the class name to use for a play button. REQUIRED.
- `scClientId` SoundCloud client ID required to use the [HTTP API](https://developers.soundcloud.com/docs/api/sdks). When not provided the player uses the [Widget API](https://developers.soundcloud.com/docs/api/html5-widget).

## Play Button Schema

Any DOM element can be a player button as long as it contains four required attributes:

1) Play button class, as specified in options.
2) `stream-link` attribute which contains the URL to be streamed.
3) `title` the title of the track to display in the player.
4) `artwork` a link to the artwork to display in the player. Note: YouTube links don't use this as it shows the video in place of the artwork.

## iOS Limitations

Apple requires direct user interaction for playing media files on iOS. That means that when using players within iFrames they cannot be programatically started. Additional user interaction is required. StickyPlayer uses CrossPlayer, which uses iFrames for the SoundCloud Widget player and the YouTube player. When loading a URL in this scenario the player will occupy the full size of its container (ideally full-screen) and display a message asking for additional user interaction. When playing commences the player resumes its low-profile position.

## License

MIT
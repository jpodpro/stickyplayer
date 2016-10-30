/**
 * Main player class
 *
 * @param options
 *      playerId string: REQUIRED, the ID of the player element
 *      observeElementId string: REQUIRED, the ID of the element to observe for DOM changes
 *      playButtonClass string: REQUIRED, the class name for sticky player play buttons
 *      scClientId string: SoundCloud Client ID
 */
var player = function( options )
{
    this._options = options;
    this._playerElement = null;
    this._artworkElement = null;
    this._titleElement = null;
    this._progressElement = null;
    this._waveformElement = null;
    this._elapsedElement = null;
    this._durationElement = null;
    this._currentElement = null;
    this._durationMS = 0;
    this._visible = false;

    if( !options || !options.playerId )
    {
        throw new Error( "Player Id required (options.playerId)" );
    }
    if( !options.observeElementId )
    {
        throw new Error( "Observe Element Id required (options.observeElementId)" );
    }
    if( !options.playButtonClass )
    {
        throw new Error( "Play button class required (options.playButtonClass)" );
    }

    this.createPlayerDOM();

    this._player = new CrossPlayer( {
        elementId: 'players-container',
        scClientId: this._options.scClientId
    } );

    // register callbacks
    this._player.onStopped( this.onStopped.bind( this ) );
    this._player.onLoading( this.onLoading.bind( this ) );
    this._player.onPlaying( this.onPlaying.bind( this ) );
    this._player.onPaused( this.onPaused.bind( this ) );
    this._player.onEnded( this.onEnded.bind( this ) );
    this._player.onProgress( this.onProgress.bind( this ) );
    this._player.onTrackData( this.onTrackData.bind( this ) );
    this._player.onInteractionRequired( this.onInteractionRequired.bind( this ) );

    // register other handlers
    jQuery('.playpause', this._playerElement).click( this.playPause.bind( this ) );
    jQuery('.progress-container', this._playerElement).click( this.seek.bind( this ) );

    // setup observing and enable play buttons
    this.observeDOM( jQuery('#'+this._options.observeElementId)[0], this.enablePlayButtons.bind( this ) );
    this.enablePlayButtons();
};


/**
 * Creates the DOM tree for the sticky player
 */
player.prototype.createPlayerDOM = function()
{
    this._playerElement = jQuery('#'+this._options.playerId).addClass( 'sticky-player' );
    this._artworkElement = jQuery('<div class="artwork"></div>');
    this._titleElement = jQuery('<div class="title"></div>');
    this._progressElement = jQuery('<div class="progress-bar progress-bar-custom progress-bar-striped active" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"><span class="sr-only">0% Complete</span></div>');
    this._waveformElement = jQuery('<div class="waveform"></div>');
    this._elapsedElement = jQuery('<div class="time elapsed"></div>');
    this._durationElement = jQuery('<div class="time duration"></div>');

    var playPause = jQuery('<div class="playpause"></div>')

    this._playerElement
        .append( jQuery('<div class="container"></div>')
            .append( jQuery('<div class="artwork-container"></div>')
                .append( jQuery('<div class="players" id="players-container"></div>') )
                .append( this._artworkElement )
                .append( jQuery('<div class="loading"></div>') )
                .append( jQuery('<div class="playpause"></div>') ) )
            .append( jQuery('<div class="title-container"></div>')
                .append( this._titleElement ) )
            .append( jQuery('<div class="progress-container"></div>')
                .append( jQuery('<div class="progress"></div>')
                    .append( this._progressElement )
                    .append( this._waveformElement )
                    .append( this._elapsedElement )
                    .append( this._durationElement ) ) ) );
};


/**
 * Observes DOM element for changes
 * IE9+, FF, Webkit
 *
 * @param obj: the element to watch for changes
 * @param callback: the function to call when changes are detected
 */
player.prototype.observeDOM = (function()
{
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var eventListenerSupported = window.addEventListener;

    return function( obj, callback )
    {
        if( MutationObserver )
        {
            // define a new observer
            var obs = new MutationObserver( function( mutations, observer )
            {
                if( mutations[0].addedNodes.length || mutations[0].removedNodes.length )
                    callback();
            });
            // have the observer observe foo for changes in children
            obs.observe( obj, { childList:true, subtree:true } );
        }
        else if( eventListenerSupported )
        {
            obj.addEventListener( 'DOMNodeInserted', callback, false );
            obj.addEventListener( 'DOMNodeRemoved', callback, false );
        }
    }
})();


/**
 * Enables play buttons of a specific class to play a URL
 */
player.prototype.enablePlayButtons = function()
{
    var _this = this;
    jQuery('.'+this._options.playButtonClass).each( function( index, object )
    {
        if( !jQuery(object).data( 'events' ) )
        {
            jQuery(object).click( function( event )
            {
                _this.play( this );
            })
        }
    });
};


/**
 * Helper to convert to readable duration from given ms
 * @param ms
 * @returns {string}
 */
player.prototype.durationFromMs = function( ms )
{
    var seconds = ~~( ms / 1000 );
    var minutes = ~~( seconds / 60 );
    var seconds_calc = ( seconds % 60 )

    return minutes + ":" + this.pad( seconds % 60, 2, '0' );
};


/**
 * Pads number to width using supplied 'z' character
 * @param n
 * @param width
 * @param z
 * @returns {string}
 */
player.prototype.pad = function( n, width, z )
{
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};


/**
 * Opens player
 */
player.prototype.open = function()
{
    if( !this._visible )
    {
        this._playerElement.addClass( 'open' );
        jQuery('body').addClass( 'sticky-player-open' );
        this._visible = true;
    }
};


/**
 * Closes player
 */
player.prototype.close = function()
{
    if( this._visible )
    {
        this._playerElement.removeClass( 'open' );
        jQuery('body').removeClass( 'sticky-player-open' );
        this._visible = false;
    }
};


/**
 * Plays a URL specified by the stream-link attribute in the given element
 * title and artwork are also retrieved from the element attributes
 * @param element
 */
player.prototype.play = function( element )
{
    if( !this._visible )
    {
        this.open();
    }

    if( this._currentElement && this._currentElement[0] == jQuery(element)[0] )
    {
        this._player.togglePlayPause();
        return;
    }

    this._currentElement = jQuery(element);
    var url = jQuery(element).attr( 'stream-link' );
    var title = jQuery(element).attr( 'title' );
    var artwork = jQuery(element).attr( 'artwork' );

    var playerType = this._player.playUrl( url );

    jQuery(element).addClass( 'sticky-player-loading' );
    this._titleElement.text( title );

    this._playerElement.removeClass('soundcloud youtube dropbox weblink').addClass( playerType );
    this._artworkElement.css( 'background-image', 'url("'+artwork+'")' );
};


/**
 * Play/Pause method
 */
player.prototype.playPause = function()
{
    this._player.togglePlayPause();
}


/**
 * Seeks method fired when the user clicks/taps the progress bar
 * @param event
 */
player.prototype.seek = function( event )
{
    event.stopPropagation();
    var seekPercent = event.offsetX / event.currentTarget.offsetWidth * 100;
    this.updateProgressFast( seekPercent );
    var seekMS = (seekPercent/100) * this._durationMS;
    this._elapsedElement.text( this.durationFromMs( seekMS ) );
    this._player.seek( seekMS );
}


/**
 * Updates progress bar without animation
 * @param percent
 */
player.prototype.updateProgressFast = function( percent )
{
    this._progressElement.addClass( 'shorttransition' );
    this._progressElement.css( 'width', percent+'%' );
    this._progressElement[0].offsetHeight;
    this._progressElement.removeClass( 'shorttransition' );
};


/**
 * Called when the player stops
 */
player.prototype.onStopped = function()
{
    jQuery('.sticky-player-loading, .sticky-player-playing, .sticky-player-paused').removeClass( 'sticky-player-loading sticky-player-playing sticky-player-paused' );
    this._playerElement.removeClass('playing paused loading');
    this._titleElement.text( '' );
    this._artworkElement.css( 'background-image', 'none' );
    this._elapsedElement.text( '' );
    this._durationElement.text( '' );
    this._progressElement.removeClass( 'active' );
    this.updateProgressFast( 0 );
    jQuery( '.sticky-player-loading' ).removeClass( 'sticky-player-loading' );
};


/**
 * Called when the player is loading
 */
player.prototype.onLoading = function()
{
    this._currentElement.removeClass( 'sticky-player-paused sticky-player-playing' ).addClass( 'sticky-player-loading' );
    this._playerElement.addClass( 'loading' ).removeClass( 'paused playing' );
    this._progressElement.removeClass( 'active' );
};


/**
 * Called when the player is playing
 */
player.prototype.onPlaying = function()
{
    jQuery('.sticky-player-loading').removeClass( 'sticky-player-loading' );
    this._currentElement.removeClass( 'sticky-player-paused sticky-player-loading' ).addClass( 'sticky-player-playing' );
    this._progressElement.addClass( 'active' );
    this._playerElement.addClass( 'playing' ).removeClass( 'paused loading interaction-required' );

};


/**
 * Called when the player is paused
 */
player.prototype.onPaused = function()
{
    jQuery('.sticky-player-loading').removeClass( 'sticky-player-loading' );
    this._currentElement.removeClass( 'sticky-player-playing sticky-player-loading' ).addClass( 'sticky-player-paused' );
    this._playerElement.addClass( 'paused' ).removeClass( 'playing loading' );
    this._progressElement.removeClass( 'active' );
};


/**
 * Track ended callback. Look for next logical playable item, looping around to top if necessary.
 * If nothing found, close player.
 */
player.prototype.onEnded = function()
{
    var next;
    var currentIndex = jQuery('.'+this._options.playButtonClass).index( this._currentElement );

    if( currentIndex == -1 )
    {
        // look for this url in page so we can play next item
        var sameElement = jQuery('[stream-link="'+this._currentElement.attr( 'stream-link' )+'"]:last');
        next = jQuery('.'+this._options.playButtonClass).eq( jQuery('.'+this._options.playButtonClass).index( sameElement ) + 1 );
    }
    else
    {
        next = jQuery('.'+this._options.playButtonClass).eq( currentIndex + 1 );
    }

    if( next.attr('stream-link') == this._currentElement.attr('stream-link') )
    {
        // go next again
        next = jQuery('.'+this._options.playButtonClass).eq( currentIndex + 2 );
    }

    if( next.length == 0 )
    {
        // start from the tp
        next = jQuery('.'+this._options.playButtonClass).eq( 0 );
    }


    if( next.length == 0 )
    {
        this.close();
    }
    else
    {
        next.click();
    }
};


/**
 * Called to update the player progress - this will be called periodically
 * @param data
 */
player.prototype.onProgress = function( data )
{
    this._durationMS = data.durationMS;
    this._progressElement.css( 'width', (data.elapsedMS/data.durationMS*100)+'%' );
    jQuery('.sr-only', this._progressElement).text( Math.round( (data.elapsedMS/data.durationMS*100) * 10 ) / 10+'% Complete' );

    this._elapsedElement.text( this.durationFromMs( data.elapsedMS ) );
    this._durationElement.text( this.durationFromMs( data.durationMS ) );
};


/**
 * Called when there is additional track data
 * @param data
 */
player.prototype.onTrackData = function( data )
{
    // if soundcloud track data, set waveform
    if( data.waveform_url )
    {
        // waveform
        this._waveformElement.css('background-image', 'url("'+data.waveform_url+'")' );
    }
};


/**
 * Called when additional user interaction is required (generally only on iOS)
 * @param playerType
 */
player.prototype.onInteractionRequired = function( playerType )
{
    this._playerElement.addClass( 'interaction-required' );
};
class Statistics {

    static UPDATE_INTERVAL = 100;

    constructor() {

        if ( Statistics._instance ) {

            return Statistics._instance;

        }

        Statistics._instance = this;

        //---

        this._statisticsElement = null;
        this._statisticsObject = null;
        this._updateInterval = null;

    }

    //---

    init() {

        this._statisticsElement = document.createElement( 'div' );
        this._statisticsElement.style.position = 'absolute';
        this._statisticsElement.style.left = '0px';
        this._statisticsElement.style.bottom = '0px';
        this._statisticsElement.style.width = '115px';
        this._statisticsElement.style.height = '104px';
        this._statisticsElement.style.color = '#eee';
        this._statisticsElement.style.font = '11px "Lucida Grande", sans-serif';
        this._statisticsElement.style.backgroundColor = 'rgba(0,0,0,0.30)';
        this._statisticsElement.style.padding = '5px 5px';
        this._statisticsElement.style.boxSizing = 'border-box';
        this._statisticsElement.style.pointerEvents = 'none';

        document.body.appendChild( this._statisticsElement );

        this._statisticsElement.innerHTML = '<span>Statistics</span>';

        this.start();

    }

    start() {

        this._updateInterval = setInterval( () => { this._update() }, Statistics.UPDATE_INTERVAL );

    }

    stop() {

        clearInterval( this._updateInterval );

    }

    update( statisticsObject ) {

        this._statisticsObject = statisticsObject;

    }

    _update() {

        let output = '<span>Statistics</span><br>';

        for ( const property in this._statisticsObject ) {

            output += '- ' + property + ': ' + this._statisticsObject[ property ] + '<br>';

        }

        this._statisticsElement.innerHTML = output;

    }



}
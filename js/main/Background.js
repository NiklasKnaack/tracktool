class Background {

    constructor() {

        if ( Background.instance ) {

            return Background.instance;

        }

        Background.instance = this;
        
        //---

        this._backgroundTexture = ImageFactory.getBackgroundGrassTexture();

        this._canvasManager = new CanvasManager();
        this._canvasObject = this._canvasManager.getCanvasObjectByName( 'background' );
        this._canvas = this._canvasObject.canvas;
        this._context = this._canvasObject.context;
        // this._imageData = this._context.getImageData( 0, 0, this._canvasManager.width, this._canvasManager.height );
        // this._data = this._imageData.data;

        this._x = 0;
        this._y = 0;

    }

    createPattern( image, repetition = 'repeat' ) {

        return this._context.createPattern( image, repetition );

    }

    add() {

        this._context.fillStyle = this.createPattern( this._backgroundTexture );
        this._context.fillRect( 0, 0, this._canvasManager.width, this._canvasManager.height );

    }

    move( x, y ) {

        this._x += x;
        this._y += y;

        this._context.save();
        this._context.translate( this._x, this._y );
        this._context.fillRect( -100000, -100000, 200000, 200000 );
        this._context.restore();

    }

    resize() {

        //---

    }

}
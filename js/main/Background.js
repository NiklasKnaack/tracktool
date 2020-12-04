class Background {

    constructor() {

        //if ( !Background.instance ) {

            this._canvasManager = new CanvasManager();
            this._canvasObject = this._canvasManager.getCanvasObjectByName( 'background' );
            this._canvas = this._canvasObject.canvas;
            this._context = this._canvasObject.context;
            // this._imageData = this._context.getImageData( 0, 0, this._canvasManager.width, this._canvasManager.height );
            // this._data = this._imageData.data;

            this._backgroundGrassTexture = ImageFactory.getBackgroundGrassTexture();

            this._x = 0;
            this._y = 0;

            //---

            //Background.instance = this;

        //}

        //---
       
        //return Background.instance;

    }

    add() {

        this._context.fillStyle = this._context.createPattern( this._backgroundGrassTexture, 'repeat' );
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
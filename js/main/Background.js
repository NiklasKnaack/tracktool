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
        this._context = this._canvasObject.context;
        this._rect = Tools.getFieldLimitationRect( this._canvasManager.width, this._canvasManager.height );

        this._x = 0;
        this._y = 0;

    }

    resize() {

        this._rect = Tools.getFieldLimitationRect( this._canvasManager.width, this._canvasManager.height );
        
    }

    createPattern( image, repetition = 'repeat' ) {

        return this._context.createPattern( image, repetition );

    }

    add() {

        this._context.fillStyle = this.createPattern( this._backgroundTexture );
        this._context.fillRect( this._rect.x, this._rect.y, this._rect.width, this._rect.height );

    }

    move( x, y ) {

        this._x += x;
        this._y += y;

        this._context.save();
        this._context.translate( this._x, this._y );
        this._context.fillRect( this._rect.x, this._rect.y, this._rect.width, this._rect.height );
        this._context.restore();

    }

}
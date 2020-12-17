class CanvasManager {

    constructor( width = 1024, height = 768 ) {

        if ( CanvasManager._instance ) {

            return CanvasManager._instance;

        }

        CanvasManager._instance = this;

        //---
        
        this._width = width;
        this._height = height;

        this._center = { x: width / 2, y: height / 2 };

        //---

        this._style = {

            'position': 'absolute',
            'left': '0px',
            'top': '0px',
            'pointerEvents': 'none',

        };

        this._canvasObjectHolder = [];

    }

    resize( width, height ) {

        this.width = width;
        this.height = height;

        this._center.x = width / 2;
        this._center.y = height / 2;

    }

    createCanvas( name ) {

        const canvas = document.createElement( 'canvas' );
        const context = canvas.getContext( '2d' );
        const imageData = context.getImageData( 0, 0, this._width, this._height );
        const data = imageData.data;

        canvas.width = this._width;
        canvas.height = this._height;

        canvas.style.position = this._style[ 'position' ];
        canvas.style.left = this._style[ 'left' ];
        canvas.style.top = this._style[ 'top' ];
        canvas.style.pointerEvents = this._style[ 'pointerEvents' ];

        context.imageSmoothingEnabled = false;
        context.mozImageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
        
        const canvasObject = {

            index: this._canvasObjectHolder.length,
            name: name,
            canvas: canvas,
            context: context,
            imageData: imageData,
            data: data

        };

        if ( name !== 'clear' ) { 
        
            document.body.appendChild( canvasObject.canvas );

        }

        this._canvasObjectHolder.push( canvasObject );

        return canvasObject;

    }

    removeCanvasByIndex( index ) {

        const canvasObject = getCanvasObjectByIndex( index );

        if ( canvasObject !== null ) {

            document.body.removeChild( canvasObject.canvas );

            canvasObject.canvas = null;
            canvasObject.context = null;

            this._canvasObjectHolder.splice( index, 1 );

            for ( let i = 0, l = this._canvasObjectHolder.length; i < l; i ++ ) {

                this._canvasObjectHolder[ i ].index = i;

            }

        }

    }

    removeCanvasByName( name ) {

        const canvasObject = getCanvasObjectByName( name );

        if ( canvasObject !== null ) {

            this.removeCanvasByIndex( canvasObject.index );

        }
        
    }

    addCanvas( name = '' ) {

        return this.createCanvas( name );

    }

    getCanvasObjectByIndex( index ) {

        let canvasObject = null;

        if ( index >= 0 && index < this._canvasObjectHolder.length ) {

            canvasObject = this._canvasObjectHolder[ index ];

        }

        return canvasObject;

    }

    getCanvasObjectByName( name ) {

        let canvasObject = null;

        for ( let i = 0, l = this._canvasObjectHolder.length; i < l; i ++ ) {

            const cO = this._canvasObjectHolder[ i ];

            if ( cO.name === name ) {

                canvasObject = cO;

            }

        }

        return canvasObject;

    }

    getCanvasByIndex( index ) {

        return this.getCanvasObjectByIndex( index ).canvas;

    }

    getCanvasByName( name ) {

        return this.getCanvasObjectByName( name ).canvas;

    }

    getContextByIndex( index ) {

        return this.getCanvasObjectByIndex( index ).context;

    }

    getContextByName( name ) {

        return this.getCanvasObjectByName( name ).context;

    }

    getImageDataByIndex( index ) {

        return this.getCanvasObjectByIndex( index ).imageData;

    }

    getImageDataByName( name ) {

        return this.getCanvasObjectByName( name ).imageData;

    }

    getDataByIndex( index ) {

        return this.getCanvasObjectByIndex( index ).data;

    }

    getDataByName( name ) {

        return this.getCanvasObjectByName( name ).data;

    }

    getBoundingClientRect() {

        return this._canvasObjectHolder[ 0 ].canvas.getBoundingClientRect();

    }

    _updateImageData( canvasObject ) {

        canvasObject.imageData = canvasObject.context.getImageData( 0, 0, this._width, this._height );
        canvasObject.data = canvasObject.imageData.data;

    }

    get width() {

        return this._width;

    }

    set width( w ) {

        this._width = w;

        for ( let i = 0, l = this._canvasObjectHolder.length; i < l; i ++ ) {

            this._canvasObjectHolder[ i ].canvas.width = w;

            this._updateImageData( this._canvasObjectHolder[ i ] );

        }

    }

    get height() {

        return this._height;

    }

    set height( h ) {

        this._height = h;

        for ( let i = 0, l = this._canvasObjectHolder.length; i < l; i ++ ) {

            this._canvasObjectHolder[ i ].canvas.height = h;

            this._updateImageData( this._canvasObjectHolder[ i ] );

        }

    }

    get center() {

        return this._center;

    }

}
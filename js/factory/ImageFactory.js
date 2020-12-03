class ImageFactory {

    static getBackgroundGrassTexture( width = 256, height = 256 ) {

        const canvas = document.createElement( 'canvas' );

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext( '2d' );

        const imageData = context.getImageData ( 0, 0, width, height );
        const data = imageData.data;

        for ( let i = 0, l = data.length; i < l; i += 4 ) {

            const r = Math.floor( Math.random() * 5 ) + 138;
            const g = Math.floor( Math.random() * 20 ) + 155;
            const b = Math.floor( Math.random() * 5 ) + 104;
            const a = 255;

            data[ i ]     = r;
            data[ i + 1 ] = g;
            data[ i + 2 ] = b;
            data[ i + 3 ] = a;

        }

        context.putImageData( imageData, 0, 0 );

        return canvas;

    }

    static getStreetSegmentTexture( width = 256, height = 256 ) {

        const canvas = document.createElement( 'canvas' );

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext( '2d' );

        const imageData = context.getImageData ( 0, 0, width, height );
        const data = imageData.data;

        for ( let i = 0, l = data.length; i < l; i += 4 ) {

            const rgb = Math.floor( Math.random() * 20 ) + 60;
            const a = 255;

            data[ i ]     = rgb;
            data[ i + 1 ] = rgb;
            data[ i + 2 ] = rgb;
            data[ i + 3 ] = a;

        }

        context.putImageData( imageData, 0, 0 );

        return canvas;

    }

}
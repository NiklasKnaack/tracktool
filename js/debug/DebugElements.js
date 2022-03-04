class DebugElements {

    constructor( node = null ) {

        if ( DebugElements._instance ) {

            return DebugElements._instance;

        }

        DebugElements._instance = this;

        //---

        this._node = node === null ? document.body : node;

        this._elements = [];

    }

    addElementsByGraph( graph ) {

        this.clear();

        //---

        for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

            const route = graph.routes[ i ];

            if ( route.startPoint !== null ) {

                this.addElement( route.startPoint.x, route.startPoint.y, 'START ' + ( i + 1 ).toString(), 'white', -15, -25, null );

            }

            if ( route.endPoint !== null ) {

                this.addElement( route.endPoint.x, route.endPoint.y, 'END ' + ( i + 1 ).toString(), 'white', -15, -25, null );

            }

        }

        //---

        for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

            const graphSegment = graph.segments[ i ];

            if ( i < l - 1 ) {

                this.addElement( graphSegment.p0.x, graphSegment.p0.y, graphSegment.p0.x.toFixed( 0 ).toString() + ', ' + graphSegment.p0.y.toFixed( 0 ).toString(), '#cdcbc8', 0, 9, null );
                this.addElement( graphSegment.p1.x, graphSegment.p1.y, graphSegment.p1.x.toFixed( 0 ).toString() + ', ' + graphSegment.p1.y.toFixed( 0 ).toString(), '#cdcbc8', 0, 9, null );

            } else {

                this.addElement( graphSegment.p0.x, graphSegment.p0.y, graphSegment.p0.x.toFixed( 0 ).toString() + ', ' + graphSegment.p0.y.toFixed( 0 ).toString(), '#cdcbc8', 0, 9, null );
                this.addElement( graphSegment.p1.x, graphSegment.p1.y, graphSegment.p1.x.toFixed( 0 ).toString() + ', ' + graphSegment.p1.y.toFixed( 0 ).toString(), '#cdcbc8', 0, 9, null );

            }

            this.addElement( graphSegment.centerPoint.x, graphSegment.centerPoint.y, graphSegment.id.toString(), 'white', -4, -6, null );
            this.addElement( graphSegment.centerPoint.x, graphSegment.centerPoint.y, graphSegment.length.toFixed( 2 ).toString(), 'grey', 10, -5, null );

        };

    }

    clear() {

        this._elements.forEach( ( debugElement, index ) => {

            this._node.removeChild( debugElement );

        } );

        this._elements = [];

    }

    addElement( x, y, message, color = 'white', offsetX = 0, offsetY = 0, className = null ) {

        const debugElement = document.createElement( 'div' );

        debugElement.style.position = 'absolute';
        debugElement.style.left = ( x + offsetX ).toString() + 'px';
        debugElement.style.top = ( y + offsetY ).toString() + 'px';
        debugElement.style.color = color;
        debugElement.style.fontSize = '8pt';
        debugElement.style.pointerEvents = 'none';

        if ( className === null ) {

            // debugElement.className = 'debug-' + ( Tools.getTimes() + this._elements.length ).toString();
            debugElement.className = 'debug-' + Tools.getUID();

        } else {

            debugElement.className = 'debug-' + className.toString();

        }

        debugElement.innerHTML = message;

        this._node.appendChild( debugElement );

        this._elements.push( debugElement );

    }

    addRectangleElement( x, y, width, height, message = '', textColor = 'white', color = 'red', opacity = 1.00 ) {

        const debugElement = document.createElement( 'div' );

        debugElement.style.position = 'absolute';
        debugElement.style.left = ( x ).toString() + 'px';
        debugElement.style.top = ( y ).toString() + 'px';
        debugElement.style.width = ( width ).toString() + 'px';
        debugElement.style.height = ( height ).toString() + 'px';
        debugElement.style.color = textColor;
        debugElement.style.backgroundColor = color;
        debugElement.style.opacity = opacity.toString();
        debugElement.style.pointerEvents = 'none';

        debugElement.className = 'debug-rectangle-' + Tools.getUID();

        debugElement.innerHTML = message;

        this._node.appendChild( debugElement );

        this._elements.push( debugElement );

    }

}
class FileManager {

    constructor() {

        if ( FileManager._instance ) {

            return FileManager._instance;

        }

        FileManager._instance = this;

        //---

        this._graphsManager = new GraphsManager();

    }

    //---

    _getFileName() {

        return `data_${ Tools.getTimeStamp() }.json`;

    }

    //---

    loadJSON( callback = null ) {

        const input = document.createElement( 'input' );

        input.setAttribute( 'type', 'file' );
        input.setAttribute( 'accept', 'application/JSON' );
        input.onchange = ( e ) => { 

            this._loadJSON( e.target.files[ 0 ], callback );

        }

        input.click();

    }

    _loadJSON( file, callback = null ) {

        const fileReader = new FileReader();

        fileReader.onload = ( () => {

			return ( e ) => {

                this._loadJSONCompleteHandler( JSON.parse( e.target.result ), callback );

            }
            
        } ) ( file );

        fileReader.readAsText( file );

    } 

    _loadJSONCompleteHandler( result, callback = null ) {

        this._graphsManager.graphs = result;

        if ( callback !== null ) {

            callback( result );

        }

    }

    //---

    _encode( s ) {

        const result = [];

        for ( let i = 0, l = s.length; i < l; i ++ ) {

            result[ i ] = s.charCodeAt( i );

        }

        return new Uint8Array( result );

    }

    saveJSON() {

        let str = JSON.stringify( this._graphsManager.graphs );

        //für den fall das die arrays vehiclesWaiting, vehiclesWaitingRouteIndices, neighbourGraphsegments oder neighbourPoints daten enthalten, werden diese entfernt/gelöscht. diese arrays müssen leer sein
        str = str.replace( /"vehiclesWaiting":\["(.*?)"]/gs, '"vehiclesWaiting":[]' );
        str = str.replace( /"vehiclesWaitingRouteIndices":\["(.*?)"]/gs, '"vehiclesWaitingRouteIndices":[]' );
        str = str.replace( /"neighbourGraphsegments":\[{(.*?)}]/gs, '"neighbourGraphsegments":[]' );
        str = str.replace( /"neighbourPoints":\[{(.*?)}]/gs, '"neighbourPoints":[]' );

        //für den fall das newestVehicleId eine id enthält, muss diese durch null ersetzt werden
        str = str.replace( /"newestVehicleId":\'(.*?)'/gs, '"newestVehicleId":null' );

        const data = this._encode( str );

        const blob = new Blob( [ data ], {

            type: 'application/octet-stream'

        } );
        
        const url = URL.createObjectURL( blob );
        const link = document.createElement( 'a' );
        // const event = document.createEvent( 'MouseEvents' );

        link.setAttribute( 'href', url );
        link.setAttribute( 'download', this._getFileName() );

        // event.initMouseEvent( 'click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null );
        
        // link.dispatchEvent( event );

        link.click();

        ;

    }

}
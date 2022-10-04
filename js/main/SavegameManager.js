class SavegameManager {

    constructor( savegame = null ) {

        if ( SavegameManager._instance ) {

            return SavegameManager._instance;

        }

        SavegameManager._instance = this;

        //---

        this._fileManager = new FileManager();
        this._graphsManager = null;
        this._navigator = null;

        //---

        this._savegame = savegame;
        this._callback = null;

    }

    //---

    logSavegame() {

        if ( this._graphsManager === null ) {

            this._graphsManager = new GraphsManager();

        }

        if ( this._navigator === null ) {

            this._navigator = new Navigator();

        }

        //---

        let output = '';

        output += 'const SavegameDefault = {' + '\n';

        output += '    player: {' + '\n';
        output += '        name: ' + '"Niklas Knaack"' + ',\n';
        output += '    },' + '\n';

        output += '    map: {' + '\n';
        output += '        position: {' + '\n';
        output += '            x: ' + this._navigator.position.x +  ',\n';
        output += '            y: ' + this._navigator.position.y +  ',\n';
        output += '        },' + '\n';
        output += '        graphs: [' + '\n' + this._graphsManager.logGraphsForSavegame() + '\n';
        output += '        ],' + '\n';
        output += '    },' + '\n';

        output += '};';
        
        output = output.replace( /"/g, "'" );

        return output;

    }

    //---

    get savegame() {

        return this._savegame;

    }

    get player() {

        return this._savegame.player;

    }

    get map() {

        return this._savegame.map;

    }

    //---

    saveSavegame( fileName = null ) {

        this._fileManager.saveJSON( fileName === null ? this._getFileName() : fileName );

    }

    loadSavegame( callback = null ) {

        this._callback = callback;

        this._fileManager.loadJSON( this._loadSavegameCompleteHandler.bind( this ) );

    }

    //---

    _loadSavegameCompleteHandler( result ) {

        this._savegame = result;

        if ( this._callback !== null ) {

            this._callback( result );

        }

        this._callback = null;

    }

    //---

    _getFileName() {

        return `Savegame${ Tools.getTimeStamp() }.json`;

    }

}
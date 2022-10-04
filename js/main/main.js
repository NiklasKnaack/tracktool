document.addEventListener( 'DOMContentLoaded', () => {

    //--- ------------------------------------------------------------------------------------------------------------------------------

    console.clear();
    console.log( Settings.NAME, ' (version: ', Settings.VERSION, ')' );

    //--- ------------------------------------------------------------------------------------------------------------------------------

    let stats = null;

    let debugMode = false;

    const MATHPI2 = Math.PI * 2;

    const SNAP_TO_DISTANCE = Settings.MOUSE_SNAPPING.distance; //25;

    const EDITOR_MODE_ENUM = Object.freeze( {

        moveMap: 'moveMap',
        addGraphSegment: 'addGraphSegment',
        removeGraphSegment: 'removeGraphSegment',
        bendGraphSegment: 'bendGraphSegment',
        bendGraphSegmentBetween: 'bendGraphSegmentBetween',
        autoBendGraphSegment: 'autoBendGraphSegment',
        straightenGraphSegment: 'straightenGraphSegment',
        splitGraphSegment: 'splitGraphSegment',
        splitGraphSegmentAt: 'splitGraphSegmentAt',
        toggleGraphWalkable: 'toggleGraphWalkable',
        toggleGraphDirections: 'toggleGraphDirections',
        addStartPoint: 'addStartPoint',
        addEndPoint: 'addEndPoint',
        removeStartEndPoints: 'removeStartEndPoints',
        getGraphSegment: 'getGraphSegment',
        getVehicle: 'getVehicle',
        getPoint: 'getPoint',
        toggleVehicleHalted: 'toggleVehicleHalted',
        followVehicle: 'followVehicle',
        removeVehicle: 'removeVehicle',
        togglePointWalkable: 'togglePointWalkable',
        movePoint: 'movePoint',
        showRoute: 'showRoute',
        showPointNeighbours: 'showPointNeighbours',
        showPointVehicleQueue: 'showPointVehicleQueue',
        showVehicleCheckpoints: 'showVehicleCheckpoints',
        showVehicleGridCells: 'showVehicleGridCells',
        addStreetSegment: 'addStreetSegment',

    } );

    const GRAPH_SEGMENT_DIRECTIONS = [ '><', '>', '<' ];
    const GRAPH_SEGMENT_CURVE_ACCURACY = 5;

    let editorMode = EDITOR_MODE_ENUM.addGraphSegment;

    let width = 1024;
    let height = 512;

    const border = { left: 1, top: 1, right: width, bottom: height };

    //---

    const animationFrameManager = new AnimationFrameManager( [ render ] );
    const debugElements = new DebugElements( document.body );
    const savegameManager = new SavegameManager( SavegameDefault );
    const graphsManager = new GraphsManager( savegameManager.savegame.map.graphs );
    const canvasManager = new CanvasManager( width, height );
    const statistics = new Statistics();
    const stopwatch = new Stopwatch();

    let vehicles = null;
    let collisionDetection = null;
    let background = null;
    let navigator = null;
    // let menu = null;

    //---

    let canvasMainObject = null;
    let canvasMain = null;
    let contextMain = null;
    let imageDataMain = null;
    let dataMain = null;
    let clearData = null;// canvasManager.getDataByName( 'clear' );

    //let animationFrame = null;

    let mouseDown = false;
    let mousePos = { x: 0, y: 0 };
    // let mousePosStart = { x: 0, y: 0 };
    // let mousePosEnd = { x: 0, y: 0 };
    const mouseCursor = { diameter: 9, color: { r: 255, g: 255, b: 255, a: 255 }, position: { x: 0, y: 0 } };

    let currentNode = null;
    let currentGraphSegment = null;
    let selectedGraphSegments = [];
    // let allowGraphSegmentSplitting = true;
    let tempGraphSegments = [];

    let streetSegmentTexture = null;
    let streetSegmentImageObjects = [];

    let currentStreetSegment = null;

    //---

    graphsManager.setAllGraphSegmentPointNeighbours( 0 );

    const computeRoutes = true;
    const computeIntersections = true;
    const updateLookup = computeIntersections;

    graphsManager.computeGraphRoutesAndIntersections( 0, computeRoutes, computeIntersections, updateLookup );

    if ( debugMode === true ) {

        debugElements.addElementsByGraph( graphsManager.graphs[ 0 ] );

    }

    //--- ------------------------------------------------------------------------------------------------------------------------------

    function initGUI() {

        const _moveMap = () => {

            editorMode = EDITOR_MODE_ENUM.moveMap;

        }

        const _moveMapToInitialPosition = () => {

            navigator.navigateToInitialPosition();

        }

        const _addStreetSegment = () => {

            editorMode = EDITOR_MODE_ENUM.addStreetSegment;

        }

        const _addGraphSegment = () => {

            editorMode = EDITOR_MODE_ENUM.addGraphSegment;

        }

        const _removeGraphSegment = () => {

            editorMode = EDITOR_MODE_ENUM.removeGraphSegment;

        }

        const _bendGraphSegment = () => {

            editorMode = EDITOR_MODE_ENUM.bendGraphSegment;

        }
        
        const _bendGraphSegmentBetween = () => {

            editorMode = EDITOR_MODE_ENUM.bendGraphSegmentBetween;

        }

        const _autoBendGraphSegment = () => {

            editorMode = EDITOR_MODE_ENUM.autoBendGraphSegment;

        }

        const _straightenGraphSegment = () => {

            editorMode = EDITOR_MODE_ENUM.straightenGraphSegment;

        }

        const _splitGraphSegment = () => {

            editorMode = EDITOR_MODE_ENUM.splitGraphSegment;

        }

        const _splitGraphSegmentAt = () => {

            editorMode = EDITOR_MODE_ENUM.splitGraphSegmentAt;

        }

        const _toggleGraphWalkable = () => {

            editorMode = EDITOR_MODE_ENUM.toggleGraphWalkable;

        }

        const _toggleGraphDirections = () => {

            editorMode = EDITOR_MODE_ENUM.toggleGraphDirections;

        }

        const _movePoint = () => {

            editorMode = EDITOR_MODE_ENUM.movePoint;

        }

        const _addStartPoint = () => {

            editorMode = EDITOR_MODE_ENUM.addStartPoint;

        }

        const _addEndPoint = () => {

            editorMode = EDITOR_MODE_ENUM.addEndPoint;

        }

        const _removeStartEndPoints = () => {

            editorMode = EDITOR_MODE_ENUM.removeStartEndPoints;

        }

        const _setToggleWalkable = () => {

            editorMode = EDITOR_MODE_ENUM.togglePointWalkable;

        }

        const _toggleMouseSnapping = () => {

            Settings.MOUSE_SNAPPING.enabled = !Settings.MOUSE_SNAPPING.enabled;

        }

        const _getGraphSegment = () => {

            editorMode = EDITOR_MODE_ENUM.getGraphSegment;

        }

        const _getVehicle = () => {

            editorMode = EDITOR_MODE_ENUM.getVehicle;

        }

        const _getPoint = () => {

            editorMode = EDITOR_MODE_ENUM.getPoint;

        }

        const _showPointNeighbours = () => {

            editorMode = EDITOR_MODE_ENUM.showPointNeighbours;

        }

        const _showPointVehicleQueue = () => {

            editorMode = EDITOR_MODE_ENUM.showPointVehicleQueue;

        }

        const _showVehicleCheckpoints = () => {

            editorMode = EDITOR_MODE_ENUM.showVehicleCheckpoints;

        }

        const _showVehicleGridCells = () => {

            editorMode = EDITOR_MODE_ENUM.showVehicleGridCells;

        }

        const _toggleVehicleHalted = () => {

            editorMode = EDITOR_MODE_ENUM.toggleVehicleHalted;

        }

        const _followVehicle = () => {

            editorMode = EDITOR_MODE_ENUM.followVehicle;

        }

        const _removeVehicle = () => {

            editorMode = EDITOR_MODE_ENUM.removeVehicle;

        }

        const _removeAllVehicles = () => {

            vehicles.removeAllVehicles();

            //---

            // const graphIndex = 0;

            // const graph = graphsManager.graphs[ graphIndex ];

            // for ( let i = 0, l = graph.points.length; i < l; i ++ ) {

            //     graph.points[ i ].vehiclesWaiting = [];
    
            // }

        }

        const _clearAll = () => {

            const graphIndex = 0;

            graphsManager.graphs[ graphIndex ] = {
                id: graphIndex,
                routes: [],
                points: [],
                segments: [],
                streetPoints: [],
                streetSegments: []
            }

            tempGraphSegments = [];

            currentNode = null;
            currentGraphSegment = null;
            currentStreetSegment = null;
            selectedGraphSegments = [];
            streetSegmentImageObjects = [];

            debugElements.clear();
            graphsManager.clear();
            vehicles.clear();

        }

        const _logSavegame = () => {

            console.log( '-------------------------------------------------------------------------------------------------------------------------------\n' );
            // console.log( graphsManager.logGraphs() );
            console.log( savegameManager.logSavegame() );
            console.log( '-------------------------------------------------------------------------------------------------------------------------------\n' );

        }

        const _showRoute = () => {

            editorMode = EDITOR_MODE_ENUM.showRoute;

        }

        const _toggleDebugMode = () => {

            debugMode = !debugMode;

            if ( debugMode === true ) {

                debugElements.addElementsByGraph( graphsManager.graphs[ 0 ] );

            } else {

                debugElements.clear();

            }

        }

        const _playPauseSimulation = () => {

            vehicles.vehiclesSimulation = !vehicles.vehiclesSimulation;

            if ( vehicles.vehiclesSimulation === true ) {

                vehicles.startSimulation();

                stopwatch.start();

            } else {

                vehicles.stopSimulation();

                stopwatch.stop();

            }

        }

        const _saveSavegame = () => {

            savegameManager.saveSavegame();

        }

        const _loadSavegame = () => {

            savegameManager.loadSavegame( ( savegame ) => {

                console.log('loaded savegame: ', savegame );

                graphsManager.graphs = savegame.map.graphs;

                //---

                stopwatch.reset();
                stopwatch.start();

                //---

                tempGraphSegments = [];

                currentNode = null;
                currentGraphSegment = null;
                currentStreetSegment = null;
                selectedGraphSegments = [];

                navigator.updateGraph();

                vehicles.clear();
                vehicles.update();
                
                if ( vehicles.vehiclesSimulation === true ) {

                    vehicles.startSimulation();
    
                }
                
                debugElements.clear();

                //---

                graphsManager.setAllGraphSegmentPointNeighbours( 0 );
                graphsManager.clearLookupForPointsForAllGraphs();
                graphsManager.buildLookupForPointsForAllGraphs();

                //---

                const computeRoutes = true;
                const computeIntersections = true;
                const updateLookup = computeIntersections;

                graphsManager.computeGraphRoutesAndIntersections( 0, computeRoutes, computeIntersections, updateLookup );

                //---

                if ( debugMode === true ) {

                    debugElements.addElementsByGraph( graphsManager.graphs[ 0 ] );

                }

            } );

        }

        const _linkTo = () => {

            window.open( 'https://twitter.com/niklaswebdev', '_blank' );

        }

        //---

        const guiSetting = {

            'Move': _moveMap,
            'Move To Initial Position': _moveMapToInitialPosition,
            'Add Street Segment': _addStreetSegment,
            'Add Graph Segment': _addGraphSegment,
            // 'Allow Graph Segment Splitting': allowGraphSegmentSplitting,
            'Remove Graph Segment': _removeGraphSegment,
            'Bend Graph Segment': _bendGraphSegment,
            'Bend Graph Segment Between ': _bendGraphSegmentBetween,
            'Auto Bend Graph Segment': _autoBendGraphSegment,
            'Straighten Graph Segment': _straightenGraphSegment,
            'Split Graph Segment': _splitGraphSegment,
            'Split Graph Segment At': _splitGraphSegmentAt,
            'Toggle Graph Walkable': _toggleGraphWalkable,
            'Toggle Graph Directions': _toggleGraphDirections,
            'Move Point': _movePoint,
            'Add Start Point': _addStartPoint,
            'Add End Point': _addEndPoint,
            'Remove Start & End Points': _removeStartEndPoints,
            'Toggle Walkable Point': _setToggleWalkable,
            'Toggle Mouse Snapping': _toggleMouseSnapping,
            'Clear All': _clearAll,
            'Get GraphSegment': _getGraphSegment,
            'Get Vehicle': _getVehicle,
            'Get Point': _getPoint,
            'Toggle Vehicle Halted': _toggleVehicleHalted,
            'Follow Vehicle': _followVehicle,
            'Remove Vehicle': _removeVehicle,
            'Remove All Vehicles': _removeAllVehicles,
            'Show Route': _showRoute,
            'Show Point Neighbours': _showPointNeighbours,
            'Show Point Vehicle Queue': _showPointVehicleQueue,
            'Show Vehicle Checkpoints': _showVehicleCheckpoints,
            'Show Vehicle Grid Cells': _showVehicleGridCells,
            'Toggle Debug Mode': _toggleDebugMode,
            'Play/Pause Simulation': _playPauseSimulation,
            'Log Savegame': _logSavegame,
            'Save Savegame': _saveSavegame,
            'Load Savegame': _loadSavegame,
            '@niklaswebdev': _linkTo

        }

        const gui = new dat.GUI();

        const folderMap = gui.addFolder( 'Map' );

        folderMap.open();
        folderMap.add( guiSetting, 'Move' );
        folderMap.add( guiSetting, 'Move To Initial Position' );

        const folderEdit = gui.addFolder( 'Edit' );

        folderEdit.open();
        folderEdit.add( guiSetting, 'Add Street Segment' );
        folderEdit.add( guiSetting, 'Add Graph Segment' );
        // folderEdit.add( guiSetting, 'Allow Graph Segment Splitting' ).onChange( () => { allowGraphSegmentSplitting = guiSetting[ 'Allow Graph Segment Splitting' ]; } );
        folderEdit.add( guiSetting, 'Remove Graph Segment' );
        folderEdit.add( guiSetting, 'Bend Graph Segment' );
        folderEdit.add( guiSetting, 'Bend Graph Segment Between ' );
        folderEdit.add( guiSetting, 'Auto Bend Graph Segment' );
        folderEdit.add( guiSetting, 'Straighten Graph Segment' );
        folderEdit.add( guiSetting, 'Split Graph Segment' );
        folderEdit.add( guiSetting, 'Split Graph Segment At' );
        folderEdit.add( guiSetting, 'Toggle Graph Walkable' );
        folderEdit.add( guiSetting, 'Toggle Graph Directions' );
        folderEdit.add( guiSetting, 'Move Point' );
        folderEdit.add( guiSetting, 'Add Start Point' );
        folderEdit.add( guiSetting, 'Add End Point' );
        folderEdit.add( guiSetting, 'Remove Start & End Points' );
        folderEdit.add( guiSetting, 'Toggle Walkable Point' );
        folderEdit.add( guiSetting, 'Toggle Mouse Snapping' );
        folderEdit.add( guiSetting, 'Clear All' );

        const folderAnalyze = gui.addFolder( 'Analyze' );

        folderAnalyze.open();
        folderAnalyze.add( guiSetting, 'Get GraphSegment' );
        folderAnalyze.add( guiSetting, 'Get Vehicle' );
        folderAnalyze.add( guiSetting, 'Get Point' );
        folderAnalyze.add( guiSetting, 'Toggle Vehicle Halted' );
        folderAnalyze.add( guiSetting, 'Follow Vehicle' );
        folderAnalyze.add( guiSetting, 'Remove Vehicle' );
        folderAnalyze.add( guiSetting, 'Remove All Vehicles' );
        folderAnalyze.add( guiSetting, 'Show Route' );
        folderAnalyze.add( guiSetting, 'Show Point Neighbours' );
        folderAnalyze.add( guiSetting, 'Show Point Vehicle Queue' );
        folderAnalyze.add( guiSetting, 'Show Vehicle Checkpoints' );
        folderAnalyze.add( guiSetting, 'Show Vehicle Grid Cells' );
        folderAnalyze.add( guiSetting, 'Toggle Debug Mode' );

        const folderSimulation = gui.addFolder( 'Simulation' );

        folderSimulation.open();
        folderSimulation.add( guiSetting, 'Play/Pause Simulation' );

        const folderFile = gui.addFolder( 'File' );

        folderFile.open();
        folderFile.add( guiSetting, 'Log Savegame' );
        folderFile.add( guiSetting, 'Save Savegame' );
        folderFile.add( guiSetting, 'Load Savegame' );

        const folderContact = gui.addFolder( 'Contact' );

        //folderContact.open();
        folderContact.add( guiSetting, '@niklaswebdev' );

        //gui.close();

        //---

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';

        document.body.appendChild( stats.domElement );

        //---

        statistics.init();

    }

    //--- ------------------------------------------------------------------------------------------------------------------------------

    function init() {

        canvasManager.addMultipleCanvases( Settings.CANVASES_TO_BUILD );

        canvasMainObject = canvasManager.getCanvasObjectByName( 'main' );
        canvasMain = canvasMainObject.canvas;
        contextMain = canvasMainObject.context;

        canvasMain.style.pointerEvents = 'auto';
        canvasMain.addEventListener( 'mousedown', mouseDownHandler, false );
        canvasMain.addEventListener( 'mouseup', mouseUpHandler, false );
        canvasMain.addEventListener( 'mousemove', mouseMoveHandler, false );

        //---

        streetSegmentTexture = ImageFactory.getStreetSegmentTexture();

        background = new Background();
        
        //---

        window.addEventListener( 'resize', onResize, false );

        restart();

        //---

        vehicles = new Vehicles( 0, border );
        collisionDetection = new CollisionDetection();
        navigator = new Navigator();
        //savegameManager = new SavegameManager();

    }

    function onResize( event ) {

        restart();

    }

    function restart() {

        width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        canvasManager.resize( width, height );

        console.log( width, height );

        imageDataMain = contextMain.getImageData( 0, 0, width, height );
        dataMain = imageDataMain.data;

        clearData = canvasManager.getDataByName( 'clear' );

        //---

        if ( collisionDetection !== null ) {

            collisionDetection.updateGrid();

        }

        //---

        border.right = width;
        border.bottom = height;

        //---

        // if ( animationFrame !== null ) {

        //     cancelAnimFrame( animationFrame );

        // }

        // animationFrame = requestAnimFrame( render );

        animationFrameManager.restart();

        // setTimeout(()=>{animationFrameManager.stop()}, 2500)
        // setTimeout(()=>{animationFrameManager.start()}, 5000)

        //---

        background.resize();
        background.add();

        //---

        stopwatch.reset();
        stopwatch.start();

    }

    //--- ------------------------------------------------------------------------------------------------------------------------------

    function showRoute( position ) {

        tempGraphSegments = [];

        //---

        const graphIndex = 0;

        const graph = graphsManager.graphs[ graphIndex ];

        //---

        const point = GraphsManager.getPointByPosition( graph, position );//getPointByPosition( position );

        if ( point !== null ) {

            let routeFound = null;
            let routeColor = null;

            for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

                const route = graph.routes[ i ];

                if ( point.x === route.startPoint.x && point.y === route.startPoint.y || point.x === route.endPoint.x && point.y === route.endPoint.y ) {

                    routeFound = route;
                    routeColor = route.color;
                    // routeColor = Settings.ROUTE_COLORS[ i ];
                    // routeColor = Tools.getRouteColorRGBA( i );

                    break;

                }

            }

            if ( routeFound !== null ) {

                for ( let i = 0, l = routeFound.graphSegments.length; i < l; i ++ ) {

                    const graphSegment = routeFound.graphSegments[ i ];

                    tempGraphSegments.push( { type: 'bezier', p0: { x: graphSegment.p0.x, y: graphSegment.p0.y }, controlPoint: { x: graphSegment.controlPoint.x, y: graphSegment.controlPoint.y }, p1: { x: graphSegment.p1.x, y: graphSegment.p1.y }, color: { r: routeColor.r, g: routeColor.g, b: routeColor.b, a: routeColor.a } } );
                    tempGraphSegments.push( { type: 'circ', position: { x: graphSegment.p0.x, y: graphSegment.p0.y }, diameter: 15, color: { r: routeColor.r, g: routeColor.g, b: routeColor.b, a: routeColor.a } } );
                    tempGraphSegments.push( { type: 'circ', position: { x: graphSegment.p1.x, y: graphSegment.p1.y }, diameter: 15, color: { r: routeColor.r, g: routeColor.g, b: routeColor.b, a: routeColor.a } } );

                }

            }

        }

    }

    //---

    function showVehicleCheckpoints( position ) {

        tempGraphSegments = [];

        //---

        const vehicle = vehicles.getVehicleByPosition( position );

        if ( vehicle !== null ) {

            const colorPointCheck = { r: 255, g: 255, b: 255, a: 255 };
            const colorPointVehicle = { r: 0, g: 255, b: 0, a: 255 };

            if ( vehicle.checkPoint0 !== null ) {

                tempGraphSegments.push( { type: 'circ', position: { x: vehicle.checkPoint0.x, y: vehicle.checkPoint0.y }, diameter: 15, color: colorPointCheck } );

            }

            if ( vehicle.checkPoint1 !== null ) {

                tempGraphSegments.push( { type: 'circ', position: { x: vehicle.checkPoint1.x, y: vehicle.checkPoint1.y }, diameter: 15, color: colorPointCheck } );

            }

            tempGraphSegments.push( { type: 'circ', position: { x: vehicle.position.x, y: vehicle.position.y }, diameter: 12, color: colorPointVehicle } );

        }

    }

    function showVehicleGridCells( position ) {

        tempGraphSegments = [];

        //---

        const vehicle = vehicles.getVehicleByPosition( position );

        if ( vehicle !== null ) {

            const gridCells = [ vehicle.gridCell ];

            for ( let i = 0, l = vehicle.gridCell.neighbors.length; i < l; i ++ ) {

                gridCells.push( vehicle.gridCell.neighbors[ i ] );

            }

            for ( let i = 0, l = gridCells.length; i < l; i ++ ) {

                const gridCell = gridCells[ i ];

                const boxPosition = { x: gridCell.x + gridCell.width / 2, y: gridCell.y + gridCell.height / 2 };

                if ( i === 0 ) {

                    tempGraphSegments.push( { type: 'box', position: boxPosition, width: gridCell.width - 1, height: gridCell.height - 1, color: { r: 0, g: 155, b: 0, a: 255 } } );

                } else {

                    tempGraphSegments.push( { type: 'box', position: boxPosition, width: gridCell.width - 1, height: gridCell.height - 1, color: { r: 155, g: 0, b: 0, a: 255 } } );

                    if ( gridCell.vehicles.length > 0 ) {

                        tempGraphSegments.push( { type: 'line', p0: { x: gridCell.x | 0, y: gridCell.y | 0 }, p1: { x: gridCell.x + gridCell.width | 0, y: gridCell.y + gridCell.height | 0 }, color: { r: 155, g: 0, b: 0, a: 255 } } );
                        tempGraphSegments.push( { type: 'line', p0: { x: gridCell.x | 0, y: gridCell.y + gridCell.height | 0 }, p1: { x: gridCell.x + gridCell.width | 0, y: gridCell.y | 0 }, color: { r: 155, g: 0, b: 0, a: 255 } } );

                    }

                }

            }

        }

    }

    //---

    function showPointNeighbours( position ) {

        tempGraphSegments = [];

        //---

        const graphIndex = 0;

        const graph = graphsManager.graphs[ graphIndex ];

        const point = GraphsManager.getPointByPosition( graph, position );//getPointByPosition( position );

        if ( point !== null ) {

            const colorPoint = { r: 255, g: 255, b: 255, a: 255 };
            const colorGraphsegment = { r: 255, g: 255, b: 255, a: 155 };

            for ( let i = 0, l = point.neighbourPoints.length; i < l; i ++ ) {

                const pointNeighbour = point.neighbourPoints[ i ];

                tempGraphSegments.push( { type: 'circ', position: { x: pointNeighbour.x, y: pointNeighbour.y }, diameter: 15, color: colorPoint } );

            }

            for ( let i = 0, l = point.neighbourGraphsegments.length; i < l; i ++ ) {

                const graphsegmentNeighbour = point.neighbourGraphsegments[ i ];

                tempGraphSegments.push( { type: 'bezier', p0: { x: graphsegmentNeighbour.p0.x, y: graphsegmentNeighbour.p0.y }, controlPoint: { x: graphsegmentNeighbour.controlPoint.x, y: graphsegmentNeighbour.controlPoint.y }, p1: { x: graphsegmentNeighbour.p1.x, y: graphsegmentNeighbour.p1.y }, color: colorGraphsegment } );

            }

        }

    }

    function showPointVehicleQueue( position ) {

        tempGraphSegments = [];

        //---

        const graphIndex = 0;

        const graph = graphsManager.graphs[ graphIndex ];

        const point = GraphsManager.getPointByPosition( graph, position );//getPointByPosition( position );

        if ( point !== null ) {

            for ( let i = 0, l = point.vehiclesWaiting.length; i < l; i ++ ) {

                const vehicle = vehicles.getVehicleById( point.vehiclesWaiting[ i ] );

                tempGraphSegments.push( { type: 'circ', position: { x: vehicle.position.x, y: vehicle.position.y }, diameter: 15, color: { r: 255, g: 255, b: 255, a: 255 } } );

            }

        }


    }

    //---

    function getStreetSegmentsByPoint( p ) {

        const graphIndex = 0;

        const graph = graphsManager.graphs[ graphIndex ];

        //---

        const result = [];

        for ( let i = 0, l = graph.streetSegments.length; i < l; i ++ ) {

            const streetSegment = graph.streetSegments[ i ];

            if ( p.x === streetSegment.p0.x && p.y === streetSegment.p0.y ) {

                result.push( { streetSegment: streetSegment, side: 0 } );

            }

            if ( streetSegment.p1 !== null ) {

                if ( p.x === streetSegment.p1.x && p.y === streetSegment.p1.y ) {

                    result.push( { streetSegment: streetSegment, side: 1 } );

                }

            }

        }

        return result;

    }

    function addStreetSegment( position ) {

        const graphIndex = 0;

        const graph = graphsManager.graphs[ graphIndex ];

        //---

        const walkable = true;
        const direction = '><';
        //const modus = 'add';//'new'

        const laneChange = true;
        const laneDistance = 18;

        //---

        if ( currentStreetSegment === null ) {

            const connectedStreetSegments = getStreetSegmentsByPoint( position );

            let modus = null;
            let angle0 = 0;
            let lanesCount = 4;
            let lanes = [];

            if ( connectedStreetSegments.length > 0 ) {

                const connectedStreetSegment = connectedStreetSegments[ 0 ];

                modus = 'add';
                angle0 = connectedStreetSegment.streetSegment[ 'angle' + connectedStreetSegment.side.toString() ];

                for ( let i = 0, l = connectedStreetSegment.streetSegment.lanes.length; i < l; i ++ ) {

                    const connectedLane = connectedStreetSegment.streetSegment.lanes[ i ];
                    const connectedLanePoint = connectedLane[ 'p' + connectedStreetSegment.side.toString() ];

                    const lane = getNewStreetSegmentLane( { x: connectedLanePoint.x, y: connectedLanePoint.y }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 } );

                    lanes.push( lane );

                }

            } else {

                modus = 'add';//'new';
                angle0 = Math.PI * 0.98;

                // rechts = Math.PI * 0.00;
                // unten  = Math.PI * 0.50;
                // links  = Math.PI * 1.00;
                // oben   = Math.PI * 1.50;

                for ( let i = 0, l = lanesCount; i < l; i ++ ) {

                    const lane = getNewStreetSegmentLane( { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 } );

                    lanes.push( lane );

                }

            }

            //console.log( '--->>> ', getStreetSegmentsByPoint( position ) );



            const streetSegment = {

                id: graph.streetSegments.length,

                p0: { x: Tools.unifyNumber( position.x ), y: Tools.unifyNumber( position.y ) },
                p1: null,
                centerPoint: { x: 0, y: 0 },
                controlPoint: { x: 0, y: 0 },
                angle0: angle0,
                angle1: 0,
                lanes: lanes,
                centerLanes: [],
                crossLanes: [],
                graphSegments: [],
                borders: [],

                walkable: walkable,
                direction: direction,
                modus: modus,

                modus: modus,

                laneChange: laneChange,
                laneDistance: laneDistance,

                boundingClientRect: { x: 0, y: 0, width: 0, height: 0 },
                // image: null,
                imageId: Tools.getUID()

            };

            currentStreetSegment = streetSegment;

            graph.streetSegments.push( currentStreetSegment );

        } else {

            currentStreetSegment.p1 = { x: Tools.unifyNumber( position.x ), y: Tools.unifyNumber( position.y ) };

            //---

            const convertLaneToGraphSegment = ( lane ) => {

                let graphSegmentPoint0 = GraphsManager.getPointByPosition( graph, lane.p0 );
                let graphSegmentPoint1 = GraphsManager.getPointByPosition( graph, lane.p1 );

                if ( graphSegmentPoint0 === null ) {

                    graphSegmentPoint0 = GraphsManager.getGraphSegmentPoint( lane.p0 );

                    graph.points.push( graphSegmentPoint0 );

                }

                if ( graphSegmentPoint1 === null ) {

                    graphSegmentPoint1 = GraphsManager.getGraphSegmentPoint( lane.p1 );

                    graph.points.push( graphSegmentPoint1 );

                }

                // const graphSegment = {

                //     id: graph.segments.length,
                //     p0: { x: graphSegmentPoint0.x, y: graphSegmentPoint0.y },
                //     p1: { x: graphSegmentPoint1.x, y: graphSegmentPoint1.y },
                //     controlPoint: { x: lane.controlPoint.x, y: lane.controlPoint.y },
                //     centerPoint: { x: lane.centerPoint.x, y: lane.centerPoint.y },
                //     length: getGraphSegmentLength( lane.p0, lane.p1, lane.controlPoint ),
                //     walkable: currentStreetSegment.walkable,
                //     direction: currentStreetSegment.direction,

                // };

                //function getGraphSegmentObject( id, p0, p1 = null, controlPoint = null, centerPoint = null, length = 0, walkable = true, direction = '><' ) {
                const graphSegment = getGraphSegmentObject( graph.segments.length, graphSegmentPoint0, graphSegmentPoint1, lane.controlPoint, lane.centerPoint, getGraphSegmentLength( lane.p0, lane.p1, lane.controlPoint ), currentStreetSegment.walkable, currentStreetSegment.direction );

                graphsManager.setGraphSegmentPointNeighbours( 0, GraphsManager.getPointByPosition( graph, graphSegment.p0 ) );
                graphsManager.setGraphSegmentPointNeighbours( 0, GraphsManager.getPointByPosition( graph, graphSegment.p1 ) );

                return graphSegment;

            };

            for ( let i = 0, l = currentStreetSegment.lanes.length; i < l; i ++ ) {

                const lane = currentStreetSegment.lanes[ i ];
                const graphSegment = convertLaneToGraphSegment( lane );

                currentStreetSegment.graphSegments.push( graphSegment );
                graph.segments.push( graphSegment );

            }

            for ( let i = 0, l = currentStreetSegment.crossLanes.length; i < l; i ++ ) {

                const lane = currentStreetSegment.crossLanes[ i ];
                const graphSegment = convertLaneToGraphSegment( lane );

                currentStreetSegment.graphSegments.push( graphSegment );
                graph.segments.push( graphSegment );

            }

            //---

            drawStreetSegment( currentStreetSegment );

            //---

            currentStreetSegment = null;

            //---

            tempGraphSegments = [];

        }

    }

    function drawStreetSegment( streetSegment ) {

        if ( streetSegment.p0 !== null && streetSegment.p1 !== null ) {

            const precision = 100;

            // context.setLineDash( [] );

            const streetBorder0 = streetSegment.borders[ 0 ];
            const streetBorder1 = streetSegment.borders[ 1 ];

            //---
            //boundingClientRect

            const minX = Math.min( streetBorder0.p0.x, streetBorder0.p1.x, streetBorder1.p0.x, streetBorder1.p1.x ) - 100;
            const maxX = Math.max( streetBorder0.p0.x, streetBorder0.p1.x, streetBorder1.p0.x, streetBorder1.p1.x ) + 100;
            const minY = Math.min( streetBorder0.p0.y, streetBorder0.p1.y, streetBorder1.p0.y, streetBorder1.p1.y ) - 100;
            const maxY = Math.max( streetBorder0.p0.y, streetBorder0.p1.y, streetBorder1.p0.y, streetBorder1.p1.y ) + 100;

            streetSegment.boundingClientRect.x = minX;
            streetSegment.boundingClientRect.y = minY;
            streetSegment.boundingClientRect.width = maxX - minX;
            streetSegment.boundingClientRect.height = maxY - minY;

            //---

            const _canvas = document.createElement( 'canvas' );
            const _context = _canvas.getContext( '2d' );

            _canvas.width = streetSegment.boundingClientRect.width;
            _canvas.height = streetSegment.boundingClientRect.height;

            _context.setLineDash( [] );

            //---

            for ( let iC = 0, iCStep = 1 / precision; iC < 1 + iCStep; iC += iCStep ) {

                if ( iC > 0 ) {

                    const pTL = Tools.interpolateQuadraticBezier( streetBorder0.p0, streetBorder0.controlPoint, streetBorder0.p1, iC - iCStep );
                    const pTR = Tools.interpolateQuadraticBezier( streetBorder0.p0, streetBorder0.controlPoint, streetBorder0.p1, iC );
                    const pBL = Tools.interpolateQuadraticBezier( streetBorder1.p0, streetBorder1.controlPoint, streetBorder1.p1, iC - iCStep );
                    const pBR = Tools.interpolateQuadraticBezier( streetBorder1.p0, streetBorder1.controlPoint, streetBorder1.p1, iC );

                    //https://stackoverflow.com/questions/9536257/how-to-anti-alias-clip-edges-in-html5-canvas-under-chrome-windows
                    // _context.globalCompositeOperation = 'destination-in';
                    // _context.globalCompositeOperation = 'source-atop';
                    _context.save();
                    // _context.globalAlpha = 1.0;
                    
                    _context.beginPath();
                    _context.moveTo( pTL.x - minX, pTL.y - minY );
                    _context.lineTo( pTR.x - minX, pTR.y - minY );
                    _context.lineTo( pBR.x - minX, pBR.y - minY );
                    _context.lineTo( pBL.x - minX, pBL.y - minY );
                    // _context.lineWidth = 2;
                    _context.closePath();

                    // _context.strokeStyle = 'rgba( 63, 59, 58, 1.00 )';
                    // _context.stroke(); 
                    _context.fillStyle = 'rgba( 63, 59, 58, 1.00 )';
                    _context.fill( 'evenodd' );
                    
                    _context.clip();
                    //_context.drawImage( imageTexture, 0, 0, 256, 256 );
                    _context.fillStyle = _context.createPattern( streetSegmentTexture, 'repeat' );
                    _context.fillRect( 0, 0, streetSegment.boundingClientRect.width, streetSegment.boundingClientRect.height );

                    _context.restore();
                    // _context.globalCompositeOperation = 'source-over';

                }

            }

            _context.beginPath();
            _context.moveTo( streetBorder0.p0.x - minX, streetBorder0.p0.y - minY );
            _context.quadraticCurveTo( streetBorder0.controlPoint.x - minX, streetBorder0.controlPoint.y - minY, streetBorder0.p1.x - minX, streetBorder0.p1.y - minY );
            _context.lineWidth = 2;
            _context.strokeStyle = 'rgba( 135, 135, 135, 1.00 )';
            _context.stroke();

            _context.beginPath();
            _context.moveTo( streetBorder1.p0.x - minX, streetBorder1.p0.y - minY );
            _context.quadraticCurveTo( streetBorder1.controlPoint.x - minX, streetBorder1.controlPoint.y - minY, streetBorder1.p1.x - minX, streetBorder1.p1.y - minY );
            _context.lineWidth = 2;
            _context.strokeStyle = 'rgba( 135, 135, 135, 1.00 )';
            _context.stroke();

            if ( streetSegment.lanes.length > 1 ) {

                _context.beginPath();
                _context.moveTo( streetSegment.p0.x - minX, streetSegment.p0.y - minY );
                _context.quadraticCurveTo( streetSegment.controlPoint.x - minX, streetSegment.controlPoint.y - minY, streetSegment.p1.x - minX, streetSegment.p1.y - minY );
                _context.lineWidth = 6;
                _context.strokeStyle = 'rgba( 135, 135, 135, 1.00 )';
                _context.stroke();

                _context.beginPath();
                _context.moveTo( streetSegment.p0.x - minX, streetSegment.p0.y - minY );
                _context.quadraticCurveTo( streetSegment.controlPoint.x - minX, streetSegment.controlPoint.y - minY, streetSegment.p1.x - minX, streetSegment.p1.y - minY );
                _context.lineWidth = 2;
                _context.strokeStyle = 'rgba( 63, 59, 58, 1.00 )';
                _context.stroke();

            }

            
            streetSegment.centerLanes.forEach( ( centerLane ) => {

                _context.setLineDash( [ 8, 18 ] );
                _context.beginPath();
                _context.moveTo( centerLane.p0.x - minX, centerLane.p0.y - minY );
                _context.quadraticCurveTo( centerLane.controlPoint.x - minX, centerLane.controlPoint.y - minY, centerLane.p1.x - minX, centerLane.p1.y - minY );
                _context.lineWidth = 3;
                _context.strokeStyle = 'rgba( 135, 135, 135, 0.75 )';
                _context.stroke();
                
            } );

            //---
            //funktioniert so nicht mehr weil keine bilder an den worker übergeben werden können.

            // streetSegment.image = new Image( streetSegment.boundingClientRect.width, streetSegment.boundingClientRect.height );
            // streetSegment.image.src = _canvas.toDataURL();

            //---

            const streetImage = new Image( streetSegment.boundingClientRect.width, streetSegment.boundingClientRect.height );

            streetImage.src = _canvas.toDataURL();

            const streetImageObject = getNewStreetImageObject( streetImage, streetSegment.boundingClientRect, streetSegment.imageId );

            streetSegmentImageObjects.push( streetImageObject );

        }

    }

    function drawStreetSegments() {

        /*
        const graphIndex = 0;

        const graph = graphsManager.graphs[ graphIndex ];

        //---

        for ( let i = 0, l = graph.streetSegments.length; i < l; i ++ ) {

            const streetSegment = graph.streetSegments[ i ];

            if ( streetSegment.p0 !== null && streetSegment.p1 !== null ) {

                //contextMain.save();
                contextMain.drawImage( streetSegment.image, streetSegment.boundingClientRect.x, streetSegment.boundingClientRect.y, streetSegment.boundingClientRect.width, streetSegment.boundingClientRect.height );
                //contextMain.restore();

            }

        }
        */
        
        for ( let i = 0, l = streetSegmentImageObjects.length; i < l; i ++ ) {

            const streetImageObject = streetSegmentImageObjects[ i ];

            contextMain.drawImage( streetImageObject.image, streetImageObject.boundingClientRect.x, streetImageObject.boundingClientRect.y, streetImageObject.boundingClientRect.width, streetImageObject.boundingClientRect.height );

        }

    }

    function getNewStreetImageObject( image, boundingClientRect, id ) {

        return {

            image: image,
            boundingClientRect: boundingClientRect,
            id: id

        }

    }

    function getNewStreetSegmentLane( p0, p1, centerPoint, controlPoint ) {

        return {

            p0: p0,
            p1: p1,
            centerPoint: centerPoint,
            controlPoint: controlPoint

        };

    }

    function constructStreetSegment( position ) {



    }

    //---

    function addGraphSegment( position ) {

        const graphIndex = 0;

        const graph = graphsManager.graphs[ graphIndex ];

        if ( currentGraphSegment === null ) {

            let graphSegmentPoint = GraphsManager.getPointByPosition( graph, position );

            if ( graphSegmentPoint === null ) {

                graphSegmentPoint = GraphsManager.getGraphSegmentPoint( position );

                graph.points.push( graphSegmentPoint );

                graphsManager.addPointForLookupForPoints( graphIndex, GraphsManager.getLookupPointId( graphSegmentPoint ), graphSegmentPoint );

            }

            currentGraphSegment = getGraphSegmentObject( graph.segments.length, graphSegmentPoint );
            
            graph.segments.push( currentGraphSegment );

            graphsManager.setGraphSegmentPointNeighbours( 0, GraphsManager.getPointByPosition( graph, currentGraphSegment.p0 ) );

            if ( debugMode === true ) {

                addDebugElement( position.x, position.y, position.x.toFixed( 0 ).toString() + ', ' + position.y.toFixed( 0 ).toString(), '#cdcbc8', 0, 9, null );

            }

        } else {

            let graphSegmentPoint = GraphsManager.getPointByPosition( graph, position );

            if ( graphSegmentPoint === null ) {

                graphSegmentPoint = GraphsManager.getGraphSegmentPoint( position );

                graph.points.push( graphSegmentPoint );

                graphsManager.addPointForLookupForPoints( graphIndex, GraphsManager.getLookupPointId( graphSegmentPoint ), graphSegmentPoint );

            }

            currentGraphSegment.p1 = { x: Tools.unifyNumber( graphSegmentPoint.x ), y: Tools.unifyNumber( graphSegmentPoint.y ) };

            //GraphSegment points are not allowed to have the same position.
            if ( currentGraphSegment.p0.x === currentGraphSegment.p1.x && currentGraphSegment.p0.y === currentGraphSegment.p1.y ) {

                const graphSegments = getGraphSegmentsByPosition( currentGraphSegment.p0 );

                if ( graphSegments.length === 1 ) {

                    graph.points.splice( graph.points.findIndex( ( point ) => point.x === currentGraphSegment.p0.x && point.y === currentGraphSegment.p0.y ), 1 );

                    graphsManager.removePointFromLookupForPoints( graphIndex, GraphsManager.getLookupPointId( currentGraphSegment.p0 ) );
                
                }

                graph.segments.pop();

                if ( debugMode === true ) {

                    debugElements.addElementsByGraph( graph );

                }

            } else {

                currentGraphSegment.centerPoint = getGraphSegmentCenter( currentGraphSegment );
                currentGraphSegment.controlPoint = getGraphSegmentCenter( currentGraphSegment );
                currentGraphSegment.length = getGraphSegmentLength( currentGraphSegment.p0, currentGraphSegment.p1, currentGraphSegment.controlPoint ); //Tools.getDistance( currentGraphSegment.p0, currentGraphSegment.p1 );

                graphsManager.setGraphSegmentPointNeighbours( 0, GraphsManager.getPointByPosition( graph, currentGraphSegment.p0 ) );
                graphsManager.setGraphSegmentPointNeighbours( 0, GraphsManager.getPointByPosition( graph, currentGraphSegment.p1 ) );

                // if ( allowGraphSegmentSplitting === true ) {

                //     const intersections = getGraphSegmentsIntersections( currentGraphSegment, 100 );

                //     for ( let i = 0, l = intersections.length; i < l; i ++ ) {

                //         const intersection = intersections[ i ];

                //         console.log( intersection );

                //         const t0 = getTOfQuadraticBezierFromIntersectionPoint( intersection.graphSegment0, intersection.point );
                //         const t1 = getTOfQuadraticBezierFromIntersectionPoint( intersection.graphSegment1, intersection.point );

                //         splitGraphSegment( intersection.graphSegment0, t0 );
                //         splitGraphSegment( intersection.graphSegment1, t1 );

                //     }

                // }

                if ( debugMode === true ) {

                    addDebugElement( position.x, position.y, position.x.toFixed( 0 ).toString() + ', ' + position.y.toFixed( 0 ).toString(), '#cdcbc8', 0, 9, null );
                    addDebugElement( currentGraphSegment.centerPoint.x, currentGraphSegment.centerPoint.y, currentGraphSegment.id.toString(), 'white', -4, -6, null );

                    addDebugElement( currentGraphSegment.centerPoint.x, currentGraphSegment.centerPoint.y, currentGraphSegment.length.toFixed( 2 ).toString(), 'grey', 10, -5, null );

                }

            }

            currentGraphSegment = null;

        }

    }

    function removeGraphSegmentByPosition( position ) {

        const graphSegment = getGraphSegmentByPosition( position );

        if ( graphSegment !== null ) {

            removeGraphSegment( graphSegment );

        }

    }

    function removeGraphSegment( graphSegment ) {

        const graphIndex = 0;

        const graph = graphsManager.graphs[ graphIndex ];

        //---

        let p0Found = GraphsManager.getPointByPosition( graph, graphSegment.p0 );
        let p1Found = GraphsManager.getPointByPosition( graph, graphSegment.p1 );

        for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

            const pS = graph.segments[ i ];

            if ( pS.id !== graphSegment.id ) {

                if ( graphSegment.p0.x === pS.p0.x && graphSegment.p0.y === pS.p0.y || graphSegment.p0.x === pS.p1.x && graphSegment.p0.y === pS.p1.y ) {

                    p0Found = null;

                }

                if ( graphSegment.p1.x === pS.p0.x && graphSegment.p1.y === pS.p0.y || graphSegment.p1.x === pS.p1.x && graphSegment.p1.y === pS.p1.y ) {

                    p1Found = null;

                }

            }

        }

        graph.segments.splice( graph.segments.findIndex( ( pS ) => pS.id === graphSegment.id ), 1 );

        if ( p0Found !== null ) {

            graph.points.splice( graph.points.findIndex( ( point ) => point.x === p0Found.x && point.y === p0Found.y ), 1 );

            graphsManager.removePointFromLookupForPoints( graphIndex, GraphsManager.getLookupPointId( p0Found ) );


        }

        if ( p1Found !== null ) {

            graph.points.splice( graph.points.findIndex( ( point ) => point.x === p1Found.x && point.y === p1Found.y ), 1 );

            graphsManager.removePointFromLookupForPoints( graphIndex, GraphsManager.getLookupPointId( p1Found ) );

        }

        //---

        for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

            graph.segments[ i ].id = i;

        }

        for ( let i = 0, l = graph.points.length; i < l; i ++ ) {

            graphsManager.setGraphSegmentPointNeighbours( 0, graph.points[ i ] );

        }

        //---

        if ( debugMode === true ) {

            debugElements.addElementsByGraph( graph );

        }

        tempGraphSegments = [];

    }

    function getGraphSegmentObject( id, p0, p1 = null, controlPoint = null, centerPoint = null, length = 0, walkable = true, direction = '><' ) {

        p0 = { x: Tools.unifyNumber( p0.x ), y: Tools.unifyNumber( p0.y ) };
        p1 = p1 === null ? null : { x: Tools.unifyNumber( p1.x ), y: Tools.unifyNumber( p1.y ) };
        controlPoint = controlPoint === null ? null : { x: controlPoint.x, y: controlPoint.y };
        centerPoint = centerPoint === null ? null : { x: centerPoint.x, y: centerPoint.y };

        return {

            id: id,
            p0: p0,
            p1: p1,
            controlPoint: controlPoint,
            centerPoint: centerPoint,
            length: length,
            walkable: walkable,
            direction: direction,

        };

    }

    function bendGraphSegment( position ) {

        const graphSegment = currentGraphSegment;

        if ( graphSegment !== null ) {

            graphSegment.controlPoint.x = position.x;
            graphSegment.controlPoint.y = position.y;

            graphSegment.centerPoint = Tools.interpolateQuadraticBezier( graphSegment.p0, graphSegment.controlPoint, graphSegment.p1, 0.50 );

            graphSegment.length = getGraphSegmentLength( graphSegment.p0, graphSegment.p1, graphSegment.controlPoint );

        }

        //---

        if ( debugMode === true ) {

            debugElements.addElementsByGraph( graphsManager.graphs[ 0 ] );

        }

        tempGraphSegments = [];

        tempGraphSegments.push( { type: 'line', p0: { x: graphSegment.p0.x, y: graphSegment.p0.y }, p1: { x: graphSegment.controlPoint.x, y: graphSegment.controlPoint.y }, color: { r: 230, g: 29, b: 95, a: 255 } } );
        tempGraphSegments.push( { type: 'line', p0: { x: graphSegment.p1.x, y: graphSegment.p1.y }, p1: { x: graphSegment.controlPoint.x, y: graphSegment.controlPoint.y }, color: { r: 230, g: 29, b: 95, a: 255 } } );
        tempGraphSegments.push( { type: 'circfill', position: { x: graphSegment.controlPoint.x, y: graphSegment.controlPoint.y }, diameter: 3, color: { r: 230, g: 29, b: 95, a: 255 } } );
        tempGraphSegments.push( { type: 'bezier', p0: { x: graphSegment.p0.x, y: graphSegment.p0.y }, controlPoint: { x: graphSegment.controlPoint.x, y: graphSegment.controlPoint.y }, p1: { x: graphSegment.p1.x, y: graphSegment.p1.y }, color: { r: 255, g: 255, b: 255, a: 255 } } );

    }

    function bendGraphSegmentBetween( position ) {

        const graphIndex = 0;

        const graph = graphsManager.graphs[ graphIndex ];

        const graphSegment = getGraphSegmentByPosition( position );

        if ( graphSegment !== null ) {

            if ( selectedGraphSegments.length === 0 ) {

                selectedGraphSegments.push( graphSegment );

                tempGraphSegments = [];

                tempGraphSegments.push( { type: 'bezier', p0: { x: graphSegment.p0.x, y: graphSegment.p0.y }, controlPoint: { x: graphSegment.controlPoint.x, y: graphSegment.controlPoint.y }, p1: { x: graphSegment.p1.x, y: graphSegment.p1.y }, color: { r: 155, g: 155, b: 155, a: 255 } } );
        
            } else if ( selectedGraphSegments.length === 1 ) {

                selectedGraphSegments.push( graphSegment );

                tempGraphSegments.push( { type: 'bezier', p0: { x: graphSegment.p0.x, y: graphSegment.p0.y }, controlPoint: { x: graphSegment.controlPoint.x, y: graphSegment.controlPoint.y }, p1: { x: graphSegment.p1.x, y: graphSegment.p1.y }, color: { r: 155, g: 155, b: 155, a: 255 } } );
        
                //---

                const neighbourGraphSegment0 = selectedGraphSegments[ 0 ];
                const neighbourGraphSegment1 = selectedGraphSegments[ 1 ];

                //---

                const centerGraphSegments = [];

                centerGraphSegments.push( ...GraphsManager.getNextGraphSegmentsByPoint( neighbourGraphSegment0.p0, graph.segments ) );
                centerGraphSegments.push( ...GraphsManager.getNextGraphSegmentsByPoint( neighbourGraphSegment0.p1, graph.segments ) );
                centerGraphSegments.push( ...GraphsManager.getNextGraphSegmentsByPoint( neighbourGraphSegment1.p0, graph.segments ) );
                centerGraphSegments.push( ...GraphsManager.getNextGraphSegmentsByPoint( neighbourGraphSegment1.p1, graph.segments ) );

                let centerGraphSegment = null;

                for ( let i = 0, l = centerGraphSegments.length; i < l; i ++ ) {

                    const cGS = centerGraphSegments[ i ];

                    if ( 

                        ( 
                        Tools.comparePoints( neighbourGraphSegment0.p0, cGS.p0 ) === true ||
                        Tools.comparePoints( neighbourGraphSegment0.p0, cGS.p1 ) === true ||
                        Tools.comparePoints( neighbourGraphSegment0.p1, cGS.p0 ) === true ||
                        Tools.comparePoints( neighbourGraphSegment0.p1, cGS.p1 ) === true 
                        ) 
                        &&
                        ( 
                        Tools.comparePoints( neighbourGraphSegment1.p0, cGS.p0 ) === true ||
                        Tools.comparePoints( neighbourGraphSegment1.p0, cGS.p1 ) === true ||
                        Tools.comparePoints( neighbourGraphSegment1.p1, cGS.p0 ) === true ||
                        Tools.comparePoints( neighbourGraphSegment1.p1, cGS.p1 ) === true 
                        ) 
                        
                    ) {

                        centerGraphSegment = cGS;

                    }

                }

                if ( centerGraphSegment === null ) {

                    console.log( 'No Graph Segment could be found between the two selected Graph Segments' );

                    selectedGraphSegments = [];

                    tempGraphSegments = [];

                    return;

                }

                const centerGraphSegmentControlPointSave = {
            
                    x: centerGraphSegment.controlPoint.x,
                    y: centerGraphSegment.controlPoint.y,
        
                }

                const neighbourGraphSegment0ControlPoint = neighbourGraphSegment0.controlPoint;
                const neighbourGraphSegment1ControlPoint = neighbourGraphSegment1.controlPoint;

                let angle0 = 0;
                let angle1 = 0;

                if ( Tools.getDistance( neighbourGraphSegment0ControlPoint, centerGraphSegment.p0 ) <= Tools.getDistance( neighbourGraphSegment0ControlPoint, centerGraphSegment.p1 ) ) {

                    angle0 = Math.atan2( neighbourGraphSegment0ControlPoint.y - centerGraphSegment.p0.y, neighbourGraphSegment0ControlPoint.x - centerGraphSegment.p0.x ) - Settings.MATH_PI_050;

                } else {

                    angle0 = Math.atan2( neighbourGraphSegment1ControlPoint.y - centerGraphSegment.p0.y, neighbourGraphSegment1ControlPoint.x - centerGraphSegment.p0.x ) - Settings.MATH_PI_050;

                }
                
                if ( Tools.getDistance( neighbourGraphSegment1ControlPoint, centerGraphSegment.p0 ) <= Tools.getDistance( neighbourGraphSegment1ControlPoint, centerGraphSegment.p1 ) ) {

                    angle1 = Math.atan2( neighbourGraphSegment0ControlPoint.y - centerGraphSegment.p1.y, neighbourGraphSegment0ControlPoint.x - centerGraphSegment.p1.x ) - Settings.MATH_PI_050;

                } else {

                    angle1 = Math.atan2( neighbourGraphSegment1ControlPoint.y - centerGraphSegment.p1.y, neighbourGraphSegment1ControlPoint.x - centerGraphSegment.p1.x ) - Settings.MATH_PI_050;

                }

                const sin0 = Math.sin( angle0 );
                const cos0 = Math.cos( angle0 );
                const sin1 = Math.sin( angle1 );
                const cos1 = Math.cos( angle1 );

                const px0 = sin0 * 1000 + centerGraphSegment.p0.x;
                const py0 = -cos0 * 1000 + centerGraphSegment.p0.y;
                const px1 = sin1 * 1000 + centerGraphSegment.p1.x;
                const py1 = -cos1 * 1000 + centerGraphSegment.p1.y;

                //---

                const centerGraphSegmentControlPoint = Tools.getLinesIntersectionPoint( centerGraphSegment.p0.x, centerGraphSegment.p0.y, px0, py0, centerGraphSegment.p1.x, centerGraphSegment.p1.y, px1, py1 );

                //---

                centerGraphSegment.controlPoint.x = centerGraphSegmentControlPoint.x;
                centerGraphSegment.controlPoint.y = centerGraphSegmentControlPoint.y;

                centerGraphSegment.centerPoint = Tools.interpolateQuadraticBezier( centerGraphSegment.p0, centerGraphSegment.controlPoint, centerGraphSegment.p1, 0.50 );

                centerGraphSegment.length = getGraphSegmentLength( centerGraphSegment.p0, centerGraphSegment.p1, centerGraphSegment.controlPoint );

                //---

                tempGraphSegments.push( { type: 'bezier', p0: { x: neighbourGraphSegment0.p0.x, y: neighbourGraphSegment0.p0.y }, controlPoint: { x: neighbourGraphSegment0.controlPoint.x, y: neighbourGraphSegment0.controlPoint.y }, p1: { x: neighbourGraphSegment0.p1.x, y: neighbourGraphSegment0.p1.y }, color: { r: 155, g: 155, b: 155, a: 255 } } );
                tempGraphSegments.push( { type: 'bezier', p0: { x: neighbourGraphSegment1.p0.x, y: neighbourGraphSegment1.p0.y }, controlPoint: { x: neighbourGraphSegment1.controlPoint.x, y: neighbourGraphSegment1.controlPoint.y }, p1: { x: neighbourGraphSegment1.p1.x, y: neighbourGraphSegment1.p1.y }, color: { r: 155, g: 155, b: 155, a: 255 } } );

                tempGraphSegments.push( { type: 'bezier', p0: { x: centerGraphSegment.p0.x, y: centerGraphSegment.p0.y }, controlPoint: { x: centerGraphSegmentControlPointSave.x, y: centerGraphSegmentControlPointSave.y }, p1: { x: centerGraphSegment.p1.x, y: centerGraphSegment.p1.y }, color: { r: 155, g: 0, b: 0, a: 255 } } );
                tempGraphSegments.push( { type: 'bezier', p0: { x: centerGraphSegment.p0.x, y: centerGraphSegment.p0.y }, controlPoint: { x: centerGraphSegmentControlPoint.x, y: centerGraphSegmentControlPoint.y }, p1: { x: centerGraphSegment.p1.x, y: centerGraphSegment.p1.y }, color: { r: 0, g: 255, b: 0, a: 255 } } );

                if ( Tools.getDistance( neighbourGraphSegment0ControlPoint, centerGraphSegment.p0 ) <= Tools.getDistance( neighbourGraphSegment0ControlPoint, centerGraphSegment.p1 ) ) {

                    tempGraphSegments.push( { type: 'line', p0: { x: centerGraphSegment.p0.x, y: centerGraphSegment.p0.y }, p1: { x: neighbourGraphSegment0ControlPoint.x, y: neighbourGraphSegment0ControlPoint.y }, color: { r: 230, g: 29, b: 95, a: 255 } } );

                } else {

                    tempGraphSegments.push( { type: 'line', p0: { x: centerGraphSegment.p1.x, y: centerGraphSegment.p1.y }, p1: { x: neighbourGraphSegment0ControlPoint.x, y: neighbourGraphSegment0ControlPoint.y }, color: { r: 230, g: 29, b: 95, a: 255 } } );

                }
                
                if ( Tools.getDistance( neighbourGraphSegment1ControlPoint, centerGraphSegment.p0 ) <= Tools.getDistance( neighbourGraphSegment1ControlPoint, centerGraphSegment.p1 ) ) {

                    tempGraphSegments.push( { type: 'line', p0: { x: centerGraphSegment.p0.x, y: centerGraphSegment.p0.y }, p1: { x: neighbourGraphSegment1ControlPoint.x, y: neighbourGraphSegment1ControlPoint.y }, color: { r: 230, g: 29, b: 95, a: 255 } } );

                } else {

                    tempGraphSegments.push( { type: 'line', p0: { x: centerGraphSegment.p1.x, y: centerGraphSegment.p1.y }, p1: { x: neighbourGraphSegment1ControlPoint.x, y: neighbourGraphSegment1ControlPoint.y }, color: { r: 230, g: 29, b: 95, a: 255 } } );

                }

                tempGraphSegments.push( { type: 'circfill', position: { x: neighbourGraphSegment0ControlPoint.x, y: neighbourGraphSegment0ControlPoint.y }, diameter: 3, color: { r: 230, g: 29, b: 95, a: 255 } } );
                tempGraphSegments.push( { type: 'circfill', position: { x: neighbourGraphSegment1ControlPoint.x, y: neighbourGraphSegment1ControlPoint.y }, diameter: 3, color: { r: 230, g: 29, b: 95, a: 255 } } );

                tempGraphSegments.push( { type: 'line', p0: { x: centerGraphSegment.p0.x, y: centerGraphSegment.p0.y }, p1: { x: centerGraphSegmentControlPoint.x, y: centerGraphSegmentControlPoint.y }, color: { r: 230, g: 230, b: 95, a: 255 } } );
                tempGraphSegments.push( { type: 'line', p0: { x: centerGraphSegment.p1.x, y: centerGraphSegment.p1.y }, p1: { x: centerGraphSegmentControlPoint.x, y: centerGraphSegmentControlPoint.y }, color: { r: 230, g: 230, b: 95, a: 255 } } );

                tempGraphSegments.push( { type: 'circfill', position: { x: centerGraphSegmentControlPoint.x, y: centerGraphSegmentControlPoint.y }, diameter: 3, color: { r: 230, g: 29, b: 95, a: 255 } } );

            } 

        }

    }

    function autoBendGraphSegmentByPosition( position ) {

        const graphSegment = getGraphSegmentByPosition( position );

        if ( graphSegment !== null ) {

            autoBendGraphSegment( graphSegment );

        }

    }

    function autoBendGraphSegment( graphSegment ) {

        const graphIndex = 0;

        const graph = graphsManager.graphs[ graphIndex ];

        const graphSegmentControlPointSave = {
            
            x: graphSegment.controlPoint.x,
            y: graphSegment.controlPoint.y,

        }

        //---

        const neighbourGraphSegments00 = GraphsManager.getNextGraphSegmentsByPoint( graphSegment.p0, graph.segments );
        const neighbourGraphSegments01 = GraphsManager.getNextGraphSegmentsByPoint( graphSegment.p1, graph.segments );

        if ( neighbourGraphSegments00.length === 1 || neighbourGraphSegments01.length === 1 ) {

            console.log( 'Impossible to bend this graph segment automatically' );

            return;

        }

        //---

        const neighbourGraphSegments0 = [];
        const neighbourGraphSegments1 = [];

        for ( let i = 0, l = neighbourGraphSegments00.length; i < l; i ++ ) {

            const neighbourGraphSegment = neighbourGraphSegments00[ i ];

            if ( neighbourGraphSegment.id !== graphSegment.id ) {

                neighbourGraphSegments0.push( neighbourGraphSegment );

            }

        }

        for ( let i = 0, l = neighbourGraphSegments01.length; i < l; i ++ ) {

            const neighbourGraphSegment = neighbourGraphSegments01[ i ];

            if ( neighbourGraphSegment.id !== graphSegment.id ) {

                neighbourGraphSegments1.push( neighbourGraphSegment );

            }

        }

        //---

        const neighbourGraphSegment0 = GraphsManager.getClosestGraphSegmentByAngle( graphSegment, neighbourGraphSegments0 );
        const neighbourGraphSegment1 = GraphsManager.getClosestGraphSegmentByAngle( graphSegment, neighbourGraphSegments1 );

        const neighbourGraphSegment0ControlPoint = neighbourGraphSegment0.controlPoint;
        const neighbourGraphSegment1ControlPoint = neighbourGraphSegment1.controlPoint;

        const angle0 = Math.atan2( neighbourGraphSegment0ControlPoint.y - graphSegment.p0.y, neighbourGraphSegment0ControlPoint.x - graphSegment.p0.x ) - Settings.MATH_PI_050;
        const angle1 = Math.atan2( neighbourGraphSegment1ControlPoint.y - graphSegment.p1.y, neighbourGraphSegment1ControlPoint.x - graphSegment.p1.x ) - Settings.MATH_PI_050;

        const sin0 = Math.sin( angle0 );
        const cos0 = Math.cos( angle0 );
        const sin1 = Math.sin( angle1 );
        const cos1 = Math.cos( angle1 );

        const px0 = sin0 * 1000 + graphSegment.p0.x;
        const py0 = -cos0 * 1000 + graphSegment.p0.y;
        const px1 = sin1 * 1000 + graphSegment.p1.x;
        const py1 = -cos1 * 1000 + graphSegment.p1.y;

        //---

        const graphSegmentControlPoint = Tools.getLinesIntersectionPoint( graphSegment.p0.x, graphSegment.p0.y, px0, py0, graphSegment.p1.x, graphSegment.p1.y, px1, py1 );

        //---

        graphSegment.controlPoint.x = graphSegmentControlPoint.x;
        graphSegment.controlPoint.y = graphSegmentControlPoint.y;

        graphSegment.centerPoint = Tools.interpolateQuadraticBezier( graphSegment.p0, graphSegment.controlPoint, graphSegment.p1, 0.50 );

        graphSegment.length = getGraphSegmentLength( graphSegment.p0, graphSegment.p1, graphSegment.controlPoint );

        //---

        tempGraphSegments = [];

        tempGraphSegments.push( { type: 'bezier', p0: { x: neighbourGraphSegment0.p0.x, y: neighbourGraphSegment0.p0.y }, controlPoint: { x: neighbourGraphSegment0.controlPoint.x, y: neighbourGraphSegment0.controlPoint.y }, p1: { x: neighbourGraphSegment0.p1.x, y: neighbourGraphSegment0.p1.y }, color: { r: 155, g: 155, b: 155, a: 255 } } );
        tempGraphSegments.push( { type: 'bezier', p0: { x: neighbourGraphSegment1.p0.x, y: neighbourGraphSegment1.p0.y }, controlPoint: { x: neighbourGraphSegment1.controlPoint.x, y: neighbourGraphSegment1.controlPoint.y }, p1: { x: neighbourGraphSegment1.p1.x, y: neighbourGraphSegment1.p1.y }, color: { r: 155, g: 155, b: 155, a: 255 } } );

        tempGraphSegments.push( { type: 'bezier', p0: { x: graphSegment.p0.x, y: graphSegment.p0.y }, controlPoint: { x: graphSegmentControlPointSave.x, y: graphSegmentControlPointSave.y }, p1: { x: graphSegment.p1.x, y: graphSegment.p1.y }, color: { r: 155, g: 0, b: 0, a: 255 } } );
        tempGraphSegments.push( { type: 'bezier', p0: { x: graphSegment.p0.x, y: graphSegment.p0.y }, controlPoint: { x: graphSegmentControlPoint.x, y: graphSegmentControlPoint.y }, p1: { x: graphSegment.p1.x, y: graphSegment.p1.y }, color: { r: 0, g: 255, b: 0, a: 255 } } );

        tempGraphSegments.push( { type: 'line', p0: { x: graphSegment.p0.x, y: graphSegment.p0.y }, p1: { x: neighbourGraphSegment0ControlPoint.x, y: neighbourGraphSegment0ControlPoint.y }, color: { r: 230, g: 29, b: 95, a: 255 } } );
        tempGraphSegments.push( { type: 'line', p0: { x: graphSegment.p1.x, y: graphSegment.p1.y }, p1: { x: neighbourGraphSegment1ControlPoint.x, y: neighbourGraphSegment1ControlPoint.y }, color: { r: 230, g: 29, b: 95, a: 255 } } );

        tempGraphSegments.push( { type: 'circfill', position: { x: neighbourGraphSegment0ControlPoint.x, y: neighbourGraphSegment0ControlPoint.y }, diameter: 3, color: { r: 230, g: 29, b: 95, a: 255 } } );
        tempGraphSegments.push( { type: 'circfill', position: { x: neighbourGraphSegment1ControlPoint.x, y: neighbourGraphSegment1ControlPoint.y }, diameter: 3, color: { r: 230, g: 29, b: 95, a: 255 } } );

        tempGraphSegments.push( { type: 'line', p0: { x: graphSegment.p0.x, y: graphSegment.p0.y }, p1: { x: graphSegmentControlPoint.x, y: graphSegmentControlPoint.y }, color: { r: 230, g: 230, b: 95, a: 255 } } );
        tempGraphSegments.push( { type: 'line', p0: { x: graphSegment.p1.x, y: graphSegment.p1.y }, p1: { x: graphSegmentControlPoint.x, y: graphSegmentControlPoint.y }, color: { r: 230, g: 230, b: 95, a: 255 } } );

        tempGraphSegments.push( { type: 'circfill', position: { x: graphSegmentControlPoint.x, y: graphSegmentControlPoint.y }, diameter: 3, color: { r: 230, g: 29, b: 95, a: 255 } } );

    }

    function straightenGraphSegmentByPosition( position ) {

        const graphSegment = getGraphSegmentByPosition( position );

        if ( graphSegment !== null ) {

            straightenGraphSegment( graphSegment );

        }

    }

    function straightenGraphSegment( graphSegment ) {

        const centerPoint = getGraphSegmentCenter( graphSegment );

        graphSegment.centerPoint.x = centerPoint.x;
        graphSegment.centerPoint.y = centerPoint.y;
        graphSegment.controlPoint.x = centerPoint.x;
        graphSegment.controlPoint.y = centerPoint.y;

        graphSegment.length = getGraphSegmentLength( graphSegment.p0, graphSegment.p1, graphSegment.controlPoint );

        //---

        if ( debugMode === true ) {

            debugElements.addElementsByGraph( graphsManager.graphs[ 0 ] );

        }

        tempGraphSegments = [];

    }

    function splitGraphSegmentByPosition( position, t = 0.50 ) {

        const graphSegment = getGraphSegmentByPosition( position );

        if ( graphSegment !== null ) {

            splitGraphSegment( graphSegment, t );

        }

    }

    function splitGraphSegment( graphSegment, t = 0.50 ) {

        const graphIndex = 0;

        const graph = graphsManager.graphs[ graphIndex ];

        //---

        const newGraphSegment0 = trimGraphSegment( graphSegment, t, false );
        const newGraphSegment1 = trimGraphSegment( graphSegment, t, true );

        const newGraphSegments = [ newGraphSegment0, newGraphSegment1 ];

        //---

        removeGraphSegment( graphSegment );

        //---

        for ( let i = 0, l = newGraphSegments.length; i < l; i ++ ) {

            const newGraphSegment = newGraphSegments[ i ];

            newGraphSegment.id = graph.segments.length;

            const graphSegment0Point0New = GraphsManager.getGraphSegmentPoint( newGraphSegment.p0 );
            const graphSegment0Point0Array = graph.points.find( ( point ) => point.x === newGraphSegment.p0.x && point.y === newGraphSegment.p0.y );
            const graphSegment0Point1New = GraphsManager.getGraphSegmentPoint( newGraphSegment.p1 );
            const graphSegment0Point1Array = graph.points.find( ( point ) => point.x === newGraphSegment.p1.x && point.y === newGraphSegment.p1.y );

            let graphSegmentPoint0 = graphSegment0Point0Array;
            let graphSegmentPoint1 = graphSegment0Point1Array;

            if ( typeof graphSegmentPoint0 === 'undefined' ) {

                graphSegmentPoint0 = graphSegment0Point0New;

                graph.points.push( graphSegmentPoint0 );

                graphsManager.addPointForLookupForPoints( graphIndex, GraphsManager.getLookupPointId( graphSegmentPoint0 ), graphSegmentPoint0 );

            }

            if ( typeof graphSegmentPoint1 === 'undefined' ) {

                graphSegmentPoint1 = graphSegment0Point1New;

                graph.points.push( graphSegmentPoint1 );

                graphsManager.addPointForLookupForPoints( graphIndex, GraphsManager.getLookupPointId( graphSegmentPoint1 ), graphSegmentPoint1 );

            }

            newGraphSegment.centerPoint = Tools.interpolateQuadraticBezier( newGraphSegment.p0, newGraphSegment.controlPoint, newGraphSegment.p1, 0.50 );
            newGraphSegment.length = getGraphSegmentLength( newGraphSegment.p0, newGraphSegment.p1, newGraphSegment.controlPoint ); //Tools.getDistance( newGraphSegment0.p0, newGraphSegment0.p1 );
            newGraphSegment.walkable = true;
            newGraphSegment.direction = '><';

            graph.segments.push( newGraphSegment );

            graphsManager.setGraphSegmentPointNeighbours( 0, GraphsManager.getPointByPosition( graph, graphSegmentPoint0 ) );
            graphsManager.setGraphSegmentPointNeighbours( 0, GraphsManager.getPointByPosition( graph, graphSegmentPoint1 ) );

        }

        //---

        if ( debugMode === true ) {

            debugElements.addElementsByGraph( graph );

        }

        tempGraphSegments = [];

    }

    function trimGraphSegment ( graphSegment, t = 0.50, fromStart = false ) {

		let startPoint;
        let endPoint;

		if ( fromStart ) {

			endPoint = graphSegment.p0;
			startPoint = graphSegment.p1;
            t = 1 - t;

		} else {

			startPoint = graphSegment.p0;
            endPoint = graphSegment.p1;

        }

		const dscx = graphSegment.controlPoint.x - startPoint.x;
		const dscy = graphSegment.controlPoint.y - startPoint.y;
		const dcex = endPoint.x - graphSegment.controlPoint.x;
        const dcey = endPoint.y - graphSegment.controlPoint.y;

        const newGraphSegment = {

            p0: startPoint,
            controlPoint: { x: startPoint.x + dscx * t, y: startPoint.y + dscy * t },
            p1: startPoint

        };

		let dx = graphSegment.controlPoint.x + dcex * t - newGraphSegment.controlPoint.x;
        let dy = graphSegment.controlPoint.y + dcey * t - newGraphSegment.controlPoint.y;

		if ( fromStart ) {

            newGraphSegment.p0 = {

                x: Tools.unifyNumber( newGraphSegment.controlPoint.x + dx * t ),
                y: Tools.unifyNumber( newGraphSegment.controlPoint.y + dy * t )

            };

		} else {

            newGraphSegment.p1 = {

                x: Tools.unifyNumber( newGraphSegment.controlPoint.x + dx * t ),
                y: Tools.unifyNumber( newGraphSegment.controlPoint.y + dy * t )

            };

        }

        console.log( '-----------------------------------------------------------------' );
        console.log( newGraphSegment );
        console.log( '-----------------------------------------------------------------' );

        return newGraphSegment;

	}

    //---

    function addStartPointToGraph( position ) {

        const graphIndex = 0;

        const graph = graphsManager.graphs[ graphIndex ];

        //---

        const route = { startPoint: null, endPoint: null, graphSegments: [], length: 0, color: Tools.getRouteColorRGBA( graph.routes.length ), newestVehicleId: null };

        const startPoint = GraphsManager.getPointByPosition( graph, position );

        if ( startPoint !== null ) {

            route.startPoint = {

                x: startPoint.x,
                y: startPoint.y

            };

            graph.routes.push( route );

        }

        //---

        if ( debugMode === true ) {

            debugElements.addElementsByGraph( graph );

        }

    }

    function addEndPointToGraph( position ) {

        const graphIndex = 0;

        const graph = graphsManager.graphs[ graphIndex ];

        //---

        let routeIndex = 0;

        for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

            const route = graph.routes[ i ];

            if ( route.endPoint === null ) {

                routeIndex = i;

                break;

            }

        }

        const route = graph.routes[ routeIndex ];

        const endPoint = GraphsManager.getPointByPosition( graph, position );

        if ( endPoint !== null ) {

            route.endPoint = {

                x: endPoint.x,
                y: endPoint.y

            };

        }

        //---

        if ( debugMode === true ) {

            debugElements.addElementsByGraph( graph );

        }

    }

    function removeStartEndPoints( position ) {

        const graphIndex = 0;

        const graph = graphsManager.graphs[ graphIndex ];

        //---

        let routeIndex = 0;

        for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

            const route = graph.routes[ i ];

            if ( route.startPoint.x === position.x && route.startPoint.y === position.y ) {

                routeIndex = i;

                break;

            }

            if ( route.endPoint !== null ) {

                if ( route.endPoint.x === position.x && route.endPoint.y === position.y ) {

                    routeIndex = i;

                    break;

                }

            }

        }

        graph.routes.splice( routeIndex, 1 );

        //---

        vehicles.removeVehiclesByRouteIndex( routeIndex );

        //---

        if ( debugMode === true ) {

            debugElements.addElementsByGraph( graph );

        }

    }

    function setCurrentNode( position ) {

        const graphIndex = 0;

        const graph = graphsManager.graphs[ graphIndex ];

        const point = GraphsManager.getPointByPosition( graph, position );

        if ( point !== null ) {

            currentNode = point;

        }

        if ( debugMode === true ) {

            debugElements.addElementsByGraph( graph );

        }

    }

    function addSelectedGraphSegments( position ) {

        selectedGraphSegments = [];

        //---

        const graphIndex = 0;

        const graph = graphsManager.graphs[ graphIndex ];

        for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

            const graphSegment = graph.segments[ i ];

            if ( graphSegment.p0.x === position.x && graphSegment.p0.y === position.y ) {

                selectedGraphSegments.push( graphSegment );

            } else if ( graphSegment.p1.x === position.x && graphSegment.p1.y === position.y ) {

                selectedGraphSegments.push( graphSegment );

            }

        }

    }

    function removeSelectedGraphSegments( position ) {

        selectedGraphSegments = [];

    }

    // function removeDuplicatePointsFromArray() {

    //     const graphIndex = 0;

    //     const graph = graphsManager.graphs[ graphIndex ];

    //     const point = currentNode;

    //     const duplicatePoints = graph.points.filter( ( p ) => p.x === point.x && p.y === point.y );

    //     if ( duplicatePoints.length > 1 ) {

    //         graph.points.splice( graph.points.findIndex( ( p ) => p.x === point.x && p.y === point.y ), 1 );

    //     }

    // }

    // function removeDuplicateGraphSegmentsFromArray() {

    //     const graphIndex = 0;

    //     const graph = graphsManager.graphs[ graphIndex ];

    //     //under construction

    // }

    function movePoint( position ) {

        tempGraphSegments = [];

        //---

        const graphIndex = 0;

        const graph = graphsManager.graphs[ graphIndex ];

        const point = currentNode;

        if ( point !== null ) {

            const pointOldX = point.x;
            const pointOldY = point.y;

            point.x = position.x;
            point.y = position.y;

            for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

                const route = graph.routes[ i ];

                if ( route.startPoint.x === pointOldX && route.startPoint.y === pointOldY ) {

                    route.startPoint.x = point.x;
                    route.startPoint.y = point.y;

                }

                if ( route.endPoint.x === pointOldX && route.endPoint.y === pointOldY ) {

                    route.endPoint.x = point.x;
                    route.endPoint.y = point.y;

                }

            }

            for ( let i = 0, l = selectedGraphSegments.length; i < l; i ++ ) {

                const graphSegment = selectedGraphSegments[ i ];

                let diffX = 0;
                let diffY = 0;

                if ( graphSegment.p0.x === pointOldX && graphSegment.p0.y === pointOldY ) {

                    diffX = point.x - graphSegment.p0.x;
                    diffY = point.y - graphSegment.p0.y;

                    graphSegment.p0.x = point.x;
                    graphSegment.p0.y = point.y;

                } else if ( graphSegment.p1.x === pointOldX && graphSegment.p1.y === pointOldY ) {

                    diffX = point.x - graphSegment.p1.x;
                    diffY = point.y - graphSegment.p1.y;

                    graphSegment.p1.x = point.x;
                    graphSegment.p1.y = point.y;

                }

                graphSegment.length = getGraphSegmentLength( graphSegment.p0, graphSegment.p1, graphSegment.controlPoint );// Tools.getDistance( graphSegment.p0, graphSegment.p1 );
                //graphSegment.centerPoint = getGraphSegmentCenter( graphSegment );
                graphSegment.centerPoint = Tools.interpolateQuadraticBezier( graphSegment.p0, graphSegment.controlPoint, graphSegment.p1, 0.50 );

                graphSegment.controlPoint.x += diffX / 2;
                graphSegment.controlPoint.y += diffY / 2;

                //tempGraphSegments.push( { type: 'circfill', position: { x: graphSegment.controlPoint.x, y: graphSegment.controlPoint.y }, diameter: 3, color: { r: 230, g: 29, b: 95, a: 255 } } );

                //getGraphSegmentsIntersections( graphSegment, 25 );

            }

            //---

            graphsManager.updateLookupForPoints( graphIndex, GraphsManager.getLookupPointId( point ), point, '' + pointOldX + pointOldY );

            //---

            if ( debugMode === true ) {

                debugElements.addElementsByGraph( graph );

            }

            //tempGraphSegments = [];

        }

    }

    function togglePointWalkable( position ) {

        tempGraphSegments = [];

        //---

        const graphIndex = 0;

        const graph = graphsManager.graphs[ graphIndex ];

        const point = GraphsManager.getPointByPosition( graph, position );

        if ( point !== null ) {

            point.walkable = !point.walkable;

        }

    }

    function toggleGraphWalkable( position ) {

        tempGraphSegments = [];

        //---

        const graphSegment = getGraphSegmentByPosition( position );

        if ( graphSegment !== null ) {

            graphSegment.walkable = !graphSegment.walkable;

            graphsManager.setAllGraphSegmentPointNeighbours( 0 );//muss optimiert werden. Es sollte möglich sein nur die betroffenen Punkte upzudaten und nicht alle.

        }

    }

    function toggleGraphDirections( position ) {

        tempGraphSegments = [];

        //---

        //const graphIndex = 0;

        //const graph = graphsManager.graphs[ graphIndex ];

        const graphSegment = getGraphSegmentByPosition( position );

        if ( graphSegment !== null ) {

            let graphDirectionIndex = GRAPH_SEGMENT_DIRECTIONS.findIndex( ( direction ) => direction === graphSegment.direction );

            graphDirectionIndex += 1;

            if ( graphDirectionIndex > GRAPH_SEGMENT_DIRECTIONS.length - 1 ) {

                graphDirectionIndex = 0;

            }

            graphSegment.direction = GRAPH_SEGMENT_DIRECTIONS[ graphDirectionIndex ];

        }

    }

    function getGraphSegmentByPosition( position ) {

        const graphIndex = 0;

        const graph = graphsManager.graphs[ graphIndex ];

        //---

        let distanceTotal = Infinity;
        let indexSave = -1;

        for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

            const graphSegment = graph.segments[ i ];

            //const distanceToGraphSegment = signedDistanceToLine( position, graphSegment.p0.x, graphSegment.p0.y, graphSegment.p1.x, graphSegment.p1.y );
            const distanceToGraphSegment = signedDistanceToQuadraticBezier( position, graphSegment.p0, graphSegment.p1, graphSegment.controlPoint );

            if ( distanceToGraphSegment < distanceTotal ) {

                distanceTotal = distanceToGraphSegment;

                indexSave = i;

            }

        }

        if ( indexSave > -1 && distanceTotal <= SNAP_TO_DISTANCE ) {

            return graph.segments[ indexSave ];

        }

        return null;

    }

    function getGraphSegmentsByPosition( position ) {

        const graphIndex = 0;

        const graph = graphsManager.graphs[ graphIndex ];

        //---

        const result = [];

        for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

            const graphSegment = graph.segments[ i ];

            if ( graphSegment.p0.x === position.x && graphSegment.p0.y === position.y || graphSegment.p1.x === position.x && graphSegment.p1.y === position.y ) {

                result.push( graphSegment );

            }

        }

        return result;

    }

    //--- ------------------------------------------------------------------------------------------------------------------------------

    function getGraphSegmentLength( p0, p1, controlPoint ) {

        //return Tools.getDistance( p0, p1 );

        //---

        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;

        const cx = ( dx === 0 ) ? 0 : ( controlPoint.x - p0.x ) / dx;
        const cy = ( dy === 0 ) ? 0 : ( controlPoint.y - p0.y ) / dy;

		let d = 0;
		let p = p0;
		let np = null;

		for ( let i = 1; i < GRAPH_SEGMENT_CURVE_ACCURACY; i++ ) {

			const t = i / GRAPH_SEGMENT_CURVE_ACCURACY;
			const f1 = 2 * t * ( 1 - t );
            const f2 = t * t;

			np = { x: p0.x + dx * ( f1 * cx + f2 ), y: p0.y + dy * ( f1 * cy + f2 ) };
			d += Tools.getDistance( p, np );
            p = np;

        }

		return d + Tools.getDistance( p, p1 );

    }

    function getGraphSegmentCenter( graphSegment ) {

        const x = ( graphSegment.p0.x + graphSegment.p1.x ) / 2;
        const y = ( graphSegment.p0.y + graphSegment.p1.y ) / 2;

        return { x: x, y: y };

    }

    function getLinesIntersectionPoint( x1, y1, x2, y2, x3, y3, x4, y4 ) {

        // Check if none of the lines are of length 0
        if ( ( x1 === x2 && y1 === y2 ) || ( x3 === x4 && y3 === y4 ) ) {

            return null;

        }

        const denominator = ( ( y4 - y3 ) * ( x2 - x1 ) - ( x4 - x3 ) * ( y2 - y1 ) );

        // Lines are parallel
        if ( denominator === 0 ) {

            return null;

        }

        const ua = ( ( x4 - x3 ) * ( y1 - y3 ) - ( y4 - y3 ) * ( x1 - x3 ) ) / denominator;
        // const ub = ( ( x2 - x1 ) * ( y1 - y3 ) - ( y2 - y1 ) * ( x1 - x3 ) ) / denominator;

        // is the intersection along the segments
        // if ( ua < 0 || ua > 1 || ub < 0 || ub > 1 ) {

        //     return null

        // }

        // Return a object with the x and y coordinates of the intersection
        return {
            x: x1 + ua * ( x2 - x1 ),
            y: y1 + ua * ( y2 - y1 )
        };

    }

    // function showGraphSegmentIntersectionPointsWithLine( line, precision = 25 ) {

    //     tempGraphSegments = [];

    //     //---

    //     const graphIndex = 0;

    //     const graph = graphsManager.graphs[ graphIndex ];

    //     //---

    //     for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

    //         const compareGraphSegment = graph.segments[ i ];

    //         if ( line.id !== compareGraphSegment.id ) {

    //             for ( let iC = 0, iCStep = 1 / precision; iC < 1 + iCStep; iC += iCStep ) {

    //                 if ( iC > 0 ) {

    //                     const tempCompareGraphSegment = {};

    //                     tempCompareGraphSegment.p0 = Tools.interpolateQuadraticBezier( compareGraphSegment.p0, compareGraphSegment.controlPoint, compareGraphSegment.p1, iC - iCStep );
    //                     tempCompareGraphSegment.p1 = Tools.interpolateQuadraticBezier( compareGraphSegment.p0, compareGraphSegment.controlPoint, compareGraphSegment.p1, iC );

    //                     const intersectionPoint = getLinesIntersectionPoint( line.p0.x, line.p0.y, line.p1.x, line.p1.y, tempCompareGraphSegment.p0.x, tempCompareGraphSegment.p0.y, tempCompareGraphSegment.p1.x, tempCompareGraphSegment.p1.y );

    //                     if ( intersectionPoint !== null ) {

    //                         if ( Math.round( intersectionPoint.x ) !== line.p0.x && Math.round( intersectionPoint.y ) !== line.p0.y && Math.round( intersectionPoint.x ) !== line.p1.x && Math.round( intersectionPoint.y ) !== line.p1.y ) {

    //                             tempGraphSegments.push( { type: 'circfill', position: { x: intersectionPoint.x, y: intersectionPoint.y }, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );

    //                         }

    //                     }

    //                 }

    //             }

    //         }

    //     }

    // }

    // function getGraphSegmentsIntersections( inputGraphSegment, precision = 25 ) {

    //     //tempGraphSegments = [];

    //     //---

    //     const graphIndex = 0;

    //     const graph = graphsManager.graphs[ graphIndex ];

    //     //---

    //     // const intersectionPoints = [];
    //     const intersections = [];

    //     for ( let iI = 0, iIStep = 1 / precision; iI < 1 + iIStep; iI += iIStep ) {

    //         if ( iI > 0 ) {

    //             const tempInputGraphSegment = {};

    //             tempInputGraphSegment.id = inputGraphSegment.id;
    //             tempInputGraphSegment.p0 = Tools.interpolateQuadraticBezier( inputGraphSegment.p0, inputGraphSegment.controlPoint, inputGraphSegment.p1, iI - iIStep );
    //             tempInputGraphSegment.p1 = Tools.interpolateQuadraticBezier( inputGraphSegment.p0, inputGraphSegment.controlPoint, inputGraphSegment.p1, iI );

    //             //tempGraphSegments.push( { type: 'line', p0: { x: tempInputGraphSegment.p0.x | 0, y: tempInputGraphSegment.p0.y | 0 }, p1: { x: tempInputGraphSegment.p1.x | 0, y: tempInputGraphSegment.p1.y | 0 }, color: { r: 255, g: 0, b: 0, a: 255 } } );
    //             //tempGraphSegments.push( { type: 'circfill', position: { x: tempInputGraphSegment.p0.x | 0, y: tempInputGraphSegment.p0.y | 0 }, diameter: 9, color: { r: 255, g: 0, b: 0, a: 255 } } );

    //             for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

    //                 const compareGraphSegment = graph.segments[ i ];
    //                 // const compareIndex = selectedGraphSegments.findIndex( ( graphSegment ) => graphSegment.id === compareGraphSegment.id );

    //                 // if ( compareIndex > -1 ) {

    //                 //     continue;

    //                 // }

    //                 for ( let iC = 0, iCStep = 1 / precision; iC < 1 + iCStep; iC += iCStep ) {

    //                     if ( iC > 0 ) {

    //                         const tempCompareGraphSegment = {};

    //                         tempCompareGraphSegment.id = compareGraphSegment.id;
    //                         tempCompareGraphSegment.p0 = Tools.interpolateQuadraticBezier( compareGraphSegment.p0, compareGraphSegment.controlPoint, compareGraphSegment.p1, iC - iCStep );
    //                         tempCompareGraphSegment.p1 = Tools.interpolateQuadraticBezier( compareGraphSegment.p0, compareGraphSegment.controlPoint, compareGraphSegment.p1, iC );

    //                         if ( tempInputGraphSegment.id !== tempCompareGraphSegment.id ) {

    //                             //tempGraphSegments.push( { type: 'line', p0: { x: tempCompareGraphSegment.p0.x | 0, y: tempCompareGraphSegment.p0.y | 0 }, p1: { x: tempCompareGraphSegment.p1.x | 0, y: tempCompareGraphSegment.p1.y | 0 }, color: { r: 255, g: 0, b: 0, a: 255 } } );

    //                             const intersectionPoint = getLinesIntersectionPoint( tempInputGraphSegment.p0.x, tempInputGraphSegment.p0.y, tempInputGraphSegment.p1.x, tempInputGraphSegment.p1.y, tempCompareGraphSegment.p0.x, tempCompareGraphSegment.p0.y, tempCompareGraphSegment.p1.x, tempCompareGraphSegment.p1.y );

    //                             if ( intersectionPoint !== null ) {

    //                                 if ( Math.round( intersectionPoint.x ) !== tempInputGraphSegment.p0.x && Math.round( intersectionPoint.y ) !== tempInputGraphSegment.p0.y && Math.round( intersectionPoint.x ) !== tempInputGraphSegment.p1.x && Math.round( intersectionPoint.y ) !== tempInputGraphSegment.p1.y ) {

    //                                     //console.log( intersectionPoint, tempInputGraphSegment.p0, tempInputGraphSegment.p1 );

    //                                     //tempGraphSegments.push( { type: 'circfill', position: { x: intersectionPoint.x, y: intersectionPoint.y }, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );

    //                                     intersections.push( { point: intersectionPoint, graphSegment0: inputGraphSegment, graphSegment1: compareGraphSegment } );

    //                                 }

    //                             }

    //                         }

    //                     }

    //                 }

    //             }

    //         }

    //     }

    //     return intersections;

    // }

    function getTOfQuadraticBezierFromIntersectionPoint( graphSegment, position, precision = 100 ) {

        let distance = Infinity;
        let t = -1;

        for ( let i = 0, l = 1 / precision; i < 1 + l; i += l ) {

            const pOnBezier = Tools.interpolateQuadraticBezier( graphSegment.p0, graphSegment.controlPoint, graphSegment.p1, i );

            const d = Tools.getDistance( position, pOnBezier );

            if ( distance > d ) {

                distance = d;
                t = i;

            }

        }

        return t;

    }

    function getNearestPointOnGraphSegmentByPosition( graphSegment, position, precision = 100 ) {

        let distance = Infinity;
        let nearestPoint = null;

        for ( let i = 0, l = 1 / precision; i < 1 + l; i += l ) {

            const pOnBezier = Tools.interpolateQuadraticBezier( graphSegment.p0, graphSegment.controlPoint, graphSegment.p1, i );

            const d = Tools.getDistance( position, pOnBezier );

            if ( distance > d ) {

                distance = d;
                nearestPoint = pOnBezier;

            }

        }

        return nearestPoint;

    }

    function signedDistanceToLine( p, p0X, p0Y, p1X, p1Y ) {

        const p0p1X = p0X - p1X;
        const p0p1Y = p0Y - p1Y;

        const l2 = p0p1X * p0p1X + p0p1Y * p0p1Y;

        const pp0X = p.x - p0X;
        const pp0Y = p.y - p0Y;

        if ( l2 === 0 ) {

            return pp0X * pp0X + pp0Y * pp0Y;

        }

        const p1p0X = p1X - p0X;
        const p1p0Y = p1Y - p0Y;

        const t = Tools.clamp( ( pp0X * p1p0X + pp0Y * p1p0Y ) / l2, 0, 1 );

        const ptX = p0X + t * p1p0X;
        const ptY = p0Y + t * p1p0Y;

        const pX = p.x - ptX;
        const pY = p.y - ptY;

        return Math.sqrt( pX * pX + pY * pY );

    }

    function signedDistanceToQuadraticBezier( p, p0, p1, pControl, precision = 25 ) {

        let distance = Infinity;

        for ( let i = 0, l = 1 / precision; i < 1 + l; i += l ) {

            const pOnBezier = Tools.interpolateQuadraticBezier( p0, pControl, p1, i );

            const d = Tools.getDistance( p, pOnBezier );

            if ( distance > d ) {

                distance = d;

            }

        }

        return distance;

    }

    //--- ------------------------------------------------------------------------------------------------------------------------------

    function mouseDownHandler( event ) {

        mouseDown = true;

        //---

        if ( editorMode === EDITOR_MODE_ENUM.moveMap ) {

            //---

            navigator.setPositionInit( canvasManager.center.x, canvasManager.center.y );
            navigator.active = true;

            if ( debugMode === true ) {

                debugElements.clear();
        
            }

        } else {

            if ( editorMode === EDITOR_MODE_ENUM.addStreetSegment ) {

                addStreetSegment( mouseCursor.position );

            } else if ( editorMode === EDITOR_MODE_ENUM.addGraphSegment ) {

                addGraphSegment( mouseCursor.position );

            } else if ( editorMode === EDITOR_MODE_ENUM.addStartPoint ) {

                addStartPointToGraph( mouseCursor.position );

            } else if ( editorMode === EDITOR_MODE_ENUM.addEndPoint ) {

                addEndPointToGraph( mouseCursor.position );

            } else if ( editorMode === EDITOR_MODE_ENUM.getGraphSegment ) {

                //---

            } else if ( editorMode === EDITOR_MODE_ENUM.getVehicle ) {

                const vehicle = vehicles.getVehicleByPosition( mousePos );

                if ( vehicle !== null ) {

                    console.log( 'Found vehicle: ', vehicle );

                } else {

                    console.log( 'Could not find vehicle on position: ', mousePos );

                }

            } else if ( editorMode === EDITOR_MODE_ENUM.getPoint ) { 
            
                const graphIndex = 0;

                const graph = graphsManager.graphs[ graphIndex ];

                const point = GraphsManager.getPointByPosition( graph, mouseCursor.position );

                if ( point !== null ) {

                    console.log( 'Found point: ', point );

                    const pointInLookup = graphsManager.getPointInLookupById( 0, GraphsManager.getLookupPointId( point ) );

                    if ( pointInLookup !== null ) {

                        console.log( 'Found point in lookup: ', pointInLookup );

                    }
                    
                } else {

                    console.log( 'Could not find point on position: ', mouseCursor.position );

                }

            } else if ( editorMode === EDITOR_MODE_ENUM.toggleVehicleHalted ) {

                const vehicle = vehicles.getVehicleByPosition( mousePos );

                if ( vehicle !== null ) {

                    vehicle.halted = !vehicle.halted;

                }
            
            } else if ( editorMode === EDITOR_MODE_ENUM.followVehicle ) {

                vehicles.vehicleSelected = vehicles.getVehicleByPosition( mousePos );

                //centers the selected vehicle in the middle of the screen
                if ( vehicles.vehicleSelected !== null ) {

                    const dx = canvasManager.center.x - vehicles.vehicleSelected.position.x;
                    const dy = canvasManager.center.y - vehicles.vehicleSelected.position.y;

                    vehicles.updateVehiclesPositions( dx, dy );

                }

            } else if ( editorMode === EDITOR_MODE_ENUM.removeVehicle ) {
                
                const vehicle = vehicles.getVehicleByPosition( mousePos );

                if ( vehicle !== null ) {

                    vehicles.removeVehicle( vehicle );

                }

            } else if ( editorMode === EDITOR_MODE_ENUM.togglePointWalkable ) {

                togglePointWalkable( mouseCursor.position );

            } else if ( editorMode === EDITOR_MODE_ENUM.removeGraphSegment ) {

                removeGraphSegmentByPosition( mouseCursor.position );

            } else if ( editorMode === EDITOR_MODE_ENUM.movePoint ) {

                setCurrentNode( mouseCursor.position );
                addSelectedGraphSegments( mouseCursor.position );

            } else if ( editorMode === EDITOR_MODE_ENUM.toggleGraphWalkable ) {

                toggleGraphWalkable( mouseCursor.position );

            } else if ( editorMode === EDITOR_MODE_ENUM.toggleGraphDirections ) {

                toggleGraphDirections( mouseCursor.position );

            } else if ( editorMode === EDITOR_MODE_ENUM.showRoute ) {

                //---

            } else if ( editorMode === EDITOR_MODE_ENUM.showPointNeighbours ) {

                const graphIndex = 0;

                const graph = graphsManager.graphs[ graphIndex ];

                const point = GraphsManager.getPointByPosition( graph, mouseCursor.position );

                console.log( 'Point: ', point );

                if ( point !== null ) {

                    for ( let i = 0, l = point.neighbourPoints.length; i < l; i ++ ) {

                        console.log( 'Point Neighbour ', i, ': ', point.neighbourPoints[ i ] );
    
                    }
    
                    console.log( 'Point Neighbours in total: ', point.neighbourPoints.length );

                } else {

                    console.log( 'Could not find point on position: ', mouseCursor.position );

                }

            } else if ( editorMode === EDITOR_MODE_ENUM.showVehicleCheckpoints ) {

                //---

            } else if ( editorMode === EDITOR_MODE_ENUM.showVehicleGridCells ) {

                //---

            } else if ( editorMode === EDITOR_MODE_ENUM.removeStartEndPoints ) {

                removeStartEndPoints( mouseCursor.position );

            } else if ( editorMode === EDITOR_MODE_ENUM.bendGraphSegment ) {

                currentGraphSegment = getGraphSegmentByPosition( mouseCursor.position );

            } else if ( editorMode === EDITOR_MODE_ENUM.bendGraphSegmentBetween ) {

                bendGraphSegmentBetween( mouseCursor.position );

            } else if ( editorMode === EDITOR_MODE_ENUM.autoBendGraphSegment ) {

                autoBendGraphSegmentByPosition( mouseCursor.position );

            } else if ( editorMode === EDITOR_MODE_ENUM.straightenGraphSegment ) {

                straightenGraphSegmentByPosition( mouseCursor.position );

            } else if ( editorMode === EDITOR_MODE_ENUM.splitGraphSegment ) {

                splitGraphSegmentByPosition( mouseCursor.position );

            } else if ( editorMode === EDITOR_MODE_ENUM.splitGraphSegmentAt ) {

                const graphSegment = getGraphSegmentByPosition( mousePos );

                if ( graphSegment !== null ) {

                    const pointOnGraphSegment = getNearestPointOnGraphSegmentByPosition( graphSegment, mousePos, 100 );
                    const tOnGraphSegment = getTOfQuadraticBezierFromIntersectionPoint( graphSegment, pointOnGraphSegment, 100 );

                    splitGraphSegment( graphSegment, tOnGraphSegment );

                }

            }

        }

    }

    function mouseUpHandler( event ) {

        mouseDown = false;

        //---

        if ( editorMode === EDITOR_MODE_ENUM.moveMap ) {

            navigator.setPositionTarget( mousePos.x, mousePos.y );
            navigator.active = false;
            navigator.stop();

            graphsManager.setAllGraphSegmentPointNeighbours( 0 );

            if ( debugMode === true ) {

                debugElements.addElementsByGraph( graphsManager.graphs[ 0 ] );
        
            }

        } else {

            if ( editorMode === EDITOR_MODE_ENUM.bendGraphSegment ) {

                currentGraphSegment = null;

                tempGraphSegments = [];

            } else if ( editorMode === EDITOR_MODE_ENUM.followVehicle ) {

                vehicles.vehicleSelected = null;
                vehicles.stopFollowVehicle();

            } else if ( editorMode === EDITOR_MODE_ENUM.movePoint ) {

                removeSelectedGraphSegments();
                // removeDuplicatePointsFromArray();
                // removeDuplicateGraphSegmentsFromArray();

            }

            //---

            // if ( currentGraphSegment === null && editorMode !== EDITOR_MODE_ENUM.followVehicle ) {
            if ( currentGraphSegment === null && currentStreetSegment === null && editorMode !== EDITOR_MODE_ENUM.followVehicle ) {

                const computeRoutes = true;
                const computeIntersections = editorMode === EDITOR_MODE_ENUM.addEndPoint || editorMode === EDITOR_MODE_ENUM.removeStartEndPoints;
                const updateLookup = computeIntersections;

                graphsManager.computeGraphRoutesAndIntersections( 0, computeRoutes, computeIntersections, updateLookup );

                //---
                //dieser part hier muss erneut überprüft werden. ist es überhaupt noch nötig. vielleicht zudem besser im computeRoutes callback aufgehoben.

                vehicles.update();

                if ( vehicles.vehiclesSimulation === true ) {

                    vehicles.startSimulation();

                }

            }

        }

    }

    function mouseMoveHandler( event ) {

        mousePos = getMousePos( canvasMain, event );

        //---

        if ( editorMode === EDITOR_MODE_ENUM.moveMap ) {

            navigator.setPositionTarget( mousePos.x, mousePos.y );

        } else {

            if ( editorMode === EDITOR_MODE_ENUM.getGraphSegment ||
                editorMode === EDITOR_MODE_ENUM.removeGraphSegment ||
                editorMode === EDITOR_MODE_ENUM.toggleGraphWalkable ||
                editorMode === EDITOR_MODE_ENUM.toggleGraphDirections ||
                ( editorMode === EDITOR_MODE_ENUM.bendGraphSegment && mouseDown === false ) ||
                ( editorMode === EDITOR_MODE_ENUM.autoBendGraphSegment && mouseDown === false ) ||
                ( editorMode === EDITOR_MODE_ENUM.straightenGraphSegment && mouseDown === false ) ||
                // ( editorMode === EDITOR_MODE_ENUM.bendGraphSegmentBetween && mouseDown === false ) ||
                editorMode === EDITOR_MODE_ENUM.splitGraphSegment ) {

                tempGraphSegments = [];

                //---

                const graphSegment = getGraphSegmentByPosition( mousePos );

                if ( graphSegment !== null ) {

                    //tempGraphSegments.push( { type: 'line', p0: { x: graphSegment.p0.x, y: graphSegment.p0.y }, p1: { x: graphSegment.p1.x, y: graphSegment.p1.y  }, color: { r: 255, g: 255, b: 255, a: 255 } } );
                    tempGraphSegments.push( { type: 'bezier', p0: { x: graphSegment.p0.x, y: graphSegment.p0.y }, controlPoint: { x: graphSegment.controlPoint.x, y: graphSegment.controlPoint.y }, p1: { x: graphSegment.p1.x, y: graphSegment.p1.y }, color: { r: 255, g: 255, b: 255, a: 255 } } );
                    tempGraphSegments.push( { type: 'circ', position: { x: graphSegment.p0.x, y: graphSegment.p0.y }, diameter: 12, color: { r: 255, g: 0, b: 255, a: 255 }  } );
                    tempGraphSegments.push( { type: 'circ', position: { x: graphSegment.p1.x, y: graphSegment.p1.y }, diameter: 12, color: { r: 0, g: 255, b: 255, a: 255 }  } );

                }

            } else if ( editorMode === EDITOR_MODE_ENUM.bendGraphSegmentBetween && selectedGraphSegments.length === 2 ) {

                tempGraphSegments = [];

                selectedGraphSegments = [];

            } else if ( editorMode === EDITOR_MODE_ENUM.splitGraphSegmentAt ) {

                tempGraphSegments = [];

                //---

                const graphSegment = getGraphSegmentByPosition( mousePos );

                if ( graphSegment !== null ) {

                    //tempGraphSegments.push( { type: 'line', p0: { x: graphSegment.p0.x, y: graphSegment.p0.y }, p1: { x: graphSegment.p1.x, y: graphSegment.p1.y  }, color: { r: 255, g: 255, b: 255, a: 255 } } );
                    tempGraphSegments.push( { type: 'bezier', p0: { x: graphSegment.p0.x, y: graphSegment.p0.y }, controlPoint: { x: graphSegment.controlPoint.x, y: graphSegment.controlPoint.y }, p1: { x: graphSegment.p1.x, y: graphSegment.p1.y }, color: { r: 255, g: 255, b: 255, a: 255 } } );
                    tempGraphSegments.push( { type: 'circ', position: { x: graphSegment.p0.x, y: graphSegment.p0.y }, diameter: 12, color: { r: 255, g: 0, b: 255, a: 255 }  } );
                    tempGraphSegments.push( { type: 'circ', position: { x: graphSegment.p1.x, y: graphSegment.p1.y }, diameter: 12, color: { r: 0, g: 255, b: 255, a: 255 }  } );

                    const pointOnGraphSegment = getNearestPointOnGraphSegmentByPosition( graphSegment, mousePos, 100 );

                    tempGraphSegments.push( { type: 'circfill', position: { x: pointOnGraphSegment.x, y: pointOnGraphSegment.y }, diameter: 5, color: { r: 255, g: 0, b: 255, a: 255 }  } );

                }

            } else if ( editorMode === EDITOR_MODE_ENUM.movePoint ) {

                if ( mouseDown === true ) {

                    movePoint( mousePos );
                    // movePoint( mouseCursor.position ); //under construction

                }

            } else if ( editorMode === EDITOR_MODE_ENUM.showPointNeighbours ) {

                showPointNeighbours( mouseCursor.position );

            } else if ( editorMode === EDITOR_MODE_ENUM.showPointVehicleQueue ) {

                showPointVehicleQueue( mouseCursor.position );

            } else if ( editorMode === EDITOR_MODE_ENUM.showRoute ) {

                showRoute( mouseCursor.position );

            } else if ( editorMode === EDITOR_MODE_ENUM.showVehicleCheckpoints ) {

                showVehicleCheckpoints( mouseCursor.position );

            } else if ( editorMode === EDITOR_MODE_ENUM.showVehicleGridCells ) {

                showVehicleGridCells( mouseCursor.position );

            }

            if ( editorMode === EDITOR_MODE_ENUM.bendGraphSegment ) {

                if ( mouseDown === true ) {

                    bendGraphSegment( mousePos );

                }

            }

            if ( editorMode === EDITOR_MODE_ENUM.addStreetSegment ) {

                tempGraphSegments = [];

                const streetSegment = currentStreetSegment;

                if ( streetSegment !== null ) {

                    streetSegment.crossLanes = [];
                    streetSegment.borders = [];
                    streetSegment.centerLanes = [];

                    //neues street element ohne verbindung zu einem bestehendem street element
                    if ( streetSegment.modus === 'new' ) {

                        if ( streetSegment.p0 !== null && streetSegment.p1 === null ) {

                            // const graphDistance = 50;

                            // const tempP1 = { x: mousePos.x, y: mousePos.y };

                            //---

                            // const angleStart = Math.atan2( tempP1.y - streetSegment.p0.y, tempP1.x - streetSegment.p0.x );

                            // const sinA = Math.sin( angleStart );
                            // const cosA = Math.cos( angleStart );

                            // streetSegment.pTS.x = sinA * graphDistance + streetSegment.p0.x;
                            // streetSegment.pTS.y = -cosA * graphDistance + streetSegment.p0.y;
                            // streetSegment.pBS.x = -sinA * graphDistance + streetSegment.p0.x;
                            // streetSegment.pBS.y = cosA * graphDistance + streetSegment.p0.y;

                            // streetSegment.pTE.x = sinA * graphDistance + tempP1.x;
                            // streetSegment.pTE.y = -cosA * graphDistance + tempP1.y;
                            // streetSegment.pBE.x = -sinA * graphDistance + tempP1.x;
                            // streetSegment.pBE.y = cosA * graphDistance + tempP1.y;

                            // streetSegment.centerPoint.x = ( streetSegment.p0.x + tempP1.x ) / 2;
                            // streetSegment.centerPoint.y = ( streetSegment.p0.y + tempP1.y ) / 2;
                            // streetSegment.controlPoint.x = streetSegment.centerPoint.x;
                            // streetSegment.controlPoint.y = streetSegment.centerPoint.y;

                            // streetSegment.pTCenter.x = ( streetSegment.pTS.x + streetSegment.pTE.x ) / 2;
                            // streetSegment.pTCenter.y = ( streetSegment.pTS.y + streetSegment.pTE.y ) / 2;
                            // streetSegment.pTControl.x = streetSegment.pTCenter.x;
                            // streetSegment.pTControl.y = streetSegment.pTCenter.y;

                            // streetSegment.pBCenter.x = ( streetSegment.pBS.x + streetSegment.pBE.x ) / 2;
                            // streetSegment.pBCenter.y = ( streetSegment.pBS.y + streetSegment.pBE.y ) / 2;
                            // streetSegment.pBControl.x = streetSegment.pBCenter.x;
                            // streetSegment.pBControl.y = streetSegment.pBCenter.y;

                            // tempGraphSegments.push( { type: 'line', p0: { x: streetSegment.p0.x, y: streetSegment.p0.y }, p1: { x: tempP1.x, y: tempP1.y }, color: { r: 100, g: 100, b: 100, a: 255 } } );

                            // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.p0.x, y: streetSegment.p0.y }, diameter: 3, color: { r: 100, g: 100, b: 100, a: 255 } } );
                            // tempGraphSegments.push( { type: 'circfill', position: { x: tempP1.x, y: tempP1.y }, diameter: 3, color: { r: 100, g: 100, b: 100, a: 255 } } );

                            // tempGraphSegments.push( { type: 'line', p0: { x: streetSegment.pTS.x | 0, y: streetSegment.pTS.y | 0 }, p1: { x: streetSegment.pBS.x | 0, y: streetSegment.pBS.y | 0 }, color: { r: 100, g: 100, b: 100, a: 255 } } );
                            // tempGraphSegments.push( { type: 'line', p0: { x: streetSegment.pTE.x | 0, y: streetSegment.pTE.y | 0 }, p1: { x: streetSegment.pBE.x | 0, y: streetSegment.pBE.y | 0 }, color: { r: 100, g: 100, b: 100, a: 255 } } );

                            // tempGraphSegments.push( { type: 'line', p0: { x: streetSegment.pTS.x | 0, y: streetSegment.pTS.y | 0 }, p1: { x: streetSegment.pTE.x | 0, y: streetSegment.pTE.y | 0 }, color: { r: 255, g: 0, b: 0, a: 255 } } );
                            // tempGraphSegments.push( { type: 'line', p0: { x: streetSegment.pBS.x | 0, y: streetSegment.pBS.y | 0 }, p1: { x: streetSegment.pBE.x | 0, y: streetSegment.pBE.y | 0 }, color: { r: 0, g: 255, b: 0, a: 255 } } );

                            // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.centerPoint.x, y: streetSegment.centerPoint.y }, diameter: 6, color: { r: 155, g: 155, b: 155, a: 255 } } );
                            // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.pTCenter.x, y: streetSegment.pTCenter.y }, diameter: 6, color: { r: 155, g: 155, b: 155, a: 255 } } );
                            // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.pBCenter.x, y: streetSegment.pBCenter.y }, diameter: 6, color: { r: 155, g: 155, b: 155, a: 255 } } );

                            // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.controlPoint.x, y: streetSegment.controlPoint.y }, diameter: 3, color: { r: 255, g: 255, b: 255, a: 255 } } );
                            // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.pTControl.x, y: streetSegment.pTControl.y }, diameter: 3, color: { r: 255, g: 255, b: 255, a: 255 } } );
                            // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.pBControl.x, y: streetSegment.pBControl.y }, diameter: 3, color: { r: 255, g: 255, b: 255, a: 255 } } );

                            // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.pTS.x, y: streetSegment.pTS.y }, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );
                            // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.pTE.x, y: streetSegment.pTE.y }, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );
                            // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.pBS.x, y: streetSegment.pBS.y }, diameter: 3, color: { r: 0, g: 255, b: 0, a: 255 } } );
                            // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.pBE.x, y: streetSegment.pBE.y }, diameter: 3, color: { r: 0, g: 255, b: 0, a: 255 } } );

                        }

                        if ( streetSegment.p1 !== null ) {

                            //---

                        }

                    //neues street element mit verbindung zu einem bestehendem street element
                    } else if ( streetSegment.modus === 'add' ) {

                        if ( streetSegment.p0 !== null && streetSegment.p1 === null ) {

                            const scanDistance = 10000;

                            const tempP1 = { x: mousePos.x, y: mousePos.y };

                            //---

                            // rechts = Math.PI * 0.00;
                            // unten  = Math.PI * 0.50;
                            // links  = Math.PI * 1.00;
                            // oben   = Math.PI * 1.50;

                            //angleStart muss noch vom dem verbundenen street element übernommen werden
                            // const angleStart = Math.PI * 0.98;
                            const angleStart = streetSegment.angle0;
                            const angleEnd = Math.atan2( tempP1.y - streetSegment.controlPoint.y, tempP1.x - streetSegment.controlPoint.x );
                            // const angleAdjacent = angleStart + Math.PI * 0.50;
                            const angleAdjacent = angleStart + Settings.DIR_BOTTOM;
                            const angleOpposite = angleStart;
                            const angleIntersection = Math.atan2( tempP1.y - streetSegment.p0.y, tempP1.x - streetSegment.p0.x );

                            const sinStart = Math.sin( angleStart );
                            const cosStart = Math.cos( angleStart );
                            const sinEnd = Math.sin( angleEnd );
                            const cosEnd = Math.cos( angleEnd );
                            const sinAdjacent = Math.sin( angleAdjacent );
                            const cosAdjacent = Math.cos( angleAdjacent );
                            const sinOpposite = Math.sin( angleOpposite );
                            const cosOpposite = Math.cos( angleOpposite );
                            const sinIntersection = Math.sin( angleIntersection );
                            const cosIntersection = Math.cos( angleIntersection );

                            streetSegment.angle1 = angleEnd;

                            //---
                            //center line/bezier

                            const lineAdjacent = { p0: { x: sinAdjacent * scanDistance + streetSegment.p0.x, y: -cosAdjacent * scanDistance + streetSegment.p0.y }, p1: { x: -sinAdjacent * scanDistance + streetSegment.p0.x, y: cosAdjacent * scanDistance + streetSegment.p0.y } };
                            const lineOpposite = { p0: { x: sinOpposite * scanDistance + tempP1.x, y: -cosOpposite * scanDistance + tempP1.y }, p1: { x: -sinOpposite * scanDistance + tempP1.x, y: cosOpposite * scanDistance + tempP1.y } };
                            const lineHypotenuseCenterPoint = { x: tempP1.x + ( streetSegment.p0.x - tempP1.x ) / 2, y: tempP1.y + ( streetSegment.p0.y - tempP1.y ) / 2 };
                            const lineIntersection = { p0: { x: sinIntersection * scanDistance + lineHypotenuseCenterPoint.x, y: -cosIntersection * scanDistance + lineHypotenuseCenterPoint.y }, p1: { x: -sinIntersection * scanDistance + lineHypotenuseCenterPoint.x, y: cosIntersection * scanDistance + lineHypotenuseCenterPoint.y } };

                            //---
                            
                            let intersectionPoint = null;
                            let intersectionPoint0 = getLinesIntersectionPoint( lineAdjacent.p0.x, lineAdjacent.p0.y, lineAdjacent.p1.x, lineAdjacent.p1.y, lineIntersection.p0.x, lineIntersection.p0.y, lineIntersection.p1.x, lineIntersection.p1.y );
                            let intersectionPoint1 = getLinesIntersectionPoint( lineOpposite.p0.x, lineOpposite.p0.y, lineOpposite.p1.x, lineOpposite.p1.y, lineIntersection.p0.x, lineIntersection.p0.y, lineIntersection.p1.x, lineIntersection.p1.y );

                            const distintersectionPoint00 = Tools.getDistance( intersectionPoint0, lineHypotenuseCenterPoint );
                            const distintersectionPoint01 = Tools.getDistance( intersectionPoint1, lineHypotenuseCenterPoint );

                            if ( distintersectionPoint00 <= distintersectionPoint01 ) {

                                intersectionPoint = intersectionPoint0;

                            } else {

                                intersectionPoint = intersectionPoint1;

                            }

                            streetSegment.controlPoint.x = intersectionPoint.x;
                            streetSegment.controlPoint.y = intersectionPoint.y;
                            streetSegment.centerPoint = Tools.interpolateQuadraticBezier( streetSegment.p0, intersectionPoint, tempP1, 0.50 );

                            //---

                            tempGraphSegments.push( { type: 'line', p0: { x: lineAdjacent.p0.x, y: lineAdjacent.p0.y }, p1: { x: lineAdjacent.p1.x, y: lineAdjacent.p1.y }, color: { r: 55, g: 55, b: 155, a: 255 } } );
                            tempGraphSegments.push( { type: 'line', p0: { x: lineOpposite.p0.x, y: lineOpposite.p0.y }, p1: { x: lineOpposite.p1.x, y: lineOpposite.p1.y }, color: { r: 55, g: 155, b: 55, a: 255 } } );
                            tempGraphSegments.push( { type: 'circfill', position: lineHypotenuseCenterPoint, diameter: 5, color: { r: 255, g: 55, b: 55, a: 255 } } );
                            tempGraphSegments.push( { type: 'line', p0: { x: lineIntersection.p0.x | 0, y: lineIntersection.p0.y | 0 }, p1: { x: lineIntersection.p1.x | 0, y: lineIntersection.p1.y | 0 }, color: { r: 100, g: 100, b: 100, a: 255 } } );
                            tempGraphSegments.push( { type: 'circfill', position: { x: intersectionPoint.x, y: intersectionPoint.y }, diameter: 3, color: { r: 0, g: 255, b: 0, a: 255 } } );
                            tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.centerPoint.x, y: streetSegment.centerPoint.y }, diameter: 3, color: { r: 100, g: 100, b: 100, a: 255 } } );
                            tempGraphSegments.push( { type: 'line', p0: { x: streetSegment.p0.x, y: streetSegment.p0.y }, p1: { x: tempP1.x, y: tempP1.y }, color: { r: 100, g: 100, b: 100, a: 255 } } );
                            tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.p0.x, y: streetSegment.p0.y }, diameter: 3, color: { r: 100, g: 100, b: 100, a: 255 } } );
                            tempGraphSegments.push( { type: 'circfill', position: { x: tempP1.x, y: tempP1.y }, diameter: 3, color: { r: 100, g: 100, b: 100, a: 255 } } );

                            //---

                            tempGraphSegments.push( { type: 'bezier', p0: streetSegment.p0, controlPoint: streetSegment.controlPoint, p1: tempP1, color: { r: 100, g: 100, b: 100, a: 255 } } );

                            //---
                            //lanes

                            if ( streetSegment.lanes.length > 1 ) {

                                const lanePositionSwitch = ( streetSegment.lanes.length / 2 ) - 1;

                                let laneIndex = ( streetSegment.lanes.length / 2 ) * -1;

                                for ( let i = 0, l = streetSegment.lanes.length; i < l; i++ ) {

                                    const lane = streetSegment.lanes[ i ];

                                    //---

                                    let laneDistance = Math.abs( laneIndex ) * streetSegment.laneDistance;

                                    //zur mitte hin soll die distance nicht so groß sein
                                    // if ( i === lanePositionSwitch || i === lanePositionSwitch + 1 ) {

                                    //     laneDistance = laneDistance / 2;

                                    // }

                                    //---

                                    //start und end punkte seitlich der mittellinie platzieren
                                    if ( i <= lanePositionSwitch ) {

                                        if ( lane.p0.x === 0 && lane.p0.y === 0 ) {

                                            lane.p0.x = sinStart * laneDistance + streetSegment.p0.x;
                                            lane.p0.y = -cosStart * laneDistance + streetSegment.p0.y;

                                        }

                                        // lane.p0.x = sinStart * laneDistance + streetSegment.p0.x;
                                        // lane.p0.y = -cosStart * laneDistance + streetSegment.p0.y;
                                        lane.p1.x = sinEnd * laneDistance + tempP1.x;
                                        lane.p1.y = -cosEnd * laneDistance + tempP1.y;

                                    } else {

                                        if ( lane.p0.x === 0 && lane.p0.y === 0 ) {

                                            lane.p0.x = -sinStart * laneDistance + streetSegment.p0.x;
                                            lane.p0.y = cosStart * laneDistance + streetSegment.p0.y;
                                            
                                        }

                                        // lane.p0.x = -sinStart * laneDistance + streetSegment.p0.x;
                                        // lane.p0.y = cosStart * laneDistance + streetSegment.p0.y;
                                        lane.p1.x = -sinEnd * laneDistance + tempP1.x;
                                        lane.p1.y = cosEnd * laneDistance + tempP1.y;

                                    }

                                    //---
                                    //streetBorder

                                    let borderDistance = 0;

                                    if ( i === 0 && i <= lanePositionSwitch || i === l - 1 && i > lanePositionSwitch ) {

                                        if ( i === 0 ) {

                                            borderDistance = ( ( streetSegment.lanes.length / 2 ) * -1 ) * streetSegment.laneDistance - streetSegment.laneDistance;

                                        } else if ( i === l - 1 ) {

                                            borderDistance = ( ( streetSegment.lanes.length / 2 ) * 1 ) * streetSegment.laneDistance + streetSegment.laneDistance;

                                        }

                                        const streetBorder = getNewStreetSegmentLane( { x: sinStart * borderDistance + streetSegment.p0.x, y: -cosStart * borderDistance + streetSegment.p0.y }, { x: sinEnd * borderDistance + tempP1.x, y: -cosEnd * borderDistance + tempP1.y }, { x: 0, y: 0 }, { x: 0, y: 0 } );

                                        const lineAdjacent = { p0: { x: sinAdjacent * scanDistance + streetBorder.p0.x, y: -cosAdjacent * scanDistance + streetBorder.p0.y }, p1: { x: -sinAdjacent * scanDistance + streetBorder.p0.x, y: cosAdjacent * scanDistance + streetBorder.p0.y } };
                                        const lineOpposite = { p0: { x: sinOpposite * scanDistance + streetBorder.p1.x, y: -cosOpposite * scanDistance + streetBorder.p1.y }, p1: { x: -sinOpposite * scanDistance + streetBorder.p1.x, y: cosOpposite * scanDistance + streetBorder.p1.y } };
                                        const lineHypotenuseCenterPoint = { x: streetBorder.p1.x + ( streetBorder.p0.x - streetBorder.p1.x ) / 2, y: streetBorder.p1.y + ( streetBorder.p0.y - streetBorder.p1.y ) / 2 };
                                        const lineIntersection = { p0: { x: sinIntersection * scanDistance + lineHypotenuseCenterPoint.x, y: -cosIntersection * scanDistance + lineHypotenuseCenterPoint.y }, p1: { x: -sinIntersection * scanDistance + lineHypotenuseCenterPoint.x, y: cosIntersection * scanDistance + lineHypotenuseCenterPoint.y } };

                                        //---

                                        let intersectionPoint = null;
                                        let intersectionPoint0 = getLinesIntersectionPoint( lineAdjacent.p0.x, lineAdjacent.p0.y, lineAdjacent.p1.x, lineAdjacent.p1.y, lineIntersection.p0.x, lineIntersection.p0.y, lineIntersection.p1.x, lineIntersection.p1.y );
                                        let intersectionPoint1 = getLinesIntersectionPoint( lineOpposite.p0.x, lineOpposite.p0.y, lineOpposite.p1.x, lineOpposite.p1.y, lineIntersection.p0.x, lineIntersection.p0.y, lineIntersection.p1.x, lineIntersection.p1.y );

                                        const distintersectionPoint00 = Tools.getDistance( intersectionPoint0, lineHypotenuseCenterPoint );
                                        const distintersectionPoint01 = Tools.getDistance( intersectionPoint1, lineHypotenuseCenterPoint );

                                        if ( distintersectionPoint00 <= distintersectionPoint01 ) {

                                            intersectionPoint = intersectionPoint0;

                                        } else {

                                            intersectionPoint = intersectionPoint1;

                                        }

                                        streetBorder.controlPoint.x = intersectionPoint.x;
                                        streetBorder.controlPoint.y = intersectionPoint.y;
                                        streetBorder.centerPoint = Tools.interpolateQuadraticBezier( streetBorder.p0, streetBorder.controlPoint, streetBorder.p1, 0.50 );

                                        //---

                                        tempGraphSegments.push( { type: 'bezier', p0: streetBorder.p0, controlPoint: streetBorder.controlPoint, p1: streetBorder.p1, color: { r: 255, g: 55, b: 255, a: 255 } } );

                                        //---

                                        streetSegment.borders.push( streetBorder );
                                        
                                    }

                    
                                    //---
                                    //lane

                                    const lineAdjacent = { p0: { x: sinAdjacent * scanDistance + lane.p0.x, y: -cosAdjacent * scanDistance + lane.p0.y }, p1: { x: -sinAdjacent * scanDistance + lane.p0.x, y: cosAdjacent * scanDistance + lane.p0.y } };
                                    const lineOpposite = { p0: { x: sinOpposite * scanDistance + lane.p1.x, y: -cosOpposite * scanDistance + lane.p1.y }, p1: { x: -sinOpposite * scanDistance + lane.p1.x, y: cosOpposite * scanDistance + lane.p1.y } };
                                    const lineHypotenuseCenterPoint = { x: lane.p1.x + ( lane.p0.x - lane.p1.x ) / 2, y: lane.p1.y + ( lane.p0.y - lane.p1.y ) / 2 };
                                    const lineIntersection = { p0: { x: sinIntersection * scanDistance + lineHypotenuseCenterPoint.x, y: -cosIntersection * scanDistance + lineHypotenuseCenterPoint.y }, p1: { x: -sinIntersection * scanDistance + lineHypotenuseCenterPoint.x, y: cosIntersection * scanDistance + lineHypotenuseCenterPoint.y } };

                                    //---

                                    let intersectionPoint = null;
                                    let intersectionPoint0 = getLinesIntersectionPoint( lineAdjacent.p0.x, lineAdjacent.p0.y, lineAdjacent.p1.x, lineAdjacent.p1.y, lineIntersection.p0.x, lineIntersection.p0.y, lineIntersection.p1.x, lineIntersection.p1.y );
                                    let intersectionPoint1 = getLinesIntersectionPoint( lineOpposite.p0.x, lineOpposite.p0.y, lineOpposite.p1.x, lineOpposite.p1.y, lineIntersection.p0.x, lineIntersection.p0.y, lineIntersection.p1.x, lineIntersection.p1.y );

                                    const distintersectionPoint00 = Tools.getDistance( intersectionPoint0, lineHypotenuseCenterPoint );
                                    const distintersectionPoint01 = Tools.getDistance( intersectionPoint1, lineHypotenuseCenterPoint );

                                    if ( distintersectionPoint00 <= distintersectionPoint01 ) {

                                        intersectionPoint = intersectionPoint0;

                                    } else {

                                        intersectionPoint = intersectionPoint1;

                                    }

                                    lane.controlPoint.x = intersectionPoint.x;
                                    lane.controlPoint.y = intersectionPoint.y;
                                    lane.centerPoint = Tools.interpolateQuadraticBezier( lane.p0, intersectionPoint, lane.p1, 0.50 );

                                    //---

                                    tempGraphSegments.push( { type: 'line', p0: { x: lane.p0.x, y: lane.p0.y }, p1: { x: lane.p1.x, y: lane.p1.y }, color: { r: 55, g: 55, b: 55, a: 255 } } );
                                    tempGraphSegments.push( { type: 'line', p0: { x: lineAdjacent.p0.x, y: lineAdjacent.p0.y }, p1: { x: lineAdjacent.p1.x, y: lineAdjacent.p1.y }, color: { r: 25, g: 25, b: 75, a: 255 } } );
                                    tempGraphSegments.push( { type: 'line', p0: { x: lineOpposite.p0.x, y: lineOpposite.p0.y }, p1: { x: lineOpposite.p1.x, y: lineOpposite.p1.y }, color: { r: 25, g: 75, b: 25, a: 255 } } );
                                    tempGraphSegments.push( { type: 'circfill', position: lineHypotenuseCenterPoint, diameter: 3, color: { r: 155, g: 55, b: 55, a: 255 } } );
                                    tempGraphSegments.push( { type: 'line', p0: { x: lineIntersection.p0.x | 0, y: lineIntersection.p0.y | 0 }, p1: { x: lineIntersection.p1.x | 0, y: lineIntersection.p1.y | 0 }, color: { r: 55, g: 55, b: 55, a: 255 } } );
                                    tempGraphSegments.push( { type: 'circfill', position: { x: intersectionPoint.x, y: intersectionPoint.y }, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );
                                    tempGraphSegments.push( { type: 'circfill', position: { x: lane.centerPoint.x, y: lane.centerPoint.y }, diameter: 3, color: { r: 55, g: 55, b: 55, a: 255 } } );
                                    tempGraphSegments.push( { type: 'line', p0: { x: lane.p0.x | 0, y: lane.p0.y | 0 }, p1: { x: streetSegment.p0.x | 0, y: streetSegment.p0.y | 0 }, color: { r: 100, g: 100, b: 100, a: 255 } } );
                                    tempGraphSegments.push( { type: 'line', p0: { x: lane.p1.x | 0, y: lane.p1.y | 0 }, p1: { x: tempP1.x | 0, y: tempP1.y | 0 }, color: { r: 100, g: 100, b: 100, a: 255 } } );
                                    tempGraphSegments.push( { type: 'circfill', position: lane.p0, diameter: 3, color: { r: 155, g: 155, b: 155, a: 255 } } );
                                    tempGraphSegments.push( { type: 'circfill', position: lane.p1, diameter: 3, color: { r: 155, g: 155, b: 155, a: 255 } } );

                                    //---

                                    tempGraphSegments.push( { type: 'bezier', p0: lane.p0, controlPoint: lane.controlPoint, p1: lane.p1, color: { r: 255, g: 55, b: 55, a: 255 } } );

                                    //---
                                    //center lanes & cross lanes

                                    //nur wenn es mehr als eine lane gibt
                                    if ( l > 1 ) {

                                        //erst ab lane 1, damit auf lane 0 zurückgergriffen werden kann
                                        if ( i > 0 && i !== lanePositionSwitch + 1 ) {

                                            const laneTemp = streetSegment.lanes[ i - 1 ];

                                            //---
                                            //const lane center

                                            const centerLane = getNewStreetSegmentLane( { x: ( laneTemp.p0.x + lane.p0.x ) / 2, y: ( laneTemp.p0.y + lane.p0.y ) / 2 }, { x: ( laneTemp.p1.x + lane.p1.x ) / 2, y: ( laneTemp.p1.y + lane.p1.y ) / 2 }, { x: 0, y: 0 }, { x: 0, y: 0 } );

                                            //---

                                            const centerLane0Adjacent = { p0: { x: sinAdjacent * scanDistance + centerLane.p0.x, y: -cosAdjacent * scanDistance + centerLane.p0.y }, p1: { x: -sinAdjacent * scanDistance + centerLane.p0.x, y: cosAdjacent * scanDistance + centerLane.p0.y } };
                                            const centerLane0Opposite = { p0: { x: sinOpposite * scanDistance + centerLane.p1.x, y: -cosOpposite * scanDistance + centerLane.p1.y }, p1: { x: -sinOpposite * scanDistance + centerLane.p1.x, y: cosOpposite * scanDistance + centerLane.p1.y } };
                                            const centerLane0HypotenuseCenterPoint = { x: centerLane.p1.x + ( centerLane.p0.x - centerLane.p1.x ) / 2, y: centerLane.p1.y + ( centerLane.p0.y - centerLane.p1.y ) / 2 };
                                            const centerLane0Intersection = { p0: { x: sinIntersection * scanDistance + centerLane0HypotenuseCenterPoint.x, y: -cosIntersection * scanDistance + centerLane0HypotenuseCenterPoint.y }, p1: { x: -sinIntersection * scanDistance + centerLane0HypotenuseCenterPoint.x, y: cosIntersection * scanDistance + centerLane0HypotenuseCenterPoint.y } };

                                            //---

                                            let centerLane0IntersectiobPoint = null;
                                            let centerLane0IntersectiobPoint0 = getLinesIntersectionPoint( centerLane0Adjacent.p0.x, centerLane0Adjacent.p0.y, centerLane0Adjacent.p1.x, centerLane0Adjacent.p1.y, centerLane0Intersection.p0.x, centerLane0Intersection.p0.y, centerLane0Intersection.p1.x, centerLane0Intersection.p1.y );
                                            let centerLane0IntersectiobPoint1 = getLinesIntersectionPoint( centerLane0Opposite.p0.x, centerLane0Opposite.p0.y, centerLane0Opposite.p1.x, centerLane0Opposite.p1.y, centerLane0Intersection.p0.x, centerLane0Intersection.p0.y, centerLane0Intersection.p1.x, centerLane0Intersection.p1.y );

                                            const distcenterLane0IntersectiobPoint00 = Tools.getDistance( centerLane0IntersectiobPoint0, centerLane0HypotenuseCenterPoint );
                                            const distcenterLane0IntersectiobPoint01 = Tools.getDistance( centerLane0IntersectiobPoint1, centerLane0HypotenuseCenterPoint );

                                            if ( distcenterLane0IntersectiobPoint00 <= distcenterLane0IntersectiobPoint01 ) {

                                                centerLane0IntersectiobPoint = centerLane0IntersectiobPoint0;

                                            } else {

                                                centerLane0IntersectiobPoint = centerLane0IntersectiobPoint1;

                                            }

                                            centerLane.controlPoint.x = centerLane0IntersectiobPoint.x;
                                            centerLane.controlPoint.y = centerLane0IntersectiobPoint.y;
                                            centerLane.centerPoint = Tools.interpolateQuadraticBezier( centerLane.p0, centerLane.controlPoint, centerLane.p1, 0.50 );

                                            streetSegment.centerLanes.push( centerLane );





                                            //---
                                            //cross lanes

                                            const l0 = getNewStreetSegmentLane( { x: lane.p0.x, y: lane.p0.y }, { x: laneTemp.p1.x, y: laneTemp.p1.y }, { x: 0, y: 0 }, { x: 0, y: 0 } );
                                            const l1 = getNewStreetSegmentLane( { x: laneTemp.p0.x, y: laneTemp.p0.y }, { x: lane.p1.x, y: lane.p1.y }, { x: 0, y: 0 }, { x: 0, y: 0 } );


                                            const lineAdjacent0 = { p0: { x: sinAdjacent * scanDistance + centerLane.p0.x, y: -cosAdjacent * scanDistance + centerLane.p0.y }, p1: { x: -sinAdjacent * scanDistance + centerLane.p0.x, y: cosAdjacent * scanDistance + centerLane.p0.y } };
                                            const lineAdjacent1 = { p0: { x: sinAdjacent * scanDistance + centerLane.p0.x, y: -cosAdjacent * scanDistance + centerLane.p0.y }, p1: { x: -sinAdjacent * scanDistance + centerLane.p0.x, y: cosAdjacent * scanDistance + centerLane.p0.y } };
                                            const lineOpposite0 = { p0: { x: sinOpposite * scanDistance + centerLane.p1.x, y: -cosOpposite * scanDistance + centerLane.p1.y }, p1: { x: -sinOpposite * scanDistance + centerLane.p1.x, y: cosOpposite * scanDistance + centerLane.p1.y } };
                                            const lineOpposite1 = { p0: { x: sinOpposite * scanDistance + centerLane.p1.x, y: -cosOpposite * scanDistance + centerLane.p1.y }, p1: { x: -sinOpposite * scanDistance + centerLane.p1.x, y: cosOpposite * scanDistance + centerLane.p1.y } };

                                            //----

                                            const angleIntersection0 = Math.atan2( l0.p1.y - l0.p0.y, l0.p1.x - l0.p0.x );
                                            const sinIntersection0 = Math.sin( angleIntersection0 );
                                            const cosIntersection0 = Math.cos( angleIntersection0 );

                                            const lineHypotenuseCenterPoint0 = { x: l0.p1.x + ( l0.p0.x - l0.p1.x ) / 2, y: l0.p1.y + ( l0.p0.y - l0.p1.y ) / 2 };
                                            const lineIntersection0 = { p0: { x: sinIntersection0 * scanDistance + lineHypotenuseCenterPoint0.x, y: -cosIntersection0 * scanDistance + lineHypotenuseCenterPoint0.y }, p1: { x: -sinIntersection0 * scanDistance + lineHypotenuseCenterPoint0.x, y: cosIntersection0 * scanDistance + lineHypotenuseCenterPoint0.y } };
                                            
                                            let intersectionPoint0 = null;
                                            let intersectionPoint00 = getLinesIntersectionPoint( lineAdjacent0.p0.x, lineAdjacent0.p0.y, lineAdjacent0.p1.x, lineAdjacent0.p1.y, lineIntersection0.p0.x, lineIntersection0.p0.y, lineIntersection0.p1.x, lineIntersection0.p1.y );
                                            let intersectionPoint01 = getLinesIntersectionPoint( lineOpposite0.p0.x, lineOpposite0.p0.y, lineOpposite0.p1.x, lineOpposite0.p1.y, lineIntersection0.p0.x, lineIntersection0.p0.y, lineIntersection0.p1.x, lineIntersection0.p1.y );

                                            const distintersectionPoint00 = Tools.getDistance( intersectionPoint00, lineHypotenuseCenterPoint0 );
                                            const distintersectionPoint01 = Tools.getDistance( intersectionPoint01, lineHypotenuseCenterPoint0 );

                                            if ( distintersectionPoint00 <= distintersectionPoint01 ) {

                                                intersectionPoint0 = intersectionPoint00;

                                            } else {

                                                intersectionPoint0 = intersectionPoint01;

                                            }

                                            
                                            l0.controlPoint.x = intersectionPoint0.x;
                                            l0.controlPoint.y = intersectionPoint0.y;
                                            l0.centerPoint = Tools.interpolateQuadraticBezier( l0.p0, intersectionPoint0, l0.p1, 0.50 );

                                            //---

                                            const angleIntersection1 = Math.atan2( l1.p1.y - l1.p0.y, l1.p1.x - l1.p0.x );
                                            const sinIntersection1 = Math.sin( angleIntersection1 );
                                            const cosIntersection1 = Math.cos( angleIntersection1 );

                                            const lineHypotenuseCenterPoint1 = { x: l1.p1.x + ( l1.p0.x - l1.p1.x ) / 2, y: l1.p1.y + ( l1.p0.y - l1.p1.y ) / 2 };
                                            const lineIntersection1 = { p0: { x: sinIntersection1 * scanDistance + lineHypotenuseCenterPoint1.x, y: -cosIntersection1 * scanDistance + lineHypotenuseCenterPoint1.y }, p1: { x: -sinIntersection1 * scanDistance + lineHypotenuseCenterPoint1.x, y: cosIntersection1 * scanDistance + lineHypotenuseCenterPoint1.y } };
                                            
                                            let intersectionPoint1 = null;
                                            let intersectionPoint10 = getLinesIntersectionPoint( lineAdjacent1.p0.x, lineAdjacent1.p0.y, lineAdjacent1.p1.x, lineAdjacent1.p1.y, lineIntersection1.p0.x, lineIntersection1.p0.y, lineIntersection1.p1.x, lineIntersection1.p1.y );
                                            let intersectionPoint11 = getLinesIntersectionPoint( lineOpposite1.p0.x, lineOpposite1.p0.y, lineOpposite1.p1.x, lineOpposite1.p1.y, lineIntersection1.p0.x, lineIntersection1.p0.y, lineIntersection1.p1.x, lineIntersection1.p1.y );

                                            const distIntersectionPoint10 = Tools.getDistance( intersectionPoint10, lineHypotenuseCenterPoint1 );
                                            const distIntersectionPoint11 = Tools.getDistance( intersectionPoint11, lineHypotenuseCenterPoint1 );

                                            if ( distIntersectionPoint10 <= distIntersectionPoint11 ) {

                                                intersectionPoint1 = intersectionPoint10;

                                            } else {

                                                intersectionPoint1 = intersectionPoint11;

                                            }

                                            
                                            l1.controlPoint.x = intersectionPoint1.x;
                                            l1.controlPoint.y = intersectionPoint1.y;
                                            l1.centerPoint = Tools.interpolateQuadraticBezier( l1.p0, intersectionPoint1, l1.p1, 0.50 );

                                            //---

                                            tempGraphSegments.push( { type: 'line', p0: { x: l0.p0.x | 0, y: l0.p0.y | 0 }, p1: { x: l0.p1.x | 0, y: l0.p1.y | 0 }, color: { r: 155, g: 155, b: 55, a: 255 } } );
                                            tempGraphSegments.push( { type: 'line', p0: { x: l1.p0.x | 0, y: l1.p0.y | 0 }, p1: { x: l1.p1.x | 0, y: l1.p1.y | 0 }, color: { r: 55, g: 155, b: 155, a: 255 } } );
                                            tempGraphSegments.push( { type: 'circfill', position: centerLane.p0, diameter: 3, color: { r: 55, g: 255, b: 55, a: 255 } } );
                                            tempGraphSegments.push( { type: 'circfill', position: centerLane.p1, diameter: 3, color: { r: 55, g: 255, b: 55, a: 255 } } );
                                            tempGraphSegments.push( { type: 'line', p0: { x: lineAdjacent0.p0.x, y: lineAdjacent0.p0.y }, p1: { x: lineAdjacent0.p1.x, y: lineAdjacent0.p1.y }, color: { r: 25, g: 25, b: 255, a: 255 } } );
                                            tempGraphSegments.push( { type: 'line', p0: { x: lineAdjacent1.p0.x, y: lineAdjacent1.p0.y }, p1: { x: lineAdjacent1.p1.x, y: lineAdjacent1.p1.y }, color: { r: 25, g: 25, b: 255, a: 255 } } );
                                            tempGraphSegments.push( { type: 'line', p0: { x: lineOpposite0.p0.x, y: lineOpposite0.p0.y }, p1: { x: lineOpposite0.p1.x, y: lineOpposite0.p1.y }, color: { r: 25, g: 255, b: 25, a: 255 } } );
                                            tempGraphSegments.push( { type: 'line', p0: { x: lineOpposite1.p0.x, y: lineOpposite1.p0.y }, p1: { x: lineOpposite1.p1.x, y: lineOpposite1.p1.y }, color: { r: 25, g: 255, b: 25, a: 255 } } );

                                            tempGraphSegments.push( { type: 'circfill', position: lineHypotenuseCenterPoint0, diameter: 3, color: { r: 255, g: 55, b: 55, a: 255 } } );
                                            tempGraphSegments.push( { type: 'line', p0: { x: lineIntersection0.p0.x | 0, y: lineIntersection0.p0.y | 0 }, p1: { x: lineIntersection0.p1.x | 0, y: lineIntersection0.p1.y | 0 }, color: { r: 55, g: 55, b: 55, a: 255 } } );

                                            tempGraphSegments.push( { type: 'circfill', position: lineHypotenuseCenterPoint1, diameter: 3, color: { r: 155, g: 55, b: 55, a: 255 } } );
                                            tempGraphSegments.push( { type: 'line', p0: { x: lineIntersection1.p0.x | 0, y: lineIntersection1.p0.y | 0 }, p1: { x: lineIntersection1.p1.x | 0, y: lineIntersection1.p1.y | 0 }, color: { r: 55, g: 55, b: 55, a: 255 } } );

                                            tempGraphSegments.push( { type: 'circfill', position: intersectionPoint0, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );
                                            tempGraphSegments.push( { type: 'circfill', position: intersectionPoint1, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );

                                            //---

                                            tempGraphSegments.push( { type: 'bezier', p0: l0.p0, controlPoint: l0.controlPoint, p1: l0.p1, color: { r: 200, g: 200, b: 200, a: 255 } } );
                                            tempGraphSegments.push( { type: 'bezier', p0: l1.p0, controlPoint: l1.controlPoint, p1: l1.p1, color: { r: 200, g: 200, b: 200, a: 255 } } );

                                            //---

                                            streetSegment.crossLanes.push( l0, l1 );

                                        }

                                    } 

                                    //---

                                    laneIndex++;

                                    if ( laneIndex === 0 ) {

                                        laneIndex++;

                                    }

                                }

                            } else {

                                const lane = streetSegment.lanes[ 0 ];

                                lane.p0.x = streetSegment.p0.x;
                                lane.p0.y = streetSegment.p0.y;
                                lane.p1.x = tempP1.x;
                                lane.p1.y = tempP1.y;
                                lane.controlPoint.x = streetSegment.controlPoint.x;
                                lane.controlPoint.y = streetSegment.controlPoint.y;
                                lane.centerPoint.x = streetSegment.centerPoint.x;
                                lane.centerPoint.y = streetSegment.centerPoint.y;

                                tempGraphSegments.push( { type: 'bezier', p0: lane.p0, controlPoint: lane.controlPoint, p1: lane.p1, color: { r: 200, g: 200, b: 200, a: 255 } } );

                                //---
                                //streetBorder

                                let borderDistanceTop = -streetSegment.laneDistance;
                                let borderDistanceBottom = streetSegment.laneDistance;

                                //---
                                //top

                                const streetBorderTop = getNewStreetSegmentLane( { x: sinStart * borderDistanceTop + streetSegment.p0.x, y: -cosStart * borderDistanceTop + streetSegment.p0.y }, { x: sinEnd * borderDistanceTop + tempP1.x, y: -cosEnd * borderDistanceTop + tempP1.y }, { x: 0, y: 0 }, { x: 0, y: 0 } );

                                const lineAdjacentTop = { p0: { x: sinAdjacent * scanDistance + streetBorderTop.p0.x, y: -cosAdjacent * scanDistance + streetBorderTop.p0.y }, p1: { x: -sinAdjacent * scanDistance + streetBorderTop.p0.x, y: cosAdjacent * scanDistance + streetBorderTop.p0.y } };
                                const lineOppositeTop = { p0: { x: sinOpposite * scanDistance + streetBorderTop.p1.x, y: -cosOpposite * scanDistance + streetBorderTop.p1.y }, p1: { x: -sinOpposite * scanDistance + streetBorderTop.p1.x, y: cosOpposite * scanDistance + streetBorderTop.p1.y } };
                                const lineHypotenuseCenterPointTop = { x: streetBorderTop.p1.x + ( streetBorderTop.p0.x - streetBorderTop.p1.x ) / 2, y: streetBorderTop.p1.y + ( streetBorderTop.p0.y - streetBorderTop.p1.y ) / 2 };
                                const lineIntersectionTop = { p0: { x: sinIntersection * scanDistance + lineHypotenuseCenterPointTop.x, y: -cosIntersection * scanDistance + lineHypotenuseCenterPointTop.y }, p1: { x: -sinIntersection * scanDistance + lineHypotenuseCenterPointTop.x, y: cosIntersection * scanDistance + lineHypotenuseCenterPointTop.y } };

                                //---

                                let intersectionPointTop = null;
                                let intersectionPointTop0 = getLinesIntersectionPoint( lineAdjacentTop.p0.x, lineAdjacentTop.p0.y, lineAdjacentTop.p1.x, lineAdjacentTop.p1.y, lineIntersectionTop.p0.x, lineIntersectionTop.p0.y, lineIntersectionTop.p1.x, lineIntersectionTop.p1.y );
                                let intersectionPointTop1 = getLinesIntersectionPoint( lineOppositeTop.p0.x, lineOppositeTop.p0.y, lineOppositeTop.p1.x, lineOppositeTop.p1.y, lineIntersectionTop.p0.x, lineIntersectionTop.p0.y, lineIntersectionTop.p1.x, lineIntersectionTop.p1.y );

                                const distintersectionPointTop00 = Tools.getDistance( intersectionPointTop0, lineHypotenuseCenterPointTop );
                                const distintersectionPointTop01 = Tools.getDistance( intersectionPointTop1, lineHypotenuseCenterPointTop );

                                if ( distintersectionPointTop00 <= distintersectionPointTop01 ) {

                                    intersectionPointTop = intersectionPointTop0;

                                } else {

                                    intersectionPointTop = intersectionPointTop1;

                                }

                                streetBorderTop.controlPoint.x = intersectionPointTop.x;
                                streetBorderTop.controlPoint.y = intersectionPointTop.y;
                                streetBorderTop.centerPoint = Tools.interpolateQuadraticBezier( streetBorderTop.p0, streetBorderTop.controlPoint, streetBorderTop.p1, 0.50 );

                                //---

                                tempGraphSegments.push( { type: 'bezier', p0: streetBorderTop.p0, controlPoint: streetBorderTop.controlPoint, p1: streetBorderTop.p1, color: { r: 255, g: 55, b: 255, a: 255 } } );

                                //---

                                streetSegment.borders.push( streetBorderTop );

                                //---
                                //bottom
                                
                                const streetBorderBottom = getNewStreetSegmentLane( { x: sinStart * borderDistanceBottom + streetSegment.p0.x, y: -cosStart * borderDistanceBottom + streetSegment.p0.y }, { x: sinEnd * borderDistanceBottom + tempP1.x, y: -cosEnd * borderDistanceBottom + tempP1.y }, { x: 0, y: 0 }, { x: 0, y: 0 } );

                                const lineAdjacentBottom = { p0: { x: sinAdjacent * scanDistance + streetBorderBottom.p0.x, y: -cosAdjacent * scanDistance + streetBorderBottom.p0.y }, p1: { x: -sinAdjacent * scanDistance + streetBorderBottom.p0.x, y: cosAdjacent * scanDistance + streetBorderBottom.p0.y } };
                                const lineOppositeBottom = { p0: { x: sinOpposite * scanDistance + streetBorderBottom.p1.x, y: -cosOpposite * scanDistance + streetBorderBottom.p1.y }, p1: { x: -sinOpposite * scanDistance + streetBorderBottom.p1.x, y: cosOpposite * scanDistance + streetBorderBottom.p1.y } };
                                const lineHypotenuseCenterPointBottom = { x: streetBorderBottom.p1.x + ( streetBorderBottom.p0.x - streetBorderBottom.p1.x ) / 2, y: streetBorderBottom.p1.y + ( streetBorderBottom.p0.y - streetBorderBottom.p1.y ) / 2 };
                                const lineIntersectionBottom = { p0: { x: sinIntersection * scanDistance + lineHypotenuseCenterPointBottom.x, y: -cosIntersection * scanDistance + lineHypotenuseCenterPointBottom.y }, p1: { x: -sinIntersection * scanDistance + lineHypotenuseCenterPointBottom.x, y: cosIntersection * scanDistance + lineHypotenuseCenterPointBottom.y } };

                                //---

                                let intersectionPointBottom = null;
                                let intersectionPointBottom0 = getLinesIntersectionPoint( lineAdjacentBottom.p0.x, lineAdjacentBottom.p0.y, lineAdjacentBottom.p1.x, lineAdjacentBottom.p1.y, lineIntersectionBottom.p0.x, lineIntersectionBottom.p0.y, lineIntersectionBottom.p1.x, lineIntersectionBottom.p1.y );
                                let intersectionPointBottom1 = getLinesIntersectionPoint( lineOppositeBottom.p0.x, lineOppositeBottom.p0.y, lineOppositeBottom.p1.x, lineOppositeBottom.p1.y, lineIntersectionBottom.p0.x, lineIntersectionBottom.p0.y, lineIntersectionBottom.p1.x, lineIntersectionBottom.p1.y );

                                const distintersectionPointBottom00 = Tools.getDistance( intersectionPointBottom0, lineHypotenuseCenterPointBottom );
                                const distintersectionPointBottom01 = Tools.getDistance( intersectionPointBottom1, lineHypotenuseCenterPointBottom );

                                if ( distintersectionPointBottom00 <= distintersectionPointBottom01 ) {

                                    intersectionPointBottom = intersectionPointBottom0;

                                } else {

                                    intersectionPointBottom = intersectionPointBottom1;

                                }

                                streetBorderBottom.controlPoint.x = intersectionPointBottom.x;
                                streetBorderBottom.controlPoint.y = intersectionPointBottom.y;
                                streetBorderBottom.centerPoint = Tools.interpolateQuadraticBezier( streetBorderBottom.p0, streetBorderBottom.controlPoint, streetBorderBottom.p1, 0.50 );

                                //---

                                tempGraphSegments.push( { type: 'bezier', p0: streetBorderBottom.p0, controlPoint: streetBorderBottom.controlPoint, p1: streetBorderBottom.p1, color: { r: 255, g: 55, b: 255, a: 255 } } );

                                //---

                                streetSegment.borders.push( streetBorderBottom );


                                /*
                                let borderDistance = 0;

                                if ( i === 0 && i <= lanePositionSwitch || i === l - 1 && i > lanePositionSwitch ) {

                                    if ( i === 0 ) {

                                        borderDistance = ( ( streetSegment.lanes.length / 2 ) * -1 ) * streetSegment.laneDistance - streetSegment.laneDistance;

                                    } else if ( i === l - 1 ) {

                                        borderDistance = ( ( streetSegment.lanes.length / 2 ) * 1 ) * streetSegment.laneDistance + streetSegment.laneDistance;

                                    }

                                    const streetBorder = getNewStreetSegmentLane( { x: sinStart * borderDistance + streetSegment.p0.x, y: -cosStart * borderDistance + streetSegment.p0.y }, { x: sinEnd * borderDistance + tempP1.x, y: -cosEnd * borderDistance + tempP1.y }, { x: 0, y: 0 }, { x: 0, y: 0 } );

                                    const lineAdjacent = { p0: { x: sinAdjacent * scanDistance + streetBorder.p0.x, y: -cosAdjacent * scanDistance + streetBorder.p0.y }, p1: { x: -sinAdjacent * scanDistance + streetBorder.p0.x, y: cosAdjacent * scanDistance + streetBorder.p0.y } };
                                    const lineOpposite = { p0: { x: sinOpposite * scanDistance + streetBorder.p1.x, y: -cosOpposite * scanDistance + streetBorder.p1.y }, p1: { x: -sinOpposite * scanDistance + streetBorder.p1.x, y: cosOpposite * scanDistance + streetBorder.p1.y } };
                                    const lineHypotenuseCenterPoint = { x: streetBorder.p1.x + ( streetBorder.p0.x - streetBorder.p1.x ) / 2, y: streetBorder.p1.y + ( streetBorder.p0.y - streetBorder.p1.y ) / 2 };
                                    const lineIntersection = { p0: { x: sinIntersection * scanDistance + lineHypotenuseCenterPoint.x, y: -cosIntersection * scanDistance + lineHypotenuseCenterPoint.y }, p1: { x: -sinIntersection * scanDistance + lineHypotenuseCenterPoint.x, y: cosIntersection * scanDistance + lineHypotenuseCenterPoint.y } };

                                    //---

                                    let intersectionPoint = null;
                                    let intersectionPoint0 = getLinesIntersectionPoint( lineAdjacent.p0.x, lineAdjacent.p0.y, lineAdjacent.p1.x, lineAdjacent.p1.y, lineIntersection.p0.x, lineIntersection.p0.y, lineIntersection.p1.x, lineIntersection.p1.y );
                                    let intersectionPoint1 = getLinesIntersectionPoint( lineOpposite.p0.x, lineOpposite.p0.y, lineOpposite.p1.x, lineOpposite.p1.y, lineIntersection.p0.x, lineIntersection.p0.y, lineIntersection.p1.x, lineIntersection.p1.y );

                                    const distintersectionPoint00 = Tools.getDistance( intersectionPoint0, lineHypotenuseCenterPoint );
                                    const distintersectionPoint01 = Tools.getDistance( intersectionPoint1, lineHypotenuseCenterPoint );

                                    if ( distintersectionPoint00 <= distintersectionPoint01 ) {

                                        intersectionPoint = intersectionPoint0;

                                    } else {

                                        intersectionPoint = intersectionPoint1;

                                    }

                                    streetBorder.controlPoint.x = intersectionPoint.x;
                                    streetBorder.controlPoint.y = intersectionPoint.y;
                                    streetBorder.centerPoint = Tools.interpolateQuadraticBezier( streetBorder.p0, streetBorder.controlPoint, streetBorder.p1, 0.50 );

                                    //---

                                    tempGraphSegments.push( { type: 'bezier', p0: streetBorder.p0, controlPoint: streetBorder.controlPoint, p1: streetBorder.p1, color: { r: 255, g: 55, b: 255, a: 255 } } );

                                    //---

                                    streetSegment.borders.push( streetBorder );
                                    
                                }
                                */

                            }

                            //---
                            
                        }

                        if ( streetSegment.p1 !== null ) {

                            //---

                        }

                    }

                }

            }

        }

    }

    function getMousePos( canvas, event ) {

        const rect = canvas.getBoundingClientRect();

        return { x: event.clientX - rect.left, y: event.clientY - rect.top };

    }

    //--- ------------------------------------------------------------------------------------------------------------------------------

    function clearImageData() {

        // for ( let i = 0, l = dataMain.length; i < l; i += 4 ) {

        //     dataMain[ i ] = 0;
        //     dataMain[ i + 1 ] = 0;
        //     dataMain[ i + 2 ] = 0;
        //     dataMain[ i + 3 ] = 0;

        // }

        for ( let i = 3, l = dataMain.length; i < l; i += 4 ) {

            dataMain[ i ] = 0;

        }

        // var d = imageData.data;
        // var L = d.length;
        // for ( var i = 3; i < L; i += 4 )
        // {
        //     dataMain[ i ] = 0;
        // }

    }

    function setPixel( x, y, r, g, b, a ) {

        const i = ( x + y * imageDataMain.width ) * 4;

        dataMain[ i ] = r;
        dataMain[ i + 1 ] = g;
        dataMain[ i + 2 ] = b;
        dataMain[ i + 3 ] = a;

    }

    //--- ------------------------------------------------------------------------------------------------------------------------------

    function drawLine( x1, y1, x2, y2, r, g, b, a ) {

        const dx = Math.abs( x2 - x1 );
        const dy = Math.abs( y2 - y1 );

        const sx = ( x1 < x2 ) ? 1 : -1;
        const sy = ( y1 < y2 ) ? 1 : -1;

        let err = dx - dy;

        let lx = x1;
        let ly = y1;

        while ( true ) {

            if ( lx > 0 && lx < width && ly > 0 && ly < height ) {

                setPixel( lx, ly, r, g, b, a );

            }

            if ( ( lx === x2 ) && ( ly === y2 ) ) {

                break;

            }

            const e2 = 2 * err;

            if ( e2 > -dx ) {

                err -= dy;
                lx += sx;

            }

            if ( e2 < dy ) {

                err += dx;
                ly += sy;

            }

        }

    }

    function drawCircle( vector, radius, r, g, b, a ) {

        const radius2 = radius * radius;

        if ( radius === 1 ) {

            if ( vector.x > border.left && vector.x < border.right && vector.y > border.top && vector.y < border.bottom ) {

                setPixel( vector.x2d | 0, vector.y2d | 0, r, g, b, a );

            }

            return;

        }

        if ( vector.x + radius < border.left || vector.x - radius > border.right || vector.y + radius < border.top || vector.y - radius > border.bottom ) {

            return;

        }

        for ( let tx = -radius; tx < radius; tx ++ ) {

            for ( let ty = -radius; ty < radius; ty ++ ) {

                if ( tx * tx + ty * ty <= radius2 ) {

                    const x2d = vector.x + tx;
                    const y2d = vector.y + ty;

                    if ( x2d > border.left && x2d < border.right && y2d > border.top && y2d < border.bottom ) {

                        setPixel( x2d | 0, y2d | 0, r, g, b, a  );

                    }

                }

            }

        }

    }

    function drawCircleOutline( vector, radius, r, g, b, a, step = 0.05 ) {

        if ( radius === 1 ) {

            if ( vector.x > border.left && vector.x < border.right && vector.y > border.top && vector.y < border.bottom ) {

                setPixel( vector.x2d | 0, vector.y2d | 0, r, g, b, a );

            }

            return;

        }

        if ( vector.x + radius < border.left || vector.x - radius > border.right || vector.y + radius < border.top || vector.y - radius > border.bottom ) {

            return;

        }

        let lx = vector.x + radius * Math.cos( MATHPI2 );
        let ly = vector.y + radius * Math.sin( MATHPI2 );

        for ( let theta = 0; theta < MATHPI2 + step; theta += step ) {

            const x = vector.x + radius * Math.cos( theta );
            const y = vector.y + radius * Math.sin( theta );

            drawLine( lx | 0, ly | 0, x | 0, y | 0, r, g, b, a );

            lx = x;
            ly = y;

        }

    }

    function drawBox( vector, width, height, r, g, b, a ) {

        if ( vector.x + width / 2 < border.left || vector.x - width / 2 > border.right || vector.y + height / 2 < border.top || vector.y - height / 2 > border.bottom ) {

            return;

        }

        for ( let y2d = vector.y - height / 2, y2dE = vector.y + height / 2; y2d < y2dE; y2d ++ ) {

            for ( let x2d = vector.x - width / 2, x2dE = vector.x + width / 2; x2d < x2dE; x2d ++ ) {

                if ( x2d > border.left && x2d < border.right && y2d > border.top && y2d < border.bottom ) {

                    setPixel( x2d | 0, y2d | 0, r, g, b, a );

                }

            }

        }

    }

    function drawBoxOutline( vector, width, height, r, g, b, a ) {

        if ( vector.x + width / 2 < border.left || vector.x - width / 2 > border.right || vector.y + height / 2 < border.top || vector.y - height / 2 > border.bottom ) {

            return;

        }

        const topLeftX = vector.x - width / 2;
        const topLeftY = vector.y - height / 2;
        const topRightX = vector.x + width / 2;
        const topRightY = vector.y - height / 2;
        const bottomLeftX = vector.x - width / 2;
        const bottomLeftY = vector.y + height / 2;
        const bottomRightX = vector.x + width / 2;
        const bottomRightY = vector.y + height / 2;

        drawLine( topLeftX | 0, topLeftY | 0, topRightX | 0, topRightY | 0, r, g, b, a );
        drawLine( topRightX | 0, topRightY | 0, bottomRightX | 0, bottomRightY | 0, r, g, b, a );
        drawLine( bottomRightX | 0, bottomRightY | 0, bottomLeftX | 0, bottomLeftY | 0, r, g, b, a );
        drawLine( bottomLeftX | 0, bottomLeftY | 0, topLeftX | 0, topLeftY | 0, r, g, b, a );

    }

    function drawQuadraticBezier( sv, cv, ev, segments, r, g, b, a ) {

        if ( sv.x > border.left && sv.x < border.right && sv.y > border.top && sv.y < border.bottom || cv.x > border.left && cv.x < border.right && cv.y > border.top && cv.y < border.bottom || ev.x > border.left && ev.x < border.right && ev.y > border.top && ev.y < border.bottom ) {

            for ( let i = 0, l = 1 / segments; i < 1 + l; i += l ) {

                if ( i > 0 ) {
    
                    const c1 = Tools.interpolateQuadraticBezier( sv, cv, ev, i - l );
                    const c2 = Tools.interpolateQuadraticBezier( sv, cv, ev, i );
    
                    drawLine( c1.x | 0, c1.y | 0, c2.x | 0, c2.y | 0, r, g, b, a );
    
                }
    
            }

        }

    }

    //--- ------------------------------------------------------------------------------------------------------------------------------

    function visualizeMoveMap() {

        if ( navigator.active === false ) {

            return;

        }

        //---
        //draw navigation direction arrow

        const angleEnd = navigator.angle + Math.PI * 0.5;

        const sinEnd = Math.sin( angleEnd );
        const cosEnd = Math.cos( angleEnd );

        const lengthEnd = 10;
        
        if ( Tools.getDistance( navigator.positionInit, navigator.positionTarget ) > 20 ) {

            drawLine( navigator.positionInit.x | 0, navigator.positionInit.y | 0, navigator.positionTarget.x | 0, navigator.positionTarget.y | 0, 255, 255, 255, 255 );
            drawLine( ( sinEnd * lengthEnd +  navigator.positionInit.x ) | 0, ( -cosEnd * lengthEnd +  navigator.positionInit.y ) | 0, ( -sinEnd * lengthEnd +  navigator.positionInit.x ) | 0, ( cosEnd * lengthEnd +  navigator.positionInit.y ) | 0, 255, 255, 255, 255 );

        } else {

            drawCircle( navigator.positionInit, 2, 255, 255, 255, 255 );

        }

        //---

        let dist = -25;

        const cX = navigator.sin * dist + navigator.positionTarget.x;
        const cY = -navigator.cos * dist + navigator.positionTarget.y;

        const pSSX = navigator.sin * lengthEnd + cX;
        const pSSY = -navigator.cos * lengthEnd + cY;

        drawLine( ( sinEnd * lengthEnd + pSSX ) | 0, ( -cosEnd * lengthEnd + pSSY ) | 0, navigator.positionTarget.x | 0, navigator.positionTarget.y | 0, 255, 255, 255, 255 );
        drawLine( ( -sinEnd * lengthEnd + pSSX ) | 0, ( cosEnd * lengthEnd + pSSY ) | 0, navigator.positionTarget.x | 0, navigator.positionTarget.y | 0, 255, 255, 255, 255 );


    }

    function moveMap() {

        if ( navigator.active === false ) {

            return;

        }

        //---

        navigator.navigate();

    }

    //--- ------------------------------------------------------------------------------------------------------------------------------

    function drawImageData() {

        mouseCursor.position.x = mousePos.x;
        mouseCursor.position.y = mousePos.y;
        mouseCursor.color = { r: 255, g: 255, b: 255, a: 255 };

        //---

        visualizeMoveMap();

        //---
        //TEMP
        //visualizes the grid for debug purposes
        
        // const grid = collisionDetection.grid;

        // for ( let i = 0, l = grid.length; i < l; i ++ ) {

        //     const gridCell = grid[ i ];

        //     const boxPosition = { x: gridCell.x + gridCell.width / 2, y: gridCell.y + gridCell.height / 2 };

        //     if ( gridCell.vehicles.length === 0 ) {

        //         drawBoxOutline( boxPosition, gridCell.width - 1, gridCell.height - 1, 155, 0, 0, 255 );

        //     } else {

        //         // drawBox( boxPosition, gridCell.width, gridCell.height, 0, 0, 155, 55 );
        //         drawBoxOutline( boxPosition, gridCell.width - 1, gridCell.height - 1, 0, 0, 155, 255 );
        //         drawLine( gridCell.x | 0, gridCell.y | 0, gridCell.x + gridCell.width | 0, gridCell.y + gridCell.height | 0, 0, 0, 155, 255 );
        //         drawLine( gridCell.x | 0, gridCell.y + gridCell.height | 0, gridCell.x + gridCell.width | 0, gridCell.y | 0, 0, 0, 155, 255 );

        //     }

        //     drawCircle( gridCell, 2, 255, 0, 0, 255 );

        // }
        
        // // collisionDetection.checkCollisions();

        //---
        //TEMP
        //visualizes all vehicle points for debug purposes

        // for ( let i = 0, l = vehicles.allVehicles.length; i < l; i ++ ) {

        //     const vehicle = vehicles.allVehicles[ i ];

        //     drawCircle( vehicle.position, 2, 255, 0, 0, 255 );
        //     drawCircle( vehicle.lastPosition, 2, 0, 255, 0, 255 );


        // }

        //---
        //TEMP
        //visualizes all vehicle hitTest/collision angles

        // for ( let i = 0, l = vehicles.allVehicles.length; i < l; i ++ ) {

        //     const radius = Vehicles.VEHICLE_RADIUS * 2;

        //     const vehicle = vehicles.allVehicles[ i ];

        //     //---

        //     const angleRight = vehicle.angle + Math.PI * 1.00;

        //     const sinRight = Math.sin( angleRight );
        //     const cosRight = Math.cos( angleRight );
            
        //     const pxRight = sinRight * radius + vehicle.position.x;
        //     const pyRight = -cosRight * radius + vehicle.position.y;

        //     drawLine( vehicle.position.x | 0, vehicle.position.y | 0, pxRight | 0, pyRight | 0, 0, 191, 255, 255 );

        //     //---

        //     const angleFront = vehicle.angle + Math.PI * 0.50;

        //     const sinFront = Math.sin( angleFront );
        //     const cosFront = Math.cos( angleFront );
            
        //     const pxFront = sinFront * radius + vehicle.position.x;
        //     const pyFront = -cosFront * radius + vehicle.position.y;

        //     drawLine( vehicle.position.x | 0, vehicle.position.y | 0, pxFront | 0, pyFront | 0, 0, 191, 255, 255 );

        // }

        // for ( let i = 0, l = vehicles.allVehicles.length; i < l; i ++ ) {

        //     const radius = Vehicles.VEHICLE_RADIUS * 2;

        //     const vehicle = vehicles.allVehicles[ i ];

        //     //---
        //     //front angles

        //     // const angleFront = Tools.normalizeAngle( vehicle.angle ) + Settings.MATH_PI_050;
        //     const angleFront = vehicle.angle + Settings.MATH_PI_050;
        //     //const angleFront = vehicle.angle + Settings.DIR_LEFT;

        //     const angleLeft = angleFront - Settings.MATH_PI_015;
        //     const angleRight = angleFront + Settings.MATH_PI_015;

        //     const sinLeft = Math.sin( angleLeft );
        //     const cosLeft = Math.cos( angleLeft );
        //     const sinRight = Math.sin( angleRight );
        //     const cosRight = Math.cos( angleRight );

        //     const pxLeft = sinLeft * radius + vehicle.position.x;
        //     const pyLeft = -cosLeft * radius + vehicle.position.y;
        //     const pxRight = sinRight * radius + vehicle.position.x;
        //     const pyRight = -cosRight * radius + vehicle.position.y;

        //     drawLine( vehicle.position.x | 0, vehicle.position.y | 0, pxLeft | 0, pyLeft | 0, 255, 0, 0, 255 );
        //     drawLine( vehicle.position.x | 0, vehicle.position.y | 0, pxRight | 0, pyRight | 0, 0, 191, 255, 255 );

        //     //---

        //     if ( vehicle.drawTempStuff ) {
        //         //console.clear()
        //         //console.log( 'sdfsdfsdfsd' );
        //         vehicle.drawTempStuff.forEach( ( stuff, index ) => {
        //            // console.log( stuff );
        //             drawLine( stuff.x0 | 0, stuff.y0 | 0, stuff.x1 | 0, stuff.y1 | 0, stuff.r, stuff.g, stuff.b, stuff.a );

        //         } );

        //     }

        // }

        //---

        graphsManager.graphs.forEach( ( graph, index ) => {

            // let distanceAtTheMoment = Infinity;
            // let graphSegmentSelected = null;

            // if ( editorMode === EDITOR_MODE_ENUM.addGraphSegment ) {

            //     for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

            //         const graphSegment = graph.segments[ i ];

            //         if ( graphSegment.p0 !== null && graphSegment.p1 !== null ) {

            //             const distanceToSegment = signedDistanceToQuadraticBezier( mousePos, graphSegment.p0, graphSegment.p1, graphSegment.controlPoint, 25 );

            //             if ( distanceAtTheMoment > distanceToSegment ) {

            //                 distanceAtTheMoment = distanceToSegment;

            //                 if ( distanceAtTheMoment <= SNAP_TO_DISTANCE ) {

            //                     graphSegmentSelected = graphSegment;

            //                 }

            //             }

            //         }

            //     }

            //     if ( graphSegmentSelected !== null ) {



            //     }

            // }

            // //console.log( 'd: ', d );
            // //console.log( 'graphSegmentSelected: ', graphSegmentSelected );

            if ( Settings.MOUSE_SNAPPING.enabled === true ) {

                for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

                    const graphSegment = graph.segments[ i ];
    
                    if ( graphSegment.p0 !== null && graphSegment.p1 !== null ) {
    
                        //const distanceToSegment = signedDistanceToQuadraticBezier( mousePos, graphSegment.p0, graphSegment.p1, graphSegment.controlPoint, 25 );
    
                        //console.log( distanceToSegment );
    
    
    
                        //---
    
                        const distancep0 = Tools.getDistance( mousePos, graphSegment.p0 );
                        const distancep1 = Tools.getDistance( mousePos, graphSegment.p1 );
    
                        if ( distancep0 <= SNAP_TO_DISTANCE ) {
    
                            mouseCursor.position.x = graphSegment.p0.x;
                            mouseCursor.position.y = graphSegment.p0.y;
                            mouseCursor.color = { r: 0, g: 255, b: 0, a: 255 };
    
                            //console.log( 'p0: ', graphSegment.p0.x, graphSegment.p0.y, mousePos.x, mousePos.y );
    
                        } else if ( distancep1 <= SNAP_TO_DISTANCE ) {
    
                            mouseCursor.position.x = graphSegment.p1.x;
                            mouseCursor.position.y = graphSegment.p1.y;
                            mouseCursor.color = { r: 0, g: 255, b: 0, a: 255 };
    
                            //console.log( 'p1: ', graphSegment.p1.x, graphSegment.p1.y, mousePos.x, mousePos.y );
    
                        }
    
                    }
    
                }

            } 

            //---

            for ( let i = 0, l = graph.streetSegments.length; i < l; i ++ ) {

                const streetSegment = graph.streetSegments[ i ];

                if ( streetSegment.p0 !== null && streetSegment.p1 !== null ) {

                    const distancep0 = Tools.getDistance( mousePos, streetSegment.p0 );
                    const distancep1 = Tools.getDistance( mousePos, streetSegment.p1 );

                    if ( distancep0 <= SNAP_TO_DISTANCE ) {

                        mouseCursor.position.x = streetSegment.p0.x;
                        mouseCursor.position.y = streetSegment.p0.y;
                        mouseCursor.color = { r: 0, g: 255, b: 0, a: 255 };

                        //console.log( 'p0: ', graphSegment.p0.x, graphSegment.p0.y, mousePos.x, mousePos.y );

                    } else if ( distancep1 <= SNAP_TO_DISTANCE ) {

                        mouseCursor.position.x = streetSegment.p1.x;
                        mouseCursor.position.y = streetSegment.p1.y;
                        mouseCursor.color = { r: 0, g: 255, b: 0, a: 255 };

                        //console.log( 'p1: ', graphSegment.p1.x, graphSegment.p1.y, mousePos.x, mousePos.y );

                    }

                    //---

                    drawCircle( streetSegment.p0, 3, 124, 252, 0, 255 );
                    drawCircleOutline( streetSegment.p0, 6, 124, 252, 0, 255 );

                    drawCircle( streetSegment.p1, 3, 124, 252, 0, 255 );
                    drawCircleOutline( streetSegment.p1, 6, 124, 252, 0, 255 );

                }

            }

            //---

            for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

                const graphSegment = graph.segments[ i ];

                if ( graphSegment.p0 !== null ) {

                    if ( graphSegment.p1 === null && i === l - 1 ) {

                        drawLine( graphSegment.p0.x | 0, graphSegment.p0.y | 0, mouseCursor.position.x | 0, mouseCursor.position.y | 0, 0, 191, 255, 255 );

                        // if ( allowGraphSegmentSplitting === true ) {

                        //     const tempGraphSegment = {

                        //         id: graphSegment.id,
                        //         p0: graphSegment.p0,
                        //         p1: { x: mouseCursor.position.x, y: mouseCursor.position.y }

                        //     };

                        //     showGraphSegmentIntersectionPointsWithLine( tempGraphSegment );

                        // }

                    }

                }

                if ( graphSegment.p1 !== null ) {

                    let graphSegmentLineColor = { r: 0, g: 0, b: 0, a: 0 };

                    if ( graphSegment.walkable === true ) {

                        graphSegmentLineColor.r = 60;
                        graphSegmentLineColor.g = 120;
                        graphSegmentLineColor.b = 0;
                        graphSegmentLineColor.a = 255;

                    } else {

                        graphSegmentLineColor.r = 178;
                        graphSegmentLineColor.g = 34;
                        graphSegmentLineColor.b = 34;
                        graphSegmentLineColor.a = 255;

                    }

                    drawQuadraticBezier( graphSegment.p0, graphSegment.controlPoint, graphSegment.p1, 25, graphSegmentLineColor.r, graphSegmentLineColor.g, graphSegmentLineColor.b, graphSegmentLineColor.a );

                    //---
                    //draw debug graphSegment direction stuff

                    if ( debugMode === true ) {

                        drawCircle( graphSegment.centerPoint, 7, graphSegmentLineColor.r, graphSegmentLineColor.g, graphSegmentLineColor.b, graphSegmentLineColor.a );

                        //---

                        //get point on graphSegment depending on percentage value
                        //const interpolationPoint = interpolate( graphSegment.p0, graphSegment.p1, 0.50 );

                        //const cX = interpolationPoint.x;
                        //const cY = interpolationPoint.y;

                        //center x & y
                        const cX = graphSegment.centerPoint.x;// ( ( graphSegment.p0.x + graphSegment.p1.x ) / 2 );
                        const cY = graphSegment.centerPoint.y;// ( ( graphSegment.p0.y + graphSegment.p1.y ) / 2 );

                        //graphSegment angle
                        const angle = Math.atan2( graphSegment.p1.y - graphSegment.p0.y, graphSegment.p1.x - graphSegment.p0.x );

                        const length = 10;

                        const sinA = Math.sin( angle );
                        const cosA = Math.cos( angle );

                        //drawLine( ( sinA * length + cX ) | 0, ( -cosA * length + cY ) | 0, ( -sinA * length + cX ) | 0, ( cosA * length + cY ) | 0, 100, 100, 100, 255 );

                        //---

                        const angle2 = angle + Math.PI * 0.5;

                        const length2 = 20;

                        const sinA2 = Math.sin( angle2 );
                        const cosA2 = Math.cos( angle2 );

                        //drawLine( ( sinA2 * length2 + cX ) | 0, ( -cosA2 * length2 + cY ) | 0, ( -sinA2 * length2 + cX ) | 0, ( cosA2 * length2 + cY ) | 0, 255, 255, 255, 255 );

                        const pSSX = sinA2 * length2 + cX;
                        const pSSY = -cosA2 * length2 + cY;

                        const pSEX = -sinA2 * length2 + cX;
                        const pSEY = cosA2 * length2 + cY;

                        //drawLine( pSSX | 0, pSSY | 0, cX | 0, cY | 0, 255, 255, 255, 255 );
                        //drawLine( cX | 0, cY | 0, pSEX | 0, pSEY | 0, 255, 255, 255, 255 );

                        //---

                        if ( graphSegment.direction === '><' ) {

                            drawLine( ( sinA * length + pSSX ) | 0, ( -cosA * length + pSSY ) | 0, cX | 0, cY | 0, graphSegmentLineColor.r, graphSegmentLineColor.g, graphSegmentLineColor.b, graphSegmentLineColor.a );
                            drawLine( ( -sinA * length + pSSX ) | 0, ( cosA * length + pSSY ) | 0, cX | 0, cY | 0, graphSegmentLineColor.r, graphSegmentLineColor.g, graphSegmentLineColor.b, graphSegmentLineColor.a );

                            drawLine( ( sinA * length + pSEX ) | 0, ( -cosA * length + pSEY ) | 0, cX | 0, cY | 0, graphSegmentLineColor.r, graphSegmentLineColor.g, graphSegmentLineColor.b, graphSegmentLineColor.a );
                            drawLine( ( -sinA * length + pSEX ) | 0, ( cosA * length + pSEY ) | 0, cX | 0, cY | 0, graphSegmentLineColor.r, graphSegmentLineColor.g, graphSegmentLineColor.b, graphSegmentLineColor.a );

                        } else if ( graphSegment.direction === '>' ) {

                            drawLine( ( sinA * length + pSEX ) | 0, ( -cosA * length + pSEY ) | 0, cX | 0, cY | 0, graphSegmentLineColor.r, graphSegmentLineColor.g, graphSegmentLineColor.b, graphSegmentLineColor.a );
                            drawLine( ( -sinA * length + pSEX ) | 0, ( cosA * length + pSEY ) | 0, cX | 0, cY | 0, graphSegmentLineColor.r, graphSegmentLineColor.g, graphSegmentLineColor.b, graphSegmentLineColor.a );

                        } else if ( graphSegment.direction === '<' ) {

                            drawLine( ( sinA * length + pSSX ) | 0, ( -cosA * length + pSSY ) | 0, cX | 0, cY | 0, graphSegmentLineColor.r, graphSegmentLineColor.g, graphSegmentLineColor.b, graphSegmentLineColor.a );
                            drawLine( ( -sinA * length + pSSX ) | 0, ( cosA * length + pSSY ) | 0, cX | 0, cY | 0, graphSegmentLineColor.r, graphSegmentLineColor.g, graphSegmentLineColor.b, graphSegmentLineColor.a );

                        }

                    }

                }

            }

            for ( let i = 0, l = graph.points.length; i < l; i ++ ) {

                const point = graph.points[ i ];

                if ( point.walkable === true ) {

                    drawCircle( point, 3, 124, 252, 0, 255 );

                    if ( debugMode === true ) {

                        drawCircleOutline( point, 6, 124, 252, 0, 255 );

                    }

                } else {

                    drawCircle( point, 3, 178, 34, 34, 255 );

                    if ( debugMode === true ) {

                        drawCircleOutline( point, 6, 178, 34, 34, 255 );

                    }

                }

            }

            for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

                const route = graph.routes[ i ];
                const routeColor = route.color;
                //const routeColor = Settings.ROUTE_COLORS[ i ];
                // const routeColor = Tools.getRouteColorRGBA( i );

                if ( route.startPoint !== null ) {

                    drawCircle( route.startPoint, 5, routeColor.r, routeColor.g, routeColor.b, routeColor.a );
                    drawCircleOutline( route.startPoint, 9, routeColor.r, routeColor.g, routeColor.b, routeColor.a );

                }

                if ( route.endPoint !== null ) {

                    drawCircle( route.endPoint, 5, routeColor.r, routeColor.g, routeColor.b, routeColor.a );
                    drawCircleOutline( route.endPoint, 9, routeColor.r, routeColor.g, routeColor.b, routeColor.a );

                }

            }

            // for ( let i = 0, l = graph.streetSegments.length; i < l; i ++ ) {

            //     const streetSegment = graph.streetSegments[ i ];

            //     if ( streetSegment.p0 !== null && streetSegment.p1 === null ) {



            //     }

            //     if ( streetSegment.p1 !== null ) {



            //     }


            // }




        } );

        //---

        if ( editorMode !== EDITOR_MODE_ENUM.moveMap ) {

            drawCircleOutline( mouseCursor.position, mouseCursor.diameter, mouseCursor.color.r, mouseCursor.color.g, mouseCursor.color.b, mouseCursor.color.a );

        }

        //---

        //drawBox( rectangle.position, rectangle.dimensions.width, rectangle.dimensions.height, 15, 15, 15, 255 );

        //---

        for ( let i = 0, l = tempGraphSegments.length; i < l; i ++ ) {

            const tempGraphSegment = tempGraphSegments[ i ];

            if ( tempGraphSegment.type === 'line' ) {

                drawLine( tempGraphSegment.p0.x | 0, tempGraphSegment.p0.y | 0, tempGraphSegment.p1.x | 0, tempGraphSegment.p1.y | 0, tempGraphSegment.color.r, tempGraphSegment.color.g, tempGraphSegment.color.b, tempGraphSegment.color.a );

            } else if ( tempGraphSegment.type === 'circ' ) {

                drawCircleOutline( tempGraphSegment.position, tempGraphSegment.diameter, tempGraphSegment.color.r, tempGraphSegment.color.g, tempGraphSegment.color.b, tempGraphSegment.color.a );

            } else if ( tempGraphSegment.type === 'circfill' ) {

                drawCircle( tempGraphSegment.position, tempGraphSegment.diameter, tempGraphSegment.color.r, tempGraphSegment.color.g, tempGraphSegment.color.b, tempGraphSegment.color.a );

            } else if ( tempGraphSegment.type === 'bezier' ) {

                drawQuadraticBezier( tempGraphSegment.p0, tempGraphSegment.controlPoint, tempGraphSegment.p1, 25, tempGraphSegment.color.r, tempGraphSegment.color.g, tempGraphSegment.color.b, tempGraphSegment.color.a );

            } else if ( tempGraphSegment.type === 'box' ) {

                drawBoxOutline( tempGraphSegment.position, tempGraphSegment.width, tempGraphSegment.height, tempGraphSegment.color.r, tempGraphSegment.color.g, tempGraphSegment.color.b, tempGraphSegment.color.a );

            }

        }

        //---

        const allVehicles = vehicles.allVehicles;

        //console.clear();
        //console.log( allVehicles.length );

        // const speedTest = ( vehicle ) => {

        //     // vehicle.speed = vehicles.getVehicleSpeed( vehicle, vehicles.accelerateVehicleSpeed( vehicle, 0, Vehicles.VEHICLE_SPEED, 0 ), Vehicles.VEHICLE_SPEED );
        //     //vehicle.speed = vehicles.getVehicleSpeed( vehicle, vehicles.accelerateVehicleSpeed( vehicle, 0, vehicle.maxSpeed ), Vehicles.VEHICLE_SPEED );
        //     //console.log(vehicles.getVehicleSpeed( vehicle, Vehicles.VEHICLE_SPEED ));
        //     // return vehicles.getVehicleSpeed( vehicle, Vehicles.VEHICLE_SPEED );
        //     // return vehicles.getVehicleSpeed( vehicle, vehicles.accelerateVehicleSpeed( vehicle, vehicle.speed, Vehicles.VEHICLE_SPEED ), Vehicles.VEHICLE_SPEED );
        //     return vehicles.getVehicleSpeed( vehicle, vehicles.accelerateVehicleSpeed( vehicle, 0, Vehicles.VEHICLE_SPEED ) );
        // };

        for ( let i = 0, l = allVehicles.length; i < l; i ++ ) {

            const vehicle = allVehicles[ i ];

            let vehicleSpeed = 1;

            if ( vehicle.collisionDetected === true ) {

                //---
                //debug collision
                drawCircleOutline( vehicle.position, Vehicles.VEHICLE_RADIUS / 2 + 2.5, 255, 0, 0, 255, 0.50 );

                //---
                //debug collision by angle

                // const radius = Vehicles.VEHICLE_RADIUS * 2;

                // const angleFront = vehicle.angle + Settings.MATH_PI_050;

                // const angleLeft = angleFront - Settings.MATH_PI_015;
                // const angleRight = angleFront + Settings.MATH_PI_015;

                // const sinLeft = Math.sin( angleLeft );
                // const cosLeft = Math.cos( angleLeft );
                // const sinRight = Math.sin( angleRight );
                // const cosRight = Math.cos( angleRight );

                // const pxLeft = sinLeft * radius + vehicle.position.x;
                // const pyLeft = -cosLeft * radius + vehicle.position.y;
                // const pxRight = sinRight * radius + vehicle.position.x;
                // const pyRight = -cosRight * radius + vehicle.position.y;

                // drawLine( vehicle.position.x | 0, vehicle.position.y | 0, pxLeft | 0, pyLeft | 0, 255, 255, 0, 255 );
                // drawLine( vehicle.position.x | 0, vehicle.position.y | 0, pxRight | 0, pyRight | 0, 0, 191, 255, 255 );

                //---
                //debug collision by point in circle

                // const sinFront = Math.sin( angleFront );
                // const cosFront = Math.cos( angleFront );

                // const pxFront = sinFront * Vehicles.VEHICLE_RADIUS + vehicle.position.x;
                // const pyFront = -cosFront * Vehicles.VEHICLE_RADIUS + vehicle.position.y;

                // drawLine( vehicle.position.x | 0, vehicle.position.y | 0, pxFront | 0, pyFront | 0, 255, 0, 255, 255 );

                // drawCircleOutline( { x: pxFront, y: pyFront }, Vehicles.VEHICLE_RADIUS / 2 + 2.5, 255, 0, 255, 255, 0.50 );

                //---

                //vehicle.speed = 0;

                vehicleSpeed = 0;

            } else {

                //if ( vehicle.halted === false ) {

                    //vehicle.speed = vehicles.getVehicleSpeed( vehicle, Vehicles.VEHICLE_SPEED );
                    //vehicle.speed = speedTest( vehicle );

                //}

                vehicleSpeed = 1;

            }

            // if ( vehicle.queueInIntersection === true ) {
            if ( vehicle.queuePoint !== null ) {

                //---
                //debug in queue
                drawCircleOutline( vehicle.position, Vehicles.VEHICLE_RADIUS / 2 + 2.5, 0, 255, 0, 255, 0.50 );

                // if ( vehicle.queueTimer > 0 && vehicle.queuePoint.vehiclesWaiting.length > 1 ) {
                // if ( vehicle.queueTimer > 0 ) {
                if ( vehicle.queueWaiting === true && vehicle.queuePoint.vehiclesWaiting.length > 1 ) {
                // if ( vehicle.queueWaiting === true && vehicle.queuePoint.vehiclesWaiting.length > 1 && vehicle.only2VehiclesFromSameRoute === false ) {
                // if ( vehicle.queueWaiting === true && vehicle.queueIndex > 0 ) {
                // if ( vehicle.queueWaiting === true && vehicle.queueLength > 1 ) {

                    //vehicle.speed = 0;

                    vehicleSpeed = 0;

                    // if ( vehicle.queuePoint.vehiclesWaiting.length === 2 && vehicle.only2VehiclesFromSameRoute === true ) {

                    //     vehicle.speed = vehicles.getVehicleSpeed( vehicle, Vehicles.VEHICLE_SPEED );
                    //     //console.log("sdfsdfsdfsdfsdf");
    
                    // } else {

                    //     vehicle.speed = 0;

                    // }

                } else {

                    //if ( vehicle.speed === 0 ) {
                    if ( vehicle.speed === 0 && vehicle.queuePrevious === false ) {
                    //if ( vehicle.queuePrevious === false ) {

                        //if ( vehicle.halted === false ) {

                            //vehicle.speed = vehicles.getVehicleSpeed( vehicle, Vehicles.VEHICLE_SPEED );
                            //vehicle.speed = speedTest( vehicle );

                            vehicleSpeed = 1;

                            //vehicle.speed = vehicles.getVehicleSpeed( vehicle, vehicles.accelerateVehicleSpeed( vehicle, 0, Vehicles.VEHICLE_SPEED, 0 ), Vehicles.VEHICLE_SPEED );
                            //vehicle.speed = vehicles.getVehicleSpeed( vehicle, vehicles.accelerateVehicleSpeed( vehicle, 0, vehicle.maxSpeed ), Vehicles.VEHICLE_SPEED );
                            
                            // speedTest( vehicle );
                            
                            // console.log( vehicle.id, vehicle.speed, vehicle.maxSpeed, Vehicles.VEHICLE_SPEED );
                        //}

                    }

                }

            }

            //---

            if ( vehicleSpeed === 0 ) {

                vehicle.speed = 0;
                //vehicle.speed += ( 0 - vehicle.speed ) / 10;

            } else if ( vehicleSpeed === 1 ) {

                vehicle.speed = vehicles.getVehicleSpeed( vehicle, Vehicles.VEHICLE_SPEED );
                //vehicle.speed = speedTest( vehicle );
                //vehicle.speed += ( vehicles.getVehicleSpeed( vehicle, Vehicles.VEHICLE_SPEED ) - vehicle.speed ) / 10;

            }

            //---

            if ( vehicle.halted === true ) {

                drawCircleOutline( vehicle.position, Vehicles.VEHICLE_RADIUS / 2 + 2.5, 0, 255, 255, 255, 0.50 );

                vehicle.speed = 0;

            }

        }

        if ( vehicles.vehicleSelected !== null ) {

            if ( vehicles.vehicleSelected.t < 1 ) {

                drawCircleOutline( vehicles.vehicleSelected.position, Vehicles.VEHICLE_RADIUS, 0, 255, 0, 255, 0.50 );

                //---

                const graphIndex = 0;

                const graph = graphsManager.graphs[ graphIndex ];

                const route = graph.routes[ vehicles.vehicleSelected.routeIndex ];
                const routeColor = route.color;

                for ( let i = 0, l = route.graphSegments.length; i < l; i ++ ) {

                    const graphSegment = route.graphSegments[ i ];

                    drawQuadraticBezier( graphSegment.p0, graphSegment.controlPoint, graphSegment.p1, 25, routeColor.r, routeColor.g, routeColor.b, routeColor.a );

                }

            }

        }

    }

    function drawContext() {

        drawStreetSegments();

        if ( animationFrameManager.iteration % 5 === 1 ) collisionDetection.clearCollisions();//jedes vierte frame
        //collisionDetection.clearCollisions();

        vehicles.simulate();

        if ( animationFrameManager.iteration % 6 === 1 ) collisionDetection.checkIntersections();//jedes fünfte frame
        // collisionDetection.checkIntersections();

        //collisionDetection.check();
        if ( animationFrameManager.iteration % 5 === 1 ) collisionDetection.checkCollisions();//jedes vierte frame
        //collisionDetection.checkCollisions();

        //---

        if ( editorMode === EDITOR_MODE_ENUM.followVehicle ) {

            vehicles.followVehicle( vehicles.vehicleSelected )

        }

    }

    //--- ------------------------------------------------------------------------------------------------------------------------------

    // var lastUpdate = new Date();
    // let start;
    // let last = 0;

    //let ticker = 0;

    //const testAnimationFrameTimer = new AnimationFrameTimer( () => console.log( 'tick' ), 500 );
    function render( timestamp ) {

        // var now = new Date();
        // var elapsed = now - lastUpdate;
        // lastUpdate = now;

        // if (start === undefined)
        //     start = timestamp;
        // const elapsed = timestamp - start;

        // console.log( elapsed );

        //testAnimationFrameTimer.call( timestamp );

        //if ( vehicles.vehiclesTimer !== null ) {
        //console.log( 'call, ', timestamp );
        vehicles.vehiclesTimer.call( timestamp );
        //vehicles.vehiclesTimer.call( elapsed );

        // if ( vehicles.vehiclesTimer.active === true ) {
            
        //     vehicles.vehiclesTimer.call( timestamp );

        // }

        // console.log( timestamp );

        //---

        //clearImageData();

        //better performance than clearImageData();
        dataMain.set( clearData );

        //---

        drawImageData();

        //---

        contextMain.putImageData( imageDataMain, 0, 0 );

        //---

        drawContext();
        
        //---

        if ( editorMode === EDITOR_MODE_ENUM.moveMap ) {

            moveMap();

        }

        //---

        stats.update();

        //---

        //const time = vehicles.vehiclesSimulation === true ? stopwatch.step( timestamp )

        statistics.update( {
            
            'Vehicles ': vehicles.allVehicles.length,
            'Points ': graphsManager.graphs[ 0 ].points.length,
            'Segments ': graphsManager.graphs[ 0 ].segments.length,
            'Routes ': graphsManager.graphs[ 0 ].routes.length,
            'Intersections ': graphsManager.graphIntersectionsLength,
            'Gridcells ': collisionDetection.grid.length,
            'Timer ': stopwatch.time,
            
        } );

        //---
        //ticker++;
        //animationFrame = requestAnimFrame( render );

    }

    // window.requestAnimFrame = ( () => {

    //     return  window.requestAnimationFrame       ||
    //             window.webkitRequestAnimationFrame ||
    //             window.mozRequestAnimationFrame    ||
    //             window.oRequestAnimationFrame      || 
    //             window.msRequestAnimationFrame     ||
    //             function( callback ) {
    //                 window.setTimeout( callback, 1000 / 60 );
    //             };

    // } )();

    // window.cancelAnimFrame = ( () => {

    //     return  window.cancelAnimationFrame       ||
    //             window.mozCancelAnimationFrame    || 
    //             function( animationFrame ) {
    //                 clearTimeout( animationFrame )
    //             };

    // } )();

    //--- ------------------------------------------------------------------------------------------------------------------------------

    init();
    initGUI();

    //--- ------------------------------------------------------------------------------------------------------------------------------

} );
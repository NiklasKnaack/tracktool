this.addEventListener( 'message', init, false );

function init( event ) {

    const data = event.data;

    console.log( 'worker get: ', data );

    postMessage( 'worker startet' );

}
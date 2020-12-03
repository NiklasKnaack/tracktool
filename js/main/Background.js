class Background {

    constructor() {

        if ( !Background.instance ) {

            Background.instance = this;

        }

        //---

        

        //---
       
        return Background.instance;

    }

}
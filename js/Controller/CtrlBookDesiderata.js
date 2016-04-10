desiderata.controller('bookDesiderata',function($scope, $http, $state, $rootScope, $stateParams, $modal, serviceHelper){
    $rootScope.desiderataList = [];
    $scope.availableText = [];
    $scope.notCreatingNewDesiderata = true;
    $rootScope.addingText = false;
    $scope.newtitle= '';
    $rootScope.chosenText = [];

    var startPos;
    var changedPos;

    var endChange = function(e, ui) {
            //console.log("pagina: "+$scope.paginationOpt.currentPage);
            //console.log("item: "+$scope.paginationOpt.itemsPage);
            changedPos = ui.item.index()
            console.log(changedPos);
            $scope.sortArray();
    };

    $scope.openCancelModal = function(obj){
        var modalObj = {};
        modalObj.title = obj.title;
        modalObj.body = obj.preview;
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'myModalCancelContent.html',
          controller: 'ModalCancelCtrl',
          size: 'lg',
          resolve: {
            obj: function () {
              return obj;
            }
          }
        });
    }

    $scope.openConfirmModal = function(titleDes, idDes, idBook, idPar){
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'myModalConfirmContent.html',
          controller: 'ModalConfirmCtrl',
          size: 'lg',
          resolve: {
            obj: function () {
              return {'titleDes' : titleDes, 'idDes' : idDes, 'idBook': idBook, 'idPar' : idPar};
            }
          }
        });
    }

     $scope.openReadingModal = function (obj) {
        var modalObj = {};
        console.log(obj);
        modalObj.title = obj.title;
        modalObj.body = obj.preview;
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'myModalContent.html',
          controller: 'ModalCtrl',
          size: 'lg',
          resolve: {
            obj: function () {
              return obj;
            }
          }
        });
    }

    $scope.openFinalizeModal = function(){
        var modalObj = {};

        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'finalizzaAcquisti.html',
          controller: 'ModalFinalizeCtrl',
          size: 'lg',
          resolve: {
          }
        });
    }

    $scope.openReadingModal = function (obj) {
       var modalObj = {};
       modalObj.title = obj.title;
       modalObj.body = obj.preview;
       var modalInstance = $modal.open({
         animation: $scope.animationsEnabled,
         templateUrl: 'myModalContent.html',
         controller: 'ModalCtrl',
         size: 'lg',
         resolve: {
           obj: function () {
             return modalObj;
           }
         }
       });
   }

    var startChange = function(e, ui){
        startPos = ui.item.index() ;
        console.log(startPos);
    };

    $scope.sortArray = function(){
        //console.log($scope.arrayCurrent);
        //console.log(startPos);
        //console.log(changedPos);
        var obj = $rootScope.chosenText[startPos];
        //console.log(obj);
        $rootScope.chosenText.splice(startPos , 1);
        $rootScope.chosenText.splice(changedPos, 0 ,obj);
        console.log($rootScope.chosenText);
        $scope.$apply();
        //console.log($scope.arrayImage);
    };

     angular.element("#sortable").sortable({
                axis: 'y',
                opacity: 0.5,
                update: endChange,
                start: startChange
            }).disableSelection();

    $scope.resetForms = function(){

        //$rootScope.desiderataList = [];
        $scope.availableText = [];
        $scope.notCreatingNewDesiderata = true;
        $rootScope.addingText = false;
        $scope.newtitle= '';
        $rootScope.chosenText = [];
        $rootScope.chosenArgs = [];
        $rootScope.chosenText = [];
        $rootScope.desiderataArgs = [];
        $rootScope.desiderataText = [];
    }

    if( (window.cordova && ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine ) && $rootScope.readOnline == true) || (!window.cordova && ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine )) ){
        serviceHelper.getDesiderata().then(function(response){
          if(response.error){
              console.log('errore nella getDesiderata');
          }
          else{
            $rootScope.desiderataList = response.data.desiderata;
          }
        });
    }
    else{
      $scope.readingOffline = true;
    }

    $scope.creatingNew = function(){
        $scope.notCreatingNewDesiderata = false;
    }

    $scope.modDesiderata = function(idBook){
        $scope.notCreatingNewDesiderata = false;
        $scope.idModDes = idBook;
        serviceHelper.modifyContentDesiderata(idBook).then(function(response){
          if(response.error){
            console.log("errore nel dettaglio della desiderata");
          }
          else{
              var temp = response.data.elements;
              $rootScope.chosenText = temp ;
              $scope.newtitle = response.data.title;
              $scope.tagsDes = response.data.tags;
              $scope.modifyingDes = true;
          }
        });
    }


    $scope.addThisTextToDes = function(id){
        console.log('desiderata: ' +id);
        console.log('id pubblicazione: '+$stateParams.idBook);
        console.log('id capitolo: '+$stateParams.idPar);
        var titleDes;
        var idDes;
        for( var i = 0; i < $rootScope.desiderataList.length ; i++  ){
            if( $rootScope.desiderataList[i].id == id ){
                titleDes = $rootScope.desiderataList[i].title;
                idDes = id;
                break;
            }
        }

        $scope.openConfirmModal(titleDes, idDes, $stateParams.idBook, $stateParams.idPar);
    }

    $scope.dropText = function(index){
        var obj = $rootScope.chosenText[index];
        $rootScope.chosenText.splice(index,1);
        //$rootScope.desiderataText.splice($rootScope.desiderataText.length,0,obj);
        $rootScope.desiderataText = [];
        $rootScope.desiderataArgs = [];
        var request = {
            "text": $scope.search.searchingText,
            "topics": $rootScope.chosenArgs
        }
        serviceHelper.search(request).then(function(response){
          if(response.error){
            console.log('errore nella search');
          }
          else{
            console.log(response.data);
            $rootScope.desiderataText = response.data.results;
            $rootScope.desiderataArgs = response.data.categories;
          }
        });
    }

    $scope.dropDesiderata = function(id){
        serviceHelper.deleteDesiderata(id).then(function(response){
          if(response.error){
            console.log('errore nella deleteDesiderata');
          }
          else{
            for(var i = 0; i < $rootScope.desiderataList.length; i++){
                if( $rootScope.desiderataList[i].id == id){
                    $rootScope.desiderataList.splice( i,1 );
                }
            }
            console.log('Desiderata eliminata ');
          }
        });
    }

    $scope.addThisText = function(){
        if( !$scope.newtitle || $scope.newtitle == ''){
            angular.element('#addNewTitle').focus();
            return;
        }
      serviceHelper.getContentInfo($stateParams.idBook, $stateParams.idPar).then(function(response){
          if(response.error){ console.log('Errore nella getContentInfo');
                            }
          else{
              $rootScope.chosenText.push(response.data);
          }
    });
 }

    $scope.addNewText = function(){
        if( !$scope.newtitle || $scope.newtitle == ''){
            angular.element('#addNewTitle').focus();
            return;
        }
        $rootScope.addingText = true;
    }

    $scope.addToCart = function(obj){
        if( typeof $rootScope.objInCart === 'undefined'){
            $rootScope.objInCart = [];
        }
        var find = false;
        for(var i = 0; i < $rootScope.objInCart.length; i++ ){
            if( obj.publicationId == $rootScope.objInCart[i].id )
            {
                find= true;
                break;
            }
        }
        if(!find){
            serviceHelper.getCatalog().then(function(response){
              if(response.error){
                console.log('errore nella getCatalog');
              }
              else{
                console.log(response.data);
                var obj2;
                var objToCart = {};
                for(var i = 0; i < response.data.length; i++ )
                {
                    obj2 = response.data[i];
                    if( obj2.id == obj.publicationId )
                    {
                        objToCart.author = obj2.author;
                        objToCart.cover = obj2.coverBig;
                        objToCart.id = obj2.id;
                        objToCart.price = obj2.price;
                        objToCart.title = obj2.title;
                        objToCart.type = obj2.type;
                        console.log(objToCart);
                        $rootScope.objInCart.push(objToCart);
                        console.log($rootScope.objInCart);
                        var objMessage = {
                            "title" : "Acquista",
                            "preview" : "Il titolo selezionato è stato aggiunto nel carrello, al termine della creazione del DesiderataBook finalizzerai l'acquisto"
                        };
                        $scope.openReadingModal(objMessage);
                    }
                }
              }
            });
        }
        else{
            var objMessage = {
                "title" : "Acquista",
                "body" : "Il testo è già nel carrello"
            };
            $scope.openReadingModal(objMessage);
        }
    }

    $scope.saveDesiderata = function(){


        if( $scope.newtitle == '' || $rootScope.chosenText.length == 0)
        {
            console.log('errore');
            return;
        }


        if($scope.modifyingDes){
            var temp = { "title" : $scope.newtitle, "tags" : $scope.tagsDes , "elements" : $rootScope.chosenText };

            serviceHelper.updateDesiderata($scope.idModDes, temp).then(function(response){
              if(response.error){
                console.log('errore nella updateDesiderata');
              }
              else{
                $scope.resetForms();
                serviceHelper.getDesiderata().then(function(response){
                  if(response.error){
                      console.log('errore nella getDesiderata');
                  }
                  else{
                    $rootScope.desiderataList = response.data.desiderata;
                    console.log($rootScope.desiderataList);
                    if( typeof $rootScope.objInCart === "undefined" ){

                    }
                    else{
                        if( $rootScope.objInCart.length != 0 ){
                           $scope.openFinalizeModal();
                        }
                    }
                  }
                });
               console.log(response);
              }
            });
        }
        else{
            var temp = { "title" : $scope.newtitle, "tags" : {"userKeywords" : [], "ontologyTags" : []} , "elements" : $rootScope.chosenText };
            serviceHelper.createDesiderata( temp ).then(function(response){
              if(response.error){
                console.log('errore nella createDesiderata');
              }
              else{
                $scope.resetForms();
                serviceHelper.getDesiderata().then(function(response){
                  if(response.error){
                      console.log('errore nella getDesiderata');
                  }
                  else{
                    $rootScope.desiderataList = response.data.desiderata;
                    console.log($rootScope.desiderataList);
                    if( typeof $rootScope.objInCart === "undefined" ){

                    }
                    else{
                        if( $rootScope.objInCart.length != 0 ){
                           $scope.openFinalizeModal();
                        }
                    }
                  }
                });
              }
            });
        }
    }
}).controller('ModalCtrl',function($scope, $modalInstance, obj){

    $scope.title = obj.title;
    $scope.body = obj.body;
    $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
    };

}).controller('ModalConfirmCtrl',function($scope, $modalInstance, $http, $rootScope, $state, serviceHelper, obj){

    $scope.titleDes = obj.titleDes;
    $scope.idDes = obj.idDes;
    $scope.idBook = obj.idBook;
    $scope.idPar = obj.idPar;
    $scope.finished = false;
    $scope.error = false;
    $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
    };

    $scope.addTextToDes = function(){
        serviceHelper.modifyDesiderata( $scope.idDes + "/" + $scope.idBook + "/" + $scope.idPar ).then(function(response){
            if(response.error){
                $scope.finished = true;
                $scope.error = true;
            }
            else{
                $rootScope.refreshArrays = true;
                console.log('testo aggiunto');
                if(typeof $rootScope.desiderataList !== 'undefined'){
                    for(var i = 0 ; i < $rootScope.desiderataList.length; i++ ){
                        if($rootScope.desiderataList[i].id == $scope.idDes){
                            $rootScope.desiderataList[i].count++;
                        }
                    }
                }
                $scope.finished = true;

            }
        },function(){
            $scope.finished = true;
            $scope.error = true;
        });
    }

}).controller('ModalCancelCtrl',function($scope, $modalInstance, $http, $rootScope, obj){

    $scope.title = obj.title;
    $scope.body = obj.body;
    $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
    };

    $scope.removeDesiderata = function(){
      serviceHelper.deleteDesiderata(obj.id).then(function(response){
          if(response.error){
            console.log('errore nella deleteDesiderata');
          }
          else{
            $modalInstance.dismiss('cancel');
            $rootScope.desiderataList.splice($rootScope.desiderataList.indexOf(obj), 1);
          }
        });
    }



}).controller('ModalCtrl',function($scope, $modalInstance, obj){

    $scope.title = obj.title;
    $scope.body = obj.body;
    $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
    };

}).controller('ModalFinalizeCtrl',function($scope, $modalInstance, $http, $rootScope, $state){

    $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
    };

    $scope.goToFinalize = function(){
      //console.log(desiderataToRemove);
         $modalInstance.dismiss('cancel');
         $state.go('cart');
    }

});

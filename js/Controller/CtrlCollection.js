desiderata.controller('collection',function($scope, $rootScope, $http, $state, $modal, $localStorage, serviceHelper, $filter){
    $scope.listCollectionBook = true;
    $scope.reverseSort = false;
    $scope.toggleTaggingPopoverUnlockCode = false;
    $scope.tag = false;
    $scope.catalog;
    $scope.authors = [];
    $scope.publishers = [];
    $scope.$storage = $localStorage;
    $scope.user = $scope.$storage.user;
    $scope.search = {};
    if(typeof $rootScope.objInCart === "undefined"){
        $rootScope.objInCart = [];
    }

    $scope.emptyCart = (typeof $rootScope.objInCart === "undefined" || $rootScope.objInCart.length == 0) ? true : false;



    serviceHelper.getCatalog().then(function(response){
      var orderBy = $filter('orderBy');
      if(response.error){
        console.log('errore nella getCatalog');
      }
      else{
          $scope.catalog = response.data;
          for(var i = 0; i < $scope.catalog.length; i++ )
          {
              var authorFound = false;
              var author = $scope.catalog[i].author[0];
              for(var j = 0; j < $scope.authors.length; j++ ){
                  if($scope.authors[j].key == author){
                      authorFound = true;
                      break;
                  }
              }
              if(!authorFound  && author != "" && author != null){
                  $scope.authors.push({'key': author, 'value': author});
              }
              var publisherFound = false;
              var publisher = $scope.catalog[i].publisher;
              for(var j = 0; j < $scope.publishers.length; j++ ){
                  if($scope.publishers[j].key == publisher){
                      publisherFound = true;
                      break;
                  }
              }
              if(!publisherFound && publisher != "" && publisher != null){
                  $scope.publishers.push({'key': publisher, 'value': publisher});
              }
          }
          $scope.authors = orderBy($scope.authors, 'value', false);
          $scope.publishers = orderBy($scope.publishers, 'value', false);
          $scope.publishers.unshift({'key': '', 'value': 'Scegli editore'});
          $scope.search.publisher = $scope.publisher[0];
      }
    });


    $scope.customFilter = function(){
      return function(obj){
            var pubOK = false;
            var authOK = true;
            var titleOK = false;
            var authFound = false;
            if( typeof $scope.search === 'undefined' || (typeof $scope.search.publisher === 'undefined' && typeof $scope.search.author === 'undefined' && typeof $scope.search.title === 'undefined') ) return true;
            if( $scope.search.publisher == '' || angular.isUndefined($scope.search.publisher) ||  $scope.search.publisher.key == obj.publisher ) pubOK = true;
            if( $scope.search.title == '' || angular.isUndefined($scope.search.title) || (obj.title.toLowerCase()).search($scope.search.title.toLowerCase()) != -1) titleOK = true;
            if($scope.search.publisher.key == "") pubOK = true;
            if( !angular.isUndefined($scope.search.author) )  {
              if( $scope.search.author.length == 0 )
                authOK = true;
              else{
                for( var i = 0 ; i < $scope.search.author.length; i++ ){
                  if( obj.author.indexOf( $scope.search.author[i].value) == -1 ) authOK = false;
                }
              }
            }
            else authOK = true;

            return pubOK && authOK && titleOK;
        }
    }

    $scope.addToCart = function(obj){
        var inCart = false;
        var objToAdd = {
            "id": obj.id,
            "cover": obj.coverBig,
            "title": obj.title,
            "author": obj.author,
            "price": obj.price,
            "type": obj.type
        };
        for(var i=0; i<$rootScope.objInCart.length; i++){
            if($rootScope.objInCart[i].id == objToAdd.id){
                inCart = true;
                break;
            }
        }
        if(!inCart){
            $rootScope.objInCart.push(objToAdd);
        }
        $state.go("cart");
    }

    $scope.readObj = function(obj){
        if(obj.isFree){
              serviceHelper.addFree(obj.id).then(function(response){
                if(response.error){
                    console.log("errore nella addFree");
                }
                else{
                    $state.go("dashboard", {"toDesiderata" : ""});
                }
              });
        }
        else{
            if(obj.inLibrary == true){
                serviceHelper.getLibrary().then(function(response){
                  if(response.error){
                    console.log("errore nella getLibrary");
                  }
                  else{
                    console.log(response);
                    for(var i=0; i < response.data.length; i++){
                        if(obj.id == response.data[i].id){
                            if(response.data[i].type == "PublicationPdf"){
                                $state.go('pdf',{'idBook': response.data[i].id, 'idPar' : response.data[i].startId});
                            }
                            else{
                                $state.go('book',{'idBook': response.data[i].id, 'idPar' : response.data[i].startId});
                            }
                        }
                    }
                  }
                });
            }
            else{
                $scope.goToSingleCollectionBook(obj);
            }
        }
    }
    $scope.goToSingleCollectionBook = function(obj){
        $scope.listCollectionBook = false;
        $scope.singleObj = obj;
    }
    $scope.goToListCollectionBook = function(){
        $scope.listCollectionBook = true;
    }
    $scope.closePopoverUnlockCode =  function(){
        $scope.toggleTaggingPopoverUnlockCode = false;
    }
    $scope.unlockWithCode = function(codeUnlock){
      serviceHelper.burnCode(codeUnlock).then(function(response){
        $scope.toggleTaggingPopoverUnlockCode = false;
        if(response.data){
            $state.go('dashboard');
        }
        else{
             var modalInstance = $modal.open({
              animation: $scope.animationsEnabled,
              templateUrl: 'myModalContent.html',
              controller: 'ModalCtrl',
              size: 'lg',
              resolve: {
                obj: function () {
                  if(response.error && response.error == "Code already used"){
                    message = "Codice già in uso";
                  }
                  else{
                    message = "Codice non valido";
                  }
                  return {title: 'Errore', body: message};
                }
              }
            });
        }
      });
    }
}).controller('ModalCtrl',function($scope, $modalInstance, obj){

    $scope.title = obj.title;
    $scope.body = obj.body;
    $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
    };
});

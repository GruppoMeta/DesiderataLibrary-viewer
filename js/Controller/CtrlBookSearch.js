desiderata.controller('bookSearch',function($scope, $state, $stateParams, $rootScope, $http, $modal, serviceHelper){
  console.log($rootScope.textToSearchInBook);
  console.log($scope.sideMenu);
  $scope.sideMenu = true;


//  $rootScope.$watch( $rootScope.textToSearchInBook, function(newValue, oldValue){
//      if(typeof newValue === 'undefined' || newValue == ''){ return;}
//      else{
//          console.log(newValue);
//          serviceHelper.searchInBook( $stateParams.idBook, newValue).then(function(response){
//              if(response.error){
//                  console.log("Errore nella searchInBook");
//              }
//              else{
//                  console.log(response.data);
//                  $scope.searchBook = response.data;
//              }
//          });
//      }
//  });
  if( (window.cordova && ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine ) && $rootScope.readOnline == true) || (!window.cordova && ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine )) ){
      serviceHelper.searchInBook( $stateParams.idBook, $rootScope.textToSearchInBook).then(function(response){
                  if(response.error){
                      console.log("Errore nella searchInBook");
                  }
                  else{
                      console.log(response.data);
                      $scope.searchBook = response.data;
                  }
              });

      serviceHelper.getDesiderata().then(function(response){
                if(response.error){
                    console.log("Errore nella getDesiderataList");
                }
                else{
                    console.log(response.data.desiderata);
                    $scope.desiderataList = response.data.desiderata;
                }
            });
  }
  else{
    $scope.readingOffline = true;
  }

  $scope.openDropdown = function(val){
        if( angular.element('#'+val).is(":visible") ){
            angular.element('#'+val).hide();
        }
        else{
            angular.element('#'+val).show();
        }
    }
  $scope.goToSearchResult = function(isPdf, idBook, idPar){
    $rootScope.showSearchResults = true;
    $rootScope.wordSearched = $rootScope.textToSearchInBook;
    if( isPdf ) $state.go('pdf',{'idBook' : idBook, 'idPar' : idPar});
    else $state.go('book',{'idBook' : idBook, 'idPar' : idPar});
  }

  $scope.modifyDesiderata = function(idDesiderata, id, publicationId){
        /*serviceHelper.modifyDesiderata( idDesiderata + "/" + publicationId + "/" + id ).then(function(response){
            if(response.error){
                console.log("Errore nella modifyDesiderata");
            }
            else{
                console.log(response.data);
            }
        });*/
        var titleDes;
        for(var i = 0; i< $scope.desiderataList.length; i++){
            if( $scope.desiderataList[i].id == idDesiderata){
                titleDes = $scope.desiderataList[i].title;
                break;
            }
        }
        $scope.openConfirmModal(titleDes, idDesiderata, publicationId, id);
    }
});

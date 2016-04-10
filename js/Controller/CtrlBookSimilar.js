desiderata.controller('bookSimilar',function($scope, $state, $stateParams, $rootScope, $http, $modal, serviceHelper){

    if( (window.cordova && ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine ) && $rootScope.readOnline == true) || (!window.cordova && ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine )) ){
        serviceHelper.getSimilarText( $stateParams.idBook + '/' + $stateParams.idPar ).then(function(response){
                if(response.error){
                    console.log("Errore nella getSimilarText");
                }
                else{
                    console.log(response.data);
                    $scope.similars = response.data;
                }
            });

        serviceHelper.getSuggestedText( $stateParams.idBook, $stateParams.idPar ).then(function(response){
                if(response.error){
                    console.log("Errore nella getSuggestedText");
                }
                else{
                    console.log(response.data);
                    $scope.suggested = response.data;
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
  
    $rootScope.$watch('refreshArrays', function(newValue, oldValue){
        console.log(newValue);  
        if( newValue ){
            serviceHelper.getSimilarText( $stateParams.idBook + '/' + $stateParams.idPar ).then(function(response){
                  if(response.error){
                      console.log("Errore nella getSimilarText");
                  }
                  else{
                      console.log(response.data);
                      $scope.similars = response.data;
                  }
              });

          serviceHelper.getSuggestedText( $stateParams.idBook, $stateParams.idPar ).then(function(response){
                  if(response.error){
                      console.log("Errore nella getSuggestedText");
                  }
                  else{
                      console.log(response.data);
                      $scope.suggested = response.data;
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
          $rootScope.refreshArrays = false;
        }
    });

    $scope.openReadingModal = function (obj) {

        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'myModalContent.html',
          controller: 'ModalSimilarCtrl',
          size: 'lg',
          resolve: {
            item: function () {
              return obj;
            }
          }
        });
    }

    $scope.openDropdown = function(val){
      if($scope.isSimilar){
          if( angular.element('#sim'+val).is(":visible") ){
              angular.element('#sim'+val).hide();
          }
          else{
              angular.element('#sim'+val).show();
          }
      }
      else{
          if( angular.element('#sugg'+val).is(":visible") ){
              angular.element('#sugg'+val).hide();
          }
          else{
              angular.element('#sugg'+val).show();
          }
      }
    }
    
    $scope.displayDes = function(idDes, inDesiderata){
      for(var i = 0; i < inDesiderata.length; i++ )
      {
        if( idDes == inDesiderata[i] ) return false;
      }
      return true;
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

}).controller('ModalSimilarCtrl',function($scope, $modalInstance, item){

    $scope.title = item.title;
    $scope.body = item.preview;
    $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
    };
});

desiderata.controller('bookAdvancedSearch',function($scope, $state, $stateParams, $http, $modal, $rootScope, serviceHelper){

    if( (window.cordova && ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine ) && $rootScope.readOnline == true) || (!window.cordova && ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine )) ){
        serviceHelper.inferenceSearch( $stateParams.idBook + '/' + $stateParams.idPar ).then(function(response){
                if(response.error){
                    console.log("Errore nella inferenceSearch");
                }
                else{
                    console.log(response.data);
                    $scope.similars = response.data;
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
        if( $('#'+val).is(":visible") ){
            $('#'+val).hide();
        }
        else{
            $('#'+val).show();
        }
    }

    $scope.modifyDesiderata = function(idDesiderata, id, publicationId){
        serviceHelper.modifyDesiderata( idDesiderata + "/" + publicationId + "/" + id ).then(function(response){
            if(response.error){
                console.log("Errore nella modifyDesiderata");
            }
            else{
                console.log(response.data);
            }
        });
    }

}).controller('ModalSimilarCtrl',function($scope, $modalInstance, item){

    $scope.title = item.title;
    $scope.body = item.preview;
    $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
    };
});

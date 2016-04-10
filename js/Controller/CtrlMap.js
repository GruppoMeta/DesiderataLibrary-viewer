desiderata.controller('map',function($scope, $state, $stateParams, $rootScope, $http, $modal, serviceHelper){

  if( ( (navigator.connection && navigator.connection.type == "none") || !navigator.onLine ) && $rootScope.readOnline == false ){
    $scope.readingOffline = true;
  }

    $scope.goBack = function(){
        $state.go($stateParams.bookOrPdf, {"idBook" : $stateParams.idBook, "idPar" : $stateParams.idPar});
    }

    $scope.listInformationsMarker = function(val){
      if(val == true){
        $("#containerInformationsMarker").show();
      }
      else{
        $("#containerInformationsMarker").hide();
      }
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

    $scope.openDropdown = function(val){
        var exist = true;
        var toHide = ( angular.element('#'+val).is(":visible") ) ? true : false;
        for(var i=0; exist == true; i++){
          if( angular.element('#'+i).length > 0 ){
            angular.element('#'+i).hide();
          }
          else{
            exist = false;
          }
        }
        if( toHide ){
          angular.element('#'+val).hide();
        }
        else{
          angular.element('#'+val).show();
        }
    }

    $scope.openReadingModal = function (obj) {
        var modalObj = {};
        modalObj.title = obj.title;
        modalObj.body = obj.preview;
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'myModalContentMap.html',
          controller: 'ModalMapCtrl',
          size: 'lg',
          resolve: {
            obj: function () {
              return obj;
            }
          }
        });
    }

    $scope.callMarkers = function(val, centerX, centerY){
        serviceHelper.getGeoSearch( centerX + ',' + centerY + '/' + val ).then(function(response){
            if(response.error){
                console.log("Errore nella getGeoSearch");
            }
            else{
                var responseData = Object.prototype.toString.call( response.data ) !== '[object Array]' ? [response.data] : response.data;
                var tmpInformationsMarkers = [];
                var tmpMarkers = [];
                responseData.forEach(function(newPOI, index){
                    if(newPOI != null){
                        var coordinates = newPOI.geo.split(",");
                        tmpMarkers.push({
                            id: index,
                            idBook: newPOI.publicationId,
                            idPar: newPOI.id,
                            coords:{
                                latitude: parseFloat(coordinates[0]),
                                longitude: parseFloat(coordinates[1])
                            },
                            events: {
                              mouseover: function(marker){
                                $scope.infoWindow.content = newPOI.title + ' - ' + newPOI.subtitle;
                                $scope.infoWindow.visible = true;
                                $scope.infoWindow.coords = {
                                  latitude: marker.position.lat(),
                                  longitude: marker.position.lng()
                                };
                                $scope.informationsMarker.forEach(function(infoMarker){
                                  infoMarker.active = false;
                                    if(infoMarker.idBook == marker.model.idBook && infoMarker.idPar == marker.model.idPar){
                                      infoMarker.active = true;
                                    }
                                });
                              }
                            },
                            options: {
                              draggable : false,
                              icon: 'img/map_marker_red.png'
                            }
                        });
                        tmpMarkers.push({
                            id: tmpMarkers.length,
                            idBook: $stateParams.idBook,
                            idPar: $stateParams.idPar,
                            coords:{
                                latitude: parseFloat(centerX),
                                longitude: parseFloat(centerY)
                            },
                            options: {
                              draggable : false,
                              icon: 'img/map_marker_green.png'
                            }
                        });
                        tmpInformationsMarkers.push({
                            "idPar": newPOI.id,
                            "idBook": newPOI.publicationId,
                            "title": newPOI.title,
                            "subtitle": newPOI.subtitle,
                            "preview": newPOI.preview,
                            "inLibrary": newPOI.inLibrary
                        });
                        console.log(tmpMarkers);
                    }
                });

                $scope.informationsMarker = [];
                $scope.informationsMarker = tmpInformationsMarkers;
                $scope.markers = [];
                $scope.markers = tmpMarkers;
            }
        });
    }

    $scope.map = {
        center: { latitude: $stateParams.latitude, longitude: $stateParams.longitude },
        zoom: 10,
        control: {},
        events: {}
    };
    $scope.callMarkers(30, $stateParams.latitude, $stateParams.longitude);
    $scope.options = {
        scrollwheel: false,
        streetViewControl: false,
        panControl: false,
        mapTypeControl: false,
        minZoom: 2
    };

}).controller('ModalMapCtrl',function($scope, $modalInstance, obj){

    $scope.title = obj.title;
    $scope.body = obj.preview;
    $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
    };

});

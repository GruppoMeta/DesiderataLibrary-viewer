desiderata.controller('bookDes',function($scope, $state, $timeout, $stateParams, $sce, desiderataInfo, publicationIndex, $rootScope, $http, $modal, $localStorage, serviceHelper){
    $scope.$storage = $localStorage;
    $scope.user = $scope.$storage.user;
    $scope.toggleSharePopoverBook = false;
    $scope.toggleSharePopoverPdf = false;
    $scope.toggleSearchPopoverBook = false;
    $scope.toggleSearchPopoverPdf = false;
    $scope.singlePageViewer = true;
    //$scope.bookInfoText = $sce.trustAsHtml(bookInfo.text) ;
    $scope.paddingBookDes = true;
    $scope.TK={};
    $scope.TK.keywordArray = [];
    $scope.TK.tagsArray = [];
    $scope.availableKeywords = [];
    $scope.availableTags = [];
    $rootScope.bookmarksTreeSource = [];
    $rootScope.idResponseBookmarkTree = -1;
    $rootScope.addingText = false;
    $scope.sideMenu = false;
    $scope.currentState = $state.current.name;
    $scope.sharingButtons = {};
    $scope.desiderataLength = desiderataInfo.elements.length;
    $scope.currentDes = $stateParams.idBook;
    $rootScope.currentCap = desiderataInfo.elements[$stateParams.idPar];
    $scope.inLibrary = desiderataInfo.elements[$stateParams.idPar].inLibrary;
    $scope.currentTitleDesiderata = desiderataInfo.title;
    $scope.currentTitleBook = desiderataInfo.elements[$stateParams.idPar].title;
    $scope.currentIdPar = $stateParams.idPar;
    $scope.nextIdPar = parseInt($stateParams.idPar) + 1;
    $scope.prevIdPar = parseInt($stateParams.idPar) - 1;
    $scope.desiderataIndex = [];
    $rootScope.idBookForAnnotation = $scope.currentCap.publicationId.toString();
    $rootScope.idParForAnnotation = $scope.currentCap.id.toString();
    if(desiderataInfo && desiderataInfo.elements){
      desiderataInfo.elements.forEach(function(desiderataIndexNode, index){
        $scope.desiderataIndex.push({
          id: index,
          title: desiderataIndexNode.subtitle

        });
      })
    }
    $rootScope.readOnline = true;
    $rootScope.readingOffline = false;

    $rootScope.publicationIndex = publicationIndex;
    $scope.emptyCart = (typeof $rootScope.objInCart === "undefined" || $rootScope.objInCart.length == 0) ? true : false;

    if($state.is('bookDes')){
        $scope.sideMenu = false;
    }
    else{
      $scope.sideMenu = true;
    }

    $scope.openLink = function(link){
      window.open(link,'_system');
    }

    serviceHelper.getContentDes( $rootScope.currentCap.publicationId, $rootScope.currentCap.id ).then(function(response){
            if(response.error){
              console.log('Errore nella getContentDes');
            }
            else{
              $scope.bookInfo = response.data;
              $scope.capTitle = response.data.title;
              if( response.data.pageType == 'TextPdf'){
                  $scope.isPdf = true;
                  $scope.zoomArray = $scope.bookInfo.zoom;
                  $scope.zoomLevel = 2;
                  $scope.pdf = $scope.bookInfo.info[$scope.zoomArray[$scope.zoomLevel]];
                  $scope.pdfLayer = $sce.trustAsHtml($scope.pdf.layer);
                  $scope.pdfImage = $scope.pdf.src;
              }
              else{
                  $scope.isPdf = false;
              }
              console.log($scope.isPdf);
              console.log($scope.inLibrary);
              if($scope.inLibrary == true){
                  $scope.bookInfoText = $sce.trustAsHtml(response.data.text);
              }
            }
          });



    var originalTags = [];
    var originalKeywords = [];

    $scope.goBack = function(){
        $state.go("dashboard", { "toDesiderata" : "desiderata" });
    }

    $scope.goToCollection = function(){
        $state.go("collection");
    }

    $scope.toggleMenu = function(newState){
        if( newState == $state.$current.name ){
            $scope.sideMenu = false;
            $scope.currentState = '';
            $state.go("bookDes");
        }
        else {
            $scope.currentState = newState;
            $scope.sideMenu = true;
            $state.go(newState, {indexTree: $scope.desiderataIndex});

        }
        console.log(newState)
    }

    $scope.goNext = function(){
      if($scope.nextIdPar != $scope.desiderataLength){
        $rootScope.getNewPublicationIndex = false;
        $state.go($state.current.name, {idBook : $scope.currentDes, idPar : $scope.nextIdPar});
      }
    }

    $scope.goPrev = function(){
      if($scope.currentIdPar != 0){
        $rootScope.getNewPublicationIndex = false;
        $state.go($state.current.name, {idBook : $scope.currentDes, idPar : $scope.prevIdPar});
      }
    }

    $scope.searchInText = function(){
        angular.element('#bookText').removeHighlight();
        console.log($scope);
        console.log($scope.textToSearch);
        angular.element('#bookText').highlight($scope.textToSearch);
    }

    $scope.clearSearch = function(){
        $scope.textToSearch = '';
        angular.element('#bookText').removeHighlight();
    }

    $scope.zoomIn = function(){

        $scope.zoomLevel++
        console.log($scope.zoomArray[$scope.zoomLevel]);
        $scope.pdf = $scope.bookInfo.info[$scope.zoomArray[$scope.zoomLevel]];
        $scope.pdfLayer = $sce.trustAsHtml($scope.pdf.layer);
        $scope.pdfImage = $scope.pdf.src;

    }

    $scope.zoomOut = function(){

        $scope.zoomLevel--;
        console.log($scope.zoomArray[$scope.zoomLevel]);
        $scope.pdf = $scope.bookInfo.info[$scope.zoomArray[$scope.zoomLevel]];
        $scope.pdfLayer = $sce.trustAsHtml($scope.pdf.layer);
        $scope.pdfImage = $scope.pdf.src;
    }

    $scope.closeSidebar = function(){
        $scope.toggleSharePopoverBook = false;
        $scope.toggleSharePopoverPdf = false;
        $scope.sideMenu = false;
        $state.go('bookDes');
        $scope.currentState = 'bookDes';
    }

    $scope.loadSharingButtons = function(){
      $scope.toggleSearchPopoverBook = false;
      $scope.toggleSearchPopoverPdf = false;
      $scope.sideMenu = false;
      $scope.currentState = 'bookDes';
      if( (window.cordova && ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine ) && $rootScope.readOnline == true) || (!window.cordova && ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine )) ){
          serviceHelper.getSharingButtons().then(function(response){
                if(response.error){
                    console.log("Errore nella getSharingButtons");
                }
                else{
                      response.data.forEach(function(socialItem){
                          $scope.sharingButtons[socialItem.id] = socialItem.url.replace("#url#", DESIDERATA_CONFIG.viewer + window.location.href.split("#")[1]);
                      });
                }
            });
      }
      else{
        $scope.readingOffline = true;
      }
    }

/*
    $scope.closePopover =  function(){
        $scope.toggleTaggingPopover = false;
    }*/

    $scope.$on('SwipeLeft', function(){
      $scope.goNext();
    });

    $scope.$on('SwipeRight', function(){
      $scope.goPrev();
    });

    $(".index").on("swiperight", function(){
      if(window.cordova){
        $scope.sideMenu = false;
        $state.go("bookDes");
        $scope.currentState = 'bookDes';
      }
    });

    // var previousPinch ;
    // var element = document.getElementById('bookText');
    // var mc = new Hammer(element);
    // mc.get('pinch').set({enable: true});
    // mc.on('pinchin',function(event){ previousPinch = 'pinchin' ; });
    // mc.on('pinchout',function(event){ previousPinch = 'pinchout' ;});
    // mc.on('pinchend',function(event){
    //     console.log(event.type);
    //     if( previousPinch == 'pinchin' && $scope.isPdf  ){
    //         console.log('zoomIn');
    //         $scope.zoomIn();
    //     }
    //     else{
    //         if( previousPinch == 'pinchout' && $scope.isPdf ){
    //             console.log('zoomOut');
    //             $scope.zoomOut();
    //         }
    //     }
    // });

});

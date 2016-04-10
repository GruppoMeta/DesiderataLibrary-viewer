desiderata.controller('pdfReader',function($scope, $rootScope, $state, $timeout, $stateParams, $sce, $rootScope, $http, $q, bookInfo, publicationIndex, usSpinnerService, $modal, $localStorage, serviceHelper){
    $scope.toggleTaggingPopover = false;
    $scope.toggleTaggingPopoverMap = false;
    $scope.toggleSharePopover = false;
    $scope.tag = false;
    $scope.tagMap = false;
    $scope.fav = false;
    $scope.bookInfo = bookInfo;
    $rootScope.bookInfoForKeyDown = bookInfo;
    $scope.currentState = $state.current.name;
    $scope.idBook = $stateParams.idBook;
    $scope.idPar = $stateParams.idPar;
    $scope.TK={};
    $scope.TK.keywordArray = [];
    $scope.TK.tagsArray = [];
    $scope.availableKeywords = [];
    $scope.availableTags = [];
    $rootScope.bookmarksTreeSource = [];
    $rootScope.idResponseBookmarkTree = -1;
    $scope.sharingButtons = {};
    $scope.singlePageViewer = true;
    var originalTags = [];
    var originalKeywords = [];
    $rootScope.idBookForAnnotation = $stateParams.idBook.toString();
    $rootScope.idParForAnnotation = $stateParams.idPar.toString();
    $scope.zoomArray = $scope.bookInfo.zoom;
    if(window.cordova){
      $scope.zoomLevel = $scope.zoomArray.length - 1;
    }
    else{
      $scope.zoomLevel = 2;
    }
    $rootScope.publicationIndex = publicationIndex;
    $scope.$storage = $localStorage;
    $scope.user = $scope.$storage.user;
    $scope.areThereMarkers = (bookInfo.geo != null) ? true : false;
    if( $rootScope.getNewPublicationIndex ){
        $rootScope.bookTitle = publicationIndex.title;
        $rootScope.pages = publicationIndex.pages;

    }

    if($rootScope.showSearchResults){
      $scope.toggleSearchPopover = true;
      $scope.textToSearch = $rootScope.wordSearched;
      $rootScope.showSearchResults = false;
      $rootScope.wordSearched = '';
      $timeout(function(){
         angular.element('#bookText').highlight($scope.textToSearch);
      },2000);


    }
    else{
      $scope.toggleSearchPopover = false;
    }

    $scope.emptyCart = (typeof $rootScope.objInCart === "undefined" || $rootScope.objInCart.length == 0) ? true : false;

    if($state.is('pdf')){
        $scope.sideMenu = false;
    }
    else{
      $scope.sideMenu = true;
    }
    $rootScope.chosenArgs = [];
    $rootScope.chosenText = [];
    var user = $rootScope.user;
    for (var prop in $rootScope.pages ) {
        if($rootScope.pages[prop] == $scope.idPar){
            $scope.navigationControl = {currentPage : prop};
        }
    }
    $scope.pdf = $scope.bookInfo.info[$scope.zoomArray[$scope.zoomLevel]];
    $scope.pdfLayer = $sce.trustAsHtml($scope.pdf.layer);
    $scope.pdfImage = $scope.pdf.src;
    $scope.hotSpots = $scope.pdf.hotSpots;

    if( (window.cordova && ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine ) && $rootScope.readOnline == true) || (!window.cordova && ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine )) ){
      var empty="";
      serviceHelper.getKeywords( empty ).then(function(response){
              if(response.error){
                  console.log("Errore nella createUserKeywords");
              }
              else{
                  $rootScope.ontologyTags = response.data;
              }
      });
    }

    $rootScope.$on('modifiedSourceTree', function (event, data) {

        $rootScope.bookmarksTreeSource = data;
    });
    $rootScope.$on('addedFirstfolderToTree', function (event, data) {

        $rootScope.bookmarksTreeSource = data;
    });

    $scope.loadSharingButtons = function(){
      $scope.toggleSearchPopover = false;
      $scope.toggleTaggingPopover = false;
      $scope.toggleTaggingPopoverMap = false;
      $scope.sideMenu = false;
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

    $scope.openLink = function(link){
      window.open(link,'_system');
    }

    $scope.goBack = function(){
        $state.go("dashboard", {"toDesiderata" : ""});
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

    $timeout(function(){
        $scope.singleMarginToTitle = (angular.element("#containerTitleAndParagraph").height() > 31 && angular.element("#containerTitleAndParagraph").height() <= 62) ? true : false;
        $scope.doubleMarginToTitle = (angular.element("#containerTitleAndParagraph").height() > 62 && angular.element("#containerTitleAndParagraph").height() <= 93) ? true : false;
        angular.element("#containerTitleAndParagraph").css("opacity", 1);
        angular.element(".right").css("opacity", 1);
        angular.element(".left").css("opacity", 1);
    }, 0);

     if( (window.cordova && ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine ) && $rootScope.readOnline == true) || (!window.cordova && ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine )) ){
      serviceHelper.getAnnotationByVolume( $stateParams.idBook ).then(function(response){
              if(response.error){
                  console.log("Errore nella getAnnotationByVolume");
              }
              else{
                  if(typeof response.length === "undefined" && response.type == "treeBookmark"){
                      $rootScope.bookmarksTreeSource = JSON.parse(response.data);
                      $rootScope.idResponseBookmarkTree = response.id;
                  }
                  for(var i=0; i < response.data.length; i++){
                      if(response.data[i].type == "treeBookmark"){
                          $rootScope.bookmarksTreeSource = JSON.parse(response.data[i].data);
                          $rootScope.idResponseBookmarkTree = response.data[i].id;
                      }
                  }
              }
      });

      serviceHelper.getTagsToLoad( $stateParams.idBook+'/'+$stateParams.idPar ).then(function(response){
              if(response.error){
                  console.log("Errore nella getTagsToLoad");
              }
              else{
                  var responseParsed;
                  if( response.data != '') {

                      $scope.TK.keywordArray = response.data.userKeywords;
                      $scope.TK.tagsArray = response.data.ontologyTags;

                      originalKeywords = $scope.TK.keywordArray;
                      originalTags = $scope.TK.tagsArray;
                  }
              }
          });

      serviceHelper.getAnnotationByContent( $stateParams.idBook+"/"+$stateParams.idPar ).then(function(response){
              if(response.error){
                  console.log("Errore nella getAnnotationByContent");
              }
              else{
                  $scope.fav = false;
                  if(typeof response.length === "undefined" && response.data.type == "bookmark"){
                      $scope.fav = true;
                      $scope.idBookmark =  response.data.id;
                  }
                  for(var i=0; i < response.data.length; i++){
                      if(response.data[i].type == "bookmark"){
                          $scope.fav = true;
                          $scope.idBookmark =  response.data[i].id;
                          break;
                      }
                  }
              }
          });
    }

    $scope.chooseArgs = function(index){
        var obj = $rootScope.desiderataArgs[index].label;
        $rootScope.desiderataText = [];
        $rootScope.desiderataArgs = [];
        $rootScope.chosenArgs.splice($rootScope.chosenArgs.length, 0, obj);
        var request = {
            "text": $scope.search.searchingText,
            "topics": $rootScope.chosenArgs
        }
        serviceHelper.search(request).then(function(response){
          if(response.error){
              console.log('errore nella search');
          }
          else{
              $rootScope.desiderataText = response.data.results;
              $rootScope.desiderataArgs = response.data.categories;
          }
        });
    }

    $scope.chooseText = function(index){
        var obj = $rootScope.desiderataText[index];
        $rootScope.desiderataText.splice(index, 1);
        $rootScope.chosenText.splice($rootScope.chosenText.length, 0, obj);

    }

    $scope.dropArgs = function(index){
        $rootScope.desiderataText = [];
        $rootScope.desiderataArgs = [];
        $rootScope.chosenArgs.splice(index, 1);
        var request = {
            "text": $scope.search.searchingText,
            "topics": $rootScope.chosenArgs
        }
        serviceHelper.search(request).then(function(response){
          if(response.error){
              console.log('errore nella search');
          }
          else{
              for(var i = 0; i< response.data.results.length; i++){
                    var temp = response.data.results[i];
                    var corr = false;
                    for(var j = 0 ; j < $rootScope.chosenText.length; j++){
                        if( temp.id == $rootScope.chosenText[j].id )
                        {
                            corr= true;
                            break;
                        }
                    }
                    if(!corr) $rootScope.desiderataText.splice($rootScope.desiderataText.length, 0, temp);

                }
                $rootScope.desiderataArgs = response.data.categories;
          }
        });
    }

    $scope.searchTexts = function(){
        $rootScope.desiderataText = [];
        $rootScope.desiderataArgs = [];
        var request = {
            "text": $scope.search.searchingText,
            "topics": $rootScope.chosenArgs
        };
        serviceHelper.search(request).then(function(response){
          if(response.error){
              console.log('errore nella search');
          }
          else{
              $rootScope.desiderataText = response.data.results;
              $rootScope.desiderataArgs = response.data.categories;
          }
        });

    };

    $scope.getKeywords = function(term){
        $scope.availableKeywords = [];
        serviceHelper.getKeywords( term ).then(function(response){
            if(response.error){
                console.log("Errore nella createUserKeywords");
            }
            else{
                if( Object.prototype.toString.call( response.data ) !== '[object Array]' ) {
                    $scope.availableKeywords.push(response.data);
                }
                else{
                    $scope.availableKeywords = response.data;
                }
            }
        });
    }

    $scope.getTags = function(term){
        $scope.availableTags = [];
        if( (window.cordova && ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine ) && $rootScope.readOnline == true) || (!window.cordova && ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine )) ){
          serviceHelper.getOntologyTags( term ).then(function(response){
              if(response.error){
                  console.log("Errore nella getOntologyTags");
              }
              else{
                  if( Object.prototype.toString.call( response.data ) !== '[object Array]' ) {
                      $scope.availableTags.push(response.data);
                  }
                  else{
                      $scope.availableTags = response.data;
                  }
              }
          });
        }
    }

    $scope.saveTags = function(){
        var tempKArray = $scope.TK.keywordArray;
        var tempTArray = $scope.TK.tagsArray;
        var temp = { "userKeywords" : tempKArray , "ontologyTags" : tempTArray};
        serviceHelper.saveTag( $stateParams.idBook+'/'+$stateParams.idPar, temp ).then(function(response){
            if(response.error){
                console.log("Errore nella saveBookmark");
            }
            else{
                $scope.closePopover();
                for( var j=0; j< tempKArray.length; j++){
                    var corr=false;
                    for( var i=0; i < $rootScope.ontologyTags.length; i++)
                    {

                        if($rootScope.ontologyTags[i].text == tempKArray[j].text){
                            corr=true;
                            break;
                        }


                    }
                    if(!corr) $rootScope.ontologyTags.push(tempKArray[j]);
                }
            }
        });
    }

    $scope.clearTags = function(){
        $scope.TK.keywordArray = originalKeywords;
        $scope.TK.tagsArray = originalTags;
    }

    $scope.selectKeyWord = function(keyword){
        serviceHelper.createUserKeywords( keyword.text ).then(function(response){
            if(response.error){
                console.log("Errore nella createUserKeywords");
            }
            else{}
        });
        return keyword;
    }

    $scope.addNewKeyword = function(newItem){
        var newObj = {
            "text" : newItem,
            "id": null
        }
        return newObj;
    }

    $scope.toggleFav = function(){
        $scope.fav =  !$scope.fav;
        if($scope.fav == true){
            var bookmarkToSave = {
              "type": "bookmark",
              "data": JSON.stringify({
                  "paragraph": $scope.bookInfo.title,
                  "bookBookmark": $rootScope.bookTitle,
                  "isBook" : false
              }),
              "volume_id": $stateParams.idBook.toString(),
              "content_id": $stateParams.idPar.toString()
            };

            $rootScope.bookmarksTreeSource.push({
                "title": $scope.bookInfo.title,
                "key": $stateParams.idBook+$stateParams.idPar,
                "id": null,
                "isBook" : false,
                "volume_id": $stateParams.idBook.toString(),
                "content_id": $stateParams.idPar.toString()
            });

            var bookmarkTreeToSave = {
              "type": "treeBookmark",
              "data": JSON.stringify($rootScope.bookmarksTreeSource),
              "volume_id": $stateParams.idBook.toString(),
              "content_id": $stateParams.idPar.toString()
            };

            serviceHelper.saveBookmark( bookmarkToSave ).then(function(response){
                if(response.error){
                    console.log("Errore nella saveBookmark");
                }
                else{
                    $scope.idBookmark =  response.data.id;
                    var tmpBookmark = [];
                    tmpBookmark.paragraph = $scope.bookInfo.title;
                    tmpBookmark.bookBookmark = $rootScope.bookTitle;
                    tmpBookmark.idBookmark = $scope.idBookmark;
                    tmpBookmark.volumeId = $stateParams.idBook;
                    tmpBookmark.contentId = $stateParams.idPar;
                    tmpBookmark.isBook = true;
                    if(typeof $rootScope.bookmarks != "undefined"){
                        $rootScope.bookmarks.push(tmpBookmark);
                    }
                }
            });

            if($rootScope.idResponseBookmarkTree == -1){
                serviceHelper.saveTreeBookmark( bookmarkTreeToSave ).then(function(response){
                    if(response.error){
                        console.log("Errore nella saveTreeBookmark");
                    }
                    else{
                        $rootScope.idResponseBookmarkTree = response.data.id;
                        $rootScope.$emit('newBookmarkTreeNode', $rootScope.bookmarksTreeSource);
                    }
                });
            }
            else{
                serviceHelper.updateTreeBookmark( $rootScope.idResponseBookmarkTree, bookmarkTreeToSave ).then(function(response){
                    if(response.error){
                        console.log("Errore nella updateTreeBookmark");
                    }
                    else{
                    $rootScope.$emit('newBookmarkTreeNode', $rootScope.bookmarksTreeSource);
                    }
                });
            }
        }
        else{
            serviceHelper.deleteBookmark( $scope.idBookmark ).then(function(response){
                    if(response.error){
                        console.log("Errore nella deleteBookmark");
                    }
                    else{
                        if(typeof $rootScope.bookmarks != "undefined"){
                            for(var j=0; j<$rootScope.bookmarks.length; j++){
                                if($rootScope.bookmarks[j].idBookmark == $scope.idBookmark){
                                    $rootScope.bookmarks.splice(j, 1);
                                  }
                            }
                        }
                        if(typeof $rootScope.bookmarksTreeSource != "undefined"){
                            for(var i=0; i< $rootScope.bookmarksTreeSource.length; i++){
                                if($rootScope.bookmarksTreeSource[i].key == $stateParams.idBook + $stateParams.idPar){
                                    $rootScope.bookmarksTreeSource.splice($rootScope.bookmarksTreeSource.indexOf($rootScope.bookmarksTreeSource[i]),1);
                                    console.log($rootScope.bookmarksTreeSource);
                                }
                            }
                            var bookmarkTreeToSave = {
                                      "type": "treeBookmark",
                                      "data": JSON.stringify($rootScope.bookmarksTreeSource),
                                      "volume_id": $stateParams.idBook.toString(),
                                      "content_id": $stateParams.idPar.toString()
                                    };
                            serviceHelper.updateTreeBookmark( $rootScope.idResponseBookmarkTree ,bookmarkTreeToSave ).then(function(response){
                                if(response.error){
                                    console.log("Errore nella updateTreeBookmark");
                                }
                                else{

                                }
                            });

                            $rootScope.$emit('newBookmarkTreeNode',$rootScope.bookmarksTreeSource);
                        }
                    }
            });
        }
    }

    $scope.toggleTag = function(){
        $scope.toggleSearchPopover = false;
        $scope.toggleSharePopover = false;
        $scope.toggleTaggingPopoverMap = false;
        $scope.tag = !$scope.tag;
    }

    $scope.openReadingModal = function (obj) {
        angular.element(".popover").hide();
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

    $scope.toggleTagMapMobile = function(){
      $state.go("map", { "latitude" : $scope.bookInfo.geo.split(',')[0], "longitude" : $scope.bookInfo.geo.split(',')[1], "bookOrPdf" : "book", "idBook" : $stateParams.idBook, "idPar" : $stateParams.idPar });
    }

    $scope.toggleTagMap = function(){
          $scope.toggleSearchPopover = false;
          $scope.toggleSharePopover = false;
          $scope.toggleTaggingPopover = false;
          $scope.tagMap = !$scope.tagMap;
          $scope.infoWindow = {
              visible: false
           };
          if($scope.map){
            $scope.map.control.refresh();
          }
          if($scope.tagMap == true){
              $scope.map = {
                  center: { latitude: $scope.bookInfo.geo.split(',')[0], longitude: $scope.bookInfo.geo.split(',')[1] },
                  zoom: 10,
                  control: {},
                  events: {}
              };
              $scope.callMarkers(30, $scope.bookInfo.geo.split(',')[0], $scope.bookInfo.geo.split(',')[1]);
              $scope.options = {
                  scrollwheel: false,
                  streetViewControl: false,
                  panControl: false,
                  mapTypeControl: false,
                  minZoom: 2
              };
              $scope.mapOpen = true;
          }
    }

    $scope.toogleMenu = function(newState){
        if( newState == $state.$current.name ){
            $scope.sideMenu = false;
            $scope.currentState = '';
            $state.go("pdf");
        }
        else {
            $scope.currentState = newState;
            $scope.sideMenu = true;
            $state.go(newState);
        }
    }

    $scope.zoomIn = function(){
        $scope.zoomLevel++
        $scope.pdf = $scope.bookInfo.info[$scope.zoomArray[$scope.zoomLevel]];
        $scope.pdfLayer = $sce.trustAsHtml($scope.pdf.layer);
        $scope.pdfImage = $scope.pdf.src;
        $scope.hotSpots = $scope.pdf.hotSpots;

    }

    $scope.zoomOut = function(){
        $scope.zoomLevel--;
        $scope.pdf = $scope.bookInfo.info[$scope.zoomArray[$scope.zoomLevel]];
        $scope.pdfLayer = $sce.trustAsHtml($scope.pdf.layer);
        $scope.pdfImage = $scope.pdf.src;
        $scope.hotSpots = $scope.pdf.hotSpots;
    }

    $scope.singlePage = function(){
        $scope.singlePageViewer = true;
        $rootScope.singlePageViewer = true;
        $scope.idNextParPdf = parseInt($scope.idPar) + 1;
        $scope.idPrevParPdf = parseInt($scope.idPar) - 1;
    }

    $scope.goToPage = function(){

        if($scope.navigationControl.currentPage){
            $rootScope.getNewPublicationIndex = false;
            if( typeof $rootScope.pages[$scope.navigationControl.currentPage] !== 'undefined'){
                $state.go('pdf',{'idBook': $scope.idBook, 'idPar' : $rootScope.pages[$scope.navigationControl.currentPage]});
            }
            else{
                var obj ={
                    'title' : 'Pagina inesistente',
                    'preview' : 'La pagina richiesta non esiste.'
                };
                $scope.openReadingModal(obj);
            }
        }
    }

    $scope.pdfGoNext = function(){
      if( ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine ) || !$rootScope.readOnline ){
          if($scope.bookInfo.nextId != 0){
            $rootScope.getNewPublicationIndex = false;
            $state.go($state.current.name, {idBook : $scope.bookInfo.pubId, idPar : $scope.bookInfo.nextId});
          }
      }
      else{
        $scope.openNoConnectionModal();
      }
    }

    $scope.pdfGoPrev = function(){
      if( ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine ) || !$rootScope.readOnline ){
        if($scope.bookInfo.prevId != 0){
          $rootScope.getNewPublicationIndex = false;
          $state.go($state.current.name, {idBook : $scope.bookInfo.pubId, idPar : $scope.bookInfo.prevId});
        }
      }
      else{
        $scope.openNoConnectionModal();
      }
    }

    $scope.openNoConnectionModal = function(){
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'myModalNoConnection.html',
          controller: 'myModalNoConnectionCtrl',
           size: 'lg'
        });
    }

    $scope.searchInText = function(){
        angular.element('#bookText').removeHighlight();
        angular.element('#bookText').highlight($scope.textToSearch);
    }

    $scope.closeSidebar = function(){
        $scope.toggleSharePopover = false;
        $scope.toggleTaggingPopover = false;
        $scope.toggleTaggingPopoverMap = false;
        $scope.sideMenu = false;
        $state.go('book');
        $scope.currentState = 'book';
    }

    $scope.clearSearch = function(){
        $scope.textToSearch = '';
        angular.element('#bookText').removeHighlight();
    }

    $scope.searchInBook = function(){
        angular.element('#bookText').removeHighlight();
        $scope.sideMenu = true;
        $rootScope.textToSearchInBook = $scope.textToSearch;
        $scope.currentState = 'book.bookSearch';
        $state.go('pdf.bookSearch');

    }

    $scope.closeAbs = function(){
        $rootScope.addingText = false;
        $rootScope.addingText = false;
        $rootScope.chosenArgs = [];
        $rootScope.desiderataArgs = [];
        $rootScope.desiderataText = [];
        $scope.search.searchingText = '';
    }

    $scope.closePopover =  function(){
        $scope.toggleTaggingPopover = false;
    }
    $scope.closePopoverMap =  function(){
        $scope.toggleTaggingPopoverMap = false;
    }

    $(".index").on("swiperight", function(){
      if(window.cordova){
        $scope.sideMenu = false;
        $state.go("pdf");
        $scope.currentState = 'pdf';
      }
    });

    $scope.$on('SwipeLeft', function(){
      $scope.pdfGoNext();
    });

    $scope.$on('SwipeRight', function(){
      $scope.pdfGoPrev();
    });
    // if(window.cordova){
    //     var previousPinch ;
    //     var element = document.getElementById('bookText');
    //     var mc = new Hammer(element);
    //     mc.get('pinch').set({enable: true});
    //     mc.on('pinchin',function(event){ previousPinch = 'pinchin' ; });
    //     mc.on('pinchout',function(event){ previousPinch = 'pinchout' ;});
    //     mc.on('pinchend',function(event){
    //         console.log(event.type);
    //         if( previousPinch == 'pinchin' ){
    //             console.log('zoomIn');
    //             $scope.zoomIn();
    //         }
    //         else{
    //             if( previousPinch == 'pinchout' ){
    //                 console.log('zoomOut');
    //                 $scope.zoomOut();
    //             }
    //         }
    //     });
    // }

}).controller('ModalMapCtrl',function($scope, $modalInstance, obj){

    $scope.title = obj.title;
    $scope.body = obj.preview;
    $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
    };

}).controller('HotSpotCtrl',function($scope, $modalInstance, $sce, obj){

    $scope.title = obj.title;
    $scope.image = obj.image;
    $scope.audio = $sce.trustAsResourceUrl(obj.audio);
    $scope.video = $sce.trustAsResourceUrl(obj.video);
    $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
    };

}).controller('myModalNoConnectionCtrl',function($scope, $modalInstance){

    $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
    };
});

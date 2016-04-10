desiderata.controller('library',function($scope, $http, $rootScope, $modal, $timeout, bookList, Upload, serviceHelper, $localStorage, $stateParams, $state, $location, $filter){
    $rootScope.getNewPublicationIndex = true;
    $scope.modifyingDes = false;
    $scope.$storage = $localStorage;
    $scope.progressValue = 0;
    $scope.downloadingBooks = [];
    $scope.isMobile = false;
    $rootScope.currentPageLib = (typeof $rootScope.currentPageLib !== "undefined") ? $rootScope.currentPageLib : 1;
    $rootScope.currentPageDes= (typeof $rootScope.currentPageDes !== "undefined") ? $rootScope.currentPageDes : 1;
    if(typeof $rootScope.noOnline === "undefined" || $rootScope.noOnline == false ){
        $scope.$storage.localLibrary = bookList;
        $scope.bookList = bookList;
        $rootScope.noOnline = false;
    }
    else{
        $scope.bookList = $scope.$storage.localLibrary;
    }
    if(window.cordova)
    {
        $scope.isMobile = true;
        console.log('scope.isMobile : '+$scope.isMobile);
        document.addEventListener("deviceready", onDeviceReady, false);
    }
    function onDeviceReady(){
        $scope.store = cordova.file.dataDirectory;
        if($scope.bookList){
          for(var i=0; i < $scope.bookList.length; i++){
            if($scope.bookList[i].coverBig.indexOf("http") == 0){
              saveImageLocally(i);
            }
          }
        }
        if(typeof $scope.$storage.downloadedBooks !== "undefined"){
            for(var i=0; i<$scope.$storage.downloadedBooks.length; i++){
                if($scope.$storage.downloadedBooks[i].user == $scope.$storage.login.username){
                    if(typeof $scope.downloadedBooks === "undefined"){
                        $scope.downloadedBooks = [];
                    }
                    $scope.downloadedBooks.push($scope.$storage.downloadedBooks[i].id);
                }
            }
        }
        else{
          $scope.downloadedBooks = [];
        }
        if(typeof $rootScope.desiderataList !== "undefined"){
          for(var i=0; i < $rootScope.desiderataList.length; i++){
            if($rootScope.desiderataList[i].cover.indexOf("http") == 0){
              saveImageDesiderataLocally(i);
            }
          }
        }
      }

    $scope.IsDownloaded = function( id ){
      if( jQuery.inArray( id , $scope.downloadedBooks ) == -1 ){
        return false;
      }
      else{
        return true;
      }
    };

    $scope.IsDownloading = function( id ){
      if( jQuery.inArray( id , $scope.downloadingBooks ) == -1 ){
        return false | $scope.IsDownloaded(id);
      }
      else{
        return true;
      }
    };

    function saveImageDesiderataLocally( i ){
      var fileTransfer = new FileTransfer();
    	console.log("About to start transfer: " + $rootScope.desiderataList[i].cover);
    	fileTransfer.download($rootScope.desiderataList[i].cover, $scope.store + $scope.bookList[i].id +"desiderata/cover.jpg",
    		function(entry) {
    			console.log("Success!");
          $scope.$storage.desiderataListOffline[i].cover = entry.nativeURL;
    		},
    		function(err) {
    			console.log("Error");
    		});
    }

    function saveImageLocally( i ){
      var fileTransfer = new FileTransfer();
    	console.log("About to start transfer: " + $scope.$storage.localLibrary[i].coverBig);
    	fileTransfer.download($scope.bookList[i].coverBig, $scope.store + $scope.bookList[i].id +"/cover.jpg",
    		function(entry) {
    			console.log("Success!");
          $scope.$storage.localLibrary[i].coverBig = entry.nativeURL;
    		},
    		function(err) {
    			console.log("Error");
    		});
    }
    $scope.TK={};
    $scope.TK.keywordArray = [];
    $scope.TK.tagsArray = [];
    $scope.availableKeywords = [];
    $scope.availableTags = [];
    $scope.tab = true;
    $scope.newDesiderata = false;
    $scope.stepNewDesiderata = 0;
    $scope.nameNewDesiderata = "";
    $scope.desiderataArgs = [];
    $scope.itemsNewDesiderata = [];
    $scope.authors = [];
    $scope.publishers = [];
    $scope.search = {};
    $scope.chosenArgs = [];
    $scope.chosenText = [];
    $rootScope.customCss = '';
    $scope.picFile = '';
    $scope.$storage = $localStorage;
    $scope.user = $scope.$storage.user;
    $scope.emptyCart = (typeof $rootScope.objInCart === "undefined" || $rootScope.objInCart.length == 0) ? true : false;

    if($stateParams.toDesiderata == "desiderata"){
      $scope.tab = false;
    }

    if($scope.bookList){
      var orderBy = $filter('orderBy');
      for(var i = 0; i < $scope.bookList.length; i++ )
      {
          var authorFound = false;
          var author = $scope.bookList[i].author;
          for(var z = 0; z < author.length ; z++){
            for(var j = 0; j < $scope.authors.length; j++ ){
                if($scope.authors[j].key == author[z]){
                    authorFound = true;
                    break;
                }
            }
            if(!authorFound  && author[z] != "" && author[z] != null){
                $scope.authors.push({'key': author[z], 'value': author[z]});
            }
          }
          var publisherFound = false;
          var publisher = $scope.bookList[i].publisher;
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
      $scope.search.publisher = $scope.publishers[0];
    }
    $scope.desiderataSelectedText = [];

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

    function stringToHex (tmp) {
      var str = '',
          i = 0,
          tmp_len = tmp.length,
          c;

      for (; i < tmp_len; i += 1) {
          c = tmp.charCodeAt(i);
          str += d2h(c) + ' ';
      }
      return str;
    }

    function d2h(d) {
        return d.toString(16);
    }

    $scope.openSettingsModal = function(id){
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'mySettingsModal.html',
          controller: 'mySettingsModalCtrl',
          size: 'lg',
          resolve: {
            idBook: function () {
              return id;
            },
            downloadedBooks: function () {
              return $scope.downloadedBooks;
            },
            downloadingBooks: function () {
              return $scope.downloadingBooks;
            }
          }
        });
    }

    $scope.downloadZip = function( type, id, idPar, online ){
      if( !window.cordova ){
        if( type == 'Publication' ) $state.go('book', {'idBook':id, 'idPar': idPar});
        else $state.go('pdf', {'idBook':id, 'idPar': idPar});
        return;
      }
      var progressCallback = function(progressEvent) {
        $scope.progressValue = (progressEvent.loaded / progressEvent.total) * 100;
        $( "#progressBarNumber" + id ).css('width', $scope.progressValue +'%').attr('aria-valuenow', $scope.progressValue);
        console.log('Downloaded:  ' + $scope.progressValue + '%');
      };

      var finishCallBack = function( event ){
        console.log("Ok unzip");
        $scope.progressValue = 100;
        $( "#progressBarNumber" + id ).css('width', $scope.progressValue +'%').attr('aria-valuenow', $scope.progressValue);
        $timeout(function(){
            if(typeof $scope.$storage.downloadedBooks === "undefined"){
              $scope.$storage.downloadedBooks = [];
            }
            $scope.$storage.downloadedBooks.push({"id" : id, "user" : $scope.$storage.login.username});
            if(typeof $scope.downloadedBooks === "undefined"){
                $scope.downloadedBooks = [];
            }
            $scope.downloadedBooks.push(id);
            $scope.downloadingBooks.splice($scope.downloadingBooks.indexOf(id), 1);
            $("#progressContainerNumber"+ id).hide();

            window.resolveLocalFileSystemURL($scope.store + id +"/zip.zip",
             function (fileEntry) {
              fileEntry.remove(
                 function () {
                  console.log('file is removed');
                  console.log($scope.store);
                 },
                 function (error) {
                   console.log("Error in removing file");
                 }
              );
             }
            );

        }, 3000);
      }

      if( online == 0 && $scope.IsDownloaded(id) == false){
        if(( (navigator.connection && (navigator.connection.type != "none" )) || navigator.onLine )){
            var fileTransfer = new FileTransfer();
            fileTransfer.onprogress = function(progressEvent) {
                $("#progressContainerNumber"+ id).show();
                  $scope.progressValue = (progressEvent.loaded / progressEvent.total) * 100;
                  $( "#progressBarNumber" + id ).css('width', $scope.progressValue +'%').attr('aria-valuenow', $scope.progressValue);
                  if($scope.progressValue >= 90){
                    $scope.progressValue = 0;
                    $( "#progressBarNumber" + id ).css('width', $scope.progressValue +'%').attr('aria-valuenow', $scope.progressValue);
                  }
            };
            $scope.downloadingBooks.push(id);
          	console.log("About to start transfer: ");
            if(( (navigator.connection && (navigator.connection.type != "none" )) || navigator.onLine )){
                var lpidKey = JSON.parse($scope.$storage.LPID).lpidKey;
                var key = JSON.parse($scope.$storage.LPID).key;
                fileTransfer.download(DESIDERATA_CONFIG.cds+ id + "?lpidKey=" + encodeURIComponent(lpidKey) + "&key=" + encodeURIComponent(key), $scope.store + id +"/",
              		function(entry) {
                    var isZip;
                    window.resolveLocalFileSystemURL($scope.store + entry.fullPath,
                     function (fileEntry) {

                       fileEntry.file(function(file) {
                         var isZip = (file.name.substr(file.name.indexOf(".") + 1) == 'zip') ? true: false;
                          var params;
                            if(window.device.platform == 'iOS'){
                              params = [
                                $scope.store.substr(7) + id + '/' + file.name,
                                $scope.store.substr(7) + id,
                                $scope.$storage.login.username
                              ];
                            }
                            else if(window.device.platform == 'Android'){
                              params = [{
                                source: $scope.store.substr(7) + id + '/' + file.name,
                                dest: $scope.store.substr(7) + id,
                                username: $scope.$storage.login.username
                              }];
                            }
                            if(params && !isZip){
                              cordova.exec(
                               function(response) {
                                 if(typeof $scope.$storage.downloadedBooks === "undefined"){
                                   $scope.$storage.downloadedBooks = [];
                                 }
                                 $scope.$apply(function(){
                                   $scope.$storage.downloadedBooks.push({"id" : id, "user" : $scope.$storage.login.username});
                                   if(typeof $scope.downloadedBooks === "undefined"){
                                       $scope.downloadedBooks = [];
                                   }
                                   $scope.downloadedBooks.push(id);
                                   $scope.downloadingBooks.splice($scope.downloadingBooks.indexOf(id), 1);
                                   $("#progressContainerNumber"+ id).hide();
                                 });
                                 console.log(response);
                               },
                               function(error) {

                               },
                               "ViditrustPlugin",
                               "decrypt",
                               params
                             );
                            }
                           else{
                             if(isZip){
                                 zip.unzip( $scope.store + id + '/' + file.name, $scope.store + id + "/", finishCallBack, progressCallback );
                             }
                          }
                         }
                     );
                    }
                  );


                  },
              		function(err) {
              			console.log("Error");
                    $scope.openErrorZipModal();
              		});
          }
        }
        else{
            $scope.openNoConnectionModal();
        }
      }
      else{
        var destination = (type == "Publication") ? 'book' : 'pdf';
        if(online == 0 && $scope.IsDownloaded(id) == true){
          $rootScope.readOnline = false;
          $state.go(destination, {'idBook':id, 'idPar': idPar});
        }
        else{
            if(( (navigator.connection && (navigator.connection.type != "none" )) || navigator.onLine )){
                $rootScope.readOnline = true;
                $state.go(destination, {'idBook':id, 'idPar': idPar});
            }
            else{
                $scope.openNoConnectionModal();
            }
        }
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

    $scope.openErrorZipModal = function(){
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'openErrorZipModal.html',
          controller: 'myModalErrorZipCtrl',
           size: 'lg'
        });
    }

    $scope.getDesiderataList =  function(){
        $rootScope.desiderataList = [];
        if(( (navigator.connection && navigator.connection.type != "none") || navigator.onLine ) == false || ( ( (navigator.connection && (navigator.connection.type != "none" )) || navigator.onLine ) == true && $rootScope.readOnline == false ) ){
          $rootScope.desiderataList = $scope.$storage.desiderataListOffline;
        }
        else{
              serviceHelper.getDesiderata().then(function(response){
                  if(response.error){
                      console.log("Errore nella getDesiderataList");
                  }
                  else{
                      response.data.desiderata.forEach(function(desiderata){
                         $rootScope.desiderataList.push(desiderata);
                      });
                      var monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
                      $rootScope.desiderataList.forEach(function(desiderata){
                          var day = desiderata.creationDate.substr(0, 2);
                          var month = desiderata.creationDate.substr(3, 2);
                          var year = desiderata.creationDate.substr(6, 4);
                          desiderata.dateToShow = day + ' ' +  monthNames[parseInt(month) - 1] + ' ' + year;
                      });
                      if(typeof $scope.$storage.desiderataListOffline === "undefined"){
                        $scope.$storage.desiderataListOffline = [];
                      }
                      $scope.$storage.desiderataListOffline = $rootScope.desiderataList;
                  }
              });
        }
    };

    if(( (navigator.connection && (navigator.connection.type != "none" )) || navigator.onLine )){
      $scope.getDesiderataList();
    }
    $scope.searchingText = "";

    $scope.getKeywords = function(term){
        $scope.availableKeywords = [];
        console.log(term);
        if(( (navigator.connection && (navigator.connection.type != "none" )) || navigator.onLine )){
          serviceHelper.getKeywords( term ).then(function(response){
              if(response.error){
                  console.log("Errore nella getKeywords");
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
    }

    $scope.getTags = function(term){
        $scope.availableTags = [];
        console.log(term);
        if(( (navigator.connection && (navigator.connection.type != "none" )) || navigator.onLine )){
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

    $scope.selectKeyWord = function(keyword){
        serviceHelper.createUserKeywords( keyword.text ).then(function(response){
            if(response.error){
                console.log("Errore nella createUserKeywords");
            }
            else{
            console.log("Keyword salvata");
            }
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

    $scope.addToList = function(obj){
    }

    $scope.lib = function(){
        $scope.tab = true;
        $state.go("dashboard", {"toDesiderata" : ""});
        resetForms();
    };

    $scope.fav = function(){
        $scope.tab = false;
        resetForms();
        $scope.getDesiderataList();
    }

    function resetForms(){
        $scope.newDesiderata = false;
        $scope.search.title = '';
        $scope.search.author = "";
        $scope.search.publisher = "";
        $scope.nameNewDesiderata = "";
        $scope.searchingText = "";
        $scope.TK={};
        $scope.TK.keywordArray = [];
        $scope.TK.tagsArray = [];
        $scope.stepNewDesiderata = 0;
        $scope.chosenArgs = [];
        $scope.chosenText = [];
        $scope.desiderataArgs = [];
        $scope.desiderataText = [];
        $scope.chosenKey = [];
    }

    $scope.goToDes = function(id){
        if(( (navigator.connection && (navigator.connection.type != "none" )) || navigator.onLine )){
            $state.go('bookDes',{'idBook' : id, 'idPar' : 0});
        }
        else{
            $scope.openNoConnectionModal();
        }
    }

    $scope.desiderata = function(){
        $scope.tab = false;
        $scope.newDesiderata = true;
    }

    $scope.chooseArgs = function(index){
        var obj = $scope.desiderataArgs[index].label;
        $scope.desiderataText = [];
        $scope.desiderataArgs = [];
        //$rootScope.desiderataArgs.splice(index,1);
        $scope.chosenArgs.splice($scope.chosenArgs.length, 0, obj);
        $scope.searchItem(0);
    }

    $scope.chooseText = function(index){
        var obj = $scope.desiderataText[index];
        //obj.id = parseInt(obj.id);
        $scope.desiderataText.splice(index, 1);
        $scope.chosenText.splice($scope.chosenText.length, 0, obj);

    }

    $scope.searchItem = function(page){
        var keyToSearch = [];
        var topicToSearch = [];

        for( var i = 0 ; i < $scope.TK.keywordArray.length; i++ ){
            keyToSearch.push($scope.TK.keywordArray[i].text);
        }
        for( var i = 0 ; i < $scope.TK.tagsArray.length; i++ ){
            topicToSearch.push($scope.TK.tagsArray[i].text);
        }
        for( var i = 0 ; i < $scope.chosenArgs.length; i++ ){
            topicToSearch.push($scope.chosenArgs[i]);
        }
       var request = {
            "text": $scope.searchingText,
            "topics": topicToSearch,
            "keywords" : keyToSearch,
            "page" : page
        }

        serviceHelper.search( request ).then(function(response){
            if(response.error){
                console.log("Errore nella search");
            }
            else{
                $scope.current = response.data.page;
                $scope.pages = response.data.pages;
                $scope.desiderataText = [];
                $scope.desiderataArgs = [];
                console.log(response.data);
                for(var i = 0; i< response.data.results.length; i++){
                    var temp = response.data.results[i];
                    var corr = false;
                    for(var j = 0 ; j < $scope.chosenText.length; j++){
                        if( temp.id == $scope.chosenText[j].id )
                        {
                            corr= true;
                            break;

                        }
                    }
                    if(!corr) $scope.desiderataText.splice($scope.desiderataText.length, 0, temp);

                }
                for(var i = 0; i< response.data.categories.length; i++){
                    var temp = response.data.categories[i];
                    var corr = false;
                    for(var j = 0 ; j < $scope.chosenArgs.length; j++){
                        if( temp.label == $scope.chosenArgs[j] )
                        {
                            corr= true;
                            break;

                        }
                    }
                    if(!corr) $scope.desiderataArgs.splice($scope.desiderataArgs.length, 0, temp);

                }
            }
        });
    }

    $scope.dropArgs = function(index){
        $scope.desiderataText = [];
        $scope.desiderataArgs = [];
        $scope.chosenArgs.splice(index, 1);
        $scope.searchItem(0);
    }

    $scope.searchTexts = function(){
        $scope.desiderataText = [];
        $scope.desiderataArgs = [];
        $scope.searchItem(0);
    };

    $scope.dropText = function(index){
        var obj = $scope.chosenText[index];
        $scope.chosenText.splice(index,1);
        $scope.desiderataText = [];
        $scope.desiderataArgs = [];
        $scope.searchItem(0);
    }

    $scope.addItemToNewDesiderata = function(item){
        item.isSelected = true;
        $scope.itemsNewDesiderata.push(item);
    }
    $scope.removeItemToNewDesiderata = function(item){
        item.isSelected = false;
        $scope.itemsNewDesiderata.splice($scope.itemsNewDesiderata.indexOf(item), 1);
    }

    $scope.nextStep = function(){

        if(!$scope.nameNewDesiderata || $scope.nameNewDesiderata == ''){
            angular.element('#nameNewDesiderata').focus();
            return;
        }
        if($scope.stepNewDesiderata == 2){
            if( $scope.nameNewDesiderata == '' || $scope.chosenText.length == 0){
                var modalInstance = $modal.open({
                  animation: $scope.animationsEnabled,
                  templateUrl: 'myModalContent.html',
                  controller: 'ModalCtrl',
                  size: 'lg',
                  resolve: {
                    obj: function () {
                      return {title: 'Errore', body: 'La desiderata deve contenere almeno un contenuto'};
                    }
                  }
                });
                return;
            }

            var temp = { "title" : $scope.nameNewDesiderata, "tags" : {"userKeywords" : $scope.TK.keywordArray, "ontologyTags" : $scope.TK.tagsArray} , "elements" : $scope.chosenText };
            var newDesiderataItems = [];

            if( !$scope.modifyingDes ){
                serviceHelper.createDesiderata( temp ).then(function(response){
                    if(response.error){
                        console.log("Errore nella createDesiderata");
                    }
                    else{
                        console.log(response.data.id);
                        if( $scope.picFile != '' && $scope.picFile != null){
                           console.log('upload immagine');
                           $scope.uploadPic($scope.picFile, response.data.id);
                        }
                        else{
                           console.log('non upload immagine');
                           $scope.getDesiderataList();
                        }
                        $scope.stepNewDesiderata = 0;
                        $scope.newDesiderata = false;

                        resetForms();
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
            else{
                serviceHelper.updateDesiderata( $scope.idDesMod, temp ).then(function(response){
                    if(response.error){
                        console.log("Errore nella updateDesiderata");
                    }
                    else{
                       console.log(response.data.id);

                       if( $scope.picFile != '' && $scope.picFile != null && $scope.originalPicFile != $scope.picFile ){
                           console.log('upload immagine');
                           $scope.uploadPic($scope.picFile, response.data.id);
                       }
                       else{
                           console.log('non upload immagine');
                           $scope.getDesiderataList();
                       }
                       $scope.stepNewDesiderata = 0;
                       $scope.newDesiderata = false;

                       resetForms();
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
            return;
        }
        if( $scope.stepNewDesiderata == 1 ){
          $scope.chosenArgs = [];
          $scope.chosenKey = [];

          $scope.searchingText = '';
          $scope.searchTexts();
        }
        if($scope.stepNewDesiderata < 2){
            $scope.stepNewDesiderata++;
        }

    }

    $scope.previousStep = function(){
        if($scope.stepNewDesiderata > 0){
            $scope.stepNewDesiderata--;
        }
    }

    $scope.modifyContentThirdStep = function(val){
        $scope.stepNewDesiderata = val;
    }

    $scope.changeSelectedKeyWord = function(val){
        $scope.selectedKeyWord.push(val);
        console.log($scope.selectedKeyWord);
    }

    $scope.changeSelectedTag = function(val){
        $scope.selectedTag.push(val);
        console.log($scope.selectedTag);
    }

    $scope.deleteKeyWord = function(val){
        for(var i= 0; i < $scope.selectedKeyWord.length; i++){
            if($scope.selectedKeyWord[i] == val){
                $scope.selectedKeyWord.splice(i, 1);
            }
        }
        console.log($scope.selectedKeyWord);
    }

    $scope.deleteTag = function(val){
        for(var i= 0; i < $scope.selectedTag.length; i++){
            if($scope.selectedTag[i] == val){
                $scope.selectedTag.splice(i, 1);
            }
        }
        console.log($scope.selectedTag);
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
              return modalObj;
            }
          }
        });
    }

    $scope.openCancelModal = function(obj){
        var modalObj = {};
        console.log(obj);
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

    var startPos;
    var changedPos;

    var endChange = function(e, ui) {
            //console.log("pagina: "+$scope.paginationOpt.currentPage);
            //console.log("item: "+$scope.paginationOpt.itemsPage);
            changedPos = ui.item.index()
            console.log(changedPos);
            $scope.sortArray();
    };

    var startChange = function(e, ui){
        startPos = ui.item.index() ;
        console.log(startPos);
    };

    $scope.sortArray = function(){
        //console.log($scope.arrayCurrent);
        //console.log(startPos);
        //console.log(changedPos);
        var obj = $scope.chosenText[startPos];
        //console.log(obj);
        $scope.chosenText.splice(startPos , 1);
        $scope.chosenText.splice(changedPos, 0 ,obj);
        console.log($scope.chosenText);
        $scope.$apply();
        //console.log($scope.arrayImage);
    };

    angular.element("#sortable").sortable({
        axis: 'y',
        opacity: 0.5,
        update: endChange,
        start: startChange
    }).disableSelection();

    $scope.removeDesiderata = function(desiderataToRemove){
      console.log(desiderataToRemove);
      serviceHelper.deleteDesiderata( desiderataToRemove.id ).then(function(response){
        if(response.error){
            console.log("Errore nella removeDesiderata");
        }
        else{
            $rootScope.desiderataList.splice($rootScope.desiderataList.indexOf(desiderataToRemove), 1);
        }
      });
    }

    $scope.modifyDes = function(id){
        $scope.idDesMod = id;
        serviceHelper.modifyContentDesiderata( id ).then(function(response){
            if(response.error){
                console.log("Errore nella updateDesiderata");
            }
            else{
              $scope.modifyingDes = true;
              $scope.newDesiderata = true;
              $scope.stepNewDesiderata = 0;
              $scope.nameNewDesiderata = response.data.title;
              $scope.picFile = response.data.cover;
              $scope.originalPicFile= response.data.cover;
              $scope.TK.keywordArray = response.data.tags.userKeywords;
              $scope.TK.tagsArray = response.data.tags.ontologyTags;
              $scope.chosenText = response.data.elements;
            }
        });
    }

    $scope.uploadPic = function(file, desId) {
    file.upload = Upload.upload({
      url: DESIDERATA_CONFIG.base_url+'desiderata/addCover/'+desId,
      data: {picture: file},
    });

    file.upload.then(function (response) {
      $timeout(function () {
        file.result = response.data;
        $scope.getDesiderataList();
      });
    }, function (response) {
      if (response.status > 0)
        $scope.errorMsg = response.status + ': ' + response.data;
    }, function (evt) {
      // Math.min is to fix IE which reports 200% sometimes
      //file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });
    }

    $scope.findDesiderata = function(){
        if( typeof $scope.search.title != 'undefined'){
            serviceHelper.findDesiderata( $scope.search.title ).then(function(response){
                if(response.error){
                    console.log("Errore nella findDesiderata");
                }
                else{
                    console.log(response.data.desiderata);
                    $rootScope.desiderataList = response.data.desiderata;
                    var monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
                    $rootScope.desiderataList.forEach(function(desiderata){
                        var day = desiderata.creationDate.substr(0, 2);
                        var month = desiderata.creationDate.substr(3, 2);
                        var year = desiderata.creationDate.substr(6, 4);
                        desiderata.dateToShow = day + ' ' +  monthNames[parseInt(month) - 1] + ' ' + year;
                    });
                }
            });
        }
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
                    console.log("Errore nella getCatalog");
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
                "preview" : "Il testo è già nel carrello"
            };
            $scope.openReadingModal(objMessage);
        }
    }

    $scope.maskInput = function(){
        angular.element('#trueInput').click();
    }

    $scope.$on('$dropletReady', function whenDropletReady() {
        console.log($scope.interface);

        $scope.interface.allowedExtensions(['png', 'jpg', 'bmp', 'gif']);
        $scope.interface.setRequestUrl(DESIDERATA_CONFIG.base_url+'desiderata/addCover/85');
        $scope.interface.disableXFileSize();
        $scope.interface.setRequestHeaders({'withCredentials': true});
        //$scope.interface.maximumValidFiles(1) ;
    });
}).controller('ModalCtrl',function($scope, $modalInstance, obj){

    $scope.title = obj.title;
    $scope.body = obj.body;
    $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
    };

}).controller('ModalCancelCtrl',function($scope, $modalInstance, $http, $rootScope, serviceHelper, obj){

    $scope.title = obj.title;
    $scope.body = obj.body;
    $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
    };

    $scope.removeDesiderata = function(){
      serviceHelper.deleteDesiderata( obj.id ).then(function(response){
        if(response.error){
            console.log("Errore nella removeDesiderata");
        }
        else{
              $modalInstance.dismiss('cancel');
              $rootScope.desiderataList.splice($rootScope.desiderataList.indexOf(obj), 1);
        }
      });
    }

}).controller('ModalFinalizeCtrl',function($scope, $modalInstance, $http, $rootScope, $state){

    $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
    };

    $scope.goToFinalize = function(){
      //console.log(desiderataToRemove);
         $modalInstance.dismiss('cancel');
         $state.go('cart');
    }

}).controller('myModalNoConnectionCtrl',function($scope, $modalInstance){

    $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
    };
}).controller('myModalErrorZipCtrl',function($scope, $modalInstance){

    $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
    };
}).controller('mySettingsModalCtrl',function($scope, $modalInstance, $localStorage, $timeout, $modal, idBook, downloadedBooks, downloadingBooks){

    $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
    };

    $scope.refresh = function(){
      if( ((navigator.connection && navigator.connection.type == "none") || !navigator.onLine ) ){
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'myModalNoConnection.html',
          controller: 'myModalNoConnectionCtrl',
           size: 'lg'
        });
        return;
      }

      $scope.delete();

      function stringToHex (tmp) {
        var str = '',
            i = 0,
            tmp_len = tmp.length,
            c;

        for (; i < tmp_len; i += 1) {
            c = tmp.charCodeAt(i);
            str += d2h(c) + ' ';
        }
        return str;
      }

      function d2h(d) {
          return d.toString(16);
      }

      var progressCallback = function(progressEvent) {
        $scope.progressValue = (progressEvent.loaded / progressEvent.total) * 100;
        $( "#progressBarNumber" + idBook ).css('width', $scope.progressValue +'%').attr('aria-valuenow', $scope.progressValue);
        console.log('Downloaded:  ' + $scope.progressValue + '%');
      };

      var finishCallBack = function( event ){
        console.log("Ok unzip");
        $scope.progressValue = 100;
        $( "#progressBarNumber" + idBook ).css('width', $scope.progressValue +'%').attr('aria-valuenow', $scope.progressValue);
        $timeout(function(){
            $localStorage.downloadedBooks.push({"id" : idBook, "user" : $localStorage.login.username});
            downloadedBooks.push(idBook);
            downloadingBooks.splice(downloadingBooks.indexOf(idBook), 1);
            $("#progressContainerNumber"+ idBook).hide();

            window.resolveLocalFileSystemURL(cordova.file.dataDirectory + idBook +"/zip.zip",
             function (fileEntry) {
              fileEntry.remove(
                 function () {
                  console.log('file is removed');
                  console.log($scope.store);
                 },
                 function (error) {
                   console.log("Error in removing file");
                 }
              );
             }
            );

        }, 3000);
      }

      if(( (navigator.connection && (navigator.connection.type != "none" )) || navigator.onLine )){
          var fileTransfer = new FileTransfer();
          fileTransfer.onprogress = function(progressEvent) {
              $("#progressContainerNumber"+ idBook).show();
                $scope.progressValue = (progressEvent.loaded / progressEvent.total) * 100;
                $( "#progressBarNumber" + idBook ).css('width', $scope.progressValue +'%').attr('aria-valuenow', $scope.progressValue);
                if($scope.progressValue >= 90){
                  $scope.progressValue = 0;
                  $( "#progressBarNumber" + idBook ).css('width', $scope.progressValue +'%').attr('aria-valuenow', $scope.progressValue);
                }
          };
          downloadingBooks.push(idBook);
        	console.log("About to start transfer: ");
          if(( (navigator.connection && (navigator.connection.type != "none" )) || navigator.onLine )){
              var lpidKey = JSON.parse($localStorage.LPID).lpidKey;
              var key = JSON.parse($localStorage.LPID).key;
              fileTransfer.download(DESIDERATA_CONFIG.cds+ idBook + "?lpidKey=" + encodeURIComponent(lpidKey) + "&key=" + encodeURIComponent(key), cordova.file.dataDirectory + idBook +"/zip.zip",
            		function(entry) {
                  var isZip;
                  window.resolveLocalFileSystemURL(cordova.file.dataDirectory + idBook +"/zip.zip",
                   function (fileEntry) {

                     fileEntry.file(function(file) {
                       var reader = new FileReader();

                       reader.onloadend = function(e) {
                         var stringT = this.result[0] + this.result[1] + this.result[2];
                         if(stringToHex(stringT) == '50 4b 3 '){
                            isZip = true;
                         }
                         else{
                            isZip = false;
                         }

                         var params;
                          if(window.device.platform == 'iOS'){
                            params = [
                              cordova.file.dataDirectory.substr(7) + idBook + '/zip.zip',
                              cordova.file.dataDirectory.substr(7) + idBook,
                              $localStorage.login.username
                            ];
                          }
                          else if(window.device.platform == 'Android'){
                            params = [{
                              source: cordova.file.dataDirectory.substr(7) + idBook + '/zip.zip',
                              dest: cordova.file.dataDirectory.substr(7) + idBook,
                              username: $localStorage.login.username
                            }];
                          }
                          if(params && !isZip){
                            cordova.exec(
                             function(response) {
                                 if(typeof $localStorage.downloadedBooks === "undefined"){
                                   $localStorage.downloadedBooks = [];
                                 }
                                 $timeout(function(){
                                   $localStorage.downloadedBooks.push({"id" : idBook, "user" : $localStorage.login.username});
                                   downloadedBooks.push(idBook);
                                   downloadingBooks.splice(downloadingBooks.indexOf(idBook), 1);
                                   $("#progressContainerNumber"+ idBook).hide();
                                 }, 0);
                             },
                             function(error) {
                               console.log(error);
                             },
                             "ViditrustPlugin",
                             "decrypt",
                             params
                           );
                          }
                        else{
                          if(isZip){
                              zip.unzip( cordova.file.dataDirectory + idBook +"/zip.zip", cordova.file.dataDirectory + idBook + "/", finishCallBack, progressCallback );
                          }
                        }
                       }

                       reader.readAsBinaryString(file);
                     });

                   }
                  );


                },
            		function(err) {
            			console.log("Error");
                  $scope.openErrorZipModal();
            		});
        }
      }
      else{
          $scope.openNoConnectionModal();
      }

      $scope.cancel();
    }

    $scope.delete = function(){
        if( typeof $localStorage.downloadedBooks === 'undefined') return;
        for(var i = 0; i < $localStorage.downloadedBooks.length; i++ )
        {
            if( $localStorage.downloadedBooks[i].id == idBook ){
              $localStorage.downloadedBooks.splice(i, 1);
              downloadedBooks.splice(i, 1);
              console.log('corrispondenza trovata');

              window.resolveLocalFileSystemURL(cordova.file.dataDirectory + idBook + "/" + idBook,
               function (fileEntry) {
                fileEntry.removeRecursively(
                   function () {
                    console.log('file is removed');
                   },
                   function (error) {
                     console.log("Error in removing file");
                   }
                );
               }
              );

              $scope.cancel();
              return;
            }
        }
      console.log('corrispondenza non trovata');
      $scope.cancel();
    }
});

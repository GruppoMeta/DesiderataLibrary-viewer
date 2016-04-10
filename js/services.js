desiderata.service('serviceHelper',function( $http, $q, $state, $rootScope){

    var urlBase = DESIDERATA_CONFIG.base_url;

    return({
        getLibrary : getLibrary,
        login : login,
        logout : logout,
        getDesiderata : getDesiderata,
        search : search,
        searchByTag: searchByTag,
        getKeywords : getKeywords,
        getOntologyTags : getOntologyTags,
        createUserKeywords : createUserKeywords,
        deleteDesiderata : deleteDesiderata,
        findDesiderata : findDesiderata,
        getCatalog : getCatalog,
        getSharingButtons : getSharingButtons,
        getGeoSearch : getGeoSearch,
        deleteAnnotation : deleteAnnotation,
        putAnnotation : putAnnotation,
        getAnnotationByVolume : getAnnotationByVolume,
        getAnnotationByContent : getAnnotationByContent,
        getTagsToLoad : getTagsToLoad,
        saveBookmark : saveBookmark,
        saveTreeBookmark : saveTreeBookmark,
        updateTreeBookmark : updateTreeBookmark,
        deleteBookmark : deleteBookmark,
        saveTag : saveTag,
        createDesiderata : createDesiderata,
        inferenceSearch : inferenceSearch,
        getSimilarText : getSimilarText,
        getSuggestedText : getSuggestedText,
        modifyDesiderata : modifyDesiderata,
        getBookmark : getBookmark,
        updateDesiderata : updateDesiderata,
        getFatturationData : getFatturationData,
        saveFatturationData : saveFatturationData,
        modifyContentDesiderata : modifyContentDesiderata,
        getContentBookPdf : getContentBookPdf,
        getContentDes : getContentDes,
        getPublicationIndex : getPublicationIndex,
        getZip : getZip,
        searchInBook : searchInBook,
        getContentInfo : getContentInfo,
        addFree : addFree,
        burnCode : burnCode,
        helpRequest : helpRequest,
        updateUser : updateUser,
        recoverPassword : recoverPassword,
        registerUser : registerUser,
        checkLogin : checkLogin
    });

    function postCall( path, data ){
        var request = $http({
            method: "POST",
            url: urlBase + path,
            data: JSON.stringify(data),
            headers: {'Content-Type': 'application/json'},
            withCredential :true
        });

        return( request.then( handleSuccess, handleError ) );
    }

    function putCall( path, data ){
        var request = $http({
            method: "PUT",
            url: urlBase + path,
            data: JSON.stringify(data),
            headers: {'Content-Type': 'application/json'}
        });

        return( request.then( handleSuccess, handleError ) );
    }

    function getCall( path ){
        var request = $http({
            url: urlBase + path,
            method: "GET"
        });
        return( request.then( handleSuccess, handleError ) );
    }

    function getZipCall( path, data ){
        var request = $http({
            url: path,
            method: "GET"
//            data: data,
//            headers: {'Content-Type': 'application/json'},
//            withCredential :true
        });
        return( request.then( handleSuccess, handleError ) );
    }

    function deleteCall( path ){
        var request = $http({
            url: urlBase + path,
            method: "DELETE"
        });
        return( request.then( handleSuccess, handleError ) );
    }

    function handleSuccess( response ){
        return response;
    }

    function handleError( response ) {
        if(response.status == 404 || response.status == 401){
            var err = {error: response.status};
            return err;
        }
        if(response.status == 401){
            $state.go('login');
            return;
        }

        if ( ! angular.isObject( response.data ) ||  ! response.data.message ) {
            return( $q.reject( "An unknown error occurred." ) );
        }
        return( $q.reject( response.data.message ) );
    }

    //Get Library
    function getLibrary(){
        var deferred = $q.defer();
        getCall('getLibrary').then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Login
    function login(user){
        var deferred = $q.defer();
        postCall('login', user).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function logout(){
        var deferred = $q.defer();
        getCall('logout').then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Get Desiderata
    function getDesiderata(){
        var deferred = $q.defer();
        getCall('desiderata').then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Create Desiderata
    function createDesiderata(val){
        var deferred = $q.defer();
        postCall('desiderata/', val).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Search
    function search(request){
        var deferred = $q.defer();
        postCall('search', request).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function searchByTag(request){
        var deferred = $q.defer();
        postCall('tags/search', request).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Get Similar Texts
    function getSimilarText( id ){
        var deferred = $q.defer();
        getCall('similar/' + id).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Get Keywords
    function getKeywords(term){
        var deferred = $q.defer();
        if(term == ""){
            getCall('tags/getUserKeywords/').then(function(data){
                deferred.resolve(data);
            },function(error){
                deferred.reject(error);
            });
            return deferred.promise;
            }
        else{
            getCall('tags/getUserKeywords/'+ term).then(function(data){
                deferred.resolve(data);
            },function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        }
    }

    //Get Ontology Tags
    function getOntologyTags(term){
        var deferred = $q.defer();
        getCall('tags/getOntologyTags/'+term).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Create Keywords
    function createUserKeywords(keyword){
        var deferred = $q.defer();
        getCall('tags/createUserKeyword/'+keyword).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Delete Desiderata
    function deleteDesiderata( id ){
        var deferred = $q.defer();
        deleteCall('desiderata/'+ id).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Search single Desiderata
    function findDesiderata( title ){
        var deferred = $q.defer();
        getCall('desiderata?search='+ title).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Get catalog
    function getCatalog(){
        var deferred = $q.defer();
        getCall('getCatalog').then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Get sharingButtons
    function getSharingButtons(){
        var deferred = $q.defer();
        getCall('sharing/getSharingButtons').then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Geo Search
    function getGeoSearch( val ){
        var deferred = $q.defer();
        getCall('geo/search/' + val).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function deleteAnnotation(type, id){
        var deferred = $q.defer();
        deleteCall('annotations/'+type+'/'+id).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function putAnnotation(type, id, putData){
        var deferred = $q.defer();
        putCall('annotations/'+type+'/'+id, putData).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Get annotations by volume
    function getAnnotationByVolume( idBook ){
        var deferred = $q.defer();
        getCall('annotations/byVolume/' + idBook).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Get annotations by content
    function getAnnotationByContent( id ){
        var deferred = $q.defer();
        getCall('annotations/byContent/' + id).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Load tags
    function getTagsToLoad( id ){
        var deferred = $q.defer();
        getCall('tags/load/' + id).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //inference Search
    function inferenceSearch( id ){
        var deferred = $q.defer();
        getCall('inferenceSearch/' + id).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Modify Desiderata
    function modifyDesiderata( id ){
        var deferred = $q.defer();
        getCall('desiderata/addContent/' + id).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Update Desiderata
    function modifyContentDesiderata( id ){
        var deferred = $q.defer();
        getCall('desiderata/' + id).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Save bookmark
    function saveBookmark( bookmark ){
        var deferred = $q.defer();
        postCall('annotations/bookmark', bookmark).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Get Bookmark
    function getBookmark(){
        var deferred = $q.defer();
        getCall('annotations/bookmark').then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Save treeBookmark
    function saveTreeBookmark( treeBookmark ){
        var deferred = $q.defer();
        postCall('annotations/treeBookmark', treeBookmark).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Update treeBookmark
    function updateTreeBookmark( idTreeBookmark, treeBookmark ){
        var deferred = $q.defer();
        putCall('annotations/treeBookmark/' + idTreeBookmark, treeBookmark).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Update desiderata
    function updateDesiderata( idDes, val ){
        var deferred = $q.defer();
        putCall('desiderata/' + idDes, val).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Delete Bookmark
    function deleteBookmark( id ){
        var deferred = $q.defer();
        deleteCall('annotations/bookmark/'+ id).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Save tags
    function saveTag( id, tag ){
        var deferred = $q.defer();
        postCall('tags/save/' + id, tag).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Get FatturationData
    function getFatturationData(){
        var deferred = $q.defer();
        getCall('order/InvoiceLoad').then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Save FatturationData and payment
    function saveFatturationData( obj ){
        var deferred = $q.defer();
        postCall('order/Checkout', obj).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Get Content of a book or pdf
    function getContentBookPdf(idBook, idPar){
      var deferred = $q.defer();
      if( window.cordova && (typeof $rootScope.readOnline === undefined || $rootScope.readOnline == false) ){
          var result;
          console.log( cordova.file.dataDirectory );
          var path = cordova.file.dataDirectory.replace('file://', '');
          db = window.sqlitePlugin.openDatabase({name: path + idBook + "/" + idBook + "/publication.db", location: 3, dblocation: "asIs"});
          db.transaction(function(tx) {
            tx.executeSql("SELECT offline_value FROM offline_tbl WHERE offline_path = 'getContent?contentId=" + idPar + "&id="+ idBook + "'", [], function(tx, res) {
              var value = res.rows.item(0).offline_value.replace(/##HOST##/g, path + idBook + "/" + idBook);
              result = JSON.parse(value);
              deferred.resolve(result);
            }, function(error) {
              console.log('SELECT error: ' + error.message);
            });
          }, function(error) {
            console.log('transaction error: ' + error.message);
          });
      }
      else{
        getCall('getContent?contentId='+idPar+'&id='+idBook).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
      }
      return deferred.promise;
    }

    function getContentDes(idBook, idPar){
        var deferred = $q.defer();
        getCall('getContent?contentId='+idPar+'&id='+idBook).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Get PublicationIndex
    function getPublicationIndex(idBook){
        var deferred = $q.defer();
        if(window.cordova && (typeof $rootScope.readOnline === undefined || $rootScope.readOnline == false) ){
            var result;
            console.log( cordova.file.dataDirectory );
            var path = cordova.file.dataDirectory.replace('file://', '');
            db = window.sqlitePlugin.openDatabase({name: path + idBook + "/" + idBook + "/publication.db", location: 3, dblocation: "asIs"});
            db.transaction(function(tx) {
              tx.executeSql("SELECT offline_value FROM offline_tbl WHERE offline_path = 'getPublicationIndex?id=" + idBook + "'", [], function(tx, res) {
                var value = res.rows.item(0).offline_value.replace(/##HOST##/g, path + idBook + "/" + idBook);
                result = JSON.parse(value);
                deferred.resolve(result);
              }, function(error) {
                console.log('SELECT error: ' + error.message);
              });
            }, function(error) {
              console.log('transaction error: ' + error.message);
            });
        }
        else{
            getCall('getPublicationIndex?id='+ idBook).then(function(data){
                deferred.resolve(data.data);
            },function(error){
                deferred.reject(error);
            });
        }
        return deferred.promise;
    }

    function getDesiderataIndex(idBook){
        var deferred = $q.defer();
        getCall('getDesiderataIndex?id='+idBook).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Get PublicationIndex
    function getZip(idBook, data){
        console.log(data);
        var temp = JSON.parse(data);

        var deferred = $q.defer();
        getZipCall(DESIDERATA_CONFIG.cds+idBook+'?lpidKey='+temp.lpidKey+'?key='+temp.key).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //Get Suggested
    function getSuggestedText(idBook, idPar){
        var deferred =$q.defer();
        getCall('recommender/recommend/'+idBook+'/'+idPar).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //SearchInBook
    function searchInBook(idBook, term){
        var deferred =$q.defer();
        getCall('publicationSearch/'+idBook+'?text='+term).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //getContentInfo
    function getContentInfo( idBook, idPar ){
        var deferred = $q.defer();
        getCall('getContentInfo/'+idBook+'/'+idPar).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function addFree( idBook ){
        var deferred = $q.defer();
        getCall('license/add-free/'+idBook).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function burnCode( code ){
        var deferred = $q.defer();
        getCall('license/burn/'+code).then(function(data){
            deferred.resolve(data);
        },function(message){
            error = {
              error: message
            };
            deferred.resolve(error);
        });
        return deferred.promise;
    }

    function helpRequest( message ){
        var deferred = $q.defer();
        postCall('user/helpRequest', message).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function updateUser( user ){
        var deferred = $q.defer();
        putCall('user/update', user).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function recoverPassword( user ){
        var deferred = $q.defer();
        postCall('user/recoverPassword', user).then(function(data){
          if( angular.isUndefined(data.error))
            deferred.resolve(data);
          else
            deferred.reject(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function registerUser( user ){
        var deferred = $q.defer();
        postCall('user/register', user).then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function checkLogin(){
        var deferred = $q.defer();
        getCall('checkLogin').then(function(data){
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

});

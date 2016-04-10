desiderata.controller('bookTag',function($scope, $state, $http, $rootScope, $stateParams,serviceHelper){

    $scope.arrayProva = ['prova1', 'prova2', 'prova3'];
    $scope.selectedKeyWord = ['prova1'];
    $scope.selectedTag = ['prova2'];
    $scope.filters = [];
    $scope.taggedBooks = [];
    $rootScope.ontologyTags = [];

    if( (window.cordova && ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine ) && $rootScope.readOnline == true) || (!window.cordova && ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine )) ){
        serviceHelper.getKeywords("").then(function(response){
            if(response.error){
                console.log('errore nella getKeywords');
            }
            else{
                $rootScope.ontologyTags = response.data;
            }
        });
    }
    else{
      $scope.readingOffline = true;
    }

    $scope.textsFromTags = function(){
        $scope.taggedBooks = [];
        var topicsArray = [];
        $scope.filters.forEach(function(filter){
            topicsArray.push(filter.text);
        });
        var search = {
            "topics": topicsArray
        };

        serviceHelper.searchByTag(search).then(function(response){
            if(response.error){
              console.log("errore nela searchByTag");
            }
            else{
              console.log(response);
              for(var i=0; i < response.data.results.length; i++){
                  if(!response.data.results[i].title || response.data.results[i].title == ''){
                      response.data.results[i].title = 'Titolo';
                  }
                   if(!response.data.results[i].subtitle || response.data.results[i].subtitle == ''){
                      response.data.results[i].subtitle = 'Sottotitolo';
                  }
                  $scope.taggedBooks.push(response.data.results[i]);
              }
            }
        });
    }

    $scope.deleteApplicatedFilter = function(obj){
        console.log("filter deleted");
        for(var i=0; i<$scope.filters.length; i++){
            if($scope.filters[i].id == obj.id){
                $scope.filters.splice(i, 1);
            }
        }
        console.log($scope.filters);
        $scope.textsFromTags();
    }

    $scope.addTagtoFilter = function(obj){
        if($.inArray(obj, $scope.filters) == -1){
            $scope.filters.push(obj);
        }
        console.log($scope.filters);
        $scope.textsFromTags();
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

    $scope.goToContent = function(obj){
        if((!obj.isPdf && $stateParams.idBook != obj.publicationId) || (!obj.isPdf && $stateParams.idPar != obj.id)){
            $state.go('book',{'idBook': obj.publicationId, 'idPar' : obj.id});
        }
        else{
            if($stateParams.idBook != obj.publicationId || $stateParams.idPar != obj.id){
                $state.go('pdf',{'idBook': obj.publicationId, 'idPar' : obj.id});
            }
        }
    }
});

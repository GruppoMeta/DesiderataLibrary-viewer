desiderata.controller('bookIndex', bookIndexCtrl)
            .directive('fancyTree', function($parse) {
                  return {
                    restrict: 'E',
                    compile: function (element, attributes) {
                         var treeConfig = $parse(attributes.treeConfig);
                         return function (scope, element, attributes, controller) {
                            scope.$watch(treeConfig, function (value, old) {
                                if(value && value.source){
                                    var newElement = $('<div></div>');
                                    newElement.fancytree(value);
                                    element.html(newElement.html());
                                }
                            }, true);

                         };
                      }
                  }
                });


function bookIndexCtrl($scope, $state, $http, $stateParams, $state, $location, $timeout, $rootScope){
    $scope.treeStructure = null;
    var idDocument = $stateParams.idBook;

//    if( ( $state.is('bookDes.index') && typeof $rootScope.treeConfig === "undefined" ) ||
//        ( typeof $rootScope.treeConfig === "undefined" ||
//        ( typeof $rootScope.publicationIndex !== "undefined" && $rootScope.treeConfig.source != $rootScope.publicationIndex.structure[0] ) ) ){
//
//        $rootScope.treeConfig = {
//            extensions: ["glyph"],
//            source: $stateParams.indexTree,
//            activate: function(event, data){
//                if(!$state.is('bookDes.index')){
//                    $state.go($state.current.name, {idBook: $stateParams.idBook, idPar: data.node.data.id});
//                }
//                else{
//                    var i= 0;
//                    for(; i < data.node.parent.children.length; i++){
//                        if(data.node.data.id == data.node.parent.children[i].data.id){
//                            break;
//                        }
//                    }
//                    $state.go($state.current.name, {idBook: $stateParams.idBook, idPar: i});
//                }
//            },
//            glyph: {
//                map: {
//                doc: "fa fa-align-left",
//                expanderClosed: "fa fa-caret-right",
//                expanderOpen: "fa fa-caret-down",  // glyphicon-collapse-down
//                folder: "fa fa-folder-o",
//                folderOpen: "fa fa-folder-open-o",
//                loading: "glyphicon glyphicon-refresh"
//            }
//          }
//        }
//    }

  if(!$state.is('bookDes.index')){
      if( ( $state.is('bookDes.index') && typeof $rootScope.treeConfig === "undefined" ) ||
        ( typeof $rootScope.treeConfig === "undefined" ||
        ( typeof $rootScope.publicationIndex !== "undefined" && $rootScope.treeConfig.source != $rootScope.publicationIndex.structure[0] ) ) ){

        $rootScope.treeConfig = {
            extensions: ["glyph"],
            autoScroll: true,
            source: $stateParams.indexTree,
            activate: function(event, data){
              if(!data.node.folder){
                  if(!$state.is('bookDes.index')){
                      $state.go($state.current.name, {idBook: $stateParams.idBook, idPar: data.node.data.id});
                  }
                  else{
                      var i= 0;
                      for(; i < data.node.parent.children.length; i++){
                          if(data.node.data.id == data.node.parent.children[i].data.id){
                              break;
                          }
                      }
                      $state.go($state.current.name, {idBook: $stateParams.idBook, idPar: i});
                  }
              }
            },
            glyph: {
                map: {
                doc: "fa fa-align-left",
                expanderClosed: "fa fa-caret-right",
                expanderOpen: "fa fa-caret-down",  // glyphicon-collapse-down
                folder: "fa fa-folder-o",
                folderOpen: "fa fa-folder-open-o",
                loading: "glyphicon glyphicon-refresh"
            }
          }
        }
    }
  }
  else{
      if( ( $state.is('bookDes.index') && typeof $rootScope.treeConfig === "undefined" ) ||
        ( typeof $rootScope.treeConfig === "undefined" ||
        ( typeof $rootScope.publicationIndex !== "undefined" && $rootScope.treeConfig.source != $rootScope.publicationIndex.data.structure ) ) ){

        $rootScope.treeConfig = {
            extensions: ["glyph"],
            source: $stateParams.indexTree,
            activate: function(event, data){
              if(!data.node.folder){
                if(!$state.is('bookDes.index')){
                    $state.go($state.current.name, {idBook: $stateParams.idBook, idPar: data.node.data.id});
                }
                else{
                    var i= 0;
                    for(; i < data.node.parent.children.length; i++){
                        if(data.node.data.id == data.node.parent.children[i].data.id){
                            break;
                        }
                    }
                    $state.go($state.current.name, {idBook: $stateParams.idBook, idPar: i});
                }
              }
            },
            glyph: {
                map: {
                doc: "fa fa-align-left",
                expanderClosed: "fa fa-caret-right",
                expanderOpen: "fa fa-caret-down",  // glyphicon-collapse-down
                folder: "fa fa-folder-o",
                folderOpen: "fa fa-folder-open-o",
                loading: "glyphicon glyphicon-refresh"
            }
          }
        }
    }
  }

    if(!$state.is('bookDes.index')){
        if(typeof $rootScope.treeConfig === "undefined" || $rootScope.treeConfig.source != $rootScope.publicationIndex.structure[0]){
            $rootScope.treeConfig.source = $rootScope.publicationIndex.structure[0];
        }

        $timeout(function(){
          if(angular.element(':ui-fancytree').length){
            var nodeOfThisPage = angular.element(':ui-fancytree').fancytree('getTree').findAll(function(node){
                if(node.data.id == $stateParams.idPar){
                    return true;
                }
            });

            nodeOfThisPage[0].setActive();
            if(nodeOfThisPage.length > 0 && nodeOfThisPage[0].parent != null){
                var parentNode = nodeOfThisPage[0].parent;
                while(parentNode != null){
                    parentNode.setExpanded();
                    parentNode = parentNode.parent;
                }
            }
        }
      }, 1000);

    }
    else{
        if(typeof $rootScope.treeConfig === "undefined" || $rootScope.treeConfig.source != $rootScope.publicationIndex.structure){
            $rootScope.treeConfig.source = $rootScope.publicationIndex.data.structure; //cambiato structure con data.structure
        }

        $timeout(function(){
            $scope.idParToGo = 0;
            var nodeOfThisPage = angular.element(':ui-fancytree').fancytree('getTree').findAll(function(node){
                if(node.data.id == $rootScope.currentCap.id){
                    return true;
                }
                $scope.idParToGo++;
            });

            nodeOfThisPage[0].setActive();
            if(nodeOfThisPage.length > 0 && nodeOfThisPage[0].parent != null){
                var parentNode = nodeOfThisPage[0].parent;
                while(parentNode != null){
                    parentNode.setExpanded();
                    parentNode = parentNode.parent;
                }
            }

        }, 0);

    }

}

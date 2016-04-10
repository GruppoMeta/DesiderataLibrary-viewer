desiderata.controller('bookBookmarks', bookBookmarksCtrl)
            .directive('fancyTree', function($parse) {
                  return {
                    restrict: 'E',
                    compile: function (element, attributes) {console.log(attributes);
                         var treeConfig = $parse(attributes.treeConfig);
                         return function (scope, element, attributes, controller) {
                            scope.$watch(treeConfig, function (value, old) {
                                if(value && value.source){
                                    var newElement = angular.element('<div></div>');
                                    newElement.fancytree(value);
                                    element.html(newElement);
                                }
                            }, true);

                         };
                      }
                  }
                });


function bookBookmarksCtrl($scope, $rootScope, $state, $http, $stateParams, $location, serviceHelper){
    $scope.idBookOrPdf = ($stateParams.idBook) ? $stateParams.idBook : $stateParams.idPdf;

    if( (window.cordova && ( ( (navigator.connection && navigator.connection.type == "none") || !navigator.onLine ) || $rootScope.readOnline == false )) || (!window.cordova && ( (navigator.connection && navigator.connection.type == "none") || !navigator.onLine )) ){
        $scope.readingOffline = true;
    }

    $rootScope.$on('newBookmarkTreeNode', function (event, data) {
        console.log(data);
        $scope.treeBookmarkConfig.source = data;
        $rootScope.bookmarksTreeSource = data;
    });

    $scope.goToPageFromSidebar = function(isBook, volumeId, contentId){
        if((isBook && $stateParams.idBook != volumeId) || (isBook && $stateParams.idPar != contentId)){
            $state.go('book',{'idBook': volumeId, 'idPar' : contentId});
        }
        else{
            if($stateParams.idBook != volumeId || $stateParams.idPar != contentId){
                $state.go('pdf',{'idBook': volumeId, 'idPar' : contentId});
            }
        }
    }

    $scope.filterRoot = function(){
        //onsole.log(obj);
        return function(obj){
            console.log(obj);
            if(typeof $scope.search === 'undefined') return true;
            if($scope.search.paragraph == '') return true;
            return (obj.paragraph.toLowerCase()).search($scope.search.paragraph.toLowerCase()) == -1? false: true;
        }
    }

    $scope.callBookmarkTree = function(){
        serviceHelper.getAnnotationByVolume( $scope.idBookOrPdf ).then(function(response){
            if(response.error){
                console.log("Errore nella getAnnotationByVolume");
            }
            else{
                if(typeof response.length === "undefined" && response.type == "treeBookmark"){
                    $scope.treeBookmarkConfig.source = JSON.parse(response.data);
                }
                for(var i=0; i < response.data.length; i++){
                    if(response.data[i].type == "treeBookmark"){
                        $scope.treeBookmarkConfig.source = JSON.parse(response.data[i].data);
                    }
                }
            }
        });
    }
    $scope.callThisBookmark = function(){
        $rootScope.bookmarks = [];
        serviceHelper.getAnnotationByVolume( $scope.idBookOrPdf ).then(function(response){
            if(response.error){
                console.log("Errore nella getAnnotationByVolume");
            }
            else{
                if(typeof response.length === "undefined" && response.type == "bookmark"){
                    var parsedResponse = JSON.parse(response.data);
                    var tmpBookmark = [];
                    tmpBookmark.paragraph = parsedResponse.paragraph;
                    tmpBookmark.bookBookmark = parsedResponse.bookBookmark;
                    tmpBookmark.idBookmark = response.id;
                    tmpBookmark.volumeId = response.volume_id;
                    tmpBookmark.contentId = response.content_id;
                    tmpBookmark.isBook = parsedResponse.isBook;
                    $rootScope.bookmarks.push(tmpBookmark);
                }
                for(var i=0; i < response.data.length; i++){
                    if(response.data[i].type == "bookmark"){
                        var parsedResponse = JSON.parse(response.data[i].data);
                        var tmpBookmark = [];
                        tmpBookmark.paragraph = parsedResponse.paragraph;
                        tmpBookmark.bookBookmark = parsedResponse.bookBookmark;
                        tmpBookmark.idBookmark = response.data[i].id;
                        tmpBookmark.volumeId = response.data[i].volume_id;
                        tmpBookmark.contentId = response.data[i].content_id;
                        tmpBookmark.isBook = parsedResponse.isBook;
                        $rootScope.bookmarks.push(tmpBookmark);
                    }
                }
            }
        });
    };
    $scope.callAllBookmarks = function(){
            $rootScope.bookmarks = [];
            serviceHelper.getBookmark().then(function(response){
                if(response.error){
                    console.log("Errore nella getBookmark");
                }
                else{
                    console.log(response);
                    if(typeof response.data.length === "undefined"){
                        var parsedResponse = JSON.parse(response.data);
                        var tmpBookmark = [];
                        tmpBookmark.paragraph = parsedResponse.paragraph;
                        tmpBookmark.bookBookmark = parsedResponse.bookBookmark;
                        tmpBookmark.idBookmark = response.id;
                        tmpBookmark.volumeId = response.volume_id;
                        tmpBookmark.contentId = response.content_id;
                        tmpBookmark.isBook = parsedResponse.isBook;
                        $rootScope.bookmarks.push(tmpBookmark);
                    }
                    for(var i=0; i < response.data.length; i++){
                        var parsedResponse = JSON.parse(response.data[i].data);
                        var tmpBookmark = [];
                        tmpBookmark.paragraph = parsedResponse.paragraph;
                        tmpBookmark.bookBookmark = parsedResponse.bookBookmark;
                        tmpBookmark.idBookmark = response.data[i].id;
                        tmpBookmark.volumeId = response.data[i].volume_id;
                        tmpBookmark.contentId = response.data[i].content_id;
                        tmpBookmark.isBook = parsedResponse.isBook;
                        $rootScope.bookmarks.push(tmpBookmark);
                    }
                }
            });
    };
    $rootScope.bookmarks = [];
    $scope.allBookmarks = false;
    if($rootScope.bookmarks.length == 0){
        $scope.callThisBookmark();
    }
    $scope.callBookmarkTree();
    $scope.isListBookmarks = true;

    $scope.showListBookmarks = function(){
        $scope.callThisBookmark();
        $scope.isListBookmarks = true;
        $scope.allBookmarks = false;
    }
    $scope.showTreeBookmarks = function(){
        $scope.isListBookmarks = false;
        $scope.allBookmarks = false;
    }
    $scope.showAllBookmarks = function(){
        if($scope.allBookmarks == true){
            if($scope.isListBookmarks){
                $scope.callAllBookmarks();
            }
            else{
                //prendere il source contenente tutti i bookmarks (di tutti i libri)
            }
            $scope.allBookmarks = true;
        }
        else{
            $scope.callThisBookmark();
            $scope.allBookmarks = false;
        }
    }
    $scope.addFolderTree = function(){
        console.log("Vecchio Source");
        console.log( $scope.treeBookmarkConfig.source );
        $scope.tree = angular.element(':ui-fancytree').fancytree("getTree");
        console.log("rootNode");
        console.log($scope.tree.getRootNode());
        $scope.treeBookmarkConfig.source.push(
            {
                title: "NewFolder", folder: true, children: []
            }
        );

        var bookmarkTreeToSave = {
          "type": "treeBookmark",
          "data": JSON.stringify($scope.treeBookmarkConfig.source),
          "volume_id": $scope.idBookOrPdf.toString(),
          "content_id": $stateParams.idPar.toString()
        };

        if($rootScope.idResponseBookmarkTree == -1){
            serviceHelper.saveTreeBookmark( bookmarkTreeToSave ).then(function(response){
                if(response.error){
                    console.log("Errore nella saveTreeBookmark");
                }
                else{
                    console.log(response);
                    $rootScope.idResponseBookmarkTree = response.data.id;
                    $rootScope.$emit("addedFirstfolderToTree", response.data.id);
                    $rootScope.$emit("modifiedSourceTree", $scope.treeBookmarkConfig.source);
                }
            });
        }
        else{
            serviceHelper.updateTreeBookmark( $rootScope.idResponseBookmarkTree, bookmarkTreeToSave ).then(function(response){
                if(response.error){
                    console.log("Errore nella updateTreeBookmark");
                }
                else{
                    $rootScope.$emit("modifiedSourceTree", $scope.treeBookmarkConfig.source);
                }
            });
        }

        console.log( $scope.treeBookmarkConfig.source );
    }

        // Create the tree inside the <div id="tree"> element.
        $scope.treeBookmarkConfig ={
            extensions: ["glyph", "dnd", "edit"],
            activate: function(event, data){
                        console.log(data);
                        $scope.goToPageFromSidebar(data.node.data.isBook, data.node.data.volume_id, data.node.data.content_id);
            },
            source: [],
            dnd: {
                autoExpandMS: 400,
                draggable: {
                  zIndex: 1000,
                  scroll: false,
                  revert: "invalid"
                },
                preventVoidMoves: true,
                preventRecursiveMoves: true,
                dragStart: function(node, data) {
                    if(node.parent.children.length > 1){
                        node.parent.folder = true;
                    }
                    else{
                        node.parent.folder = false;
                    }
                    node.parent.renderStatus();
                  return true;
                },
                dragEnter: function(node, data) {
                  return true;
                },
                dragOver: function(node, data) {
                },
                dragLeave: function(node, data) {
                    console.log("LeaveDrag");
                    console.log($scope.treeBookmarkConfig.source);
                },
                dragStop: function(node, data) {
                     if(node.parent.children.length > 0){
                        node.parent.folder = true;
                    }
                    else{
                        node.parent.folder = false;
                    }
                    node.parent.renderStatus();
                    console.log("stopDrag");

                },
                dragDrop: function(node, data) {
                    data.otherNode.moveTo(node, data.hitMode);
                    if(node.children && node.children.length > 0 ){
                        node.folder = true;
                    }
                    else{
                        node.folder = false;
                    }
                    node.renderStatus();
                    updateTree(node.tree.toDict());
                }
            },
            renderNode: function (event, data) {
                var node = data.node;
                angular.element(node.span).find(".fa-trash").remove();
                var deleteButton =  angular.element('<i class="fa fa-trash right"></i>');
                angular.element(node.span).append(deleteButton);
                deleteButton.hide();
                deleteButton.click(function(){
                    console.log(node);
                    if(node.parent.children.length == 1){
                        node.parent.folder = false;
                    }
                    else{
                        node.parent.folder = true;
                    }
                    node.parent.renderStatus();
                    node.remove();
                });
                angular.element(node.span).hover(function () {
                   //deleteButton.show();
                }, function () {
                    deleteButton.hide();
                });
                if($scope.currentCollectionFolder && node.data.id == $scope.currentCollectionFolder.id){
                    node.setActive();
                }
                console.log("RenderNode");
                    console.log($scope.treeBookmarkConfig.source);
            },
            glyph: {
                map: {
                doc: "fa fa-bookmark",
                expanderClosed: "fa fa-caret-right",
                expanderOpen: "fa fa-caret-down",  // glyphicon-collapse-down
                folder: "fa fa-folder-o",
                folderOpen: "fa fa-folder-open-o",
                loading: "glyphicon glyphicon-refresh",
                dropMarker: "fa fa-arrow-right",
                }
            },
            // edit: {
            //     inputCss: {height: "22px", backgroundColor: "transparent", minWidth: "100%", border: "none"},
            //     triggerCancel: ["esc", "tab", "click"],
            //     triggerStart: ["f2", "dblclick", "shift+click", "mac+enter"],
            //     beforeEdit: function(event, data){
            //                     },
            //     edit: function(event, data){
            //                     },
            //     beforeClose: function(event, data){
            //                    },
            //     save: function(event, data){
            //                         data.node.title = data.input.val();
            //                         updateTree(data.node.tree.toDict());
            //                     },
            //     close: function(event, data){
            //                     }
            // },

        };

        function updateTree(treeSource){
            var bookmarkTreeToSave = JSON.stringify({
                      "type": "treeBookmark",
                      "data": JSON.stringify(treeSource),
                      "volume_id": $scope.idBookOrPdf.toString(),
                      "content_id": $stateParams.idPar.toString()
                    });
            serviceHelper.updateTreeBookmark( $rootScope.idResponseBookmarkTree, bookmarkTreeToSave ).then(function(response){
                if(response.error){
                    console.log("Errore nella updateTreeBookmark");
                }
                else{
                    console.log(response);
                }
                });
        }
};

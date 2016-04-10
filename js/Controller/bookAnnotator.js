desiderata.directive('bookAnnotator', function($timeout, $state, $stateParams, $http, $rootScope, $document, $localStorage, $modal, serviceHelper, $compile){
  return {
    restrict: 'E',
    scope: false,
    template: '<div id="bookText" class="col-md-11 text" ng-bind-html="bookText"></div>',
    link: function (scope, element, attributes){
      scope.$storage = $localStorage;
      scope.user = scope.$storage.user;

      scope.createAnnotation = function (annotation) {
        requestAnnotation = angular.copy(annotation);
        requestAnnotation.highlights = [];
        var annotationToSave = {
          "type": "highlighting",
          "data": JSON.stringify(requestAnnotation),
          "volume_id": $rootScope.idBookForAnnotation,
          "content_id": $rootScope.idParForAnnotation
        };
        if(window.cordova && !$rootScope.readOnline){
          if(!scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation]){
            scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation] = [];
          }
          var lastID = 0;
          scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].forEach(function(tmpAnnotation){
            if(tmpAnnotation.id >= lastID){
              lastID = tmpAnnotation.id;
            }
          });
          annotationToSave.id = ++lastID;
          annotation.id = annotationToSave.id;
          scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].push(annotationToSave);
          var annotationElement = angular.element(annotation.highlights[0]);
          annotationElement.attr("data-section-id", annotation.id);
          if(!$rootScope.highlightings){
            $rootScope.highlightings = [];
          }
          $rootScope.highlightings.push(annotation);
        }
        else{
          $http.post(DESIDERATA_CONFIG.base_url+'annotations/highlighting', JSON.stringify(annotationToSave),
            {headers: {'Content-Type': 'application/json'}}).then(function(response){
              annotation.id = response.data.id;
                var annotationElement = angular.element(annotation.highlights[0]);
                annotationElement.attr("data-section-id", annotation.id);
                annotationElement.addClass("commentable-section");
                scope.setupSideComment();
                annotationElement.find('.marker').click();
                if(!$rootScope.highlightings){
                  $rootScope.highlightings = [];
                }
                $rootScope.highlightings.push(annotation);
            });
        }
      };

      scope.updateAnnotation = function (annotation){
        if(annotation.id){
          var annotationToSave = {
            "type": "highlighting",
            "data": JSON.stringify(annotation),
            "volume_id": $rootScope.idBookForAnnotation,
            "content_id": $rootScope.idParForAnnotation,
          };
          if(window.cordova && !$rootScope.readOnline){
            annotationToSave.id = annotation.id;
            if(!scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation]){
              scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation] = [];
            }
            var annotationToRemove;
            scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].forEach(function(tmpAnnotation){
              if(tmpAnnotation.id == annotation.id){
                annotationToRemove = tmpAnnotation;
              }
            });
            if(annotationToRemove){
              var indexToRemove = scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].indexOf(annotationToRemove);
              scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].splice(indexToRemove, 1);
            }
            scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].push(annotationToSave);
          }
          else{
            $http.put(DESIDERATA_CONFIG.base_url+'annotations/highlighting/' + annotation.id, JSON.stringify(annotationToSave),
            {headers: {'Content-Type': 'application/json'}});
          }
        }
      };

      scope.deleteAnnotation = function (annotation) {
        if(annotation.id){
          if(window.cordova && !$rootScope.readOnline){
            if(!scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation]){
              scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation] = [];
            }
            var annotationToRemove;
            scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].forEach(function(tmpAnnotation){
              if(tmpAnnotation.id == annotation.id){
                annotationToRemove = tmpAnnotation;
              }
            });
            if(annotationToRemove){
              var indexToRemove = scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].indexOf(annotationToRemove);
              scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].splice(indexToRemove, 1);
            }
          }
          else{
            $http.delete(DESIDERATA_CONFIG.base_url+'annotations/highlighting/' + annotation.id,
            {headers: {'Content-Type': 'application/json'}})
            .success(function(response){
                $rootScope.highlightings.forEach(function(tmpHighlight, index){
                  if(tmpHighlight.id == annotation.id){
                    $rootScope.highlightings.splice(index, 1);
                  }
                });
            });
          }
        }
      };

      scope.beforeAddingComment = function (annotation) {
        scope.tempAnnotationRelativeToComment = annotation;
        var annotationElement = angular.element(annotation.highlights[0]);
        var sectionId = 0;
        angular.forEach(angular.element('.commentable-section'), function(value, key){
          var tempComment = angular.element(value);
          if(parseInt(tempComment.attr('data-section-id')) > sectionId){
            sectionId = parseInt(tempComment.attr('data-section-id'));
          }
        });
        sectionId++;
        annotationElement.attr("data-section-id", sectionId);
        annotationElement.addClass("commentable-section");
        resetScalePDFLayer();
        scope.setupSideComment();
        scalePDFLayer();
        angular.element('.side-comment[data-relative-id= ' + annotationElement.attr('data-section-id') + ']').addClass('active');
      };

      Annotator.Plugin.SavePlugin = function (element, param){
        return {
          pluginInit: function () {
            this.annotator
            .subscribe("annotationCreated", function (annotation){return scope.createAnnotation(annotation); })
            .subscribe("annotationEditorSubmit", function (editor){ return scope.updateAnnotation(editor.annotation); })
            .subscribe("annotationDeleted", function (annotation) { return scope.deleteAnnotation(annotation); })
            .subscribe("addingComment", function (annotation){return scope.beforeAddingComment(annotation); })
          },
          destroy: function(){
            this.annotator
            .unsubscribe("annotationCreated", function (annotation){return scope.createAnnotation(annotation); })
            .unsubscribe("annotationEditorSubmit", function (editor){ return scope.updateAnnotation(editor.annotation); })
            .unsubscribe("annotationDeleted", function (annotation) { return scope.deleteAnnotation(annotation); })
            .unsubscribe("addingComment", function (annotation){return scope.beforeAddingComment(annotation); })
          }
        }
      };
      scope.$watch(attributes.bookList, function (value){
        if(value){
          scope.bookText = value;
          $timeout(function(){
            element.find('a').each(function(){
              if($(this).attr('link') && $(this).attr('link').substr(0, 8)  == 'internal'){
                  var linkIDBook = $(this).attr('link').split(':')[1];
                  var linkIDPar = $(this).attr('link').split(':')[2];
                  $(this).attr('ng-click', 'fromIndexToPage(' + linkIDBook + ',' + linkIDPar + ')');
                  var fn = $compile($(this));
                  fn(scope);
              }
            });
          }, 500);
          angular.element(element).annotator();
          angular.element(element).annotator('addPlugin', 'SavePlugin');
          $timeout(function() {

            $rootScope.existingComments = [];
            $rootScope.highlightings = [];
            if(window.cordova && !$rootScope.readOnline){
              var response = scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation];
              scope.initializeSavedAnnotations(response);
            }
            else{
              $http.get(DESIDERATA_CONFIG.base_url+'annotations/byContent/'+$rootScope.idBookForAnnotation+"/"+$rootScope.idParForAnnotation)
              .success(function(response){
                scope.initializeSavedAnnotations(response);
              });
            }
          }, 0);
        }
      });

      scope.fromIndexToPage = function(idBook, idPar){
          $state.go("book", {"idBook" : idBook, "idPar" : idPar});
      }

      scope.initializeSavedAnnotations = function(response){
          if(response){
            if(typeof response.length === "undefined" && response.type == "comment"){
              var tempComment = JSON.parse(response.data)[0];
              tempComment.comments[0].id = response.id;
              var commentDate = new Date(response.updated_at);
              tempComment.comments[0].updated_at = commentDate.getHours() + ':' + commentDate.getMinutes();
              tempComment.id = response.id;
              tempComment.volume_id = response.volume_id;
              tempComment.content_id = response.content_id;
              $rootScope.existingComments.push(tempComment);
            }

            if(typeof response.length === "undefined" && response.type == "highlighting"){
              var newHighlighting = JSON.parse(response.data);
              newHighlighting.id = response.id;
              $rootScope.highlightings.push(newHighlighting);
            }

            for(var i=0; i < response.length; i++){
              if(response[i].type == "comment"){
                var tempComment = JSON.parse(response[i].data)[0];
                tempComment.comments[0].id = response[i].id;
                var commentDate = new Date(response[i].updated_at.replace(' ', 'T'));
                tempComment.comments[0].updated_at = commentDate.getHours() + ':' + commentDate.getMinutes();
                tempComment.id = response[i].id;
                tempComment.volume_id = response[i].volume_id;
                tempComment.content_id = response[i].content_id;
                $rootScope.existingComments.push(tempComment);
              }
              if(response[i].type == "highlighting"){
                var newHighlighting = JSON.parse(response[i].data);
                newHighlighting.id = response[i].id;
                $rootScope.highlightings.push(newHighlighting);
              }
            }
          }
          if($rootScope.highlightings.length){
            angular.element(element).annotator('loadAnnotations', angular.copy($rootScope.highlightings));
          }

          if($rootScope.existingComments.length){
            if(!$("#pdfPage1Cont").length){
              $timeout(function(){
                scope.setupSideComment();
              }, 1000);
            }
          }
          if($("#pdfPage1Cont").length){
            element.find('.annotator-hl').each(function(){
              $(this).addClass('no-color');
            })
            $timeout(function(){
              scope.setupSideComment();
              scalePDFLayer();
            }, 500);
        }
      }

      scope.removeCommentAnnotation = function(sectionId){
        if(window.cordova && !$rootScope.readOnline){
          var annotationToRemove;
          scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].forEach(function(tmpAnnotation){
            if(tmpAnnotation.id == sectionId){
              annotationToRemove = tmpAnnotation;
            }
          });
          if(annotationToRemove){
            var indexToRemove = scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].indexOf(annotationToRemove);
            scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].splice(indexToRemove, 1);
          }
          $rootScope.highlightings.forEach(function(highlight){
            if(highlight.id == sectionId){
              $rootScope.highlightings.splice($rootScope.highlightings.indexOf(highlight), 1);
              if(angular.element('span[data-annotation-id=' + highlight.id + ']').length){
                angular.element('span[data-annotation-id=' + highlight.id + ']').contents().unwrap();
              }
            }
          });
          angular.element(element).annotator('destroy');
          angular.element(element).annotator('addPlugin', 'SavePlugin');
          angular.element(element).annotator('loadAnnotations', angular.copy($rootScope.highlightings));
        }
        else{
          $http.delete(DESIDERATA_CONFIG.base_url+'annotations/highlighting/' + sectionId,
          {headers: {'Content-Type': 'application/json'}}).then(function(){
            $rootScope.highlightings.forEach(function(highlight){
              if(highlight.id == sectionId){
                $rootScope.highlightings.splice($rootScope.highlightings.indexOf(highlight), 1);
                if(angular.element('span[data-annotation-id=' + highlight.id + ']').length){
                  angular.element('span[data-annotation-id=' + highlight.id + ']').contents().unwrap();
                }
              }
            });
            angular.element(element).annotator('destroy');
            angular.element(element).annotator('addPlugin', 'SavePlugin');
            angular.element(element).annotator('loadAnnotations', angular.copy($rootScope.highlightings));
          });
        }
    };

      scope.setupSideComment = function (){
        if($rootScope.sideComments){
          $rootScope.sideComments.destroy();
          $rootScope.$$listeners.deleteComment = [];
          $rootScope.$$listeners.modifyComment = [];
        }
        var SideComments = require('side-comments');
        var currentUser = {
          id: 1,
          name: scope.user.firstName + ' ' + scope.user.lastName
        };

        $rootScope.sideComments = new SideComments('#commentable-area', currentUser, $rootScope.existingComments);
        if($rootScope.commentToOpen && angular.element('.side-comment[data-relative-id=' + $rootScope.commentToOpen.sectionId + ']').length){
          angular.element('.side-comment[data-relative-id=' + $rootScope.commentToOpen.sectionId + ']').addClass('active');
          angular.element('#bookScrolling').scrollTop(angular.element('.side-comment[data-relative-id=' + $rootScope.commentToOpen.sectionId + ']').offset().top - angular.element('#bookScrolling').offset().top - angular.element('#bookScrolling').height() / 2);
        }
        delete $rootScope.commentToOpen;
        $rootScope.$on('deleteComment', function (event, comment) {
          var sectionId = $rootScope.sideComments.removeComment(comment.id);
          scope.removeCommentAnnotation(comment.sectionId);
          $rootScope.sideComments.removeComment(comment.id);
        });
        $rootScope.$on('modifyComment', function (event, comment) {
          $rootScope.sideComments.insertComment(comment);
        });

        $rootScope.sideComments.on('commentPosted', function( comment ) {
          if(scope.tempAnnotationRelativeToComment){
            scope.tempAnnotationRelativeToComment.color = 'comment';
          }
          requestAnnotation = angular.copy(scope.tempAnnotationRelativeToComment);
          requestAnnotation.highlights = [];
          var annotationToSave = {
            "type": "highlighting",
            "data": JSON.stringify(requestAnnotation),
            "volume_id": $rootScope.idBookForAnnotation,
            "content_id": $rootScope.idParForAnnotation
          };
          if(window.cordova && !$rootScope.readOnline){
            if(!scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation]){
              scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation] = [];
            }
            var lastID = 0;
            scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].forEach(function(tmpAnnotation){
              if(tmpAnnotation.id >= lastID){
                lastID = tmpAnnotation.id;
              }
            });
            scope.tempAnnotationRelativeToComment.id = ++lastID;
            annotationToSave.id = scope.tempAnnotationRelativeToComment.id;
            scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].push(annotationToSave);
            var annotationElement = angular.element(scope.tempAnnotationRelativeToComment.highlights[0]);
            annotationElement.attr("data-section-id", scope.tempAnnotationRelativeToComment.id);
            comment.oldSectionId = comment.sectionId;
            comment.sectionId = scope.tempAnnotationRelativeToComment.id;
            var newComment = [];
            newComment.push(
              {
                "sectionId": scope.tempAnnotationRelativeToComment.id.toString(),
                "comments": [
                  {
                    "authorName": comment.authorName,
                    "comment": comment.comment,
                    "id": comment.id.toString(),
                    "sectionId": scope.tempAnnotationRelativeToComment.id.toString()
                  }
                ]
              });

              var annotationToSave = {
                "type": "comment",
                "data": JSON.stringify(newComment),
                "user_id": comment.authorName,
                "volume_id": $rootScope.idBookForAnnotation,
                "content_id": $rootScope.idParForAnnotation,
                "updated_at": (new Date()).getFullYear() + '-' + ("0" + new Date().getMonth()).slice(-2) + '-' + ("0" + new Date().getDate()).slice(-2) + ' ' + ("0" + new Date().getHours()).slice(-2) + ':' +  ("0" + new Date().getMinutes()).slice(-2) + ':' + ("0" + new Date().getSeconds()).slice(-2)
              };
              var lastID = 0;
              scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].forEach(function(tmpAnnotation){
                if(tmpAnnotation.id >= lastID){
                  lastID = tmpAnnotation.id;
                }
              });
              annotationToSave.id = ++lastID;

              scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].push(annotationToSave);
              comment.id = annotationToSave.id;
              var commentDate = new Date(annotationToSave.updated_at);
              $rootScope.sideComments.insertComment(comment);
              var tempComment = JSON.parse(annotationToSave.data)[0];
              tempComment.comments[0].id = annotationToSave.id;
              tempComment.comments[0].updated_at = ("0" + new Date().getHours()).slice(-2) + ':' +  ("0" + new Date().getMinutes()).slice(-2);
              tempComment.id = annotationToSave.id;
              tempComment.volume_id = annotationToSave.data.volume_id;
              tempComment.content_id = annotationToSave.data.content_id;
              $rootScope.existingComments.push(tempComment);
              if($rootScope.existingCommentsSidebar){
                  $rootScope.existingCommentsSidebar.push(tempComment);
                  scope.$apply();
              }
              annotationElement.removeClass('annotator-hl-temporary');
              annotationElement.removeClass('annotator-hl');
              $rootScope.highlightings.push(scope.tempAnnotationRelativeToComment);
              angular.element(element).annotator('destroy');
              angular.element(element).annotator('addPlugin', 'SavePlugin');
              angular.element(element).annotator('loadAnnotations', angular.copy($rootScope.highlightings));
              scope.tempAnnotationRelativeToComment = null;
          }
          else{
            $http.post(DESIDERATA_CONFIG.base_url+'annotations/highlighting', JSON.stringify(annotationToSave),
            {headers: {'Content-Type': 'application/json'}})
            .then(function(response){
              scope.tempAnnotationRelativeToComment.id = response.data.id;
              var annotationElement = angular.element(scope.tempAnnotationRelativeToComment.highlights[0]);
              annotationElement.attr("data-section-id", scope.tempAnnotationRelativeToComment.id);
              comment.oldSectionId = comment.sectionId;
              comment.sectionId = scope.tempAnnotationRelativeToComment.id;
              var newComment = [];
              newComment.push(
                {
                  "sectionId": scope.tempAnnotationRelativeToComment.id.toString(),
                  "comments": [
                    {
                      "authorName": comment.authorName,
                      "comment": comment.comment,
                      "id": comment.id.toString(),
                      "sectionId": scope.tempAnnotationRelativeToComment.id.toString()
                    }
                  ]
                });

                var annotationToSave = JSON.stringify({
                  "type": "comment",
                  "data": JSON.stringify(newComment),
                  "user_id": comment.authorName,
                  "volume_id": $rootScope.idBookForAnnotation,
                  "content_id": $rootScope.idParForAnnotation
                });

                $http.post(DESIDERATA_CONFIG.base_url+'annotations/comment', annotationToSave,
                {headers: {'Content-Type': 'application/json'}})
                .then(function(response){
                  comment.id = response.data.id;
                  var commentDate = new Date(response.data.updated_at.replace(' ', 'T'));
                  comment.updated_at = commentDate.getHours() + ':' + commentDate.getMinutes();
                  $rootScope.sideComments.insertComment(comment);
                  var tempComment = JSON.parse(response.data.data)[0];
                  tempComment.comments[0].id = response.data.id;
                  tempComment.comments[0].updated_at = commentDate.getHours() + ':' + commentDate.getMinutes();
                  tempComment.id = response.data.id;
                  tempComment.volume_id = response.data.volume_id;
                  tempComment.content_id = response.data.content_id;
                  $rootScope.existingComments.push(tempComment);
                  if($rootScope.existingCommentsSidebar){
                      $rootScope.existingCommentsSidebar.push(tempComment);
                  }
                  annotationElement.removeClass('annotator-hl-temporary');
                  annotationElement.removeClass('annotator-hl');
                  $rootScope.highlightings.push(scope.tempAnnotationRelativeToComment);
                  angular.element(element).annotator('destroy');
                  angular.element(element).annotator('addPlugin', 'SavePlugin');
                  angular.element(element).annotator('loadAnnotations', angular.copy($rootScope.highlightings));
                  scope.tempAnnotationRelativeToComment = null;
                });
              });
            }
            });

            $rootScope.sideComments.on('commentUpdated', function(comment){
              if(window.cordova && !$rootScope.readOnline){
                var newComment = [];
                newComment.push(
                  {
                    "sectionId": comment.sectionId.toString(),
                    "comments": [
                      {
                        "authorName": comment.authorName,
                        "comment": comment.comment,
                        "id": comment.id.toString(),
                        "sectionId": comment.sectionId
                      }
                    ]
                  });
                scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].forEach(function(tmpAnnotation){
                  if(tmpAnnotation.id == comment.id){
                    tmpAnnotation.data = JSON.stringify(newComment);
                    tmpAnnotation.user_id = comment.authorName;
                    tmpAnnotation.updated_at = (new Date()).getFullYear() + '-' + ("0" + new Date().getMonth()).slice(-2) + '-' + ("0" + new Date().getDate()).slice(-2) + ' ' + ("0" + new Date().getHours()).slice(-2) + ':' +  ("0" + new Date().getMinutes()).slice(-2) + ':' + ("0" + new Date().getSeconds()).slice(-2);
                  }
                });
                $rootScope.sideComments.insertComment(comment);
                if($rootScope.existingCommentsSidebar){
                  $rootScope.existingCommentsSidebar.forEach(function(sidebarComment, index){
                    if(sidebarComment.id == comment.id){
                      sidebarComment.comments = newComment[0].comments;
                      sidebarComment.comments[0].updated_at = ("0" + new Date().getHours()).slice(-2) + ':' + ("0" + new Date().getMinutes()).slice(-2);
                      scope.$apply();
                    }
                  });
                }
              }
              else{
                $http.delete(DESIDERATA_CONFIG.base_url+'annotations/comment/' + comment.id)
                .success(function(){
                    var oldId = comment.id;
                    var newComment = [];
                    newComment.push(
                      {
                        "sectionId": comment.sectionId.toString(),
                        "comments": [
                          {
                            "authorName": comment.authorName,
                            "comment": comment.comment,
                            "id": comment.id.toString(),
                            "sectionId": comment.sectionId
                          }
                        ]
                      });
                      var annotationToSave = JSON.stringify({
                        "type": "comment",
                        "data": JSON.stringify(newComment),
                        "user_id": comment.authorName,
                        "volume_id": $rootScope.idBookForAnnotation,
                        "content_id": $rootScope.idParForAnnotation
                      });

                      $http.post(DESIDERATA_CONFIG.base_url+'annotations/comment', annotationToSave,
                      {headers: {'Content-Type': 'application/json'}})
                      .then(function(response){
                        comment.id = response.data.id;
                        var commentDate = new Date(response.data.updated_at.replace(' ', 'T'));
                        comment.updated_at = commentDate.getHours() + ':' + commentDate.getMinutes();
                        $rootScope.sideComments.insertComment(comment);
                        var tempComment = JSON.parse(response.data.data)[0];
                        tempComment.comments[0].id = response.data.id;
                        tempComment.comments[0].updated_at = commentDate.getHours() + ':' + commentDate.getMinutes();
                        tempComment.id = response.data.id;
                        tempComment.volume_id = response.data.volume_id;
                        tempComment.content_id = response.data.content_id;
                        $rootScope.existingComments.push(tempComment);
                        if($rootScope.existingCommentsSidebar){
                          $rootScope.existingCommentsSidebar.push(tempComment);
                        }
                        $rootScope.sideComments.removeComment(oldId);
                        if($rootScope.existingCommentsSidebar){
                          $rootScope.existingCommentsSidebar.forEach(function(sidebarComment, index){
                            if(parseInt(sidebarComment.id) == parseInt(oldId)){
                              $rootScope.existingCommentsSidebar.splice(index, 1);
                            }
                          });
                        }
                      });
                    });
              }

          });
          $rootScope.sideComments.on('commentDeleted', function( commentId ) {
            if(window.cordova && !$rootScope.readOnline){
              var annotationToRemove;
              scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].forEach(function(tmpAnnotation){
                if(tmpAnnotation.id == commentId){
                  annotationToRemove = tmpAnnotation;
                }
              });
              if(annotationToRemove){
                var indexToRemove = scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].indexOf(annotationToRemove);
                scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].splice(indexToRemove, 1);
              }
              var sectionId = $rootScope.sideComments.removeComment(commentId);
              for(var i=0; i < $rootScope.existingComments.length; i++){
                if($rootScope.existingComments[i].id == commentId){
                  $rootScope.existingComments.splice(i, 1);
                }
              }
              if($rootScope.existingCommentsSidebar){
                $rootScope.existingCommentsSidebar.forEach(function(sidebarComment, index){
                  if(sidebarComment.id == commentId){
                    $rootScope.existingCommentsSidebar.splice(index, 1);
                    scope.$apply();
                  }
                });
              }
              scope.removeCommentAnnotation(sectionId);
            }
            else{
              $http.delete(DESIDERATA_CONFIG.base_url+'annotations/comment/' + commentId)
              .success(function(response){
                var sectionId = $rootScope.sideComments.removeComment(commentId);
                for(var i=0; i < $rootScope.existingComments.length; i++){
                  if($rootScope.existingComments[i].id == commentId){
                    $rootScope.existingComments.splice(i, 1);
                  }
                }
                if($rootScope.existingCommentsSidebar){
                  $rootScope.existingCommentsSidebar.forEach(function(sidebarComment, index){
                    if(sidebarComment.id == commentId){
                      $rootScope.existingCommentsSidebar.splice(index, 1);
                    }
                  });
                }
                scope.removeCommentAnnotation(sectionId);
              });
            }
          });
        }

        scope.$watch(attributes.hotSpots, function (hotSpots, old){
          $timeout(function () {
            if(hotSpots){
                hotSpots.forEach(function(hotSpot){
                    var newHtmlHotSpot = $('<div class="hotSpot"></div>');
                    newHtmlHotSpot.attr('title',hotSpot.description);
                    newHtmlHotSpot.css({
                                        'top': hotSpot.top + 'px',
                                        'left': hotSpot.left + 'px',
                                        'width': hotSpot.width + 'px',
                                        'height': hotSpot.height + 'px'
                                      });
                    if(hotSpot.form == 'rect'){
                      newHtmlHotSpot.addClass('rect');
                    }
                    else if(hotSpot.form == 'circle'){
                      newHtmlHotSpot.addClass('circle');
                    }

                    if(hotSpot.type == 'link'){
                      newHtmlHotSpot.click(function(){
                          $state.go($state.current.name,{'idBook': $stateParams.idBook, 'idPar' : hotSpot.src});
                      });
                    }
                    else if(hotSpot.type == 'linkEx'){
                      newHtmlHotSpot.click(function(){
                          window.open(hotSpot.src, '_blank');
                      });
                    }
                    else if(hotSpot.type == 'tooltip'){
                        newHtmlHotSpot.attr('data-toggle','tooltip');
                    }
                    else if(hotSpot.type == 'linkMedia'){
                      if(hotSpot.mediaType == 'IMAGE'){
                          newHtmlHotSpot.click(function(){
                            var modalObj = {};
                            modalObj.title = hotSpot.mediaTitle;
                            modalObj.image = hotSpot.src;
                            var modalInstance = $modal.open({
                              animation: true,
                              templateUrl: 'imgHotSpot.html',
                              controller: 'HotSpotCtrl',
                              size: 'lg',
                              resolve: {
                                obj: function () {
                                  return modalObj;
                                }
                              }
                            });
                          });

                      }
                      else if(hotSpot.mediaType == 'AUDIO'){
                          newHtmlHotSpot.click(function(){
                            var modalObj = {};
                            modalObj.title = hotSpot.mediaTitle;
                            modalObj.audio = hotSpot.src;
                            var modalInstance = $modal.open({
                              animation: true,
                              templateUrl: 'audioHotSpot.html',
                              controller: 'HotSpotCtrl',
                              size: 'lg',
                              resolve: {
                                obj: function () {
                                  return modalObj;
                                }
                              }
                            });
                          });

                      }
                      else if(hotSpot.mediaType == 'VIDEO'){
                          newHtmlHotSpot.click(function(){
                            var modalObj = {};
                            modalObj.title = hotSpot.mediaTitle;
                            modalObj.video = hotSpot.src;
                            var modalInstance = $modal.open({
                              animation: true,
                              templateUrl: 'videoHotSpot.html',
                              controller: 'HotSpotCtrl',
                              size: 'lg',
                              resolve: {
                                obj: function () {
                                  return modalObj;
                                }
                              }
                            });
                          });

                      }
                    }
                    angular.element(element).children().children().children().append(newHtmlHotSpot);
                    $('[data-toggle="tooltip"]').tooltip()
                });
            }
          }, 1000);
        });


        document.addEventListener("deviceready", function () {
            var items = [];
            var annotator = {
                   'name': 'Annota',
                   'action': 'onAnnotationText'
            };
           items.push(annotator);
           cordova.exec(
               function(response) {
                   cordova.plugins.Keyboard.close();
                   $(document).trigger('WebMenuPluginTouch');
               },
               function(err) {
                   $log.error(err);
               },
               'WebMenuPlugin', 'configureItems', items
            );

        }, false);

        scope.isZoom = false;
        if('ontouchstart' in document.documentElement){
          element.unbind('swipeleft');
          element.unbind('swiperight');
          element.unbind('tap');
          element.bind('swipeleft', function(event){
            if(!scope.isZoom){
              $rootScope.$broadcast('SwipeLeft');
            }
          });
          element.bind('swiperight', function(event){
            if(!scope.isZoom){
              $rootScope.$broadcast('SwipeRight');
            }

          });
          element.bind('tap', function(event){
              $rootScope.$broadcast('CloseSideBar');
          });
          if($('#pdfZoom').length){
            $('#pdfZoom').panzoom({
              minScale: 1,
              contain: 'invert',
              onEnd: function(e, panzoom){
                //console.log(e);
                if(panzoom.getMatrix()[0] != 1){
                  scope.isZoom = true;
                }
                else{
                  scope.isZoom = false;
                }
              }
            });
          }
        }
        $(window).off('resize');
        $(window).on('resize', scalePDFLayer);
        function scalePDFLayer(){
            if($('#pdfPage1Cont').length){
              element.css('transform', 'scale(' + ($('#pdfPage1Cont').find('img').width() / $('#pdfPage1Cont').find('img').get(0).naturalWidth) + ')');
              $('.comments-container').css('transform', 'scale(' + ($('#pdfPage1Cont').find('img').width() / $('#pdfPage1Cont').find('img').get(0).naturalWidth) + ')');
              element.find('.annotator-hl').each(function(){
                $(this).removeClass('no-color');
              });
              if(scope.oldPdfTransform){
                $('#pdfZoom').css('transform', scope.oldPdfTransform);
              }
            }
        }

        function resetScalePDFLayer(){
            if($('#pdfPage1Cont').length){
              element.css('transform', 'scale(1)');
              $('.comments-container').css('transform', 'scale(1)');
              scope.oldPdfTransform =  $('#pdfZoom').css('transform');
              $('#pdfZoom').css('transform', 'none');
            }
        }
      }
    }

  });

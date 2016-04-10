desiderata.controller('bookComments',function($scope, $rootScope, $http, $stateParams, $timeout, $state, $localStorage, serviceHelper){
    $scope.$storage = $localStorage;
    $rootScope.existingCommentsSidebar= [];
    $scope.modifyng = false;

    $scope.initializeComments = function(response){
      if(typeof response.length === "undefined" && response.type == "comment"){
          var tempComment = JSON.parse(response.data)[0];
          tempComment.comments[0].id = response.id;
          tempComment.id = response.id;
          tempComment.volume_id = response.volume_id;
          tempComment.content_id = response.content_id;
          tempComment.comments[0].updated_at = new Date(response.updated_at.replace(" ", "T")).getHours() + ':' + new Date(response.updated_at.replace(" ", "T")).getMinutes();
          $rootScope.existingCommentsSidebar.push(tempComment);
      }
      for(var i=0; i < response.length; i++){
          if(response[i].type == "comment"){
              var tempComment = JSON.parse(response[i].data)[0];
              tempComment.comments[0].id = response[i].id;
              tempComment.id = response[i].id;
              tempComment.volume_id = response[i].volume_id;
              tempComment.content_id = response[i].content_id;
              tempComment.comments[0].updated_at = new Date(response[i].updated_at.replace(" ", "T")).getHours() + ':' + new Date(response[i].updated_at.replace(" ", "T")).getMinutes();
              $rootScope.existingCommentsSidebar.push(tempComment);
          }
      }
    }

    if(window.cordova && !$rootScope.readOnline){
      var response = $scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation];
      $scope.initializeComments(response);
    }
    else{
        serviceHelper.getAnnotationByVolume( $rootScope.idBookForAnnotation ).then(function(response){
          if(response.error){
            console.log('Errore nella getAnnotationByVolume');
          }
          else{
            $scope.initializeComments(response.data);
          }
        });
    }

    $scope.deleteComment =  function(comment){
      if(window.cordova && !$rootScope.readOnline){
        var annotationToRemove;
        $scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].forEach(function(tmpAnnotation){
          if(tmpAnnotation.id == comment.comments[0].id){
            annotationToRemove = tmpAnnotation;
          }
        });
        if(annotationToRemove){
          var indexToRemove = $scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].indexOf(annotationToRemove);
          $scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].splice(indexToRemove, 1);
        }
        $rootScope.existingCommentsSidebar.splice($rootScope.existingCommentsSidebar.indexOf(comment), 1);
        $rootScope.$emit('deleteComment', comment);
      }
      else{
          serviceHelper.deleteAnnotation('comment', comment.comments[0].id ).then(function(response){
            if(response.error){
              console.log('Errore nella delete Comments');
            }
            else{
              $rootScope.existingCommentsSidebar.splice($rootScope.existingCommentsSidebar.indexOf(comment), 1);
              $rootScope.$emit('deleteComment', comment);
            }
          });
      }
    }

    $scope.goToComment = function(comment){
      if(angular.element('.side-comment[data-relative-id=' + comment.sectionId + ']').length){
        angular.element('.side-comment[data-relative-id=' + comment.sectionId + ']').addClass('active');
        angular.element('#bookScrolling').scrollTop(angular.element('.side-comment[data-relative-id=' + comment.sectionId + ']').offset().top - angular.element('#bookScrolling').offset().top - angular.element('#bookScrolling').height() / 2);
      }
      else{
        $rootScope.commentToOpen = comment;
        $state.go($state.current.name, {'idBook' : comment.volume_id, 'idPar' : comment.content_id});
      }

    }


    $scope.modifyComment = function(comment){
        if($scope.modifyng == false){
            angular.element("#inputComment"+comment.comments[0].id).removeAttr('disabled');
            angular.element("#inputComment"+comment.comments[0].id).focus();
            angular.element("#modifyCommentSidebar"+comment.comments[0].id).text("Fine");
            $scope.modifyng = true;
        }
        else{
            var newComment = [];
            newComment.push(
                {
                    "sectionId": comment.comments[0].sectionId.toString(),
                    "comments": [
                        {
                            "authorName": comment.comments[0].authorName,
                            "comment": angular.element("#inputComment"+comment.comments[0].id).val(),
                            "id": comment.comments[0].id.toString(),
                            "sectionId": comment.comments[0].sectionId
                        }
                    ]
                });


            if(window.cordova && !$rootScope.readOnline){
              $scope.$storage['annotation_' + $rootScope.idBookForAnnotation + '_' + $rootScope.idParForAnnotation].forEach(function(tmpAnnotation){
                if(tmpAnnotation.id == comment.comments[0].id){
                  tmpAnnotation.data = JSON.stringify(newComment);
                  tmpAnnotation.user_id = comment.authorName;
                  tmpAnnotation.updated_at = updated_at = (new Date()).getFullYear() + '-' + ((new Date().getMonth()) + 1) + '-' + (new Date()).getDate() + ' ' + (new Date()).getHours() + ':' +  (new Date()).getMinutes() + ':' + (new Date()).getSeconds();
                }
              });
              angular.element("#inputComment"+comment.comments[0].id).attr('disabled', "disabled");
              angular.element("#modifyCommentSidebar"+comment.comments[0].id).text("Modifica");
              $rootScope.$emit('modifyComment', comment.comments[0]);
              $scope.modifyng = false;
            }
            else{
                var annotationToSave = {
                  "type": "comment",
                  "data": JSON.stringify(newComment),
                  "user_id": comment.authorName,
                  "volume_id": $rootScope.idBookForAnnotation,
                  "content_id": $rootScope.idParForAnnotation
                };
                serviceHelper.putAnnotation('comment', comment.comments[0].id, annotationToSave ).then(function(response){
                  if(response.error){
                    console.log('Errore nella put Comments');
                  }
                  else{
                    angular.element("#inputComment"+comment.comments[0].id).attr('disabled', "disabled");
                    angular.element("#modifyCommentSidebar"+comment.comments[0].id).text("Modifica");
                    $rootScope.$emit('modifyComment', JSON.parse(response.data.data)[0].comments[0]);
                    $scope.modifyng = false;
                  }
              });
            }

        }
    }

});

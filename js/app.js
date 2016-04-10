var db = null;
var desiderata = angular.module('desiderata', ['HTMLTemplates', 'ui.router', 'ui.bootstrap', 'ui.select', 'angularSpinner', 'uiGmapgoogle-maps', 'angularUtils.directives.dirPagination', 'ngDroplet', 'ngFileUpload', 'ngStorage']);


desiderata.config(['usSpinnerConfigProvider', function (usSpinnerConfigProvider) {
    usSpinnerConfigProvider.setDefaults({color: 'rgb(177, 32, 49)'});
}]);

desiderata.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        v: '3.20',
        libraries: 'weather,geometry,visualization'
    });
});

desiderata.run(['$rootScope', '$state', '$stateParams', '$timeout', function($rootScope, $state, $scope, $timeout){
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        if(fromState.name != "" && fromState.name != "logout" && fromState.name != "login"){
            $state.previous = fromState.name.split(".")[0];
            $state.previousIdBook = fromParams.idBook;
            $state.previousIdPar = fromParams.idPar;
        }
        var currentState = $state.$current.name;
        if( currentState.indexOf(".index") != -1 ){
          $rootScope.indexTreeOpened = true;
        }
        else{
          $rootScope.indexTreeOpened = false;
        }

        $timeout(function(){
          $rootScope.alreadyKeyDown = false;
        }, 1000);
    });

    $(document).on("tap", function (event) {
        var clickover = $(event.target);
        var _opened = $(".navbar-collapse").hasClass("navbar-collapse collapse in");
        if (_opened === true && !clickover.hasClass("navbar-toggle") && !clickover.hasClass("elementInCollapseNavbar")) {
            $("button.navbar-toggle").click();
        }
    });

    if(!window.cordova){
      $(document).keyup(function(e) {

        $scope.goNextKeyDown = function(){
          if( ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine ) || !$rootScope.readOnline ){
              if($rootScope.bookInfoForKeyDown.nextId != 0){
                $rootScope.getNewPublicationIndex = false;
                $state.go($state.current.name, {idBook : $rootScope.bookInfoForKeyDown.pubId, idPar : $rootScope.bookInfoForKeyDown.nextId});
              }
          }
          else{
            //$scope.openNoConnectionModal();
          }
        }

        $scope.goPrevKeyDown = function(){
          if( ( (navigator.connection && navigator.connection.type != "none") || navigator.onLine ) || !$rootScope.readOnline ){
            if($rootScope.bookInfoForKeyDown.prevId != 0){
              $rootScope.getNewPublicationIndex = false;
              $state.go($state.current.name, {idBook : $rootScope.bookInfoForKeyDown.pubId, idPar : $rootScope.bookInfoForKeyDown.prevId});
            }
          }
          else{
            //$scope.openNoConnectionModal();
          }
        }

        switch(e.which) {
            case 37: // left
              if( (($state.current.name).indexOf("pdf") != -1 || ($state.current.name).indexOf("book") != -1) && !$rootScope.alreadyKeyDown ){
                $rootScope.alreadyKeyDown = true;
                $scope.goPrevKeyDown();
              }
            break;

            case 39: // right
              if( (($state.current.name).indexOf("pdf") != -1 || ($state.current.name).indexOf("book") != -1) && !$rootScope.alreadyKeyDown ){
                $rootScope.alreadyKeyDown = true;
                $scope.goNextKeyDown();
              }
            break;

            default: return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
      });
    };
}]);

desiderata.config( function( $stateProvider, $urlRouterProvider, $httpProvider ){

    $httpProvider.defaults.withCredentials = true;

    $urlRouterProvider.otherwise("/dashboard/");

    $stateProvider
    .state('dashboard', {
      url: "/dashboard/:toDesiderata",
      templateUrl: "01a_libreria.html",
      controller: "library",
      resolve:{
          bookList: function( $http, $state, $window, serviceHelper, $localStorage, $rootScope ){
              var temp = [];
              if( ((navigator.connection && navigator.connection.type == "none") || !navigator.onLine ) ){
                  $rootScope.noOnline = true;
                  return temp;
              }
              else{
                return serviceHelper.getLibrary().then(function(response){
                    if(response.error){
                        console.log("Errore nella getLibrary");
                        if(response.error == 401){
                            $state.go('login');
                        }
                        else{
                            $state.go('error');
                        }
                    }
                    else{
                      console.log(response);
                      if( Object.prototype.toString.call( response.data ) !== '[object Array]' ) {
                          temp.push(response.data);
                      }
                      else{
                          temp = response.data;
                      }

                      return temp;
                    }
                });
            }
          }
      }
    })
    .state('login', {
      url: "/login",
      templateUrl: "login.html",
      controller: "login",
      resolve:{
        isLogged: function($http, $state, $rootScope, serviceHelper){
          return serviceHelper.checkLogin().then(function(response){
              if(response.error){
                console.log('errore nella checkLogin');
                $state.previous = "login";
                if(response.error == 401){
                    return false;
                }
                else{
                    $state.go('error');
                }
              }
            else{
                return true;
            }
          })
        }
      }
    })
    .state('logout', {
      url: "/logout",
      templateUrl: "login.html",
      controller: "logout"
    })
    .state('error', {
      url: "/error",
      templateUrl: "error.html",
      controller: "error"
    })
    .state('registration', {
      url: "/registration",
      templateUrl: "registration.html",
      controller: "registration"
    })
    .state('recoverPassword', {
      url: "/password-recovery",
      templateUrl: "recoverPassword.html",
      controller: "recoverPassword",
      resolve:{
        isLogged: function($http, $state, $rootScope, serviceHelper){
            return serviceHelper.checkLogin().then(function(response){
              if(response.error){
                console.log('errore nella checkLogin');
                $state.previous = "recoverPassword";
                if(response.error == 401){
                    return false;
                }
                else{
                    $state.go('error');
                }
              }
            else{
                return true;
            }
          })
        }
      }
    })
    .state('profile', {
      url: "/profile",
      templateUrl: "profile.html",
      controller: "profile",
      resolve:{
        isLogged: function($http, $state, $rootScope, serviceHelper){
              if(!( (navigator.connection && (navigator.connection.type != "none" )) || navigator.onLine )){
                        return true;
                    }
            return serviceHelper.checkLogin().then(function(response){
                if(response.error){
                  console.log('errore nella checkLogin');
                  $state.previous = "profile";
                  if(response.error == 401){
                      return false;
                  }
                  else{
                      $state.go('error');
                  }
                }
              else{
                  return true;
              }
            })
        }
      }
    })
    .state('help', {
      url: "/help",
      templateUrl: "help.html",
      controller: "help"
    })
    .state('map', {
      url: "/map/:latitude/:longitude/:bookOrPdf/:idBook/:idPar",
      templateUrl: "map.html",
      controller: "map"
    })
    .state('cart', {
      url: "/cart/:error",
      templateUrl: "cart.html",
      controller: "cart"
    })
    .state('confirmPayment', {
      url: "/confirmPayment",
      templateUrl: "confirmPayment.html",
      controller: "confirmPayment"
    })
    .state('collection', {
      url: "/collection",
      templateUrl: "collection.html",
      controller: "collection"
    })
    .state('book', {
      url: "/book/:idBook/:idPar/",
      templateUrl: "03_bookmark.html",
      controller: "book",
      resolve:{
          bookInfo: function( $http, $stateParams, $q, $state, $rootScope, serviceHelper ){
                return serviceHelper.getContentBookPdf($stateParams.idBook, $stateParams.idPar).then(function(response){
                        if(response.error){
                            console.log("Errore nella getContentBookPdf");
                            $state.previous = "book";
                            $state.previousIdBook = $stateParams.idBook;
                            $state.previousIdPar = $stateParams.idPar;
                            if(response.error == 401){
                                $state.go('login');
                            }
                            else{
                                $state.go('error');
                            }
                        }
                        else if(response.data){
                          return response.data;
                        }
                        else{
                          return response;
                        }
                    });
            },
        publicationIndex: function( $http, $stateParams, $rootScope, serviceHelper ){console.log($rootScope.getNewPublicationIndex);
            if(typeof $rootScope.getNewPublicationIndex === 'undefined') $rootScope.getNewPublicationIndex = true;
            if( $rootScope.getNewPublicationIndex ){
                  console.log('getting new publicationIndex');
                  return serviceHelper.getPublicationIndex($stateParams.idBook).then(function(response){
                          if(response.error){
                              console.log("Errore nella getPublicationIndex");
                          }
                          else{
                            return response;
                          }
                      });
            }
            else{
                console.log('use old publicationIndex');
                return $rootScope.publicationIndex;
            }
          }
        }
    })
    .state('pdf', {
      url: "/pdf/:idBook/:idPar/",
      templateUrl: "pdfReader.html",
      controller: "pdfReader",
      resolve:{
        bookInfo: function( $http, $stateParams, $q, $state, $rootScope, serviceHelper, usSpinnerService ){
              return serviceHelper.getContentBookPdf($stateParams.idBook, $stateParams.idPar).then(function(response){
                      if(response.error){
                          console.log("Errore nella getContentBookPdf");
                          $state.previous = "pdf";
                          $state.previousIdBook = $stateParams.idBook;
                          $state.previousIdPar = $stateParams.idPar;
                          usSpinnerService.stop('spinner');
                          if(response.error == 401){
                              $state.go('login');
                          }
                          else{
                              $state.go('error');
                          }
                      }
                      else{
                          if(response.data && typeof response.data.redirectId !== 'undefined'){
                              $state.go('pdf',{'idBook': $stateParams.idBook, 'idPar' : response.data.redirectId});
                          }
                          else if(typeof response.redirectId !== 'undefined'){
                            $state.go('pdf',{'idBook': $stateParams.idBook, 'idPar' : response.redirectId});
                          }
                          usSpinnerService.stop('spinner');
                         if(response.data){
                            return response.data;
                         }
                         else{
                            return response;
                        }
                      }
                  });
          },
      publicationIndex: function( $http, $stateParams, $rootScope, serviceHelper ){console.log($rootScope.getNewPublicationIndex);
          if(typeof $rootScope.getNewPublicationIndex === 'undefined') $rootScope.getNewPublicationIndex = true;
          if( $rootScope.getNewPublicationIndex ){
                console.log('getting new publicationIndex');
                return serviceHelper.getPublicationIndex($stateParams.idBook).then(function(response){
                        if(response.error){
                            console.log("Errore nella getPublicationIndex");
                        }
                        else{
                          return response;
                        }
                    });
          }
          else{
              console.log('use old publicationIndex');
              return $rootScope.publicationIndex;
          }
        }
    }
    })
    .state('bookDes',{
      url: "/bookDes/:idBook/:idPar/",
      templateUrl: "bookDes.html",
      controller: "bookDes",
      resolve:{
          desiderataInfo: function( $http, $stateParams, $state, serviceHelper){
              return serviceHelper.modifyContentDesiderata($stateParams.idBook).then(function(response){
                if(response.error){
                  console.log('errore nella getDesiderata');
                  $state.previous = "bookDes";
                  $state.previousIdBook = $stateParams.idBook;
                  $state.previousIdPar = $stateParams.idPar;
                  if( response.error == 401){
                      $state.go('login');
                  }
                  else{
                      $state.go('error');
                  }
                }
                else{
                  return response.data;
                }
              });
            },
            publicationIndex: function( $http, $stateParams, $rootScope, serviceHelper ){console.log($rootScope.getNewPublicationIndex);
                if(typeof $rootScope.getNewPublicationIndex === 'undefined') $rootScope.getNewPublicationIndex = true;
                if( $rootScope.getNewPublicationIndex ){
                      return $http.get(DESIDERATA_CONFIG.base_url+'getDesiderataIndex?id='+ $stateParams.idBook)
                            .success(function (response) {
                                return response.data;
                            });
                }
                else{
                    console.log('use old publicationIndex');
                    return $rootScope.publicationIndex;
                }
            }
          }
    })
    .state('book.index',{
      url: "/index",
      templateUrl: "book.index.html",
      controller: "bookIndex",
    })
    .state('book.bookSearch',{
      url: "/bookSearch",
      templateUrl: "book.bookSearch.html",
      controller: "bookSearch",
    })
    .state('book.comments',{
      url: "/comments",
      templateUrl: "book.comments.html",
      controller: "bookComments"
    })
    .state('book.desiderata',{
      url: "/desiderata",
      templateUrl: "book.desiderata.html",
      controller: "bookDesiderata"
    })
    .state('book.tag',{
      url: "/tag",
      templateUrl: "book.tag.html",
      controller: "bookTag"
    })
    .state('book.bookmarks',{
      url: "/bookmarks",
      templateUrl: "book.bookmarks.html",
      controller: "bookBookmarks"
    })
    .state('book.similar',{
      url: "/similar",
      templateUrl: "book.similar.html",
      controller: "bookSimilar"
    })
    .state('book.advancedSearch',{
      url: "/advancedSearch",
      templateUrl: "book.advancedSearch.html",
      controller: "bookAdvancedSearch"
    })
    .state('pdf.index',{
      url: "/index",
      templateUrl: "book.index.html",
      controller: "bookIndex"
    })
    .state('pdf.bookSearch',{
      url: "/bookSearch",
      templateUrl: "book.bookSearch.html",
      controller: "bookSearch",
    })
    .state('pdf.comments',{
      url: "/comments",
      templateUrl: "book.comments.html",
      controller: "bookComments"
    })
    .state('pdf.desiderata',{
      url: "/desiderata",
      templateUrl: "book.desiderata.html",
      controller: "bookDesiderata"
    })
    .state('pdf.tag',{
      url: "/tag",
      templateUrl: "book.tag.html",
      controller: "bookTag"
    })
    .state('pdf.bookmarks',{
      url: "/bookmarks",
      templateUrl: "book.bookmarks.html",
      controller: "bookBookmarks"
    })
    .state('pdf.similar',{
      url: "/similar",
      templateUrl: "book.similar.html",
      controller: "bookSimilar"
    })
    .state('pdf.advancedSearch',{
      url: "/advancedSearch",
      templateUrl: "book.advancedSearch.html",
      controller: "bookAdvancedSearch"
    })
    .state('bookDes.index',{
      url: "/index",
      templateUrl: "book.index.html",
      controller: "bookIndex",
      params: {
        indexTree: {value: []},
      }
    })
    .state('bookDes.comments',{
      url: "/comments",
      templateUrl: "book.comments.html",
      controller: "bookComments"
    })

}).directive('popoverContainer', function ($parse, $timeout, $document) {

  return {
    scope: false,
    link: function (scope, element, attrs) {

      function handler(event) {
        if(!scope.isDragging){
            if(!angular.element(event.target).closest(element).length && !angular.element(event.target).closest('.modal-dialog').length && event.target.className != "ng-binding ng-scope" && event.target.className != "ui-select-match-close select2-search-choice-close"
                && event.target.className != "select2-result-label ui-select-choices-row-inner"/* && event.target.className != "btn btn-default dropdown-toggle buttonSimilar"*/
                && event.target.className != "ng-binding" && event.target.className != 'col-md-12 noPad ng-scope sideHide') {
              scope.$apply(function () {
                $parse(attrs.popoverContainer)(scope);
                var similarDropdowns = angular.element(".dropdown-menu");
                if(event.target.className == "btn btn-default dropdown-toggle buttonSimilar"){
                    for(var i=0; i < similarDropdowns.length; i++){
                        if( similarDropdowns[i].id != event.target.id.split("buttonSimilar")[1]){
                            angular.element(similarDropdowns[i]).hide();
                        }
                    }
                }
                else{
                    for(var i=0; i < similarDropdowns.length; i++){
                            angular.element(similarDropdowns[i]).hide();
                    }
                }
              });
            }
        }
        else{
            scope.isDragging = false;
        }
      }

    function setDrag(event){
        scope.isDragging = true;
    }
    $document.off("mouseup");
    angular.element(element).off("mousedown");
    $document.on("mouseup", handler);
    angular.element(element).on("mousedown", setDrag);

    }
  }
}).directive('popoverClose', function($timeout){
  return{
    scope: false,
    link: function(scope, element, attrs) {
      var trigger = document.getElementsByClassName('trigger');
      var excludeClass = "." + attrs.excludeClass;
      var excludeDropDownSelect = ".ui-select-choices-row";
      var excludeSelectMatch = ".ui-select-match-item";

      function closeTrigger() {
        $timeout(function(){
          scope.toggleSearchPopover = false;
          scope.toggleTaggingPopover = false;
          scope.toggleSharePopover = false;
          scope.toggleSharePopoverBook = false;
          scope.toggleSharePopoverPdf = false;
          scope.toggleSearchPopoverBook = false;
          scope.toggleSearchPopoverPdf = false;
        });
      }

      element.on('click', function(event){
        var etarget = angular.element(event.target);
        angular.element('.trigger').each(function(){
          if(angular.element(this).get(0) != etarget.get(0) && etarget.closest(excludeClass).length != 0 && etarget.closest(excludeDropDownSelect).length != 0 && etarget.closest(excludeSelectMatch).length != 0 ){
            var popoverToClose = angular.element(this).attr('popover-is-open');
            $timeout(function(){
              scope[popoverToClose] = false;
            }, 0);
            $(this).removeClass('trigger');
          }
        });
        scope[etarget.attr('popover-is-open')] = true;
      });
    }
  };
}).directive('popoverElem', function(){
  return{
    link: function(scope, element, attrs) {
      element.on('click', function(){
        element.addClass('trigger');
      });
    }
  }
});

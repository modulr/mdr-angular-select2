(function(){
  'use strict';

  angular
  .module('mdr.select2', [])
  .directive('mdrSelect2', [function(){
    /**
    * @param url {string}
    * @param src {array}
    * @param options {string}
    * @param model {object}
    * @param selected {object}
    * @param placeholder {string}
    * @param disabled {boolean}
    * @param required {attribute}
    * <select2 url="" src="" options="" model="" selected="" placeholder="" disabled="true" required></select2>
    */
    return {
      restrict: 'E',
      scope: {
        url: '@',
        src: '=',
        options: '@',
        model: '=',
        selected: '=',
        placeholder: '@',
        disabled: '='
      },
      controller: 'mdrSelect2Ctrl',
      template: '<select class="form-control select2" id="selectId_{{$id}}" ng-options="{{options}}" ng-model="model" data-placeholder="{{placeholder}}" ng-disabled="disabled"><option></option></select>'
    };
  }])
  .controller('mdrSelect2Ctrl', ['$scope', '$element', '$attrs', 'mdrSelect2Service', function($scope, $element, $attrs, mdrSelect2Service){

    $scope.placeholder = 'Seleccionar';

    init();

    // Cuando cambia url se cargan los datos
    $scope.$watch('url', function(newValue, oldValue)
    {
      if(newValue !== undefined){
        loadCollection(newValue);
      }
    });
    // Cuando cambia src se cargan los datos
    $scope.$watch('src', function(newValue, oldValue)
    {
      if(newValue !== undefined){
        var options = getOptions();
        $scope[options.collection] = newValue;
        // Si cambia selected se selecciona el nuevo modelo
        if($scope.selected !== undefined){
          selected($scope.selected);
        }
      }
    });
    // Cuando cambia selected se selecciona el nuevo modelo
    $scope.$watch('selected', function(newValue, oldValue)
    {
      if(newValue !== undefined){
        selected(newValue);
      }
    });
    // Cuando cambia selected se selecciona el nuevo modelo
    $scope.$watch('model', function(newValue, oldValue)
    {
      if(newValue !== undefined && newValue !== null){
        if(Object.keys(newValue).length === 0){
          setTimeout(function() {
            $("#selectId_" + $scope.$id).val(null).trigger("change");
          },0);
        }
      }
    });
    // Se crea el metodo que inicializa el select2
    function init()
    {
      setTimeout(function() {
        $("#selectId_" + $scope.$id).select2();
      },0);
      // Si la directiva contiene el attr required se agrega el attr required al select
      if($attrs.required !== undefined){
        $("#selectId_" + $scope.$id).attr('required','required');
      }
    }
    // Se crea el metodo que trae la coleccion del api
    function loadCollection(url)
    {
      var options = getOptions();
      mdrSelect2Service.find(url)
      .then(function (data) {
        $scope[options.collection] = data;
        init();
        // Si cambia selected se selecciona el nuevo modelo
        if($scope.selected !== undefined){
          selected($scope.selected);
        }
      });
    }
    // Selecciona el model(ng-model) y el val en el select2
    function selected(value)
    {
      var options = getOptions();
      angular.forEach($scope[options.collection], function(val, key){
        if(value == val[options.track]){
          $scope.model = val;
          setTimeout(function() {
            $("#selectId_" + $scope.$id).val(value).trigger("change");
          },0);
          return false;
        }
      });
    }
    // Se crea el metodo que obtiene el nombre de la coleccion de options
    function getOptions()
    {
      var parts = $scope.options.split(' ');
      var posCollection = parts.indexOf('in');

      var posTrack = parts.indexOf('track');
      var track = parts[posTrack+2].split('.');

      var options = {
        collection: parts[posCollection+1],
        track: track[1]
      };
      return options;
    }
  }])
  .factory('mdrSelect2Service', ['$http', '$q', function($http, $q){
    return{
      // Se obtiene la coleccion de la db
      find:function(url){
        var deferred = $q.defer();

        $http.get(url)
        .success(function(data){
          deferred.resolve(data);
        })
        .error(function(error){
          deferred.reject(error);
        });

        return deferred.promise;
      }
    };
  }]);

})();

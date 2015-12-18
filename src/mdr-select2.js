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
    * @param allow-clear {boolean}
    * @param placeholder {string}
    * @param disabled {boolean}
    * @param required {boolean}
    */
    return {
      restrict: 'E',
      controller: 'mdrSelect2Ctrl',
      scope: {
        url: '@',
        src: '=',
        options: '@',
        model: '=',
        selected: '=',
        allowClear: '@',
        placeholder: '@',
        disabled: '=',
        required: '='
      },
      template: '<select class="form-control select2" id="selectId_{{$id}}" ng-options="{{options}}" ng-model="model" ng-disabled="disabled" ng-required="required"><option></option></select>'
    };
  }])
  .controller('mdrSelect2Ctrl', ['$scope', '$element', '$attrs', 'mdrSelect2Service', function($scope, $element, $attrs, mdrSelect2Service){

    $scope.placeholder = 'Select';
    $scope.allowClear = false;

    initialize();

    // Cuando cambia url se cargan los datos
    $scope.$watch('url', function(newValue, oldValue)
    {
      if(newValue !== undefined){
        //loadCollection(newValue);
        var options = getOptions();
        mdrSelect2Service.find(newValue)
        .then(function (data) {
          $scope[options.collection] = data;
          initialize();
          // Si cambia selected se selecciona el nuevo modelo
          if($scope.selected !== undefined){
            selected($scope.selected);
          }
        });
      }
    });
    // Cuando cambia src se cargan los datos
    $scope.$watchCollection('src', function(newValue, oldValue)
    {
      if(newValue !== undefined){
        var options = getOptions();
        $scope[options.collection] = newValue;
        initialize();
        // Si cambia selected se selecciona el nuevo modelo
        if($scope.selected !== undefined){
          selected($scope.selected);
        }
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
    // Cuando cambia selected se selecciona el nuevo modelo
    $scope.$watch('selected', function(newValue, oldValue)
    {
      if(newValue !== undefined){
        selected(newValue);
      }
    });
    // Se crea el metodo que inicializa el select2
    function initialize()
    {
      setTimeout(function() {
        $("#selectId_" + $scope.$id).select2({
          placeholder: $scope.placeholder,
          allowClear: $scope.allowClear
        });
      },0);
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

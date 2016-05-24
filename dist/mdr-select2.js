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

        // Cuando cambia el scope url se cargan los datos
        // When scope url change data is loaded
        $scope.$watch('url', function(newValue, oldValue)
        {
            if(newValue !== undefined){

                var lastChar = newValue.substr(-1);
                // Si el ultimo caracter no es una barra
                // If lastChar is not a slash
                if (lastChar !== '/') {

                    var options = getOptions();
                    $scope[options.collection] = [];
                    setPlaceholder('Loading...');

                    mdrSelect2Service.find(newValue)
                    .then(function (data) {
                        if (data.length <= 0 || data.length === undefined){
                            setPlaceholder('No results found');
                        } else {
                            $scope[options.collection] = data;
                            initialize();
                            selected($scope.selected);
                        }
                    })
                    .catch(function (error) {
                        setPlaceholder('No results found');
                    });
                }
            }
        });
        // Cuando cambia el scope src se cargan los datos
        // When scope src change data is loaded
        $scope.$watchCollection('src', function(newValue, oldValue)
        {
            if(newValue !== undefined){
                var options = getOptions();
                $scope[options.collection] = newValue;
                initialize();
                selected($scope.selected);
            }
        });
        // Cuando cambia el scope model
        // When scope model change
        $scope.$watch('model', function(newValue, oldValue)
        {
            // Si el scope modelo es undefined o null
            // If scope model is undefined or null
            if(newValue === undefined || newValue === null){
                // Se inicializa (limpia) el modelo y el elemento select2
                // Model and select2 element initialize (clear)
                $scope.model = {};
                setTimeout(function() {
                    $("#selectId_" + $scope.$id).val('').trigger('change.select2');
                },0);
            }
        });
        // Cuando cambia selected se manda llamar la funcion selected
        // When scope selected change selected function is called
        $scope.$watch('selected', function(newValue, oldValue)
        {
            selected(newValue);
        });
        // Metodo que inicializa el elemento select2
        // Method initialize select2 element
        function initialize()
        {
            setTimeout(function() {
                $("#selectId_" + $scope.$id).select2({
                    placeholder: $scope.placeholder,
                    allowClear: $scope.allowClear
                });
            },0);
        }
        // Metodo que establece el placeholder del elemento select2
        // Method establish placeholder in select2 element
        function setPlaceholder(placeholder)
        {
            setTimeout(function() {
                $("#selectId_" + $scope.$id).select2({
                    placeholder: placeholder
                });
            },0);
        }
        // Metodo que asigna el ng-model y el val en el elemento select2
        // Method assign ng-model value and select2 element val
        function selected(value)
        {
            if(value !== undefined){
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
        }
        // Metodo que obtiene las opciones (coleccion y track)
        // Method get options (collection and track)
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
            // Se obtiene la coleccion del API
            // Get collection from API
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

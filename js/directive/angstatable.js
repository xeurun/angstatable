angular.module("angStaTable", ['ngRoute']).// Main table directive, store common logic, template and data
directive('angStaTable', ['$location', '$window', function($location, $window) {
    var directive = {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                caption: "@"
            },
            template: [
                '<div>',
                    '<div><button ng-click="addRow()">Add row</button></div>',
                    '<ng-transclude></ng-transclude>',
                    '<table class="table table-bordered grid">',
                        '<caption>{{ caption }}</caption>',
                        '<thead>',
                            '<tr>',
                                '<th ng-repeat="column in columns"' +
                                    'ng-class="{sortable: column.sortable}"' +
                                    'ng-click="sortBy(column)">',
                                    '{{ column.name }} <i ng-class="getSortDir(column)"></i>',
                                '</th>',
                                '<th>Actions</th>',
                            '</tr>',
                        '</thead>',
                        '<tbody>',
                            '<tr ng-repeat="(row, element) in data track by $index">',
                                '<td ng-repeat="(coll, column) in columns">',
                                    '<cell value="{{ element[coll] }}" row="{{ row }}" coll="{{ coll }}" type="{{ column.type }}" />',
                                '</td>',
                                '<td><button ng-click="removeRow(row)">Remove row</button>',
                                '<td><button ng-click="copyRow(row)">Copy row</button>',
                            '</tr>',
                        '</tbody>',
                    '</table>',
                '</div>'
            ].join(""),
            link: function ($scope, $element, attrs) {
                //element.html('');
                //$compile(element.contents())(scope);
                //TODO: Переделать вывод шаблонов, прикрутить значение
                //TODO: Simple http://angstatable.com/?0:0=433434&0:1=34343&0:2=2&0:3&0:4=Fri%20Feb%2010%202017%2000:00:00%20GMT%2B0300%20(MSK)&0:5=Thu%20Jan%2001%201970%2015:05:00%20GMT%2B0300%20(MSK)&0:6=asdfe@mail.com&0:7=http:%2F%2Fsfasdf.ru&1:0=433434&1:1=565656&1:2=5&1:3&1:4=true&1:5=&1:6=&1:7=
            },
            compile: function($element, attrs) {
                //$element.html('');
            },
            controller: function($scope) {
                $scope.columns = [];
                $scope.data = [];
                console.log($location.search());
                angular.forEach($location.search(), function(value, key) {
                    var index = key.split(':');
                    //Init array if undefined
                    if(angular.isUndefined($scope.data[index[0]])) {
                        $scope.data[index[0]] = [];
                    }
                    $scope.data[index[0]][index[1]] = value;
                });
                console.log($scope.data);

                $scope.addRow = function() {
                    $scope.data.push([]);
                };

                $scope.copyRow = function(row) {
                    $scope.data.push($scope.data[row]);
                };

                $scope.removeRow = function(row) {
                    //Delete current row and change offset other row
                    angular.forEach($location.search(), function(value, key) {
                        var index = key.split(':');
                        if(index[0] > row) {
                            $location.search((index[0] - 1) + ':' + index[1], value);
                            $location.search(index[0] + ':' + index[1], null);
                        } else if(index[0] == row) {
                            $location.search(key, null);
                        }
                    });
                    $window.location.reload();
                };

                this.change = function(row, coll, value) {
                    $location.search(row + ':' + coll, value);
                };

                this.addColumn = function(column) {
                    $scope.columns.push(column);
                };
            }
        };

    return directive;
}]).// Cell directive, logic for single cell
directive('cell', ['$compile', function($compile) {
    var getTemplate = function(type) {
            var template = '<input type="text" ng-model="value""/>';

            switch(type) {
                case 'counter': template = '<span>{{ row }}</span>'; break;
                case 'text': template = '<input type="text" ng-model="value"/>'; break;
                case 'integer': template = '<input type="integer" ng-model="value"/>'; break;
                case 'number': template = '<input type="number" ng-model="value"/>'; break;
                case 'checkbox': template = '<input type="checkbox" ng-model="value"/>';break;
                case 'radio': template = '<input type="radio" ng-model="value"/>'; break;
                case 'date': template = '<input type="date" ng-model="value"/>'; break;
                case 'time': template = '<input type="time" ng-model="value"/>'; break;
                case 'email': template = '<input type="email" ng-model="value"/>'; break;
                case 'url': template = '<input type="url" ng-model="value"/>'; break;
                default: template;
            }

            return template;
        },
        directive = {
            restrict: 'E',
            replace: true,
            scope: true,
            require: '^angStaTable',
            link: function ($scope, $element, attrs, $controller) {
                // TODO: Change to ng-change?
                $scope.$watch('value', function (newValue, oldValue) {
                    if(!angular.isUndefined(newValue)) {
                        $controller.change(attrs.row, attrs.coll, newValue);
                    }
                });

                // TODO: Refactor + add types + delete counter value
                switch(attrs.type) {
                    case 'counter': $scope.value = attrs.value; break;
                    case 'text': $scope.value = attrs.value; break;
                    case 'integer': $scope.value = attrs.value; break;
                    case 'number': $scope.value = parseInt(attrs.value); break;
                    case 'checkbox': $scope.value = (attrs.value !== "false");break;
                    case 'date': $scope.value = new Date(angular.isUndefined(attrs.value) ? null : attrs.value); break;
                    case 'time': $scope.value = new Date(angular.isUndefined(attrs.value) ? null : attrs.value); break;
                    case 'email': $scope.value = attrs.value; break;
                    case 'url': $scope.value = attrs.value; break;
                    default: $scope.value = attrs.value;
                }

                $element.html(getTemplate(attrs.type));
                $compile($element.contents())($scope);
            }
        };

    return directive;
}]).// Column directive, visual sugar
directive('column', [function() {
    var directive = {
            restrict: 'E',
            require: '^angStaTable',
            link: function ($scope, $element, attrs, $controller) {
                $controller.addColumn({
                    type: attrs.type,
                    name: attrs.name
                });
            }
        };

    return directive;
}]);
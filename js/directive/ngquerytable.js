'use strict';

angular.module('ngQueryTable', []).
// Main table directive, store common logic, template and data
directive('ngQueryTable', ['$location', '$window', function($location, $window) {
    var directive = {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                caption: "@",
                limit: "@",
                pagination: "@",
                counter: "@"
            },
            template: [
                '<div>',
                    '<div><button ng-click="addRow()">Add row</button></div>',
                    '<ng-transclude></ng-transclude>',
                    '<table>',
                        '<caption>{{ caption }}</caption>',
                        '<thead>',
                            '<tr>',
                                '<th ng-show="counter">{{ counter }}</th>',
                                '<th ng-repeat="(key, column) in columns"' +
                                    'ng-class="{sortable: column.sortable}"' +
                                    'ng-click="setSortBy(key)">',
                                    '{{ column.caption }}',
                                    '<br>',
                                    '<ng-query-table-filter type="{{ column.filter }}"/>',
                                '</th>',
                                '<th>Actions</th>',
                            '</tr>',
                        '</thead>',
                        '<tbody>',
                            '<tr ng-repeat="(row, element) in query | limitTo : limit : (page * limit)">',
                                '<td ng-show="counter">{{ page * limit + row + 1 }}</td>',
                                '<td ng-repeat="(coll, column) in columns">',
                                    '<ng-query-table-cell value="{{ query[page * limit + row][coll] }}" row="{{ page * limit + row }}" coll="{{ coll }}" type="{{ column.type }}" />',
                                '</td>',
                                '<td><button ng-click="copyRow(row)">Copy row</button><button ng-click="removeRow(row)">Remove row</button></td>',
                            '</tr>',
                        '</tbody>',
                    '</table>',
                    '<div class="ng-qt-footer" ng-show="pagination != false">',
                        '<span>Current page: {{ page + 1 }}</span>',
                        '<ul class="ng-qt-pagination">',
                            '<li ng-repeat="index in pages()" ng-click="switchPage(index)" ng-class="{ \'ng-qt-pagination-active\': (page === index) }">',
                                '{{ index + 1 }}',
                            '</li>',
                        '</ul>',
                    '</div>',
                '</div>'
            ].join(""),
            link: function ($scope, $element, attrs) {
                //element.html('');
                //$compile(element.contents())(scope);
            },
            compile: function($element, attrs) {
                //$element.html('');
            },
            controller: function($scope) {
                $scope.page = 0;
                $scope.sortBy = 'index';
                $scope.columns = [];
                $scope.query = [];
                
                //Parse url query
                angular.forEach($location.search(), function(value, key) {
                    //Parse cell index, simple 1:1
                    if(key.indexOf(':') >= 0) {
                        // keys[0] - row, keys[1] - cell
                        var keys = key.split(':');
                        //Init array if undefined
                        if(angular.isUndefined($scope.query[keys[0]])) {
                            $scope.query[keys[0]] = [];
                        }
                        $scope.query[keys[0]][keys[1]] = value;
                    } else if (key === 'page') {
                        $scope.page = parseInt(value);
                    } else if (key === 'sortBy') {
                        $scope.sortBy = parseInt(value);
                    }
                });
                
                console.log($scope.query);
                
                this.change = function(row, coll, value) {
                    console.log('Changed ' + (row + ':' + coll) + ' new value: ' + value);
                    value = angular.isDate(value) ? value.toString() : value;
                    $location.search(row + ':' + coll, value);
                    $scope.query[row][coll] = value;
                };

                this.addColumn = function(column) {
                    $scope.columns.unshift(column);
                };
                
                $scope.pages = function() {
                    var pages = [];
                        
                    for(var i = 0; i < $scope.query.length; i += parseInt($scope.limit) ) {
                       pages.push(pages.length);
                    }
                        
                    return pages;
                }

                // Switch current page
                $scope.switchPage = function(index) {
                    index = parseInt(index);
                    $scope.page = index;
                    $location.search('page', index);
                };

                // Set setSortBy
                $scope.setSortBy = function(column) {
                    column = parseInt(column);
                    $scope.sortBy = column;
                    $location.search('sortBy', column);
                };

                // Add new row, location for fix pagination
                $scope.addRow = function() {
                    var indx = $scope.query.push({});
                    angular.forEach($scope.columns, function(column, key) {
                        var value = null;
                        switch(column.type) {
                            case 'text': value = ''; break;
                            case 'integer': value = 0; break;
                            case 'number': value = 0; break;
                            case 'checkbox': value = false;break;
                            case 'radio': value = false; break;
                            case 'date': value = new Date(); break;
                            case 'time': value = new Date(); break;
                            case 'email': value = ''; break;
                            case 'url': value = ''; break;
                        }
                        change(indx, key, value);
                    });
                };

                // Copy row, location for fix pagination
                $scope.copyRow = function(row) {
                    var newIndex = $scope.query.length,
                        copy = $scope.query[row].slice();
                        
                    copy[0] = newIndex;
                    $scope.query.push(copy);
                    
                    angular.forEach($scope.columns, function(value, key) {
                        $location.search(newIndex + ':' + key, $scope.query[row][key]);
                    });
                };

                // Remove row, update locate(decrease index in url query)
                $scope.removeRow = function(row) {
                    // Delete current row and change offset other row
                    angular.forEach($location.search(), function(value, key) {
                        var index = key.split(':');
                        // index[0] - row, index[1] - cell
                        if(index[0] > row) {
                            // Decrease index
                            $location.search((index[0] - 1) + ':' + index[1], value);
                            $location.search(index[0] + ':' + index[1], null);
                        } else if(index[0] == row) {
                            // Remove current val
                            $location.search(key, null);
                        }
                    });
                    
                    $scope.query.splice(row, 1);
                    // if page empty back to prev
                    if($scope.pages().length == $scope.page && $scope.page != 0) {
                        $scope.switchPage($scope.page - 1);
                    }
                };
            }
        };

    return directive;
}]).
// Filter directive, logic for single filter
directive('ngQueryTableFilter', ['$compile', function($compile) {
    var getTemplate = function(type) {
            var template = '<input type="text" ng-model="value""/>';

            switch(type) {
                case 'text': template = '<input type="text"/>'; break;
                case 'number': template = '<input type="number"/>'; break;
                case 'boolean': template = '<input type="checkbox"/>';break;
                case 'date': template = '<input type="date"/>'; break;
                case 'time': template = '<input type="time"/>'; break;
            }

            return template;
        },
        directive = {
            restrict: 'E',
            replace: true,
            scope: true,
            require: '^ngQueryTable',
            link: function ($scope, $element, attrs, $controller) {
                // If type exists add filter
                if(attrs.type) {
                    $element.html(getTemplate(attrs.type));
                    $compile($element.contents())($scope);
                }
            }
        };

    return directive;
}]).
// Cell directive, logic for single cell
directive('ngQueryTableCell', ['$compile', function($compile) {
    var getTemplate = function(type) {
            var template = '<input type="text" ng-model="value""/>';

            switch(type) {
                case 'text': template = '<input type="text" ng-model="value"/>'; break;
                case 'integer': template = '<input type="integer" ng-model="value"/>'; break;
                case 'number': template = '<input type="number" ng-model="value"/>'; break;
                case 'checkbox': template = '<input type="checkbox" ng-model="value"/>';break;
                case 'radio': template = '<input type="radio" ng-model="value"/>'; break;
                case 'date': template = '<input type="date" ng-model="value"/>'; break;
                case 'time': template = '<input type="time" ng-model="value"/>'; break;
                case 'email': template = '<input type="email" ng-model="value"/>'; break;
                case 'url': template = '<input type="url" ng-model="value"/>'; break;
            }

            return template;
        },
        directive = {
            restrict: 'E',
            replace: true,
            scope: true,
            require: '^ngQueryTable',
            link: function ($scope, $element, attrs, $controller) {
                // TODO: Change to ng-change?
                $scope.$watch('value', function (newValue, oldValue) {
                    if(!angular.isUndefined(newValue)) {
                        $controller.change(attrs.row, attrs.coll, newValue);
                    }
                });
                
                // TODO: Refactor + add types + delete counter value
                switch(attrs.type) {
                    case 'text': $scope.value = attrs.value; break;
                    case 'integer': $scope.value = parseInt(attrs.value); break;
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
}]).
// Column directive, visual sugar, run once time when run
directive('ngQueryTableColumn', [function() {
    var directive = {
            restrict: 'E',
            require: '^ngQueryTable',
            link: function ($scope, $element, attrs, $controller) {
                $controller.addColumn({
                    type: attrs.type,
                    caption: attrs.caption,
                    filter: attrs.filter
                });
            }
        };

    return directive;
}]);
angular.module("angStaTable", ['ngRoute']).
config(function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {});
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    }).hashPrefix('#');
}).
directive('angStaTable', ['$location', function($location) {
    var directive = {
            restrict: 'E',
            replace: true,
            scope: {
                caption: "@"
            },
            template: [
                '<div>',
                    '<table class="table table-bordered grid">',
                        '<caption>{{ caption }}</caption>',
                        '<thead>',
                            '<tr>',
                                '<th ng-repeat="column in columns"' +
                                    'ng-class="{sortable: column.sortable}"' +
                                    'ng-click="sortBy(column)">',
                                    '{{ column.name }} <i ng-class="getSortDir(column)"></i>',
                                '</th>',
                            '</tr>',
                        '</thead>',
                        '<tbody>',
                            '<tr ng-repeat="element in data">',
                                '<td ng-repeat="(indx, column) in columns">',
                                    '<cell value="element[indx]" type="column.type" />',
                                '</td>',
                            '</tr>',
                        '</tbody>',
                    '</table>',
                '</div>'
            ].join(""),
            link: function ($scope, $element, attrs) {
                //element.html('');
                //$compile(element.contents())(scope);
                //TODO: Переделать вывод шаблонов, прикрутить значение
                //TODO: Simple http://angstatable.com/?row%5B%221%22%5D=5&row%5B%221%22%5D=10
            },
            compile: function($element, attrs) {
                //$element.html('');
            },
            controller: function($scope) {
                $scope.columns = [];
                $scope.data = $location.search();
                console.log($location);
                console.log($location.search());

                this.addColumn = function(column) {
                    $scope.columns.push(column);
                };
            }
        };

    return directive;
}]).
directive('cell', ['$compile', function($compile) {
    var getTemplate = function(type, value) {
        var template = '<input type="text" value="' + value + '"/>';

        switch(type) {
            case 'text': template = '<input type="text" value="' + value + '"/>'; break;
            case 'integer': template = '<input type="integer" value="' + value + '"/>'; break;
            case 'number': template = '<input type="number" value="' + value + '"/>'; break;
            case 'checkbox': template = '<input type="checkbox" value="' + value + '"/>'; break;
            case 'radio': template = '<input type="radio" value="' + value + '"/>'; break;
            case 'date': template = '<input type="date" value="' + value + '"/>'; break;
            case 'time': template = '<input type="time" value="' + value + '"/>'; break;
            case 'email': template = '<input type="email" value="' + value + '"/>'; break;
            case 'url': template = '<input type="url" value="' + value + '"/>'; break;
            default: template;
        }

        return template;
    },
    directive = {
        restrict: 'E',
        replace: true,
        scope: {
            value: "@",
            type: "@"
        },
        template: '',
        link: function ($scope, $element, attrs, $controller) {
            $element.html(getTemplate(attrs.type, attrs.value));
            $compile(element.contents())(scope);
        }
    };

    return directive;
}]).
directive('column', ['$sce', function($sce) {
    var directive = {
            restrict: 'E',
            require: '^angStaTable',
            scope: false,
            link: function ($scope, $element, attrs, $controller) {
                $controller.addColumn({
                    type: attrs.type,
                    name: attrs.name
                });
            }
        };

    return directive;
}]);
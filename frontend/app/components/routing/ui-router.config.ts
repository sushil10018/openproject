// -- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
// ++

import {WorkPackageEditModeStateService} from '../wp-edit/wp-edit-mode-state.service';
import {openprojectModule} from '../../angular-modules';

const panels = {
  get overview() {
    return {
      url: '/overview',
      reloadOnSearch: false,
      template: '<overview-panel work-package="$ctrl.workPackage"></overview-panel>'
    };
  },

  get watchers() {
    return {
      url: '/watchers',
      reloadOnSearch: false,
      template: '<watchers-panel ng-if="$ctrl.workPackage" work-package="$ctrl.workPackage"></watchers-panel>'
    };
  },

  get activity() {
    return {
      url: '/activity',
      reloadOnSearch: false,
      template: '<activity-panel ng-if="$ctrl.workPackage" work-package="$ctrl.workPackage"></activity-panel>'
    };
  },

  get activityDetails(this:any) {
    var activity = this.activity;
    activity.url = '#{activity_no:\d+}';

    return activity;
  },

  get relations() {
    return {
      url: '/relations',
      reloadOnSearch: false,
      template: ` <relations-panel
                    ng-if="$ctrl.workPackage"
                    work-package="$ctrl.workPackage"
                  ></relations-panel>`
    };
  }
};

openprojectModule
  .config(($stateProvider:ng.ui.IStateProvider,
           $urlRouterProvider:ng.ui.IUrlRouterProvider,
           $urlMatcherFactoryProvider:ng.ui.IUrlMatcherFactory) => {
    $urlMatcherFactoryProvider.strictMode(false);

    $stateProvider
      .state('work-packages', {
        url: '/{projects}/{projectPath}/work_packages?query_id&query_props',
        abstract: true,
        params: {
          // value: null makes the parameter optional
          // squash: true avoids duplicate slashes when the paramter is not provided
          projectPath: {value: null, squash: true},
          projects: {value: null, squash: true},
          query_id: { dynamic: true },
          query_props: { dynamic: true }
        },
        templateUrl: '/components/routing/main/work-packages.html',
        controller: 'WorkPackagesController'
      })

      .state('work-packages.new', {
        url: '/new?type&parent_id',
        templateUrl: '/components/routing/main/work-packages.new.html',
        controller: 'WorkPackageCreateController',
        controllerAs: '$ctrl',
        reloadOnSearch: false,
        onEnter: () => angular.element('body').addClass('full-create'),
        onExit: () => angular.element('body').removeClass('full-create'),
      })

      .state('work-packages.copy', {
        url: '/{copiedFromWorkPackageId:[0-9]+}/copy',
        controller: 'WorkPackageCopyController',
        controllerAs: '$ctrl',
        reloadOnSearch: false,
        templateUrl: '/components/routing/main/work-packages.new.html',
        onEnter: () => {
          angular.element('body').addClass('action-show');
        },
        onExit: () => angular.element('body').removeClass('action-show')
      })

      .state('work-packages.edit', {
        url: '/{workPackageId:[0-9]+}/edit',
        onEnter: ($state:ng.ui.IStateService,
                  $timeout:ng.ITimeoutService,
                  $stateParams:ng.ui.IStateParamsService,
                  wpEditModeState:WorkPackageEditModeStateService) => {
          wpEditModeState.start();
          // Transitioning to a new state may cause a reported issue
          // $timeout is a workaround: https://github.com/angular-ui/ui-router/issues/326#issuecomment-66566642
          // I believe we should replace this with an explicit edit state
          $timeout(() => $state.go('work-packages.list.details.overview', $stateParams, { notify: false }));
        }
      })

      .state('work-packages.show', {
        url: '/{workPackageId:[0-9]+}',
        // Redirect to 'activity' by default.
        redirectTo: 'work-packages.show.activity',
        templateUrl: '/components/routing/wp-show/wp.show.html',
        controller: 'WorkPackageShowController',
        controllerAs: '$ctrl',
        onEnter: () => angular.element('body').addClass('action-show'),
        onExit: () => angular.element('body').removeClass('action-show')
      })
      .state('work-packages.show.edit', {
        url: '/edit',
        reloadOnSearch: false,
        onEnter: ($state:ng.ui.IStateService,
                  $timeout:ng.ITimeoutService,
                  $stateParams:ng.ui.IStateParamsService,
                  wpEditModeState:WorkPackageEditModeStateService) => {
          wpEditModeState.start();
          // Transitioning to a new state may cause a reported issue
          // $timeout is a workaround: https://github.com/angular-ui/ui-router/issues/326#issuecomment-66566642
          // I believe we should replace this with an explicit edit state
          $timeout(() => $state.go('work-packages.show', $stateParams, { notify: false }));
        }
      })
      .state('work-packages.show.activity', panels.activity)
      .state('work-packages.show.activity.details', panels.activityDetails)
      .state('work-packages.show.relations', panels.relations)
      .state('work-packages.show.watchers', panels.watchers)

      .state('work-packages.list', {
        url: '',
        controller: 'WorkPackagesListController',
        templateUrl: '/components/routing/wp-list/wp.list.html',
        reloadOnSearch: false,
        onEnter: () => angular.element('body').addClass('action-index'),
        onExit: () => angular.element('body').removeClass('action-index')
      })
      .state('work-packages.list.new', {
        url: '/create_new?type&parent_id',
        controller: 'WorkPackageCreateController',
        controllerAs: '$ctrl',
        templateUrl: '/components/routing/wp-list/wp.list.new.html',
        reloadOnSearch: false,
        onEnter: () => angular.element('body').addClass('action-create'),
        onExit: () => angular.element('body').removeClass('action-create')
      })
      .state('work-packages.list.copy', {
        url: '/details/{copiedFromWorkPackageId:[0-9]+}/copy',
        controller: 'WorkPackageCopyController',
        controllerAs: '$ctrl',
        templateUrl: '/components/routing/wp-list/wp.list.new.html',
        reloadOnSearch: false,
        onEnter: () => angular.element('body').addClass('action-details'),
        onExit: () => angular.element('body').removeClass('action-details')
      })
      .state('work-packages.list.details', {
        redirectTo: 'work-packages.list.details.overview',
        url: '/details/{workPackageId:[0-9]+}',
        templateUrl: '/components/routing/wp-details/wp.list.details.html',
        controller: 'WorkPackageDetailsController',
        controllerAs: '$ctrl',
        reloadOnSearch: false,
        params: {
          focus: {
            dynamic: true,
            value: true
          }
        },
        onEnter: () => angular.element('body').addClass('action-details'),
        onExit: () => angular.element('body').removeClass('action-details')
      })
      .state('work-packages.list.details.overview', panels.overview)
      .state('work-packages.list.details.activity', panels.activity)
      .state('work-packages.list.details.activity.details', panels.activityDetails)
      .state('work-packages.list.details.relations', panels.relations)
      .state('work-packages.list.details.watchers', panels.watchers);
  })

  .run(($location:ng.ILocationService,
        $rootElement:ng.IRootElementService,
        $rootScope:ng.IRootScopeService,
        $state:ng.ui.IStateService,
        $window:ng.IWindowService) => {
    // Our application is still a hybrid one, meaning most routes are still
    // handled by Rails. As such, we disable the default link-hijacking that
    // Angular's HTML5-mode turns on.
    $rootElement.off('click');
    $rootElement.on('click', 'a[data-ui-route]', (event) => {
      if (!jQuery('body').has('div[ui-view]').length || event.ctrlKey || event.metaKey
        || event.which === 2) {

        return;

      }

      // NOTE: making use of event delegation, thus jQuery-only.
      var elm = jQuery(event.target);
      var absHref = elm.prop('href');

      if (absHref && !elm.attr('target') && !event.isDefaultPrevented()) {
        event.preventDefault();
        var targetUrl = URI(absHref);
        $location.url(targetUrl.path() + targetUrl.search());
        $rootScope.$apply();
      }
    });

    $rootScope.$on('$stateChangeStart', (event, toState, toParams) => {
      const projectIdentifier = toParams.projectPath || $rootScope['projectIdentifier'];

      if (!toParams.projects && projectIdentifier) {
        const newParams = _.clone(toParams);
        _.assign(newParams, { projectPath: projectIdentifier, projects: 'projects' });
        $state.go(toState, newParams);
      }
    });
  }
  );

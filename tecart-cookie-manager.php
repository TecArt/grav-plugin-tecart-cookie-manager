<?php
/**
 * @package    Grav\Plugin\TecartCookieManager
 *
 * @copyright  Copyright (C) 2020 TecArt
 * @license    MIT License; see LICENSE file for details.
 */
namespace Grav\Plugin;

use Grav\Common\Grav;
use Grav\Common\Utils;
use Grav\Common\Plugin;
use Grav\Common\Data\Data;
use Grav\Common\Data\Blueprints;
use Grav\Common\File\CompiledYamlFile;

use RocketTheme\Toolbox\Event\Event;

use Grav\Plugin\TecartCookieManager\Classes\CookieManager\CookieManager;
use Grav\Plugin\TecartCookieManager\Classes\CookieConsent\CookieConsent;

require_once __DIR__ . '/classes/CookieManager/CookieManager.php';
require_once __DIR__ . '/classes/CookieConsent/CookieConsent.php';

/**
 * Class TecartCookieManagerPlugin
 * @package Grav\Plugin
 */
class TecartCookieManagerPlugin extends Plugin {

    protected $routes = [
                'cookie-manager',
                'cookie-manager-categories',
                'cookie-manager-scripts'
              ];

    /**
     * Base assets path.
     * @type string
     */
    private $assetsPath = 'plugin://tecart-cookie-manager/assets/';

    /**
     * Init cookie banner template.
     * @type string
     */
    private $initTemplate = 'partials/init-tecart-cookie-banner.html.twig';

    /**
     * custom stylesheet and javascript
     * @type string
     */
    //private $customCSS = 'css/tecart-cookie-manager.css';
    private $customCSS = 'css/tecart-cookie-manager.min.css';
    //private $customJS  = 'js/tecart-cookie-manager.js';
    private $customJS  = 'js/tecart-cookie-manager.min.js';

    /**
     * cookie consent files
     *
     * // Source: https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.css
     * // Source: https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.js
     *
     * @type string
     */
    private $cookieConsentCSS = 'vendor/cookieconsent/cookieconsent.min.css';
    private $cookieConsentJS  = 'vendor/cookieconsent/cookieconsent.min.js';

    /**
     * admin controller
     * @type string
     */
    private $adminController;

    /**
     * admin controller
     * @type string
     */
    private $dataStorageDefault = 'user://data';

    /**
     * @return array
     *
     * The getSubscribedEvents() gives the core a list of events
     *     that the plugin wants to listen to. The key of each
     *     array section is the event that the plugin listens to
     *     and the value (in the form of an array) contains the
     *     callable (or function) as well as the priority. The
     *     higher the number the higher the priority.
     */
    public static function getSubscribedEvents() {
        return [
            'onPluginsInitialized'  => ['onPluginsInitialized',  0],
            'onTwigSiteVariables'   => ['onTwigSiteVariables',   0],
            'onAdminControllerInit' => ['onAdminControllerInit', 0],
        ];
    }

    /**
     * Initialize the plugin
     */
    public function onPluginsInitialized() {

        $this->grav['locator']->addPath('blueprints', '', __DIR__ . DS . 'blueprints');

        // proceed if we are in the admin plugin
        if ($this->isAdmin()) {

            // Enable the main event we are interested in
            $this->enable([
                'onAdminTwigTemplatePaths'  => ['onAdminTwigTemplatePaths',     0],
                'onGetPageTemplates'        => ['onGetPageTemplates',           0],
                'onAdminMenu'               => ['onAdminMenu',                  0],
                'onAdminData'               => ['onAdminData',                  0],
            ]);
        }
        // don't proceed if we are in the admin plugin
        else{
            // Enable the main event we are interested in
            $this->enable([
                'onTwigTemplatePaths'  => ['onTwigTemplatePaths',  0],
            ]);
        }
    }

    /**
     * Push plugin templates to twig paths array.
     * FRONTEND
     */
    public function onTwigTemplatePaths() {
        // Push own templates to twig paths
        array_push($this->grav['twig']->twig_paths,__DIR__ . '/templates');
    }

    /**
     * Add plugin CSS and JS files to the grav assets.
     * FRONTEND
     */
    public function onTwigSiteVariables() {

        $twig = $this->grav['twig'];
        $type = CookieManager::getCurrentCookieManagerPath();

        if ($this->isAdmin()) {

            if(in_array($type, $this->routes)){
                $vars = CookieManager::getCookieManagerDataTwigVars();
                $twig->twig_vars = array_merge($twig->twig_vars, $vars);
            }
        }
        else {
            $assets = $this->grav['assets'];

            //array for twig variables of tecart-cookie-manager/blueprints.yaml//
            $pluginConfig = $this->config->toArray();
            $cookieBannerData = CookieConsent::getYamlDataByType('cookie-manager');
            $cookieBannerScripts = CookieConsent::getYamlDataByType('cookie-manager-scripts');
            $cookieBannerCategories = CookieConsent::getYamlDataByType('cookie-manager-categories');

            // Add plugin CSS files to the grav assets.
            $assets->addCss($this->assetsPath . $this->cookieConsentCSS);
            $assets->addCss($this->assetsPath . $this->customCSS);

            // Add plugin JS files to the grav assets.
            $assets->addJs($this->assetsPath . $this->cookieConsentJS, array('group' => 'bottom'));
            $assets->addJs($this->assetsPath . $this->customJS, array('group' => 'bottom'));

            // Add inline JS to bottom of page to initialize cookie banner
            $assets->addInlineJs(
                $twig->twig->render(
                    $this->initTemplate,
                    [
                        'config' => $pluginConfig,
                        'cookieBannerData' => $cookieBannerData,
                        'cookieBannerScripts' => $cookieBannerScripts,
                        'cookieBannerCategories' => $cookieBannerCategories,
                    ]),
                    array('group' => 'bottom')
            );
        }
    }

    /**
     * Add Routes to the custom data pages when the admin menu is being loaded
     */
    public function onAdminMenu() {
        if ($this->isAdmin()) {
            $this->grav['twig']->plugins_hooked_nav['PLUGIN_TECART_COOKIE_MANGER.COOKIE_MANAGER'] = ['route' => $this->routes[0], 'icon' => 'fa-shield'];
        }
    }

    /**
     * Get admin page template
     */
    public function onAdminTwigTemplatePaths(Event $event) {
        $paths = $event['paths'];
        $paths[] = __DIR__ . DS . 'admin/templates';
        $event['paths'] = $paths;
    }

    /**
     * Add blueprint directory.
     */
    public function onGetPageTemplates(Event $event) {
        $types = $event->types;
        $types->scanBlueprints('plugin://' . $this->name . '/blueprints');
    }

    /**
     * Add additional blueprints data
     */
    public function onAdminControllerInit(Event $event) {
        $controller = $event['controller'];
        $this->adminController = $controller;
    }

    public function onAdminData(Event $event) {

        $type = $event['type']; //current route

        // Check if current context is a custom page
        if(in_array($type, $this->routes)) {

            $locator    = Grav::instance()['locator'];
            $blueprint  = CookieManager::getCurrentCookieManagerBlueprint();
            $obj        = new Data(CookieManager::getCookieManagerData(), $blueprint);
            $post       = $this->adminController->data;

            //location of yaml files
            $dataStorage = $this->dataStorageDefault;

            if($this->config['plugins']['tecart-cookie-manager']['data_storage'] ){
                if($this->config['plugins']['tecart-cookie-manager']['data_storage'] == "pages") {

                    $dataStorage = "page://assets";

                    // If the directory doesn't exist yet, create the directory
                    if (!is_dir($locator->findResource($dataStorage))) {
                        mkdir($locator->findResource($dataStorage), 0755, true);
                    }
                }
            }

            if($post){
                $obj->merge($post);
                $event['data_type'] = $obj;
                $file = CompiledYamlFile::instance($locator->findResource($dataStorage) . DS .$type. ".yaml");
                $obj->file($file);
                $obj->save();
            }
        }
    }
}

<?php

namespace Grav\Plugin\TecartCookieManager\Classes\CookieManager;

use Grav\Common\Grav;
use Grav\Common\Utils;
use Grav\Common\Data\Data;
use Grav\Common\Data\Blueprints;
use Grav\Common\File\CompiledYamlFile;


/**
 * Tecart Cookie Manager Plugin Cookie Manager Class
 *
 */
class CookieManager extends Data {

    /**
     * Get the cookie manager data list from user/data/ yaml files
     *
     * @return array
     */
    public static function getCookieManagerData() {

        $cookieManagerData = self::getYamlDataObjType(self::getCurrentCookieManagerPath());

        return $cookieManagerData;
    }

    /**
     * Get the cookie manager twig vars
     *
     * @return array
     */
    public static function getCookieManagerDataTwigVars() {

        $vars = [];

        $blueprints = self::getCurrentCookieManagerBlueprint();
        $content = self::getCookieManagerData();

        $cookieManagerData  = new Data($content, $blueprints);

        $vars['cookieManagerData'] = $cookieManagerData;

        return $vars;
    }

    /**
     * get current cookie manager blueprint
     *
     * @return string
     */
    public static function getCurrentCookieManagerBlueprint() {

        $blueprints = new Blueprints;
        $currentCookieManagerBlueprint = $blueprints->get(self::getCurrentCookieManagerPath());

        return $currentCookieManagerBlueprint;
    }

    /**
     * get current path of cookie manager for config info
     *
     * @return string
     */
    public static function getCurrentCookieManagerPath() {

        $uri = Grav::instance()['uri'];
        $currentCookieManagerPath = 'cookie-manager';

        if(isset($uri->paths()[1])){
            $currentCookieManagerPath = $uri->paths()[1];
        }

        return $currentCookieManagerPath;
    }

    /**
     * get data object of given type
     *
     * @return object
     */
    public static function getYamlDataObjType($type) {

        //location of yaml files
        $dataStorage = 'user://data';

        if (array_key_exists('data_storage', Grav::instance()['config']['plugins']['tecart-cookie-manager'])) {
            if (Grav::instance()['config']['plugins']['tecart-cookie-manager']['data_storage'] == "pages") {
                $dataStorage = 'page://assets';
            }
        }

        return CompiledYamlFile::instance(Grav::instance()['locator']->findResource($dataStorage) . DS . $type . ".yaml")->content();
    }

    /**
     * function to call with parameters from blueprints to dynamically fetch the categories option list
     * do this by using data-*@: notation as the key, where * is the field name you want to fill with the result of the function call
     *
     * data-options@: 'Grav\Plugin\TecartCookieManager\Classes\CookieManager\CookieManager::getCategoriesForBlueprintOptions'
     *
     * @return array
     */
    public static function getCategoriesForBlueprintOptions() {

        $categories = [];

        $catData = self::getYamlDataObjType('cookie-manager-categories');

        if(is_array($catData) && !empty($catData)){
            if(isset($catData['categories'])){
                foreach($catData['categories'] as $category){
                    if(isset($category['category_title'])){
                        $categories[$category['category_title']] = $category['category_title'];
                    }
                }
           }
        }

        return $categories;
    }

}

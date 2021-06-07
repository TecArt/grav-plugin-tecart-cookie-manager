<?php

namespace Grav\Plugin\TecartCookieManager\Classes\CookieConsent;

use Grav\Common\Grav;
use Grav\Common\Utils;
use Grav\Common\Data\Data;
use Grav\Common\File\CompiledYamlFile;


/**
 * Tecart Cookie Manager Plugin Cookie Manager Class
 *
 */
class CookieConsent extends Data {

    /**
     * get data object of given type
     *
     * @return object
     */
    public static function getYamlDataByType($type) {

        //location of yaml files
        $dataStorage = 'user://data';

        if(Grav::instance()['config']['plugins']['tecart-cookie-manager']['data_storage']) {
            if (Grav::instance()['config']['plugins']['tecart-cookie-manager']['data_storage'] == "pages") {
                $dataStorage = 'page://assets';
            }
        }

        return CompiledYamlFile::instance(Grav::instance()['locator']->findResource($dataStorage) . DS . $type . ".yaml")->content();
    }

}
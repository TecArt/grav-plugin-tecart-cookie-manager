/**
 * Tecart Cookie Banner class
 */
class TecartCookieBanner{

    constructor(cookieBannerData, cookieBannerScripts, cookieBannerCategories, cookieBannerCategoriesData) {
        this.cookieBannerData = cookieBannerData;
        this.cookieBannerScripts = cookieBannerScripts;
        this.cookieBannerCategories = cookieBannerCategories;
        this.cookieBannerCategoriesData = cookieBannerCategoriesData;

        if(this.cookieBannerScripts == null){  this.cookieBannerScripts = []; }
        if(this.cookieBannerCategories == null){ this.cookieBannerCategories = []; }
        if(this.cookieBannerCategoriesData == null){ this.cookieBannerCategoriesData = []; }

        // JSON array with categories for cookie cookieConsentCategories
        if(this.cookieConsentCategoriesArray == null){  this.cookieConsentCategoriesArray = new Map(); }
        // JSON array with scripts for cookie cookieConsentScripts
        if(this.cookieConsentScriptsArray == null){  this.cookieConsentScriptsArray = new Map(); }
        // Reading "cookieconsent_status" cookie
        this.cookieConsent = this.getCookieByName('cookieconsent_status');
        // Cookie for choosen output scripts to set active or not active
        this.cookieConsentScripts = this.getCookieByName('cookieconsent_scripts');
        // Cookie for choosen output categories to set active or not active
        this.cookieConsentCategories = this.getCookieByName('cookieconsent_categories');
    }

    init(){

        // Button settings
        let buttonSettings = '';
        if(this.getCookieBannerContent(this.cookieBannerData).buttonSettingsActive == 'activated'){
           buttonSettings = '<a aria-label="settings" role="button" tabIndex="0" class="button cc-btn cc-setting tcb-settings-btn '+this.getCookieBannerContent(this.cookieBannerData).buttonSettingsLayout+'" id="tcb-settings">'+this.getCookieBannerContent(this.cookieBannerData).settings+'</a>';
        }

        // Button deny
        let buttonDeny = '';
        if(this.getCookieBannerContent(this.cookieBannerData).buttonDenyActive == 'activated'){
            buttonDeny = '<a aria-label="deny cookies" role="button" tabIndex="0" class="button cc-btn cc-deny '+this.getCookieBannerContent(this.cookieBannerData).buttonDenyLayout+'">'+this.getCookieBannerContent(this.cookieBannerData).deny+'</a>';
        }

        // Cookie Consent Banner Data call
        const cookieconsentInitialse = {
            "position": "bottom-left",
            "type": "opt-in",
            "palette": {
                "popup": {
                    "background": "#f6f9fc",
                    "text": "#1e2022",
                    "border": "#1e2022"
                },
                "button": {
                    "background": "#fff",
                    "text": "#5a5f69",
                    "border": "#5a5f69"
                }
            },
            "layout": 'tecart-cookie-banner',
            "layouts": {
                "tecart-cookie-banner": '<div id="tecart-cookie-banner">' +
                    '<div class="cc-header">'+this.getCookieBannerContent(this.cookieBannerData).header+'</div>' +
                    '<div id="cookieconsent:desc" class="cc-message">'+this.getCookieBannerContent(this.cookieBannerData).message+'</div>' +
                    '<div class="cc-compliance cc-highlight">' +
                    '<a aria-label="allow cookies" role="button" tabIndex="0" class="button cc-btn cc-allow '+this.getCookieBannerContent(this.cookieBannerData).buttonAcceptLayout+'">'+this.getCookieBannerContent(this.cookieBannerData).allow+'</a>' +
                    buttonSettings +
                    buttonDeny +
                    '</div>' +
                    '</div>'
            },
            "revokable": true,
            "animateRevokable": true,
            "revokeBtn": '<div class="cc-revoke cc-bottom cc-left cc-animate cc-revoke-from-plugin" style="color: '+this.getCookieBannerContent(this.cookieBannerData).buttonRevokableTextColor+'; background-color: '+this.getCookieBannerContent(this.cookieBannerData).buttonRevokableColor+'; border-color: '+this.getCookieBannerContent(this.cookieBannerData).buttonRevokableColor+';">'+this.getCookieBannerContent(this.cookieBannerData).revoke+'</div>',
            onStatusChange: function (status, chosenBefore) {
                const didConsent = this.hasConsented();
                const tcb = new TecartCookieBanner(this.cookieBannerData, this.cookieBannerScripts, this.cookieBannerCategories);
                if (didConsent) {
                    tcb.allowAllCookies();
                }
                else if (didConsent === false) {
                    tcb.denyAllCookies();
                }
                else{
                    tcb.allowSettingsCookies()
                }
            },
            onRevokeChoice: function(status) {}
        }

        // Initialize cookie consent banner
        window.cookieconsent.initialise(cookieconsentInitialse);

        //if status settings
        if(this.cookieConsent === 'dismiss'){
            //console.log(this.cookieConsentScripts);
            this.createScriptCode(this.cookieConsentScripts);
        }
        else{
            //get initial plugin category settings - just activated values from yaml
            this.setCookieConsentCategoriesArray();
            //get initial plugin script settings - just activated values from yaml
            this.setCookieConsentScriptsArray();

        }
        //remove if exists to update items
        this.removeSettingsModal();
        //create settings modal container
        this.createSettingsModal(this.cookieConsent);
    }

    /**
     * Will allow all Cookies and set cookieconsent_status cookie to deny
     */
    allowAllCookies() {
        //Set allow cookie
        const expires = this.cookieExpireDate();
        document.cookie = 'cookieconsent_status=allow;' + expires + ';path=/';
        console.log('All scripts for this website have been activated in this browser.');
        //get initial plugin category settings - just activated values from yaml
        window.location.reload();
    }

    /**
     * Will deny all Cookies and set cookieconsent_status cookie to deny
     */
    denyAllCookies() {
        this.deleteAllCookies();
        this.removeCodeTags();
        //Set deny cookie
        const expires = this.cookieExpireDate();
        document.cookie = 'cookieconsent_status=deny;' + expires + ';path=/';
        console.log('All scripts for this website have been deactivated in this browser.');
        window.location.reload();
    }

    /**
     * Will set cookieconsent_status cookie to settings
     */
    allowSettingsCookies() {
        //Set allow cookie
        const expires = this.cookieExpireDate();
        document.cookie = 'cookieconsent_status=dismiss;' + expires + ';path=/';
        //Set cookie scripts
        console.log('All scripts for this website have set like in settings in this browser.');
    }

    /**
     * Push the allowed categories as json string to cookie
     */
    setConsentCategoriesToCookie(cookieConsentCategoriesArray) {
        if(cookieConsentCategoriesArray instanceof Map){
            cookieConsentCategoriesArray = Array.from(cookieConsentCategoriesArray);
        }
        const expires = this.cookieExpireDate();
        const json_string = JSON.stringify(cookieConsentCategoriesArray);
        document.cookie = 'cookieconsent_categories=' + json_string + ';' + expires + ';path=/';
    }

    /**
     * Push the allowed scripts as json string to cookie
     */
    setConsentScriptsToCookie(cookieConsentScriptsArray) {
        if(cookieConsentScriptsArray instanceof Map){
            cookieConsentScriptsArray = Array.from(cookieConsentScriptsArray);
        }
        const expires = this.cookieExpireDate();
        const json_string = JSON.stringify(cookieConsentScriptsArray);
        document.cookie = 'cookieconsent_scripts=' + json_string + ';' + expires + ';path=/';
    }

    /**
     * set expire date for cookies
     */
    cookieExpireDate(){
        const d = new Date();
        d.setTime(d.getTime() + (365*24*60*60*1000));
        const expires = "expires=" + d.toUTCString();
        return expires;
    }

    /**
     * Will delete all cookies
     */
    deleteAllCookies() {

        const cookies = document.cookie.split("; ");

        for (let c = 0; c < cookies.length; c++) {
            const d = window.location.hostname.split(".");
            while (d.length > 0) {
                const cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join('.') + ' ;path=';
                const p = location.pathname.split('/');
                document.cookie = cookieBase + '/';
                while (p.length > 0) {
                    document.cookie = cookieBase + p.join('/');
                    p.pop();
                }
                d.shift();
            }
        }
        window.localStorage.clear()
        console.log('all cookies cleared');
    }

    /**
     * Reads the value of a cookie by name or returns empty string
     */
    getCookieByName(name) {
        const b = document.cookie.match('(^|[^;]+)\\s*' + name + '\\s*=\\s*([^;]+)');
        return b ? b.pop() : '';
    }

    deleteCookieByName(name) {
        document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        console.log(name +' cookie deletetd');
    }

    /**
     * set categories from yaml file saved in cookieBannerCategories to active / not active and modify the cookie array CookieConsentCategoriesArray
     */
    setCookieConsentCategoriesArray(){

        let title;

        const json_data = this.cookieBannerCategories;

        if(json_data.length > 0 ){
            for(let i = 0; i < json_data.length; i++) {
                //get all scripts and activate them
                if(this.cookieConsent === "allow"){
                    //must be encoded in cookie values
                    title = encodeURIComponent(json_data[i].category_title);
                    this.cookieConsentCategoriesArray.set(title,{allowed:true})
                    this.addScriptsFromAllowedCatToCookie(json_data[i].category_title);
                }
                //initial from yaml
                else{
                    //get just standard activated scripts
                    if(json_data[i].category_cookies === 'activated'){
                        //must be encoded in cookie values
                        title = encodeURIComponent(json_data[i].category_title);
                        this.cookieConsentCategoriesArray.set(title,{allowed:true})
                        this.addScriptsFromAllowedCatToCookie(json_data[i].category_title);
                    }
                }
            }
        }
        //set values to cookie cookieconsent_categories
        this.setConsentCategoriesToCookie(this.cookieConsentCategoriesArray);

        return this.cookieConsentCategoriesArray;
    }

    /**
     * set scripts from yaml file saved in cookieBannerScripts to active / not active and modify the cookie array CookieConsentScriptsArray
     */
    setCookieConsentScriptsArray(){

        let title;
        const json_data = this.cookieBannerScripts;

        if(json_data.length > 0 ){
            for(let i = 0; i < json_data.length; i++) {
                //get all scripts and activate them
                if(this.cookieConsent === "allow"){
                    //must be encoded in cookie values
                    title = encodeURIComponent(json_data[i].script_title);
                    this.cookieConsentScriptsArray.set(title,{allowed:true})
                }
                else{
                    //get just standard activated scripts
                    if(json_data[i].script_cookies_standard === 'activated'){
                        //must be encoded in cookie values
                        title = encodeURIComponent(json_data[i].script_title);
                        this.cookieConsentScriptsArray.set(title,{allowed:true})
                    }
                }
            }
        }
        //set values to cookie cookieconsent_scripts
        this.setConsentScriptsToCookie(this.cookieConsentScriptsArray);

        const data = this.cookieConsentScriptsArray;

        this.createScriptCode(data);
    }

    /**
     * push scripts from activated categories to allowed values in script cookies
     */
    addScriptsFromAllowedCatToCookie(catTitleEncoded) {

        const getCatScripts = this.getElementByValue(this.cookieBannerScripts, 'script_category', catTitleEncoded);

        for (let i = 0; i < getCatScripts.length; i++) {
            const title = encodeURIComponent(getCatScripts[i].script_title);
            this.cookieConsentScriptsArray.set(title,{allowed:true});
        }
    }

    /**
     * output scripts of given array
     */
    createScriptCode(data) {

        let cookieArray = [];

        if(data !== null){
            if(data instanceof Map){
                data = JSON.stringify(Array.from(data));
            }
            cookieArray = JSON.parse(data); //given per function parameter
        }

        const scriptArray = this.cookieBannerScripts; //available values from yaml

        if(cookieArray.length > 0 && scriptArray.length > 0){
            for(let i = 0; i < cookieArray.length; i++) {
                const cookieScriptTitleEncoded = cookieArray[i][0];
                const cookieScriptTitle = decodeURIComponent(cookieScriptTitleEncoded);
                if(scriptArray.length > 0 && cookieScriptTitle !== '' ) {
                    for(let x = 0; x < scriptArray.length; x++) {
                        if (scriptArray[x].script_title === cookieScriptTitle) {
                            if(scriptArray[x].script_codes){
                                const codes = scriptArray[x].script_codes;
                                for(let y = 0; y < codes.length; y++) {
                                    this.createCodeTag(codes[y], cookieScriptTitleEncoded, cookieScriptTitle);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * output tags for scripts
     *
     * 'afterbegin': Just inside the targetElement, before its first child.
     * 'beforeend': Just inside the targetElement, after its last child.
     */
    createCodeTag(data, scriptTitleEncoded, scriptTitle ) {

        const code = JSON.stringify(data); //values stored in cookie

        if(code.length > 0){

            const codeContent = data.code_title;
            const codePos = data.code_position;
            const codeTag = data.code_tag;

            let codeItem = "";

            if(codeTag === 'noscript'){
                // insertAdjacentHTML with script does not execute script after include
                // codeItem = '<noscript data-title="'+scriptTitle.trim()+'" data-tcb="'+scriptTitleEncoded+'" data-position="tcb-' + codePos + '" >' +
                //     codeContent.trim() +
                //     '</noscript>';
                codeItem = document.createElement("noscript");
            }
            else {
                // insertAdjacentHTML with script does not execute script after include
                // codeItem = '<script type="text/javascript" data-title="'+scriptTitle.trim()+'" data-tcb="'+scriptTitleEncoded+'" data-position="tcb-' + codePos + '" async >' +
                //     codeContent.trim() +
                //     '</script>';
                codeItem = document.createElement("script");
                codeItem.setAttribute('type', 'text/javascript');
            }

            // tag attributes
            codeItem.setAttribute('data-title', scriptTitle.trim());
            codeItem.setAttribute('data-tcb', scriptTitleEncoded);
            codeItem.setAttribute('data-position', codePos);

            // inner tag code
            codeItem.innerHTML = codeContent.trim();

            //add script to head tag
            if(codePos === 'head'){
                // insertAdjacentHTML with script does not execute script after include
                // document.head.insertAdjacentHTML('beforeend', codeItem);
                document.head.append(codeItem);
            }
            //add script to body at the beginning
            else if(codePos === 'body-top'){
                // insertAdjacentHTML with script does not execute script after include
                // document.body.insertAdjacentHTML('afterbegin', codeItem);
                document.body.prepend(codeItem);
            }
            //add script to body at the end
            else {
                // insertAdjacentHTML with script does not execute script after include
                // document.body.insertAdjacentHTML('beforeend', codeItem);
                //const head = document.getElementsByTagName('body')[0];
                document.body.appendChild(codeItem);
            }
        }
    }

    /**
     * remove tags with given data-title     *
     */
    removeCodeTagByTitle(dataTitle) {

        if(dataTitle !== ''){
            const tags = document.querySelectorAll('[data-tcb]');
            for (const i in tags) {
                if (tags.hasOwnProperty(i)) {
                    if(tags[i].getAttribute('data-tcb') === dataTitle ){
                        //console.log(a[i].getAttribute('data-tcb'));
                        tags[i].remove();
                    }
                }
            }
        }
    }

    /**
     * remove all tags
     *
     */
    removeCodeTags() {

        const tags = document.querySelectorAll('[data-tcb]');
        for (const i in tags) {
            if (tags.hasOwnProperty(i)) {
                //console.log(a[i].getAttribute('data-tcb'));
                tags[i].remove();
            }
        }
    }

    /**
     * create settings modal
     *
     */
    createSettingsModal(status='') {

        const settingsModal = '<div id="tcb-settings-modal" class="tcb-settings-modal" style="display: none;">' +
            '<div id="tcb-settings-close-btn">&times;</div>' +
            '<div class="tcb-settings-modal-header">' +
            '<div class="cc-header">' + this.getCookieBannerContent(this.cookieBannerData).settingsTitle + '</div>' +
            '</div>\n' +
            '<div class="tcb-settings-modal-content">' +
            this.createSettingsModalTabs(status)+
            '</div>' +
            '</div>';

        document.body.insertAdjacentHTML('beforeend', settingsModal);
    }

    /**
     * remove settings modal
     */
    removeSettingsModal() {
        const modalWindow = document.getElementById('tcb-settings-modal');
        if(modalWindow!== null){
            modalWindow.remove();
        }
    }

    /**
     * create settings modal tabs
     *
     */
    createSettingsModalTabs(status='') {

        let tabSection = '';
        let tabSaveSettings = '';
        let article = '';

        const json_data = this.cookieBannerCategories;

        //get all categories and its scripts
        if(json_data.length > 0 ){

            for(let i = 0; i < json_data.length; i++) {

                //if scripts
                if(this.cookieBannerScripts.length > 0 ) {
                    // get all scripts with current category title
                    article = this.createSettingsModalTabsScripts(json_data[i].category_title, status);
                }
                const catText = (json_data[i].category_text) ? json_data[i].category_text : '';
                const catTitle = (json_data[i].category_title) ? json_data[i].category_title : '';
                const catTitleEncoded = encodeURIComponent(catTitle);
                //set active switch toggler from cookie
                let activated = '';
                if(status === 'allow'){
                    activated = "checked";
                }
                else if(this.cookieConsentCategories.length > 0){
                    // if categorie in cookie array
                    if(this.cookieConsentCategories.includes(catTitleEncoded) === true){
                        activated = "checked";
                    }
                }
                else{
                    if (json_data[i].category_cookies === 'activated') {
                        activated = "checked";
                    }
                }

                //show category all cookies toggle only if activated in admin panel
                //when activated also all scripts of category are initial loaded and active
                let cat_toggler = '';
                if (json_data[i].category_cookies === 'activated') {
                    cat_toggler = '<label class="tcb-switch tcb-categories-switch">' +
                                    '<input type="checkbox" '+activated+' id="cat_'+catTitleEncoded+'" value="'+catTitleEncoded+'"  name="tcbCookieCategories"  />' +
                                    '<span class="tcb-slider tcb-round"></span>' +
                                  '</label>';
                }

                //set checked tab
                const checkedTab = (i === 0) ? 'checked=""' : '';

                tabSection += '<section id="section'+i+'">' +
                    '<input type="radio" name="sections" id="option'+i+'" '+checkedTab+' />' +
                    '<label for="option'+i+'">'+json_data[i].category_title+'</label>' +
                    '<article>'+
                    '<div class="tcb-tabs-cat-title">' +
                    '<p>'+catTitle+'</p>' +
                    cat_toggler +
                    '</div>'+
                    '<p>'+catText+'</p>'+
                    article+
                    '</article>' +
                    '</section>';
            }
        }
        else{
            return this.getCookieBannerContent(this.cookieBannerData).settingsEmpty;
        }

        let tabSaveSettingsText = 'Save Settings';
        if (this.cookieBannerCategoriesData.categories_save_text){
            tabSaveSettingsText = this.cookieBannerCategoriesData.categories_save_text;
        }
        let tabSaveSettingsLayout = 'layout-1';
        if (this.cookieBannerCategoriesData.categories_save_layout){
            tabSaveSettingsLayout = this.cookieBannerCategoriesData.categories_save_layout;
        }


        const tabs = '<div id="tcbSettings" class="tcb-catTabs">' +
            tabSection+
            '</div>' +
            '<div class="tcb-saveSettings">' +
            '<a id="tcb-save-settings-btn" aria-label="save settings" role="button" tabIndex="0" class="button cc-btn '+tabSaveSettingsLayout+'">' +
            tabSaveSettingsText+
            '</a>' +
            '</div>';

        return tabs;
    }

    /**
     * create settings modal tabs
     *
     */
    createSettingsModalTabsScripts(categoryTitle = '',status='') {

        let tabScripts = '';

        if (categoryTitle !== '' && this.cookieBannerScripts.length > 0  ){
            // get all scripts with current category title
            const tabScriptItems = this.getElementByValue(this.cookieBannerScripts, 'script_category', categoryTitle);

            if (tabScriptItems.length > 0) {
                tabScripts += '<ul>';
                for (let x = 0; x < tabScriptItems.length; x++) {

                    const scriptTitle = (tabScriptItems[x].script_title) ? tabScriptItems[x].script_title : '';
                    const scriptTitleEncoded = encodeURIComponent(scriptTitle);

                    //set active switch toggler from cookie
                    let activated = '';
                    if(status === 'allow'){
                        activated = "checked";
                    }
                    else if(this.cookieConsentScripts.length > 0){
                        // if script in cookie array
                        if( this.cookieConsentScripts.includes(scriptTitleEncoded) === true){
                            activated = "checked";
                        }
                    }
                    else{
                        if (tabScriptItems[x].script_cookies_standard === 'activated') {
                            activated = "checked";
                        }
                    }

                    let readonly = '';
                    let readonlyClass = '';
                    let name = 'tcbCookieScripts';
                    if(tabScriptItems[x].script_cookies === '0'){
                        readonly = 'disabled="disabled"';
                        readonlyClass = 'disabled';
                        name = 'tcbDisabledCookieScripts';
                    }

                    tabScripts += '<li>' +
                        '<div class="tcb-script-title">'+ scriptTitle +'</div>'+
                        '<label class="tcb-switch tcb-script-switch '+readonlyClass+'">' +
                        '<input type="checkbox" '+activated+' id="script_'+scriptTitleEncoded+'" value="'+scriptTitleEncoded+'"  name="'+name+'" '+readonly+' />' +
                        '<span class="tcb-slider tcb-round"></span>' +
                        '</label>' +
                        '<div class="tcb-script-text">'+ tabScriptItems[x].script_text +'</div>'+
                        '</li>';
                }
                tabScripts += '</ul>';
            }
        }
        return tabScripts;
    }

    /**
     * checkboxes selected
     */
    onCheckboxSettings() {

        //delete Cookies to set them new
        this.deleteCookieByName('cookieconsent_scripts');
        this.deleteCookieByName('cookieconsent_categories');
        this.deleteAllCookies();

        let selectedScripts = [];
        let selectedCats = [];
        let catScripts = [];

        this.cookieConsentScriptsArray = new Map();

        //get selected scripts
        selectedScripts = Array.from(document.querySelectorAll('input[name=tcbCookieScripts]'))
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => checkbox.value);

        //add selected scripts to cookie
        if(selectedScripts.length > 0){
            for (let i = 0; i < selectedScripts.length; i++) {
                this.cookieConsentScriptsArray.set(selectedScripts[i],{allowed:true});
            }
        }
        //get selected categories
        selectedCats = Array.from(document.querySelectorAll('input[name=tcbCookieCategories]'))
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => checkbox.value);

        //add selected categories to cookie
        if(selectedCats.length > 0){
            for (let i = 0; i < selectedCats.length; i++) {
                this.cookieConsentCategoriesArray.set(selectedCats[i],{allowed:true});
                this.addScriptsFromAllowedCatToCookie(decodeURIComponent(selectedCats[i]));
            }

        }

        //fill cookies with data
        this.setConsentCategoriesToCookie(this.cookieConsentCategoriesArray);
        this.setConsentScriptsToCookie(this.cookieConsentScriptsArray);

        //set cookie cookieconsent_status to dismiss
        this.allowSettingsCookies();

        //remove current script tags
        this.removeCodeTags();

        //set new script tag codes
        const data = this.cookieConsentScriptsArray;
        this.createScriptCode(data);

        window.location.reload();
    }

    /**
     * get elements by value
     * e.g.  get all scripts with current category title
     */
    getElementByValue(data, key, value) {
        return data.filter(function (object) {
            return object[key] === value;
        });
    }

    /**
     * Creates the cookie consent content
     */
    getCookieBannerContent(cookieBannerData){
        const cookieContent = {};

        cookieContent.header = "Cookies used on the website!";
        cookieContent.allow = "Allow";
        cookieContent.deny = "Deny";
        cookieContent.denyActive = "activated";
        cookieContent.message = "This website uses cookies to ensure you get the best experience on our website.";
        cookieContent.settings = "Settings";
        cookieContent.settingsEmpty = "There are no settings available.";
        cookieContent.settingsActive = "activated";
        cookieContent.revoke = "Cookie Policy";
        cookieContent.buttonRevokableColor = "#7faf34";
        cookieContent.buttonRevokableTextColor = "#ffffff";
        cookieContent.settingsTitle = "Your personal settings";

        if(cookieBannerData != null){
            if(cookieBannerData.banner_title){
                cookieContent.header = cookieBannerData.banner_title;
            }
            if(cookieBannerData.button_deny_text){
                cookieContent.deny = cookieBannerData.button_deny_text;
            }
            if(cookieBannerData.button_accept_text){
                cookieContent.allow = cookieBannerData.button_accept_text;
            }
            if(cookieBannerData.banner_text) {
                cookieContent.message = cookieBannerData.banner_text;
            }
            if(cookieBannerData.button_settings_text){
                cookieContent.settings = cookieBannerData.button_settings_text;
            }
            if(cookieBannerData.button_settings_empty){
                cookieContent.settingsEmpty = cookieBannerData.button_settings_empty;
            }
            if(cookieBannerData.banner_revokable_text){
                cookieContent.revoke = cookieBannerData.banner_revokable_text;
            }
            if(cookieBannerData.button_revokable_color ){
                cookieContent.buttonRevokableColor = cookieBannerData.button_revokable_color;
            }
            if(cookieBannerData.button_revokable_color ) {
                cookieContent.buttonRevokableTextColor = cookieBannerData.button_revokable_text_color;
            }
            if(cookieBannerData.banner_cat_title){
                cookieContent.settingsTitle = cookieBannerData.banner_cat_title;
            }
            cookieContent.buttonDenyLayout = cookieBannerData.button_deny_layout;
            cookieContent.buttonDenyActive = cookieBannerData.button_deny_active;
            cookieContent.buttonSettingsLayout = cookieBannerData.button_settings_layout;
            cookieContent.buttonSettingsActive = cookieBannerData.button_settings_active;
            cookieContent.buttonAcceptLayout = cookieBannerData.button_accept_layout;
        }
        return cookieContent;
    }
}

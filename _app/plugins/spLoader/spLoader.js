
/* Loader plugin for sharepoint javascript resources */
/* Usage:  spLoader!sp.js, spLoader!SP.Taxonomy.js */
define(function () {

    return {
        load: function (name, parentRequire, onload, config) {

            //Sharepoint doesn't register all of its own libraries
            var key = name;
            var n = name.lastIndexOf("/");
            if (n >= 0) {
                key = name.substring(n + 1, name.length);
                SP.SOD.registerSod(key, name + "?" + config.urlArgs);
            }

            if (key == "scriptforwebtaggingui.js") {
                SP.SOD.registerSod("sp.ui.rte.js", "/_layouts/15/sp.ui.rte.js" + "?" + config.urlArgs);
                //SP.SOD.registerSod("scriptresources.resx", "/_layouts/15/resources/scriptresources.resx" + "?" + config.urlArgs);				 
                RegisterSod("scriptresources.resx", "/_layouts/15/ScriptResx.ashx?culture=en-us&name=scriptresources" + "&" + config.urlArgs);
                //RegisterSodDep(key, "sp.js");
                RegisterSodDep(key, "sp.ui.rte.js");
                RegisterSodDep(key, "scriptresources.resx");
            }

            var functionName = null;

            if (name == "sp.js") {
                functionName = 'SP.ClientContext';
            }


            SP.SOD.executeFunc(key, functionName, onload);
            SP.SOD.executeOrDelayUntilScriptLoaded(onload, key);
        }
    }
});
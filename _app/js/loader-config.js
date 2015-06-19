
var baseUrl;

baseUrl = _spPageContextInfo.siteAbsoluteUrl + "/_app/lib";

requirejs.config({
  baseUrl: baseUrl,
  urlArgs: "bust=v1",
  paths: {
    'text': 'requirejs/text',
    'jquery': "jquery/jquery-1.11.2.min",
    'widgets': "../widgets",
    'spLoader': "../plugins/spLoader/spLoader",
    'handlebars': 'handlebars/handlebars-v3.0.0'
  }
});

require(['jquery'], function($) {
  $('div.js-widget-container').each(function(i, el) {
    var moduleLocation;
    moduleLocation = $(el).data('bootstrap');
    if (moduleLocation) {
      require([moduleLocation], function(module) {
        module.init(el);
      });
    }
  });
});


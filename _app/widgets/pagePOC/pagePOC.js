'use strict';
define(["jquery", "handlebars", "text!widgets/pagePOC/pagePOC.html"], function(jQuery, handlebars, renderTemplate) {
    var pagesQueryString = "?$select=PublishingContact/Name&$expand=PublishingContact/Name";
    var userDataSuffix = "'&sourceid=%27b09a7990-05ea-4af9-81ef-edfab16c4e31%27" +
        "&selectproperties=%27PictureUrl,PreferredName,WorkEmail,WorkPhone,Office,City,State%27";

    function renderData(user, template, element) {
        var render = template(user);
        jQuery(element).html(render);
    }

    function getUserData(membershipString) {
        var dfd = new jQuery.Deferred();
        var email = membershipString.substring(18);
        //var userDataQueryUrl = _spPageContextInfo.webServerRelativeUrl + "/_api/search/query?querytext='" + email + userDataSuffix;

        var userDataQueryUrl = _spPageContextInfo.siteAbsoluteUrl + "/_api/sp.userprofiles.peoplemanager/GetPropertiesFor(accountName=@v)?@v=%27i:0%23.f|membership|" + email + "%27";

        jQuery.ajax({
            url: userDataQueryUrl,
            method: "GET",
            headers: {
                "Accept": "application/json; odata=verbose"
            },
            success: function(data) {
                var user = {};
                //var e = data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results[0].Cells.results;
                var e = data.d.UserProfileProperties.results;
                for (var i = 0; i < e.length; i++) {
                    if (e[i].Key == 'PreferredName') {
                        user.PreferredName = e[i].Value;
                    } else if (e[i].Key == 'WorkEmail') {
                        user.WorkEmail = e[i].Value;
                    } else if (e[i].Key == 'WorkPhone') {
                        user.WorkPhone = e[i].Value;
                    } else if (e[i].Key == 'Office') {
                        user.Office = e[i].Value;
                    } else if (e[i].Key == 'City') {
                        user.City = e[i].Value;
                    } else if (e[i].Key == 'State') {
                        user.State = e[i].Value;
                    } else if (e[i].Key == 'PictureURL') {
                        if (data.d.PictureUrl) {
                            user.PictureURL = e[i].Value;
                        } else {
                            user.PictureURL = null;
                        }
                    }
                }

                user.noContact = false;

                user.FullLocation = false;
                user.CityOnly = false;
                user.StateOnly = false;
                user.NoLocation = false;

                if (user.City && user.State) {
                    user.FullLocation = true;
                } else if (user.City) {
                    user.CityOnly = true;
                } else if (user.State) {
                    user.StateOnly = true;
                } else {
                    user.NoLocation = true;
                }

                if (user.PictureURL && user.WorkEmail) {
                    user.PictureURL = "/_layouts/15/userphoto.aspx?size=L&accountname=" + user.WorkEmail;
                }

                dfd.resolve(user);
            },
            error: function(data) {
                dfd.reject(data);
            }
        });

        return dfd.promise();
    }

    function getPagePOC() {
        var dfd = new jQuery.Deferred();
        var pagesLibraryQuery = _spPageContextInfo.webServerRelativeUrl + "/_api/Web/Lists/getById('" + _spPageContextInfo.pageListId +
            "')/Items(" + _spPageContextInfo.pageItemId + ")" + pagesQueryString;
        jQuery.ajax({
            url: pagesLibraryQuery,
            method: "GET",
            headers: {
                "Accept": "application/json; odata=verbose"
            },
            success: function(data) {
                data.d.PublishingContact.Name ? dfd.resolve(data.d.PublishingContact.Name) : dfd.reject({
                    code: 1
                });


            },
            error: function(data) {
                console.log(data);
                dfd.reject({
                    error: data,
                    code: 0
                });
            }
        });

        return dfd.promise();
    }

    var init = function(element) {
        var template = handlebars.compile(renderTemplate);
        jQuery.when(getPagePOC()).then(
            function(membershipString) {
                jQuery.when(getUserData(membershipString)).then(
                    function(user) {
                        renderData(user, template, element);
                    },
                    function(error) {
                        console.log(error);
                    });
            },
            function(error) {
                if (error.code === 0) {
                    console.log(error.error);
                } else {
                    renderData({
                        noContact: true
                    }, template, element);
                }
            });
    }

    return {
        "init": init
    }
});
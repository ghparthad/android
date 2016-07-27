/**
 * JavaScript Document
 */

/**
 * Basic configuration
 */
var searchStr = "";
var numOfNews = 10;
var scrollCall = 0;
var domainUrl = "http://88.208.207.22/testnews/";
var newsImageUrl = "http://217.174.252.92/image/render/";

var prevNewsDisplayed = [];
var latestNewsPublishedDate;

var availableHeight;
availableHeight = $("#window-height").outerHeight(true);

$(window).resize(function() {
    availableHeight = $("#window-height").outerHeight(true);   
    //alert(availableHeight);
});

var setIntervalProcessing = true;

var timer;

function invocation() {
    timer = window.setTimeout(function(){
        $('#news-available-loading').fadeOut("slow");
    }, 10000);
}

invocation();

/**
 * Converts normal scroll bar to slim
 */
$(function(){
    $("#collapsible-sidebar-content").slimScroll({
        height: 'auto',
        size: '5px',
        color: '#999999'
    });
});

/**
 * Open and close collapsible sidebar
 */
$(".collapsible-sidebar").click(function(event) {
    $("#body-container").one('click',function() {
        // Hide the menus
        $("#collapsible-sidebar-box").removeClass("show-cs");
    });

    $("#collapsible-sidebar-box").addClass("show-cs");
    event.stopPropagation();
});

/**
 * Open and close filter modal box
 */
$(".filter-modal").bind("click", function(){
    $("#collapsible-sidebar-box").removeClass("show-cs");
    $('#filterModal').modal('show');    
});

/**
 * Check whether web storage supports or not
 */
if (typeof(Storage) !== "undefined") {
    // Yes! Web Storage works.
} else {
    // Sorry! No Web Storage support.
}

/**
 * Converts storage data to string
 * item = any storage data
 */
var storageDataToString = function(item){ //alert(item);
    var retrievedData = localStorage.getItem(item);
    var newObj = JSON.parse(retrievedData);
    var resultArray = [];
    for (var key in newObj){
        resultArray = resultArray.concat(newObj[key]);
    }
    return resultArray;
}

/**
 * Formats the date to "Jul 20, 2016"
 * date = publish_date, e.g. 2016-07-20 22:36:40
 */
var formatDate = function(date){
        var str = (new Date(date)).toString();
        var format = str.substr(4, 3) + " "  + str.substr(8, 2) + ", " + str.substr(11, 4);
        return format; //alert(format);
} 

/**
 * News information, e.g. how many latest news available
 * call = info
 */
var getMoreAvailableNewsInfo = function (call) {

    setIntervalProcessing == false;

    var callVal = "";
    if(call != ""){callVal = call}

    var selectedNewsFunctionIds = "";
    if (localStorage.getItem("newFunctionIds") !== null && localStorage.getItem("newFunctionIds") !== "null") {
        selectedNewsFunctionIds = localStorage.getItem("newFunctionIds");
    }
    
    var selectedNewsPublishedDate = "";
    var selectedNewsPublishedTime = "";
    if (sessionStorage.getItem("latestNewsPublishedDateRecorded") !== null && sessionStorage.getItem("latestNewsPublishedDateRecorded") !== "null") {
        var publishedStr = sessionStorage.getItem("latestNewsPublishedDateRecorded");
        var selectedNewsPublishedDate = publishedStr.substring(0, 10);
        var selectedNewsPublishedTime = publishedStr.substring(11, 19);
        //alert(selectedNewsPublishedDate + " " + selectedNewsPublishedTime);
    }

    var dataString;
    
    dataString = 'callit=' + callVal + '&npd=' + selectedNewsPublishedDate + '&npt=' + selectedNewsPublishedTime + '&nfid=' + selectedNewsFunctionIds;
    //alert(dataString);

    var restUrl = domainUrl + "get-news.php";

    $.ajax({
        type: "POST",
        url: restUrl,
        data: dataString,
        crossDomain: true,
        dataType: 'json',
        cache: false,
        success: function(result){
            //alert(result);
            if(result > 0){
                $('#news-available-loading').fadeIn("slow");
                invocation();
            }
        },
        error: function(){
        },
        complete: function(){
            setIntervalProcessing == true;
        }
    });

    return false;
}

/**
 * Load news based on "call" parameter
 * call = default | scroll | latest
 */
var loadNews = function(call){
    
    var callVal = "";
    if(call != ""){callVal = call}
    
    if(callVal == "latest"){
        //$('.news-available-msg').fadeOut();
        $('.news-loading-img').fadeIn();
    } else {
        $('#news-search-loading').fadeIn();
    }

    var selectedNewsFunctionIds = "";
    if (localStorage.getItem("newFunctionIds") !== null && localStorage.getItem("newFunctionIds") !== "null") {
        selectedNewsFunctionIds = localStorage.getItem("newFunctionIds");
    }
    
    var selectedNewsPublishedDate = "";
    var selectedNewsPublishedTime = "";
    if(callVal == "default"){
        sessionStorage.removeItem("latestNewsPublishedDateRecorded");
    } else {
        if (sessionStorage.getItem("latestNewsPublishedDateRecorded") !== null && sessionStorage.getItem("latestNewsPublishedDateRecorded") !== "null") {
            var publishedStr = sessionStorage.getItem("latestNewsPublishedDateRecorded");
            var selectedNewsPublishedDate = publishedStr.substring(0, 10);
            var selectedNewsPublishedTime = publishedStr.substring(11, 19);
            //alert(selectedNewsPublishedDate + " " + selectedNewsPublishedTime);
        }
    }

    if(callVal == "default"){
        if (localStorage.getItem("prevNewsDisplayedRecorded") !== null && localStorage.getItem("prevNewsDisplayedRecorded") !== "null") {
            localStorage.removeItem("prevNewsDisplayedRecorded");
        }
    }
    //alert(localStorage.getItem("prevNewsDisplayedRecorded"));

    var loadNumVal = numOfNews;
    
    var prevNews;
    
    if(prevNewsDisplayed.length > 0){
        prevNews = storageDataToString("prevNewsDisplayedRecorded"); //alert(prevNews);
    }
   
    var dataString;

    if(callVal == "latest"){
        if(prevNewsDisplayed.length > 0){
            dataString = 'callit=' + callVal + '&npd=' + selectedNewsPublishedDate + '&npt=' + selectedNewsPublishedTime + '&prevnews=' + prevNews + '&nfid=' + selectedNewsFunctionIds;
        } else {
            dataString = 'callit=' + callVal + '&npd=' + selectedNewsPublishedDate + '&npt=' + selectedNewsPublishedTime + '&nfid=' + selectedNewsFunctionIds;
        }
    } else {
        if(prevNewsDisplayed.length > 0){
            dataString = 'num=' + loadNumVal + '&prevnews=' + prevNews + '&nfid=' + selectedNewsFunctionIds;
        } else {
            dataString = 'num=' + loadNumVal + '&nfid=' + selectedNewsFunctionIds;
        }
    }
    //alert(dataString);
    
    var restUrl = domainUrl + "get-news.php";
    
    $.ajax({
        type: "POST",
        url: restUrl,
        data: dataString,
        crossDomain: true,
        dataType: 'json',
        cache: false,
        success: function(result){
            //alert(JSON.stringify(result));
            if(result == 1){
                $('#news-search-loading').fadeOut();
                $('#no-more-news').fadeIn();
                $("#no-more-news").delay(5000).fadeOut();
            } else {
                var newsStr = "";

                $.each(result, function(index, value) {
                    //alert(index);    
                    var no_img = "";
                    if(value.image_extension == "NA"){
                        no_img = "no-img";
                    }

                    newsStr += ""
                        + "<div class=\"col-sm-6 news-block\">"
                            + "<div class=\"news-header\">"
                                + "<div class=\"news-img-wrapper " + no_img + "\">"
                                    + "<a href=\"" + value.short_url + "\" target=\"_blank\">"
                                        + "<img src=\"" + newsImageUrl + "?i=" + value.news_id + value.image_extension + "&w=350&q=80&a=news\" />"
                                    + "</a>"
                                + "</div>"
                                + "<div class=\"news-title-wrapper\">"
                                    + "<a href=\"" + value.short_url + "\" target=\"_blank\"><span class=\"news-title\">" + value.title + "</span></a>"
                                    + "<span class=\"news-publish-date\"><span class=\"title\">Published On: </span>" + formatDate(value.publish_date) + "</span>"
                                + "</div>"
                            + "</div>"
                            + "<div class=\"news-content\">"
                                + "<div class=\"news-summary-wrapper\">"
                                    + "<span class=\"news-summary\">" + value.summary + "</span>"
                                + "</div>"
                            + "</div>"
                            + "<div class=\"news-footer\">"
                                + "<span class=\"news-summarized-by\">Summarized by Agrud</span>"
                                + "<span class=\"news-source\">Source - " + value.source + "</span>"
                            + "</div>"
                        + "</div>";

                    prevNewsDisplayed.push(value.news_id);

                    if(callVal == "default" || callVal == "latest"){
                        if(index == 0){
                            latestNewsPublishedDate = value.publish_date;
                        }
                    }

                });
                
                if(callVal == "latest"){
                    $("#news-container").prepend(newsStr);
                } else {
                    $("#news-container").append(newsStr);
                }
                
                sessionStorage.setItem("latestNewsPublishedDateRecorded", latestNewsPublishedDate);
                //alert(sessionStorage.getItem("latestNewsPublishedDateRecorded"));
                localStorage.removeItem("prevNewsDisplayedRecorded");
                localStorage.setItem("prevNewsDisplayedRecorded", JSON.stringify(prevNewsDisplayed));
            }   
        },
        error: function(){
        },
        complete: function(){
            if(callVal == "latest"){
                $('.news-loading-img').fadeOut();
                $('.news-loaded-msg').fadeIn();
                $('#news-search-loading').fadeOut();
            } else {
                $('#news-search-loading').fadeOut();
            }
        }
    }).done(function() {
        $(".news-summary").shorten({
            "showChars" : 80,
            "moreText" : "See More",
            "lessText" : "Less"
        });
    });

    return false;
}

loadNews("default");

/**
 * Set interval = 1000 * 60 * 1; // where X is your every X minutes // 20000 = 20 sec
 */
var interval = 30000;

if(setIntervalProcessing == true){
    setInterval(function(){
        getMoreAvailableNewsInfo("info");
    }, interval);
}

/**
 * Binds a click function to .news-available-msg //.news-available-msg
 */
$(".news-available-msg").bind("click", function(){
    clearTimeout(timer);
    $(this).fadeOut("fast");
    loadNews("latest");
});

/**
 * Binds a click function to .news-loaded-msg
 */
$(".news-loaded-msg").bind("click", function(){
    $("html, body").animate({ scrollTop: 0 }, "slow");
    $(this).fadeOut("slow");
    //$('#news-available-loading').fadeOut("slow");
    $('#news-available-loading').fadeOut("slow", function() {
        // will be called when the element finishes fading out
        $('.news-available-msg').fadeIn(10000);
    });
});

/**
 * Determine the mobile operating system.
 * This function either returns 'iOS', 'Android' or 'others'
 * @returns {String}
 */
var userAgent = navigator.userAgent || navigator.vendor || window.opera;

if( userAgent.match( /iPad/i ) || userAgent.match( /iPhone/i ) || userAgent.match( /iPod/i ) )
{
    $(window).scroll(function() { //alert(availableHeight);
        if(availableHeight == 748 || availableHeight == 1004){
            //alert($(window).scrollTop() + " + " + availableHeight + " = " + $(document).height());
            if($(window).scrollTop() + availableHeight == $(document).height()) {
                //alert("end of page ... iOS ... WOW!");
                loadNews("scroll");
            }
        } else{
            //alert($(window).scrollTop() + " + " + availableHeight + " + 95 = " + $(document).height());
            //alert($(window).scrollTop() + " + " + availableHeight + " = " + $(document).height());
            //if($(window).scrollTop() + availableHeight + 95 == $(document).height()) {
            if($(window).scrollTop() + availableHeight == $(document).height()) {
                //alert("end of page ... iOS ... WOW!");
                loadNews("scroll");
            }
        }
    });
}
else if( userAgent.match( /Android/i ) )
{
    $(window).scroll(function() {
        if($(window).scrollTop() + $(window).height() == $(document).height()) {
            //alert("end of page ... Android ... WOW!");
            loadNews("scroll");
        }
    });
}
else
{
    $(window).scroll(function() {
        if($(window).scrollTop() + $(window).height() == $(document).height()) {
            //alert("end of page ... normal ... WOW!");
            loadNews("scroll");
        }
    });
}

/**
 * Return function names
 */
var getFunctionName = function(){

    var existingNfidArray = "";
    if(localStorage.getItem("newFunctionIds") !== null) {
        var numbersString = localStorage.getItem("newFunctionIds");
        existingNfidArray = numbersString.split(',');
    }

    var dataString = 'func=news_functions';

    var restUrl = domainUrl + "settings.php";

    $.ajax({
        type: "POST",
        url: restUrl,
        data: dataString,
        crossDomain: true,
        dataType: 'json',
        cache: false,
        success: function(result){ 

            var selectOption = "";

            $.each(result, function(index, value) {
                if($.inArray(value.id, existingNfidArray) > -1){
                    selectOption += ""
                        + "<option value=\"" + value.id + "\" selected >" + value.function_name + "</option>"
                } else{
                    selectOption += ""
                        + "<option value=\"" + value.id + "\">" + value.function_name + "</option>"
                }
            });

            $(".news-function-details").append(selectOption);

        },
        error: function(){
        },
        complete: function(){
        }
    });

    return false;

}

getFunctionName();

/**
 * Apply select2 JS to .news-function-details
 */
$(function(){
    $(".news-function-details").select2({
        maximumSelectionLength: 10
    });
});

/**
 * Click function to save function ids to storage
 */
$('.save-filter').on('click', function(evt){
    evt.stopPropagation();
    if (localStorage.getItem("newFunctionIds") !== null) {
        localStorage.removeItem("newFunctionIds");
    }
    localStorage.setItem("newFunctionIds", $('.news-function-details').val());
    //alert( localStorage.getItem("newFunctionIds") );
    $('#filterModal').modal('hide');
    location.reload();
});
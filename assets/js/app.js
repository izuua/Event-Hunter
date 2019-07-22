//==================================================
// VARIABLES
//--------------------------------------------------

var searchData;
var searchDataNext;

var siteURL = 'http://127.0.0.1:5500/Project-1/';

var openWeatherKey = "280deca1e7bba83d640479281597834f";
//==================================================
// FUNCTIONS
//--------------------------------------------------

function initMap() {
    // The location of the venue
    var location = {
        lat: parseFloat(localStorage.getItem('lat')),
        lng: parseFloat(localStorage.getItem('lng'))
    };
    initWeather(location.lat, location.lng)

    // The map, centered at the venue
    var map = new google.maps.Map(document.getElementById('js-map'), {
        zoom: 15,
        center: location
    });
    // The marker, positioned at the venue
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
}

function initWeather(lat, lng) {

    var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lng + "&APPID=" + openWeatherKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (res) {

        var temp = (res.main.temp * (9 / 5) - 459.67).toFixed(1)
        var desc = res.weather[0].description
        $("#js-details-temp").html(temp + "&deg")
        $("#js-details-weather").text(desc)
    })
}

function searchDetails() {
    var searchKeyword = $('#js-input-details-search').val().trim();
    localStorage.setItem('searchKeyword', searchKeyword);
    location.href = siteURL + 'index.html';
}

function grabImg(imgArray) {
    var minWidth = 1000;
    var imgFound = false;
    var imgUrl;
    for (let j = 0; j < imgArray.length; j++) {
        if (
            imgArray[j].width >= minWidth &&
            imgArray[j].ratio === '16_9'
        ) {
            imgUrl = imgArray[j].url;
            imgFound = true;
        }
    }
    if (!imgFound) {
        imgUrl = imgArray[0].url;
    }
    return imgUrl
}

function mainSearch() {
    var keyword = $('#js-input-search').val().trim();

    // Clears old search results
    $('#js-results').empty();
    $('#js-form-search')[0].reset();

    // Checks if user made an input
    if (keyword === '') {
        console.log('didnt search');
        $('#js-display-row').hide();
    } else {
        console.log('did search');
        $('#js-display-input').text(keyword);
        $('#js-display-row').show();

        var queryURL =
            'https://app.ticketmaster.com/discovery/v2/events?apikey=1CDZF2AkHAO8FPwY0r3kQm6bmxI7Vuk5&keyword=' +
            keyword +
            '&locale=*&includeSpellcheck=yes';

        $.ajax({
            url: queryURL,
            method: 'GET'
        }).then(function (res) {
            searchData = res._embedded;
            console.log(res);
            console.log(searchData);

            if (_.has(res._links.next, "href")) {                
                searchDataNext = res._links.next.href
            } else {
                searchDataNext = undefined
            }

            // Creates cards for each matching result
            for (let i = 0; i < searchData.events.length; i++) {
                var imgUrl = grabImg(searchData.events[i].images)

                console.log('card making running');
                var newCard = $(
                    "<div class='col-12 col-md-6 col-lg-3'>"
                ).append(
                    $(
                        "<a href='./details.html' target=_blank class='card-link' data-event-id='" +
                        searchData.events[i].id +
                        "' data-event-lat='" +
                        searchData.events[i]._embedded.venues[0].location
                            .latitude +
                        "' data-event-lng='" +
                        searchData.events[i]._embedded.venues[0].location
                            .longitude +
                        "'>"
                    ).append(
                        $("<div class='card'>").append(
                            $(
                                "<img src='" +
                                imgUrl +
                                "' alt='" +
                                searchData.events[i].name +
                                "' class='card-img-top'>"
                            ),
                            $("<div class='card-body'>").append(
                                $("<h5 class='card-title'>").text(
                                    searchData.events[i].name
                                ),
                                $("<p class='card-text'>").text(
                                    searchData.events[i].dates.start.localDate
                                ),
                                $("<p class='card-text'>").text(
                                    searchData.events[i]._embedded.venues[0].name
                                )
                            )
                        )
                    )
                );
                $('#js-results').append(newCard);
            }
        });
    }
}

//==================================================
// APP INIT
//--------------------------------------------------

$('#js-btn-search').on('click', function (e) {
    e.preventDefault();
    mainSearch();
});

// Stores data needed for details.html
$('#js-results').on('mousedown', '.card-link', function (event) {
    // Store the event id, lat and lng
    switch (event.which) {
        case 1:
            var id = $(this).attr('data-event-id');
            var lat = $(this).attr('data-event-lat');
            var lng = $(this).attr('data-event-lng');
            localStorage.clear();
            localStorage.setItem('id', id);
            localStorage.setItem('lat', lat);
            localStorage.setItem('lng', lng);
            break;
        case 2:
            var id = $(this).attr('data-event-id');
            var lat = $(this).attr('data-event-lat');
            var lng = $(this).attr('data-event-lng');
            localStorage.clear();
            localStorage.setItem('id', id);
            localStorage.setItem('lat', lat);
            localStorage.setItem('lng', lng);
            break;
        case 3:
            var id = $(this).attr('data-event-id');
            var lat = $(this).attr('data-event-lat');
            var lng = $(this).attr('data-event-lng');
            localStorage.clear();
            localStorage.setItem('id', id);
            localStorage.setItem('lat', lat);
            localStorage.setItem('lng', lng);
            break;
        default:
            break;
    }
});

function checkForValue(object, keyName, textNode) {
    if (_.has(object, keyName)) {
        $(textNode).text(object[keyName]);
    } else {
        $(textNode).text('Information not found.');
    }
}

// Gets event details after the user selects an event and moves to details.html
$(document).ready(function () {
    // Current brower href
    var pageRef = window.location.href;

    // Checks if details.html or index.html is active
    if (pageRef.search('details') === -1) {
        console.log('You are on the index page');
        if (localStorage.getItem('searchKeyword')) {
            $('#js-input-search').val(
                localStorage.getItem('searchKeyword')
            );
            mainSearch();
            localStorage.removeItem('searchKeyword');
        }
    } else {
        console.log('Details page!!!');
        $('#js-btn-details-search').on('click', function (e) {
            e.preventDefault();
            searchDetails();
        });

        var detailsID = localStorage.getItem('id');
        var queryURL =
            'https://app.ticketmaster.com/discovery/v2/events/' +
            detailsID +
            '?apikey=1CDZF2AkHAO8FPwY0r3kQm6bmxI7Vuk5&locale=*&includeSpellcheck=yes';

        $.ajax({
            url: queryURL,
            method: 'GET'
        }).then(function (res) {
            searchData = res._embedded;
            console.log(res);
            console.log(searchData);

            var imgUrl = grabImg(res.images)

            $("#js-details-image").attr("src", imgUrl)

            // Adds info to the brief section
            checkForValue(res, 'name', '#js-brief-event');
            checkForValue(res.dates.start, 'localDate', '#js-brief-date');

            if (_.has(res.dates.start, "localTime")) {
                $('#js-brief-time').text(
                    moment(res.dates.start.localTime, 'HH:mm:SS').format(
                        'hh:mm A'
                    )
                );
            } else {
                $('#js-brief-time').text("No time available.")
            }
            checkForValue(
                res._embedded.venues[0],
                'name',
                '#js-brief-location'
            );
            checkForValue(
                res._embedded.venues[0].address,
                'line1',
                '#js-brief-address'
            );

            // Adds info to the details section
            checkForValue(res, 'name', '#js-details-event');
            checkForValue(res.dates.start, 'localDate', '#js-details-date');
            checkForValue(
                res._embedded.venues[0],
                'name',
                '#js-details-location'
            );
            $('#js-details-tickets').html(
                '<a href=' + res.url + " target='_blank'>Click Here"
            );
            checkForValue(
                res.classifications[0].segment,
                'name',
                '#js-details-genre'
            );
            checkForValue(res, 'pleaseNote', '#js-details-note');
            checkForValue(res, 'info', '#js-details-info');
        });
    }
});

$(window).scroll(function () {
    if ($(window).scrollTop() + $(window).height() > $(document).height() - 1 && searchDataNext !== undefined) {
        var queryURL =
            'https://app.ticketmaster.com' + searchDataNext + '&apikey=1CDZF2AkHAO8FPwY0r3kQm6bmxI7Vuk5'

        $.ajax({
            url: queryURL,
            method: 'GET'
        }).then(function (res) {
            searchData = res._embedded;
            console.log(res);
            console.log(searchData);

            if (_.has(res._links.next, "href")) {                
                searchDataNext = res._links.next.href
            } else {
                searchDataNext = undefined
            }

            // Creates cards for each matching result
            for (let i = 0; i < searchData.events.length; i++) {
                var imgUrl = grabImg(searchData.events[i].images)

                console.log('card making running');
                var newCard = $(
                    "<div class='col-12 col-md-6 col-lg-3'>"
                ).append(
                    $(
                        "<a href='./details.html' target=_blank class='card-link' data-event-id='" +
                        searchData.events[i].id +
                        "' data-event-lat='" +
                        searchData.events[i]._embedded.venues[0].location
                            .latitude +
                        "' data-event-lng='" +
                        searchData.events[i]._embedded.venues[0].location
                            .longitude +
                        "'>"
                    ).append(
                        $("<div class='card'>").append(
                            $(
                                "<img src='" +
                                imgUrl +
                                "' alt='" +
                                searchData.events[i].name +
                                "' class='card-img-top'>"
                            ),
                            $("<div class='card-body'>").append(
                                $("<h5 class='card-title'>").text(
                                    searchData.events[i].name
                                ),
                                $("<p class='card-text'>").text(
                                    searchData.events[i].dates.start.localDate
                                ),
                                $("<p class='card-text'>").text(
                                    searchData.events[i]._embedded.venues[0].name
                                )
                            )
                        )
                    )
                );
                $('#js-results').append(newCard);
            }
        });
    }
});


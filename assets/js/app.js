//==================================================
// VARIABLES
//--------------------------------------------------

var searchData;
var searchDataNext;

var siteURL = 'file:///C:/Users/izuua/BootCamp/Project-1/';

var openWeatherKey = "280deca1e7bba83d640479281597834f";
//==================================================
// FUNCTIONS
//--------------------------------------------------

function initMap() {
    var currentUrl = new URL(window.location);
    var searchParams = new URLSearchParams(currentUrl.search);
    // The location of the venue
    var location = {
        lat: parseFloat(searchParams.get("lat")),
        lng: parseFloat(searchParams.get("lng"))
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

    if (lat) {
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lng + "&APPID=" + openWeatherKey;

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (res) {

            var temp = (res.main.temp * (9 / 5) - 459.67).toFixed(1)
            var desc = res.weather[0].description
            console.log(res.main.temp);
            $("#js-details-temp").html(temp + "&deg")
            $("#js-details-weather").text(desc)
        })
    }


}

function searchDetails() {
    var searchKeyword = $('#js-input-details-search').val().trim();
    localStorage.setItem('searchKeyword', searchKeyword);
    window.open(siteURL + 'index.html?keyword=' + searchKeyword, '_blank');
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
                var eventLat = searchData.events[i]._embedded.venues[0].location.latitude
                var eventLng = searchData.events[i]._embedded.venues[0].location.longitude

                console.log('card making running');
                var newCard = $(
                    "<div class='col-12 col-md-6 col-lg-3'>"
                ).append(
                    $("<a href='./details.html?id=" + searchData.events[i].id + "&lat=" + eventLat + "&lng=" + eventLng + "' target=_blank class='card-link'>").append(
                        $("<div class='card result__card mb-md-3 mb-4'>").append(
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
                                ),
                                $("<p class='card-text'>").text(
                                    searchData.events[i]._embedded.venues[0].city.name + ", " + searchData.events[i]._embedded.venues[0].state.stateCode
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
    var currentUrl = new URL(window.location);
    var searchParams = new URLSearchParams(currentUrl.search);

    // Checks if details.html or index.html is active
    if (pageRef.search('details') === -1) {
        console.log('You are on the index page');
        if (searchParams.get("keyword") !== null && searchParams.get("keyword") !== undefined) {
            $('#js-input-search').val(
                searchParams.get("keyword")
            );
            mainSearch();

        }
    } else {
        console.log('Details page!!!');
        $('#js-btn-details-search').on('click', function (e) {
            e.preventDefault();
            searchDetails();
        });

        var currentUrl = new URL(window.location);
        var searchParams = new URLSearchParams(currentUrl.search);
        console.log(searchParams);

        var detailsID = searchParams.get("id");
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
            $("#js-brief-city").text(res._embedded.venues[0].city.name);
            $("#js-brief-state").text(res._embedded.venues[0].state.stateCode);
            $("#js-brief-zip").text(res._embedded.venues[0].postalCode);


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
                var eventLat = searchData.events[i]._embedded.venues[0].location.latitude
                var eventLng = searchData.events[i]._embedded.venues[0].location.longitude

                console.log('card making running');
                var newCard = $(
                    "<div class='col-12 col-md-6 col-lg-3'>"
                ).append(
                    $("<a href='./details.html?id=" + searchData.events[i].id + "&lat=" + eventLat + "&lng=" + eventLng + "' target=_blank class='card-link'>"
                    ).append(
                        $("<div class='card result__card mb-md-3 mb-4'>").append(
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
                                ),
                                $("<p class='card-text'>").text(
                                    searchData.events[i]._embedded.venues[0].city.name + ", " + searchData.events[i]._embedded.venues[0].state.stateCode
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


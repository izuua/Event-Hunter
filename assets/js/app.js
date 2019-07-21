// Starts a query when the "Search" button is clicked

var searchData

$("#js-btn-search").on("click", function (event) {
    event.preventDefault()

    var keyword = $("#js-input-search").val().trim()

    // Clears old search results
    $("#js-results").empty()
    $("#js-form-search")[0].reset();

    // Checks if user made an input
    if (keyword === "") {
        console.log("didnt search")
        $("#js-display-row").hide()
    } else {
        console.log("did search")
        $("#js-display-input").text(keyword)
        $("#js-display-row").show()

        var queryURL = "https://app.ticketmaster.com/discovery/v2/events?apikey=1CDZF2AkHAO8FPwY0r3kQm6bmxI7Vuk5&keyword=" + keyword + "&locale=*&includeSpellcheck=yes"

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (res) {
            searchData = res._embedded
            console.log(res)
            console.log(searchData)

            // add exception handling for no results

            //if (searchData === undefined || res._embedded === null) {
            //shows div saying "No results found"
            //return 0;
            // }

            
            // Creates cards for each matching result
            for (let i = 0; i < searchData.events.length; i++) {
                console.log("card making running");
                var newCard = $("<div class='col-12 col-md-6 col-lg-3'>").append(
                    $("<a href='./details.html' target=_blank class='card-link' data-event-id='" + searchData.events[i].id + "' data-event-lat='"+ searchData.events[i]._embedded.venues[0].location.latitude + "' data-event-lng='" + searchData.events[i]._embedded.venues[0].location.longitude + "'>").append(
                        $("<div class='card'>").append(
                            $("<img src='" + searchData.events[i].images[0].url + "' alt='" + searchData.events[i].name + "' class='card-img-top'>"),
                            $("<div class='card-body'>").append(
                                $("<h5 class='card-title'>").text(searchData.events[i].name),
                                $("<p class='card-text'>").text(searchData.events[i].dates.start.localDate),
                                $("<p class='card-text'>").text(searchData.events[i]._embedded.venues[0].name)
                            )
                        )
                    )
                )
                $("#js-results").append(newCard)
            }
        })
    }
})

// Stores data needed for details.html
$(document).on("click", ".card-link", function () {
    // Store the event id, lat and lng
    var id = $(this).attr("data-event-id")
    var lat = $(this).attr("data-event-lat")
    var lng = $(this).attr("data-event-lng")
    localStorage.clear()
    localStorage.setItem("id", id)
    localStorage.setItem("lat", lat)
    localStorage.setItem("lng", lng)
})

// Gets event details after the user selects an event and moves to details.html
$(document).ready(function () {
    // Current brower href
    var pageRef = window.location.href

    // Checks if details.html or index.html is active
    if (pageRef.search("details") === -1) {
        console.log("You are on the index page")
    } else {
        console.log("Details page!!!")
        var detailsID = localStorage.getItem("id")
        var queryURL = "https://app.ticketmaster.com/discovery/v2/events/" + detailsID + "?apikey=1CDZF2AkHAO8FPwY0r3kQm6bmxI7Vuk5&locale=*&includeSpellcheck=yes"

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (res) {
            searchData = res._embedded
            console.log(res)
            console.log(searchData)

            // Adds info to the brief section
            $("#js-brief-event").text(res.name)
            $("#js-brief-date").text(res.dates.start.localDate)
            $("#js-brief-time").text(moment(res.dates.start.localTime, "HH:mm:SS").format("hh:mm A"))
            $("#js-brief-location").text(res._embedded.venues[0].name)
            // Adds info to the details section
            $("#js-details-event").text(res.name)
            $("#js-details-date").text(res.dates.start.localDate)
            $("#js-details-location").text(res._embedded.venues[0].name)
            $("#js-details-tickets").html("<a href=" + res.url + " target='_blank'>Click Here")
            $("#js-details-genre").text(res.classifications[0].genre.name)

        })
    }
})


// // Initialize and add the map
function initMap() {
    // The location of the venue
    var location = { lat: parseFloat(localStorage.getItem("lat")), lng: parseFloat(localStorage.getItem("lng")) };
    // The map, centered at the venue
    var map = new google.maps.Map(
        document.getElementById('js-map'), { zoom: 15, center: location });
    // The marker, positioned at the venue
    var marker = new google.maps.Marker({ position: location, map: map });
}

//Authentication starts here

var firebaseConfig = {
    apiKey: "AIzaSyCw9lyWmANirY8e0lScYwItOsKhe9msPHY",
        authDomain: "event-hunter-b65f8.firebaseapp.com",
        databaseURL: "https://event-hunter-b65f8.firebaseio.com",
        projectId: "event-hunter-b65f8",
        storageBucket: "event-hunter-b65f8.appspot.com",
        messagingSenderId: "689067768056",
        appId: "1:689067768056:web:251025be5532700a"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
/**
 * Handles the sign in button press.
 */
function toggleSignIn() {
  if (firebase.auth().currentUser) {
    // [START signout]
    firebase.auth().signOut();
    // [END signout]
  } else {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    if (email.length < 4) {
      alert('Please enter an email address.');
      return;
    }
    if (password.length < 4) {
      alert('Please enter a password.');
      return;
    }
    // Sign in with email and pass.
    // [START authwithemail]
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // [START_EXCLUDE]
      if (errorCode === 'auth/wrong-password') {
        alert('Wrong password.');
      } else {
        alert(errorMessage);
      }
      console.log(error);
      document.getElementById('quickstart-sign-in').disabled = false;
      // [END_EXCLUDE]
    });
    // [END authwithemail]
  }
  document.getElementById('quickstart-sign-in').disabled = true;
}
/**
 * Handles the sign up button press.
 */
function handleSignUp() {
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  if (email.length < 4) {
    alert('Please enter an email address.');
    return;
  }
  if (password.length < 4) {
    alert('Please enter a password.');
    return;
  }
  // Sign in with email and pass.
  // [START createwithemail]
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode == 'auth/weak-password') {
      alert('The password is too weak.');
    } else {
      alert(errorMessage);
    }
    console.log(error);
    // [END_EXCLUDE]
  });
  // [END createwithemail]
}
/**
 * Sends an email verification to the user.
 */
function sendEmailVerification() {
  // [START sendemailverification]
  firebase.auth().currentUser.sendEmailVerification().then(function() {
    // Email Verification sent!
    // [START_EXCLUDE]
    alert('Email Verification Sent!');
    // [END_EXCLUDE]
  });
  // [END sendemailverification]
}
function sendPasswordReset() {
  var email = document.getElementById('email').value;
  // [START sendpasswordemail]
  firebase.auth().sendPasswordResetEmail(email).then(function() {
    // Password Reset Email Sent!
    // [START_EXCLUDE]
    alert('Password Reset Email Sent!');
    // [END_EXCLUDE]
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode == 'auth/invalid-email') {
      alert(errorMessage);
    } else if (errorCode == 'auth/user-not-found') {
      alert(errorMessage);
    }
    console.log(error);
    // [END_EXCLUDE]
  });
  // [END sendpasswordemail];
}
/**
 * initApp handles setting up UI event listeners and registering Firebase auth listeners:
 *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
 *    out, and that is where we update the UI.
 */
function initApp() {
  // Listening for auth state changes.
  // [START authstatelistener]
  firebase.auth().onAuthStateChanged(function(user) {
    // [START_EXCLUDE silent]
    document.getElementById('quickstart-verify-email').disabled = true;
    // [END_EXCLUDE]
    if (user) {
      // User is signed in.
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;
      // [START_EXCLUDE]
      document.getElementById('quickstart-sign-in-status').textContent = 'Signed in';
      document.getElementById('quickstart-sign-in').textContent = 'Sign out';
      document.getElementById('quickstart-account-details').textContent = JSON.stringify(user, null, '  ');
      if (!emailVerified) {
        document.getElementById('quickstart-verify-email').disabled = false;
      }
      // [END_EXCLUDE]
    } else {
      // User is signed out.
      // [START_EXCLUDE]
      document.getElementById('quickstart-sign-in-status').textContent = 'Signed out';
      document.getElementById('quickstart-sign-in').textContent = 'Sign in';
      document.getElementById('quickstart-account-details').textContent = 'null';
      // [END_EXCLUDE]
    }
    // [START_EXCLUDE silent]
    document.getElementById('quickstart-sign-in').disabled = false;
    // [END_EXCLUDE]
  });
  // [END authstatelistener]
  document.getElementById('quickstart-sign-in').addEventListener('click', toggleSignIn, false);
  document.getElementById('quickstart-sign-up').addEventListener('click', handleSignUp, false);
  document.getElementById('quickstart-verify-email').addEventListener('click', sendEmailVerification, false);
  document.getElementById('quickstart-password-reset').addEventListener('click', sendPasswordReset, false);
}
window.onload = function() {
  initApp();
};


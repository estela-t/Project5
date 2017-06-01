
const app = {};

app.apiKey = '2e6e8448ce627a7c4abfd88090371fd4';

app.latLong = [];

//inputOfCity stores the value of the typed city in the form
app.inputOfCity = ''; 

//ask user for geolocation
app.getGeolocation = function(){
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(success, error, options);
        // Add jQuery for loading icon/overlay
    } else {
        alert('Your browser does not support geolocation. Please enter your city manually.')
    }
    var options = {
    // enableHighAccuracy = should the device take extra time or power to return a really accurate result, or should it give you the quick (but less accurate) answer?  
    enableHighAccuracy: false, 
    // timeout = how long does the device have, in milliseconds to return a result?
    timeout: 5000,  
    // maximumAge = maximum age for a possible previously-cached position. 0 = must return the current position, not a prior cached position
    maximumAge: 0 
    };
    function success(pos){
        var latitude = Math.round(pos.coords.latitude * 100) / 100;
        var longitude = Math.round(pos.coords.longitude * 100) / 100;
        // Push lat and long into an array (Leaftlet map requires array)
        app.latLong = [latitude, longitude];
        console.log(app.latLong);
        // Add jQuery for hiding loading icon/overlay
    
        // Pass user coordinates to Leaflet to render map

        // Make a marker for user location and add to marker layer
        
        // Bring in Zomato results for top 3 restos

        // Add top three restos to DOM

    }
    function error(err){
        if (err.code == 0) {
            // Unknown error
            alert('Unknown error');
        }
        if (err.code == 1) {
            // Access denied by user
            alert('Your settings do not allow Geolocation. Please manually enter your address. Or reset location settings.');
        }
        if (err.code == 2) {
            // Position unavailable
            alert('Position unavailable');
        }
        if (err.code == 3) {
            // Timed out
            alert('Timed out');
        }
    }  
};

//create array to store cities returned from getCityByName AJAX request
const possibleCities = [];
const possibleCitiesId = [];
//get restaurant ID if geolocation is NOT used
//if geolocation is used skip this step
app.getCityByName = function (name){
  //store updated city into newCity var
  $.ajax({
        url: `https://developers.zomato.com/api/v2.1/cities`,
        method: 'GET',
        dataType: 'json',
        headers: {
            'user-key': app.apiKey
        },
        data: {
          q: name,
          count: 20,
        }
      })
      .then(function(cityMatch){
        let cityNameArray = cityMatch.location_suggestions;
        for(var i = 0; i < cityNameArray.length; i++) {
          //push cities into array
          possibleCities.push(cityNameArray[i].name);
          possibleCitiesId.push(cityNameArray[i].id);
          }
        
        console.log(possibleCitiesId);
          //append cities to page
        let cityOptions = '';
        for (var i = 0; i < possibleCities.length; i++){
          cityOptions += `<option value="${possibleCities[i]}" data-id="${possibleCitiesId[i]}">${possibleCities[i]}</option>`;
          }
          $('#items').append(cityOptions);
          //on click of selected city option from dropdown, get selected city id
          //store selected ID into variable and pass it as argument into next function
          $('select').on('change', function(){
            let optionSelected = $(this).find('option:selected').val();
            let cityIdOfSelected = $(this).find('option:selected').data('id');
          })
      // app.searchForCity();//insert city ID variable in search for city
      })
}
//end of getCityByName AJAX request//




//store city Input on click of find and update each city choice
app.updateCity = function () {
  $('#form').on('submit', function(e){
    e.preventDefault();
    inputOfCity = $('#cityInput').val();
    //pass in city input to cities AJAX request
    app.getCityByName(inputOfCity);
    $('#items').find('option').remove();
    //resets array of possibleCities to zero
    possibleCities.length = 0;
  })  
};

//pass city ID from above and dynamically insert it into new AJAX request
//searches for city by ID and returns radius, count and cuisines nearby
app.searchForCity = function (cityInformation){
  if (cityInformation.constructor === Array) {
    return $.ajax({
        url: 'https://developers.zomato.com/api/v2.1/search',
        method: 'GET',
        dataType: 'json',
        headers: {
            'user-key': app.apiKey
        },
        data: {
          entity_type: 'city',
          lat: `${cityInformation[0]}`,//lat depending on which order it's in array
          lon: `${cityInformation[1]}`,//lon depending on which order it's in array
          radius: 1000,
          count: 20,
          sort: 'rating',
          order: 'desc'
          }
        })
  } else {
//if cityInformation is NOT an array (not lon/lat), insert the city ID 
 return $.ajax({
        url: 'https://developers.zomato.com/api/v2.1/search',
        method: 'GET',
        dataType: 'json',
        headers: {
            'user-key': app.apiKey
        },
        data: {
          entity_type: 'city',
          entity_id: `${cityInformation}`,
          radius: 1000,
          count: 20,
          sort: 'rating',
          order: 'desc'
          }
      })
  }
};

//geolocation event handler
app.events = function(){
    $(".locator").on("click", function(){
    app.getGeolocation();
    });
};


app.init = function (){
    app.events();
    app.updateCity();
};

$(function(){
    app.init();
});


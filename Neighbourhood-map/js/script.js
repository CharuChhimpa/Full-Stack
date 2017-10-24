var map;

function googleError() {
    $('#query-summary').text("Google maps not loaded");
    $('#list').hide();
}
      
function initMap() {
// Create a styles array to use with the map.
    var styles = [
    {
        featureType: 'water',
        stylers: [
            { color: '#19a0d8' }
        ]
    },
    {
        featureType: 'administrative',
        elementType: 'labels.text.stroke',
        stylers: [
            { color: '#ffffff' },
            { weight: 6 }
        ]
    },
    {
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [
            { color: '#e85113' }
        ]
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [
            { color: '#efe9e4' },
            { lightness: -40 }
        ]
    },
    {
        featureType: 'transit.station',
        stylers: [
            { weight: 9 },
            { hue: '#e85113' }
        ]
    },
    {
        featureType: 'road.highway',
        elementType: 'labels.icon',
        stylers: [
            { visibility: 'off' }
        ]
    },
    {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [
            { lightness: 100 }
        ]
    },
    {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [
            { lightness: -100 }
        ]
    },
    {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [
            { visibility: 'on' },
            { color: '#f0e4d3' }
        ]
    },
    {
         featureType: 'road.highway',
         elementType: 'geometry.fill',
         stylers: [
            { color: '#efe9e4' },
            { lightness: -25 }
         ]
    }
];

    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat:  29.9090984, lng: 73.8439466},
        zoom: 13,
        styles: styles,
        mapTypeControl: false
    });
    ko.applyBindings(new AppViewModel());

}

String.prototype.contains = function (other) {
    return this.indexOf(other) !== -1;
};

//Knockout's View Model
var AppViewModel = function () {
    var self = this;

    function initialize() {
        gethotels();
    }

    var largeInfowindow = new google.maps.InfoWindow();
 
    // Style the markers a bit. This will be our listing marker icon.
    defaultIcon = makeMarkerIcon('0091ff');

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    highlightedIcon = makeMarkerIcon('FFFF24');
    
    google.maps.event.addDomListener(window, 'load', initialize);

    self.hotelList = ko.observableArray([]);
    self.query = ko.observable('');
    self.queryResult = ko.observable('');

    self.search = function () {
        //This function avoids reloading of function
    };


    //Hotels after search
    self.FilteredhotelList = ko.computed(function () {
        self.hotelList().forEach(function (hotel) {
            hotel.marker.setMap(null);
        });

        var results = ko.utils.arrayFilter(self.hotelList(), function (hotel) {
            return hotel.name().toLowerCase().contains(self.query().toLowerCase());
        });

        results.forEach(function (hotel) {
            hotel.marker.setMap(map);
        });
        if (results.length > 0) {
            if (results.length == 1) {
                self.queryResult(results.length + " Hotels are available ");
            } else {
                self.queryResult(results.length + " Hotels are available ");
            }
        }
        else {
            self.queryResult("Hotels not available");
        }
        return results;
    });
    self.queryResult("Loading");

    // This function populates the infowindow when the hotel marker is clicked and 
    // when hotel is selected from the list. We'll only allow one infowindow which will open 
    // at the marker that is clicked, and populate based on that markers position.
    self.populateInfoWindow = function (hotel) {
        largeInfowindow.setContent(hotel.formattedInfowindowData());
        largeInfowindow.open(map, hotel.marker);
        map.panTo(hotel.marker.position);
        hotel.marker.setAnimation(google.maps.Animation.BOUNCE);
        hotel.marker.setIcon(highlightedIcon);
        self.hotelList().forEach(function (unselected_hotel) {
            if (hotel != unselected_hotel) {
                unselected_hotel.marker.setAnimation(null);
                unselected_hotel.marker.setIcon(defaultIcon);
            }
        });
    };

    //This function gets all the hotels in Ganganagar
    function gethotels() {
        var data;

        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/search',
            dataType: 'json',
            data: 'client_id=JDZ2RTQ3D1VSVUOY42A5ROL0IASDWQFIPYQUO315HFBY1HC4&client_secret=ILBIH43ZVUQN4A0R3KU5IBZEX1VHXAUTHPBS10KQVMKEOXDU&v=20161016%20&ll=29.9090984,73.8439466%20&query=hotel',
            async: true,
        }).done(function (response) {
            data = response.response.venues;
            data.forEach(function (hotel) {
                foursquare = new Foursquare(hotel, map);
                self.hotelList.push(foursquare);
            });
            self.hotelList().forEach(function (hotel) {
                if (hotel.map_location()) {
                    google.maps.event.addListener(hotel.marker, 'click', function () {
                        self.populateInfoWindow(hotel);
                    });
                }
            });
        }).fail(function (response, status, error) {
            $('#query-summary').text('Hotels not loaded');
        });
    }
};

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

//Foursquare model
var Foursquare = function (hotel, map) {
    var self = this;
    self.name = ko.observable(hotel.name);
    self.location = hotel.location;
    self.lat = self.location.lat;
    self.lng = self.location.lng;
    
    self.map_location = ko.computed(function () {
        if (self.lat === 0 || self.lon === 0) {
            return null;
        } else {
            return new google.maps.LatLng(self.lat, self.lng);
        }
    });
    self.formattedAddress = ko.observable(self.location.formattedAddress);
    self.formattedPhone = ko.observable(hotel.contact.formattedPhone);
    self.marker = (function (hotel) {
        var marker;

        if (hotel.map_location()) {
            marker = new google.maps.Marker({
                position: hotel.map_location(),
                map: map,
                icon: defaultIcon
            });
        }
        return marker;
    })(self);
    self.id = ko.observable(hotel.id);
    self.url = ko.observable(hotel.url);
    self.formattedInfowindowData = function () {
        return '<div class="info-window-content">' +
            '<span class="info-window-header"><h4>' + (self.name()===undefined?'Hotel not available':self.name()) + '</h4></span>' +
            '<h6>' + (self.formattedAddress()===undefined?'No address available':self.formattedAddress())  + '<br>' + (self.formattedPhone()===undefined?'No Contact Info':self.formattedPhone()) + '</h6>' +
            '</div>';
    };
};

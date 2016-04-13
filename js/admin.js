'use strict';

$(function() {
    var baseRef = new Firebase('https://danielkatherine.firebaseio.com/');
    var rsvpRef = new Firebase('https://danielkatherine.firebaseio.com/rsvpCodes/');
    var eventsRef = new Firebase('https://danielkatherine.firebaseio.com/events/');
    var usersRef = new Firebase('https://danielkatherine.firebaseio.com/users/');

    var generateRSVP = (function() {
        var $input = $('input[name=rsvpCode]');
        var possible = 'abcdefghijklmnopqrstuvwxyz';
        var rsvpCode;
        var i;

        var generateRSVP = function() {
            rsvpCode = '';

            for (i = 0; i < 4; i++) {
                rsvpCode += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            $input.val(rsvpCode);
        };

        generateRSVP();
        
        $('[data-btn="generate-rsvp"]').on('click', function() {
            generateRSVP();
        });
    })();

    var addRSVP = (function() {
        $('[data-form=add-rsvp]').on('submit', function(e) {
            e.preventDefault();
            var rsvp = $('input[name=rsvpCode]').val();
            var guest1 = $('input[name=guest1]').val();
            var guest2 = $('input[name=guest2]').val() || ($('input[name=guest2checked]')[0].checked ? 'unknown' : false);
            var guest3 = $('input[name=guest3]').val() || ($('input[name=guest3checked]')[0].checked ? 'unknown' : false);
            var guest4 = $('input[name=guest4]').val() || ($('input[name=guest4checked]')[0].checked ? 'unknown' : false);
            var guest5 = $('input[name=guest5]').val() || ($('input[name=guest5checked]')[0].checked ? 'unknown' : false);
            var rehersalDinner = $('input[name="rehersalDinner"]')[0];
            var teaCeremony = $('input[name="teaCeremony"]')[0];
            var ceremonyReception = $('input[name="ceremonyReception"]')[0];
            var farewellBrunch = $('input[name="farewellBrunch"]')[0];

            var rsvpContainer = {}
            var rsvpData = [];
            var eventContainer = {};
            var eventData = {};
            var userContainer = {};

            rsvpData.push({
                name: guest1
            });

            if (guest2) {
                rsvpData.push({
                    name: guest2
                });
            }
            if (guest3) {
                rsvpData.push({
                    name: guest3
                });
            }
            if (guest4) {
                rsvpData.push({
                    name: guest4
                });
            }
            if (guest5) {
                rsvpData.push({
                    name: guest5
                });
            }

            rsvpContainer[rsvp] = rsvpData;
            // console.log(rsvpData);

            eventData.rehersalDinner = rehersalDinner.checked;
            eventData.teaCeremony = teaCeremony.checked;
            eventData.ceremonyReception = ceremonyReception.checked;
            eventData.farewellBrunch = farewellBrunch.checked;

            eventContainer[rsvp] = eventData;
            // console.log(eventData);

            rsvpRef.update(rsvpContainer);
            eventsRef.update(eventContainer);
            baseRef.createUser({
                email: rsvp + '@firebase.com',
                password: rsvp
            }, function(error, userData) {
                if (error) {
                    console.log(error);
                    alert(error);
                } else {
                    userContainer[userData.uid] = rsvp;
                    usersRef.update(
                        userContainer
                        , function() {
                        //location.reload();
                    });
                }
            });
        });
    })();

    var renderData = (function() {
        var rsvpNode = $('[data-anchor=rsvp-data]');
        var eventNode = $('[data-anchor=event-data]');

        rsvpRef.on('value', function(snap) {
            var data = snap.val();
            var format = '';

            Object.keys(data).map(function(key) {
                format += '<p class="lead">' + key + '</p><ul>';
                for (var i = 0; i < data[key].length; i++) {
                    format += '<li>Name: ' + data[key][i].name + '</li>';
                }
                format += '</ul>';
            });
            rsvpNode.html(format);
        });
        eventsRef.on('value', function(snap) {
            var data = snap.val();
            var format = '';

            Object.keys(data).map(function(key) {
                format += '<p class="lead">' + key + '</p><ul>';
                format += '<li>Rehersal Dinner: ' + data[key].rehersalDinner + '</li>';
                format += '<li>Tea Ceremony: ' + data[key].teaCeremony + '</li>';
                format += '<li>Ceremony and Reception: ' + data[key].ceremonyReception + '</li>';
                format += '<li>Farewell Brunch: ' + data[key].farewellBrunch + '</li>';
                format += '</ul>';
            });
            eventNode.html(format);
        });
    })();

    var handleAuthState = function(authData) {
        if (!authData) {
            location.href = "/login";
        }
    };

    baseRef.onAuth(handleAuthState);
});

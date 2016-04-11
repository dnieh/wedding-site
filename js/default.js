'use strict';

$(function() {
    var baseRef = new Firebase('https://danielkatherine.firebaseio.com/');

    var login = (function() {
        var $form = $('[data-form=login]');

        var handleLogin = function() {
            $form.on('submit', function(e) {
                var email = $('input[name=username]').val() + '@firebase.com';
                var password = $('input[name=password]').val();

                e.preventDefault();
                baseRef.authWithPassword({
                    email: email,
                    password: password
                }, function(error, authData) {
                    if (error) {
                        console.log('Login Failed!', error);
                    } else {
                        console.log('Authenticated successfully with payload:', authData);
                        location.href = "/admin";
                    }
                });
            });
        };

        handleLogin();
    })();

    var handleAuthState = function(authData) {
        if (authData) {
            console.log('User ' + authData.uid + ' is logged in with ' + authData.provider);
        } else {
            console.log('User is logged out');
        }
    };

    baseRef.onAuth(handleAuthState);
});

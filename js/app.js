(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

$(function () {
    var app = function () {
        var ratioWidth = 16;
        var ratioHeight = 9;

        var $videoContainer = $('[data-video-container]');
        var $video = $('[data-video]');
        var loginAttempts = 0;
        var $rsvpCodeForm = $('[data-form=rsvp-code]');
        var $rsvpForm = $('[data-form=rsvp]');
        var rsvpCode = undefined;
        var $welcomeText = $('[data-welcome]');
        var guestName = '';
        var guestNames = [];
        var events = {};

        var baseRef = new Firebase('https://danielkatherine.firebaseio.com/');
        var guestRef = undefined;
        var eventRef = undefined;
        var rsvpResponsesRefUrl = 'https://danielkatherine.firebaseio.com/rsvpResponses/';
        var rsvpResponsesRef = undefined;
        var rsvpResponsesRefValue = undefined;
        var rsvpInfo = undefined;
        var alreadyRsvpd = false;

        var ribsText = 'Zinfandel Braised Short Ribs with Creamy Rosemary Polenta and Grilled Vegetables';
        var chickenText = 'Stuffed Chicken Thigh with Sundried Tomatoes, Spinach, Asiago and Risotto served with Rosemary Polenta and Grilled Vegetables';
        var mushroomText = 'Portabello Mushroom Napoleans layered with Spinach, Squash and Caramelized Onions';

        var loginWithRSVP = function loginWithRSVP(rsvp, callback) {
            baseRef.authWithPassword({
                email: rsvp + '@firebase.com',
                password: rsvp
            }, function (error, authData) {
                if (error) {
                    if (loginAttempts < 2) {
                        console.log('Login Failed!', error);
                        $('.rsvp-error').removeClass('hidden-xs-up');
                    } else {
                        $('.guest-login').removeClass('hidden-xs-up');
                        console.log('Attempting to login as guest');
                        loginWithRSVP('guest', callback);
                    }
                    loginAttempts++;
                } else {
                    // console.log('Authenticated successfully with payload:', authData);
                    guestRef = new Firebase('https://danielkatherine.firebaseio.com/rsvpCodes/' + rsvp);
                    eventRef = new Firebase('https://danielkatherine.firebaseio.com/events/' + rsvp);
                    rsvpResponsesRef = new Firebase(rsvpResponsesRefUrl);
                    rsvpResponsesRefValue = new Firebase(rsvpResponsesRefUrl + rsvp);
                    guestRef.on('value', function (snap) {
                        guestNames = snap.val();
                        // smh
                        eventRef.on('value', function (snap) {
                            events = snap.val();
                            rsvpResponsesRefValue.once('value', function (snap) {
                                rsvpInfo = snap.val();
                                alreadyRsvpd = rsvpInfo !== null;
                                callback();
                            });
                        });
                    });
                }
            });
        };

        var rsvpCodeSubmit = function rsvpCodeSubmit() {
            var $rsvpInput = $('input[name=rsvp]');

            $rsvpCodeForm.on('submit', function (e) {
                var $welcomeText = $('[data-welcome]');
                rsvpCode = $rsvpInput.val().toLowerCase();

                e.preventDefault();
                $('.rsvp-error').addClass('hidden-xs-up');
                loginWithRSVP(rsvpCode, function () {
                    $(document).trigger('data.loaded');
                });
            });
        };

        var rsvpSubmit = function rsvpSubmit() {
            $rsvpForm.on('submit', function (e) {
                var formValues = $(this).serializeArray();
                var responseContainer = {};

                $('[rsvp-submit-button]').empty().append('<i class="fa fa-spin fa-spinner"></i>');

                e.preventDefault();

                // console.log(formValues);

                if (formValues[0].name === 'notcoming' && formValues[0].value === 'on') {
                    responseContainer[rsvpCode] = false;
                } else {
                    var userResponseData = {};
                    for (var i = 0; i < formValues.length; i++) {
                        if (formValues[i].name === 'noguest' || formValues[i].value === '') {
                            continue;
                        }
                        userResponseData[formValues[i].name] = formValues[i].value;
                    }
                    // console.log(userResponseData);
                    responseContainer[rsvpCode] = userResponseData;
                }

                // console.log(responseContainer);
                rsvpResponsesRef.update(responseContainer, function (error) {
                    var alertText = '<div class="alert alert-danger" role="alert">' + '<strong>Oh snap!</strong> Something went wrong. Please contact Daniel (danielnieh@gmail.com).' + '</div>';
                    var successText = '<div class="alert alert-success" role="alert">' + '<strong>Thank You!</strong> Please check back soon for updates. If you have any questions, feel free to contact daniel (danielnieh@gmail.com)' + '</div>';
                    ;

                    $('[data-rsvp-form]').addClass('hidden-xs-up');
                    $('[data-post-submission]').removeClass('hidden-xs-up');
                    if (error) {
                        $('[data-post-submission]').append(alertText);
                    } else {
                        $('[data-post-submission]').append(successText);
                    }
                });
            });
        };

        var handleEvents = function handleEvents() {
            Object.keys(events).map(function (key) {
                if (!events[key]) {
                    $('[data-event=' + key + ']').closest('.col-md-6').remove();
                }
            });
        };

        var showRsvpInfo = function showRsvpInfo() {
            var $rsvpInfo = $('[data-already-submitted]');

            $('[data-original-rsvp-message]').addClass('hidden-xs-up');
            $('[data-already-rsvpd]').removeClass('hidden-xs-up');

            var keys = Object.keys(rsvpInfo);
            var markup = '';

            if (rsvpInfo === false) {
                markup = 'Not attending.';
            } else {
                for (var i = 0; i < keys.length / 2; i++) {
                    markup += '<ul class="m-b-2">';
                    var curIndex = keys[i][keys[i].length - 1];
                    var mealOptionText = '';

                    switch (rsvpInfo['guest-option-' + curIndex]) {
                        case 'ribs':
                            mealOptionText = ribsText;
                            break;
                        case 'chicken':
                            mealOptionText = chickenText;
                            break;
                        case 'mushrooms':
                            mealOptionText = mushroomText;
                            break;
                        default:
                            break;
                    }

                    markup += '<li>Name: ' + rsvpInfo['guest-name-' + curIndex] + '</li>';
                    markup += '<li>Meal: ' + mealOptionText + '</li>';
                    markup += '</ul>';
                }
            }

            $rsvpInfo.removeClass('hidden-xs-up').append(markup);
        };

        var handleDynamicGuestInfo = function handleDynamicGuestInfo() {
            $('[data-rsvp-only]').removeClass('hidden-xs-up');
            for (var i = 1; i < guestNames.length + 1; i++) {
                var $nameEl = $('[data-guest-name-' + i + ']');
                var $optionEl = $('[data-guest-option-' + i + ']');
                var $noguestEl = $('[data-noguest=' + i + ']');
                var name = guestNames[i - 1].name !== 'unknown' ? guestNames[i - 1].name : '';

                $nameEl.removeClass('hidden-xs-up').find('input[type=text]').val(name).removeAttr('disabled').attr('required', true);
                $optionEl.removeClass('hidden-xs-up').find('select').removeAttr('disabled').attr('required', true);
                $noguestEl.removeClass('hidden-xs-up');
            }
        };

        var noGuestListener = function noGuestListener() {
            $('[data-noguest]').on('change', function () {
                var num = $(this).data('noguest');
                var $nameEl = $('[data-guest-name-' + num + ']');
                var $optionEl = $('[data-guest-option-' + num + ']');

                if ($(this).find('input')[0].checked) {
                    $nameEl.find('input').removeAttr('required').attr('disabled', true);
                    $optionEl.find('select').removeAttr('required').attr('disabled', true);
                } else {
                    $nameEl.find('input').attr('required', true).removeAttr('disabled', true);
                    $optionEl.find('select').attr('required', true).removeAttr('disabled', true);
                }
            });
        };

        var notComingListener = function notComingListener() {
            $('input[name=notcoming]').on('change', function () {
                if (this.checked) {
                    $('[data-noguest]').find('input').attr('disabled', true);
                    for (var i = 1; i < 6; i++) {
                        var $nameEl = $('[data-guest-name-' + i + ']');
                        var $optionEl = $('[data-guest-option-' + i + ']');

                        $nameEl.find('input').attr('disabled', true);
                        $optionEl.find('select').attr('disabled', true);
                    }
                } else {
                    $('[data-noguest]').find('input').removeAttr('disabled');
                    for (var i = 1; i < 6; i++) {
                        var $nameEl = $('[data-guest-name-' + i + ']');
                        var $optionEl = $('[data-guest-option-' + i + ']');

                        $nameEl.find('input').removeAttr('disabled');
                        $optionEl.find('select').removeAttr('disabled');
                    }
                }
            });
        };

        var dataLoad = function dataLoad() {
            $(document).on('data.loaded', function () {
                var $navbar = $('[data-nav=navbar]');
                var $proposalTitle = $('[data-section-title=proposal]');
                var textTop = undefined;
                var textLeft = undefined;

                guestName = guestNames[0].name;

                $navbar.removeClass('invisible').hide().fadeIn();
                $rsvpCodeForm.addClass('hidden-xs-up').fadeOut();
                $welcomeText.append($('<h3 class="welcome text-xs-center">Welcome ' + guestName + '!</h3>'));
                textTop = $(window).height() / 2 - $welcomeText.find('h3').height() / 2;
                textLeft = $(window).width() / 2 - $welcomeText.find('h3').width() / 2;
                $welcomeText.find('h3').css({
                    top: textTop + 'px',
                    left: textLeft + 'px'
                });
                $('[data-node=info]').removeClass('hidden-xs-up');

                if (guestName === 'Guest') {
                    $('[data-rsvp-anchor]').empty().append('WELCOME');
                    $('[data-rsvp-only]').remove();
                    $('[data-guest-only]').removeClass('hidden-xs-up');
                } else {
                    $('[data-guest-only]').remove();
                    handleEvents();
                    if (alreadyRsvpd) {
                        showRsvpInfo();
                    } else {
                        handleDynamicGuestInfo();
                        noGuestListener();
                        notComingListener();
                    }
                }

                $('[data-user-name]').append(guestName);
            });
        };

        var handleRatioCheck = function handleRatioCheck() {
            var ratio = $(window).height() / $(window).width();

            if (ratio > 0.562) {
                handleHeightCentricDisplay();
            } else if (ratio < 0.562) {
                handleWidthCentricDisplay();
            }
        };

        var handleHeightCentricDisplay = function handleHeightCentricDisplay() {
            var windowHeight = $(window).height();
            var newVideoWidth = ratioWidth * windowHeight / ratioHeight;

            $video.css({
                height: windowHeight,
                width: newVideoWidth,
                left: (newVideoWidth - $(window).width()) / 2 * -1
            });

            $videoContainer.css({
                height: windowHeight
            });
        };

        var handleWidthCentricDisplay = function handleWidthCentricDisplay() {
            var windowWidth = $(window).width();
            var windowHeight = $(window).height();
            var newVideoHeight = ratioHeight * windowWidth / ratioWidth;

            $video.css({
                height: newVideoHeight,
                width: windowWidth,
                left: 0,
                top: (newVideoHeight - windowHeight) / 2 * -1
            });

            $videoContainer.css({
                height: windowHeight
            });
        };

        var listenForVideoResize = function listenForVideoResize() {
            $(window).on('resize', function () {
                handleRatioCheck();
            });
        };

        var centerRsvpInput = function centerRsvpInput() {
            var $rsvpInput = $('[data-input=rsvp]');
            var heightFromTop = $(window).height() / 2 - 14;

            $rsvpInput.css('top', heightFromTop + 'px');
            // window.setTimeout(function() {
            $rsvpInput.removeClass('hidden-xs-up');
            // }, 5000);
        };

        var navScroll = function navScroll() {
            $('[data-nav-link]').on('click', function (e) {
                var target = $(this).attr('href');

                target = $(target);
                e.preventDefault();
                $('html, body').animate({
                    scrollTop: target.offset().top
                }, 1000);
            });
        };

        var init = function init() {
            rsvpCodeSubmit();
            rsvpSubmit();
            dataLoad();
            handleRatioCheck();
            listenForVideoResize();
            centerRsvpInput();
            navScroll();
        };

        return {
            init: init
        };
    }();

    app.init();
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzY3JpcHRzL2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBLEVBQUUsWUFBVztBQUNULFFBQUksTUFBTSxZQUFZO0FBQ2xCLFlBQU0sYUFBYSxFQUFiLENBRFk7QUFFbEIsWUFBTSxjQUFjLENBQWQsQ0FGWTs7QUFJbEIsWUFBSSxrQkFBa0IsRUFBRSx3QkFBRixDQUFsQixDQUpjO0FBS2xCLFlBQUksU0FBUyxFQUFFLGNBQUYsQ0FBVCxDQUxjO0FBTWxCLFlBQUksZ0JBQWdCLENBQWhCLENBTmM7QUFPbEIsWUFBSSxnQkFBZ0IsRUFBRSx1QkFBRixDQUFoQixDQVBjO0FBUWxCLFlBQUksWUFBWSxFQUFFLGtCQUFGLENBQVosQ0FSYztBQVNsQixZQUFJLG9CQUFKLENBVGtCO0FBVWxCLFlBQUksZUFBZSxFQUFFLGdCQUFGLENBQWYsQ0FWYztBQVdsQixZQUFJLFlBQVksRUFBWixDQVhjO0FBWWxCLFlBQUksYUFBYSxFQUFiLENBWmM7QUFhbEIsWUFBSSxTQUFTLEVBQVQsQ0FiYzs7QUFlbEIsWUFBSSxVQUFVLElBQUksUUFBSixDQUFhLHlDQUFiLENBQVYsQ0FmYztBQWdCbEIsWUFBSSxvQkFBSixDQWhCa0I7QUFpQmxCLFlBQUksb0JBQUosQ0FqQmtCO0FBa0JsQixZQUFJLHNCQUFzQix1REFBdEIsQ0FsQmM7QUFtQmxCLFlBQUksNEJBQUosQ0FuQmtCO0FBb0JsQixZQUFJLGlDQUFKLENBcEJrQjtBQXFCbEIsWUFBSSxvQkFBSixDQXJCa0I7QUFzQmxCLFlBQUksZUFBZSxLQUFmLENBdEJjOztBQXdCbEIsWUFBSSxXQUFXLGtGQUFYLENBeEJjO0FBeUJsQixZQUFJLGNBQWMsK0hBQWQsQ0F6QmM7QUEwQmxCLFlBQUksZUFBZSxtRkFBZixDQTFCYzs7QUE0QmxCLFlBQUksZ0JBQWdCLFNBQWhCLGFBQWdC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QUksT0FBTyxTQUFQLElBQU8sR0FBVztBQUNsQiw2QkFEa0I7QUFFbEIseUJBRmtCO0FBR2xCLHVCQUhrQjtBQUlsQiwrQkFKa0I7QUFLbEIsbUNBTGtCO0FBTWxCLDhCQU5rQjtBQU9sQix3QkFQa0I7U0FBWCxDQS9XTzs7QUF5WGxCLGVBQU87QUFDSCxrQkFBTSxJQUFOO1NBREosQ0F6WGtCO0tBQVgsRUFBUCxDQURLOztBQStYVCxRQUFJLElBQUosR0EvWFM7Q0FBWCxDQUFGIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuJChmdW5jdGlvbigpIHtcbiAgICBsZXQgYXBwID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCByYXRpb1dpZHRoID0gMTY7XG4gICAgICAgIGNvbnN0IHJhdGlvSGVpZ2h0ID0gOTtcblxuICAgICAgICBsZXQgJHZpZGVvQ29udGFpbmVyID0gJCgnW2RhdGEtdmlkZW8tY29udGFpbmVyXScpO1xuICAgICAgICBsZXQgJHZpZGVvID0gJCgnW2RhdGEtdmlkZW9dJyk7XG4gICAgICAgIGxldCBsb2dpbkF0dGVtcHRzID0gMDtcbiAgICAgICAgbGV0ICRyc3ZwQ29kZUZvcm0gPSAkKCdbZGF0YS1mb3JtPXJzdnAtY29kZV0nKTtcbiAgICAgICAgbGV0ICRyc3ZwRm9ybSA9ICQoJ1tkYXRhLWZvcm09cnN2cF0nKTtcbiAgICAgICAgbGV0IHJzdnBDb2RlO1xuICAgICAgICBsZXQgJHdlbGNvbWVUZXh0ID0gJCgnW2RhdGEtd2VsY29tZV0nKTtcbiAgICAgICAgbGV0IGd1ZXN0TmFtZSA9ICcnO1xuICAgICAgICBsZXQgZ3Vlc3ROYW1lcyA9IFtdO1xuICAgICAgICBsZXQgZXZlbnRzID0ge307XG5cbiAgICAgICAgbGV0IGJhc2VSZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vZGFuaWVsa2F0aGVyaW5lLmZpcmViYXNlaW8uY29tLycpO1xuICAgICAgICBsZXQgZ3Vlc3RSZWY7XG4gICAgICAgIGxldCBldmVudFJlZjtcbiAgICAgICAgbGV0IHJzdnBSZXNwb25zZXNSZWZVcmwgPSAnaHR0cHM6Ly9kYW5pZWxrYXRoZXJpbmUuZmlyZWJhc2Vpby5jb20vcnN2cFJlc3BvbnNlcy8nO1xuICAgICAgICBsZXQgcnN2cFJlc3BvbnNlc1JlZjtcbiAgICAgICAgbGV0IHJzdnBSZXNwb25zZXNSZWZWYWx1ZTtcbiAgICAgICAgbGV0IHJzdnBJbmZvO1xuICAgICAgICBsZXQgYWxyZWFkeVJzdnBkID0gZmFsc2U7XG5cbiAgICAgICAgbGV0IHJpYnNUZXh0ID0gJ1ppbmZhbmRlbCBCcmFpc2VkIFNob3J0IFJpYnMgd2l0aCBDcmVhbXkgUm9zZW1hcnkgUG9sZW50YSBhbmQgR3JpbGxlZCBWZWdldGFibGVzJztcbiAgICAgICAgbGV0IGNoaWNrZW5UZXh0ID0gJ1N0dWZmZWQgQ2hpY2tlbiBUaGlnaCB3aXRoIFN1bmRyaWVkIFRvbWF0b2VzLCBTcGluYWNoLCBBc2lhZ28gYW5kIFJpc290dG8gc2VydmVkIHdpdGggUm9zZW1hcnkgUG9sZW50YSBhbmQgR3JpbGxlZCBWZWdldGFibGVzJztcbiAgICAgICAgbGV0IG11c2hyb29tVGV4dCA9ICdQb3J0YWJlbGxvIE11c2hyb29tIE5hcG9sZWFucyBsYXllcmVkIHdpdGggU3BpbmFjaCwgU3F1YXNoIGFuZCBDYXJhbWVsaXplZCBPbmlvbnMnO1xuXG4gICAgICAgIGxldCBsb2dpbldpdGhSU1ZQID0gZnVuY3Rpb24ocnN2cCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGJhc2VSZWYuYXV0aFdpdGhQYXNzd29yZCh7XG4gICAgICAgICAgICAgICAgZW1haWw6IHJzdnAgKyAnQGZpcmViYXNlLmNvbScsXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHJzdnBcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yLCBhdXRoRGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAobG9naW5BdHRlbXB0cyA8IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdMb2dpbiBGYWlsZWQhJywgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnJzdnAtZXJyb3InKS5yZW1vdmVDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuZ3Vlc3QtbG9naW4nKS5yZW1vdmVDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQXR0ZW1wdGluZyB0byBsb2dpbiBhcyBndWVzdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9naW5XaXRoUlNWUCgnZ3Vlc3QnLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbG9naW5BdHRlbXB0cysrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdBdXRoZW50aWNhdGVkIHN1Y2Nlc3NmdWxseSB3aXRoIHBheWxvYWQ6JywgYXV0aERhdGEpO1xuICAgICAgICAgICAgICAgICAgICBndWVzdFJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9kYW5pZWxrYXRoZXJpbmUuZmlyZWJhc2Vpby5jb20vcnN2cENvZGVzLycgKyByc3ZwKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRSZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vZGFuaWVsa2F0aGVyaW5lLmZpcmViYXNlaW8uY29tL2V2ZW50cy8nICsgcnN2cCk7XG4gICAgICAgICAgICAgICAgICAgIHJzdnBSZXNwb25zZXNSZWYgPSBuZXcgRmlyZWJhc2UocnN2cFJlc3BvbnNlc1JlZlVybCk7XG4gICAgICAgICAgICAgICAgICAgIHJzdnBSZXNwb25zZXNSZWZWYWx1ZSA9IG5ldyBGaXJlYmFzZShyc3ZwUmVzcG9uc2VzUmVmVXJsICsgcnN2cCk7XG4gICAgICAgICAgICAgICAgICAgIGd1ZXN0UmVmLm9uKCd2YWx1ZScsIChzbmFwKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBndWVzdE5hbWVzID0gc25hcC52YWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNtaFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRSZWYub24oJ3ZhbHVlJywgKHNuYXApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudHMgPSBzbmFwLnZhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJzdnBSZXNwb25zZXNSZWZWYWx1ZS5vbmNlKCd2YWx1ZScsIChzbmFwKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJzdnBJbmZvID0gc25hcC52YWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxyZWFkeVJzdnBkID0gcnN2cEluZm8gIT09IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICBsZXQgcnN2cENvZGVTdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCAkcnN2cElucHV0ID0gJCgnaW5wdXRbbmFtZT1yc3ZwXScpO1xuXG4gICAgICAgICAgICAkcnN2cENvZGVGb3JtLm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCAkd2VsY29tZVRleHQgPSAkKCdbZGF0YS13ZWxjb21lXScpO1xuICAgICAgICAgICAgICAgIHJzdnBDb2RlID0gJHJzdnBJbnB1dC52YWwoKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICQoJy5yc3ZwLWVycm9yJykuYWRkQ2xhc3MoJ2hpZGRlbi14cy11cCcpO1xuICAgICAgICAgICAgICAgIGxvZ2luV2l0aFJTVlAocnN2cENvZGUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdkYXRhLmxvYWRlZCcpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHJzdnBTdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRyc3ZwRm9ybS5vbignc3VibWl0JywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGxldCBmb3JtVmFsdWVzID0gJCh0aGlzKS5zZXJpYWxpemVBcnJheSgpO1xuICAgICAgICAgICAgICAgIGxldCByZXNwb25zZUNvbnRhaW5lciA9IHt9O1xuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJCgnW3JzdnAtc3VibWl0LWJ1dHRvbl0nKS5lbXB0eSgpLmFwcGVuZCgnPGkgY2xhc3M9XCJmYSBmYS1zcGluIGZhLXNwaW5uZXJcIj48L2k+Jyk7XG5cbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhmb3JtVmFsdWVzKTtcblxuICAgICAgICAgICAgICAgIGlmIChmb3JtVmFsdWVzWzBdLm5hbWUgPT09ICdub3Rjb21pbmcnICYmIGZvcm1WYWx1ZXNbMF0udmFsdWUgPT09ICdvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2VDb250YWluZXJbcnN2cENvZGVdID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB1c2VyUmVzcG9uc2VEYXRhID0ge307XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZm9ybVZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZvcm1WYWx1ZXNbaV0ubmFtZSA9PT0gJ25vZ3Vlc3QnIHx8IGZvcm1WYWx1ZXNbaV0udmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyUmVzcG9uc2VEYXRhW2Zvcm1WYWx1ZXNbaV0ubmFtZV0gPSBmb3JtVmFsdWVzW2ldLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHVzZXJSZXNwb25zZURhdGEpO1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZUNvbnRhaW5lcltyc3ZwQ29kZV0gPSB1c2VyUmVzcG9uc2VEYXRhO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHJlc3BvbnNlQ29udGFpbmVyKTtcbiAgICAgICAgICAgICAgICByc3ZwUmVzcG9uc2VzUmVmLnVwZGF0ZShyZXNwb25zZUNvbnRhaW5lciwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFsZXJ0VGV4dCA9ICc8ZGl2IGNsYXNzPVwiYWxlcnQgYWxlcnQtZGFuZ2VyXCIgcm9sZT1cImFsZXJ0XCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPHN0cm9uZz5PaCBzbmFwITwvc3Ryb25nPiBTb21ldGhpbmcgd2VudCB3cm9uZy4gUGxlYXNlIGNvbnRhY3QgRGFuaWVsIChkYW5pZWxuaWVoQGdtYWlsLmNvbSkuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JztcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN1Y2Nlc3NUZXh0ID0gJzxkaXYgY2xhc3M9XCJhbGVydCBhbGVydC1zdWNjZXNzXCIgcm9sZT1cImFsZXJ0XCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPHN0cm9uZz5UaGFuayBZb3UhPC9zdHJvbmc+IFBsZWFzZSBjaGVjayBiYWNrIHNvb24gZm9yIHVwZGF0ZXMuIElmIHlvdSBoYXZlIGFueSBxdWVzdGlvbnMsIGZlZWwgZnJlZSB0byBjb250YWN0IGRhbmllbCAoZGFuaWVsbmllaEBnbWFpbC5jb20pJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JztcbjtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICQoJ1tkYXRhLXJzdnAtZm9ybV0nKS5hZGRDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG4gICAgICAgICAgICAgICAgICAgICQoJ1tkYXRhLXBvc3Qtc3VibWlzc2lvbl0nKS5yZW1vdmVDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnW2RhdGEtcG9zdC1zdWJtaXNzaW9uXScpLmFwcGVuZChhbGVydFRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnW2RhdGEtcG9zdC1zdWJtaXNzaW9uXScpLmFwcGVuZChzdWNjZXNzVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBoYW5kbGVFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGV2ZW50cykubWFwKChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWV2ZW50c1trZXldKSB7XG4gICAgICAgICAgICAgICAgICAgICQoJ1tkYXRhLWV2ZW50PScgKyBrZXkgKyAnXScpLmNsb3Nlc3QoJy5jb2wtbWQtNicpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBzaG93UnN2cEluZm8gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCAkcnN2cEluZm8gPSAkKCdbZGF0YS1hbHJlYWR5LXN1Ym1pdHRlZF0nKTtcblxuICAgICAgICAgICAgJCgnW2RhdGEtb3JpZ2luYWwtcnN2cC1tZXNzYWdlXScpLmFkZENsYXNzKCdoaWRkZW4teHMtdXAnKTtcbiAgICAgICAgICAgICQoJ1tkYXRhLWFscmVhZHktcnN2cGRdJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbi14cy11cCcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKHJzdnBJbmZvKTtcbiAgICAgICAgICAgIGxldCBtYXJrdXAgPSAnJztcblxuICAgICAgICAgICAgaWYgKHJzdnBJbmZvID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIG1hcmt1cCA9ICdOb3QgYXR0ZW5kaW5nLic7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGggLyAyOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgbWFya3VwICs9ICc8dWwgY2xhc3M9XCJtLWItMlwiPic7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJJbmRleCA9IGtleXNbaV1ba2V5c1tpXS5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1lYWxPcHRpb25UZXh0ID0gJyc7XG5cbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChyc3ZwSW5mb1snZ3Vlc3Qtb3B0aW9uLScgKyBjdXJJbmRleF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JpYnMnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lYWxPcHRpb25UZXh0ID0gcmlic1RleHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdjaGlja2VuJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZWFsT3B0aW9uVGV4dCA9IGNoaWNrZW5UZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbXVzaHJvb21zJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZWFsT3B0aW9uVGV4dCA9IG11c2hyb29tVGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBtYXJrdXAgKz0gJzxsaT5OYW1lOiAnICsgcnN2cEluZm9bJ2d1ZXN0LW5hbWUtJyArIGN1ckluZGV4XSArICc8L2xpPic7XG4gICAgICAgICAgICAgICAgICAgIG1hcmt1cCArPSAnPGxpPk1lYWw6ICcgKyBtZWFsT3B0aW9uVGV4dCArICc8L2xpPic7XG4gICAgICAgICAgICAgICAgICAgIG1hcmt1cCArPSAnPC91bD4nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJHJzdnBJbmZvLnJlbW92ZUNsYXNzKCdoaWRkZW4teHMtdXAnKS5hcHBlbmQobWFya3VwKTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBoYW5kbGVEeW5hbWljR3Vlc3RJbmZvID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKCdbZGF0YS1yc3ZwLW9ubHldJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbi14cy11cCcpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBndWVzdE5hbWVzLmxlbmd0aCArIDE7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCAkbmFtZUVsID0gJCgnW2RhdGEtZ3Vlc3QtbmFtZS0nICsgaSArICddJyk7XG4gICAgICAgICAgICAgICAgbGV0ICRvcHRpb25FbCA9ICQoJ1tkYXRhLWd1ZXN0LW9wdGlvbi0nICsgaSArJ10nKTtcbiAgICAgICAgICAgICAgICBsZXQgJG5vZ3Vlc3RFbCA9ICQoJ1tkYXRhLW5vZ3Vlc3Q9JyArIGkgKyAnXScpO1xuICAgICAgICAgICAgICAgIGxldCBuYW1lID0gZ3Vlc3ROYW1lc1tpIC0gMV0ubmFtZSAhPT0gJ3Vua25vd24nID8gZ3Vlc3ROYW1lc1tpIC0gMV0ubmFtZSA6ICcnO1xuXG4gICAgICAgICAgICAgICAgJG5hbWVFbFxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2hpZGRlbi14cy11cCcpXG4gICAgICAgICAgICAgICAgICAgIC5maW5kKCdpbnB1dFt0eXBlPXRleHRdJylcbiAgICAgICAgICAgICAgICAgICAgLnZhbChuYW1lKVxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignZGlzYWJsZWQnKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cigncmVxdWlyZWQnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAkb3B0aW9uRWxcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdoaWRkZW4teHMtdXAnKVxuICAgICAgICAgICAgICAgICAgICAuZmluZCgnc2VsZWN0JylcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJylcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3JlcXVpcmVkJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgJG5vZ3Vlc3RFbC5yZW1vdmVDbGFzcygnaGlkZGVuLXhzLXVwJylcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgbm9HdWVzdExpc3RlbmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKCdbZGF0YS1ub2d1ZXN0XScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBsZXQgbnVtID0gJCh0aGlzKS5kYXRhKCdub2d1ZXN0Jyk7XG4gICAgICAgICAgICAgICAgbGV0ICRuYW1lRWwgPSAkKCdbZGF0YS1ndWVzdC1uYW1lLScgKyBudW0gKyAnXScpO1xuICAgICAgICAgICAgICAgIGxldCAkb3B0aW9uRWwgPSAkKCdbZGF0YS1ndWVzdC1vcHRpb24tJyArIG51bSArICddJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoJCh0aGlzKS5maW5kKCdpbnB1dCcpWzBdLmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgJG5hbWVFbFxuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmQoJ2lucHV0JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdyZXF1aXJlZCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgJG9wdGlvbkVsXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmluZCgnc2VsZWN0JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdyZXF1aXJlZCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkbmFtZUVsXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmluZCgnaW5wdXQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3JlcXVpcmVkJywgdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAkb3B0aW9uRWxcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKCdzZWxlY3QnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3JlcXVpcmVkJywgdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBub3RDb21pbmdMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1ub3Rjb21pbmddJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnW2RhdGEtbm9ndWVzdF0nKS5maW5kKCdpbnB1dCcpLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgNjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgJG5hbWVFbCA9ICQoJ1tkYXRhLWd1ZXN0LW5hbWUtJyArIGkgKyAnXScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0ICRvcHRpb25FbCA9ICQoJ1tkYXRhLWd1ZXN0LW9wdGlvbi0nICsgaSArICddJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRuYW1lRWwuZmluZCgnaW5wdXQnKS5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJG9wdGlvbkVsLmZpbmQoJ3NlbGVjdCcpLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkKCdbZGF0YS1ub2d1ZXN0XScpLmZpbmQoJ2lucHV0JykucmVtb3ZlQXR0cignZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCA2OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCAkbmFtZUVsID0gJCgnW2RhdGEtZ3Vlc3QtbmFtZS0nICsgaSArICddJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgJG9wdGlvbkVsID0gJCgnW2RhdGEtZ3Vlc3Qtb3B0aW9uLScgKyBpICsgJ10nKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJG5hbWVFbC5maW5kKCdpbnB1dCcpLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkb3B0aW9uRWwuZmluZCgnc2VsZWN0JykucmVtb3ZlQXR0cignZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgZGF0YUxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdkYXRhLmxvYWRlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGxldCAkbmF2YmFyID0gJCgnW2RhdGEtbmF2PW5hdmJhcl0nKTtcbiAgICAgICAgICAgICAgICBsZXQgJHByb3Bvc2FsVGl0bGUgPSAkKCdbZGF0YS1zZWN0aW9uLXRpdGxlPXByb3Bvc2FsXScpO1xuICAgICAgICAgICAgICAgIGxldCB0ZXh0VG9wO1xuICAgICAgICAgICAgICAgIGxldCB0ZXh0TGVmdDtcblxuICAgICAgICAgICAgICAgIGd1ZXN0TmFtZSA9IGd1ZXN0TmFtZXNbMF0ubmFtZTtcblxuICAgICAgICAgICAgICAgICRuYXZiYXIucmVtb3ZlQ2xhc3MoJ2ludmlzaWJsZScpLmhpZGUoKS5mYWRlSW4oKTtcbiAgICAgICAgICAgICAgICAkcnN2cENvZGVGb3JtLmFkZENsYXNzKCdoaWRkZW4teHMtdXAnKS5mYWRlT3V0KCk7XG4gICAgICAgICAgICAgICAgJHdlbGNvbWVUZXh0LmFwcGVuZCgkKCc8aDMgY2xhc3M9XCJ3ZWxjb21lIHRleHQteHMtY2VudGVyXCI+V2VsY29tZSAnICsgZ3Vlc3ROYW1lICsgJyE8L2gzPicpKTtcbiAgICAgICAgICAgICAgICB0ZXh0VG9wID0gJCh3aW5kb3cpLmhlaWdodCgpIC8gMiAtICR3ZWxjb21lVGV4dC5maW5kKCdoMycpLmhlaWdodCgpIC8gMjtcbiAgICAgICAgICAgICAgICB0ZXh0TGVmdCA9ICQod2luZG93KS53aWR0aCgpIC8gMiAtICR3ZWxjb21lVGV4dC5maW5kKCdoMycpLndpZHRoKCkgLyAyO1xuICAgICAgICAgICAgICAgICR3ZWxjb21lVGV4dC5maW5kKCdoMycpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHRvcDogdGV4dFRvcCArICdweCcsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHRleHRMZWZ0ICsgJ3B4J1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICQoJ1tkYXRhLW5vZGU9aW5mb10nKS5yZW1vdmVDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZ3Vlc3ROYW1lID09PSAnR3Vlc3QnKSB7XG4gICAgICAgICAgICAgICAgICAgICQoJ1tkYXRhLXJzdnAtYW5jaG9yXScpLmVtcHR5KCkuYXBwZW5kKCdXRUxDT01FJyk7XG4gICAgICAgICAgICAgICAgICAgICQoJ1tkYXRhLXJzdnAtb25seV0nKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnW2RhdGEtZ3Vlc3Qtb25seV0nKS5yZW1vdmVDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnW2RhdGEtZ3Vlc3Qtb25seV0nKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlRXZlbnRzKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhbHJlYWR5UnN2cGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3dSc3ZwSW5mbygpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlRHluYW1pY0d1ZXN0SW5mbygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9HdWVzdExpc3RlbmVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBub3RDb21pbmdMaXN0ZW5lcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdXNlci1uYW1lXScpLmFwcGVuZChndWVzdE5hbWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGhhbmRsZVJhdGlvQ2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCByYXRpbyA9ICQod2luZG93KS5oZWlnaHQoKSAvICQod2luZG93KS53aWR0aCgpO1xuXG4gICAgICAgICAgICBpZiAocmF0aW8gPiAwLjU2Mikge1xuICAgICAgICAgICAgICAgIGhhbmRsZUhlaWdodENlbnRyaWNEaXNwbGF5KCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJhdGlvIDwgMC41NjIpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVXaWR0aENlbnRyaWNEaXNwbGF5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGhhbmRsZUhlaWdodENlbnRyaWNEaXNwbGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgd2luZG93SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuICAgICAgICAgICAgbGV0IG5ld1ZpZGVvV2lkdGggPSByYXRpb1dpZHRoICogd2luZG93SGVpZ2h0IC8gcmF0aW9IZWlnaHQ7XG5cbiAgICAgICAgICAgICR2aWRlby5jc3Moe1xuICAgICAgICAgICAgICAgIGhlaWdodDogd2luZG93SGVpZ2h0LFxuICAgICAgICAgICAgICAgIHdpZHRoOiBuZXdWaWRlb1dpZHRoLFxuICAgICAgICAgICAgICAgIGxlZnQ6IChuZXdWaWRlb1dpZHRoIC0gJCh3aW5kb3cpLndpZHRoKCkpIC8gMiAqIC0xXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJHZpZGVvQ29udGFpbmVyLmNzcyh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB3aW5kb3dIZWlnaHQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgaGFuZGxlV2lkdGhDZW50cmljRGlzcGxheSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0IHdpbmRvd1dpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XG4gICAgICAgICAgICBsZXQgd2luZG93SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuICAgICAgICAgICAgbGV0IG5ld1ZpZGVvSGVpZ2h0ID0gcmF0aW9IZWlnaHQgKiB3aW5kb3dXaWR0aCAvIHJhdGlvV2lkdGg7XG4gXG4gICAgICAgICAgICAkdmlkZW8uY3NzKHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IG5ld1ZpZGVvSGVpZ2h0LFxuICAgICAgICAgICAgICAgIHdpZHRoOiB3aW5kb3dXaWR0aCxcbiAgICAgICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgICAgIHRvcDogKG5ld1ZpZGVvSGVpZ2h0IC0gd2luZG93SGVpZ2h0KSAvIDIgKiAtMVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICR2aWRlb0NvbnRhaW5lci5jc3Moe1xuICAgICAgICAgICAgICAgIGhlaWdodDogd2luZG93SGVpZ2h0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgbGlzdGVuRm9yVmlkZW9SZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlUmF0aW9DaGVjaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cblxuICAgICAgICBsZXQgY2VudGVyUnN2cElucHV0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgJHJzdnBJbnB1dCA9ICQoJ1tkYXRhLWlucHV0PXJzdnBdJyk7XG4gICAgICAgICAgICBsZXQgaGVpZ2h0RnJvbVRvcCA9ICgkKHdpbmRvdykuaGVpZ2h0KCkgLyAyIC0gMTQpO1xuXG4gICAgICAgICAgICAkcnN2cElucHV0LmNzcygndG9wJywgaGVpZ2h0RnJvbVRvcCArICdweCcpO1xuICAgICAgICAgICAgLy8gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJHJzdnBJbnB1dC5yZW1vdmVDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG4gICAgICAgICAgICAvLyB9LCA1MDAwKTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgbmF2U2Nyb2xsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKCdbZGF0YS1uYXYtbGlua10nKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgbGV0IHRhcmdldCA9ICQodGhpcykuYXR0cignaHJlZicpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRhcmdldCA9ICQodGFyZ2V0KTtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICBzY3JvbGxUb3A6IHRhcmdldC5vZmZzZXQoKS50b3BcbiAgICAgICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBpbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByc3ZwQ29kZVN1Ym1pdCgpO1xuICAgICAgICAgICAgcnN2cFN1Ym1pdCgpO1xuICAgICAgICAgICAgZGF0YUxvYWQoKTsgXG4gICAgICAgICAgICBoYW5kbGVSYXRpb0NoZWNrKCk7XG4gICAgICAgICAgICBsaXN0ZW5Gb3JWaWRlb1Jlc2l6ZSgpO1xuICAgICAgICAgICAgY2VudGVyUnN2cElucHV0KCk7XG4gICAgICAgICAgICBuYXZTY3JvbGwoKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW5pdDogaW5pdFxuICAgICAgICB9O1xuICAgIH0pKCk7XG5cbiAgICBhcHAuaW5pdCgpO1xufSk7XG4iXX0=

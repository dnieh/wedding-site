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

                console.log(formValues);

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
                    console.log(userResponseData);
                    responseContainer[rsvpCode] = userResponseData;
                }

                console.log(responseContainer);
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
                    markup += '<li>Name: ' + rsvpInfo['guest-name-' + curIndex] + '</li>';
                    markup += '<li>Meal: ' + rsvpInfo['guest-option-' + curIndex] + '</li>';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzY3JpcHRzL2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBLEVBQUUsWUFBVztBQUNULFFBQUksTUFBTSxZQUFZO0FBQ2xCLFlBQU0sYUFBYSxFQUFiLENBRFk7QUFFbEIsWUFBTSxjQUFjLENBQWQsQ0FGWTs7QUFJbEIsWUFBSSxrQkFBa0IsRUFBRSx3QkFBRixDQUFsQixDQUpjO0FBS2xCLFlBQUksU0FBUyxFQUFFLGNBQUYsQ0FBVCxDQUxjO0FBTWxCLFlBQUksZ0JBQWdCLENBQWhCLENBTmM7QUFPbEIsWUFBSSxnQkFBZ0IsRUFBRSx1QkFBRixDQUFoQixDQVBjO0FBUWxCLFlBQUksWUFBWSxFQUFFLGtCQUFGLENBQVosQ0FSYztBQVNsQixZQUFJLG9CQUFKLENBVGtCO0FBVWxCLFlBQUksZUFBZSxFQUFFLGdCQUFGLENBQWYsQ0FWYztBQVdsQixZQUFJLFlBQVksRUFBWixDQVhjO0FBWWxCLFlBQUksYUFBYSxFQUFiLENBWmM7QUFhbEIsWUFBSSxTQUFTLEVBQVQsQ0FiYzs7QUFlbEIsWUFBSSxVQUFVLElBQUksUUFBSixDQUFhLHlDQUFiLENBQVYsQ0FmYztBQWdCbEIsWUFBSSxvQkFBSixDQWhCa0I7QUFpQmxCLFlBQUksb0JBQUosQ0FqQmtCO0FBa0JsQixZQUFJLHNCQUFzQix1REFBdEIsQ0FsQmM7QUFtQmxCLFlBQUksNEJBQUosQ0FuQmtCO0FBb0JsQixZQUFJLGlDQUFKLENBcEJrQjtBQXFCbEIsWUFBSSxvQkFBSixDQXJCa0I7QUFzQmxCLFlBQUksZUFBZSxLQUFmLENBdEJjOztBQXdCbEIsWUFBSSxnQkFBZ0IsU0FBaEIsYUFBZ0IsQ0FBUyxJQUFULEVBQWUsUUFBZixFQUF5QjtBQUN6QyxvQkFBUSxnQkFBUixDQUF5QjtBQUNyQix1QkFBTyxPQUFPLGVBQVA7QUFDUCwwQkFBVSxJQUFW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anMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbiQoZnVuY3Rpb24oKSB7XG4gICAgbGV0IGFwcCA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgcmF0aW9XaWR0aCA9IDE2O1xuICAgICAgICBjb25zdCByYXRpb0hlaWdodCA9IDk7XG5cbiAgICAgICAgbGV0ICR2aWRlb0NvbnRhaW5lciA9ICQoJ1tkYXRhLXZpZGVvLWNvbnRhaW5lcl0nKTtcbiAgICAgICAgbGV0ICR2aWRlbyA9ICQoJ1tkYXRhLXZpZGVvXScpO1xuICAgICAgICBsZXQgbG9naW5BdHRlbXB0cyA9IDA7XG4gICAgICAgIGxldCAkcnN2cENvZGVGb3JtID0gJCgnW2RhdGEtZm9ybT1yc3ZwLWNvZGVdJyk7XG4gICAgICAgIGxldCAkcnN2cEZvcm0gPSAkKCdbZGF0YS1mb3JtPXJzdnBdJyk7XG4gICAgICAgIGxldCByc3ZwQ29kZTtcbiAgICAgICAgbGV0ICR3ZWxjb21lVGV4dCA9ICQoJ1tkYXRhLXdlbGNvbWVdJyk7XG4gICAgICAgIGxldCBndWVzdE5hbWUgPSAnJztcbiAgICAgICAgbGV0IGd1ZXN0TmFtZXMgPSBbXTtcbiAgICAgICAgbGV0IGV2ZW50cyA9IHt9O1xuXG4gICAgICAgIGxldCBiYXNlUmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2RhbmllbGthdGhlcmluZS5maXJlYmFzZWlvLmNvbS8nKTtcbiAgICAgICAgbGV0IGd1ZXN0UmVmO1xuICAgICAgICBsZXQgZXZlbnRSZWY7XG4gICAgICAgIGxldCByc3ZwUmVzcG9uc2VzUmVmVXJsID0gJ2h0dHBzOi8vZGFuaWVsa2F0aGVyaW5lLmZpcmViYXNlaW8uY29tL3JzdnBSZXNwb25zZXMvJztcbiAgICAgICAgbGV0IHJzdnBSZXNwb25zZXNSZWY7XG4gICAgICAgIGxldCByc3ZwUmVzcG9uc2VzUmVmVmFsdWU7XG4gICAgICAgIGxldCByc3ZwSW5mbztcbiAgICAgICAgbGV0IGFscmVhZHlSc3ZwZCA9IGZhbHNlO1xuXG4gICAgICAgIGxldCBsb2dpbldpdGhSU1ZQID0gZnVuY3Rpb24ocnN2cCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGJhc2VSZWYuYXV0aFdpdGhQYXNzd29yZCh7XG4gICAgICAgICAgICAgICAgZW1haWw6IHJzdnAgKyAnQGZpcmViYXNlLmNvbScsXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHJzdnBcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yLCBhdXRoRGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAobG9naW5BdHRlbXB0cyA8IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdMb2dpbiBGYWlsZWQhJywgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnJzdnAtZXJyb3InKS5yZW1vdmVDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuZ3Vlc3QtbG9naW4nKS5yZW1vdmVDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQXR0ZW1wdGluZyB0byBsb2dpbiBhcyBndWVzdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9naW5XaXRoUlNWUCgnZ3Vlc3QnLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbG9naW5BdHRlbXB0cysrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdBdXRoZW50aWNhdGVkIHN1Y2Nlc3NmdWxseSB3aXRoIHBheWxvYWQ6JywgYXV0aERhdGEpO1xuICAgICAgICAgICAgICAgICAgICBndWVzdFJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9kYW5pZWxrYXRoZXJpbmUuZmlyZWJhc2Vpby5jb20vcnN2cENvZGVzLycgKyByc3ZwKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRSZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vZGFuaWVsa2F0aGVyaW5lLmZpcmViYXNlaW8uY29tL2V2ZW50cy8nICsgcnN2cCk7XG4gICAgICAgICAgICAgICAgICAgIHJzdnBSZXNwb25zZXNSZWYgPSBuZXcgRmlyZWJhc2UocnN2cFJlc3BvbnNlc1JlZlVybCk7XG4gICAgICAgICAgICAgICAgICAgIHJzdnBSZXNwb25zZXNSZWZWYWx1ZSA9IG5ldyBGaXJlYmFzZShyc3ZwUmVzcG9uc2VzUmVmVXJsICsgcnN2cCk7XG4gICAgICAgICAgICAgICAgICAgIGd1ZXN0UmVmLm9uKCd2YWx1ZScsIChzbmFwKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBndWVzdE5hbWVzID0gc25hcC52YWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNtaFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRSZWYub24oJ3ZhbHVlJywgKHNuYXApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudHMgPSBzbmFwLnZhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJzdnBSZXNwb25zZXNSZWZWYWx1ZS5vbmNlKCd2YWx1ZScsIChzbmFwKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJzdnBJbmZvID0gc25hcC52YWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxyZWFkeVJzdnBkID0gcnN2cEluZm8gIT09IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICBsZXQgcnN2cENvZGVTdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCAkcnN2cElucHV0ID0gJCgnaW5wdXRbbmFtZT1yc3ZwXScpO1xuXG4gICAgICAgICAgICAkcnN2cENvZGVGb3JtLm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCAkd2VsY29tZVRleHQgPSAkKCdbZGF0YS13ZWxjb21lXScpO1xuICAgICAgICAgICAgICAgIHJzdnBDb2RlID0gJHJzdnBJbnB1dC52YWwoKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICQoJy5yc3ZwLWVycm9yJykuYWRkQ2xhc3MoJ2hpZGRlbi14cy11cCcpO1xuICAgICAgICAgICAgICAgIGxvZ2luV2l0aFJTVlAocnN2cENvZGUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdkYXRhLmxvYWRlZCcpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHJzdnBTdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRyc3ZwRm9ybS5vbignc3VibWl0JywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGxldCBmb3JtVmFsdWVzID0gJCh0aGlzKS5zZXJpYWxpemVBcnJheSgpO1xuICAgICAgICAgICAgICAgIGxldCByZXNwb25zZUNvbnRhaW5lciA9IHt9O1xuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJCgnW3JzdnAtc3VibWl0LWJ1dHRvbl0nKS5lbXB0eSgpLmFwcGVuZCgnPGkgY2xhc3M9XCJmYSBmYS1zcGluIGZhLXNwaW5uZXJcIj48L2k+Jyk7XG5cbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhmb3JtVmFsdWVzKTtcblxuICAgICAgICAgICAgICAgIGlmIChmb3JtVmFsdWVzWzBdLm5hbWUgPT09ICdub3Rjb21pbmcnICYmIGZvcm1WYWx1ZXNbMF0udmFsdWUgPT09ICdvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2VDb250YWluZXJbcnN2cENvZGVdID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB1c2VyUmVzcG9uc2VEYXRhID0ge307XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZm9ybVZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZvcm1WYWx1ZXNbaV0ubmFtZSA9PT0gJ25vZ3Vlc3QnIHx8IGZvcm1WYWx1ZXNbaV0udmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyUmVzcG9uc2VEYXRhW2Zvcm1WYWx1ZXNbaV0ubmFtZV0gPSBmb3JtVmFsdWVzW2ldLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHVzZXJSZXNwb25zZURhdGEpO1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZUNvbnRhaW5lcltyc3ZwQ29kZV0gPSB1c2VyUmVzcG9uc2VEYXRhO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlQ29udGFpbmVyKTtcbiAgICAgICAgICAgICAgICByc3ZwUmVzcG9uc2VzUmVmLnVwZGF0ZShyZXNwb25zZUNvbnRhaW5lciwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFsZXJ0VGV4dCA9ICc8ZGl2IGNsYXNzPVwiYWxlcnQgYWxlcnQtZGFuZ2VyXCIgcm9sZT1cImFsZXJ0XCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPHN0cm9uZz5PaCBzbmFwITwvc3Ryb25nPiBTb21ldGhpbmcgd2VudCB3cm9uZy4gUGxlYXNlIGNvbnRhY3QgRGFuaWVsIChkYW5pZWxuaWVoQGdtYWlsLmNvbSkuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JztcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN1Y2Nlc3NUZXh0ID0gJzxkaXYgY2xhc3M9XCJhbGVydCBhbGVydC1zdWNjZXNzXCIgcm9sZT1cImFsZXJ0XCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPHN0cm9uZz5UaGFuayBZb3UhPC9zdHJvbmc+IFBsZWFzZSBjaGVjayBiYWNrIHNvb24gZm9yIHVwZGF0ZXMuIElmIHlvdSBoYXZlIGFueSBxdWVzdGlvbnMsIGZlZWwgZnJlZSB0byBjb250YWN0IGRhbmllbCAoZGFuaWVsbmllaEBnbWFpbC5jb20pJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JztcbjtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICQoJ1tkYXRhLXJzdnAtZm9ybV0nKS5hZGRDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG4gICAgICAgICAgICAgICAgICAgICQoJ1tkYXRhLXBvc3Qtc3VibWlzc2lvbl0nKS5yZW1vdmVDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnW2RhdGEtcG9zdC1zdWJtaXNzaW9uXScpLmFwcGVuZChhbGVydFRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnW2RhdGEtcG9zdC1zdWJtaXNzaW9uXScpLmFwcGVuZChzdWNjZXNzVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBoYW5kbGVFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGV2ZW50cykubWFwKChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWV2ZW50c1trZXldKSB7XG4gICAgICAgICAgICAgICAgICAgICQoJ1tkYXRhLWV2ZW50PScgKyBrZXkgKyAnXScpLmNsb3Nlc3QoJy5jb2wtbWQtNicpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBzaG93UnN2cEluZm8gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCAkcnN2cEluZm8gPSAkKCdbZGF0YS1hbHJlYWR5LXN1Ym1pdHRlZF0nKTtcblxuICAgICAgICAgICAgJCgnW2RhdGEtb3JpZ2luYWwtcnN2cC1tZXNzYWdlXScpLmFkZENsYXNzKCdoaWRkZW4teHMtdXAnKTtcbiAgICAgICAgICAgICQoJ1tkYXRhLWFscmVhZHktcnN2cGRdJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbi14cy11cCcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKHJzdnBJbmZvKTtcbiAgICAgICAgICAgIGxldCBtYXJrdXAgPSAnJztcblxuICAgICAgICAgICAgaWYgKHJzdnBJbmZvID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIG1hcmt1cCA9ICdOb3QgYXR0ZW5kaW5nLic7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGggLyAyOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgbWFya3VwICs9ICc8dWwgY2xhc3M9XCJtLWItMlwiPic7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJJbmRleCA9IGtleXNbaV1ba2V5c1tpXS5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgbWFya3VwICs9ICc8bGk+TmFtZTogJyArIHJzdnBJbmZvWydndWVzdC1uYW1lLScgKyBjdXJJbmRleF0gKyAnPC9saT4nO1xuICAgICAgICAgICAgICAgICAgICBtYXJrdXAgKz0gJzxsaT5NZWFsOiAnICsgcnN2cEluZm9bJ2d1ZXN0LW9wdGlvbi0nICsgY3VySW5kZXhdICsgJzwvbGk+JztcbiAgICAgICAgICAgICAgICAgICAgbWFya3VwICs9ICc8L3VsPic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkcnN2cEluZm8ucmVtb3ZlQ2xhc3MoJ2hpZGRlbi14cy11cCcpLmFwcGVuZChtYXJrdXApO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGhhbmRsZUR5bmFtaWNHdWVzdEluZm8gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICQoJ1tkYXRhLXJzdnAtb25seV0nKS5yZW1vdmVDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGd1ZXN0TmFtZXMubGVuZ3RoICsgMTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0ICRuYW1lRWwgPSAkKCdbZGF0YS1ndWVzdC1uYW1lLScgKyBpICsgJ10nKTtcbiAgICAgICAgICAgICAgICBsZXQgJG9wdGlvbkVsID0gJCgnW2RhdGEtZ3Vlc3Qtb3B0aW9uLScgKyBpICsnXScpO1xuICAgICAgICAgICAgICAgIGxldCAkbm9ndWVzdEVsID0gJCgnW2RhdGEtbm9ndWVzdD0nICsgaSArICddJyk7XG4gICAgICAgICAgICAgICAgbGV0IG5hbWUgPSBndWVzdE5hbWVzW2kgLSAxXS5uYW1lICE9PSAndW5rbm93bicgPyBndWVzdE5hbWVzW2kgLSAxXS5uYW1lIDogJyc7XG5cbiAgICAgICAgICAgICAgICAkbmFtZUVsXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnaGlkZGVuLXhzLXVwJylcbiAgICAgICAgICAgICAgICAgICAgLmZpbmQoJ2lucHV0W3R5cGU9dGV4dF0nKVxuICAgICAgICAgICAgICAgICAgICAudmFsKG5hbWUpXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdyZXF1aXJlZCcsIHRydWUpO1xuICAgICAgICAgICAgICAgICRvcHRpb25FbFxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2hpZGRlbi14cy11cCcpXG4gICAgICAgICAgICAgICAgICAgIC5maW5kKCdzZWxlY3QnKVxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignZGlzYWJsZWQnKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cigncmVxdWlyZWQnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAkbm9ndWVzdEVsLnJlbW92ZUNsYXNzKCdoaWRkZW4teHMtdXAnKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBub0d1ZXN0TGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICQoJ1tkYXRhLW5vZ3Vlc3RdJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGxldCBudW0gPSAkKHRoaXMpLmRhdGEoJ25vZ3Vlc3QnKTtcbiAgICAgICAgICAgICAgICBsZXQgJG5hbWVFbCA9ICQoJ1tkYXRhLWd1ZXN0LW5hbWUtJyArIG51bSArICddJyk7XG4gICAgICAgICAgICAgICAgbGV0ICRvcHRpb25FbCA9ICQoJ1tkYXRhLWd1ZXN0LW9wdGlvbi0nICsgbnVtICsgJ10nKTtcblxuICAgICAgICAgICAgICAgIGlmICgkKHRoaXMpLmZpbmQoJ2lucHV0JylbMF0uY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICAkbmFtZUVsXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmluZCgnaW5wdXQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ3JlcXVpcmVkJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAkb3B0aW9uRWxcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKCdzZWxlY3QnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ3JlcXVpcmVkJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRuYW1lRWxcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKCdpbnB1dCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigncmVxdWlyZWQnLCB0cnVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICRvcHRpb25FbFxuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmQoJ3NlbGVjdCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigncmVxdWlyZWQnLCB0cnVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IG5vdENvbWluZ0xpc3RlbmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPW5vdGNvbWluZ10nKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICAkKCdbZGF0YS1ub2d1ZXN0XScpLmZpbmQoJ2lucHV0JykuYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCA2OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCAkbmFtZUVsID0gJCgnW2RhdGEtZ3Vlc3QtbmFtZS0nICsgaSArICddJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgJG9wdGlvbkVsID0gJCgnW2RhdGEtZ3Vlc3Qtb3B0aW9uLScgKyBpICsgJ10nKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJG5hbWVFbC5maW5kKCdpbnB1dCcpLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkb3B0aW9uRWwuZmluZCgnc2VsZWN0JykuYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICQoJ1tkYXRhLW5vZ3Vlc3RdJykuZmluZCgnaW5wdXQnKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IDY7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0ICRuYW1lRWwgPSAkKCdbZGF0YS1ndWVzdC1uYW1lLScgKyBpICsgJ10nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCAkb3B0aW9uRWwgPSAkKCdbZGF0YS1ndWVzdC1vcHRpb24tJyArIGkgKyAnXScpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkbmFtZUVsLmZpbmQoJ2lucHV0JykucmVtb3ZlQXR0cignZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRvcHRpb25FbC5maW5kKCdzZWxlY3QnKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBkYXRhTG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ2RhdGEubG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgbGV0ICRuYXZiYXIgPSAkKCdbZGF0YS1uYXY9bmF2YmFyXScpO1xuICAgICAgICAgICAgICAgIGxldCAkcHJvcG9zYWxUaXRsZSA9ICQoJ1tkYXRhLXNlY3Rpb24tdGl0bGU9cHJvcG9zYWxdJyk7XG4gICAgICAgICAgICAgICAgbGV0IHRleHRUb3A7XG4gICAgICAgICAgICAgICAgbGV0IHRleHRMZWZ0O1xuXG4gICAgICAgICAgICAgICAgZ3Vlc3ROYW1lID0gZ3Vlc3ROYW1lc1swXS5uYW1lO1xuXG4gICAgICAgICAgICAgICAgJG5hdmJhci5yZW1vdmVDbGFzcygnaW52aXNpYmxlJykuaGlkZSgpLmZhZGVJbigpO1xuICAgICAgICAgICAgICAgICRyc3ZwQ29kZUZvcm0uYWRkQ2xhc3MoJ2hpZGRlbi14cy11cCcpLmZhZGVPdXQoKTtcbiAgICAgICAgICAgICAgICAkd2VsY29tZVRleHQuYXBwZW5kKCQoJzxoMyBjbGFzcz1cIndlbGNvbWUgdGV4dC14cy1jZW50ZXJcIj5XZWxjb21lICcgKyBndWVzdE5hbWUgKyAnITwvaDM+JykpO1xuICAgICAgICAgICAgICAgIHRleHRUb3AgPSAkKHdpbmRvdykuaGVpZ2h0KCkgLyAyIC0gJHdlbGNvbWVUZXh0LmZpbmQoJ2gzJykuaGVpZ2h0KCkgLyAyO1xuICAgICAgICAgICAgICAgIHRleHRMZWZ0ID0gJCh3aW5kb3cpLndpZHRoKCkgLyAyIC0gJHdlbGNvbWVUZXh0LmZpbmQoJ2gzJykud2lkdGgoKSAvIDI7XG4gICAgICAgICAgICAgICAgJHdlbGNvbWVUZXh0LmZpbmQoJ2gzJykuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiB0ZXh0VG9wICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogdGV4dExlZnQgKyAncHgnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtbm9kZT1pbmZvXScpLnJlbW92ZUNsYXNzKCdoaWRkZW4teHMtdXAnKTtcblxuICAgICAgICAgICAgICAgIGlmIChndWVzdE5hbWUgPT09ICdHdWVzdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnW2RhdGEtcnN2cC1hbmNob3JdJykuZW1wdHkoKS5hcHBlbmQoJ1dFTENPTUUnKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnW2RhdGEtcnN2cC1vbmx5XScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAkKCdbZGF0YS1ndWVzdC1vbmx5XScpLnJlbW92ZUNsYXNzKCdoaWRkZW4teHMtdXAnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkKCdbZGF0YS1ndWVzdC1vbmx5XScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVFdmVudHMoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFscmVhZHlSc3ZwZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd1JzdnBJbmZvKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVEeW5hbWljR3Vlc3RJbmZvKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBub0d1ZXN0TGlzdGVuZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdENvbWluZ0xpc3RlbmVyKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAkKCdbZGF0YS11c2VyLW5hbWVdJykuYXBwZW5kKGd1ZXN0TmFtZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgaGFuZGxlUmF0aW9DaGVjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0IHJhdGlvID0gJCh3aW5kb3cpLmhlaWdodCgpIC8gJCh3aW5kb3cpLndpZHRoKCk7XG5cbiAgICAgICAgICAgIGlmIChyYXRpbyA+IDAuNTYyKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlSGVpZ2h0Q2VudHJpY0Rpc3BsYXkoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocmF0aW8gPCAwLjU2Mikge1xuICAgICAgICAgICAgICAgIGhhbmRsZVdpZHRoQ2VudHJpY0Rpc3BsYXkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgaGFuZGxlSGVpZ2h0Q2VudHJpY0Rpc3BsYXkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCB3aW5kb3dIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XG4gICAgICAgICAgICBsZXQgbmV3VmlkZW9XaWR0aCA9IHJhdGlvV2lkdGggKiB3aW5kb3dIZWlnaHQgLyByYXRpb0hlaWdodDtcblxuICAgICAgICAgICAgJHZpZGVvLmNzcyh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB3aW5kb3dIZWlnaHQsXG4gICAgICAgICAgICAgICAgd2lkdGg6IG5ld1ZpZGVvV2lkdGgsXG4gICAgICAgICAgICAgICAgbGVmdDogKG5ld1ZpZGVvV2lkdGggLSAkKHdpbmRvdykud2lkdGgoKSkgLyAyICogLTFcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkdmlkZW9Db250YWluZXIuY3NzKHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHdpbmRvd0hlaWdodCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBoYW5kbGVXaWR0aENlbnRyaWNEaXNwbGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgd2luZG93V2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcbiAgICAgICAgICAgIGxldCB3aW5kb3dIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XG4gICAgICAgICAgICBsZXQgbmV3VmlkZW9IZWlnaHQgPSByYXRpb0hlaWdodCAqIHdpbmRvd1dpZHRoIC8gcmF0aW9XaWR0aDtcbiBcbiAgICAgICAgICAgICR2aWRlby5jc3Moe1xuICAgICAgICAgICAgICAgIGhlaWdodDogbmV3VmlkZW9IZWlnaHQsXG4gICAgICAgICAgICAgICAgd2lkdGg6IHdpbmRvd1dpZHRoLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgICAgICAgdG9wOiAobmV3VmlkZW9IZWlnaHQgLSB3aW5kb3dIZWlnaHQpIC8gMiAqIC0xXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJHZpZGVvQ29udGFpbmVyLmNzcyh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB3aW5kb3dIZWlnaHRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBsaXN0ZW5Gb3JWaWRlb1Jlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVSYXRpb0NoZWNrKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuXG4gICAgICAgIGxldCBjZW50ZXJSc3ZwSW5wdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCAkcnN2cElucHV0ID0gJCgnW2RhdGEtaW5wdXQ9cnN2cF0nKTtcbiAgICAgICAgICAgIGxldCBoZWlnaHRGcm9tVG9wID0gKCQod2luZG93KS5oZWlnaHQoKSAvIDIgLSAxNCk7XG5cbiAgICAgICAgICAgICRyc3ZwSW5wdXQuY3NzKCd0b3AnLCBoZWlnaHRGcm9tVG9wICsgJ3B4Jyk7XG4gICAgICAgICAgICAvLyB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkcnN2cElucHV0LnJlbW92ZUNsYXNzKCdoaWRkZW4teHMtdXAnKTtcbiAgICAgICAgICAgIC8vIH0sIDUwMDApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBuYXZTY3JvbGwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICQoJ1tkYXRhLW5hdi1saW5rXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gJCh0YXJnZXQpO1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvcDogdGFyZ2V0Lm9mZnNldCgpLnRvcFxuICAgICAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGluaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJzdnBDb2RlU3VibWl0KCk7XG4gICAgICAgICAgICByc3ZwU3VibWl0KCk7XG4gICAgICAgICAgICBkYXRhTG9hZCgpOyBcbiAgICAgICAgICAgIGhhbmRsZVJhdGlvQ2hlY2soKTtcbiAgICAgICAgICAgIGxpc3RlbkZvclZpZGVvUmVzaXplKCk7XG4gICAgICAgICAgICBjZW50ZXJSc3ZwSW5wdXQoKTtcbiAgICAgICAgICAgIG5hdlNjcm9sbCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbml0OiBpbml0XG4gICAgICAgIH07XG4gICAgfSkoKTtcblxuICAgIGFwcC5pbml0KCk7XG59KTtcbiJdfQ==

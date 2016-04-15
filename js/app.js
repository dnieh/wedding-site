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
        var rsvpResponsesRef = undefined;

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
                    rsvpResponsesRef = new Firebase('https://danielkatherine.firebaseio.com/rsvpResponses/');
                    guestRef.on('value', function (snap) {
                        guestNames = snap.val();
                        // smh
                        eventRef.on('value', function (snap) {
                            events = snap.val();
                            callback();
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

                    $('[data-rsvp-form]').addClass('invisible');
                    $('[data-post-submission]').removeClass('hidden-xs-up');
                    if (error) {
                        $('[data-post-submission]').append(alertText);
                    } else {
                        $('[data-post-submission]').append(successText);
                    }
                });
            });
        };

        var handleDynamicGuestInfo = function handleDynamicGuestInfo() {
            for (var i = 1; i < guestNames.length + 1; i++) {
                var $nameEl = $('[data-guest-name-' + i + ']');
                var $optionEl = $('[data-guest-option-' + i + ']');
                var $noguestEl = $('[data-noguest=' + i + ']');
                var name = guestNames[i - 1].name !== 'unknown' ? guestNames[i - 1].name : '';

                $nameEl.removeClass('hidden-xs-up').find('input[type=text]').val(name).removeAttr('disabled').attr('required', true);
                $optionEl.removeClass('hidden-xs-up').find('select').removeAttr('disabled').attr('required', true);
                $noguestEl.removeClass('hidden-xs-up');
            }
            console.log(guestNames);
            console.log(events);
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
                $('#proposal').parallax({
                    imageSrc: 'css/images/meiji-jingu-garden-1.jpg',
                    speed: 0.2
                });

                if (guestName === 'Guest') {
                    $('[data-rsvp-anchor]').empty().append('WELCOME');
                    $('[data-rsvp-only]').remove();
                    $('[data-guest-only]').removeClass('hidden-xs-up');
                } else {
                    $('[data-guest-only]').remove();
                    handleDynamicGuestInfo();
                    noGuestListener();
                    notComingListener();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzY3JpcHRzL2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBLEVBQUUsWUFBVztBQUNULFFBQUksTUFBTSxZQUFZO0FBQ2xCLFlBQU0sYUFBYSxFQUFiLENBRFk7QUFFbEIsWUFBTSxjQUFjLENBQWQsQ0FGWTs7QUFJbEIsWUFBSSxrQkFBa0IsRUFBRSx3QkFBRixDQUFsQixDQUpjO0FBS2xCLFlBQUksU0FBUyxFQUFFLGNBQUYsQ0FBVCxDQUxjO0FBTWxCLFlBQUksZ0JBQWdCLENBQWhCLENBTmM7QUFPbEIsWUFBSSxnQkFBZ0IsRUFBRSx1QkFBRixDQUFoQixDQVBjO0FBUWxCLFlBQUksWUFBWSxFQUFFLGtCQUFGLENBQVosQ0FSYztBQVNsQixZQUFJLG9CQUFKLENBVGtCO0FBVWxCLFlBQUksZUFBZSxFQUFFLGdCQUFGLENBQWYsQ0FWYztBQVdsQixZQUFJLFlBQVksRUFBWixDQVhjO0FBWWxCLFlBQUksYUFBYSxFQUFiLENBWmM7QUFhbEIsWUFBSSxTQUFTLEVBQVQsQ0FiYzs7QUFlbEIsWUFBSSxVQUFVLElBQUksUUFBSixDQUFhLHlDQUFiLENBQVYsQ0FmYztBQWdCbEIsWUFBSSxvQkFBSixDQWhCa0I7QUFpQmxCLFlBQUksb0JBQUosQ0FqQmtCO0FBa0JsQixZQUFJLDRCQUFKLENBbEJrQjs7QUFvQmxCLFlBQUksZ0JBQWdCLFNBQWhCLGFBQWdCLENBQVMsSUFBVCxFQUFlLFFBQWYsRUFBeUI7QUFDekMsb0JBQVEsZ0JBQVIsQ0FBeUI7QUFDckIsdUJBQU8sT0FBTyxlQUFQO0FBQ1AsMEJBQVUsSUFBVjthQUZKLEVBR0csVUFBUyxLQUFULEVBQWdCLFFBQWhCLEVBQTBCO0FBQ3pCLG9CQUFJLEtBQUosRUFBVztBQUNQLHdCQUFJLGdCQUFnQixDQUFoQixFQUFtQjtBQUNuQixnQ0FBUSxHQUFSLENB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dkI7O0FBTnlCLFNBQVgsQ0EzUko7O0FBcVNsQixZQUFJLFlBQVksU0FBWixTQUFZLEdBQVc7QUFDdkIsY0FBRSxpQkFBRixFQUFxQixFQUFyQixDQUF3QixPQUF4QixFQUFpQyxVQUFTLENBQVQsRUFBWTtBQUN6QyxvQkFBSSxTQUFTLEVBQUUsSUFBRixFQUFRLElBQVIsQ0FBYSxNQUFiLENBQVQsQ0FEcUM7O0FBR3pDLHlCQUFTLEVBQUUsTUFBRixDQUFULENBSHlDO0FBSXpDLGtCQUFFLGNBQUYsR0FKeUM7QUFLekMsa0JBQUUsWUFBRixFQUFnQixPQUFoQixDQUF3QjtBQUNwQiwrQkFBVyxPQUFPLE1BQVAsR0FBZ0IsR0FBaEI7aUJBRGYsRUFFRyxJQUZILEVBTHlDO2FBQVosQ0FBakMsQ0FEdUI7U0FBWCxDQXJTRTs7QUFpVGxCLFlBQUksT0FBTyxTQUFQLElBQU8sR0FBVztBQUNsQiw2QkFEa0I7QUFFbEIseUJBRmtCO0FBR2xCLHVCQUhrQjtBQUlsQiwrQkFKa0I7QUFLbEIsbUNBTGtCO0FBTWxCLDhCQU5rQjtBQU9sQix3QkFQa0I7U0FBWCxDQWpUTzs7QUEyVGxCLGVBQU87QUFDSCxrQkFBTSxJQUFOO1NBREosQ0EzVGtCO0tBQVgsRUFBUCxDQURLOztBQWlVVCxRQUFJLElBQUosR0FqVVM7Q0FBWCxDQUFGIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuJChmdW5jdGlvbigpIHtcbiAgICBsZXQgYXBwID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCByYXRpb1dpZHRoID0gMTY7XG4gICAgICAgIGNvbnN0IHJhdGlvSGVpZ2h0ID0gOTtcblxuICAgICAgICBsZXQgJHZpZGVvQ29udGFpbmVyID0gJCgnW2RhdGEtdmlkZW8tY29udGFpbmVyXScpO1xuICAgICAgICBsZXQgJHZpZGVvID0gJCgnW2RhdGEtdmlkZW9dJyk7XG4gICAgICAgIGxldCBsb2dpbkF0dGVtcHRzID0gMDtcbiAgICAgICAgbGV0ICRyc3ZwQ29kZUZvcm0gPSAkKCdbZGF0YS1mb3JtPXJzdnAtY29kZV0nKTtcbiAgICAgICAgbGV0ICRyc3ZwRm9ybSA9ICQoJ1tkYXRhLWZvcm09cnN2cF0nKTtcbiAgICAgICAgbGV0IHJzdnBDb2RlO1xuICAgICAgICBsZXQgJHdlbGNvbWVUZXh0ID0gJCgnW2RhdGEtd2VsY29tZV0nKTtcbiAgICAgICAgbGV0IGd1ZXN0TmFtZSA9ICcnO1xuICAgICAgICBsZXQgZ3Vlc3ROYW1lcyA9IFtdO1xuICAgICAgICBsZXQgZXZlbnRzID0ge307XG5cbiAgICAgICAgbGV0IGJhc2VSZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vZGFuaWVsa2F0aGVyaW5lLmZpcmViYXNlaW8uY29tLycpO1xuICAgICAgICBsZXQgZ3Vlc3RSZWY7XG4gICAgICAgIGxldCBldmVudFJlZjtcbiAgICAgICAgbGV0IHJzdnBSZXNwb25zZXNSZWY7XG5cbiAgICAgICAgbGV0IGxvZ2luV2l0aFJTVlAgPSBmdW5jdGlvbihyc3ZwLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgYmFzZVJlZi5hdXRoV2l0aFBhc3N3b3JkKHtcbiAgICAgICAgICAgICAgICBlbWFpbDogcnN2cCArICdAZmlyZWJhc2UuY29tJyxcbiAgICAgICAgICAgICAgICBwYXNzd29yZDogcnN2cFxuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IsIGF1dGhEYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2dpbkF0dGVtcHRzIDwgMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0xvZ2luIEZhaWxlZCEnLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcucnN2cC1lcnJvcicpLnJlbW92ZUNsYXNzKCdoaWRkZW4teHMtdXAnKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5ndWVzdC1sb2dpbicpLnJlbW92ZUNsYXNzKCdoaWRkZW4teHMtdXAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBdHRlbXB0aW5nIHRvIGxvZ2luIGFzIGd1ZXN0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dpbldpdGhSU1ZQKCdndWVzdCcsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsb2dpbkF0dGVtcHRzKys7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ0F1dGhlbnRpY2F0ZWQgc3VjY2Vzc2Z1bGx5IHdpdGggcGF5bG9hZDonLCBhdXRoRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGd1ZXN0UmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2RhbmllbGthdGhlcmluZS5maXJlYmFzZWlvLmNvbS9yc3ZwQ29kZXMvJyArIHJzdnApO1xuICAgICAgICAgICAgICAgICAgICBldmVudFJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9kYW5pZWxrYXRoZXJpbmUuZmlyZWJhc2Vpby5jb20vZXZlbnRzLycgKyByc3ZwKTtcbiAgICAgICAgICAgICAgICAgICAgcnN2cFJlc3BvbnNlc1JlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9kYW5pZWxrYXRoZXJpbmUuZmlyZWJhc2Vpby5jb20vcnN2cFJlc3BvbnNlcy8nKTtcbiAgICAgICAgICAgICAgICAgICAgZ3Vlc3RSZWYub24oJ3ZhbHVlJywgKHNuYXApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGd1ZXN0TmFtZXMgPSBzbmFwLnZhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc21oXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudFJlZi5vbigndmFsdWUnLCAoc25hcCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cyA9IHNuYXAudmFsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIGxldCByc3ZwQ29kZVN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0ICRyc3ZwSW5wdXQgPSAkKCdpbnB1dFtuYW1lPXJzdnBdJyk7XG5cbiAgICAgICAgICAgICRyc3ZwQ29kZUZvcm0ub24oJ3N1Ym1pdCcsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0ICR3ZWxjb21lVGV4dCA9ICQoJ1tkYXRhLXdlbGNvbWVdJyk7XG4gICAgICAgICAgICAgICAgcnN2cENvZGUgPSAkcnN2cElucHV0LnZhbCgpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgJCgnLnJzdnAtZXJyb3InKS5hZGRDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG4gICAgICAgICAgICAgICAgbG9naW5XaXRoUlNWUChyc3ZwQ29kZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ2RhdGEubG9hZGVkJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgcnN2cFN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJHJzdnBGb3JtLm9uKCdzdWJtaXQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgbGV0IGZvcm1WYWx1ZXMgPSAkKHRoaXMpLnNlcmlhbGl6ZUFycmF5KCk7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3BvbnNlQ29udGFpbmVyID0ge307XG5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkKCdbcnN2cC1zdWJtaXQtYnV0dG9uXScpLmVtcHR5KCkuYXBwZW5kKCc8aSBjbGFzcz1cImZhIGZhLXNwaW4gZmEtc3Bpbm5lclwiPjwvaT4nKTtcblxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGZvcm1WYWx1ZXMpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGZvcm1WYWx1ZXNbMF0ubmFtZSA9PT0gJ25vdGNvbWluZycgJiYgZm9ybVZhbHVlc1swXS52YWx1ZSA9PT0gJ29uJykge1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZUNvbnRhaW5lcltyc3ZwQ29kZV0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHVzZXJSZXNwb25zZURhdGEgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmb3JtVmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZm9ybVZhbHVlc1tpXS5uYW1lID09PSAnbm9ndWVzdCcgfHwgZm9ybVZhbHVlc1tpXS52YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJSZXNwb25zZURhdGFbZm9ybVZhbHVlc1tpXS5uYW1lXSA9IGZvcm1WYWx1ZXNbaV0udmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codXNlclJlc3BvbnNlRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlQ29udGFpbmVyW3JzdnBDb2RlXSA9IHVzZXJSZXNwb25zZURhdGE7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2VDb250YWluZXIpO1xuICAgICAgICAgICAgICAgIHJzdnBSZXNwb25zZXNSZWYudXBkYXRlKHJlc3BvbnNlQ29udGFpbmVyLCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgYWxlcnRUZXh0ID0gJzxkaXYgY2xhc3M9XCJhbGVydCBhbGVydC1kYW5nZXJcIiByb2xlPVwiYWxlcnRcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8c3Ryb25nPk9oIHNuYXAhPC9zdHJvbmc+IFNvbWV0aGluZyB3ZW50IHdyb25nLiBQbGVhc2UgY29udGFjdCBEYW5pZWwgKGRhbmllbG5pZWhAZ21haWwuY29tKS4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xuICAgICAgICAgICAgICAgICAgICBsZXQgc3VjY2Vzc1RleHQgPSAnPGRpdiBjbGFzcz1cImFsZXJ0IGFsZXJ0LXN1Y2Nlc3NcIiByb2xlPVwiYWxlcnRcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8c3Ryb25nPlRoYW5rIFlvdSE8L3N0cm9uZz4gUGxlYXNlIGNoZWNrIGJhY2sgc29vbiBmb3IgdXBkYXRlcy4gSWYgeW91IGhhdmUgYW55IHF1ZXN0aW9ucywgZmVlbCBmcmVlIHRvIGNvbnRhY3QgZGFuaWVsIChkYW5pZWxuaWVoQGdtYWlsLmNvbSknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xuO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJCgnW2RhdGEtcnN2cC1mb3JtXScpLmFkZENsYXNzKCdpbnZpc2libGUnKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnW2RhdGEtcG9zdC1zdWJtaXNzaW9uXScpLnJlbW92ZUNsYXNzKCdoaWRkZW4teHMtdXAnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCdbZGF0YS1wb3N0LXN1Ym1pc3Npb25dJykuYXBwZW5kKGFsZXJ0VGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCdbZGF0YS1wb3N0LXN1Ym1pc3Npb25dJykuYXBwZW5kKHN1Y2Nlc3NUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGhhbmRsZUR5bmFtaWNHdWVzdEluZm8gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgZ3Vlc3ROYW1lcy5sZW5ndGggKyAxOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgJG5hbWVFbCA9ICQoJ1tkYXRhLWd1ZXN0LW5hbWUtJyArIGkgKyAnXScpO1xuICAgICAgICAgICAgICAgIGxldCAkb3B0aW9uRWwgPSAkKCdbZGF0YS1ndWVzdC1vcHRpb24tJyArIGkgKyddJyk7XG4gICAgICAgICAgICAgICAgbGV0ICRub2d1ZXN0RWwgPSAkKCdbZGF0YS1ub2d1ZXN0PScgKyBpICsgJ10nKTtcbiAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IGd1ZXN0TmFtZXNbaSAtIDFdLm5hbWUgIT09ICd1bmtub3duJyA/IGd1ZXN0TmFtZXNbaSAtIDFdLm5hbWUgOiAnJztcblxuICAgICAgICAgICAgICAgICRuYW1lRWxcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdoaWRkZW4teHMtdXAnKVxuICAgICAgICAgICAgICAgICAgICAuZmluZCgnaW5wdXRbdHlwZT10ZXh0XScpXG4gICAgICAgICAgICAgICAgICAgIC52YWwobmFtZSlcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJylcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3JlcXVpcmVkJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgJG9wdGlvbkVsXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnaGlkZGVuLXhzLXVwJylcbiAgICAgICAgICAgICAgICAgICAgLmZpbmQoJ3NlbGVjdCcpXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdyZXF1aXJlZCcsIHRydWUpO1xuICAgICAgICAgICAgICAgICRub2d1ZXN0RWwucmVtb3ZlQ2xhc3MoJ2hpZGRlbi14cy11cCcpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhndWVzdE5hbWVzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGV2ZW50cyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IG5vR3Vlc3RMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCgnW2RhdGEtbm9ndWVzdF0nKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bSA9ICQodGhpcykuZGF0YSgnbm9ndWVzdCcpO1xuICAgICAgICAgICAgICAgIGxldCAkbmFtZUVsID0gJCgnW2RhdGEtZ3Vlc3QtbmFtZS0nICsgbnVtICsgJ10nKTtcbiAgICAgICAgICAgICAgICBsZXQgJG9wdGlvbkVsID0gJCgnW2RhdGEtZ3Vlc3Qtb3B0aW9uLScgKyBudW0gKyAnXScpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCQodGhpcykuZmluZCgnaW5wdXQnKVswXS5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICRuYW1lRWxcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKCdpbnB1dCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cigncmVxdWlyZWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICRvcHRpb25FbFxuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmQoJ3NlbGVjdCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cigncmVxdWlyZWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJG5hbWVFbFxuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmQoJ2lucHV0JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdyZXF1aXJlZCcsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgJG9wdGlvbkVsXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmluZCgnc2VsZWN0JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdyZXF1aXJlZCcsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgbm90Q29taW5nTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9bm90Y29taW5nXScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICQoJ1tkYXRhLW5vZ3Vlc3RdJykuZmluZCgnaW5wdXQnKS5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IDY7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0ICRuYW1lRWwgPSAkKCdbZGF0YS1ndWVzdC1uYW1lLScgKyBpICsgJ10nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCAkb3B0aW9uRWwgPSAkKCdbZGF0YS1ndWVzdC1vcHRpb24tJyArIGkgKyAnXScpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkbmFtZUVsLmZpbmQoJ2lucHV0JykuYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRvcHRpb25FbC5maW5kKCdzZWxlY3QnKS5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnW2RhdGEtbm9ndWVzdF0nKS5maW5kKCdpbnB1dCcpLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgNjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgJG5hbWVFbCA9ICQoJ1tkYXRhLWd1ZXN0LW5hbWUtJyArIGkgKyAnXScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0ICRvcHRpb25FbCA9ICQoJ1tkYXRhLWd1ZXN0LW9wdGlvbi0nICsgaSArICddJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRuYW1lRWwuZmluZCgnaW5wdXQnKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJG9wdGlvbkVsLmZpbmQoJ3NlbGVjdCcpLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGRhdGFMb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbignZGF0YS5sb2FkZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBsZXQgJG5hdmJhciA9ICQoJ1tkYXRhLW5hdj1uYXZiYXJdJyk7XG4gICAgICAgICAgICAgICAgbGV0ICRwcm9wb3NhbFRpdGxlID0gJCgnW2RhdGEtc2VjdGlvbi10aXRsZT1wcm9wb3NhbF0nKTtcbiAgICAgICAgICAgICAgICBsZXQgdGV4dFRvcDtcbiAgICAgICAgICAgICAgICBsZXQgdGV4dExlZnQ7XG5cbiAgICAgICAgICAgICAgICBndWVzdE5hbWUgPSBndWVzdE5hbWVzWzBdLm5hbWU7XG5cbiAgICAgICAgICAgICAgICAkbmF2YmFyLnJlbW92ZUNsYXNzKCdpbnZpc2libGUnKS5oaWRlKCkuZmFkZUluKCk7XG4gICAgICAgICAgICAgICAgJHJzdnBDb2RlRm9ybS5hZGRDbGFzcygnaGlkZGVuLXhzLXVwJykuZmFkZU91dCgpO1xuICAgICAgICAgICAgICAgICR3ZWxjb21lVGV4dC5hcHBlbmQoJCgnPGgzIGNsYXNzPVwid2VsY29tZSB0ZXh0LXhzLWNlbnRlclwiPldlbGNvbWUgJyArIGd1ZXN0TmFtZSArICchPC9oMz4nKSk7XG4gICAgICAgICAgICAgICAgdGV4dFRvcCA9ICQod2luZG93KS5oZWlnaHQoKSAvIDIgLSAkd2VsY29tZVRleHQuZmluZCgnaDMnKS5oZWlnaHQoKSAvIDI7XG4gICAgICAgICAgICAgICAgdGV4dExlZnQgPSAkKHdpbmRvdykud2lkdGgoKSAvIDIgLSAkd2VsY29tZVRleHQuZmluZCgnaDMnKS53aWR0aCgpIC8gMjtcbiAgICAgICAgICAgICAgICAkd2VsY29tZVRleHQuZmluZCgnaDMnKS5jc3Moe1xuICAgICAgICAgICAgICAgICAgICB0b3A6IHRleHRUb3AgKyAncHgnLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0ZXh0TGVmdCArICdweCdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS1ub2RlPWluZm9dJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbi14cy11cCcpO1xuICAgICAgICAgICAgICAgICQoJyNwcm9wb3NhbCcpLnBhcmFsbGF4KHtcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VTcmM6ICdjc3MvaW1hZ2VzL21laWppLWppbmd1LWdhcmRlbi0xLmpwZycsXG4gICAgICAgICAgICAgICAgICAgIHNwZWVkOiAwLjJcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmIChndWVzdE5hbWUgPT09ICdHdWVzdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnW2RhdGEtcnN2cC1hbmNob3JdJykuZW1wdHkoKS5hcHBlbmQoJ1dFTENPTUUnKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnW2RhdGEtcnN2cC1vbmx5XScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAkKCdbZGF0YS1ndWVzdC1vbmx5XScpLnJlbW92ZUNsYXNzKCdoaWRkZW4teHMtdXAnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkKCdbZGF0YS1ndWVzdC1vbmx5XScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVEeW5hbWljR3Vlc3RJbmZvKCk7XG4gICAgICAgICAgICAgICAgICAgIG5vR3Vlc3RMaXN0ZW5lcigpO1xuICAgICAgICAgICAgICAgICAgICBub3RDb21pbmdMaXN0ZW5lcigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXVzZXItbmFtZV0nKS5hcHBlbmQoZ3Vlc3ROYW1lKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBoYW5kbGVSYXRpb0NoZWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgcmF0aW8gPSAkKHdpbmRvdykuaGVpZ2h0KCkgLyAkKHdpbmRvdykud2lkdGgoKTtcblxuICAgICAgICAgICAgaWYgKHJhdGlvID4gMC41NjIpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVIZWlnaHRDZW50cmljRGlzcGxheSgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChyYXRpbyA8IDAuNTYyKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlV2lkdGhDZW50cmljRGlzcGxheSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBoYW5kbGVIZWlnaHRDZW50cmljRGlzcGxheSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0IHdpbmRvd0hlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKTtcbiAgICAgICAgICAgIGxldCBuZXdWaWRlb1dpZHRoID0gcmF0aW9XaWR0aCAqIHdpbmRvd0hlaWdodCAvIHJhdGlvSGVpZ2h0O1xuXG4gICAgICAgICAgICAkdmlkZW8uY3NzKHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHdpbmRvd0hlaWdodCxcbiAgICAgICAgICAgICAgICB3aWR0aDogbmV3VmlkZW9XaWR0aCxcbiAgICAgICAgICAgICAgICBsZWZ0OiAobmV3VmlkZW9XaWR0aCAtICQod2luZG93KS53aWR0aCgpKSAvIDIgKiAtMVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICR2aWRlb0NvbnRhaW5lci5jc3Moe1xuICAgICAgICAgICAgICAgIGhlaWdodDogd2luZG93SGVpZ2h0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGhhbmRsZVdpZHRoQ2VudHJpY0Rpc3BsYXkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCB3aW5kb3dXaWR0aCA9ICQod2luZG93KS53aWR0aCgpO1xuICAgICAgICAgICAgbGV0IHdpbmRvd0hlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKTtcbiAgICAgICAgICAgIGxldCBuZXdWaWRlb0hlaWdodCA9IHJhdGlvSGVpZ2h0ICogd2luZG93V2lkdGggLyByYXRpb1dpZHRoO1xuIFxuICAgICAgICAgICAgJHZpZGVvLmNzcyh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBuZXdWaWRlb0hlaWdodCxcbiAgICAgICAgICAgICAgICB3aWR0aDogd2luZG93V2lkdGgsXG4gICAgICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgICAgICB0b3A6IChuZXdWaWRlb0hlaWdodCAtIHdpbmRvd0hlaWdodCkgLyAyICogLTFcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkdmlkZW9Db250YWluZXIuY3NzKHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHdpbmRvd0hlaWdodFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGxpc3RlbkZvclZpZGVvUmVzaXplID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGhhbmRsZVJhdGlvQ2hlY2soKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG5cbiAgICAgICAgbGV0IGNlbnRlclJzdnBJbnB1dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0ICRyc3ZwSW5wdXQgPSAkKCdbZGF0YS1pbnB1dD1yc3ZwXScpO1xuICAgICAgICAgICAgbGV0IGhlaWdodEZyb21Ub3AgPSAoJCh3aW5kb3cpLmhlaWdodCgpIC8gMiAtIDE0KTtcblxuICAgICAgICAgICAgJHJzdnBJbnB1dC5jc3MoJ3RvcCcsIGhlaWdodEZyb21Ub3AgKyAncHgnKTtcbiAgICAgICAgICAgIC8vIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICRyc3ZwSW5wdXQucmVtb3ZlQ2xhc3MoJ2hpZGRlbi14cy11cCcpO1xuICAgICAgICAgICAgLy8gfSwgNTAwMCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IG5hdlNjcm9sbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCgnW2RhdGEtbmF2LWxpbmtdJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGxldCB0YXJnZXQgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSAkKHRhcmdldCk7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsVG9wOiB0YXJnZXQub2Zmc2V0KCkudG9wXG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcnN2cENvZGVTdWJtaXQoKTtcbiAgICAgICAgICAgIHJzdnBTdWJtaXQoKTtcbiAgICAgICAgICAgIGRhdGFMb2FkKCk7IFxuICAgICAgICAgICAgaGFuZGxlUmF0aW9DaGVjaygpO1xuICAgICAgICAgICAgbGlzdGVuRm9yVmlkZW9SZXNpemUoKTtcbiAgICAgICAgICAgIGNlbnRlclJzdnBJbnB1dCgpO1xuICAgICAgICAgICAgbmF2U2Nyb2xsKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGluaXQ6IGluaXRcbiAgICAgICAgfTtcbiAgICB9KSgpO1xuXG4gICAgYXBwLmluaXQoKTtcbn0pO1xuIl19

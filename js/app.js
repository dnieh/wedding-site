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
        var $welcomeText = $('[data-welcome]');
        var guestName = '';
        var guestNames = [];
        var events = {};

        var baseRef = new Firebase('https://danielkatherine.firebaseio.com/');
        var guestRef = undefined;
        var eventRef = undefined;

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
                var rsvp = $rsvpInput.val().toLowerCase();

                e.preventDefault();
                $('.rsvp-error').addClass('hidden-xs-up');
                loginWithRSVP(rsvp, function () {
                    $(document).trigger('data.loaded');
                });
            });
        };

        var rsvpSubmit = function rsvpSubmit() {
            $rsvpForm.on('submit', function (e) {
                e.preventDefault();
                console.log($(this).serializeArray());
            });
        };

        var handleDynamicGuestInfo = function handleDynamicGuestInfo() {
            for (var i = 1; i < guestNames.length + 1; i++) {
                var $nameEl = $('[data-guest-name-' + i + ']');
                var $optionEl = $('[data-guest-option-' + i + ']');
                var name = guestNames[i - 1].name !== 'unknown' ? guestNames[i - 1].name : '';

                $nameEl.removeClass('hidden-xs-up').find('input[type=text]').val(name).attr('required', true);
                $optionEl.removeClass('hidden-xs-up').find('select').attr('required', true);
            }
            console.log(guestNames);
            console.log(events);
        };

        var noGuestListener = function noGuestListener() {
            $('input[name=noguest]').on('change', function () {
                if (this.checked) {
                    for (var i = 2; i < 6; i++) {
                        var $nameEl = $('[data-guest-name-' + i + ']');
                        var $optionEl = $('[data-guest-option-' + i + ']');

                        $nameEl.find('input').attr('disabled', true);
                        $optionEl.find('select').attr('disabled', true);
                    }
                } else {
                    for (var i = 2; i < 6; i++) {
                        var $nameEl = $('[data-guest-name-' + i + ']');
                        var $optionEl = $('[data-guest-option-' + i + ']');

                        $nameEl.find('input').removeAttr('disabled');
                        $optionEl.find('select').removeAttr('disabled');
                    }
                }
            });
        };

        var notComingListener = function notComingListener() {
            $('input[name=notcoming]').on('change', function () {
                if (this.checked) {
                    $('input[name=noguest]').attr('disabled', true);
                    for (var i = 1; i < 6; i++) {
                        var $nameEl = $('[data-guest-name-' + i + ']');
                        var $optionEl = $('[data-guest-option-' + i + ']');

                        $nameEl.find('input').attr('disabled', true);
                        $optionEl.find('select').attr('disabled', true);
                    }
                } else {
                    $('input[name=noguest]').removeAttr('disabled');
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
            noGuestListener();
            notComingListener();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzY3JpcHRzL2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBLEVBQUUsWUFBVztBQUNULFFBQUksTUFBTSxZQUFZO0FBQ2xCLFlBQU0sYUFBYSxFQUFiLENBRFk7QUFFbEIsWUFBTSxjQUFjLENBQWQsQ0FGWTs7QUFJbEIsWUFBSSxrQkFBa0IsRUFBRSx3QkFBRixDQUFsQixDQUpjO0FBS2xCLFlBQUksU0FBUyxFQUFFLGNBQUYsQ0FBVCxDQUxjO0FBTWxCLFlBQUksZ0JBQWdCLENBQWhCLENBTmM7QUFPbEIsWUFBSSxnQkFBZ0IsRUFBRSx1QkFBRixDQUFoQixDQVBjO0FBUWxCLFlBQUksWUFBWSxFQUFFLGtCQUFGLENBQVosQ0FSYztBQVNsQixZQUFJLGVBQWUsRUFBRSxnQkFBRixDQUFmLENBVGM7QUFVbEIsWUFBSSxZQUFZLEVBQVosQ0FWYztBQVdsQixZQUFJLGFBQWEsRUFBYixDQVhjO0FBWWxCLFlBQUksU0FBUyxFQUFULENBWmM7O0FBY2xCLFlBQUksVUFBVSxJQUFJLFFBQUosQ0FBYSx5Q0FBYixDQUFWLENBZGM7QUFlbEIsWUFBSSxvQkFBSixDQWZrQjtBQWdCbEIsWUFBSSxvQkFBSixDQWhCa0I7O0FBa0JsQixZQUFJLGdCQUFnQixTQUFoQixhQUFnQixDQUFTLElBQVQsRUFBZSxRQUFmLEVBQXlCO0FBQ3pDLG9CQUFRLGdCQUFSLENBQXlCO0FBQ3JCLHVCQUFPLE9BQU8sZUFBUDtBQUNQLDBCQUFVLElBQVY7YUFGSixFQUdHLFVBQVMsS0FBVCxFQUFnQixRQUFoQixFQUEwQjtBQUN6QixvQkFBSSxLQUFKLEVBQVc7QUFDUCx3QkFBSSxnQkFBZ0IsQ0FBaEIsRUFBbUI7QUFDbkIsZ0NBQVEsR0FBUixDQUFZLGVBQVosRUFBNkIsS0FBN0IsRUFEbUI7QUFFbkIsMEJBQUUsYUFBRixFQUFpQixX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bEIsZ0NBSmtCO0FBS2xCLHVCQUxrQjtBQU1sQiwrQkFOa0I7QUFPbEIsbUNBUGtCO0FBUWxCLDhCQVJrQjtBQVNsQix3QkFUa0I7U0FBWCxDQXhQTzs7QUFvUWxCLGVBQU87QUFDSCxrQkFBTSxJQUFOO1NBREosQ0FwUWtCO0tBQVgsRUFBUCxDQURLOztBQTBRVCxRQUFJLElBQUosR0ExUVM7Q0FBWCxDQUFGIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuJChmdW5jdGlvbigpIHtcbiAgICBsZXQgYXBwID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCByYXRpb1dpZHRoID0gMTY7XG4gICAgICAgIGNvbnN0IHJhdGlvSGVpZ2h0ID0gOTtcblxuICAgICAgICBsZXQgJHZpZGVvQ29udGFpbmVyID0gJCgnW2RhdGEtdmlkZW8tY29udGFpbmVyXScpO1xuICAgICAgICBsZXQgJHZpZGVvID0gJCgnW2RhdGEtdmlkZW9dJyk7XG4gICAgICAgIGxldCBsb2dpbkF0dGVtcHRzID0gMDtcbiAgICAgICAgbGV0ICRyc3ZwQ29kZUZvcm0gPSAkKCdbZGF0YS1mb3JtPXJzdnAtY29kZV0nKTtcbiAgICAgICAgbGV0ICRyc3ZwRm9ybSA9ICQoJ1tkYXRhLWZvcm09cnN2cF0nKTtcbiAgICAgICAgbGV0ICR3ZWxjb21lVGV4dCA9ICQoJ1tkYXRhLXdlbGNvbWVdJyk7XG4gICAgICAgIGxldCBndWVzdE5hbWUgPSAnJztcbiAgICAgICAgbGV0IGd1ZXN0TmFtZXMgPSBbXTtcbiAgICAgICAgbGV0IGV2ZW50cyA9IHt9O1xuXG4gICAgICAgIGxldCBiYXNlUmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2RhbmllbGthdGhlcmluZS5maXJlYmFzZWlvLmNvbS8nKTtcbiAgICAgICAgbGV0IGd1ZXN0UmVmO1xuICAgICAgICBsZXQgZXZlbnRSZWY7XG5cbiAgICAgICAgbGV0IGxvZ2luV2l0aFJTVlAgPSBmdW5jdGlvbihyc3ZwLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgYmFzZVJlZi5hdXRoV2l0aFBhc3N3b3JkKHtcbiAgICAgICAgICAgICAgICBlbWFpbDogcnN2cCArICdAZmlyZWJhc2UuY29tJyxcbiAgICAgICAgICAgICAgICBwYXNzd29yZDogcnN2cFxuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IsIGF1dGhEYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2dpbkF0dGVtcHRzIDwgMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0xvZ2luIEZhaWxlZCEnLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcucnN2cC1lcnJvcicpLnJlbW92ZUNsYXNzKCdoaWRkZW4teHMtdXAnKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5ndWVzdC1sb2dpbicpLnJlbW92ZUNsYXNzKCdoaWRkZW4teHMtdXAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBdHRlbXB0aW5nIHRvIGxvZ2luIGFzIGd1ZXN0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dpbldpdGhSU1ZQKCdndWVzdCcsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsb2dpbkF0dGVtcHRzKys7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ0F1dGhlbnRpY2F0ZWQgc3VjY2Vzc2Z1bGx5IHdpdGggcGF5bG9hZDonLCBhdXRoRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGd1ZXN0UmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2RhbmllbGthdGhlcmluZS5maXJlYmFzZWlvLmNvbS9yc3ZwQ29kZXMvJyArIHJzdnApO1xuICAgICAgICAgICAgICAgICAgICBldmVudFJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9kYW5pZWxrYXRoZXJpbmUuZmlyZWJhc2Vpby5jb20vZXZlbnRzLycgKyByc3ZwKTtcbiAgICAgICAgICAgICAgICAgICAgZ3Vlc3RSZWYub24oJ3ZhbHVlJywgKHNuYXApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGd1ZXN0TmFtZXMgPSBzbmFwLnZhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc21oXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudFJlZi5vbigndmFsdWUnLCAoc25hcCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cyA9IHNuYXAudmFsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIGxldCByc3ZwQ29kZVN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0ICRyc3ZwSW5wdXQgPSAkKCdpbnB1dFtuYW1lPXJzdnBdJyk7XG5cbiAgICAgICAgICAgICRyc3ZwQ29kZUZvcm0ub24oJ3N1Ym1pdCcsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0ICR3ZWxjb21lVGV4dCA9ICQoJ1tkYXRhLXdlbGNvbWVdJyk7XG4gICAgICAgICAgICAgICAgbGV0IHJzdnAgPSAkcnN2cElucHV0LnZhbCgpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgJCgnLnJzdnAtZXJyb3InKS5hZGRDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG4gICAgICAgICAgICAgICAgbG9naW5XaXRoUlNWUChyc3ZwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcignZGF0YS5sb2FkZWQnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCByc3ZwU3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkcnN2cEZvcm0ub24oJ3N1Ym1pdCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJCh0aGlzKS5zZXJpYWxpemVBcnJheSgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBoYW5kbGVEeW5hbWljR3Vlc3RJbmZvID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGd1ZXN0TmFtZXMubGVuZ3RoICsgMTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0ICRuYW1lRWwgPSAkKCdbZGF0YS1ndWVzdC1uYW1lLScgKyBpICsgJ10nKTtcbiAgICAgICAgICAgICAgICBsZXQgJG9wdGlvbkVsID0gJCgnW2RhdGEtZ3Vlc3Qtb3B0aW9uLScgKyBpICsnXScpO1xuICAgICAgICAgICAgICAgIGxldCBuYW1lID0gZ3Vlc3ROYW1lc1tpIC0gMV0ubmFtZSAhPT0gJ3Vua25vd24nID8gZ3Vlc3ROYW1lc1tpIC0gMV0ubmFtZSA6ICcnO1xuXG4gICAgICAgICAgICAgICAgJG5hbWVFbFxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2hpZGRlbi14cy11cCcpXG4gICAgICAgICAgICAgICAgICAgIC5maW5kKCdpbnB1dFt0eXBlPXRleHRdJylcbiAgICAgICAgICAgICAgICAgICAgLnZhbChuYW1lKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cigncmVxdWlyZWQnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAkb3B0aW9uRWxcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdoaWRkZW4teHMtdXAnKVxuICAgICAgICAgICAgICAgICAgICAuZmluZCgnc2VsZWN0JylcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3JlcXVpcmVkJywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhndWVzdE5hbWVzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGV2ZW50cyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IG5vR3Vlc3RMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1ub2d1ZXN0XScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAyOyBpIDwgNjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgJG5hbWVFbCA9ICQoJ1tkYXRhLWd1ZXN0LW5hbWUtJyArIGkgKyAnXScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0ICRvcHRpb25FbCA9ICQoJ1tkYXRhLWd1ZXN0LW9wdGlvbi0nICsgaSArICddJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRuYW1lRWwuZmluZCgnaW5wdXQnKS5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJG9wdGlvbkVsLmZpbmQoJ3NlbGVjdCcpLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMjsgaSA8IDY7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0ICRuYW1lRWwgPSAkKCdbZGF0YS1ndWVzdC1uYW1lLScgKyBpICsgJ10nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCAkb3B0aW9uRWwgPSAkKCdbZGF0YS1ndWVzdC1vcHRpb24tJyArIGkgKyAnXScpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkbmFtZUVsLmZpbmQoJ2lucHV0JykucmVtb3ZlQXR0cignZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRvcHRpb25FbC5maW5kKCdzZWxlY3QnKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgbm90Q29taW5nTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9bm90Y29taW5nXScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICQoJ2lucHV0W25hbWU9bm9ndWVzdF0nKS5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IDY7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0ICRuYW1lRWwgPSAkKCdbZGF0YS1ndWVzdC1uYW1lLScgKyBpICsgJ10nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCAkb3B0aW9uRWwgPSAkKCdbZGF0YS1ndWVzdC1vcHRpb24tJyArIGkgKyAnXScpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkbmFtZUVsLmZpbmQoJ2lucHV0JykuYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRvcHRpb25FbC5maW5kKCdzZWxlY3QnKS5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1ub2d1ZXN0XScpLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgNjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgJG5hbWVFbCA9ICQoJ1tkYXRhLWd1ZXN0LW5hbWUtJyArIGkgKyAnXScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0ICRvcHRpb25FbCA9ICQoJ1tkYXRhLWd1ZXN0LW9wdGlvbi0nICsgaSArICddJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRuYW1lRWwuZmluZCgnaW5wdXQnKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJG9wdGlvbkVsLmZpbmQoJ3NlbGVjdCcpLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGRhdGFMb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbignZGF0YS5sb2FkZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBsZXQgJG5hdmJhciA9ICQoJ1tkYXRhLW5hdj1uYXZiYXJdJyk7XG4gICAgICAgICAgICAgICAgbGV0ICRwcm9wb3NhbFRpdGxlID0gJCgnW2RhdGEtc2VjdGlvbi10aXRsZT1wcm9wb3NhbF0nKTtcbiAgICAgICAgICAgICAgICBsZXQgdGV4dFRvcDtcbiAgICAgICAgICAgICAgICBsZXQgdGV4dExlZnQ7XG5cbiAgICAgICAgICAgICAgICBndWVzdE5hbWUgPSBndWVzdE5hbWVzWzBdLm5hbWU7XG5cbiAgICAgICAgICAgICAgICAkbmF2YmFyLnJlbW92ZUNsYXNzKCdpbnZpc2libGUnKS5oaWRlKCkuZmFkZUluKCk7XG4gICAgICAgICAgICAgICAgJHJzdnBDb2RlRm9ybS5hZGRDbGFzcygnaGlkZGVuLXhzLXVwJykuZmFkZU91dCgpO1xuICAgICAgICAgICAgICAgICR3ZWxjb21lVGV4dC5hcHBlbmQoJCgnPGgzIGNsYXNzPVwid2VsY29tZSB0ZXh0LXhzLWNlbnRlclwiPldlbGNvbWUgJyArIGd1ZXN0TmFtZSArICchPC9oMz4nKSk7XG4gICAgICAgICAgICAgICAgdGV4dFRvcCA9ICQod2luZG93KS5oZWlnaHQoKSAvIDIgLSAkd2VsY29tZVRleHQuZmluZCgnaDMnKS5oZWlnaHQoKSAvIDI7XG4gICAgICAgICAgICAgICAgdGV4dExlZnQgPSAkKHdpbmRvdykud2lkdGgoKSAvIDIgLSAkd2VsY29tZVRleHQuZmluZCgnaDMnKS53aWR0aCgpIC8gMjtcbiAgICAgICAgICAgICAgICAkd2VsY29tZVRleHQuZmluZCgnaDMnKS5jc3Moe1xuICAgICAgICAgICAgICAgICAgICB0b3A6IHRleHRUb3AgKyAncHgnLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0ZXh0TGVmdCArICdweCdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS1ub2RlPWluZm9dJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbi14cy11cCcpO1xuICAgICAgICAgICAgICAgICQoJyNwcm9wb3NhbCcpLnBhcmFsbGF4KHtcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VTcmM6ICdjc3MvaW1hZ2VzL21laWppLWppbmd1LWdhcmRlbi0xLmpwZycsXG4gICAgICAgICAgICAgICAgICAgIHNwZWVkOiAwLjJcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmIChndWVzdE5hbWUgPT09ICdHdWVzdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnW2RhdGEtcnN2cC1hbmNob3JdJykuZW1wdHkoKS5hcHBlbmQoJ1dFTENPTUUnKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnW2RhdGEtcnN2cC1vbmx5XScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAkKCdbZGF0YS1ndWVzdC1vbmx5XScpLnJlbW92ZUNsYXNzKCdoaWRkZW4teHMtdXAnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkKCdbZGF0YS1ndWVzdC1vbmx5XScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVEeW5hbWljR3Vlc3RJbmZvKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdXNlci1uYW1lXScpLmFwcGVuZChndWVzdE5hbWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGhhbmRsZVJhdGlvQ2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCByYXRpbyA9ICQod2luZG93KS5oZWlnaHQoKSAvICQod2luZG93KS53aWR0aCgpO1xuXG4gICAgICAgICAgICBpZiAocmF0aW8gPiAwLjU2Mikge1xuICAgICAgICAgICAgICAgIGhhbmRsZUhlaWdodENlbnRyaWNEaXNwbGF5KCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJhdGlvIDwgMC41NjIpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVXaWR0aENlbnRyaWNEaXNwbGF5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGhhbmRsZUhlaWdodENlbnRyaWNEaXNwbGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgd2luZG93SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuICAgICAgICAgICAgbGV0IG5ld1ZpZGVvV2lkdGggPSByYXRpb1dpZHRoICogd2luZG93SGVpZ2h0IC8gcmF0aW9IZWlnaHQ7XG5cbiAgICAgICAgICAgICR2aWRlby5jc3Moe1xuICAgICAgICAgICAgICAgIGhlaWdodDogd2luZG93SGVpZ2h0LFxuICAgICAgICAgICAgICAgIHdpZHRoOiBuZXdWaWRlb1dpZHRoLFxuICAgICAgICAgICAgICAgIGxlZnQ6IChuZXdWaWRlb1dpZHRoIC0gJCh3aW5kb3cpLndpZHRoKCkpIC8gMiAqIC0xXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJHZpZGVvQ29udGFpbmVyLmNzcyh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB3aW5kb3dIZWlnaHQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgaGFuZGxlV2lkdGhDZW50cmljRGlzcGxheSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0IHdpbmRvd1dpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XG4gICAgICAgICAgICBsZXQgd2luZG93SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuICAgICAgICAgICAgbGV0IG5ld1ZpZGVvSGVpZ2h0ID0gcmF0aW9IZWlnaHQgKiB3aW5kb3dXaWR0aCAvIHJhdGlvV2lkdGg7XG4gXG4gICAgICAgICAgICAkdmlkZW8uY3NzKHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IG5ld1ZpZGVvSGVpZ2h0LFxuICAgICAgICAgICAgICAgIHdpZHRoOiB3aW5kb3dXaWR0aCxcbiAgICAgICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgICAgIHRvcDogKG5ld1ZpZGVvSGVpZ2h0IC0gd2luZG93SGVpZ2h0KSAvIDIgKiAtMVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICR2aWRlb0NvbnRhaW5lci5jc3Moe1xuICAgICAgICAgICAgICAgIGhlaWdodDogd2luZG93SGVpZ2h0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgbGlzdGVuRm9yVmlkZW9SZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlUmF0aW9DaGVjaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cblxuICAgICAgICBsZXQgY2VudGVyUnN2cElucHV0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgJHJzdnBJbnB1dCA9ICQoJ1tkYXRhLWlucHV0PXJzdnBdJyk7XG4gICAgICAgICAgICBsZXQgaGVpZ2h0RnJvbVRvcCA9ICgkKHdpbmRvdykuaGVpZ2h0KCkgLyAyIC0gMTQpO1xuXG4gICAgICAgICAgICAkcnN2cElucHV0LmNzcygndG9wJywgaGVpZ2h0RnJvbVRvcCArICdweCcpO1xuICAgICAgICAgICAgLy8gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJHJzdnBJbnB1dC5yZW1vdmVDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG4gICAgICAgICAgICAvLyB9LCA1MDAwKTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgbmF2U2Nyb2xsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKCdbZGF0YS1uYXYtbGlua10nKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgbGV0IHRhcmdldCA9ICQodGhpcykuYXR0cignaHJlZicpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRhcmdldCA9ICQodGFyZ2V0KTtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICBzY3JvbGxUb3A6IHRhcmdldC5vZmZzZXQoKS50b3BcbiAgICAgICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBpbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByc3ZwQ29kZVN1Ym1pdCgpO1xuICAgICAgICAgICAgcnN2cFN1Ym1pdCgpO1xuICAgICAgICAgICAgbm9HdWVzdExpc3RlbmVyKCk7XG4gICAgICAgICAgICBub3RDb21pbmdMaXN0ZW5lcigpO1xuICAgICAgICAgICAgZGF0YUxvYWQoKTsgXG4gICAgICAgICAgICBoYW5kbGVSYXRpb0NoZWNrKCk7XG4gICAgICAgICAgICBsaXN0ZW5Gb3JWaWRlb1Jlc2l6ZSgpO1xuICAgICAgICAgICAgY2VudGVyUnN2cElucHV0KCk7XG4gICAgICAgICAgICBuYXZTY3JvbGwoKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW5pdDogaW5pdFxuICAgICAgICB9O1xuICAgIH0pKCk7XG5cbiAgICBhcHAuaW5pdCgpO1xufSk7XG4iXX0=

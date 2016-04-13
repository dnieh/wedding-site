(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

$(function () {
    var app = function () {
        var ratioWidth = 16;
        var ratioHeight = 9;

        var $videoContainer = $('[data-video-container]');
        var $video = $('[data-video]');
        var loginAttempts = 0;
        var $rsvpForm = $('[data-form=rsvp]');
        var $welcomeText = $('[data-welcome]');
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
                    console.log('Authenticated successfully with payload:', authData);
                    guestRef = new Firebase('https://danielkatherine.firebaseio.com/rsvpCodes/' + rsvp);
                    eventRef = new Firebase('https://danielkatherine.firebaseio.com/events/' + rsvp);
                    guestRef.on('value', function (snap) {
                        guestNames = snap.val();
                        callback();
                    });
                    events = eventRef.on('value', function (snap) {
                        return snap.val();
                    });
                }
            });
        };

        var rsvpSubmit = function rsvpSubmit() {
            var $rsvpInput = $('input[name=rsvp]');

            $rsvpForm.on('submit', function (e) {
                var $welcomeText = $('[data-welcome]');
                var rsvp = $rsvpInput.val().toLowerCase();

                e.preventDefault();
                $('.rsvp-error').addClass('hidden-xs-up');
                loginWithRSVP(rsvp, function () {
                    $(document).trigger('data.loaded');
                });
            });
        };

        var dataLoad = function dataLoad() {
            $(document).on('data.loaded', function () {
                var $navbar = $('[data-nav=navbar]');
                var $proposalTitle = $('[data-section-title=proposal]');
                var guestName = guestNames[0].name;
                var textTop = undefined;
                var textLeft = undefined;

                $navbar.removeClass('invisible').hide().fadeIn();
                $rsvpForm.addClass('hidden-xs-up').fadeOut();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzY3JpcHRzL2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBLEVBQUUsWUFBVztBQUNULFFBQUksTUFBTSxZQUFZO0FBQ2xCLFlBQU0sYUFBYSxFQUFiLENBRFk7QUFFbEIsWUFBTSxjQUFjLENBQWQsQ0FGWTs7QUFJbEIsWUFBSSxrQkFBa0IsRUFBRSx3QkFBRixDQUFsQixDQUpjO0FBS2xCLFlBQUksU0FBUyxFQUFFLGNBQUYsQ0FBVCxDQUxjO0FBTWxCLFlBQUksZ0JBQWdCLENBQWhCLENBTmM7QUFPbEIsWUFBSSxZQUFZLEVBQUUsa0JBQUYsQ0FBWixDQVBjO0FBUWxCLFlBQUksZUFBZSxFQUFFLGdCQUFGLENBQWYsQ0FSYztBQVNsQixZQUFJLGFBQWEsRUFBYixDQVRjO0FBVWxCLFlBQUksU0FBUyxFQUFULENBVmM7O0FBWWxCLFlBQUksVUFBVSxJQUFJLFFBQUosQ0FBYSx5Q0FBYixDQUFWLENBWmM7QUFhbEIsWUFBSSxvQkFBSixDQWJrQjtBQWNsQixZQUFJLG9CQUFKLENBZGtCOztBQWdCbEIsWUFBSSxnQkFBZ0IsU0FBaEIsYUFBZ0IsQ0FBUyxJQUFULEVBQWUsUUFBZixFQUF5QjtBQUN6QyxvQkFBUSxnQkFBUixDQUF5QjtBQUNyQix1QkFBTyxPQUFPLGVBQVA7QUFDUCwwQkFBVSxJQUFWO2FBRkosRUFHRyxVQUFTLEtBQVQsRUFBZ0IsUUFBaEIsRUFBMEI7QUFDekIsb0JBQUksS0FBSixFQUFXO0FBQ1Asd0JBQUksZ0JBQWdCLENBQWhCLEVBQW1CO0FBQ25CLGdDQUFRLEdBQVIsQ0FBWSxlQUFaLEVBQTZCLEtBQTdCLEVBRG1CO0FBRW5CLDBCQUFFLGFBQUYsRUFBaUIsV0FBakIsQ0FBNkIsY0FBN0IsRUFGbUI7cUJBQXZCLE1BR087QUFDSCwwQkFBRSxjQUFGLEVBQWtCLFdBQWxCLENBQThC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VCxRQUFJLElBQUosR0ExS1M7Q0FBWCxDQUFGIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuJChmdW5jdGlvbigpIHtcbiAgICBsZXQgYXBwID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCByYXRpb1dpZHRoID0gMTY7XG4gICAgICAgIGNvbnN0IHJhdGlvSGVpZ2h0ID0gOTtcblxuICAgICAgICBsZXQgJHZpZGVvQ29udGFpbmVyID0gJCgnW2RhdGEtdmlkZW8tY29udGFpbmVyXScpO1xuICAgICAgICBsZXQgJHZpZGVvID0gJCgnW2RhdGEtdmlkZW9dJyk7XG4gICAgICAgIGxldCBsb2dpbkF0dGVtcHRzID0gMDtcbiAgICAgICAgbGV0ICRyc3ZwRm9ybSA9ICQoJ1tkYXRhLWZvcm09cnN2cF0nKTtcbiAgICAgICAgbGV0ICR3ZWxjb21lVGV4dCA9ICQoJ1tkYXRhLXdlbGNvbWVdJyk7XG4gICAgICAgIGxldCBndWVzdE5hbWVzID0gW107XG4gICAgICAgIGxldCBldmVudHMgPSB7fTtcblxuICAgICAgICBsZXQgYmFzZVJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9kYW5pZWxrYXRoZXJpbmUuZmlyZWJhc2Vpby5jb20vJyk7XG4gICAgICAgIGxldCBndWVzdFJlZjtcbiAgICAgICAgbGV0IGV2ZW50UmVmO1xuXG4gICAgICAgIGxldCBsb2dpbldpdGhSU1ZQID0gZnVuY3Rpb24ocnN2cCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGJhc2VSZWYuYXV0aFdpdGhQYXNzd29yZCh7XG4gICAgICAgICAgICAgICAgZW1haWw6IHJzdnAgKyAnQGZpcmViYXNlLmNvbScsXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHJzdnBcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yLCBhdXRoRGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAobG9naW5BdHRlbXB0cyA8IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdMb2dpbiBGYWlsZWQhJywgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnJzdnAtZXJyb3InKS5yZW1vdmVDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuZ3Vlc3QtbG9naW4nKS5yZW1vdmVDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQXR0ZW1wdGluZyB0byBsb2dpbiBhcyBndWVzdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9naW5XaXRoUlNWUCgnZ3Vlc3QnLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbG9naW5BdHRlbXB0cysrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBdXRoZW50aWNhdGVkIHN1Y2Nlc3NmdWxseSB3aXRoIHBheWxvYWQ6JywgYXV0aERhdGEpO1xuICAgICAgICAgICAgICAgICAgICBndWVzdFJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9kYW5pZWxrYXRoZXJpbmUuZmlyZWJhc2Vpby5jb20vcnN2cENvZGVzLycgKyByc3ZwKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRSZWYgPSAgbmV3IEZpcmViYXNlKCdodHRwczovL2RhbmllbGthdGhlcmluZS5maXJlYmFzZWlvLmNvbS9ldmVudHMvJyArIHJzdnApO1xuICAgICAgICAgICAgICAgICAgICBndWVzdFJlZi5vbigndmFsdWUnLCAoc25hcCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ3Vlc3ROYW1lcyA9IHNuYXAudmFsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzID0gZXZlbnRSZWYub24oJ3ZhbHVlJywgKHNuYXApID0+IHNuYXAudmFsKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgbGV0IHJzdnBTdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCAkcnN2cElucHV0ID0gJCgnaW5wdXRbbmFtZT1yc3ZwXScpO1xuXG4gICAgICAgICAgICAkcnN2cEZvcm0ub24oJ3N1Ym1pdCcsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0ICR3ZWxjb21lVGV4dCA9ICQoJ1tkYXRhLXdlbGNvbWVdJyk7XG4gICAgICAgICAgICAgICAgbGV0IHJzdnAgPSAkcnN2cElucHV0LnZhbCgpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgJCgnLnJzdnAtZXJyb3InKS5hZGRDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG4gICAgICAgICAgICAgICAgbG9naW5XaXRoUlNWUChyc3ZwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcignZGF0YS5sb2FkZWQnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBkYXRhTG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ2RhdGEubG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgbGV0ICRuYXZiYXIgPSAkKCdbZGF0YS1uYXY9bmF2YmFyXScpO1xuICAgICAgICAgICAgICAgIGxldCAkcHJvcG9zYWxUaXRsZSA9ICQoJ1tkYXRhLXNlY3Rpb24tdGl0bGU9cHJvcG9zYWxdJyk7XG4gICAgICAgICAgICAgICAgbGV0IGd1ZXN0TmFtZSA9IGd1ZXN0TmFtZXNbMF0ubmFtZTtcbiAgICAgICAgICAgICAgICBsZXQgdGV4dFRvcDtcbiAgICAgICAgICAgICAgICBsZXQgdGV4dExlZnQ7XG5cbiAgICAgICAgICAgICAgICAkbmF2YmFyLnJlbW92ZUNsYXNzKCdpbnZpc2libGUnKS5oaWRlKCkuZmFkZUluKCk7XG4gICAgICAgICAgICAgICAgJHJzdnBGb3JtLmFkZENsYXNzKCdoaWRkZW4teHMtdXAnKS5mYWRlT3V0KCk7XG4gICAgICAgICAgICAgICAgJHdlbGNvbWVUZXh0LmFwcGVuZCgkKCc8aDMgY2xhc3M9XCJ3ZWxjb21lIHRleHQteHMtY2VudGVyXCI+V2VsY29tZSAnICsgZ3Vlc3ROYW1lICsgJyE8L2gzPicpKTtcbiAgICAgICAgICAgICAgICB0ZXh0VG9wID0gJCh3aW5kb3cpLmhlaWdodCgpIC8gMiAtICR3ZWxjb21lVGV4dC5maW5kKCdoMycpLmhlaWdodCgpIC8gMjtcbiAgICAgICAgICAgICAgICB0ZXh0TGVmdCA9ICQod2luZG93KS53aWR0aCgpIC8gMiAtICR3ZWxjb21lVGV4dC5maW5kKCdoMycpLndpZHRoKCkgLyAyO1xuICAgICAgICAgICAgICAgICR3ZWxjb21lVGV4dC5maW5kKCdoMycpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHRvcDogdGV4dFRvcCArICdweCcsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHRleHRMZWZ0ICsgJ3B4J1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICQoJ1tkYXRhLW5vZGU9aW5mb10nKS5yZW1vdmVDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG4gICAgICAgICAgICAgICAgJCgnI3Byb3Bvc2FsJykucGFyYWxsYXgoe1xuICAgICAgICAgICAgICAgICAgICBpbWFnZVNyYzogJ2Nzcy9pbWFnZXMvbWVpamktamluZ3UtZ2FyZGVuLTEuanBnJyxcbiAgICAgICAgICAgICAgICAgICAgc3BlZWQ6IDAuMlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGhhbmRsZVJhdGlvQ2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCByYXRpbyA9ICQod2luZG93KS5oZWlnaHQoKSAvICQod2luZG93KS53aWR0aCgpO1xuXG4gICAgICAgICAgICBpZiAocmF0aW8gPiAwLjU2Mikge1xuICAgICAgICAgICAgICAgIGhhbmRsZUhlaWdodENlbnRyaWNEaXNwbGF5KCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJhdGlvIDwgMC41NjIpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVXaWR0aENlbnRyaWNEaXNwbGF5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGhhbmRsZUhlaWdodENlbnRyaWNEaXNwbGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgd2luZG93SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuICAgICAgICAgICAgbGV0IG5ld1ZpZGVvV2lkdGggPSByYXRpb1dpZHRoICogd2luZG93SGVpZ2h0IC8gcmF0aW9IZWlnaHQ7XG5cbiAgICAgICAgICAgICR2aWRlby5jc3Moe1xuICAgICAgICAgICAgICAgIGhlaWdodDogd2luZG93SGVpZ2h0LFxuICAgICAgICAgICAgICAgIHdpZHRoOiBuZXdWaWRlb1dpZHRoLFxuICAgICAgICAgICAgICAgIGxlZnQ6IChuZXdWaWRlb1dpZHRoIC0gJCh3aW5kb3cpLndpZHRoKCkpIC8gMiAqIC0xXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJHZpZGVvQ29udGFpbmVyLmNzcyh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB3aW5kb3dIZWlnaHQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgaGFuZGxlV2lkdGhDZW50cmljRGlzcGxheSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0IHdpbmRvd1dpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XG4gICAgICAgICAgICBsZXQgd2luZG93SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuICAgICAgICAgICAgbGV0IG5ld1ZpZGVvSGVpZ2h0ID0gcmF0aW9IZWlnaHQgKiB3aW5kb3dXaWR0aCAvIHJhdGlvV2lkdGg7XG4gXG4gICAgICAgICAgICAkdmlkZW8uY3NzKHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IG5ld1ZpZGVvSGVpZ2h0LFxuICAgICAgICAgICAgICAgIHdpZHRoOiB3aW5kb3dXaWR0aCxcbiAgICAgICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgICAgIHRvcDogKG5ld1ZpZGVvSGVpZ2h0IC0gd2luZG93SGVpZ2h0KSAvIDIgKiAtMVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICR2aWRlb0NvbnRhaW5lci5jc3Moe1xuICAgICAgICAgICAgICAgIGhlaWdodDogd2luZG93SGVpZ2h0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgbGlzdGVuRm9yVmlkZW9SZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlUmF0aW9DaGVjaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cblxuICAgICAgICBsZXQgY2VudGVyUnN2cElucHV0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgJHJzdnBJbnB1dCA9ICQoJ1tkYXRhLWlucHV0PXJzdnBdJyk7XG4gICAgICAgICAgICBsZXQgaGVpZ2h0RnJvbVRvcCA9ICgkKHdpbmRvdykuaGVpZ2h0KCkgLyAyIC0gMTQpO1xuXG4gICAgICAgICAgICAkcnN2cElucHV0LmNzcygndG9wJywgaGVpZ2h0RnJvbVRvcCArICdweCcpO1xuICAgICAgICAgICAgLy8gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJHJzdnBJbnB1dC5yZW1vdmVDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG4gICAgICAgICAgICAvLyB9LCA1MDAwKTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgbmF2U2Nyb2xsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKCdbZGF0YS1uYXYtbGlua10nKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgbGV0IHRhcmdldCA9ICQodGhpcykuYXR0cignaHJlZicpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRhcmdldCA9ICQodGFyZ2V0KTtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICBzY3JvbGxUb3A6IHRhcmdldC5vZmZzZXQoKS50b3BcbiAgICAgICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBpbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByc3ZwU3VibWl0KCk7XG4gICAgICAgICAgICBkYXRhTG9hZCgpOyBcbiAgICAgICAgICAgIGhhbmRsZVJhdGlvQ2hlY2soKTtcbiAgICAgICAgICAgIGxpc3RlbkZvclZpZGVvUmVzaXplKCk7XG4gICAgICAgICAgICBjZW50ZXJSc3ZwSW5wdXQoKTtcbiAgICAgICAgICAgIG5hdlNjcm9sbCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbml0OiBpbml0XG4gICAgICAgIH07XG4gICAgfSkoKTtcblxuICAgIGFwcC5pbml0KCk7XG59KTtcbiJdfQ==

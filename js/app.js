(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

$(function () {
    var app = function () {
        var $videoContainer = $('[data-video-container]');
        var $video = $('[data-video]');
        var ratioWidth = 16;
        var ratioHeight = 9;

        var rsvpSubmit = function rsvpSubmit() {
            var $rsvpForm = $('[data-form=rsvp]');

            $rsvpForm.on('submit', function (e) {
                var $welcomeText = $('[data-welcome]');
                var $downArrow = $('[data-arrow-down]');

                e.preventDefault();

                // TODO -- validate rsvp code
                $(document).trigger('data.loaded');
                $rsvpForm.addClass('hidden-xs-up').fadeOut();
                // $welcomeText.append($('<h3 class="welcome text-xs-center">Welcome Daniel!</h3>'));
                // $welcomeText.find('h3').css('top', ($(window).height() / 2) - 30 + 'px');
                // $downArrow.removeClass('hidden-xs-up');
                // $downArrow.css({ marginTop: $(window).height() * 0.85 });
                // $downArrow.find('i').addClass('pulse');
                $('[data-node=info]').removeClass('hidden-xs-up');
                $('#proposal').parallax({
                    imageSrc: 'css/images/meiji-jingu-garden-1.jpg',
                    speed: 0.2
                });
            });
        };

        var dataLoad = function dataLoad() {
            $(document).on('data.loaded', function () {
                var $navbar = $('[data-nav=navbar]');
                var $proposalTitle = $('[data-section-title=proposal]');

                $navbar.removeClass('invisible').hide().fadeIn();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzY3JpcHRzL2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBLEVBQUUsWUFBVztBQUNULFFBQUksTUFBTSxZQUFZO0FBQ2xCLFlBQUksa0JBQWtCLEVBQUUsd0JBQUYsQ0FBbEIsQ0FEYztBQUVsQixZQUFJLFNBQVMsRUFBRSxjQUFGLENBQVQsQ0FGYztBQUdsQixZQUFNLGFBQWEsRUFBYixDQUhZO0FBSWxCLFlBQU0sY0FBYyxDQUFkLENBSlk7O0FBTWxCLFlBQUksYUFBYSxTQUFiLFVBQWEsR0FBVztBQUN4QixnQkFBSSxZQUFZLEVBQUUsa0JBQUYsQ0FBWixDQURvQjs7QUFHeEIsc0JBQVUsRUFBVixDQUFhLFFBQWIsRUFBdUIsVUFBQyxDQUFELEVBQU87QUFDMUIsb0JBQUksZUFBZSxFQUFFLGdCQUFGLENBQWYsQ0FEc0I7QUFFMUIsb0JBQUksYUFBYSxFQUFFLG1CQUFGLENBQWIsQ0FGc0I7O0FBSTFCLGtCQUFFLGNBQUY7OztBQUowQixpQkFPMUIsQ0FBRSxRQUFGLEVBQVksT0FBWixDQUFvQixhQUFwQixFQVAwQjtBQVExQiwwQkFBVSxRQUFWLENBQW1CLGNBQW5CLEVBQW1DLE9BQW5DOzs7Ozs7QUFSMEIsaUJBYzFCLENBQUUsa0JBQUYsRUFBc0IsV0FBdEIsQ0FBa0MsY0FBbEMsRUFkMEI7QUFlMUIsa0JBQUUsV0FBRixFQUFlLFFBQWYsQ0FBd0I7QUFDcEIsOEJBQVUscUNBQVY7QUFDQSwyQkFBTyxHQUFQO2lCQUZKLEVBZjBCO2FBQVAsQ0FBdkIsQ0FId0I7U0FBWCxDQU5DOztBQStCbEIsWUFBSSxXQUFXLFNBQVgsUUFBVyxHQUFXO0FBQ3RCLGNBQUUsUUFBRixFQUFZLEVBQVosQ0FBZSxhQUFmLEVBQThCLFlBQVc7QUFDckMsb0JBQUksVUFBVSxFQUFFLG1CQUFGLENBQVYsQ0FEaUM7QUFF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TyxTQUFQLElBQU8sR0FBVztBQUNsQix5QkFEa0I7QUFFbEIsdUJBRmtCO0FBR2xCLCtCQUhrQjtBQUlsQixtQ0FKa0I7QUFLbEIsOEJBTGtCO0FBTWxCLHdCQU5rQjtTQUFYLENBL0dPOztBQXdIbEIsZUFBTztBQUNILGtCQUFNLElBQU47U0FESixDQXhIa0I7S0FBWCxFQUFQLENBREs7O0FBOEhULFFBQUksSUFBSixHQTlIUztDQUFYLENBQUYiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG4kKGZ1bmN0aW9uKCkge1xuICAgIGxldCBhcHAgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCAkdmlkZW9Db250YWluZXIgPSAkKCdbZGF0YS12aWRlby1jb250YWluZXJdJyk7XG4gICAgICAgIGxldCAkdmlkZW8gPSAkKCdbZGF0YS12aWRlb10nKTtcbiAgICAgICAgY29uc3QgcmF0aW9XaWR0aCA9IDE2O1xuICAgICAgICBjb25zdCByYXRpb0hlaWdodCA9IDk7XG5cbiAgICAgICAgbGV0IHJzdnBTdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCAkcnN2cEZvcm0gPSAkKCdbZGF0YS1mb3JtPXJzdnBdJyk7XG5cbiAgICAgICAgICAgICRyc3ZwRm9ybS5vbignc3VibWl0JywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgJHdlbGNvbWVUZXh0ID0gJCgnW2RhdGEtd2VsY29tZV0nKTtcbiAgICAgICAgICAgICAgICBsZXQgJGRvd25BcnJvdyA9ICQoJ1tkYXRhLWFycm93LWRvd25dJyk7XG5cbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBUT0RPIC0tIHZhbGlkYXRlIHJzdnAgY29kZVxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ2RhdGEubG9hZGVkJyk7XG4gICAgICAgICAgICAgICAgJHJzdnBGb3JtLmFkZENsYXNzKCdoaWRkZW4teHMtdXAnKS5mYWRlT3V0KCk7XG4gICAgICAgICAgICAgICAgLy8gJHdlbGNvbWVUZXh0LmFwcGVuZCgkKCc8aDMgY2xhc3M9XCJ3ZWxjb21lIHRleHQteHMtY2VudGVyXCI+V2VsY29tZSBEYW5pZWwhPC9oMz4nKSk7XG4gICAgICAgICAgICAgICAgLy8gJHdlbGNvbWVUZXh0LmZpbmQoJ2gzJykuY3NzKCd0b3AnLCAoJCh3aW5kb3cpLmhlaWdodCgpIC8gMikgLSAzMCArICdweCcpO1xuICAgICAgICAgICAgICAgIC8vICRkb3duQXJyb3cucmVtb3ZlQ2xhc3MoJ2hpZGRlbi14cy11cCcpO1xuICAgICAgICAgICAgICAgIC8vICRkb3duQXJyb3cuY3NzKHsgbWFyZ2luVG9wOiAkKHdpbmRvdykuaGVpZ2h0KCkgKiAwLjg1IH0pO1xuICAgICAgICAgICAgICAgIC8vICRkb3duQXJyb3cuZmluZCgnaScpLmFkZENsYXNzKCdwdWxzZScpOyBcbiAgICAgICAgICAgICAgICAkKCdbZGF0YS1ub2RlPWluZm9dJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbi14cy11cCcpO1xuICAgICAgICAgICAgICAgICQoJyNwcm9wb3NhbCcpLnBhcmFsbGF4KHtcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VTcmM6ICdjc3MvaW1hZ2VzL21laWppLWppbmd1LWdhcmRlbi0xLmpwZycsXG4gICAgICAgICAgICAgICAgICAgIHNwZWVkOiAwLjJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBkYXRhTG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ2RhdGEubG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgbGV0ICRuYXZiYXIgPSAkKCdbZGF0YS1uYXY9bmF2YmFyXScpO1xuICAgICAgICAgICAgICAgIGxldCAkcHJvcG9zYWxUaXRsZSA9ICQoJ1tkYXRhLXNlY3Rpb24tdGl0bGU9cHJvcG9zYWxdJyk7XG5cbiAgICAgICAgICAgICAgICAkbmF2YmFyLnJlbW92ZUNsYXNzKCdpbnZpc2libGUnKS5oaWRlKCkuZmFkZUluKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgaGFuZGxlUmF0aW9DaGVjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0IHJhdGlvID0gJCh3aW5kb3cpLmhlaWdodCgpIC8gJCh3aW5kb3cpLndpZHRoKCk7XG5cbiAgICAgICAgICAgIGlmIChyYXRpbyA+IDAuNTYyKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlSGVpZ2h0Q2VudHJpY0Rpc3BsYXkoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocmF0aW8gPCAwLjU2Mikge1xuICAgICAgICAgICAgICAgIGhhbmRsZVdpZHRoQ2VudHJpY0Rpc3BsYXkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgaGFuZGxlSGVpZ2h0Q2VudHJpY0Rpc3BsYXkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCB3aW5kb3dIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XG4gICAgICAgICAgICBsZXQgbmV3VmlkZW9XaWR0aCA9IHJhdGlvV2lkdGggKiB3aW5kb3dIZWlnaHQgLyByYXRpb0hlaWdodDtcblxuICAgICAgICAgICAgJHZpZGVvLmNzcyh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB3aW5kb3dIZWlnaHQsXG4gICAgICAgICAgICAgICAgd2lkdGg6IG5ld1ZpZGVvV2lkdGgsXG4gICAgICAgICAgICAgICAgbGVmdDogKG5ld1ZpZGVvV2lkdGggLSAkKHdpbmRvdykud2lkdGgoKSkgLyAyICogLTFcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkdmlkZW9Db250YWluZXIuY3NzKHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHdpbmRvd0hlaWdodCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBoYW5kbGVXaWR0aENlbnRyaWNEaXNwbGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgd2luZG93V2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcbiAgICAgICAgICAgIGxldCB3aW5kb3dIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XG4gICAgICAgICAgICBsZXQgbmV3VmlkZW9IZWlnaHQgPSByYXRpb0hlaWdodCAqIHdpbmRvd1dpZHRoIC8gcmF0aW9XaWR0aDtcbiBcbiAgICAgICAgICAgICR2aWRlby5jc3Moe1xuICAgICAgICAgICAgICAgIGhlaWdodDogbmV3VmlkZW9IZWlnaHQsXG4gICAgICAgICAgICAgICAgd2lkdGg6IHdpbmRvd1dpZHRoLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgICAgICAgdG9wOiAobmV3VmlkZW9IZWlnaHQgLSB3aW5kb3dIZWlnaHQpIC8gMiAqIC0xXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJHZpZGVvQ29udGFpbmVyLmNzcyh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB3aW5kb3dIZWlnaHRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBsaXN0ZW5Gb3JWaWRlb1Jlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVSYXRpb0NoZWNrKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuXG4gICAgICAgIGxldCBjZW50ZXJSc3ZwSW5wdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCAkcnN2cElucHV0ID0gJCgnW2RhdGEtaW5wdXQ9cnN2cF0nKTtcbiAgICAgICAgICAgIGxldCBoZWlnaHRGcm9tVG9wID0gKCQod2luZG93KS5oZWlnaHQoKSAvIDIgLSAxNCk7XG5cbiAgICAgICAgICAgICRyc3ZwSW5wdXQuY3NzKCd0b3AnLCBoZWlnaHRGcm9tVG9wICsgJ3B4Jyk7XG4gICAgICAgICAgICAvLyB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkcnN2cElucHV0LnJlbW92ZUNsYXNzKCdoaWRkZW4teHMtdXAnKTtcbiAgICAgICAgICAgIC8vIH0sIDUwMDApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBuYXZTY3JvbGwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICQoJ1tkYXRhLW5hdi1saW5rXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gJCh0YXJnZXQpO1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvcDogdGFyZ2V0Lm9mZnNldCgpLnRvcFxuICAgICAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGluaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJzdnBTdWJtaXQoKTtcbiAgICAgICAgICAgIGRhdGFMb2FkKCk7IFxuICAgICAgICAgICAgaGFuZGxlUmF0aW9DaGVjaygpO1xuICAgICAgICAgICAgbGlzdGVuRm9yVmlkZW9SZXNpemUoKTtcbiAgICAgICAgICAgIGNlbnRlclJzdnBJbnB1dCgpO1xuICAgICAgICAgICAgbmF2U2Nyb2xsKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGluaXQ6IGluaXRcbiAgICAgICAgfTtcbiAgICB9KSgpO1xuXG4gICAgYXBwLmluaXQoKTtcbn0pO1xuIl19

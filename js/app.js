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
                // $(document).trigger('data.loaded');
                $rsvpForm.addClass('hidden-xs-up').fadeOut();
                // $welcomeText.append($('<h3 class="welcome text-xs-center">Welcome Daniel!</h3>'));
                // $welcomeText.find('h3').css('top', ($(window).height() / 2) - 30 + 'px');
                // $downArrow.removeClass('hidden-xs-up');
                // $downArrow.css({ marginTop: $(window).height() * 0.85 });
                // $downArrow.find('i').addClass('pulse');
                // $('[data-node=info]').removeClass('hidden-xs-up');
                // $('#proposal').parallax({
                //imageSrc: 'css/images/meiji-jingu-garden-1.jpg',
                //speed: 0.2
                //});
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzY3JpcHRzL2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBLEVBQUUsWUFBVztBQUNULFFBQUksTUFBTSxZQUFZO0FBQ2xCLFlBQUksa0JBQWtCLEVBQUUsd0JBQUYsQ0FBbEIsQ0FEYztBQUVsQixZQUFJLFNBQVMsRUFBRSxjQUFGLENBQVQsQ0FGYztBQUdsQixZQUFNLGFBQWEsRUFBYixDQUhZO0FBSWxCLFlBQU0sY0FBYyxDQUFkLENBSlk7O0FBTWxCLFlBQUksYUFBYSxTQUFiLFVBQWEsR0FBVztBQUN4QixnQkFBSSxZQUFZLEVBQUUsa0JBQUYsQ0FBWixDQURvQjs7QUFHeEIsc0JBQVUsRUFBVixDQUFhLFFBQWIsRUFBdUIsVUFBQyxDQUFELEVBQU87QUFDMUIsb0JBQUksZUFBZSxFQUFFLGdCQUFGLENBQWYsQ0FEc0I7QUFFMUIsb0JBQUksYUFBYSxFQUFFLG1CQUFGLENBQWIsQ0FGc0I7O0FBSTFCLGtCQUFFLGNBQUY7Ozs7QUFKMEIseUJBUTFCLENBQVUsUUFBVixDQUFtQixjQUFuQixFQUFtQyxPQUFuQzs7Ozs7Ozs7Ozs7QUFSMEIsYUFBUCxDQUF2QixDQUh3QjtTQUFYLENBTkM7O0FBK0JsQixZQUFJLFdBQVcsU0FBWCxRQUFXLEdBQVc7QUFDdEIsY0FBRSxRQUFGLEVBQVksRUFBWixDQUFlLGFBQWYsRUFBOEIsWUFBVztBQUNyQyxvQkFBSSxVQUFVLEVBQUUsbUJBQUYsQ0FBVixDQURpQztBQUVyQyxvQkFBSSxpQkFBaUIsRUFBRSwrQkFBRixDQUFqQixDQUZpQzs7QUFJckMsd0JBQVEsV0FBUixDQUFvQixXQUFwQixFQUFpQyxJQUFqQyxHQUF3QyxNQUF4QyxHQUpxQzthQUFYLENBQTlCLENBRHNCO1NBQVgsQ0EvQkc7O0FBd0NsQixZQUFJLG1CQUFtQixTQUFuQixnQkFBbUIsR0FBVztB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SFQsUUFBSSxJQUFKLEdBOUhTO0NBQVgsQ0FBRiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbiQoZnVuY3Rpb24oKSB7XG4gICAgbGV0IGFwcCA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0ICR2aWRlb0NvbnRhaW5lciA9ICQoJ1tkYXRhLXZpZGVvLWNvbnRhaW5lcl0nKTtcbiAgICAgICAgbGV0ICR2aWRlbyA9ICQoJ1tkYXRhLXZpZGVvXScpO1xuICAgICAgICBjb25zdCByYXRpb1dpZHRoID0gMTY7XG4gICAgICAgIGNvbnN0IHJhdGlvSGVpZ2h0ID0gOTtcblxuICAgICAgICBsZXQgcnN2cFN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0ICRyc3ZwRm9ybSA9ICQoJ1tkYXRhLWZvcm09cnN2cF0nKTtcblxuICAgICAgICAgICAgJHJzdnBGb3JtLm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCAkd2VsY29tZVRleHQgPSAkKCdbZGF0YS13ZWxjb21lXScpO1xuICAgICAgICAgICAgICAgIGxldCAkZG93bkFycm93ID0gJCgnW2RhdGEtYXJyb3ctZG93bl0nKTtcblxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIFRPRE8gLS0gdmFsaWRhdGUgcnN2cCBjb2RlXG4gICAgICAgICAgICAgICAgLy8gJChkb2N1bWVudCkudHJpZ2dlcignZGF0YS5sb2FkZWQnKTtcbiAgICAgICAgICAgICAgICAkcnN2cEZvcm0uYWRkQ2xhc3MoJ2hpZGRlbi14cy11cCcpLmZhZGVPdXQoKTtcbiAgICAgICAgICAgICAgICAvLyAkd2VsY29tZVRleHQuYXBwZW5kKCQoJzxoMyBjbGFzcz1cIndlbGNvbWUgdGV4dC14cy1jZW50ZXJcIj5XZWxjb21lIERhbmllbCE8L2gzPicpKTtcbiAgICAgICAgICAgICAgICAvLyAkd2VsY29tZVRleHQuZmluZCgnaDMnKS5jc3MoJ3RvcCcsICgkKHdpbmRvdykuaGVpZ2h0KCkgLyAyKSAtIDMwICsgJ3B4Jyk7XG4gICAgICAgICAgICAgICAgLy8gJGRvd25BcnJvdy5yZW1vdmVDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG4gICAgICAgICAgICAgICAgLy8gJGRvd25BcnJvdy5jc3MoeyBtYXJnaW5Ub3A6ICQod2luZG93KS5oZWlnaHQoKSAqIDAuODUgfSk7XG4gICAgICAgICAgICAgICAgLy8gJGRvd25BcnJvdy5maW5kKCdpJykuYWRkQ2xhc3MoJ3B1bHNlJyk7IFxuICAgICAgICAgICAgICAgIC8vICQoJ1tkYXRhLW5vZGU9aW5mb10nKS5yZW1vdmVDbGFzcygnaGlkZGVuLXhzLXVwJyk7XG4gICAgICAgICAgICAgICAgLy8gJCgnI3Byb3Bvc2FsJykucGFyYWxsYXgoe1xuICAgICAgICAgICAgICAgICAgICAvL2ltYWdlU3JjOiAnY3NzL2ltYWdlcy9tZWlqaS1qaW5ndS1nYXJkZW4tMS5qcGcnLFxuICAgICAgICAgICAgICAgICAgICAvL3NwZWVkOiAwLjJcbiAgICAgICAgICAgICAgICAvL30pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGRhdGFMb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbignZGF0YS5sb2FkZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBsZXQgJG5hdmJhciA9ICQoJ1tkYXRhLW5hdj1uYXZiYXJdJyk7XG4gICAgICAgICAgICAgICAgbGV0ICRwcm9wb3NhbFRpdGxlID0gJCgnW2RhdGEtc2VjdGlvbi10aXRsZT1wcm9wb3NhbF0nKTtcblxuICAgICAgICAgICAgICAgICRuYXZiYXIucmVtb3ZlQ2xhc3MoJ2ludmlzaWJsZScpLmhpZGUoKS5mYWRlSW4oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBoYW5kbGVSYXRpb0NoZWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgcmF0aW8gPSAkKHdpbmRvdykuaGVpZ2h0KCkgLyAkKHdpbmRvdykud2lkdGgoKTtcblxuICAgICAgICAgICAgaWYgKHJhdGlvID4gMC41NjIpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVIZWlnaHRDZW50cmljRGlzcGxheSgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChyYXRpbyA8IDAuNTYyKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlV2lkdGhDZW50cmljRGlzcGxheSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBoYW5kbGVIZWlnaHRDZW50cmljRGlzcGxheSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0IHdpbmRvd0hlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKTtcbiAgICAgICAgICAgIGxldCBuZXdWaWRlb1dpZHRoID0gcmF0aW9XaWR0aCAqIHdpbmRvd0hlaWdodCAvIHJhdGlvSGVpZ2h0O1xuXG4gICAgICAgICAgICAkdmlkZW8uY3NzKHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHdpbmRvd0hlaWdodCxcbiAgICAgICAgICAgICAgICB3aWR0aDogbmV3VmlkZW9XaWR0aCxcbiAgICAgICAgICAgICAgICBsZWZ0OiAobmV3VmlkZW9XaWR0aCAtICQod2luZG93KS53aWR0aCgpKSAvIDIgKiAtMVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICR2aWRlb0NvbnRhaW5lci5jc3Moe1xuICAgICAgICAgICAgICAgIGhlaWdodDogd2luZG93SGVpZ2h0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGhhbmRsZVdpZHRoQ2VudHJpY0Rpc3BsYXkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCB3aW5kb3dXaWR0aCA9ICQod2luZG93KS53aWR0aCgpO1xuICAgICAgICAgICAgbGV0IHdpbmRvd0hlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKTtcbiAgICAgICAgICAgIGxldCBuZXdWaWRlb0hlaWdodCA9IHJhdGlvSGVpZ2h0ICogd2luZG93V2lkdGggLyByYXRpb1dpZHRoO1xuIFxuICAgICAgICAgICAgJHZpZGVvLmNzcyh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBuZXdWaWRlb0hlaWdodCxcbiAgICAgICAgICAgICAgICB3aWR0aDogd2luZG93V2lkdGgsXG4gICAgICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgICAgICB0b3A6IChuZXdWaWRlb0hlaWdodCAtIHdpbmRvd0hlaWdodCkgLyAyICogLTFcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkdmlkZW9Db250YWluZXIuY3NzKHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHdpbmRvd0hlaWdodFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGxpc3RlbkZvclZpZGVvUmVzaXplID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGhhbmRsZVJhdGlvQ2hlY2soKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG5cbiAgICAgICAgbGV0IGNlbnRlclJzdnBJbnB1dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0ICRyc3ZwSW5wdXQgPSAkKCdbZGF0YS1pbnB1dD1yc3ZwXScpO1xuICAgICAgICAgICAgbGV0IGhlaWdodEZyb21Ub3AgPSAoJCh3aW5kb3cpLmhlaWdodCgpIC8gMiAtIDE0KTtcblxuICAgICAgICAgICAgJHJzdnBJbnB1dC5jc3MoJ3RvcCcsIGhlaWdodEZyb21Ub3AgKyAncHgnKTtcbiAgICAgICAgICAgIC8vIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICRyc3ZwSW5wdXQucmVtb3ZlQ2xhc3MoJ2hpZGRlbi14cy11cCcpO1xuICAgICAgICAgICAgLy8gfSwgNTAwMCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IG5hdlNjcm9sbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCgnW2RhdGEtbmF2LWxpbmtdJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGxldCB0YXJnZXQgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSAkKHRhcmdldCk7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsVG9wOiB0YXJnZXQub2Zmc2V0KCkudG9wXG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcnN2cFN1Ym1pdCgpO1xuICAgICAgICAgICAgZGF0YUxvYWQoKTsgXG4gICAgICAgICAgICBoYW5kbGVSYXRpb0NoZWNrKCk7XG4gICAgICAgICAgICBsaXN0ZW5Gb3JWaWRlb1Jlc2l6ZSgpO1xuICAgICAgICAgICAgY2VudGVyUnN2cElucHV0KCk7XG4gICAgICAgICAgICBuYXZTY3JvbGwoKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW5pdDogaW5pdFxuICAgICAgICB9O1xuICAgIH0pKCk7XG5cbiAgICBhcHAuaW5pdCgpO1xufSk7XG4iXX0=

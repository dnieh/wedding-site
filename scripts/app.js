'use strict';

$(function() {
    let app = (function() {
        let $videoContainer = $('[data-video-container]');
        let $video = $('[data-video]');
        const ratioWidth = 16;
        const ratioHeight = 9;

        let rsvpSubmit = function() {
            let $rsvpForm = $('[data-form=rsvp]');

            $rsvpForm.on('submit', (e) => {
                let $welcomeText = $('[data-welcome]');
                let $downArrow = $('[data-arrow-down]');

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

        let dataLoad = function() {
            $(document).on('data.loaded', function() {
                let $navbar = $('[data-nav=navbar]');
                let $proposalTitle = $('[data-section-title=proposal]');

                $navbar.removeClass('invisible').hide().fadeIn();
            });
        };

        let handleRatioCheck = function() {
            let ratio = $(window).height() / $(window).width();

            if (ratio > 0.562) {
                handleHeightCentricDisplay();
            } else if (ratio < 0.562) {
                handleWidthCentricDisplay();
            }
        };

        let handleHeightCentricDisplay = function() {
            let windowHeight = $(window).height();
            let newVideoWidth = ratioWidth * windowHeight / ratioHeight;

            $video.css({
                height: windowHeight,
                width: newVideoWidth,
                left: (newVideoWidth - $(window).width()) / 2 * -1
            });

            $videoContainer.css({
                height: windowHeight,
            });
        };

        let handleWidthCentricDisplay = function() {
            let windowWidth = $(window).width();
            let windowHeight = $(window).height();
            let newVideoHeight = ratioHeight * windowWidth / ratioWidth;
 
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

        let listenForVideoResize = function() {
            $(window).on('resize', function() {
                handleRatioCheck();
            });
        };


        let centerRsvpInput = function() {
            let $rsvpInput = $('[data-input=rsvp]');
            let heightFromTop = ($(window).height() / 2 - 14);

            $rsvpInput.css('top', heightFromTop + 'px');
            // window.setTimeout(function() {
                $rsvpInput.removeClass('hidden-xs-up');
            // }, 5000);
        };

        let navScroll = function() {
            $('[data-nav-link]').on('click', function(e) {
                let target = $(this).attr('href');
                
                target = $(target);
                e.preventDefault();
                $('html, body').animate({
                    scrollTop: target.offset().top
                }, 1000);
            });
        };

        let init = function() {
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
    })();

    app.init();
});

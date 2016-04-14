'use strict';

$(function() {
    let app = (function() {
        const ratioWidth = 16;
        const ratioHeight = 9;

        let $videoContainer = $('[data-video-container]');
        let $video = $('[data-video]');
        let loginAttempts = 0;
        let $rsvpCodeForm = $('[data-form=rsvp-code]');
        let $rsvpForm = $('[data-form=rsvp]');
        let $welcomeText = $('[data-welcome]');
        let guestName = '';
        let guestNames = [];
        let events = {};

        let baseRef = new Firebase('https://danielkatherine.firebaseio.com/');
        let guestRef;
        let eventRef;

        let loginWithRSVP = function(rsvp, callback) {
            baseRef.authWithPassword({
                email: rsvp + '@firebase.com',
                password: rsvp
            }, function(error, authData) {
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
                    guestRef.on('value', (snap) => {
                        guestNames = snap.val();
                        // smh
                        eventRef.on('value', (snap) => {
                            events = snap.val();
                            callback();
                        });
                    });
                }
            });
        };
        
        let rsvpCodeSubmit = function() {
            let $rsvpInput = $('input[name=rsvp]');

            $rsvpCodeForm.on('submit', (e) => {
                let $welcomeText = $('[data-welcome]');
                let rsvp = $rsvpInput.val().toLowerCase();

                e.preventDefault();
                $('.rsvp-error').addClass('hidden-xs-up');
                loginWithRSVP(rsvp, function() {
                    $(document).trigger('data.loaded');
                });
            });
        };

        let rsvpSubmit = function() {
            $rsvpForm.on('submit', function(e) {
                e.preventDefault();
                console.log($(this).serializeArray());
            });
        };

        let handleDynamicGuestInfo = function() {
            for (let i = 1; i < guestNames.length + 1; i++) {
                let $nameEl = $('[data-guest-name-' + i + ']');
                let $optionEl = $('[data-guest-option-' + i +']');
                let name = guestNames[i - 1].name !== 'unknown' ? guestNames[i - 1].name : '';

                $nameEl
                    .removeClass('hidden-xs-up')
                    .find('input[type=text]')
                    .val(name)
                    .attr('required', true);
                $optionEl
                    .removeClass('hidden-xs-up')
                    .find('select')
                    .attr('required', true);
            }
            console.log(guestNames);
            console.log(events);
        };

        let noGuestListener = function() {
            $('input[name=noguest]').on('change', function() {
                if (this.checked) {
                    for (let i = 2; i < 6; i++) {
                        let $nameEl = $('[data-guest-name-' + i + ']');
                        let $optionEl = $('[data-guest-option-' + i + ']');

                        $nameEl.find('input').attr('disabled', true);
                        $optionEl.find('select').attr('disabled', true);
                    }
                } else {
                    for (let i = 2; i < 6; i++) {
                        let $nameEl = $('[data-guest-name-' + i + ']');
                        let $optionEl = $('[data-guest-option-' + i + ']');

                        $nameEl.find('input').removeAttr('disabled');
                        $optionEl.find('select').removeAttr('disabled');
                    }

                }
            });
        };

        let notComingListener = function() {
            $('input[name=notcoming]').on('change', function() {
                if (this.checked) {
                    $('input[name=noguest]').attr('disabled', true);
                    for (let i = 1; i < 6; i++) {
                        let $nameEl = $('[data-guest-name-' + i + ']');
                        let $optionEl = $('[data-guest-option-' + i + ']');

                        $nameEl.find('input').attr('disabled', true);
                        $optionEl.find('select').attr('disabled', true);
                    }
                } else {
                    $('input[name=noguest]').removeAttr('disabled');
                    for (let i = 1; i < 6; i++) {
                        let $nameEl = $('[data-guest-name-' + i + ']');
                        let $optionEl = $('[data-guest-option-' + i + ']');

                        $nameEl.find('input').removeAttr('disabled');
                        $optionEl.find('select').removeAttr('disabled');
                    }

                }

            });
        };

        let dataLoad = function() {
            $(document).on('data.loaded', function() {
                let $navbar = $('[data-nav=navbar]');
                let $proposalTitle = $('[data-section-title=proposal]');
                let textTop;
                let textLeft;

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
    })();

    app.init();
});

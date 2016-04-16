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
        let rsvpCode;
        let $welcomeText = $('[data-welcome]');
        let guestName = '';
        let guestNames = [];
        let events = {};

        let baseRef = new Firebase('https://danielkatherine.firebaseio.com/');
        let guestRef;
        let eventRef;
        let rsvpResponsesRefUrl = 'https://danielkatherine.firebaseio.com/rsvpResponses/';
        let rsvpResponsesRef;
        let rsvpResponsesRefValue;
        let rsvpInfo;
        let alreadyRsvpd = false;

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
                    rsvpResponsesRef = new Firebase(rsvpResponsesRefUrl);
                    rsvpResponsesRefValue = new Firebase(rsvpResponsesRefUrl + rsvp);
                    guestRef.on('value', (snap) => {
                        guestNames = snap.val();
                        // smh
                        eventRef.on('value', (snap) => {
                            events = snap.val();
                            rsvpResponsesRefValue.once('value', (snap) => {
                                rsvpInfo = snap.val();
                                alreadyRsvpd = rsvpInfo !== null;
                                callback();
                            });
                        });
                    });
                }
            });
        };
        
        let rsvpCodeSubmit = function() {
            let $rsvpInput = $('input[name=rsvp]');

            $rsvpCodeForm.on('submit', (e) => {
                let $welcomeText = $('[data-welcome]');
                rsvpCode = $rsvpInput.val().toLowerCase();

                e.preventDefault();
                $('.rsvp-error').addClass('hidden-xs-up');
                loginWithRSVP(rsvpCode, function() {
                    $(document).trigger('data.loaded');
                });
            });
        };

        let rsvpSubmit = function() {
            $rsvpForm.on('submit', function(e) {
                let formValues = $(this).serializeArray();
                let responseContainer = {};

                
                $('[rsvp-submit-button]').empty().append('<i class="fa fa-spin fa-spinner"></i>');

                e.preventDefault();

                console.log(formValues);

                if (formValues[0].name === 'notcoming' && formValues[0].value === 'on') {
                    responseContainer[rsvpCode] = false;
                    
                } else {
                    let userResponseData = {};
                    for (let i = 0; i < formValues.length; i++) {
                        if (formValues[i].name === 'noguest' || formValues[i].value === '') {
                            continue;
                        }
                        userResponseData[formValues[i].name] = formValues[i].value;
                    }
                    console.log(userResponseData);
                    responseContainer[rsvpCode] = userResponseData;
                }

                console.log(responseContainer);
                rsvpResponsesRef.update(responseContainer, function(error) {
                    let alertText = '<div class="alert alert-danger" role="alert">' +
                        '<strong>Oh snap!</strong> Something went wrong. Please contact Daniel (danielnieh@gmail.com).' +
                        '</div>';
                    let successText = '<div class="alert alert-success" role="alert">' +
                        '<strong>Thank You!</strong> Please check back soon for updates. If you have any questions, feel free to contact daniel (danielnieh@gmail.com)' +
                        '</div>';
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

        let handleEvents = function() {
            Object.keys(events).map((key) => {
                if (!events[key]) {
                    $('[data-event=' + key + ']').closest('.col-md-6').remove();
                }
            });
        };

        let showRsvpInfo = function() {
            let $rsvpInfo = $('[data-already-submitted]');

            $('[data-original-rsvp-message]').addClass('hidden-xs-up');
            $('[data-already-rsvpd]').removeClass('hidden-xs-up');
            
            let keys = Object.keys(rsvpInfo);
            let markup = '';

            if (rsvpInfo === false) {
                markup = 'Not attending.';
            } else {
                for (let i = 0; i < keys.length / 2; i++) {
                    markup += '<ul class="m-b-2">';
                    let curIndex = keys[i][keys[i].length - 1];
                    markup += '<li>Name: ' + rsvpInfo['guest-name-' + curIndex] + '</li>';
                    markup += '<li>Meal: ' + rsvpInfo['guest-option-' + curIndex] + '</li>';
                    markup += '</ul>';
                }
            }

            $rsvpInfo.removeClass('hidden-xs-up').append(markup);

        };

        let handleDynamicGuestInfo = function() {
            $('[data-rsvp-only]').removeClass('hidden-xs-up');
            for (let i = 1; i < guestNames.length + 1; i++) {
                let $nameEl = $('[data-guest-name-' + i + ']');
                let $optionEl = $('[data-guest-option-' + i +']');
                let $noguestEl = $('[data-noguest=' + i + ']');
                let name = guestNames[i - 1].name !== 'unknown' ? guestNames[i - 1].name : '';

                $nameEl
                    .removeClass('hidden-xs-up')
                    .find('input[type=text]')
                    .val(name)
                    .removeAttr('disabled')
                    .attr('required', true);
                $optionEl
                    .removeClass('hidden-xs-up')
                    .find('select')
                    .removeAttr('disabled')
                    .attr('required', true);
                $noguestEl.removeClass('hidden-xs-up')
                    
               
            }
        };

        let noGuestListener = function() {
            $('[data-noguest]').on('change', function() {
                let num = $(this).data('noguest');
                let $nameEl = $('[data-guest-name-' + num + ']');
                let $optionEl = $('[data-guest-option-' + num + ']');

                if ($(this).find('input')[0].checked) {
                    $nameEl
                        .find('input')
                        .removeAttr('required')
                        .attr('disabled', true);
                    $optionEl
                        .find('select')
                        .removeAttr('required')
                        .attr('disabled', true);
                } else {
                    $nameEl
                        .find('input')
                        .attr('required', true)
                        .removeAttr('disabled', true);
                    $optionEl
                        .find('select')
                        .attr('required', true)
                        .removeAttr('disabled', true);
                }
            });
        };

        let notComingListener = function() {
            $('input[name=notcoming]').on('change', function() {
                if (this.checked) {
                    $('[data-noguest]').find('input').attr('disabled', true);
                    for (let i = 1; i < 6; i++) {
                        let $nameEl = $('[data-guest-name-' + i + ']');
                        let $optionEl = $('[data-guest-option-' + i + ']');

                        $nameEl.find('input').attr('disabled', true);
                        $optionEl.find('select').attr('disabled', true);
                    }
                } else {
                    $('[data-noguest]').find('input').removeAttr('disabled');
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

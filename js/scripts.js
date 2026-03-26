( function($) {
  'use strict';


	$(window).on('load', function(){



		/*-------------------------------------------------------------------------------
		  Wow.js
		-------------------------------------------------------------------------------*/



		$('.loader').fadeOut(1000);
		var wow = new WOW({
		    offset: 150,          
		    mobile: false
		  }
		);
		
		wow.init();
	});



	/*-------------------------------------------------------------------------------
	   Animsition Loader
	-------------------------------------------------------------------------------*/



	$(".animsition").animsition({
	   inClass: 'fade-in',
       outClass: 'fade-out',
	   inDuration: 1000,
	   outDuration: 700,
	   linkElement: 'a.project-box',
	   // e.g. linkElement: 'a:not([target="_blank"]):not([href^="#"])'
	   loading:true,
	   loadingParentElement: 'body', //animsition wrapper element
	   loadingClass: 'spinner',
	   loadingInner: '<div class="double-bounce1"></div><div class="double-bounce2"></div>', // e.g '<img src="loading.svg" />'
	   timeout: false,
	   timeoutCountdown:5000,
	   onLoadEvent: true,
	   browser: [ 'animation-duration', '-webkit-animation-duration'],
	   // "browser" option allows you to disable the "animsition" in case the css property in the array is not supported by your browser.
	   // The default setting is to disable the "animsition" in a browser that does not support "animation-duration".
	   overlay : false,
	   overlayClass : 'animsition-overlay-slide',
	   overlayParentElement : 'body',
	   transition: function(url){ window.location.href = url; }
	});



	$('.popup-youtube').magnificPopup({
		disableOn: 700,
		type: 'iframe',
		mainClass: 'mfp-with-zoom',
		removalDelay: 160,
		preloader: false,

		fixedContentPos: false
	});

	$(document).on('click', '.popup-video', function(e) {
		e.preventDefault();
		$('#video-popup, #video-popup-overlay').addClass('show');
		var video = $('#main-video')[0];
		if (video) {
			video.play();
		}
	});

	$(document).on('click', '.video-popup-close, #video-popup-overlay', function() {
		$('#video-popup, #video-popup-overlay').removeClass('show');
		var video = $('#main-video')[0];
		if (video) {
			video.pause();
		}
	});


	/*-------------------------------------------------------------------------------
	  Menu
	-------------------------------------------------------------------------------*/



	$('.navbar-toggle').on('click',function(){
		$('body').removeClass('menu-is-closed').addClass('menu-is-opened');
	});

	$('.close-menu, .click-capture, .menu-list li a').on('click', function(){
		$('body').removeClass('menu-is-opened').addClass('menu-is-closed');
		$('.menu-list ul').slideUp(300);
	});

	$('.menu-list li a').on('click', function(){
		$('.menu-list li').removeClass('active');
		$(this).closest('li').addClass('active');

	});


	$('.col-resume').on('mouseover',function(){
		$('.section-bg.mask').addClass('hide');
	});

	$('.col-resume').on('mouseleave', function () {
	  $('.section-bg.mask').removeClass('hide');
	});


	/*-------------------------------------------------------------------------------
	  Owl Carousel
	-------------------------------------------------------------------------------*/


	if ($('.owl-carousel').length > 0){

	   $(".review-carousel").owlCarousel({
			responsive:{
		       0:{
		            items:1
		        },
		        720:{
		            items:1,
		            
		        },
		        1280:{
		            items:1
		        }
		    },
		    responsiveRefreshRate:0,
			nav:false,
			navText:[],

		 	dots:true
		});

	}




	/*-------------------------------------------------------------------------------
	  Full screen sections 
	-------------------------------------------------------------------------------*/


	function navbarFullpage(){
	 if ( $('.pp-section.active').scrollTop() > 0 ){
    	$('.navbar-fullpage').addClass('navbar-fixed');
      }
      else{
    	$('.navbar-fullpage').removeClass('navbar-fixed');
     }
    }

    navbarFullpage();

    function navbar(){
    $(window).scroll(function(){
    	if ( $(window).scrollTop() > 0 ){
	    	$('.navbar').addClass('navbar-fixed');
	      }
	      else{
	    	$('.navbar').removeClass('navbar-fixed');
	     }
    });
	 
    }

    navbar();

    if ($('.pagepiling').length > 0){
      $('.pagepiling').pagepiling({
    		scrollingSpeed: 280,
		    sectionSelector: '.section',
		    loopBottom: false,
		    loopTop: false,
		    anchors: ['home', 'estrategia', 'timeline', 'presenca', 'metodologia', 'advisor', 'solucoes', 'informacoes'],
		    afterLoad: function(anchorLink, index){
	           navbarFullpage();
	            
  			}
		});

     }

     $('.pp-scrollable').on('scroll', function () {
    	var scrollTop =$(this).scrollTop();
		if (scrollTop > 0 ) {
			$('.navbar-fullpage').addClass('navbar-fixed');
		}
		else{
			$('.navbar-fullpage').removeClass('navbar-fixed');
		}
	});



	/*------------------------------------------------------------------------------
	   Scroller navigation
	/-------------------------------------------------------------------------------*/



		$('#pp-nav').remove().appendTo('.animsition').addClass('white right-boxed hidden-xs');

		$('.pp-nav-up').on('click', function(){
			$.fn.pagepiling.moveSectionUp();
		});

		$('.pp-nav-down').on('click', function(){
			$.fn.pagepiling.moveSectionDown();
		});
 



    /*-------------------------------------------------------------------------------
	  Change bacgkround on project section
	-------------------------------------------------------------------------------*/



    $('.project-row a').on('mouseover',function(){
    	var index = $('.project-row a').index(this)
    	$('.project-row a').removeClass('active');
    	$(this).addClass('active');
    	$('.bg-changer .section-bg').removeClass('active').eq(index).addClass('active');
    });




	/*-------------------------------------------------------------------------------
	  Ajax Forms
	-------------------------------------------------------------------------------*/



	if ($('.js-form').length) {
		$('.js-form').each(function(){
			$(this).validate({
				errorClass: 'error',
			    submitHandler: function(form){
                    const formData = $(form).serialize();
                    const url = $(form).attr('action') || 'mail.php';

                    if (!navigator.onLine) {
                        DB.queueForm(formData, url);
                        $('.form-group-message').show();
                        $('#error').hide();
                        $('#success').html('<strong> Offline! </strong> Sua mensagem foi salva e será enviada quando você reconectar.').show();
                        return;
                    }

		        	$.ajax({
			            type: "POST",
			            url: url,
			            data: formData,
			            success: function() {
			            	$('.form-group-message').show();
			            	$('#error').hide();
		                	$('#success').show();
		                },

		                error: function(){
		                	$('.form-group-message').show();
		                	$('#success').hide();
			                $('#error').show();
			            }
			        });
			    }
			});
		});
	}

	
	


})(jQuery);

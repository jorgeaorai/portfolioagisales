(function($) {
	$(document).ready(function(){
			//Exibe box de parceiros correspondetes em cada estado quando houver click.
	    $('#map .state').click(function(){
			var estado = $(this).attr('data-state');
		    var box_estado = '#box_'+estado;

		    console.log('.state_'+estado+' .shape');

		    // Reseta o estado e seu label para a cor padrão
		    $('.state .label_icon_state').css({'fill': '#666'});
		    $('.state .shape').css({'fill': '#ddd'});

		    // Colore o estado selecionado
		    $('#state_'+estado+' .label_icon_state').css({'fill': '#FFF'});
		    $('#state_'+estado+' .shape').css({'fill': '#fd7132'});


		    //Verifica se o cadastro de contato do estado existe
		    if($('#box_'+estado).length == 0){
		    	console.log('Não existe');
		    }else{
		    	$('.parca .estado').addClass('some');
			    $('.parca .estado').css({'opacity': 0 , 'visibitity':'hidden'});

			    $(box_estado).removeClass('some');
			    $(box_estado).css({'opacity': 1 , 'visibitity':'visible'});
		    }
	    });

	    $('#map .state').click(function(e){
	    	e.preventDefault();
	    });

	    //Change select responsive
		$('#seletory').change(function () {
			$('.parca .estado').css({'opacity': 0 , 'visibitity':'hidden'});
			$('#box_'+$(this).val()).css({'opacity': 1 , 'visibitity':'visible'});
		});
	});
})(jQuery);
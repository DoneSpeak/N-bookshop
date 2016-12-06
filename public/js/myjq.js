$(function(){
	$('.verifyimg').on('click',function(){
		$.ajax({
            url: '/getverifycode',
            type: 'get',
            dataType: 'json'
        })
        .success(function(res) {
            $(this).attr('src', res.img);
        })
        .fail(function(res) {
            console.log('getverifycode failed');
        });
	});
});
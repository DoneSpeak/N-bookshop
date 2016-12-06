$(function(){
	$('.close').click(function(){
		$('.alert-div').css('display','none');
	});
});

$(function(){
	$('.verifyimg').on('click',function(){
		var url = '/login/verifycode?' + Date.now();
		$(this).attr('src', url);
	});
});

$(function(){
	$('.add2cart').on('click',function(){
		var bookId = $(this).parent().children('.isbn');
		bookId = bookId.text();

		var url = '/bookindex/add2cart';
		$.ajax({
			type:"POST",
			url:url,
			data:{
				isbn:bookId
			},
			success:function(result){
				//对返回数据进行处理
				if(result.err === 'NOTLOGIN'){
					return window.location.href="/login";
				}
				$(".booknumInCart").text(result.bookNum);
			},
			error:function(){
				//错误提示
				alert('服务器错误，请稍后再试！');
			}
		});
	});
});

function changeOneBookNum(bookTdTag,bookNumTag,isbn,num,tag_price){
	var url = '/cart/' + isbn + '/change';
	$.ajax({
		type:"POST",
		url:url,
		data:{
			isbn:isbn,
			bookNum:num
		},
		success:function(result){
			//对返回数据进行处理
			if(result.err === 'NOTLOGIN' || result.err === "NOAUTH"){
				return window.location.href="/login";
			}
			if(num > 0 && result.bookNum < num){
				bookNumTag.val(result.bookNum);
			}
		},
		error:function(){
			//错误提示
			alert('服务器错误，请稍后再试！');
		}
	});
}

$(function(){
	$('.book-sub').on('click',function(){
		// 减少 1
		var tag_book = $(this).parent().parent();
		var isbn = tag_book.parent().children('td').children('.checkbox-isbn').val();
		var bookNumTag = $(this).parent().children(".book-nums");
		var num = bookNumTag.val();
		var tag_price = tag_book.parent().children('.price');
		// var tag_coast_amount = $('.amount-cost');
		var tag_book_amount_cost = tag_book.parent().children('.book-amountcost');

		// var coast_amount = tag_coast_amount.text();
		var price = tag_price.text();

		if(num < 2 ){
			tag_book.parent().remove();
			// tag_coast_amount.text((coast_amount-price).toFixed(2));
			num = 0;
		}else{
			num --;
			bookNumTag.val(num);
			// 金额更改
			tag_book_amount_cost.text((tag_book_amount_cost.text() - price).toFixed(2));
// [TODO]
			// tag_coast_amount.text((coast_amount-price).toFixed(2));
		}
		// 购物车书籍总数减 1
		$('.booknumInCart').text($('.booknumInCart').text()-1);
		changeOneBookNum(tag_book,bookNumTag,isbn,num,tag_price);
	});
});


$(function(){
	$('.book-add').on('click',function(){
		// 增加 1
		var tag_book = $(this).parent().parent();
		var isbn = tag_book.parent().children('td').children('.checkbox-isbn').val();
		var bookNumTag = $(this).parent().children(".book-nums");
		var num = bookNumTag.val();
		var tag_price = tag_book.parent().children('.price');
		// var tag_coast_amount = $('.amount-cost');
		var tag_book_amount_cost = tag_book.parent().children('.book-amountcost');

		// var coast_amount = tag_coast_amount.text();
		var price = tag_price.text();

		num ++;
		bookNumTag.val(num);
		// 金额更改
		tag_book_amount_cost.text((tag_book_amount_cost.text()*1.0 + price*1.0).toFixed(2));
		// tag_coast_amount.text((coast_amount*1.0+price*1.0).toFixed(2));

		// 购物车书籍总数加 1
		$('.booknumInCart').text($('.booknumInCart').text()*1.0+1);
		changeOneBookNum(tag_book,bookNumTag,isbn,num,tag_price);
	});
});


$(function(){
	$('.delete-cart-item').on('click',function(){
		var tag_book_tr = $(this).parent().parent();
		tag_book_tr.remove();
		var isbn = tag_book_tr.children('td').children('.checkbox-isbn').val();
		// 花费计算
		// var tag_coast_amount = $('.amount-cost');
		// var coast_amount = tag_coast_amount.text();
		var price = tag_book_tr.children('.price').text();
		var bookNum = tag_book_tr.children('td').children('.book-amount').children(".book-nums").val();

		// tag_coast_amount.text((coast_amount-price*bookNum).toFixed(2));

		// 更新购物车书本数
		$('.booknumInCart').text($('.booknumInCart').text()-bookNum);

		var url = '/cart/' + isbn + '/del';
		$.ajax({
			type:"POST",
			url:url,
			data:{
				isbn:isbn
			},
			success:function(result){
				//对返回数据进行处理
				if(result.err === 'NOTLOGIN' || result.err === "NOAUTH"){
					return window.location.href="/login";
				}
			},
			error:function(){
				//错误提示
				alert('服务器错误，请稍后再试！');
			}
		});
	});
});

$(function(){
  $('.book-nums').bind('keypress',function(event){
		if(event.keyCode == "13"){
			// 保留按enter更改数量
		}
  });
});

// 选中书本
$(function(){
	$('.checkbox-isbn').on('click',function(){
		var checkbox = $(this);

		var bookcoast = $(this).parent().parent().children('.book-amountcost').text();
		var amountcost = $('.amount-cost').text().substring(1);

		if(checkbox.prop("checked") === true){
			amountcost = amountcost * 1.0 + bookcoast * 1.0;
		}else{
			amountcost = amountcost * 1.0 - bookcoast * 1.0;
		}
		$('.amount-cost').text("￥" + amountcost.toFixed(2));
	});
});

$(function(){
	$('.allchose').on('click',function(){
		var checkbox = $(this);
		if(checkbox.prop("checked") === true){
			$('.checkbox-isbn').prop('checked',true);
			var oneAmounts = $(".book-amountcost");
			var amounts = 0;
			for(var i=0; i<oneAmounts.length; i++){
				amounts += oneAmounts.eq(i).text()*1.0;
			}
			$('.amount-cost').text("￥" + amounts.toFixed(2));

		}else{
			$('.checkbox-isbn').prop('checked',false);
			$('.amount-cost').text("￥0.00");
		}
	});
});

// 提交订单
$(function(){
	$('.submit-order').on('click',function(){
		
		var bookcheckArr = $('.checkbox-isbn');
		var priceArr = $('.price');
		var book_numsArr = $('book-nums');
		var books = new Array();
		var book = {
			isbn:"",
			num:""
		};
		for(var i = 0; i < bookcheckArr.length; i ++){
			if(bookcheckArr.eq(i).prop('checked')){
				book.isbn = bookcheckArr.eq(i).val();
				book.num = book_numsArr.eq(i).val();

				books.push(book);
			}
		}
		if(books.length < 1){
			alert('未选中商品');
			return;
		}
		books = '[' + books + ']';
		console.log(books);

		var url = "/cart/order";

		$.ajax({
			url:url,
			data:{
				books:books
			},
			success:function(result){

			},
			error:function(result){
				alert('服务器错误，请稍后再试！');
			}
		});
	});
});
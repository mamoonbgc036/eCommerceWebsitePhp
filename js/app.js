
		let total = 0;
		//catch client clicked product details from html
		function cartDetails($btn){
			//generating product id
			let arry = $btn.parents('a').attr('href');
			let newArry = arry.split('=');
			let prodId = newArry[1];
			//generating imageName
			let imgArry = $btn.closest('#items').find('img').attr('src');
			let newImg = imgArry.split('/');
			let imgName = newImg[1];
			//generating model
			let model = $btn.parent().find('p').text();
			//generating price
			let prePrice = $btn.parent().find('span').text();
			let price = parseInt(prePrice);
			return [prodId,imgName,model,price];
		}
		//add cart button click event
		$('.btn-success').click(function(e){	
				e.preventDefault();
				let items = cartDetails($(this));
				Storage.storeCartitem(items);						
		})
		//cart icon click event
		$('.fa-cart-arrow-down').on('click',()=>{
			$('.apnd').append(UI.updateCart());
			$('.cartDiv').css('transform','translateX(0)');	
		})
		//cart close icon click event	
		$('.fa-window-close').click(()=>{
			$('.cartDiv').css('transform','translateX(100%)');	
		})

		//for add event handler to dynamic content
		let content = $(document.body);

		//fa-chevron-up icon click event
		content.on('click','.fa-chevron-up',function(){
			let id = $(this).parents('.updown').attr('id');
			let idPrice = id.split(',');
			//increase qty in localstorage
			Storage.storeCartitem(idPrice[0]);
			//update tag qty
			let qty = $(this).siblings('p').text();
			qty++;
			$(this).siblings('p').html(qty);
			//update tag total
			let total = $(this).parents().find('.amount').text();
			let intConvertedtotal = parseInt(total);
			let intConvertedprice = parseInt(idPrice[1]);
			let amount = intConvertedtotal+intConvertedprice;
			$(this).parents().find('.amount').html(amount);
		})
		//fa-chevron-down icon click event
		content.on('click','.fa-chevron-down',function(){
			let id = $(this).parents('.updown').attr('id');
			let idPrice = id.split(',');
			//increase qty in localstorage
			Storage.deletItems('reduce',idPrice[0]);
			//update tag qty
			let qty = $(this).siblings('p').text();
			qty--;
			$(this).siblings('p').html(qty);
			//update tag total
			let total = $(this).parents().find('.amount').text();
			let intConvertedtotal = parseInt(total);
			let intConvertedprice = parseInt(idPrice[1]);
			let amount = intConvertedtotal-intConvertedprice;
			$(this).parents().find('.amount').html(amount);
		})
		content.on('click','#remove',function(){
			let id = $(this).parents('.cartDivitem').attr('id');
			Storage.deletItems('deletItem',id);
		})

		content.on('click','#clear',function(){
			Storage.deletItems('delet','');
		})
		$('#order').click(function(e){
			e.preventDefault();
			let name = $('#name').val();
			let address = $('#address').val();
			let phone = $('#phone').val();
			let y = [];
			let data = Storage.storeTotal();
			$.each(data[1],function(key, value){
				let x = {};
				x.product_id = value[1];
				x.quantity = value[2];
				x.customerName = name;
				x.address = address;
				x.phone = phone;
				y.push(x);
//console.log(value[1]);
			})
			$.ajax({
				url:"test.php",
				method:"post",
				data:{result: y},
				dataType: 'text',
				success:function(res){
					localStorage.clear();
					alert('congratulation, Your order is placed. we contact with you soon')
				}
			})
		})

		class UI{
			static updateCart(){
				$('#rdiv').remove();
				let html = '';
				let data = Storage.storeTotal();
				let items = data[1];
				let total = 0;
				html += `<div id="rdiv">`;
				items.forEach(function(item){
				html +=	`<div id="${item[4]}" class="cartDivitem">
							<div class="imagePrice">
								<img src="productImages/${item[0]}" alt="">
								<div class="namePrice">
									<h5>${item[1]}</h5>
									<h6>$${item[3]}</h6>
									<button id="remove">Remove</button>
								</div>
							</div>
							<div id="${[item[4],item[3]]}" class="updown">
								<i class="fas fa-chevron-up"></i>
								<p>${item[2]}</p>
								<i class="fas fa-chevron-down"></i>
							</div>
						</div>`;
					total += item[3]*item[2];
				})
				html += `<h3 id="total">Your Total : $ <span class="amount">${total}</span></h3>
			 			<button id="clear">Clear Cart</button><a type="button" href="address.php" id="btnaddress" class="btn btn-info">Proceed Checkout</a></div>`;
				return html;
			}
		}
		
		class Storage{
			//save item to store when clicked
			static storeCartitem(items){
				let prodId = ($.isArray(items)) ? items[0] : items;
				if(localStorage.getItem(prodId)!=null){
						let test = JSON.parse(localStorage.getItem(prodId));
						let newQuantity = test[2];
						newQuantity++;
						let pus = JSON.stringify([test[0],test[1],newQuantity,test[3]]);
						localStorage.setItem(prodId,pus);
					} else {
						let quantity = 1;
						let item = JSON.stringify([items[1],items[2],quantity,items[3]]);
						localStorage.setItem(prodId,item);
					}
					total++
					$('#badge').html(total);
				}
				
		//return store total 
			static storeTotal() {
				let storeitemArray = [];
				let i = 0;
				if (Object.keys(localStorage).length){
					var x = Object.keys(localStorage);
					var total = 0;
					$.each(x,function(key,value){
						if($.isNumeric(value)){
							var test = JSON.parse(localStorage.getItem(value));
						total += test[2];
						storeitemArray[i] = [test[0],test[1],test[2],test[3],value];
							i++
						}
					})
				} else {
					var total = "";
				}
				return [total,storeitemArray];
			}
		   
			//reduc,remove item or clear cart entirly
			static deletItems(instruction,value){
				if(instruction=='delet'){
					$('#rdiv').remove();
					total = 0;
					localStorage.clear();
				} else if(instruction=='deletItem'){
					let test = JSON.parse(localStorage.getItem(value));
					total = total-test[2];
					$('#'+value).remove();
					localStorage.removeItem(value);
				} else if(instruction=='reduce'){
					let test = JSON.parse(localStorage.getItem(value));
					let newQuantity = test[2];
					if(newQuantity==1){
						$('#'+value).remove();
						localStorage.removeItem(value);
						total--;
					} else{
						newQuantity--;
						total--;
						let pus = JSON.stringify([test[0],test[1],newQuantity,test[3]]);
						localStorage.setItem(value,pus);
					}
				}
				$('#badge').html(total);
			}
		}


		//attached store total to the cart;
		let totals = Storage.storeTotal();
		total = totals[0];
		$('#badge').html(total);

		//search box
		$('#srcbox').keyup(function(){
			var txt = $(this).val();
			if(txt != ""){
				$.ajax({
					url:"search.php",
					method:"POST",
					data:{search:txt},
					dataType:"text",
					success:function(data){
						$('.result').fadeIn(1000);
						$('.result').html(data);
					}
				});
			} else{
				$('.result').fadeOut("slow");
			}
		});

		$('#smain').hover(function(){
			let x = $('#show').text();
			if(x==""){
				$.ajax({
					url:"search.php",
					method:"POST",
					data:{brandName:true},
					success:function(data){
						//console.log(data);
						 $('#show').append(data);
						 $('#show').fadeIn(1000);
						// $('.category').append(data);
					}
				});
			} else{
				$('#show').fadeOut(1000);
				$('#show').html("");
			}
			
		});

$('.fa-user').click(function(){
	let x = $('.fa-user ul li').css('visibility');
	if(x=='hidden'){
		$('.fa-user ul li').css('visibility','visible');
	}else{
		$('.fa-user ul li').css('visibility','hidden');
	}
})

		$('#cat').hover(function(){
			let x = $('#showcat').text();
			if(x == ""){
				$.ajax({
					url:"search.php",
					method:"POST",
					data:{category:true},
					success:function(data){
						$('#showcat').append(data);
						$('#showcat').fadeIn(1000);
					}
				});
			} else{
				$('#showcat').fadeOut(1000);
				$('#showcat').html("");
			}
		});








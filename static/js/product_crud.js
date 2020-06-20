$(function(){

	/////////////////////////////////////
	///////////// get cookie ////////////
	/////////////////////////////////////

	function getCookie(name) {
      var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
      return v ? v[2] : null;
    }
	var jwt_access_token = getCookie("jwt_access_token");



    /////////////////////////////////////
    ///////  custom  field view  ////////
    /////////////////////////////////////

    var customFields = [];

	$.ajax({
		url: "http://192.168.99.102:8001/accounts/api/custom_fields/",
        method: 'get',
        beforeSend:function(xhr){
          xhr.setRequestHeader("Authorization", 'Bearer '+ jwt_access_token);
        },
        success: function(res){
          var tableData = []
          $.each(res, function(index, item){
          	tableData.push(
          		"<tr>"
          			+"<td>"+ item['name'] +"</td>"
          			+"<td>"
          				+"<button  type='button' class='mr-2 btn btn-outline-primary btn-sm custom-field-edit-btn' data-toggle='modal' data-target='#UpdateCustomProductField' data-id='"+ item['id'] +"'>"+ 
          					"edit" 
          				+"</button>"
          				+"<button  type='button' class='mr-2 btn btn-outline-primary btn-sm custom-field-delete-btn' data-toggle='modal' data-target='#customProductFieldDeleteModal' data-id='"+ item['id'] +"'>"+ 
          					"delete" 
          				+"</button>"
          			+"</td>"
          		+"</tr>"
          	)
          });
          $(".custom-field-table .table tbody").html(tableData);

          customFields.push(res)
        }, 
        error: function(res){
          window.location.href = "/";
        }
	});



	/////////////////////////////////////
	//////////  product view  ///////////
	/////////////////////////////////////

	$.ajax({
		url: "http://192.168.99.102:8001/accounts/api/products/",
        method: 'get',
        beforeSend:function(xhr){
          xhr.setRequestHeader("Authorization", 'Bearer '+ jwt_access_token);
        },
        success: function(res){
          var tableData = []
          $.each(res, function(index, item){
          	tableData.push(
          		"<tr>"
          			+"<td>"+ item['title'] +"</td>"
          			+"<td>"+ item['price'] +"</td>"
          			+"<td>"+ item['description'] +"</td>"
          			+"<td>"
          				+"<button  type='button' class='mr-2 btn btn-outline-primary btn-sm product-edit-btn' data-toggle='modal' data-target='#productUpdateModal' data-product_id='"+ item['id'] +"'>"+ 
          					"edit" 
          				+"</button>"
          				+"<button  type='button' class='mr-2 btn btn-outline-primary btn-sm product-delete-btn' data-toggle='modal' data-target='#productDeleteModal' data-product_id='"+ item['id'] +"'>"+ 
          					"delete" 
          				+"</button>"
          			+"</td>"
          		+"</tr>"
          	)
          });
          $(".product-table .table tbody").html(tableData);
        }, 
        error: function(res){
          window.location.href = "/";
        }
	});

	

	/////////////////////////////////////
	//////////  product add  ////////////
	/////////////////////////////////////

	$(document).on('click', '.product-add-btn', function(event){
		event.preventDefault();

		var customField = []
        $.each(customFields[0], function(i, item){
          	customField.push(
          		"<label for='"+ item['name'] +"' class='col-form-label'>"+ item['name'] +"</label>"
            	+"<input type='number' name='"+ item['name'] +"' class='form-control' id='"+ item['name'] +"'>"
          	)
      	});
      	$("#staticBackdrop .custom-fields").html(customField)

	});


	$(document).on('submit', '.product-add-form', function(event){
		event.preventDefault();
		var form = $(this);
		var formData = form.serialize();

		$.ajax({
			url: "http://192.168.99.102:8001/accounts/api/products/",
			data: formData,
	        method: 'post',
	        beforeSend:function(xhr){
	          xhr.setRequestHeader("Authorization", 'Bearer '+ jwt_access_token);
	        },
	        success: function(res){
	          // create custom product fields 
	          if (customFields){
	          	$.each(customFields[0], function(i, item){
	          		var value = $("#staticBackdrop .custom-fields").find("#"+item['name']).val();
	          		$.ajax({
	          			url: "http://192.168.99.102:8001/accounts/api/custom_product_fields/",
	          			method: 'post',
	          			data: {'product': res['id'], 'custom_field': item['id'], 'value': value},
	          			beforeSend:function(xhr){
				          xhr.setRequestHeader("Authorization", 'Bearer '+ jwt_access_token);
				        },
				        success: function(res){
				        	window.location.href = "/products"
				        },
				        error: function(res){
				        	console.log(res)
				        }
	          		});
	          	});

	          }
	          
	        }, 
	        error: function(res){
	          window.location.href = "/"
	        }
		});

	});



	/////////////////////////////////////
	/////// load product edit data ///////
	/////////////////////////////////////

	$(document).on('click', '.product-edit-btn', function(event){
		event.preventDefault();
		var productId = $(this).data('product_id');
		var productForm = $("#productUpdateModal").find(".product-update-form");
		
		$.ajax({
			url: "http://192.168.99.102:8001/accounts/api/products/"+ productId +"/",
	        method: 'get',
	        beforeSend:function(xhr){
	          xhr.setRequestHeader("Authorization", 'Bearer '+ jwt_access_token);
	        },
	        success: function(res){
	          productForm.find("#title").val(res['title']);
	          productForm.find("#price").val(res['price']);
	          productForm.find("#description").val(res['description']);
	          productForm.find("#product_id").val(res['id']);

	          // add custom field to update modal
		        var customField = [];
		        $.each(customFields[0], function(i, item){
		          	customField.push(
		          		"<label for='"+ item['name'] +"' class='col-form-label'>"+ item['name'] +"</label>"
		            	+"<input type='number' name='"+ item['name'] +"' class='form-control' id='"+ item['name'] +"'>"
		          	)
	          	});
	          	$("#productUpdateModal .custom-fields").html(customField);

	        	$.each(res['custom_product_fields'], function(i, item){
                	productForm.find("#"+item['custom_field_name']).val(item['value']);
	        	});
	          
	        }, 
	        error: function(res){
	          window.location.href = "/"
	        }
		});

	});



	/////////////////////////////////////
	/////// save product edit data ///////
	/////////////////////////////////////

	$(document).on('submit', '.product-update-form', function(event){
		event.preventDefault();
		var productForm = $(this);
		var productId = productForm.find("#product_id").val();
		
		$.ajax({
			url: "http://192.168.99.102:8001/accounts/api/products/"+ productId +"/",
	        method: 'put',
	        data: productForm.serialize(),
	        beforeSend:function(xhr){
	          xhr.setRequestHeader("Authorization", 'Bearer '+ jwt_access_token);
	        },
	        success: function(res){

	        	$.each(customFields[0], function(i, item){
	        		var value = productForm.find("#"+item['name']).val();
	        		console.log(value)
	        		$.ajax({
	        			url: "http://192.168.99.102:8001/accounts/api/custom_product_fields/",
	        			method: 'post',
	        			data: {'product': res['id'], 'custom_field': item['id'], 'value': value},
	        			 beforeSend:function(xhr){
				          xhr.setRequestHeader("Authorization", 'Bearer '+ jwt_access_token);
				        },
	        			success: function(res){
	        				window.location.href = "/products"
	        			},
	        			error: function(res){
	        				console.log(res)
	        			}
	        		});
	        	});

	        }, 
	        error: function(res){
	          window.location.href = "/"
	        }
		});

	});



	/////////////////////////////////////
	//////  load delete product id //////
	/////////////////////////////////////

	$(document).on('click', '.product-delete-btn', function(event){
		event.preventDefault();
		var productId = $(this).data("product_id");
		$(".product-delete-form").find("#product_id").val(productId)
	});



	/////////////////////////////////////
	/////// delete product data /////////
	/////////////////////////////////////

	$(document).on('submit', '.product-delete-form', function(event){
		event.preventDefault();
		var form = $(this);
		var productId = form.find("#product_id").val();
		
		$.ajax({
			url: "http://192.168.99.102:8001/accounts/api/products/"+ productId +"/",
	        method: 'DELETE',
	        beforeSend:function(xhr){
	          xhr.setRequestHeader("Authorization", 'Bearer '+ jwt_access_token);
	        },
	        success: function(res){
	          $('.product-delete-btn[data-product_id="'+productId+'"]').parent().parent().hide();
	          $("#productDeleteModal").modal('hide')
	        }, 
	        error: function(res){
	          window.location.href = "/"
	        }
		});

	});



//////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////



	/////////////////////////////////////
	//////////  custom field add  ///////
	/////////////////////////////////////

	$(document).on('submit', '.custom-field-add-form', function(event){
		event.preventDefault();
		var form = $(this);
		var formData = form.serialize();

		$.ajax({
			url: "http://192.168.99.102:8001/accounts/api/custom_fields/",
			data: formData,
	        method: 'post',
	        beforeSend:function(xhr){
	          xhr.setRequestHeader("Authorization", 'Bearer '+ jwt_access_token);
	        },
	        success: function(res){
	          window.location.href = "/products"
	        }, 
	        error: function(res){
	          window.location.href = "/"
	        }
		});

	});




	/////////////////////////////////////
	/////// load product edit data //////
	/////////////////////////////////////

	$(document).on('click', '.custom-field-edit-btn', function(event){
		event.preventDefault();
		var objectId = $(this).data('id');
		var form = $("#UpdateCustomProductField").find(".custom-field-update-form");
		
		$.ajax({
			url: "http://192.168.99.102:8001/accounts/api/custom_fields/"+ objectId +"/",
	        method: 'get',
	        beforeSend:function(xhr){
	          xhr.setRequestHeader("Authorization", 'Bearer '+ jwt_access_token);
	        },
	        success: function(res){
	          form.find("#name").val(res['name']);
	          form.find("#_id").val(res['id']);
	        }, 
	        error: function(res){
	          window.location.href = "/"
	        }
		});

	});


	/////////////////////////////////////
	/////// save product edit data ///////
	/////////////////////////////////////

	$(document).on('submit', '.custom-field-update-form', function(event){
		event.preventDefault();
		var form = $(this);
		var objectId = form.find("#_id").val();
		
		$.ajax({
			url: "http://192.168.99.102:8001/accounts/api/custom_fields/"+ objectId +"/",
	        method: 'put',
	        data: form.serialize(),
	        beforeSend:function(xhr){
	          xhr.setRequestHeader("Authorization", 'Bearer '+ jwt_access_token);
	        },
	        success: function(res){
	          window.location.href = "/products"
	        }, 
	        error: function(res){
	          window.location.href = "/"
	        }
		});

	});



	//////////////////////////////////////////////////
	//////// load delete custom product field id //////
	///////////////////////////////////////////////////

	$(document).on('click', '.custom-field-delete-btn', function(event){
		event.preventDefault();
		var objectId = $(this).data("id");
		$(".custom-field-delete-form").find("#_id").val(objectId)
	});



	/////////////////////////////////////
	/////// delete product data /////////
	/////////////////////////////////////

	$(document).on('submit', '.custom-field-delete-form', function(event){
		event.preventDefault();
		var form = $(this);
		var objectId = form.find("#_id").val();
		
		$.ajax({
			url: "http://192.168.99.102:8001/accounts/api/custom_fields/"+ objectId +"/",
	        method: 'delete',
	        beforeSend:function(xhr){
	          xhr.setRequestHeader("Authorization", 'Bearer '+ jwt_access_token);
	        },
	        success: function(res){
	          $('.custom-field-delete-btn[data-id="'+objectId+'"]').parent().parent().hide();
	          $("#customProductFieldDeleteModal").modal("hide")
	        }, 
	        error: function(res){
	          window.location.href = "/"
	        }
		});

	});


});
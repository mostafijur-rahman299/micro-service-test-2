$(function(){

    /////////////////////////////////////
    /////  set and get cookie  /////////
    /////////////////////////////////////

    function setCookie(name, value, days) {
      var d = new Date;
      d.setTime(d.getTime() + 24*60*60*1000*days);
      document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
    }

    function getCookie(name) {
      var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
      return v ? v[2] : null;
    }

    var jwt_access_token = getCookie("jwt_access_token");



    /////////////////////////////////////
    ////////////////  login /////////////
    /////////////////////////////////////

    $(".login-form").submit(function(event){
      event.preventDefault();
      var form = $(this);
      var email = form.find("#email").val();
      var password = form.find("#password").val();
      
      $.ajax({
        url: "http://192.168.99.102:8001/accounts/api/token/",
        data:{'email': email, 'password': password},
        method: 'post',
        beforeSend:function(xhr){
          xhr.setRequestHeader("X-CSRFToken", '{{ csrf_token }}');
        },
        success: function(res){
          setCookie('jwt_access_token', res['access'], 1);

          $(".login-section").css('display', 'none')
          $(".profile-section").css('display', 'block')

          window.location.href = "/"
        }, 
        error: function(res){
          console.log(res)
        }
      });

    })

    

    /////////////////////////////////////
    ////////////  view profile //////////
    /////////////////////////////////////
    
    $.ajax({
      url: "http://192.168.99.102:8001/accounts/api/userprofile/",
      method: 'get',
      beforeSend:function(xhr){
        xhr.setRequestHeader("Authorization", 'Bearer '+ jwt_access_token);
      },
      success: function(res){
          $(".profile-info .profile-data").html(
            "<h5 class='text-muted text-center mb-3'>"+ "Profile Info" +"</h5>"
            +"<p> Email: "+ res[0]['email'] +"</p>"
            +"<p> First Name: "+ res[0]['first_name'] +"</p>"
            +"<p> Last Name: "+ res[0]['last_name'] +"</p>"
            +"<p> Phone: "+ res[0]['phone_number'] +"</p>"
            +"<button class='btn btn-outline-primary btn-sm edit-profile-btn' data-user_id='"+res[0]['id']+"'>"+ "Edit profile" +"</button>"
          )

          $(".login-section").css('display', 'none')
          $(".profile-section").css('display', 'block')
      }, 
      error: function(res){
        $(".login-section").css('display', 'block')
        $(".profile-section").css('display', 'none')
      }
    })


    /////////////////////////////////////
    ////// load edit profile data ///////
    /////////////////////////////////////

    $(document).on('click', '.edit-profile-btn', function(event){
      var userId = $(this).data('user_id');

      $.ajax({
        url: "http://192.168.99.102:8001/accounts/api/userprofile/"+ userId +"/",
        method: 'get',
        beforeSend:function(xhr){
          xhr.setRequestHeader("Authorization", 'Bearer '+ jwt_access_token);
        },
        success: function(res){
          $(".profile-info .profile-data").html("")

          $(".profile-edit-form").find("#email").val(res['email'])
          $(".profile-edit-form").find("#first_name").val(res['first_name'])
          $(".profile-edit-form").find("#last_name").val(res['last_name'])
          $(".profile-edit-form").find("#phone_number").val(res['phone_number'])
          $(".profile-edit-form").find("#object_id").val(res['id'])
          $(".profile-edit-form").css('display', 'block')
        },
        error: function(res){
          $(".login-section").css('display', 'block')
          $(".profile-section").css('display', 'none')
        }
      })

    });


    /////////////////////////////////////
    ////// save edit profile data ///////
    /////////////////////////////////////

    $(document).on('submit', '.profile-edit-form', function(event){
      event.preventDefault();
      var form = $(this);
      var formData = form.serialize();
      var userId = form.find("#object_id").val();

      $.ajax({
        url: "http://192.168.99.102:8001/accounts/api/userprofile/"+ userId +"/",
        method: 'put',
        data: formData,
        beforeSend:function(xhr){
          xhr.setRequestHeader("Authorization", 'Bearer '+ jwt_access_token);
        },
        success: function(res){
          $(".profile-edit-form").css('display', 'none')

          $(".profile-info .profile-data").html(
            "<h5 class='text-muted text-center mb-3'>"+ "Profile Info" +"</h5>"
            +"<p> Email: "+ res['email'] +"</p>"
            +"<p> First Name: "+ res['first_name'] +"</p>"
            +"<p> Last Name: "+ res['last_name'] +"</p>"
            +"<p> Phone: "+ res['phone_number'] +"</p>"
            +"<button class='btn btn-outline-primary btn-sm edit-profile-btn' data-user_id='"+res['id']+"'>"+ 
              "Edit profile" 
            +"</button>"
          )
        },
        error: function(res){
          $(".login-section").css('display', 'block')
          $(".profile-section").css('display', 'none')
        }
      });

    });



  })
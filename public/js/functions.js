(function () {
    'use strict'
      console.log("funcion cargada")
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }
  
          form.classList.add('was-validated')
        }, false)
      })
  })();

function progress(sta){
  if(sta == 0 || sta == 1){
    const progress = document.getElementById('progress');
    const progress_info = document.getElementById('progress-info');
    let percent = (Number(sta) + 1) * 33.33;
    progress.style = "width:" + percent + "%";
    progress_info.innerHTML = '';
    switch (Number(sta)){
      case 0:
        progress_info.innerHTML = 'Completar datos';
        progress_info.href = '/perfil/register'
      break;
      case 1:
        progress_info.innerHTML = 'Realizar pago';
        progress_info.href = '#'
        progress_info.onclick = exec_pay;
      break;
      case 2:
        progress_info.innerHTML = 'Terminado';
        progress_info.href = '/home'
      break;
    }
    console.log(progress)
  }
}


function exec_pay(){
  Swal.fire({
    icon: 'info',
    title: 'Realice su pago',
    text: 'Una vez realizado el pago le notificaremos por correo en u lapso de 24 horas la activacion de su cuenta...',
    showConfirmButton: true,
  }).then(()=>{
    window.location = '/perfil/pay'
  })
}
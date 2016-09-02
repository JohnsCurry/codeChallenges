$(document).ready(function(){
  alert("hi from default.js");
  var html = $(".html-textarea")[0];
  var htmlEditor = CodeMirror.fromTextArea(html, {
    lineNumbers : true,
    mode: "javascript"
  });

  var js = $(".js-textarea")[0];
  var jsEditor = CodeMirror.fromTextArea(js, {
    lineNumbers : true,
    mode: "javascript"
  });

  //when form submitted
  $("#preview-form-submit").click(function(e){
    e.preventDefault();
    htmlValue = htmlEditor.getValue();
    jsValue   = jsEditor.getValue();

    console.log("preview-form-submit btn clicked");
    console.log(htmlValue);
    console.log(jsValue);

    $.post( 'formHandler.php', {
      htmlCode: htmlValue,
      jsCode:   jsValue
    },
    function( data ) {
      console.log("logged from callback" + data);
      document.getElementById('iframe-wrapper').innerHTML = '<iframe src="editorWindow.php"></iframe>';
    });  
  });
  

});


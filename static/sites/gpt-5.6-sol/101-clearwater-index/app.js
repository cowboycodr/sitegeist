document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function () {
    var target = document.querySelector(link.getAttribute('href'));
    if (target) window.setTimeout(function () { target.setAttribute('tabindex', '-1'); target.focus({preventScroll:true}); }, 500);
  });
});

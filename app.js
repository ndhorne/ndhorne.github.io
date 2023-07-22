const topLink = document.querySelector('.top-link');
const scrollLinks = document.querySelectorAll('.scroll-link');

window.addEventListener('scroll', function () {
  const scrollHeight = window.pageYOffset;
  
  if (scrollHeight > 275) {
    topLink.classList.add('show-link');
  } else {
    topLink.classList.remove('show-link');
  }
});

scrollLinks.forEach(function (link) {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    
    const id = e.currentTarget.getAttribute('href').slice(1);
    let top;
    
    if (id === 'top') {
      top = 0;
    }
    
    window.scrollTo({
      top,
      left: 0
    });
  });
});

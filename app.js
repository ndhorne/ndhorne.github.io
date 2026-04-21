/*
Copyright 2023, 2026 Nicholas D. Horne

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
"use strict";

const topLink = document.querySelector('.top-link');
const scrollLinks = document.querySelectorAll('.scroll-link');

window.addEventListener('scroll', function (e) {
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
    let top = window.pageYOffset, left = window.pageXOffset;
    
    if (id === 'top') {
      top = 0;
    }
    
    window.scrollTo({
      top,
      left
    });
  });
});

const button  = document.querySelector('#sidebar-toggle');
const wrapper = document.querySelector('#wrapper');

// sidebar toggle
button.addEventListener('click', (e) => {
  e.preventDefault();
  wrapper.classList.toggle('toggled');
});
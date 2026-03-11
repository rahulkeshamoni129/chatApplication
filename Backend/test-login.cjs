import axios from 'axios';
axios.post('http://localhost:3000/api/users/login', {
    email: 'rahul@gmail.com',
    password: '<password here>'
}).then(console.log).catch(err => console.error(err.response?.data || err.message));

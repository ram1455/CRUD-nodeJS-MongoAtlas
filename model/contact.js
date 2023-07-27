const mongoose = require('mongoose');

// Membuat Schema
const Contact = mongoose.model('mahasiswa', {
    nama: {
        type: String,
        required: true,
    },
    nohp : {
        type: String,
        required: true
    },
    email: {
        type: String
    }
});

module.exports = {Contact};
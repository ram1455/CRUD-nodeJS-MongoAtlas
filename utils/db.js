const mongoose = require('mongoose');
mongoose.connect(`mongodb+srv://ramezuku:jojiwannabe@cluster0.enpfgti.mongodb.net/`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    dbName:'wpuAtlas',
});



// Menambah satu data
// const contact1 = new Contact({
//     nama: 'Doddy Ferdiansyah',
//     nohp: '08953235123465',
//     email: 'sandhikagalih@gmail.com'
// });

// contact1.save().then((contact) => console.log(contact))


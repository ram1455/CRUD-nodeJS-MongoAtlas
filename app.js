const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const {body, validationResult, check} = require('express-validator');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const app = express()
const port = 3000;

require('./utils/db');

const {Contact} = require('./model/contact');

// Middleware
// Menggunakan view engine ejs 
app.set('view engine', 'ejs');
// menggunakan express layouts untuk main layout
app.use(expressLayouts);
// untuk mengizinkan user mengakses folder public(biasanya untuk image dan css)
app.use(express.static('./public'));
// untuk mengizinkan req.body diakses
app.use(express.urlencoded({extended: true}));

// konfigurasi flash
app.use(cookieParser('secret'));
app.use(session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))
app.use(flash());

// Halaman Home
app.get('/', (req, res) => {
    res.render('index', { layout: 'layouts/main-layout', active : {home: 'active', contact: ''}})
});

// Halaman About
app.get('/about', (req, res) => {
    res.render('about', { layout: 'layouts/main-layout'})
});

// Halaman Contact
app.get('/contact', async (req, res) => {
    const contacts = await Contact.find();

    // res.send(contact);
    res.render('contact', { layout : 'layouts/main-layout', contacts, msg: req.flash('msg') , active : {home: '', contact: 'active'}});
});

// Halaman Tambah
app.get('/contact/add', (req,res) => {
    res.render('add-contact', {layout: 'layouts/main-layout', msg : req.flash('msg')})
})

// Halaman Detail
app.get('/contact/:nama', async (req, res) => {
    const contact = await Contact.findOne({nama: req.params.nama});
    // res.send(contact)
    res.render('detail', {layout: 'layouts/main-layout', contact, msg : req.flash('msg')})
});

// Halaman proses data Tambah kontak
app.post('/contact',
    body('nama').custom( async (nama) => {
        const duplicate = await Contact.findOne({nama});
        if (duplicate) {
            throw new Error('Nama sudah ada')   
        } else if (nama = '') {
            throw new Error('Nama tidak boleh kosong')
        }
        return true
    }),
    check('nohp', 'Nomor Handphone tidak Valid').isMobilePhone('id-ID'),
    check('email', "Email tidak Valid").isEmail(),
    
    (req,res) => {
        const errors = validationResult(req).array();
        if (errors.length > 0) {
            res.render('add-contact', {layout: 'layouts/main-layout', errors})
            return false
        }
        Contact.insertMany(req.body);
        res.redirect('/contact')
})

app.get('/contact/edit/:nama', async (req,res) => {
    const contact = await Contact.findOne({nama: req.params.nama});
    if (!contact) {
        res.render('detail', {layout: 'layouts/main-layout', contact})
        return false
    }
    res.render('edit-contact', {layout: 'layouts/main-layout', contact})
})

app.post('/contact/update', 
    check('nohp', 'Nomor Handphone tidak Valid').isMobilePhone('id-ID'),
    check('email', "Email tidak Valid").isEmail(),
    body('nama').custom( async (nama, {req}) => {
        const duplicate = await Contact.findOne({nama});
        if (duplicate && req.body.oldNama !== duplicate.nama ) {
            console.log('ada duplikat');   
            throw new Error('Nama sudah ada')
        } else if (nama = '') {
            throw new Error('Nama tidak boleh kosong')
        }
        return true
    }),
    
    async (req,res) => {
        const errors = validationResult(req).array();
        if (errors.length > 0) {
            res.render('edit-contact', {layout: 'layouts/main-layout', contact : req.body, errors : errors})
            return false
        }
        const {nama, nohp, email, oldNama} = req.body;
        console.log(req.body);
        const contact = await Contact.findOne({nama : oldNama})
        console.log(contact);
        Contact.updateOne({nama: oldNama}, {
            $set: {
                    nama: nama,
                    nohp: nohp, 
                    email: email
                }
        }).then( result => {
            console.log(result);
            req.flash('msg', 'data berhasil diubah')
            res.redirect('/contact')
        })
    })

app.get('/contact/delete/:nama', async (req,res) => {
    const contact = await Contact.findOne({nama : req.params.nama})
    if (contact) {
     await Contact.deleteOne({nama: contact.nama})   
     res.redirect('/contact')
     return false
    }
    res.send(req.params.nama)
})

app.listen(port, () => {
    console.log(`Mongo Contact App Listening at http://localhost:${port}`);
})
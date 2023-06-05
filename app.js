const express = require('express');
const path = require('path');
const crypto = require('crypto');
const mongoose =  require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');


const app = express();

//Middleware
app.use(methodOverride('_method'));
app.set('view engine','ejs');

//Mongo URI
const mongoURI = 'mongodb://127.0.0.1:27017'

//create mongo connection
const conn = mongoose.createConnection(mongoURI);

//Init gfs
let gfs, gridfsBucket;
conn.once('open', () => {
    //Init Stream
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
    gfs = Grid(conn.db,mongoose.mongo);
    gfs.collection('uploads');
});

//Create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req,file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16,(err,buf)=> {
                if(err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });  
    }
});
const upload = multer({ storage });

//@route GET / 
//@desc Loads form
app.get('/',async(req,res) =>{
    
    try {
    
        const allfiles = await gfs.files.find().toArray();
    
        if (!allfiles || allfiles.length === 0) {
          res.render('index',{ files:false });
        } else {
            allfiles.map(file => {
                if(file.contentType === 'image/jpeg' || file.contentType === 'image/png')
                {
                    file.isImage = true;
                } else {
                    file.isImage = false;
                }
            });
            res.render('index',{files:allfiles});
        }
    
        // Files exist
        
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred' });
      }

});

//@route POST /upload
//@desc Uploads file to the database
app.post('/upload',upload.single('file'),(req,res)=>{
    res.redirect('/');
});

//@route get /files
//@desc Display all files in JSON
app.get('/files',async(req,res) =>{
    try {
        gfs = Grid(conn.db, mongoose.mongo);
        gfs.collection('uploads');
        
        console.log('Inside /files route handler');
    
        const allfiles = await gfs.files.find().toArray();
    
        if (!allfiles || allfiles.length === 0) {
          return res.status(404).json({
            err: 'No files exist'
          });
        }
    
        // Files exist
        console.log('Files retrieved successfully');
        console.log(allfiles);
        return res.json({ allfiles });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred' });
      }
    });

//@route get /files/:filename
//@desc Display single files in JSON
app.get('/files/:filename',async(req,res) =>{
    try {
        gfs = Grid(conn.db, mongoose.mongo);
        gfs.collection('uploads');
        
        console.log('Inside /files route handler');
    
        const file = await gfs.files.findOne({filename: req.params.filename});
    
        if (!file || file.length === 0) {
          return res.status(404).json({
            err: 'No files exist'
          });
        }
    
        // Files exist
        console.log('Files retrieved successfully');
        console.log(file);
        return res.json({ file });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred' });
      }
    });

//@route get /image/:filename
//@desc Display single image in JSON
app.get('/image/:filename',async(req,res) =>{
    try {
        gfs = Grid(conn.db, mongoose.mongo);
        gfs.collection('uploads');
    
        const file = await gfs.files.findOne({filename: req.params.filename});
    
        if (!file || file.length === 0) {
          return res.status(404).json({
            err: 'No files exist'
          });
        }
        //Check if image
        if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
            //Read output to browser
            const readstream = gridfsBucket.openDownloadStreamByName(file.filename);
            readstream.pipe(res);
        }else{
            res.status(404).json({
                err:`Not an Image`
            })
        }
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred' });
      }
    });

//@route DELTE /files/:id
//@desc Delete file
app.delete('/files/:filename', async (req, res, next) => {
    const file = await gfs.files.findOne({ filename: req.params.filename });
    gridfsBucket.delete(file._id,  function (err, gridStore) {
        if (err) return next(err);
        res.status(200).end();
    });
    res.redirect('/');
});

const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
require('dotenv').config();

const app = express();
const salt = bcrypt.genSaltSync(10);
const secret = process.env.JWT_SECRET; // Use environment variable for secret
const bucket = 'erick-blog';

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());
// app.use('/uploads', express.static(__dirname + '/uploads'));



async function uploadToS3(path, originalFilename, mimetype) {
    const client = new S3Client({
        region: 'us-east-2',
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
    });

    const parts = originalFilename.split('.');
    const ext = parts[parts.length - 1];
    const newFilename = Date.now() + '.' + ext;

    const data = await client.send(new PutObjectCommand({
        Bucket: bucket,
        Body: fs.readFileSync(path),
        Key: newFilename,
        ContentType: mimetype,
        ACL: 'public-read',
    }));

    return `https://${bucket}.s3.amazonaws.com/${newFilename}`;
}

app.post('/register', async (req, res) => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const { username, password } = req.body;
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt),
        });
        res.json(userDoc);
    } catch (e) {
        console.log(e);
        res.status(400).json(e);
    }
});

app.post('/login', async (req, res) => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const { username, password } = req.body;
    try {
        const userDoc = await User.findOne({ username });
        if (!userDoc) {
            return res.status(400).json({ message: 'User not found' });
        }
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (!passOk) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token).json({
                id: userDoc._id,
                username,
            });
        });
    } catch (e) {
        console.log(e);
        res.status(400).json(e);
    }
});

app.get('/profile', (req, res) => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, (err, info) => {
        if (err) throw err;
        res.json(info);
    });
});

app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok');
});

const uploadMiddleware = multer({ dest: '/tmp' });

app.post('/post', uploadMiddleware.single("file"), async (req, res) => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    if (!req.file) {
        return res.status(400).json({ message: 'File upload failed' });
    }

    const { originalname, path, mimetype } = req.file;
    const url = await uploadToS3(path, originalname, mimetype);

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err;

        const { title, summary, content } = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover: url,
            author: info.id,
        });

        res.json(postDoc);
    });
});

app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    let url = null;
    
    // Upload new file to S3 if a new file is provided
    if (req.file) {
        const { originalname, path, mimetype } = req.file;
        url = await uploadToS3(path, originalname, mimetype);
    }

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err;
        const { id, title, summary, content } = req.body;
        const postDoc = await Post.findById(id);
        
        // Verify if the user is the author
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if (!isAuthor) {
            return res.status(400).json('you are not the author');
        }

        // Update post fields
        postDoc.title = title;
        postDoc.summary = summary;
        postDoc.content = content;
        
        // Only update the cover if a new image was uploaded
        if (url) {
            postDoc.cover = url;
        }

        await postDoc.save();
        
        res.json(postDoc);
    });
});

app.get('/post', async (req, res) => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    try {
        const posts = await Post.find()
            .populate('author', ['username'])
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.get('/post/:id', async (req, res) => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    try {
        const { id } = req.params;
        const postDoc = await Post.findById(id).populate('author', ['username']);
        if (!postDoc) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(postDoc);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});

app.use('/', (req, res) => {
    res.send('Server is running');
});

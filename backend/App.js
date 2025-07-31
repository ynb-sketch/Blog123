require('dotenv').config();

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const { IncomingForm } = require('formidable');
const { fileTypeFromFile } = require('file-type');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const routes = require('./routes');
const Post = require('./models/Post');

const port = 3001;
const app = express();

app.use(express.static(path.resolve('..', 'frontend', 'build')));

app.use(cookieParser());
app.use(express.json());
// Настройка body-parser
app.use(bodyParser.urlencoded({ extended: true }));

// Отображение формы создания поста
app.get('/create', (req, res) => {
	res.sendFile(path.join(__dirname, 'create.html'));
});

app.post('/create', (req, res) => {
	const form = new IncomingForm({ uploadDir: 'uploads', keepExtensions: true });

	form.parse(req, async (err, fields, files) => {
		if (err) {
			return res.status(400).send(err);
		}

		// Проверка типа файла
		const filePath = files.imageFile.path;
		const fileType = await fileTypeFromFile(filePath);

		if (!fileType || !fileType.mime.startsWith('image/')) {
			return res.status(400).send('Uploaded file is not an image');
		}

		const newPost = new Post({
			title: fields.title,
			content: fields.content,
			imagePath: filePath,
		});

		newPost.save((err) => {
			if (!err) {
				res.send('Post added successfully!');
			} else {
				res.send(err);
			}
		});
	});
});
app.use('/api', routes);
app.use('/posts', routes);
app.use('/users', routes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get(/(.*)/, (req, res) => {
	res.sendFile(path.resolve('..', 'frontend', 'build', 'index.html'));
});

mongoose.connect(process.env.DB_CONNECTION_STRING).then(() => {
	app.listen(port, () => {
		console.log(`Server started on port ${port}`);
	});
});

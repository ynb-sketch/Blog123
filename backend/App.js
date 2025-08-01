// const express = require('express');
// const mongoose = require('mongoose');
// const cookieParser = require('cookie-parser');
// const {
// 	register,
// 	login,
// 	getUsers,
// 	getRoles,
// 	updateUser,
// 	deleteUser,
// } = require('./controllers/user');
// const {
// 	addPost,
// 	editPost,
// 	deletePost,
// 	getPosts,
// 	getPost,
// } = require('./controllers/post');
// const mapUser = require('./helpers/mapUser');
// const authenticated = require('./middlewares/authenticated');
// const hasRole = require('./middlewares/hasRole');
// const ROLES = require('./constans/roles');
// const mapPost = require('./helpers/mapPost');
// const { addComment, deleteComment } = require('./controllers/comment');
// const mapComment = require('./helpers/mapComment');

// const port = 3001;

// const app = express();

// app.use(express.static('../frontend/build'));

// app.use(cookieParser());
// app.use(express.json());

// app.post('/register', async (req, res) => {
// 	try {
// 		const { user, token } = await register(req.body.login, req.body.password);
// 		res.cookie('token', token, { httpOnly: true }).send({
// 			error: null,
// 			user: mapUser(user),
// 		});
// 	} catch (e) {
// 		res.send({ error: e.message || 'Unknown error' });
// 	}
// });

// app.post('/login', async (req, res) => {
// 	try {
// 		const { user, token } = await login(req.body.login, req.body.password);
// 		res.cookie('token', token, { httpOnly: true }).send({
// 			error: null,
// 			user: mapUser(user),
// 		});
// 	} catch (e) {
// 		res.send({ error: e.message || 'Unknown error' });
// 	}
// });

// app.post('/logout', async (req, res) => {
// 	res.cookie('token', '', { httpOnly: true }).send({});
// });

// app.get('/posts', async (req, res) => {
// 	const { posts, lastPage } = await getPosts(
// 		req.query.search,
// 		req.query.limit,
// 		req.query.page,
// 	);
// 	res.send({ data: { lastPage, posts: posts.map(mapPost) } });
// });

// app.get('/posts/:id', async (req, res) => {
// 	const post = await getPost(req.params.id);
// 	res.send({ data: mapPost(post) });
// });

// app.use(authenticated);

// app.post('/posts/:id/comments', async (req, res) => {
// 	const newComment = await addComment(req.params.id, {
// 		content: req.body.content,
// 		author: req.user.id,
// 	});
// 	res.send({ data: mapComment(newComment) });
// });

// app.delete(
// 	'/posts/:postId/comments/:commentId',
// 	hasRole([ROLES.ADMIN, ROLES.MODERATOR]),
// 	async (req, res) => {
// 		await deleteComment(req.params.postId, req.params.commentId);
// 		res.send({ error: null });
// 	},
// );

// app.post('/posts', hasRole([ROLES.ADMIN]), async (req, res) => {
// 	const newPost = await addPost({
// 		title: req.body.title,
// 		content: req.body.content,
// 		image: req.body.imageUrl,
// 	});
// 	res.send({ data: mapPost(newPost) });
// });

// app.patch('/posts/:id', hasRole([ROLES.ADMIN]), async (req, res) => {
// 	const updatedPost = await editPost(req.params.id, {
// 		title: req.body.title,
// 		content: req.body.content,
// 		image: req.body.imageUrl,
// 	});
// 	res.send({ data: mapPost(updatedPost) });
// });

// app.delete('/posts/:id', hasRole([ROLES.ADMIN]), async (req, res) => {
// 	await deletePost(req.params.id);

// 	res.send({ error: null });
// });

// app.get('/users', hasRole([ROLES.ADMIN]), async (req, res) => {
// 	const users = await getUsers();
// 	res.send({ data: users.map(mapUser) });
// });

// app.get('/users/roles', hasRole([ROLES.ADMIN]), async (req, res) => {
// 	const roles = getRoles();
// 	res.send({ data: roles });
// });

// app.patch('/users/:id', hasRole([ROLES.ADMIN]), async (req, res) => {
// 	const newUser = updateUser(req.params.id, {
// 		role: req.body.roleId,
// 	});
// 	res.send({ data: mapUser(newUser) });
// });

// app.delete('/users/:id', hasRole([ROLES.ADMIN]), async (req, res) => {
// 	await deleteUser(req.params.id);
// 	res.send({ error: null });
// });

// mongoose
// 	.connect(
// 		'mongodb+srv://Elena:e11a29n05v26@cluster0.rzuuqwv.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0',
// 	)
// 	.then(() => {
// 		app.listen(port, () => {
// 			console.log(`Server started on port ${port}`);
// 		});
// 	});
/////////////////////////////////////////////////////////////////////////

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
